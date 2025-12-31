/**
 * @file server.js
 * @description Servidor principal de la aplicación AgoraDig. Gestiona las conexiones,
 * autenticación de usuarios, registro, perfiles, y el API del foro. Utiliza Express.js
 * para el enrutamiento y Mongoose para la interacción con la base de datos MongoDB.
 * @author CPV05
 */

// =================================================================
//  IMPORTS
// =================================================================

const path = require('path');
const fs = require('fs');
const crypto =require('crypto');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');


// =================================================================
//  CLOUDINARY CONFIG
// =================================================================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});


// =================================================================
//  FUNCIONES DE AYUDA (HELPERS)
// =================================================================

/**
 * @constant {string} DEFAULT_AVATAR_PATH - Ruta a la imagen de perfil por defecto.
 * @description Se usa como fallback cuando un usuario no tiene imagen de perfil.
 */
const DEFAULT_AVATAR_PATH = '/images/user_img/default-avatar.webp';

/**
 * @function getProfilePictureUrl
 * @description Genera una URL segura para la imagen de perfil de un usuario.
 * Si el usuario tiene una imagen en Cloudinary, genera una URL firmada de acceso privado.
 * Para invalidar la caché de la CDN de Cloudinary, se añade un componente de versión
 * basado en el timestamp actual. Esto asegura que siempre se sirva la imagen más reciente.
 * @param {string} publicId - El public_id de la imagen en Cloudinary.
 * @returns {string} Una URL válida y segura para ser servida al cliente.
 */
function getProfilePictureUrl(publicId) {
    if (!publicId) {
        return DEFAULT_AVATAR_PATH;
    }
    
    // Se añade `version` con el timestamp actual para invalidar la caché de la CDN.
    // Esto fuerza a Cloudinary a servir la imagen más reciente en lugar de una versión
    // cacheada, que es el problema raíz cuando se sobrescriben imágenes.
    return cloudinary.url(publicId, {
        type: 'private',
        sign_url: true,
        secure: true,
        version: Math.floor(new Date().getTime() / 1000) // Se usa timestamp de Unix en segundos.
    });
}


// =================================================================
//  INITIALIZATION AND CONFIG
// =================================================================
const app = express();
const PORT = process.env.PORT || 5000;

// Medida de seguridad crítica: la aplicación no debe iniciar sin los secretos requeridos.
if (!process.env.SESSION_SECRET || !process.env.TURNSTILE_SECRET_KEY || !process.env.MONGODB_URI_USERS || !process.env.MONGODB_URI_MESSAGES || !process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('FATAL ERROR: Una o más variables de entorno críticas (SESSION_SECRET, TURNSTILE_SECRET_KEY, MONGODB_URI_*, CLOUDINARY_*) no están definidas.');
    process.exit(1); // Termina el proceso si la configuración esencial falta.
}

// Confía en el primer proxy. Necesario si la app corre detrás de un reverse proxy (ej. Nginx, Heroku).
app.set('trust proxy', 1);


// =================================================================
//  BD CONNECTIONS
// =================================================================

// Deshabilitar la opción strictQuery globalmente para Mongoose
mongoose.set('strictQuery', false);

// Crear dos conexiones de base de datos separadas
const usersDbConnection = mongoose.createConnection(process.env.MONGODB_URI_USERS);
const messagesDbConnection = mongoose.createConnection(process.env.MONGODB_URI_MESSAGES);

// Manejadores de eventos para las conexiones
usersDbConnection.on('connected', () => console.log('✅ Conexión a MongoDB (Users & Sessions) realizada'));
usersDbConnection.on('error', err => console.error('❌ Error de conexión a MongoDB (Users & Sessions):', err));

messagesDbConnection.on('connected', () => console.log('✅ Conexión a MongoDB (Messages) realizada'));
messagesDbConnection.on('error', err => console.error('❌ Error de conexión a MongoDB (Messages):', err));

// Crear una promesa que resuelva con el cliente nativo para la tienda de sesiones
const usersDbClientPromise = usersDbConnection.asPromise().then(connection => connection.getClient());


// =================================================================
//  MIDDLEWARE
// =================================================================

// Aplica cabeceras de seguridad HTTP, incluyendo una CSP personalizada para Cloudflare Turnstile.
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "https://challenges.cloudflare.com"],
            "frame-src": ["'self'", "https://challenges.cloudflare.com"],
            "img-src": ["'self'", "res.cloudinary.com"], // Permite imágenes desde nuestro dominio de Cloudinary
        },
    })
);

// Parsea cuerpos de petición con formato JSON.
app.use(express.json());

// Configuración de la sesión de usuario, almacenada en MongoDB para persistencia.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // No crear sesiones hasta que algo se almacene.
    store: MongoStore.create({ clientPromise: usersDbClientPromise }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14, // Duración de la cookie: 14 días.
        secure: process.env.NODE_ENV === 'production', // Usar cookies seguras solo en producción (HTTPS).
        httpOnly: true, // Previene acceso a la cookie desde JavaScript en el cliente.
        sameSite: 'lax' // Protección CSRF básica.
    }
}));

// Sirve los archivos estáticos del frontend (HTML, CSS, JS del cliente).
app.use(express.static(path.join(__dirname, 'public')));

/**
 * @function verifyTurnstile
 * @description Middleware para verificar un token de Cloudflare Turnstile.
 * Realiza una petición server-to-server a la API de Cloudflare para validar la respuesta del usuario.
 * @param {import('express').Request} req - Objeto de la petición de Express.
 * @param {import('express').Response} res - Objeto de la respuesta de Express.
 * @param {import('express').NextFunction} next - Función callback para pasar al siguiente middleware.
 */
const verifyTurnstile = async (req, res, next) => {
    try {
        const token = req.body['cf-turnstile-response'];
        if (!token) {
            return res.status(400).json({ message: 'Por favor, completa la verificación anti-bot.' });
        }

        const secretKey = process.env.TURNSTILE_SECRET_KEY;
        
        const formData = new FormData();
        formData.append('secret', secretKey);
        formData.append('response', token);
        formData.append('remoteip', req.ip);

        const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData);

        const outcome = response.data;

        if (outcome.success) {
            next();
        } else {
            console.error('Fallo en la verificación de Turnstile. Razón: API de Cloudflare denegó la validación.');
            return res.status(401).json({ message: 'Fallo en la verificación anti-bot. Inténtalo de nuevo.' });
        }
    } catch (error) {
        console.error('Error en el middleware verifyTurnstile:', error);
        return res.status(500).json({ message: 'Error del servidor al validar el desafío anti-bot.' });
    }
};


/**
 * @function isModeratorOrAdmin
 * @description Middleware de autorización para verificar si un usuario autenticado tiene el rol de 'moderator' o 'admin'.
 * Rechaza la petición si el usuario no tiene los privilegios adecuados.
 * @param {import('express').Request} req - Objeto de la petición de Express.
 * @param {import('express').Response} res - Objeto de la respuesta de Express.
 * @param {import('express').NextFunction} next - Función callback para pasar al siguiente middleware.
 */
const isModeratorOrAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId).select('role');
        if (user && (user.role === 'admin' || user.role === 'moderator')) {
            req.userRole = user.role; // Adjunta el rol a la petición para uso posterior.
            next();
        } else {
            res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de moderación.' });
        }
    } catch (error) {
        console.error('Error en middleware isModeratorOrAdmin:', error);
        res.status(500).json({ message: 'Error del servidor al verificar los permisos.' });
    }
};

/**
 * @function isAdmin
 * @description Middleware de autorización para verificar si un usuario autenticado tiene el rol de 'admin'.
 * @param {import('express').Request} req - Objeto de la petición de Express.
 * @param {import('express').Response} res - Objeto de la respuesta de Express.
 * @param {import('express').NextFunction} next - Función callback para pasar al siguiente middleware.
 */
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId).select('role');
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
        }
    } catch (error) {
        console.error('Error en middleware isAdmin:', error);
        res.status(500).json({ message: 'Error del servidor al verificar los permisos.' });
    }
};


// --- CONFIGURACIÓN DE LIMITADORES DE PETICIONES (RATE LIMITING) ---

/**
 * @constant apiLimiter
 * @description Limitador para peticiones de lectura a la API (GET).
 * Es más permisivo para permitir una navegación fluida y la carga de datos.
 * Limita a 300 peticiones por IP cada 5 minutos.
 */
const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 300,
    message: 'Demasiadas peticiones de datos enviadas. Por favor, espera unos minutos.',
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * @constant actionLimiter
 * @description Limitador para peticiones de acción (POST, PATCH, DELETE) que modifican datos.
 * Permite un uso activo pero previene abusos por scripts.
 * Limita a 100 peticiones por IP cada 5 minutos.
 */
const actionLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100,
    message: 'Has realizado demasiadas acciones seguidas. Por favor, espera unos minutos.',
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * @constant sensitiveRouteLimiter
 * @description Limitador de peticiones muy estricto para rutas sensibles (login, registro).
 * Limita a 10 peticiones por IP cada 5 minutos para prevenir ataques de fuerza bruta.
 */
const sensitiveRouteLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiadas peticiones a esta ruta, por favor intente de nuevo más tarde.'
});


/**
 * @function isAuthenticated
 * @description Middleware de autenticación para verificar si un usuario tiene una sesión activa.
 * Comprueba la existencia de `req.session.userId`. Si no existe, rechaza la
 * petición con un estado 401 (No Autorizado).
 * @param {import('express').Request} req - Objeto de la petición de Express.
 * @param {import('express').Response} res - Objeto de la respuesta de Express.
 * @param {import('express').NextFunction} next - Función callback para pasar al siguiente middleware.
 */
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Acceso no autorizado. Por favor, inicie sesión.' });
    }
    next();
};


// =================================================================
//  MODELS AND SCHEMAS
// =================================================================

/**
 * @description Esquema de Mongoose para el modelo de Usuario.
 * Define la estructura, tipos de datos y validaciones para los documentos de usuario.
 * @property {string} password - No se devuelve en las consultas por defecto (`select: false`).
 * @property {string} recoveryPIN - PIN de recuperación hasheado, no se devuelve por defecto.
 * @property {object} timestamps - Añade automáticamente los campos `createdAt` y `updatedAt`.
 */
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    recoveryPIN: { type: String, required: true, select: false, unique: true },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    profilePicturePublicId: { type: String },
    acceptsPublicity: { type: Boolean, default: false, index: true },
    role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user', index: true },
    userStatus: { type: String, enum: ['active', 'verified', 'banned', 'deleted'], default: 'active', index: true },
    strikes: { type: Number, default: 0 }
}, {
    timestamps: true,
});

const User = usersDbConnection.model('User', userSchema);

/**
 * @description Esquema para rastrear intentos de inicio de sesión fallidos por IP e identificador.
 * Utiliza un índice TTL para limpiar automáticamente los registros antiguos después de 24 horas.
 */
const loginAttemptSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    loginIdentifier: { type: String, required: true, lowercase: true },
    attempts: { type: Number, required: true, default: 0 },
    lockoutUntil: { type: Date },
    createdAt: { type: Date, default: Date.now, expires: '16h' } // TTL: El documento se elimina 16h después de su creación.
});
// Índice compuesto para optimizar la búsqueda de intentos de login.
loginAttemptSchema.index({ ip: 1, loginIdentifier: 1 });
const LoginAttempt = usersDbConnection.model('LoginAttempt', loginAttemptSchema);


/**
 * @constant upload
 * @description Configuración de Multer para la gestión de subida de archivos.
 * Almacena los archivos en memoria para su posterior procesamiento y subida a Cloudinary.
 * Limita el tamaño a 4MB.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024 // 4 Megabytes
  }
});

/**
 * @description Esquema de Mongoose para el modelo de Mensaje.
 * Define la estructura y validaciones para los mensajes del foro.
 * @property {object} timestamps - Añade automáticamente `createdAt` y `updatedAt`.
 * @property {object} toJSON - Configura la serialización a JSON para incluir campos virtuales.
 * @property {object} toObject - Configura la conversión a objeto para incluir campos virtuales.
 */
const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referencedMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    content: { type: String, required: true, trim: true , maxlength: 1500},
    hashtags: [{ type: String, trim: true, lowercase: true, index: true }],
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    replies: { type: [mongoose.Schema.Types.ObjectId], ref: 'Message', default: [] },
    messageStatus: { type: String, enum: ['active', 'deleted', 'deletedByModerator', 'deletedByAdmin'], default: 'active', index: true },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reportedBy: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    reportStatus: { type: String, enum: ['pendiente', 'revisado'], default: 'pendiente', index: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// Índice compuesto para optimizar las consultas de mensajes activos ordenados por fecha.
messageSchema.index({ messageStatus: 1, createdAt: -1 });

// Índice de texto para habilitar la búsqueda de texto completo en título, contenido y hashtags.
messageSchema.index({ title: 'text', content: 'text', hashtags: 'text' });

/**
 * @virtual likeCount
 * @description Campo virtual que calcula el número de 'likes' de un mensaje dinámicamente.
 * No se almacena en la base de datos, se calcula al consultar el documento.
 * @returns {number} El número total de 'likes'.
 */
messageSchema.virtual('likeCount').get(function() { return this.likes.length; });

/**
 * @virtual replyCount
 * @description Campo virtual que calcula el número de respuestas de un mensaje dinámicamente.
 * @returns {number} El número total de respuestas.
 */
messageSchema.virtual('replyCount').get(function() { return this.replies.length; });

const Message = messagesDbConnection.model('Message', messageSchema);

/**
 * @description Esquema para las palabras del juego El Impostor.
 * Almacenado en la BD de mensajes para separación de intereses.
 */
const gameWordSchema = new mongoose.Schema({
    gameType: { 
        type: String, 
        required: true, 
        enum: ['impostor', 'wordle'],
        index: true 
    },
    category: { type: String, required: true, enum: ['Acciones', 'Animales', 'Comida', 'Lugar', 'Objetos'], index: true },
    word: { type: String, required: true },
    impostorHint: { type: String } // Opcional para otros juegos
});

// Índice compuesto para búsquedas rápidas por tipo y categoría
gameWordSchema.index({ gameType: 1, category: 1 });

const GameWord = messagesDbConnection.model('GameWord', gameWordSchema);

// --- SEEDER INICIAL (Opcional: Ejecutar una vez si la BD está vacía) ---
const seedGameWords = async () => {
    const count = await GameWord.countDocuments();
    if (count === 0) {
        const initialWords = [
                // --- ACCIONES ---
                // Grupo 1: Movimiento corporal similar pero contexto distinto
                { gameType: 'impostor', category: 'Acciones', word: 'Aplaudir', impostorHint: 'Matar un mosquito' }, // Gesto de chocar palmas
                { gameType: 'impostor', category: 'Acciones', word: 'Bostezar', impostorHint: 'Rugir' },             // Abrir mucho la boca
                { gameType: 'impostor', category: 'Acciones', word: 'Saludar', impostorHint: 'Limpiar cristales' },  // Movimiento de mano de lado a lado
                { gameType: 'impostor', category: 'Acciones', word: 'Escribir', impostorHint: 'Tocar el piano' },    // Movimiento ágil de dedos
                { gameType: 'impostor', category: 'Acciones', word: 'Nadar', impostorHint: 'Volar' },                // Moverse en un fluido (agua/aire) sin tocar suelo
                { gameType: 'impostor', category: 'Acciones', word: 'Besar', impostorHint: 'Susurrar' },             // Acercarse mucho a la cara de otro
                { gameType: 'impostor', category: 'Acciones', word: 'Masticar', impostorHint: 'Hablar' },            // Movimiento de mandíbula
                { gameType: 'impostor', category: 'Acciones', word: 'Desfilar', impostorHint: 'Caminar' },           // Andar, pero con propósito exhibicionista
                { gameType: 'impostor', category: 'Acciones', word: 'Abrazar', impostorHint: 'Luchar' },             // Cuerpos entrelazados (cariño vs judo)
                { gameType: 'impostor', category: 'Acciones', word: 'Señalar', impostorHint: 'Disparar' },           // Apuntar con el dedo/arma
                { gameType: 'impostor', category: 'Acciones', word: 'Pescar', impostorHint: 'Esperar' },             // La actividad principal de pescar es esperar
                { gameType: 'impostor', category: 'Acciones', word: 'Cocinar', impostorHint: 'Mezclar' },            // Parte fundamental del proceso (química)
                { gameType: 'impostor', category: 'Acciones', word: 'Pintar', impostorHint: 'Ensuciar' },            // Si pintas mal, solo manchas
                { gameType: 'impostor', category: 'Acciones', word: 'Maquillarse', impostorHint: 'Mentir' },         // Ocultar la realidad / poner una máscara
                { gameType: 'impostor', category: 'Acciones', word: 'Soñar', impostorHint: 'Ver una película' },     // Ver historias sin moverte
                { gameType: 'impostor', category: 'Acciones', word: 'Leer', impostorHint: 'Viajar' },                // Transportarse a otro lugar (mentalmente)
                { gameType: 'impostor', category: 'Acciones', word: 'Estudiar', impostorHint: 'Sufrir' },            // Sensación asociada (broma común)
                { gameType: 'impostor', category: 'Acciones', word: 'Comprar', impostorHint: 'Elegir' },             // El acto previo al pago
                { gameType: 'impostor', category: 'Acciones', word: 'Trabajar', impostorHint: 'Cansarse' },          // Causa y efecto directo
                { gameType: 'impostor', category: 'Acciones', word: 'Regalar', impostorHint: 'Perder' },             // Te quedas sin el objeto (técnicamente)
                { gameType: 'impostor', category: 'Acciones', word: 'Barrer', impostorHint: 'Peinar' },              // Arrastrar cosas (pelo/polvo) para ordenarlas
                { gameType: 'impostor', category: 'Acciones', word: 'Planchar', impostorHint: 'Acariciar' },         // Deslizar la mano/objeto suavemente sobre superficie
                { gameType: 'impostor', category: 'Acciones', word: 'Coser', impostorHint: 'Operar' },               // Unir tejidos/piel con aguja
                { gameType: 'impostor', category: 'Acciones', word: 'Exprimir', impostorHint: 'Estrangular' },       // Aplicar presión fuerte con las manos
                { gameType: 'impostor', category: 'Acciones', word: 'Conducir', impostorHint: 'Jugar videojuegos' }, // Usar mandos/volante sentados mirando al frente
                { gameType: 'impostor', category: 'Acciones', word: 'Fumar', impostorHint: 'Respirar' },             // Inhalar y exhalar aire (con humo)
                { gameType: 'impostor', category: 'Acciones', word: 'Regar', impostorHint: 'Llorar' },               // Echar agua/líquido
                { gameType: 'impostor', category: 'Acciones', word: 'Afeitarse', impostorHint: 'Pelar' },            // Quitar la capa superficial
                { gameType: 'impostor', category: 'Acciones', word: 'Tejer', impostorHint: 'Programar' },            // Crear patrones complejos entrelazados (código/hilo)
                { gameType: 'impostor', category: 'Acciones', word: 'Amarrar', impostorHint: 'Abrochar' },           // Asegurar algo para que no se suelte
                { gameType: 'impostor', category: 'Acciones', word: 'Oler', impostorHint: 'Respirar' },              // No puedes oler sin respirar
                { gameType: 'impostor', category: 'Acciones', word: 'Espiar', impostorHint: 'Mirar' },               // Mirar, pero con secreto
                { gameType: 'impostor', category: 'Acciones', word: 'Saborear', impostorHint: 'Lamer' },             // Uso de la lengua
                { gameType: 'impostor', category: 'Acciones', word: 'Gritar', impostorHint: 'Cantar' },              // Emitir sonidos fuertes con la garganta
                { gameType: 'impostor', category: 'Acciones', word: 'Reír', impostorHint: 'Toser' },                 // Espasmos del pecho y ruido
                { gameType: 'impostor', category: 'Acciones', word: 'Vomitar', impostorHint: 'Escupir' },            // Expulsar cosas por la boca
                { gameType: 'impostor', category: 'Acciones', word: 'Sudar', impostorHint: 'Lloverse' },             // Mojarse (desde dentro vs desde fuera)
                { gameType: 'impostor', category: 'Acciones', word: 'Temblar', impostorHint: 'Bailar' },             // Movimiento corporal involuntario vs voluntario
                { gameType: 'impostor', category: 'Acciones', word: 'Tropezar', impostorHint: 'Bailar' },            // Movimiento raro de pies (chiste clásico de "no me caí, bailé")
                { gameType: 'impostor', category: 'Acciones', word: 'Esconderse', impostorHint: 'Desaparecer' },     // El objetivo final es no ser visto
                { gameType: 'impostor', category: 'Acciones', word: 'Correr', impostorHint: 'Escapar' },             // Acción rápida con un motivo urgente
                { gameType: 'impostor', category: 'Acciones', word: 'Saltar', impostorHint: 'Volar' },               // Despegarse del suelo momentáneamente
                { gameType: 'impostor', category: 'Acciones', word: 'Caer', impostorHint: 'Aterrizar' },             // Llegar al suelo (con o sin estilo)
                { gameType: 'impostor', category: 'Acciones', word: 'Gatear', impostorHint: 'Rastrear' },            // Moverse a ras de suelo
                { gameType: 'impostor', category: 'Acciones', word: 'Patinar', impostorHint: 'Resbalar' },           // Deslizarse sin control vs con control
                { gameType: 'impostor', category: 'Acciones', word: 'Escalar', impostorHint: 'Subir' },              // Movimiento vertical
                { gameType: 'impostor', category: 'Acciones', word: 'Cazar', impostorHint: 'Buscar' },               // Perseguir un objetivo
                { gameType: 'impostor', category: 'Acciones', word: 'Robar', impostorHint: 'Encontrar' },            // Adquirir algo (método ético vs no ético)
                { gameType: 'impostor', category: 'Acciones', word: 'Mentir', impostorHint: 'Actuar' },              // Crear una realidad falsa
                { gameType: 'impostor', category: 'Acciones', word: 'Escuchar', impostorHint: 'Obedecer' },          // Prestar atención a una orden
                { gameType: 'impostor', category: 'Acciones', word: 'Pensar', impostorHint: 'Calcular' },            // Proceso mental
                { gameType: 'impostor', category: 'Acciones', word: 'Olvidar', impostorHint: 'Perder' },             // Dejar de tener algo (un recuerdo)
                { gameType: 'impostor', category: 'Acciones', word: 'Recordar', impostorHint: 'Grabar' },            // Almacenar información
                { gameType: 'impostor', category: 'Acciones', word: 'Preguntar', impostorHint: 'Dudar' },            // Buscar respuestas a una incertidumbre
                { gameType: 'impostor', category: 'Acciones', word: 'Responder', impostorHint: 'Solucionar' },       // Dar el cierre a una duda
                { gameType: 'impostor', category: 'Acciones', word: 'Romper', impostorHint: 'Dividir' },             // Separar en partes (violentamente)
                { gameType: 'impostor', category: 'Acciones', word: 'Arreglar', impostorHint: 'Curar' },             // Restaurar el estado original
                { gameType: 'impostor', category: 'Acciones', word: 'Mezclar', impostorHint: 'Confundir' },          // Unir cosas hasta que no se distinguen
                { gameType: 'impostor', category: 'Acciones', word: 'Agitar', impostorHint: 'Saludar' },             // Movimiento rápido de vaivén
                { gameType: 'impostor', category: 'Acciones', word: 'Empujar', impostorHint: 'Ayudar' },             // Dar impulso (físico o metafórico)
                { gameType: 'impostor', category: 'Acciones', word: 'Tirar', impostorHint: 'Atraer' },               // Jalar hacia uno
                { gameType: 'impostor', category: 'Acciones', word: 'Levantar', impostorHint: 'Despertar' },         // Ponerse de pie / salir del sueño
                { gameType: 'impostor', category: 'Acciones', word: 'Soltar', impostorHint: 'Caer' },                // Dejar ir la gravedad
                { gameType: 'impostor', category: 'Acciones', word: 'Atrapar', impostorHint: 'Abrazar' },            // Rodear con los brazos
                { gameType: 'impostor', category: 'Acciones', word: 'Pelear', impostorHint: 'Discutir' },            // Conflicto (físico vs verbal)
                { gameType: 'impostor', category: 'Acciones', word: 'Ganar', impostorHint: 'Terminar' },             // Fin del juego con éxito
                { gameType: 'impostor', category: 'Acciones', word: 'Perder', impostorHint: 'Buscar' },              // Quedarse sin algo y querer recuperarlo
                { gameType: 'impostor', category: 'Acciones', word: 'Nacer', impostorHint: 'Empezar' },              // El inicio de todo
                { gameType: 'impostor', category: 'Acciones', word: 'Morir', impostorHint: 'Dormir' },               // Eufemismo clásico
                { gameType: 'impostor', category: 'Acciones', word: 'Crecer', impostorHint: 'Estirarse' },           // Aumentar de tamaño
                { gameType: 'impostor', category: 'Acciones', word: 'Envejecer', impostorHint: 'Madurar' },          // Paso del tiempo
                { gameType: 'impostor', category: 'Acciones', word: 'Enfermar', impostorHint: 'Descansar' },         // Consecuencia obligada
                { gameType: 'impostor', category: 'Acciones', word: 'Traducir', impostorHint: 'Explicar' },          // Cambiar de código para entender
                { gameType: 'impostor', category: 'Acciones', word: 'Dibujar', impostorHint: 'Escribir' },           // Trazar líneas con significado
                { gameType: 'impostor', category: 'Acciones', word: 'Borrar', impostorHint: 'Olvidar' },             // Eliminar el rastro
                { gameType: 'impostor', category: 'Acciones', word: 'Imprimir', impostorHint: 'Copiar' },            // Plasmar en papel
                { gameType: 'impostor', category: 'Acciones', word: 'Pegar', impostorHint: 'Golpear' },              // Adherir vs Agredir (polisemia)
                { gameType: 'impostor', category: 'Acciones', word: 'Cortar', impostorHint: 'Separar' },             // Dividir con filo
                { gameType: 'impostor', category: 'Acciones', word: 'Medir', impostorHint: 'Juzgar' },               // Evaluar el tamaño/valor
                { gameType: 'impostor', category: 'Acciones', word: 'Pesar', impostorHint: 'Dudar' },                // Evaluar la masa / indecisión
                { gameType: 'impostor', category: 'Acciones', word: 'Contar', impostorHint: 'Narrar' },              // Números vs Historias
                { gameType: 'impostor', category: 'Acciones', word: 'Callar', impostorHint: 'Esconder' },            // Ocultar información/voz
                { gameType: 'impostor', category: 'Acciones', word: 'Esperar', impostorHint: 'Aburrirse' },          // El sentimiento asociado a la espera
                { gameType: 'impostor', category: 'Acciones', word: 'Acelerar', impostorHint: 'Correr' },            // Ir más rápido
                { gameType: 'impostor', category: 'Acciones', word: 'Frenar', impostorHint: 'Parar' },               // Detener el movimiento
                { gameType: 'impostor', category: 'Acciones', word: 'Aparcar', impostorHint: 'Guardar' },            // Dejar el coche en su sitio
                { gameType: 'impostor', category: 'Acciones', word: 'Chocar', impostorHint: 'Tocar' },               // Contacto brusco
                { gameType: 'impostor', category: 'Acciones', word: 'Volar', impostorHint: 'Caer' },                 // Caer con estilo (Toy Story)
                { gameType: 'impostor', category: 'Acciones', word: 'Flotar', impostorHint: 'Nadar' },               // Mantenerse en superficie
                { gameType: 'impostor', category: 'Acciones', word: 'Bucear', impostorHint: 'Aguantar la respiración' }, // Requisito principal
                { gameType: 'impostor', category: 'Acciones', word: 'Firmar', impostorHint: 'Dibujar' },             // Hacer tu garabato personal
                { gameType: 'impostor', category: 'Acciones', word: 'Votar', impostorHint: 'Elegir' },               // Decisión democrática
                { gameType: 'impostor', category: 'Acciones', word: 'Rezar', impostorHint: 'Pedir' },                // Solicitar algo a una entidad superior
                { gameType: 'impostor', category: 'Acciones', word: 'Pecar', impostorHint: 'Disfrutar' },            // Visión hedonista/irónica
                { gameType: 'impostor', category: 'Acciones', word: 'Casarse', impostorHint: 'Prometer' },           // Contrato verbal/legal
                { gameType: 'impostor', category: 'Acciones', word: 'Divorciarse', impostorHint: 'Romper' },         // Finalizar la unión
                { gameType: 'impostor', category: 'Acciones', word: 'Mudarse', impostorHint: 'Empaquetar' },         // La parte tediosa del cambio de casa
                { gameType: 'impostor', category: 'Acciones', word: 'Invitar', impostorHint: 'Pagar' },              // Implicación social
                { gameType: 'impostor', category: 'Acciones', word: 'Celebrar', impostorHint: 'Beber' },             // Actividad común en fiestas

                // --- ANIMALES ---
                { gameType: 'impostor', category: 'Animales', word: 'Elefante', impostorHint: 'Rinoceronte' }, // Ambos grandes, grises y piel dura
                { gameType: 'impostor', category: 'Animales', word: 'Perro', impostorHint: 'Lobo' },           // Cánidos similares
                { gameType: 'impostor', category: 'Animales', word: 'Gato', impostorHint: 'Tigre' },           // Felinos
                { gameType: 'impostor', category: 'Animales', word: 'Delfín', impostorHint: 'Tiburón' },       // Ambos reyes del mar (uno mamífero, otro pez)
                { gameType: 'impostor', category: 'Animales', word: 'León', impostorHint: 'Leopardo' },        // Depredadores africanos
                { gameType: 'impostor', category: 'Animales', word: 'Pingüino', impostorHint: 'Pato' },        // Aves acuáticas
                { gameType: 'impostor', category: 'Animales', word: 'Jirafa', impostorHint: 'Avestruz' },      // Ambos cuello largo/patas largas
                { gameType: 'impostor', category: 'Animales', word: 'Tortuga', impostorHint: 'Caracol' },      // Ambos con caparazón y lentos
                { gameType: 'impostor', category: 'Animales', word: 'Pájaro', impostorHint: 'Murciélago' },    // Ambos vuelan
                { gameType: 'impostor', category: 'Animales', word: 'Serpiente', impostorHint: 'Gusano' },     // Ambos se arrastran/alargados
                { gameType: 'impostor', category: 'Animales', word: 'Abeja', impostorHint: 'Avispa' },         // Insectos voladores que pican
                { gameType: 'impostor', category: 'Animales', word: 'Caballo', impostorHint: 'Burro' },        // Equinos de granja
                { gameType: 'impostor', category: 'Animales', word: 'Mariposa', impostorHint: 'Polilla' },     // Insectos con alas grandes
                { gameType: 'impostor', category: 'Animales', word: 'Rana', impostorHint: 'Sapo' },            // Anfibios que saltan
                { gameType: 'impostor', category: 'Animales', word: 'Oveja', impostorHint: 'Cabra' },          // Ganado lanudo/peludo
                { gameType: 'impostor', category: 'Animales', word: 'Cangrejo', impostorHint: 'Escorpión' },   // Tienen pinzas (uno mar, otro tierra)
                { gameType: 'impostor', category: 'Animales', word: 'Águila', impostorHint: 'Buitre' },        // Grandes aves rapaces
                { gameType: 'impostor', category: 'Animales', word: 'Gorila', impostorHint: 'Humano' },        // Primates (Relación existencial)
                { gameType: 'impostor', category: 'Animales', word: 'Cocodrilo', impostorHint: 'Lagarto' },    // Reptiles de forma similar
                { gameType: 'impostor', category: 'Animales', word: 'Ratón', impostorHint: 'Hámster' },        // Roedores pequeños
                { gameType: 'impostor', category: 'Animales', word: 'Cebra', impostorHint: 'Paso de peatones' },// Rayas blancas y negras (Muy rebuscada/broma)
                { gameType: 'impostor', category: 'Animales', word: 'Oso', impostorHint: 'Panda' },            // Úrsidos grandes
                { gameType: 'impostor', category: 'Animales', word: 'Ballena', impostorHint: 'Submarino' },    // Grandes bajo el agua (Animal vs Objeto)
                { gameType: 'impostor', category: 'Animales', word: 'Hormiga', impostorHint: 'Termita' },      // Insectos coloniales pequeños
                { gameType: 'impostor', category: 'Animales', word: 'Camello', impostorHint: 'Dromedario' },   // Animales del desierto con joroba
                { gameType: 'impostor', category: 'Animales', word: 'Zorro', impostorHint: 'Mapache' },        // Mamíferos medianos astutos
                { gameType: 'impostor', category: 'Animales', word: 'Pulpo', impostorHint: 'Calamar' },        // Cefalópodos con tentáculos
                { gameType: 'impostor', category: 'Animales', word: 'Búho', impostorHint: 'Lechuza' },         // Aves nocturnas
                { gameType: 'impostor', category: 'Animales', word: 'Canguro', impostorHint: 'Conejo' },       // Se desplazan saltando
                { gameType: 'impostor', category: 'Animales', word: 'Foca', impostorHint: 'Morsa' },           // Mamíferos marinos de hielo
                { gameType: 'impostor', category: 'Animales', word: 'Mosquito', impostorHint: 'Vampiro' },     // Chupan sangre
                { gameType: 'impostor', category: 'Animales', word: 'Araña', impostorHint: 'Red' },            // La araña y su creación
                { gameType: 'impostor', category: 'Animales', word: 'Vaca', impostorHint: 'Toro' },            // Bovinos (femenino vs masculino)
                { gameType: 'impostor', category: 'Animales', word: 'Loro', impostorHint: 'Cotorra' },         // Aves coloridas que hablan
                { gameType: 'impostor', category: 'Animales', word: 'Cerdo', impostorHint: 'Jabalí' },         // Porcinos (doméstico vs salvaje)
                { gameType: 'impostor', category: 'Animales', word: 'Medusa', impostorHint: 'Bolsa de plástico' }, // Parecidos en el mar (Conciencia ecológica/rebuscada)
                { gameType: 'impostor', category: 'Animales', word: 'Erizo', impostorHint: 'Puercoespín' },    // Tienen púas
                { gameType: 'impostor', category: 'Animales', word: 'Hipopótamo', impostorHint: 'Cerdo' },     // Aspecto rosado/gordito (aunque tamaños distintos)
                { gameType: 'impostor', category: 'Animales', word: 'Estrella de mar', impostorHint: 'Estrella' }, // Forma compartida
                { gameType: 'impostor', category: 'Animales', word: 'Gallo', impostorHint: 'Despertador' },    // Despiertan por la mañana
                { gameType: 'impostor', category: 'Animales', word: 'Koala', impostorHint: 'Perezoso' },             // Animales lentos que abrazan árboles
                { gameType: 'impostor', category: 'Animales', word: 'Panda', impostorHint: 'Bambú' },                // Su única comida
                { gameType: 'impostor', category: 'Animales', word: 'Canguro', impostorHint: 'Bolso' },              // Por el marsupio
                { gameType: 'impostor', category: 'Animales', word: 'Ornitorrinco', impostorHint: 'Puzzle' },        // Mezcla de partes de animales
                { gameType: 'impostor', category: 'Animales', word: 'Camaleón', impostorHint: 'Semáforo' },          // Cambia de colores
                { gameType: 'impostor', category: 'Animales', word: 'Hiena', impostorHint: 'Payaso' },               // Porque se "ríe"
                { gameType: 'impostor', category: 'Animales', word: 'Pavo Real', impostorHint: 'Abanico' },          // Forma de la cola
                { gameType: 'impostor', category: 'Animales', word: 'Flamenco', impostorHint: 'Gamba' },             // Son rosas porque comen gambas
                { gameType: 'impostor', category: 'Animales', word: 'Tucán', impostorHint: 'Plátano' },              // Forma del pico grande y curvo
                { gameType: 'impostor', category: 'Animales', word: 'Colibrí', impostorHint: 'Helicóptero' },        // Vuelo estático y rápido
                { gameType: 'impostor', category: 'Animales', word: 'Topo', impostorHint: 'Minero' },                // Vive bajo tierra cavando
                { gameType: 'impostor', category: 'Animales', word: 'Castor', impostorHint: 'Carpintero' },          // Trabaja con madera
                { gameType: 'impostor', category: 'Animales', word: 'Mapache', impostorHint: 'Ladrón' },             // Antifaz y manos hábiles
                { gameType: 'impostor', category: 'Animales', word: 'Mofeta', impostorHint: 'Perfume' },             // Ironía sobre el olor
                { gameType: 'impostor', category: 'Animales', word: 'Llama', impostorHint: 'Alpaca' },               // Andinos parecidos
                { gameType: 'impostor', category: 'Animales', word: 'Buitre', impostorHint: 'Basurero' },            // Limpian los restos
                { gameType: 'impostor', category: 'Animales', word: 'Ciempiés', impostorHint: 'Tren' },              // Largo y con muchas "ruedas/patas"
                { gameType: 'impostor', category: 'Animales', word: 'Luciérnaga', impostorHint: 'Bombilla' },        // Produce luz
                { gameType: 'impostor', category: 'Animales', word: 'Grillo', impostorHint: 'Violín' },              // Hacen música frotando
                { gameType: 'impostor', category: 'Animales', word: 'Saltamontes', impostorHint: 'Muelle' },         // Mecanismo de salto
                { gameType: 'impostor', category: 'Animales', word: 'Mantis', impostorHint: 'Religiosa' },           // Postura de rezo
                { gameType: 'impostor', category: 'Animales', word: 'Escarabajo', impostorHint: 'Tanque' },          // Acorazado
                { gameType: 'impostor', category: 'Animales', word: 'Mariquita', impostorHint: 'Lunar' },            // Puntos negros
                { gameType: 'impostor', category: 'Animales', word: 'Caracol', impostorHint: 'Espiral' },            // Forma de la concha
                { gameType: 'impostor', category: 'Animales', word: 'Babosa', impostorHint: 'Moco' },                // Textura
                { gameType: 'impostor', category: 'Animales', word: 'Lombriz', impostorHint: 'Espagueti' },          // Forma
                { gameType: 'impostor', category: 'Animales', word: 'Medusa', impostorHint: 'Paracaídas' },          // Forma flotante
                { gameType: 'impostor', category: 'Animales', word: 'Caballito de mar', impostorHint: 'Ajedrez' },   // Pieza del juego
                { gameType: 'impostor', category: 'Animales', word: 'Anguila', impostorHint: 'Cable' },              // Forma y a veces electricidad
                { gameType: 'impostor', category: 'Animales', word: 'Pez Globo', impostorHint: 'Pelota' },           // Se infla
                { gameType: 'impostor', category: 'Animales', word: 'Pez Espada', impostorHint: 'Pincho' },          // Nariz afilada
                { gameType: 'impostor', category: 'Animales', word: 'Trucha', impostorHint: 'Salmón' },              // Peces de río
                { gameType: 'impostor', category: 'Animales', word: 'Atún', impostorHint: 'Lata' },                  // Donde solemos verlo
                { gameType: 'impostor', category: 'Animales', word: 'Orca', impostorHint: 'Panda' },                 // Blanco y negro, pero en el mar
                { gameType: 'impostor', category: 'Animales', word: 'Nutria', impostorHint: 'Piedra' },              // Juegan con piedras
                { gameType: 'impostor', category: 'Animales', word: 'Salamandra', impostorHint: 'Fuego' },           // Mito clásico
                { gameType: 'impostor', category: 'Animales', word: 'Iguana', impostorHint: 'Estatua' },             // Se quedan muy quietas
                { gameType: 'impostor', category: 'Animales', word: 'Gecko', impostorHint: 'Ventosa' },              // Se pegan a paredes
                { gameType: 'impostor', category: 'Animales', word: 'Boa', impostorHint: 'Bufanda' },                // Se enrolla al cuello
                { gameType: 'impostor', category: 'Animales', word: 'Cobra', impostorHint: 'Capucha' },              // Forma de la cabeza
                { gameType: 'impostor', category: 'Animales', word: 'Tarántula', impostorHint: 'Peluche' },          // Peluda (aunque da miedo)
                { gameType: 'impostor', category: 'Animales', word: 'Viuda Negra', impostorHint: 'Reloj de arena' }, // Marca roja en su cuerpo
                { gameType: 'impostor', category: 'Animales', word: 'Cisne', impostorHint: 'Cuello' },               // Rasgo distintivo
                { gameType: 'impostor', category: 'Animales', word: 'Gaviota', impostorHint: 'Playa' },              // Hábitat ruidoso
                { gameType: 'impostor', category: 'Animales', word: 'Paloma', impostorHint: 'Rata' },                // "Ratas del aire" (broma urbana)
                { gameType: 'impostor', category: 'Animales', word: 'Cuervo', impostorHint: 'Luto' },                // Color negro y simbolismo
                { gameType: 'impostor', category: 'Animales', word: 'Canario', impostorHint: 'Mina' },               // Usados para detectar gas
                { gameType: 'impostor', category: 'Animales', word: 'Avestruz', impostorHint: 'Huevo' },             // Ponen los más grandes
                { gameType: 'impostor', category: 'Animales', word: 'Kiwi', impostorHint: 'Fruta' },                 // Comparten nombre y forma redonda/peluda
                { gameType: 'impostor', category: 'Animales', word: 'Mamut', impostorHint: 'Elefante' },             // Ancestro lanudo
                { gameType: 'impostor', category: 'Animales', word: 'Dinosaurio', impostorHint: 'Meteorito' },       // Su final
                { gameType: 'impostor', category: 'Animales', word: 'Dragón', impostorHint: 'Fuego' },               // Criatura mitológica
                { gameType: 'impostor', category: 'Animales', word: 'Unicornio', impostorHint: 'Caballo' },          // Caballo con cuerno
                { gameType: 'impostor', category: 'Animales', word: 'Fénix', impostorHint: 'Ceniza' },               // Renace de ahí
                { gameType: 'impostor', category: 'Animales', word: 'Centauro', impostorHint: 'Jinete' },            // Mitad hombre mitad caballo
                { gameType: 'impostor', category: 'Animales', word: 'Sirena', impostorHint: 'Pez' },                 // Mitad mujer mitad pez
                { gameType: 'impostor', category: 'Animales', word: 'Hombre Lobo', impostorHint: 'Luna' },           // Transformación

                // --- LUGAR ---
                { gameType: 'impostor', category: 'Lugar', word: 'Playa', impostorHint: 'Piscina' },        // Agua y baño
                { gameType: 'impostor', category: 'Lugar', word: 'Montaña', impostorHint: 'Bosque' },       // Naturaleza y senderismo
                { gameType: 'impostor', category: 'Lugar', word: 'Escuela', impostorHint: 'Biblioteca' },   // Libros y estudio
                { gameType: 'impostor', category: 'Lugar', word: 'Hospital', impostorHint: 'Farmacia' },    // Salud y medicina
                { gameType: 'impostor', category: 'Lugar', word: 'Cine', impostorHint: 'Teatro' },          // Espectáculo y butacas
                { gameType: 'impostor', category: 'Lugar', word: 'Parque', impostorHint: 'Jardín' },        // Zonas verdes urbanas
                { gameType: 'impostor', category: 'Lugar', word: 'Aeropuerto', impostorHint: 'Estación' },  // Transporte y maletas
                { gameType: 'impostor', category: 'Lugar', word: 'Biblioteca', impostorHint: 'Librería' },  // Libros (uno presta, otro vende)
                { gameType: 'impostor', category: 'Lugar', word: 'Gimnasio', impostorHint: 'Estadio' },     // Deporte
                { gameType: 'impostor', category: 'Lugar', word: 'Bosque', impostorHint: 'Selva' },          // Árboles y vegetación
                { gameType: 'impostor', category: 'Lugar', word: 'Hotel', impostorHint: 'Hostal' },         // Alojamiento temporal
                { gameType: 'impostor', category: 'Lugar', word: 'Iglesia', impostorHint: 'Catedral' },     // Edificios religiosos
                { gameType: 'impostor', category: 'Lugar', word: 'Pueblo', impostorHint: 'Ciudad' },        // Asentamientos humanos
                { gameType: 'impostor', category: 'Lugar', word: 'Desierto', impostorHint: 'Playa' },       // Mucha arena
                { gameType: 'impostor', category: 'Lugar', word: 'Isla', impostorHint: 'Barco' },           // Rodeados de agua (rebuscada)
                { gameType: 'impostor', category: 'Lugar', word: 'Ascensor', impostorHint: 'Escaleras' },   // Lugares de tránsito vertical
                { gameType: 'impostor', category: 'Lugar', word: 'Balcón', impostorHint: 'Terraza' },       // Espacios exteriores domésticos
                { gameType: 'impostor', category: 'Lugar', word: 'Supermercado', impostorHint: 'Mercado' }, // Lugares para comprar comida
                { gameType: 'impostor', category: 'Lugar', word: 'Zoológico', impostorHint: 'Granja' },     // Lugares con animales
                { gameType: 'impostor', category: 'Lugar', word: 'Oficina', impostorHint: 'Clase' },        // Mesas ordenadas y trabajo/estudio
                { gameType: 'impostor', category: 'Lugar', word: 'Castillo', impostorHint: 'Palacio' },     // Edificios grandes y antiguos
                { gameType: 'impostor', category: 'Lugar', word: 'Discoteca', impostorHint: 'Bar' },        // Lugares nocturnos con música
                { gameType: 'impostor', category: 'Lugar', word: 'Cueva', impostorHint: 'Sótano' },         // Lugares oscuros y bajo tierra
                { gameType: 'impostor', category: 'Lugar', word: 'Puente', impostorHint: 'Túnel' },         // Estructuras para cruzar
                { gameType: 'impostor', category: 'Lugar', word: 'Circo', impostorHint: 'Feria' },          // Entretenimiento itinerante
                { gameType: 'impostor', category: 'Lugar', word: 'Restaurante', impostorHint: 'Cocina' },   // Donde se come vs donde se hace
                { gameType: 'impostor', category: 'Lugar', word: 'Museo', impostorHint: 'Galería' },        // Exhibición de arte/historia
                { gameType: 'impostor', category: 'Lugar', word: 'Banco', impostorHint: 'Cajero' },         // Dinero
                { gameType: 'impostor', category: 'Lugar', word: 'Cárcel', impostorHint: 'Jaula' },         // Lugares de encierro
                { gameType: 'impostor', category: 'Lugar', word: 'Laboratorio', impostorHint: 'Cocina' },   // Lugares de mezclas y experimentos
                { gameType: 'impostor', category: 'Lugar', word: 'Estacionamiento', impostorHint: 'Garaje' },// Lugares para coches
                { gameType: 'impostor', category: 'Lugar', word: 'Puerto', impostorHint: 'Muelle' },        // Conexión tierra-mar
                { gameType: 'impostor', category: 'Lugar', word: 'Cementerio', impostorHint: 'Parque' },    // Zonas verdes tranquilas (Morbosa/rebuscada)
                { gameType: 'impostor', category: 'Lugar', word: 'Peluquería', impostorHint: 'Barbería' },  // Cortar pelo
                { gameType: 'impostor', category: 'Lugar', word: 'Casino', impostorHint: 'Bingo' },         // Juegos de azar
                { gameType: 'impostor', category: 'Lugar', word: 'Ártico', impostorHint: 'Nevera' },        // Lugares muy fríos
                { gameType: 'impostor', category: 'Lugar', word: 'Espacio', impostorHint: 'Cielo' },        // Arriba del todo
                { gameType: 'impostor', category: 'Lugar', word: 'Estanque', impostorHint: 'Lago' },        // Cuerpos de agua cerrados
                { gameType: 'impostor', category: 'Lugar', word: 'Faro', impostorHint: 'Torre' },           // Estructuras altas
                { gameType: 'impostor', category: 'Lugar', word: 'Acera', impostorHint: 'Carretera' },      // Caminos pavimentados
                { gameType: 'impostor', category: 'Lugar', word: 'Universidad', impostorHint: 'Colegio' },           // Lugar de estudio avanzado
                { gameType: 'impostor', category: 'Lugar', word: 'Guardería', impostorHint: 'Parque de bolas' },     // Lugar para niños pequeños
                { gameType: 'impostor', category: 'Lugar', word: 'Asilo', impostorHint: 'Guardería' },               // Cuidado de personas (edad opuesta)
                { gameType: 'impostor', category: 'Lugar', word: 'Fábrica', impostorHint: 'Humo' },                  // Producción industrial
                { gameType: 'impostor', category: 'Lugar', word: 'Granja', impostorHint: 'Establo' },                // Lugar de animales
                { gameType: 'impostor', category: 'Lugar', word: 'Invernadero', impostorHint: 'Selva' },             // Plantas bajo cristal
                { gameType: 'impostor', category: 'Lugar', word: 'Huerto', impostorHint: 'Jardín' },                 // Plantas para comer vs ver
                { gameType: 'impostor', category: 'Lugar', word: 'Viñedo', impostorHint: 'Bodega' },                 // Origen del vino
                { gameType: 'impostor', category: 'Lugar', word: 'Mina', impostorHint: 'Cueva' },                    // Extracción bajo tierra
                { gameType: 'impostor', category: 'Lugar', word: 'Pozo', impostorHint: 'Agujero' },                  // Acceso a agua profunda
                { gameType: 'impostor', category: 'Lugar', word: 'Torre', impostorHint: 'Mirador' },                 // Estructura alta para ver
                { gameType: 'impostor', category: 'Lugar', word: 'Rascacielos', impostorHint: 'Ascensor' },          // Edificio muy alto
                { gameType: 'impostor', category: 'Lugar', word: 'Ático', impostorHint: 'Tejado' },                  // Parte superior de la casa
                { gameType: 'impostor', category: 'Lugar', word: 'Sótano', impostorHint: 'Búnker' },                 // Parte inferior y oscura
                { gameType: 'impostor', category: 'Lugar', word: 'Pasillo', impostorHint: 'Túnel' },                 // Conector de habitaciones
                { gameType: 'impostor', category: 'Lugar', word: 'Cocina', impostorHint: 'Laboratorio' },            // Donde se crean las mezclas
                { gameType: 'impostor', category: 'Lugar', word: 'Baño', impostorHint: 'Vestuario' },                // Higiene personal
                { gameType: 'impostor', category: 'Lugar', word: 'Dormitorio', impostorHint: 'Hotel' },              // Lugar para dormir
                { gameType: 'impostor', category: 'Lugar', word: 'Salón', impostorHint: 'Cine' },                    // Lugar de la TV y sofá
                { gameType: 'impostor', category: 'Lugar', word: 'Trastero', impostorHint: 'Museo' },                // Donde se guardan cosas viejas
                { gameType: 'impostor', category: 'Lugar', word: 'Garaje', impostorHint: 'Taller' },                 // Casa del coche
                { gameType: 'impostor', category: 'Lugar', word: 'Tejado', impostorHint: 'Gato' },                   // Lugar típico de gatos
                { gameType: 'impostor', category: 'Lugar', word: 'Chimenea', impostorHint: 'Hoguera' },              // Fuego dentro de casa
                { gameType: 'impostor', category: 'Lugar', word: 'Piscina', impostorHint: 'Bañera' },                // Contenedor de agua para meterse
                { gameType: 'impostor', category: 'Lugar', word: 'Jacuzzi', impostorHint: 'Olla' },                  // Agua caliente y burbujas
                { gameType: 'impostor', category: 'Lugar', word: 'Sauna', impostorHint: 'Horno' },                   // Calor seco extremo
                { gameType: 'impostor', category: 'Lugar', word: 'Spa', impostorHint: 'Masaje' },                    // Relax
                { gameType: 'impostor', category: 'Lugar', word: 'Estadio', impostorHint: 'Coliseo' },               // Arena deportiva grande
                { gameType: 'impostor', category: 'Lugar', word: 'Cancha', impostorHint: 'Patio' },                  // Lugar de juego delimitado
                { gameType: 'impostor', category: 'Lugar', word: 'Pista de hielo', impostorHint: 'Congelador' },     // Suelo helado
                { gameType: 'impostor', category: 'Lugar', word: 'Bolera', impostorHint: 'Pasillo' },                // Pista larga y pulida
                { gameType: 'impostor', category: 'Lugar', word: 'Campo de golf', impostorHint: 'Pradera' },         // Césped muy cuidado
                { gameType: 'impostor', category: 'Lugar', word: 'Acuario', impostorHint: 'Pecera' },                // Zoo de peces
                { gameType: 'impostor', category: 'Lugar', word: 'Planetario', impostorHint: 'Espacio' },            // Simulador del cielo
                { gameType: 'impostor', category: 'Lugar', word: 'Observatorio', impostorHint: 'Telescopio' },       // Mirar estrellas
                { gameType: 'impostor', category: 'Lugar', word: 'Gasolinera', impostorHint: 'Restaurante' },        // Comida para coches
                { gameType: 'impostor', category: 'Lugar', word: 'Taller', impostorHint: 'Hospital' },               // Donde arreglan cosas/coches
                { gameType: 'impostor', category: 'Lugar', word: 'Lavandería', impostorHint: 'Río' },                // Donde se lava la ropa
                { gameType: 'impostor', category: 'Lugar', word: 'Kiosco', impostorHint: 'Librería' },               // Venta de prensa pequeña
                { gameType: 'impostor', category: 'Lugar', word: 'Panadería', impostorHint: 'Fábrica' },             // Olor a pan
                { gameType: 'impostor', category: 'Lugar', word: 'Carnicería', impostorHint: 'Quirófano' },          // Cortes y cuchillos
                { gameType: 'impostor', category: 'Lugar', word: 'Juguetería', impostorHint: 'Parque' },             // Objetos de diversión
                { gameType: 'impostor', category: 'Lugar', word: 'Zapatería', impostorHint: 'Pie' },                 // Lugar de calzado
                { gameType: 'impostor', category: 'Lugar', word: 'Joyería', impostorHint: 'Banco' },                 // Lugar con cosas valiosas
                { gameType: 'impostor', category: 'Lugar', word: 'Comisaría', impostorHint: 'Cárcel' },             // Policías
                { gameType: 'impostor', category: 'Lugar', word: 'Juzgado', impostorHint: 'Martillo' },              // Donde se dictan sentencias
                { gameType: 'impostor', category: 'Lugar', word: 'Embajada', impostorHint: 'Isla' },                 // Territorio extranjero en otro país
                { gameType: 'impostor', category: 'Lugar', word: 'Frontera', impostorHint: 'Muro' },                 // Línea divisoria
                { gameType: 'impostor', category: 'Lugar', word: 'Aduana', impostorHint: 'Peaje' },                  // Control de paso
                { gameType: 'impostor', category: 'Lugar', word: 'Metro', impostorHint: 'Gusano' },                  // Tren bajo tierra
                { gameType: 'impostor', category: 'Lugar', word: 'Autobús', impostorHint: 'Camión' },                // Vehículo grande de transporte
                { gameType: 'impostor', category: 'Lugar', word: 'Avión', impostorHint: 'Pájaro' },                  // Vehículo aéreo
                { gameType: 'impostor', category: 'Lugar', word: 'Crucero', impostorHint: 'Hotel' },                 // Hotel flotante
                { gameType: 'impostor', category: 'Lugar', word: 'Cohete', impostorHint: 'Fuego' },                  // Transporte vertical
                { gameType: 'impostor', category: 'Lugar', word: 'Estación espacial', impostorHint: 'Satélite' },    // Casa en órbita
                { gameType: 'impostor', category: 'Lugar', word: 'Luna', impostorHint: 'Queso' },                    // Mito visual
                { gameType: 'impostor', category: 'Lugar', word: 'Marte', impostorHint: 'Desierto' },                // Planeta rojo
                { gameType: 'impostor', category: 'Lugar', word: 'Volcán', impostorHint: 'Montaña' },                // Montaña enfadada
                { gameType: 'impostor', category: 'Lugar', word: 'Cascada', impostorHint: 'Ducha' },                 // Caída de agua natural
                { gameType: 'impostor', category: 'Lugar', word: 'Pantano', impostorHint: 'Sopa' },                  // Agua densa y verde

                // --- COMIDA ---
                { gameType: 'impostor', category: 'Comida', word: 'Pizza', impostorHint: 'Lasaña' },        // Ambos italianos, con salsa y queso
                { gameType: 'impostor', category: 'Comida', word: 'Sushi', impostorHint: 'Ceviche' },       // Ambos pescado crudo/marinado
                { gameType: 'impostor', category: 'Comida', word: 'Hamburguesa', impostorHint: 'Sandwich' },// Ambos pan con relleno
                { gameType: 'impostor', category: 'Comida', word: 'Paella', impostorHint: 'Risotto' },      // Ambos base de arroz
                { gameType: 'impostor', category: 'Comida', word: 'Tacos', impostorHint: 'Burrito' },       // Ambos mexicanos con tortilla
                { gameType: 'impostor', category: 'Comida', word: 'Helado', impostorHint: 'Yogur' },        // Ambos lácteos fríos/cremosos
                { gameType: 'impostor', category: 'Comida', word: 'Chocolate', impostorHint: 'Caramelo' },  // Ambos dulces golosina
                { gameType: 'impostor', category: 'Comida', word: 'Ensalada', impostorHint: 'Sopa' },       // Ambos entrantes ligeros
                { gameType: 'impostor', category: 'Comida', word: 'Huevo', impostorHint: 'Leche' },         // Ambos básicos de origen animal
                { gameType: 'impostor', category: 'Comida', word: 'Pan', impostorHint: 'Galleta' },         // Ambos harina horneada
                { gameType: 'impostor', category: 'Comida', word: 'Espaguetis', impostorHint: 'Fideos' },   // Tiras largas de masa
                { gameType: 'impostor', category: 'Comida', word: 'Naranja', impostorHint: 'Pomelo' },      // Cítricos redondos
                { gameType: 'impostor', category: 'Comida', word: 'Café', impostorHint: 'Té' },             // Bebidas calientes estimulantes
                { gameType: 'impostor', category: 'Comida', word: 'Mantequilla', impostorHint: 'Queso' },   // Lácteos sólidos y grasos
                { gameType: 'impostor', category: 'Comida', word: 'Croissant', impostorHint: 'Donut' },     // Bollería con agujero o curva
                { gameType: 'impostor', category: 'Comida', word: 'Pollo', impostorHint: 'Pavo' },          // Aves de carne blanca
                { gameType: 'impostor', category: 'Comida', word: 'Manzana', impostorHint: 'Pera' },        // Frutas de piel fina y carne blanca
                { gameType: 'impostor', category: 'Comida', word: 'Ketchup', impostorHint: 'Tomate' },      // Rojo y base de tomate
                { gameType: 'impostor', category: 'Comida', word: 'Salchicha', impostorHint: 'Chorizo' },   // Embutidos cilíndricos
                { gameType: 'impostor', category: 'Comida', word: 'Cerveza', impostorHint: 'Refresco' },    // Bebidas con gas
                { gameType: 'impostor', category: 'Comida', word: 'Vino', impostorHint: 'Uva' },            // Origen y producto
                { gameType: 'impostor', category: 'Comida', word: 'Patata', impostorHint: 'Boniato' },      // Tubérculos enterrados
                { gameType: 'impostor', category: 'Comida', word: 'Miel', impostorHint: 'Mermelada' },      // Untables dulces y pegajosos
                { gameType: 'impostor', category: 'Comida', word: 'Gambas', impostorHint: 'Cangrejo' },     // Mariscos con caparazón
                { gameType: 'impostor', category: 'Comida', word: 'Arroz', impostorHint: 'Quinoa' },        // Granos pequeños guarnición
                { gameType: 'impostor', category: 'Comida', word: 'Tortilla', impostorHint: 'Crepe' },      // Redondos y planos hechos en sartén
                { gameType: 'impostor', category: 'Comida', word: 'Aceite', impostorHint: 'Vinagre' },      // Aliños líquidos
                { gameType: 'impostor', category: 'Comida', word: 'Espinacas', impostorHint: 'Lechuga' },   // Hojas verdes comestibles
                { gameType: 'impostor', category: 'Comida', word: 'Pastel', impostorHint: 'Magdalena' },    // Repostería esponjosa
                { gameType: 'impostor', category: 'Comida', word: 'Agua', impostorHint: 'Hielo' },          // Mismo elemento, distinto estado
                { gameType: 'impostor', category: 'Comida', word: 'Coco', impostorHint: 'Nuez' },           // Frutos con cáscara dura
                { gameType: 'impostor', category: 'Comida', word: 'Chicle', impostorHint: 'Caramelo' },     // Se chupan/mastican en la boca
                { gameType: 'impostor', category: 'Comida', word: 'Lentejas', impostorHint: 'Garbanzos' },  // Legumbres redondas
                { gameType: 'impostor', category: 'Comida', word: 'Pimienta', impostorHint: 'Sal' },        // Condimentos en polvo
                { gameType: 'impostor', category: 'Comida', word: 'Plátano', impostorHint: 'Pepino' },      // Forma alargada (Relación rebuscada)
                { gameType: 'impostor', category: 'Comida', word: 'Empanada', impostorHint: 'Dumpling' },   // Masa rellena cerrada
                { gameType: 'impostor', category: 'Comida', word: 'Mayonesa', impostorHint: 'Nata' },       // Cremas blancas densas
                { gameType: 'impostor', category: 'Comida', word: 'Sandía', impostorHint: 'Melón' },        // Grandes, dulces y mucha agua
                { gameType: 'impostor', category: 'Comida', word: 'Cebolla', impostorHint: 'Ajo' },         // Bulbos que dan sabor fuerte
                { gameType: 'impostor', category: 'Comida', word: 'Palomitas', impostorHint: 'Maíz' },      // Origen y resultado
                { gameType: 'impostor', category: 'Comida', word: 'Lasaña', impostorHint: 'Edificio' },              // Capas superpuestas
                { gameType: 'impostor', category: 'Comida', word: 'Canelones', impostorHint: 'Tubos' },              // Pasta enrollada
                { gameType: 'impostor', category: 'Comida', word: 'Ravioli', impostorHint: 'Almohada' },             // Pasta rellena cuadrada
                { gameType: 'impostor', category: 'Comida', word: 'Macarrones', impostorHint: 'Tubería' },           // Pasta cilíndrica
                { gameType: 'impostor', category: 'Comida', word: 'Sopa', impostorHint: 'Pocima' },                  // Líquido caliente con cosas
                { gameType: 'impostor', category: 'Comida', word: 'Puré', impostorHint: 'Papilla' },                 // Comida triturada
                { gameType: 'impostor', category: 'Comida', word: 'Gazpacho', impostorHint: 'Zumo' },                // Sopa fría bebible
                { gameType: 'impostor', category: 'Comida', word: 'Bocadillo', impostorHint: 'Carpeta' },            // Pan guardando cosas dentro
                { gameType: 'impostor', category: 'Comida', word: 'Tostada', impostorHint: 'Suela' },                // Pan duro y plano
                { gameType: 'impostor', category: 'Comida', word: 'Cereal', impostorHint: 'Pienso' },                // Comida seca en bol
                { gameType: 'impostor', category: 'Comida', word: 'Galleta', impostorHint: 'Moneda' },               // Dulce plano y redondo
                { gameType: 'impostor', category: 'Comida', word: 'Magdalena', impostorHint: 'Hongo' },              // Forma con sombrero
                { gameType: 'impostor', category: 'Comida', word: 'Bizcocho', impostorHint: 'Esponja' },             // Textura aireada
                { gameType: 'impostor', category: 'Comida', word: 'Tarta', impostorHint: 'Cumpleaños' },             // Contexto principal
                { gameType: 'impostor', category: 'Comida', word: 'Flan', impostorHint: 'Temblor' },                 // Se mueve al tocarlo
                { gameType: 'impostor', category: 'Comida', word: 'Gelatina', impostorHint: 'Medusa' },              // Transparente y temblorosa
                { gameType: 'impostor', category: 'Comida', word: 'Churros', impostorHint: 'Lazos' },                // Masa frita alargada
                { gameType: 'impostor', category: 'Comida', word: 'Turrón', impostorHint: 'Ladrillo' },              // Duro y rectangular
                { gameType: 'impostor', category: 'Comida', word: 'Polvorón', impostorHint: 'Arena' },               // Se deshace en polvo
                { gameType: 'impostor', category: 'Comida', word: 'Bombón', impostorHint: 'Joya' },                  // Pequeño regalo de chocolate
                { gameType: 'impostor', category: 'Comida', word: 'Chupa Chups', impostorHint: 'Planeta' },          // Esfera con palo
                { gameType: 'impostor', category: 'Comida', word: 'Algodón de azúcar', impostorHint: 'Nube' },       // Parecido físico
                { gameType: 'impostor', category: 'Comida', word: 'Regaliz', impostorHint: 'Cable' },                // Negro y alargado
                { gameType: 'impostor', category: 'Comida', word: 'Gominola', impostorHint: 'Goma' },                // Textura elástica
                { gameType: 'impostor', category: 'Comida', word: 'Pistacho', impostorHint: 'Almeja' },              // Se abre igual
                { gameType: 'impostor', category: 'Comida', word: 'Cacahuete', impostorHint: 'Ocho' },               // Forma de la cáscara
                { gameType: 'impostor', category: 'Comida', word: 'Nuez', impostorHint: 'Cerebro' },                 // Parecido físico famoso
                { gameType: 'impostor', category: 'Comida', word: 'Almendra', impostorHint: 'Ojo' },                 // Forma almendrada
                { gameType: 'impostor', category: 'Comida', word: 'Castaña', impostorHint: 'Erizo' },                // Viene dentro de pinchos
                { gameType: 'impostor', category: 'Comida', word: 'Aceituna', impostorHint: 'Ojo' },                 // Redonda y a veces rellena
                { gameType: 'impostor', category: 'Comida', word: 'Pepinillo', impostorHint: 'Dedo' },               // Verde y arrugado
                { gameType: 'impostor', category: 'Comida', word: 'Champiñón', impostorHint: 'Paraguas' },           // Forma
                { gameType: 'impostor', category: 'Comida', word: 'Zanahoria', impostorHint: 'Naranja' },            // Color
                { gameType: 'impostor', category: 'Comida', word: 'Brócoli', impostorHint: 'Árbol' },                // Parece un árbol pequeño
                { gameType: 'impostor', category: 'Comida', word: 'Coliflor', impostorHint: 'Cerebro' },             // Masa blanca rugosa
                { gameType: 'impostor', category: 'Comida', word: 'Guisante', impostorHint: 'Perla' },               // Bolita verde
                { gameType: 'impostor', category: 'Comida', word: 'Maíz', impostorHint: 'Diente' },                  // Granos amarillos
                { gameType: 'impostor', category: 'Comida', word: 'Calabaza', impostorHint: 'Carruaje' },            // Cenicienta
                { gameType: 'impostor', category: 'Comida', word: 'Berenjena', impostorHint: 'Morado' },             // Color distintivo
                { gameType: 'impostor', category: 'Comida', word: 'Aguacate', impostorHint: 'Mantequilla' },         // Textura grasa
                { gameType: 'impostor', category: 'Comida', word: 'Piña', impostorHint: 'Granada' },                 // Fruta con armadura
                { gameType: 'impostor', category: 'Comida', word: 'Fresa', impostorHint: 'Corazón' },                // Forma roja
                { gameType: 'impostor', category: 'Comida', word: 'Cereza', impostorHint: 'Pendientes' },            // Se cuelgan de las orejas
                { gameType: 'impostor', category: 'Comida', word: 'Uva', impostorHint: 'Globo' },                    // Pequeñas esferas de agua
                { gameType: 'impostor', category: 'Comida', word: 'Limón', impostorHint: 'Amarillo' },               // Ácido
                { gameType: 'impostor', category: 'Comida', word: 'Kiwi', impostorHint: 'Pelota de tenis' },         // Peludo y marrón por fuera
                { gameType: 'impostor', category: 'Comida', word: 'Granada', impostorHint: 'Rubí' },                 // Semillas rojas brillantes
                { gameType: 'impostor', category: 'Comida', word: 'Higo', impostorHint: 'Saco' },                    // Fruta blanda colgante
                { gameType: 'impostor', category: 'Comida', word: 'Dátil', impostorHint: 'Cucaracha' },              // Aspecto marrón arrugado (broma visual)
                { gameType: 'impostor', category: 'Comida', word: 'Jamón', impostorHint: 'Violín' },                 // Por la forma de la pata
                { gameType: 'impostor', category: 'Comida', word: 'Bacon', impostorHint: 'Cinta' },                  // Tira grasa
                { gameType: 'impostor', category: 'Comida', word: 'Albóndiga', impostorHint: 'Planeta' },            // Bola de carne
                { gameType: 'impostor', category: 'Comida', word: 'Filete', impostorHint: 'Zapato' },                // Si está muy hecho
                { gameType: 'impostor', category: 'Comida', word: 'Costillas', impostorHint: 'Piano' },              // Huesos ordenados
                { gameType: 'impostor', category: 'Comida', word: 'Sardina', impostorHint: 'Lata' },                 // Enlatadas apretadas
                { gameType: 'impostor', category: 'Comida', word: 'Calamares', impostorHint: 'Anillos' },            // A la romana
                { gameType: 'impostor', category: 'Comida', word: 'Mejillón', impostorHint: 'Roca' },                // Negro y duro por fuera
                { gameType: 'impostor', category: 'Comida', word: 'Ostra', impostorHint: 'Perla' },                  // Tesoro interior

                // --- OBJETOS ---
                { gameType: 'impostor', category: 'Objetos', word: 'Silla', impostorHint: 'Taburete' },     // Ambos para sentarse
                { gameType: 'impostor', category: 'Objetos', word: 'Teléfono', impostorHint: 'Tablet' },    // Ambos pantallas táctiles
                { gameType: 'impostor', category: 'Objetos', word: 'Reloj', impostorHint: 'Brújula' },      // Ambos instrumentos de medida redondos
                { gameType: 'impostor', category: 'Objetos', word: 'Libro', impostorHint: 'Revista' },      // Ambos papel para leer
                { gameType: 'impostor', category: 'Objetos', word: 'Llave', impostorHint: 'Contraseña' },   // Ambos para abrir/acceder
                { gameType: 'impostor', category: 'Objetos', word: 'Gafas', impostorHint: 'Prismáticos' },  // Ambos lentes para ver mejor
                { gameType: 'impostor', category: 'Objetos', word: 'Mochila', impostorHint: 'Maleta' },     // Ambos para transportar cosas
                { gameType: 'impostor', category: 'Objetos', word: 'Cuchara', impostorHint: 'Tenedor' },    // Ambos cubiertos de metal
                { gameType: 'impostor', category: 'Objetos', word: 'Cama', impostorHint: 'Sofá' },          // Ambos muebles acolchados
                { gameType: 'impostor', category: 'Objetos', word: 'Espejo', impostorHint: 'Retrato' },     // Ambos muestran una imagen
                { gameType: 'impostor', category: 'Objetos', word: 'Lápiz', impostorHint: 'Bolígrafo' },    // Instrumentos de escritura
                { gameType: 'impostor', category: 'Objetos', word: 'Ventana', impostorHint: 'Puerta' },     // Aperturas en la pared
                { gameType: 'impostor', category: 'Objetos', word: 'Botella', impostorHint: 'Jarra' },      // Contenedores de líquidos
                { gameType: 'impostor', category: 'Objetos', word: 'Escoba', impostorHint: 'Fregona' },     // Palos para limpiar suelo
                { gameType: 'impostor', category: 'Objetos', word: 'Sábana', impostorHint: 'Manta' },       // Textiles para cubrirse en cama
                { gameType: 'impostor', category: 'Objetos', word: 'Martillo', impostorHint: 'Mazo' },      // Herramientas para golpear
                { gameType: 'impostor', category: 'Objetos', word: 'Cuchillo', impostorHint: 'Tijeras' },   // Objetos con filo para cortar
                { gameType: 'impostor', category: 'Objetos', word: 'Anillo', impostorHint: 'Pulsera' },     // Joyería circular
                { gameType: 'impostor', category: 'Objetos', word: 'Moneda', impostorHint: 'Botón' },       // Pequeños, planos y redondos
                { gameType: 'impostor', category: 'Objetos', word: 'Maceta', impostorHint: 'Jarrón' },      // Recipientes para plantas
                { gameType: 'impostor', category: 'Objetos', word: 'Cepillo', impostorHint: 'Peine' },      // Para arreglar el pelo
                { gameType: 'impostor', category: 'Objetos', word: 'Vela', impostorHint: 'Bombilla' },      // Fuentes de luz
                { gameType: 'impostor', category: 'Objetos', word: 'Paraguas', impostorHint: 'Techo' },     // Protegen de la lluvia (Rebuscada)
                { gameType: 'impostor', category: 'Objetos', word: 'Guante', impostorHint: 'Calcetín' },    // Cubren extremidades (manos/pies)
                { gameType: 'impostor', category: 'Objetos', word: 'Cuerda', impostorHint: 'Cable' },       // Hilos largos y flexibles
                { gameType: 'impostor', category: 'Objetos', word: 'Televisión', impostorHint: 'Monitor' }, // Pantallas grandes
                { gameType: 'impostor', category: 'Objetos', word: 'Cuaderno', impostorHint: 'Agenda' },    // Libros para escribir en ellos
                { gameType: 'impostor', category: 'Objetos', word: 'Caja', impostorHint: 'Sobre' },         // Contenedores para enviar/guardar
                { gameType: 'impostor', category: 'Objetos', word: 'Guitarra', impostorHint: 'Violín' },    // Instrumentos de cuerda con cuerpo
                { gameType: 'impostor', category: 'Objetos', word: 'Escalera', impostorHint: 'Ascensor' },  // Medios para subir
                { gameType: 'impostor', category: 'Objetos', word: 'Cinturón', impostorHint: 'Corbata' },   // Accesorios largos de vestir
                { gameType: 'impostor', category: 'Objetos', word: 'Jabón', impostorHint: 'Champú' },       // Productos de limpieza personal
                { gameType: 'impostor', category: 'Objetos', word: 'Almohada', impostorHint: 'Cojín' },     // Mullidos para apoyar la cabeza
                { gameType: 'impostor', category: 'Objetos', word: 'Linterna', impostorHint: 'Faro' },      // Proyectan luz dirigida
                { gameType: 'impostor', category: 'Objetos', word: 'Llanta', impostorHint: 'Volante' },     // Círculos relacionados con coches
                { gameType: 'impostor', category: 'Objetos', word: 'Mesa', impostorHint: 'Escritorio' },    // Superficies planas con patas
                { gameType: 'impostor', category: 'Objetos', word: 'Papel', impostorHint: 'Cartón' },       // Materiales de celulosa
                { gameType: 'impostor', category: 'Objetos', word: 'Aguja', impostorHint: 'Clavo' },        // Puntas metálicas finas
                { gameType: 'impostor', category: 'Objetos', word: 'Sartén', impostorHint: 'Olla' },        // Utensilios de cocina metálicos
                { gameType: 'impostor', category: 'Objetos', word: 'Micrófono', impostorHint: 'Altavoz' },  // Entrada/Salida de audio
                { gameType: 'impostor', category: 'Objetos', word: 'Ordenador', impostorHint: 'Cerebro' },           // Procesa información
                { gameType: 'impostor', category: 'Objetos', word: 'Teclado', impostorHint: 'Piano' },               // Tiene teclas
                { gameType: 'impostor', category: 'Objetos', word: 'Ratón', impostorHint: 'Mascota' },               // Nombre animal
                { gameType: 'impostor', category: 'Objetos', word: 'Pantalla', impostorHint: 'Ventana' },            // Ves cosas a través de ella
                { gameType: 'impostor', category: 'Objetos', word: 'Impresora', impostorHint: 'Fotocopiadora' },     // Saca papel con tinta
                { gameType: 'impostor', category: 'Objetos', word: 'Auriculares', impostorHint: 'Orejeras' },        // Cubren las orejas
                { gameType: 'impostor', category: 'Objetos', word: 'Cámara', impostorHint: 'Ojo' },                  // Captura imágenes
                { gameType: 'impostor', category: 'Objetos', word: 'Trípode', impostorHint: 'Flamenco' },            // Tres patas largas
                { gameType: 'impostor', category: 'Objetos', word: 'Enchufe', impostorHint: 'Nariz' },               // Dos agujeros (tipo europeo)
                { gameType: 'impostor', category: 'Objetos', word: 'Batería', impostorHint: 'Pila' },                // Energía portátil
                { gameType: 'impostor', category: 'Objetos', word: 'Ventilador', impostorHint: 'Helicóptero' },      // Aspas girando
                { gameType: 'impostor', category: 'Objetos', word: 'Aire Acondicionado', impostorHint: 'Nevera' },   // Echa frío
                { gameType: 'impostor', category: 'Objetos', word: 'Radiador', impostorHint: 'Tostadora' },          // Echa calor
                { gameType: 'impostor', category: 'Objetos', word: 'Lavadora', impostorHint: 'Centrifugadora' },     // Da vueltas con agua
                { gameType: 'impostor', category: 'Objetos', word: 'Secador', impostorHint: 'Pistola' },             // Forma de pistola de aire
                { gameType: 'impostor', category: 'Objetos', word: 'Plancha', impostorHint: 'Barco' },               // Forma y vapor
                { gameType: 'impostor', category: 'Objetos', word: 'Aspiradora', impostorHint: 'Elefante' },         // Trompa que absorbe
                { gameType: 'impostor', category: 'Objetos', word: 'Taladro', impostorHint: 'Pistola' },             // Forma y gatillo
                { gameType: 'impostor', category: 'Objetos', word: 'Sierra', impostorHint: 'Tiburón' },              // Dientes afilados
                { gameType: 'impostor', category: 'Objetos', word: 'Destornillador', impostorHint: 'Llave' },        // Herramienta de giro
                { gameType: 'impostor', category: 'Objetos', word: 'Metro', impostorHint: 'Cinta' },                 // Medir longitud
                { gameType: 'impostor', category: 'Objetos', word: 'Escalera', impostorHint: 'Jirafa' },             // Objeto alto
                { gameType: 'impostor', category: 'Objetos', word: 'Cubo', impostorHint: 'Dado' },                   // Forma geométrica
                { gameType: 'impostor', category: 'Objetos', word: 'Manguera', impostorHint: 'Serpiente' },          // Tubo largo y flexible
                { gameType: 'impostor', category: 'Objetos', word: 'Regadera', impostorHint: 'Ducha' },              // Lluvia artificial
                { gameType: 'impostor', category: 'Objetos', word: 'Rastrillo', impostorHint: 'Tenedor' },           // Puntas para arrastrar
                { gameType: 'impostor', category: 'Objetos', word: 'Pala', impostorHint: 'Cuchara' },                // Cuchara gigante para tierra
                { gameType: 'impostor', category: 'Objetos', word: 'Carretilla', impostorHint: 'Coche' },            // Vehículo de una rueda
                { gameType: 'impostor', category: 'Objetos', word: 'Bicicleta', impostorHint: 'Moto' },              // Dos ruedas
                { gameType: 'impostor', category: 'Objetos', word: 'Patines', impostorHint: 'Coches' },              // Ruedas en los pies
                { gameType: 'impostor', category: 'Objetos', word: 'Monopatín', impostorHint: 'Tabla' },             // Tabla con ruedas
                { gameType: 'impostor', category: 'Objetos', word: 'Casco', impostorHint: 'Sombrero' },              // Protección de cabeza dura
                { gameType: 'impostor', category: 'Objetos', word: 'Pelota', impostorHint: 'Planeta' },              // Esfera
                { gameType: 'impostor', category: 'Objetos', word: 'Raqueta', impostorHint: 'Sartén' },              // Mango y superficie redonda
                { gameType: 'impostor', category: 'Objetos', word: 'Canasta', impostorHint: 'Papelera' },            // Red para encestar
                { gameType: 'impostor', category: 'Objetos', word: 'Portería', impostorHint: 'Jaula' },              // Estructura de red
                { gameType: 'impostor', category: 'Objetos', word: 'Silbato', impostorHint: 'Pájaro' },              // Sonido agudo
                { gameType: 'impostor', category: 'Objetos', word: 'Trofeo', impostorHint: 'Copa' },                 // Premio dorado
                { gameType: 'impostor', category: 'Objetos', word: 'Medalla', impostorHint: 'Moneda' },              // Metal redondo al cuello
                { gameType: 'impostor', category: 'Objetos', word: 'Bandera', impostorHint: 'Capa' },                // Tela que ondea
                { gameType: 'impostor', category: 'Objetos', word: 'Mapa', impostorHint: 'Plano' },                  // Dibujo del terreno
                { gameType: 'impostor', category: 'Objetos', word: 'Brújula', impostorHint: 'Reloj' },               // Aguja en esfera
                { gameType: 'impostor', category: 'Objetos', word: 'Prismáticos', impostorHint: 'Ojos' },            // Extensión de visión
                { gameType: 'impostor', category: 'Objetos', word: 'Telescopio', impostorHint: 'Cañón' },            // Tubo largo apuntando al cielo
                { gameType: 'impostor', category: 'Objetos', word: 'Microscopio', impostorHint: 'Lupa' },            // Ver lo pequeño
                { gameType: 'impostor', category: 'Objetos', word: 'Báscula', impostorHint: 'Juez' },                // Dicta el peso
                { gameType: 'impostor', category: 'Objetos', word: 'Termómetro', impostorHint: 'Mercurio' },         // Mide fiebre
                { gameType: 'impostor', category: 'Objetos', word: 'Jeringuilla', impostorHint: 'Mosquito' },        // Pica y extrae/mete líquido
                { gameType: 'impostor', category: 'Objetos', word: 'Tirita', impostorHint: 'Celuloso' },             // Parche para heridas
                { gameType: 'impostor', category: 'Objetos', word: 'Muleta', impostorHint: 'Pata' },                 // Apoyo extra
                { gameType: 'impostor', category: 'Objetos', word: 'Silla de ruedas', impostorHint: 'Trono' },       // Asiento móvil
                { gameType: 'impostor', category: 'Objetos', word: 'Gafas de sol', impostorHint: 'Antifaz' },        // Ocultan ojos oscuros
                { gameType: 'impostor', category: 'Objetos', word: 'Sombrero', impostorHint: 'Techo' },              // Techo personal
                { gameType: 'impostor', category: 'Objetos', word: 'Bufanda', impostorHint: 'Serpiente' },           // Tela al cuello
                { gameType: 'impostor', category: 'Objetos', word: 'Corbata', impostorHint: 'Soga' },                // Nudo al cuello (oficina)
                { gameType: 'impostor', category: 'Objetos', word: 'Botón', impostorHint: 'Ombligo' },               // Redondo en la ropa
                { gameType: 'impostor', category: 'Objetos', word: 'Cremallera', impostorHint: 'Dientes' },          // Se cierran mordiendo
                { gameType: 'impostor', category: 'Objetos', word: 'Bolsillo', impostorHint: 'Canguro' },            // Saco incorporado
                { gameType: 'impostor', category: 'Objetos', word: 'Cartera', impostorHint: 'Libro' },               // Se abre y guarda papeles/dinero
            ];
        await GameWord.insertMany(initialWords);
        console.log('✅ Base de datos de juegos inicializada.');
    }
};
// Llamar al seeder tras la conexión (puedes ponerlo en el evento 'connected' de messagesDbConnection)
messagesDbConnection.on('connected', () => { seedGameWords(); });


/**
 * @description Esquema de Mongoose para los tickets de contacto.
 * Almacenado en la BD de usuarios.
 */
const contactTicketSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    username: { type: String, trim: true }, // Opcional
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['pendiente', 'completado'], default: 'pendiente', index: true }
}, { timestamps: true });

const ContactTicket = usersDbConnection.model('ContactTicket', contactTicketSchema);


// =================================================================
//  ROUTES
// =================================================================

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 24 * 60 * 60 * 1000; // 24 horas de bloqueo.

/**
 * @route   POST /login
 * @description Autentica a un usuario y crea una sesión. Implementa una política de bloqueo por IP
 * para prevenir ataques de fuerza bruta sin afectar al usuario legítimo desde otra IP.
 * @access  Public
 * @param   {object} req.body - Cuerpo de la petición con `loginIdentifier` (username o email) y `password`.
 * @returns {object} 200 - Mensaje de éxito.
 * @returns {object} 400 - Error de validación, faltan campos.
 * @returns {object} 401 - Credenciales incorrectas.
 * @returns {object} 403 - IP bloqueada o cuenta eliminada.
 * @returns {object} 500 - Error del servidor.
 */
app.post('/login', sensitiveRouteLimiter, verifyTurnstile, async (req, res) => {
    const { loginIdentifier, password } = req.body;
    const ip = req.ip;

    try {
        // Validación inicial de campos.
        if (!loginIdentifier || !password) {
            const errors = {};
            if (!loginIdentifier) errors.loginIdentifier = 'El campo de usuario o email es obligatorio.';
            if (!password) errors.password = 'El campo de contraseña es obligatorio.';
            return res.status(400).json({ errors });
        }

        const identifier = loginIdentifier.toLowerCase();
        
        // 1. Comprobar si la IP/identificador ya está bloqueada.
        const loginAttempt = await LoginAttempt.findOne({ ip, loginIdentifier: identifier });

        if (loginAttempt && loginAttempt.lockoutUntil && loginAttempt.lockoutUntil > Date.now()) {
            const timeLeftMs = loginAttempt.lockoutUntil.getTime() - Date.now();
            const hoursLeft = Math.ceil(timeLeftMs / (1000 * 60 * 60));
            return res.status(403).json({ 
                message: `Demasiados intentos fallidos desde esta red. Por seguridad, el acceso para '${loginIdentifier}' ha sido bloqueado temporalmente. Inténtelo de nuevo en aproximadamente ${hoursLeft} horas.` 
            });
        }
        
        // 2. Buscar al usuario.
        const user = await User.findOne({
            $or: [{ username: loginIdentifier }, { email: identifier }]
        }).select('+password');

        // Si el usuario no existe, se gestiona como un intento fallido para prevenir enumeración.
        if (!user) {
            await LoginAttempt.updateOne({ ip, loginIdentifier: identifier }, { $inc: { attempts: 1 } }, { upsert: true });
            return res.status(401).json({ errors: { loginIdentifier: 'El usuario o email proporcionado no existe.' } });
        }

        // Si el usuario existe, se comprueba la contraseña.
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const currentAttempts = (loginAttempt ? loginAttempt.attempts : 0) + 1;
            
            let update = { $inc: { attempts: 1 } };
            let message = '';
            
            if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
                update.lockoutUntil = new Date(Date.now() + LOCKOUT_TIME);
                message = 'Contraseña incorrecta. Se ha alcanzado el número máximo de intentos. El acceso ha sido bloqueado por 24 horas por seguridad.';
            } else {
                const remainingAttempts = MAX_LOGIN_ATTEMPTS - currentAttempts;
                const attemptText = remainingAttempts > 1 ? 'intentos' : 'intento';
                message = `La contraseña es incorrecta. Te quedan ${remainingAttempts} ${attemptText}.`;
            }

            await LoginAttempt.updateOne({ ip, loginIdentifier: identifier }, update, { upsert: true });

            return res.status(401).json({ errors: { password: message } });
        }
        
        // 3. Comprobar si la cuenta del usuario tiene alguna restricción.
        if (user.userStatus === 'deleted') {
            return res.status(403).json({ message: 'Esta cuenta ha sido eliminada y ya no se puede acceder a ella.' });
        }
        if (user.userStatus === 'banned') {
            return res.status(403).json({ message: 'Esta cuenta ha sido suspendida. Contacta con soporte para más información.' });
        }
        
        // 4. Si el login es exitoso, limpiar el registro de intentos y crear la sesión.
        await LoginAttempt.deleteOne({ ip, loginIdentifier: identifier });

        req.session.userId = user._id;
        res.status(200).json({ message: 'Inicio de sesión exitoso.' });

    } catch (error) {
        console.error('Error en /login:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});


/**
 * @route   POST /register
 * @description Registra un nuevo usuario, incluyendo la subida y procesamiento de imagen de perfil a Cloudinary.
 * @access  Public
 * @param   {object} req.body - Datos del formulario de registro (multipart/form-data).
 * @param   {Express.Multer.File} req.file - Archivo de imagen de perfil subido.
 * @returns {object} 201 - Éxito con el ID de usuario y el PIN de recuperación.
 * @returns {object} 4xx - Errores de validación, conflicto o tamaño de archivo.
 * @returns {object} 500 - Error del servidor.
 */
app.post('/register',
    sensitiveRouteLimiter,
    (req, res, next) => {
        upload.single('profilePicture')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({ message: 'El archivo es demasiado grande. El límite es de 4MB.' });
                }
                return res.status(400).json({ message: `Error al subir el archivo: ${err.message}` });
            } else if (err) {
                return res.status(500).json({ message: `Error desconocido: ${err.message}` });
            }
            next();
        });
    },
    verifyTurnstile,
    async (req, res) => {
    try {
        const {
            firstName, lastName, dateOfBirth,
            username, email, confirmEmail, password, confirmPassword,
            description, acceptsPublicity
        } = req.body;

        // --- Validación de Datos ---
        if (!firstName || !lastName || !username || !email || !password || !confirmPassword || !dateOfBirth) {
            return res.status(400).json({ errors: { general: 'Faltan campos por rellenar.' } });
        }

        const nameRegex = /^[\p{L}\s]+$/u;
        if (!nameRegex.test(firstName)) return res.status(400).json({ errors: { firstName: 'El nombre solo puede contener letras y espacios.' } });
        if (!nameRegex.test(lastName)) return res.status(400).json({ errors: { lastName: 'Los apellidos solo pueden contener letras y espacios.' } });
        if (username.length < 3 || username.length > 20) return res.status(400).json({ errors: { username: 'El nombre de usuario debe tener entre 3 y 20 caracteres.' } });
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) return res.status(400).json({ errors: { email: 'Por favor, introduce un formato de email válido.' } });
        if (email !== confirmEmail) return res.status(400).json({ errors: { confirmEmail: 'Los emails no coinciden.' } });
        if (password.length < 6) return res.status(400).json({ errors: { password: 'La contraseña debe tener al menos 6 caracteres.' } });
        if (password !== confirmPassword) return res.status(400).json({ errors: { confirmPassword: 'Las contraseñas no coinciden.' } });
        const birthDate = new Date(dateOfBirth);
        const minDate = new Date(); minDate.setHours(0,0,0,0); minDate.setFullYear(minDate.getFullYear() - 110);
        const maxDate = new Date(); maxDate.setHours(0,0,0,0); maxDate.setFullYear(maxDate.getFullYear() - 16);
        if (isNaN(birthDate.getTime()) || birthDate > maxDate || birthDate < minDate) return res.status(400).json({ errors: { dateOfBirth: 'La fecha de nacimiento proporcionada no es válida o eres demasiado joven para registrarte.' }});
        
        // Hashing de la contraseña y el PIN de recuperación.
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const plainTextRecoveryPIN = crypto.randomBytes(8).toString('hex').toUpperCase();
        const hashedRecoveryPIN = await bcrypt.hash(plainTextRecoveryPIN, salt);

        const newUser = new User({
            firstName, lastName, dateOfBirth,
            username, email, password: hashedPassword, recoveryPIN: hashedRecoveryPIN,
            description, acceptsPublicity: !!acceptsPublicity,
        });
        await newUser.save();

        // Asignación de imagen de perfil: subida por el usuario o una aleatoria por defecto.
        if (req.file) {
            // Si el usuario sube una imagen, se procesa y se sube a Cloudinary.
            const processedImageBuffer = await sharp(req.file.buffer)
                .resize(400, 400, { fit: 'fill' })
                .webp({ quality: 80 })
                .toBuffer();

            const uploadPromise = new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        public_id: newUser._id.toString(),
                        type: "private",
                        overwrite: true,
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(processedImageBuffer);
            });

            const uploadResult = await uploadPromise;
            newUser.profilePicturePublicId = uploadResult.public_id;
            await newUser.save();
        } else {
            // Si el usuario no sube una imagen, se le asigna una de las 10 predefinidas de forma aleatoria.
            const NUM_DEFAULT_AVATARS = 10;
            const randomIndex = Math.floor(Math.random() * NUM_DEFAULT_AVATARS) + 1;
            const defaultAvatarPath = path.join(__dirname, 'public', 'images', 'user_img', `user${randomIndex}.webp`);

            try {
                // Se sube una copia del avatar por defecto a Cloudinary con el ID del nuevo usuario como public_id.
                const uploadResult = await cloudinary.uploader.upload(defaultAvatarPath, {
                    public_id: newUser._id.toString(),
                    type: "private",
                    overwrite: true,
                    resource_type: 'image'
                });

                // Se guarda la referencia (el public_id) en el documento del usuario.
                newUser.profilePicturePublicId = uploadResult.public_id;
                await newUser.save();
            } catch (uploadError) {
                // Si la subida del avatar por defecto falla, no se bloquea el registro.
                // Se registrará el error en el servidor para su futura revisión.
                console.error(`Error al subir el avatar por defecto para el usuario ${newUser._id}:`, uploadError);
            }
        }

        res.status(201).json({
            message: '¡Usuario registrado con éxito! Se ha generado un PIN de recuperación único. Anótelo en un lugar seguro para poder recuperar su cuenta en caso de pérdida.',
            userId: newUser._id,
            recoveryPIN: plainTextRecoveryPIN
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ errors });
        }
        
        if (error.code === 11000) {
            if (error.keyPattern.username || error.keyPattern.email) {
                 return res.status(409).json({ errors: { general: 'El nombre de usuario o el email ya están en uso. Por favor, elige otros diferentes.' }});
            }
            if (error.keyPattern.recoveryPIN) return res.status(500).json({ message: 'Error al generar datos únicos. Inténtalo de nuevo.' });
        }

        console.error('Error en /register:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

/**
 * @route   POST /logout
 * @description Cierra la sesión del usuario actual destruyendo la sesión en el servidor y limpiando la cookie del cliente.
 * @access  Private (implícito por requerir una sesión para destruir)
 * @returns {object} 200 - Mensaje de éxito.
 * @returns {object} 500 - Error del servidor.
 */
app.post('/logout', actionLimiter, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error en /logout:', err);
            return res.status(500).json({ message: 'No se pudo cerrar la sesión.' });
        }
        res.clearCookie('connect.sid'); // Limpia la cookie de sesión del cliente.
        res.status(200).json({ message: 'Sesión cerrada con éxito.' });
    });
});


// =================================================================
//  API ROUTES
// =================================================================

/**
 * @route   POST /api/contact
 * @description Recibe y guarda un nuevo ticket de contacto desde el formulario público.
 * @access  Public
 * @param {object} req.body - Datos del formulario de contacto.
 * @returns {object} 201 - Mensaje de éxito.
 * @returns {object} 400 - Errores de validación.
 * @returns {object} 500 - Error del servidor.
 */
app.post('/api/contact', actionLimiter, async (req, res) => {
    try {
        const { name, email, username, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Los campos nombre, email, asunto y mensaje son obligatorios.' });
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Por favor, introduce un formato de email válido.' });
        }

        const newTicket = new ContactTicket({
            name,
            email,
            username: username || 'No especificado',
            subject,
            message
        });

        await newTicket.save();

        res.status(201).json({ message: 'Tu mensaje ha sido enviado con éxito. Nos pondremos en contacto contigo pronto.' });

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Los datos proporcionados no son válidos. Revisa las longitudes de los campos.' });
        }
        console.error('Error en /api/contact:', error);
        res.status(500).json({ message: 'Error en el servidor al procesar tu solicitud.' });
    }
});


/**
 * @route   POST /api/users/reset-password
 * @description Permite a un usuario restablecer su contraseña utilizando su email y PIN de recuperación.
 * @access  Public
 * @param   {object} req.body - Cuerpo de la petición.
 * @param   {string} req.body.email - El email del usuario.
 * @param   {string} req.body.recoveryPIN - El PIN de recuperación único del usuario.
 * @param   {string} req.body.newPassword - La nueva contraseña deseada.
 * @param   {string} req.body.confirmPassword - La confirmación de la nueva contraseña.
 * @returns {object} 200 - Mensaje de éxito.
 * @returns {object} 400 - Errores de validación (campos faltantes, contraseñas no coinciden, etc.).
 * @returns {object} 401 - El email o el PIN de recuperación son incorrectos.
 * @returns {object} 500 - Error del servidor.
 */
app.post('/api/users/reset-password', sensitiveRouteLimiter, async (req, res) => {
    const { email, recoveryPIN, newPassword, confirmPassword } = req.body;

    try {
        // --- Validación de la Petición ---
        if (!email || !recoveryPIN || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
        }

        // --- Búsqueda y Verificación del Usuario ---
        const user = await User.findOne({ email: email.toLowerCase() }).select('+recoveryPIN +password');

        // Mensaje de error genérico para prevenir la enumeración de usuarios.
        const genericError = 'El email o el PIN de recuperación son incorrectos.';

        if (!user) {
            return res.status(401).json({ message: genericError });
        }

        const isPinMatch = await bcrypt.compare(recoveryPIN, user.recoveryPIN);
        if (!isPinMatch) {
            return res.status(401).json({ message: genericError });
        }
        
        // --- Actualización de la Contraseña ---
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la anterior.' });
        }

        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });

    } catch (error) {
        console.error('Error en /api/users/reset-password:', error);
        res.status(500).json({ message: 'Error en el servidor al restablecer la contraseña.' });
    }
});


/**
 * @route   GET /api/profile
 * @description Obtiene los datos del perfil del usuario actualmente autenticado.
 * @access  Private (requiere `isAuthenticated` middleware)
 * @returns {object} 200 - Objeto con los datos del perfil del usuario.
 * @returns {object} 401 - No autenticado.
 * @returns {object} 404 - Usuario no encontrado en la BD (sesión podría ser inválida).
 * @returns {object} 500 - Error del servidor.
 */
app.get('/api/profile', apiLimiter, isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
            .select('firstName lastName username email description profilePicturePublicId role userStatus createdAt')
            .lean();

        if (!user) {
            // Si el usuario no se encuentra, destruye la sesión corrupta por seguridad.
            req.session.destroy();
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Genera la URL de la imagen de perfil (firmada si es de Cloudinary).
        user.profilePicturePath = getProfilePictureUrl(user.profilePicturePublicId);

        res.status(200).json(user);

    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

/**
 * @route   PATCH /api/profile
 * @description Actualiza el perfil del usuario autenticado (username, descripción y/o foto de perfil).
 * @access  Private (requiere `isAuthenticated` middleware)
 * @param {object} req.body - Cuerpo de la petición (multipart/form-data).
 * @param {string} [req.body.username] - El nuevo nombre de usuario.
 * @param {string} [req.body.description] - La nueva descripción.
 * @param {Express.Multer.File} [req.file] - El nuevo archivo de imagen de perfil (campo `profilePicture`).
 * @returns {object} 200 - Éxito con los datos del usuario actualizados.
 * @returns {object} 4xx - Errores de validación, conflicto o tamaño de archivo.
 * @returns {object} 500 - Error del servidor.
 */
app.patch('/api/profile',
    actionLimiter,
    isAuthenticated,
    (req, res, next) => {
        upload.single('profilePicture')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).json({ message: 'El archivo es demasiado grande. El límite es de 4MB.' });
                }
                return res.status(400).json({ message: `Error al subir el archivo: ${err.message}` });
            } else if (err) {
                return res.status(500).json({ message: `Error desconocido al procesar el archivo: ${err.message}` });
            }
            next();
        });
    },
    async (req, res) => {
        const { username, description } = req.body;
        const userId = req.session.userId;

        try {
            if (!username && description === undefined && !req.file) {
                return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
            }

            const errors = {};
            if (username && (username.length < 3 || username.length > 20)) errors.username = 'El nombre de usuario debe tener entre 3 y 20 caracteres.';
            if (description && description.length > 300) errors.description = 'La descripción no puede exceder los 300 caracteres.';
            if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

            if (username) {
                const existingUser = await User.findOne({ username: username, _id: { $ne: userId } });
                if (existingUser) return res.status(409).json({ errors: { username: 'Este nombre de usuario ya está en uso.' } });
            }

            const updateData = {};
            if (username) updateData.username = username;
            if (description !== undefined) updateData.description = description;

            if (req.file) {
                const processedImageBuffer = await sharp(req.file.buffer)
                    .resize(400, 400, { fit: 'fill' })
                    .webp({ quality: 80 })
                    .toBuffer();

                const uploadPromise = new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            public_id: userId.toString(),
                            type: "private",
                            overwrite: true,
                            resource_type: 'image'
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(processedImageBuffer);
                });

                const uploadResult = await uploadPromise;
                updateData.profilePicturePublicId = uploadResult.public_id;
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('firstName lastName username email description profilePicturePublicId role createdAt').lean();
            
            updatedUser.profilePicturePath = getProfilePictureUrl(updatedUser.profilePicturePublicId);

            res.status(200).json({
                message: 'Perfil actualizado con éxito.',
                user: updatedUser
            });

        } catch (error) {
            console.error('Error en PATCH /api/profile:', error);
            if (error.name === 'ValidationError') {
                const validationErrors = {};
                for (let field in error.errors) {
                    validationErrors[field] = error.errors[field].message;
                }
                return res.status(400).json({ errors: validationErrors });
            }
            res.status(500).json({ message: 'Error en el servidor al actualizar el perfil.' });
        }
    }
);

/**
 * @route   DELETE /api/profile
 * @description Realiza un "soft delete" del usuario. Esto cambia su estado a 'deleted',
 * anonimiza sus datos, elimina su imagen de Cloudinary, y sus likes/reportes. 
 * Requiere el PIN de recuperación como medida de seguridad.
 * @access  Private (requiere `isAuthenticated` middleware)
 * @param {object} req.body - Cuerpo de la petición.
 * @param {string} req.body.recoveryPIN - El PIN de recuperación del usuario para confirmar la acción.
 * @returns {object} 200 - Mensaje de éxito.
 * @returns {object} 400 - PIN de recuperación no proporcionado.
 * @returns {object} 403 - El PIN de recuperación es incorrecto.
 * @returns {object} 404 - Usuario no encontrado.
 * @returns {object} 500 - Error del servidor.
 */
app.delete('/api/profile', actionLimiter, isAuthenticated, async (req, res) => {
    const userId = req.session.userId;
    const { recoveryPIN } = req.body;

    try {
        if (!recoveryPIN) {
            return res.status(400).json({ message: 'Se requiere el PIN de recuperación para eliminar la cuenta.' });
        }

        const user = await User.findById(userId).select('+recoveryPIN profilePicturePublicId');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const isPinMatch = await bcrypt.compare(recoveryPIN, user.recoveryPIN);
        if (!isPinMatch) {
            return res.status(403).json({ message: 'El PIN de recuperación proporcionado es incorrecto.' });
        }

        const existingDeletedUser = await User.findOne({ email: `${user.email}_deleted`, userStatus: 'deleted' });
        if (existingDeletedUser) {
            return res.status(409).json({ message: 'Fallo al eliminar cuenta. Has eliminado otra cuenta hace poco' });
        }
        
        await Message.updateMany({ likes: userId }, { $pull: { likes: userId } });
        await Message.updateMany({ reportedBy: userId }, { $pull: { reportedBy: userId } });

        // Eliminar la imagen de Cloudinary si existe.
        if (user.profilePicturePublicId) {
            await cloudinary.uploader.destroy(user.profilePicturePublicId, { resource_type: 'image', type: 'private' });
        }

        const anonymizedEmail = `${user.email}_deleted`;
        const anonymizedUsername = `Usuario_Eliminado_${user._id}`;

        await User.findByIdAndUpdate(userId, {
            $set: {
                userStatus: 'deleted',
                firstName: 'Usuario',
                lastName: 'Eliminado',
                username: anonymizedUsername,
                email: anonymizedEmail,
                description: '',
                profilePicturePublicId: undefined,
                password: undefined,
                recoveryPIN: undefined
            }
        });

        req.session.destroy(err => {
            if (err) {
                console.error('Error al destruir la sesión tras el soft-delete:', err);
                return res.status(500).json({ message: 'Cuenta eliminada, pero hubo un error al cerrar la sesión.' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Tu cuenta ha sido eliminada correctamente.' });
        });

    } catch (error) {
        console.error(`Error en el soft-delete para el usuario ${userId}:`, error);
        res.status(500).json({ message: 'Ocurrió un error en el servidor al intentar eliminar tu cuenta.' });
    }
});

/**
 * @route   GET /api/messages
 * @description Obtiene una lista paginada de mensajes activos del foro.
 * @access  Public
 * @param {object} req.query - Parámetros de la consulta.
 * @param {number} [req.query.page=1] - El número de página a obtener.
 * @param {number} [req.query.limit=10] - El número de mensajes por página.
 * @returns {object} 200 - Objeto con un array de `messages` e información de paginación (`totalPages`, `currentPage`).
 * @returns {object} 500 - Error del servidor.
 */
app.get('/api/messages', apiLimiter, async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ messageStatus: 'active' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'sender',
                model: User,
                select: 'username profilePicturePublicId'
            })
            .populate('referencedMessage', 'title _id messageStatus')
            .lean({ virtuals: true });

        const processedMessages = messages.map(message => {
            if (message.sender) {
                message.sender.profilePicturePath = getProfilePictureUrl(message.sender.profilePicturePublicId);
            } else {
                message.sender = {
                    username: 'Usuario Eliminado',
                    profilePicturePath: DEFAULT_AVATAR_PATH
                };
            }
            const isLiked = req.session.userId ? message.likes?.some(like => like.toString() === req.session.userId.toString()) || false : false;
            const isReported = req.session.userId ? message.reportedBy?.some(reporterId => reporterId.toString() === req.session.userId.toString()) || false : false;

            return { ...message, isLiked, isReported };
        });

        const totalMessages = await Message.countDocuments({ messageStatus: 'active' });

        res.status(200).json({
            messages: processedMessages,
            totalPages: Math.ceil(totalMessages / limit),
            currentPage: page
        });

    } catch (error) {
        console.error('Error en GET /api/messages:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener los mensajes.' });
    }
});

/**
 * @route   POST /api/messages
 * @description Crea un nuevo mensaje en el foro.
 * @access  Private (requiere `isAuthenticated` middleware)
 * @param {object} req.body - Cuerpo de la petición.
 * @param {string} req.body.title - El título del mensaje (entre 3 y 100 caracteres).
 * @param {string} req.body.content - El contenido del mensaje (entre 10 y 1500 caracteres).
 * @param {string} [req.body.hashtags] - Cadena con hashtags separados por espacios (ej: "#tag1 #tag2").
 * @returns {object} 201 - El mensaje recién creado, populado con los datos del autor.
 * @returns {object} 400 - Error de validación (campos vacíos o exceden longitud).
 * @returns {object} 403 - El usuario tiene el estado 'banned' y no puede publicar.
 * @returns {object} 500 - Error del servidor.
 */
app.post('/api/messages', actionLimiter, isAuthenticated, async (req, res) => {
    try {
        const { title, content, hashtags } = req.body;

        const user = await User.findById(req.session.userId).select('userStatus');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        if (user.userStatus === 'banned') {
            return res.status(403).json({ message: 'Tu cuenta ha sido suspendida. No puedes publicar mensajes.' });
        }

        if (!title || title.trim().length === 0) return res.status(400).json({ message: 'El título es obligatorio.' });
        if (!content || content.trim().length === 0) return res.status(400).json({ message: 'El contenido es obligatorio.' });
        if (title.trim().length > 100 || title.trim().length < 3) return res.status(400).json({ message: 'El título debe tener entre 3 y 100 caracteres.' });
        if (content.trim().length > 1500 || content.trim().length < 10) return res.status(400).json({ message: 'El contenido debe tener entre 10 y 1500 caracteres.' });

        const parsedHashtags = hashtags ? hashtags.match(/#(\w+)/g)?.map(h => h.substring(1)) || [] : [];

        const newMessage = new Message({
            title,
            content,
            hashtags: parsedHashtags,
            sender: req.session.userId
        });

        await newMessage.save();

        const populatedMessage = await newMessage.populate({
            path: 'sender',
            model: User,
            select: 'username profilePicturePublicId'
        });

        const responseMessage = populatedMessage.toObject();
        responseMessage.sender.profilePicturePath = getProfilePictureUrl(responseMessage.sender.profilePicturePublicId);

        res.status(201).json(responseMessage);

    } catch (error) {
        console.error('Error en POST /api/messages:', error);
        res.status(500).json({ message: 'Error en el servidor al crear el mensaje.' });
    }
});

/**
 * @route   POST /api/messages/:id/reply
 * @description Crea una respuesta a un mensaje existente.
 * @access  Private (requiere `isAuthenticated` middleware)
 * @param {object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id - El ID del mensaje al que se está respondiendo.
 * @param {object} req.body - Cuerpo de la petición con `title`, `content` y `hashtags`.
 * @returns {object} 201 - La respuesta recién creada.
 * @returns {object} 400 - Error de validación.
 * @returns {object} 403 - Usuario baneado.
 * @returns {object} 404 - Mensaje original o usuario no encontrado.
 * @returns {object} 500 - Error del servidor.
 */
app.post('/api/messages/:id/reply', actionLimiter, isAuthenticated, async (req, res) => {
    const parentMessageId = req.params.id;

    try {
        const { title, content, hashtags } = req.body;

        const [user, parentMessage] = await Promise.all([
            User.findById(req.session.userId).select('userStatus'),
            Message.findById(parentMessageId)
        ]);
        
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
        if (user.userStatus === 'banned') return res.status(403).json({ message: 'Tu cuenta ha sido suspendida. No puedes responder a mensajes.' });
        if (!parentMessage) return res.status(404).json({ message: 'El mensaje al que intentas responder no existe.' });

        if (!title || title.trim().length === 0) return res.status(400).json({ message: 'El título es obligatorio.' });
        if (!content || content.trim().length === 0) return res.status(400).json({ message: 'El contenido es obligatorio.' });
        if (title.trim().length > 100 || title.trim().length < 3) return res.status(400).json({ message: 'El título debe tener entre 3 y 100 caracteres.' });
        if (content.trim().length > 1500 || content.trim().length < 10) return res.status(400).json({ message: 'El contenido debe tener entre 10 y 1500 caracteres.' });

        const parsedHashtags = hashtags ? hashtags.match(/#(\w+)/g)?.map(h => h.substring(1)) || [] : [];
        
        const newReply = new Message({
            title, content,
            hashtags: parsedHashtags,
            sender: req.session.userId,
            referencedMessage: parentMessageId
        });
        await newReply.save();
        
        await Message.updateOne({ _id: parentMessageId }, { $push: { replies: newReply._id } });

        const populatedReply = await newReply.populate({
            path: 'sender',
            model: User,
            select: 'username profilePicturePublicId'
        });
        const responseMessage = populatedReply.toObject();
        responseMessage.sender.profilePicturePath = getProfilePictureUrl(responseMessage.sender.profilePicturePublicId);
        
        res.status(201).json(responseMessage);

    } catch (error) {
        console.error('Error en POST /api/messages/:id/reply:', error);
        res.status(500).json({ message: 'Error en el servidor al crear la respuesta.' });
    }
});


/**
 * @route   DELETE /api/messages/:id
 * @description Realiza un "soft delete" de un mensaje.
 * La acción varía dependiendo de si el solicitante es el autor o un moderador/admin.
 * @access  Private (requiere `isAuthenticated` middleware)
 * @param {object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id - El ID del mensaje a eliminar.
 * @returns {object} 200 - Mensaje de éxito.
 * @returns {object} 403 - Permiso denegado.
 * @returns {object} 404 - Mensaje o usuario no encontrado.
 * @returns {object} 500 - Error del servidor.
 */
app.delete('/api/messages/:id', actionLimiter, isAuthenticated, async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.session.userId;

        const [message, requester] = await Promise.all([
            Message.findById(messageId),
            User.findById(userId).select('role')
        ]);

        if (!message) return res.status(404).json({ message: 'Mensaje no encontrado.' });
        if (!requester) return res.status(404).json({ message: 'Usuario solicitante no encontrado.' });

        const isAuthor = message.sender.toString() === userId.toString();
        const isModeratorOrAdmin = requester.role === 'admin' || requester.role === 'moderator';

        if (!isAuthor && !isModeratorOrAdmin) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este mensaje.' });
        }
        
        if (message.messageStatus !== 'active') {
             return res.status(200).json({ message: 'El mensaje ya ha sido eliminado.' });
        }

        let updateData;
        if (isAuthor) updateData = { messageStatus: 'deleted' }; 
        else if (requester.role === 'moderator') updateData = { messageStatus: 'deletedByModerator', deletedBy: userId };
        else if (requester.role === 'admin') updateData = { messageStatus: 'deletedByAdmin', deletedBy: userId };

        await Message.findByIdAndUpdate(messageId, { $set: updateData });
        res.status(200).json({ message: 'Mensaje eliminado correctamente.' });

    } catch (error) {
        console.error(`Error en DELETE /api/messages/${req.params.id}:`, error);
        res.status(500).json({ message: 'Error en el servidor al eliminar el mensaje.' });
    }
});

/**
 * @route   POST /api/messages/:id/like
 * @description Añade o quita un "like" de un usuario a un mensaje específico.
 * La lógica es de tipo "toggle": si el usuario ya ha dado like, se lo quita; si no, se lo añade.
 * @access  Private (requiere `isAuthenticated` middleware)
 * @param {object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id - El ID del mensaje al que se dará/quitará like.
 * @returns {object} 200 - Objeto con el nuevo contador de likes (`likeCount`) y el estado actual del like para el usuario (`isLiked`).
 * @returns {object} 404 - Mensaje no encontrado.
 * @returns {object} 500 - Error del servidor.
 */
app.post('/api/messages/:id/like', actionLimiter, isAuthenticated, async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.session.userId;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Mensaje no encontrado.' });
        
        const hasLiked = message.likes.some(like => like.equals(userId));
        const update = hasLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };
        
        const updatedMessage = await Message.findByIdAndUpdate(messageId, update, { new: true });

        res.status(200).json({
            likeCount: updatedMessage.likeCount,
            isLiked: !hasLiked
        });

    } catch (error) {
        console.error('Error en POST /api/messages/:id/like:', error);
        res.status(500).json({ message: 'Error en el servidor al procesar el like.' });
    }
});

/**
 * @route   POST /api/messages/:id/report
 * @description Permite a un usuario autenticado reportar un mensaje.
 * Un usuario no puede reportar su propio mensaje. La ID del reportante se añade al array `reportedBy`.
 * @access  Private (requiere `isAuthenticated` middleware)
 * @param {object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id - El ID del mensaje a reportar.
 * @returns {object} 200 - Mensaje de éxito y el nuevo estado de reporte.
 * @returns {object} 403 - Intento de reportar un mensaje propio.
 * @returns {object} 404 - Mensaje no encontrado.
 * @returns {object} 500 - Error del servidor.
 */
app.post('/api/messages/:id/report', actionLimiter, isAuthenticated, async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.session.userId;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: 'Mensaje no encontrado.' });
        if (message.sender.equals(userId)) return res.status(403).json({ message: 'No puedes reportar tus propios mensajes.' });

        await Message.findByIdAndUpdate(messageId, { $addToSet: { reportedBy: userId } });
        
        res.status(200).json({
            message: 'El mensaje ha sido reportado correctamente.',
            isReported: true 
        });

    } catch (error) {
        console.error(`Error en POST /api/messages/${req.params.id}/report:`, error);
        res.status(500).json({ message: 'Error en el servidor al procesar el reporte.' });
    }
});

/**
 * @route   GET /api/messages/counts
 * @description Obtiene los contadores de likes para una lista de IDs de mensajes.
 * Diseñado para ser usado por el frontend para actualizar los contadores mediante polling de manera eficiente.
 * @access  Public
 * @param {object} req.query - Parámetros de la consulta.
 * @param {string} req.query.ids - Una cadena de IDs de mensajes separados por coma.
 * @returns {object} 200 - Un objeto mapeando cada ID de mensaje a su `likeCount`.
 * @returns {object} 400 - Si no se proporcionan IDs.
 * @returns {object} 500 - Error del servidor.
 */
app.get('/api/messages/counts', apiLimiter, async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.status(400).json({ message: 'No se proporcionaron IDs de mensajes.' });

        const messageIds = ids.split(',');
        const messages = await Message.find({ '_id': { $in: messageIds } }).select('_id likes');

        const counts = messages.reduce((acc, msg) => {
            acc[msg._id] = msg.likeCount;
            return acc;
        }, {});

        res.status(200).json(counts);

    } catch (error) {
        console.error('Error en GET /api/messages/counts:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener los contadores.' });
    }
});

/**
 * @route   GET /api/messages/:id
 * @description Obtiene un mensaje específico por su ID. No popula las respuestas.
 * @access  Public
 * @param {object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id - El ID del mensaje a obtener.
 * @returns {object} 200 - Objeto con los datos del mensaje principal.
 * @returns {object} 404 - Mensaje no encontrado o no está activo.
 * @returns {object} 500 - Error del servidor.
 */
app.get('/api/messages/:id', apiLimiter, async (req, res) => {
    try {
        const { id: messageId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(404).json({ message: 'El formato del ID del mensaje no es válido.' });
        }
        
        const message = await Message.findOne({ _id: messageId, messageStatus: 'active' })
            .populate({
                path: 'sender',
                model: User,
                select: 'username profilePicturePublicId'
            })
            .populate('referencedMessage', 'title _id messageStatus')
            .lean({ virtuals: true });

        if (!message) return res.status(404).json({ message: 'Mensaje no encontrado o ha sido eliminado.' });

        if (message.sender) {
            message.sender.profilePicturePath = getProfilePictureUrl(message.sender.profilePicturePublicId);
        } else {
            message.sender = { username: 'Usuario Eliminado', profilePicturePath: DEFAULT_AVATAR_PATH };
        }
        message.isLiked = req.session.userId ? message.likes?.some(like => like.toString() === req.session.userId.toString()) || false : false;
        message.isReported = req.session.userId ? message.reportedBy?.some(reporterId => reporterId.toString() === req.session.userId.toString()) || false : false;
        
        res.status(200).json(message);

    } catch (error) {
        console.error(`Error en GET /api/messages/${req.params.id}:`, error);
        res.status(500).json({ message: 'Error en el servidor al obtener el mensaje.' });
    }
});

/**
 * @route   GET /api/messages/:id/replies
 * @description Obtiene una lista paginada de las respuestas de un mensaje específico.
 * @access  Public
 * @param {object} req.params - Parámetros de la ruta.
 * @param {string} req.params.id - El ID del mensaje padre.
 * @param {object} req.query - Parámetros de consulta para la paginación.
 * @param {number} [req.query.page=1] - El número de página de respuestas a obtener.
 * @param {number} [req.query.limit=10] - El número de respuestas por página.
 * @returns {object} 200 - Objeto de paginación con un array de respuestas (`docs`).
 * @returns {object} 404 - Mensaje padre no encontrado.
 * @returns {object} 500 - Error del servidor.
 */
app.get('/api/messages/:id/replies', apiLimiter, async (req, res) => {
    try {
        const { id: parentMessageId } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const parentMessage = await Message.findOne({ _id: parentMessageId, messageStatus: 'active' }).select('replies');
        if (!parentMessage) return res.status(404).json({ message: 'El mensaje principal no fue encontrado.' });

        const totalReplies = parentMessage.replies.length;
        const totalPages = Math.ceil(totalReplies / limit);
        let docs = [];

        if (totalReplies > 0 && page <= totalPages) {
            const replyIdsOnPage = parentMessage.replies.slice(skip, skip + limit);
            
            const replies = await Message.find({ '_id': { $in: replyIdsOnPage }, 'messageStatus': 'active' })
                .populate({ path: 'sender', model: User, select: 'username profilePicturePublicId' })
                .populate('referencedMessage', 'title _id messageStatus')
                .sort({ createdAt: 'asc' })
                .lean({ virtuals: true });
            
            docs = replies.map(reply => {
                if (reply.sender) {
                    reply.sender.profilePicturePath = getProfilePictureUrl(reply.sender.profilePicturePublicId);
                } else {
                    reply.sender = { username: 'Usuario Eliminado', profilePicturePath: DEFAULT_AVATAR_PATH };
                }
                reply.isLiked = req.session.userId ? reply.likes?.some(like => like.toString() === req.session.userId.toString()) || false : false;
                reply.isReported = req.session.userId ? reply.reportedBy?.some(reporterId => reporterId.toString() === req.session.userId.toString()) || false : false;
                return reply;
            });
        }
        
        res.status(200).json({ docs, totalPages, currentPage: page });

    } catch (error) {
        console.error(`Error en GET /api/messages/${req.params.id}/replies:`, error);
        res.status(500).json({ message: 'Error en el servidor al obtener las respuestas.' });
    }
});


/**
 * @route   GET /api/users/username/:username
 * @description Obtiene los datos del perfil PÚBLICO de un usuario por su nombre de usuario.
 * Si el solicitante es un moderador o administrador, puede incluir datos de moderación adicionales.
 * @access  Public (con datos privados para roles autorizados)
 * @param {object} req.params - Parámetros de la ruta.
 * @param {string} req.params.username - El nombre de usuario a consultar.
 * @param {object} req.query - Parámetros de la consulta.
 * @param {boolean} [req.query.include_moderation] - Si es `true`, intenta incluir datos de moderación (strikes).
 * @returns {object} 200 - Objeto con los datos del perfil del usuario.
 * @returns {object} 404 - Usuario no encontrado.
 * @returns {object} 410 - El usuario ha sido eliminado (Gone).
 * @returns {object} 500 - Error del servidor.
 */
app.get('/api/users/username/:username', apiLimiter, async (req, res) => {
    try {
        const { username } = req.params;
        let fieldsToSelect = 'firstName lastName username description profilePicturePublicId createdAt role userStatus';
        let requesterIsModeratorOrAdmin = false;

        if (req.query.include_moderation === 'true' && req.session.userId) {
            const requester = await User.findById(req.session.userId).select('role');
            if (requester && (requester.role === 'admin' || requester.role === 'moderator')) {
                requesterIsModeratorOrAdmin = true;
            }
        }
        if (requesterIsModeratorOrAdmin) {
            fieldsToSelect += ' strikes';
        }
        
        const user = await User.findOne({ username: username }).select(fieldsToSelect).lean();

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
        if (user.userStatus === 'deleted') return res.status(410).json({ message: 'Este usuario ha sido eliminado.' });

        user.profilePicturePath = getProfilePictureUrl(user.profilePicturePublicId);
        res.status(200).json(user);

    } catch (error) {
        console.error(`Error al obtener el perfil público por username ${req.params.username}:`, error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

/**
 * @route   PATCH /api/users/:username/admin-update
 * @description Actualiza el rol, estado o strikes de un usuario. Requiere privilegios de moderador/admin.
 * Incluye una lógica de jerarquía para prevenir que los moderadores modifiquen a otros moderadores/admins
 * o que alguien se modifique a sí mismo.
 * @access  Private (Moderator/Admin, requiere `isAuthenticated` y `isModeratorOrAdmin` middlewares)
 * @param {object} req.params - Parámetros de la ruta.
 * @param {string} req.params.username - El nombre de usuario a modificar.
 * @param {object} req.body - Cuerpo de la petición con los campos a actualizar.
 * @param {string} [req.body.role] - El nuevo rol ('user', 'moderator', 'admin'). Solo modificable por un admin.
 * @param {string} [req.body.userStatus] - El nuevo estado ('active', 'verified', 'banned'). Solo modificable por un admin.
 * @param {number} [req.body.strikes] - El nuevo número de strikes. Modificable por moderador y admin.
 * @returns {object} 200 - El objeto del usuario actualizado.
 * @returns {object} 4xx - Errores de permisos, validación o usuario no encontrado.
 * @returns {object} 500 - Error del servidor.
 */
app.patch('/api/users/:username/admin-update', actionLimiter, isAuthenticated, isModeratorOrAdmin, async (req, res) => {
    try {
        const { username } = req.params;
        const { role, strikes, userStatus } = req.body;
        const requesterRole = req.userRole;

        const userToUpdate = await User.findOne({ username: username });
        if (!userToUpdate) return res.status(404).json({ message: 'Usuario a actualizar no encontrado.' });
        
        if (userToUpdate._id.toString() === req.session.userId) return res.status(403).json({ message: 'No puedes realizar acciones de moderación sobre tu propia cuenta.' });
        if (requesterRole === 'admin' && userToUpdate.role === 'admin') return res.status(403).json({ message: 'Un administrador no puede modificar a otro administrador.' });
        if (requesterRole === 'moderator' && (userToUpdate.role === 'admin' || userToUpdate.role === 'moderator')) return res.status(403).json({ message: 'Los moderadores no tienen permisos para modificar a otros moderadores o administradores.' });

        const updateData = {};
        if (strikes !== undefined) {
            const strikesAsNumber = Number(strikes);
            if (isNaN(strikesAsNumber) || strikesAsNumber < 0) return res.status(400).json({ message: 'Los strikes deben ser un número no negativo.' });
            updateData.strikes = strikesAsNumber;
        }
        
        if (requesterRole === 'admin') {
            if (role) {
                const validRoles = ['user', 'moderator', 'admin'];
                if (!validRoles.includes(role)) return res.status(400).json({ message: 'El rol proporcionado no es válido.' });
                updateData.role = role;
            }
            if (userStatus) {
                const validStatuses = ['active', 'verified', 'banned'];
                if (!validStatuses.includes(userStatus)) return res.status(400).json({ message: 'El estado proporcionado no es válido.' });
                updateData.userStatus = userStatus;
            }
        }
        
        if (Object.keys(updateData).length === 0) return res.status(400).json({ message: 'No se proporcionaron datos válidos para actualizar.' });

        const updatedUser = await User.findOneAndUpdate({ username: username }, { $set: updateData }, { new: true })
            .select('firstName lastName username description profilePicturePublicId createdAt role strikes userStatus');
        
        res.status(200).json({ message: 'Usuario actualizado correctamente.', user: updatedUser });

    } catch (error) {
        console.error(`Error en PATCH /api/users/${req.params.username}/admin-update:`, error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el usuario.' });
    }
});

/**
 * @function buildDateFilter
 * @description Construye un objeto de filtro de fecha para consultas de Mongoose.
 * @param {string} dateRange - El rango de fecha ('day', 'week', 'month', 'all').
 * @returns {object|null} Un objeto de filtro de Mongoose o null si el rango es 'all'.
 */
function buildDateFilter(dateRange) {
    const now = new Date();
    switch (dateRange) {
        case 'day':
            return { $gte: new Date(now.setDate(now.getDate() - 1)) };
        case 'week':
            return { $gte: new Date(now.setDate(now.getDate() - 7)) };
        case 'month':
            return { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        case 'all':
        default:
            return null;
    }
}

/**
 * @function processMessagesForClient
 * @description Procesa una lista de mensajes para prepararlos antes de enviarlos al cliente.
 * Añade la URL de la imagen de perfil y el estado de 'like' del usuario actual.
 * @param {Array<object>} messages - La lista de mensajes de la base de datos.
 * @param {string|null} sessionUserId - El ID del usuario de la sesión actual.
 * @returns {Array<object>} La lista de mensajes procesada.
 */
function processMessagesForClient(messages, sessionUserId) {
    return messages.map(message => {
        if (message.sender && message.sender.username) {
            message.sender.profilePicturePath = getProfilePictureUrl(message.sender.profilePicturePublicId);
        } else {
            message.sender = {
                username: 'Usuario Eliminado',
                profilePicturePath: DEFAULT_AVATAR_PATH
            };
        }
        const isLiked = sessionUserId ? message.likes?.some(like => like.toString() === sessionUserId.toString()) || false : false;
        const isReported = sessionUserId ? message.reportedBy?.some(reporterId => reporterId.toString() === sessionUserId.toString()) || false : false;

        return { ...message, isLiked, isReported };
    });
}


/**
 * @route   GET /api/search
 * @description Realiza búsquedas de mensajes, hashtags y usuarios. También devuelve mensajes en tendencia.
 * @access  Public
 * @param {object} req.query - Parámetros de la consulta.
 * @param {string} [req.query.q=''] - El término de búsqueda. Si está vacío, devuelve mensajes en tendencia.
 * @param {string} [req.query.sort='relevance'] - Criterio de ordenación ('relevance', 'likes_desc', 'likes_asc', 'date_desc', 'date_asc').
 * @param {string} [req.query.dateRange='all'] - Rango de fechas ('day', 'week', 'month', 'all').
 * @param {number} [req.query.page=1] - El número de página a obtener.
 * @param {number} [req.query.limit=10] - El número de resultados por página.
 * @returns {object} 200 - Objeto con los resultados de la búsqueda y la paginación.
 * @returns {object} 500 - Error del servidor.
 */
app.get('/api/search', apiLimiter, async (req, res) => {
    try {
        const { q = '', sort = 'relevance', dateRange = 'all' } = req.query;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        if (q.startsWith('@')) {
            const usernameQuery = q.substring(1);
            const sanitizedUsername = usernameQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            
            // La búsqueda de perfiles de usuario solo se realiza en la primera página de resultados.
            let processedUsers = [];
            if (page === 1) {
                const users = await User.find({ 
                    username: { $regex: sanitizedUsername, $options: 'i' },
                    userStatus: { $in: ['active', 'verified'] }
                }).select('username firstName lastName profilePicturePublicId').limit(5).lean();

                processedUsers = users.map(user => {
                    user.profilePicturePath = getProfilePictureUrl(user.profilePicturePublicId);
                    return user;
                });
            }
            
            const exactUser = await User.findOne({ username: { $regex: `^${sanitizedUsername}$`, $options: 'i' }});
            let messages = [];
            let totalMessages = 0;
            
            if (exactUser) {
                messages = await Message.find({ sender: exactUser._id, messageStatus: 'active' })
                    .sort({ createdAt: -1 }).skip(skip).limit(limit)
                    .populate({ path: 'sender', model: User, select: 'username profilePicturePublicId' })
                    .lean({ virtuals: true });
                totalMessages = await Message.countDocuments({ sender: exactUser._id, messageStatus: 'active' });
            }

            return res.status(200).json({
                searchType: 'user',
                users: processedUsers,
                messages: processMessagesForClient(messages, req.session.userId),
                totalPages: Math.ceil(totalMessages / limit),
                currentPage: page
            });
        }

        let matchStage = { messageStatus: 'active' };
        let sortStage = {};

        const dateFilter = buildDateFilter(dateRange);
        if (dateFilter) matchStage.createdAt = dateFilter;

        if (q) {
            const sanitizedQuery = q.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            if (q.startsWith('#')) {
                matchStage.hashtags = sanitizedQuery.substring(1).toLowerCase();
            } else {
                matchStage.$text = { $search: sanitizedQuery };
            }
        } else if (sort === 'relevance') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            matchStage.createdAt = { $gte: oneMonthAgo };
        }
        
        switch (sort) {
            case 'likes_desc': sortStage = { likeCount: -1, createdAt: -1 }; break;
            case 'likes_asc': sortStage = { likeCount: 1, createdAt: -1 }; break;
            case 'date_desc': sortStage = { createdAt: -1 }; break;
            case 'date_asc': sortStage = { createdAt: 1 }; break;
            case 'relevance':
            default:
                sortStage = q ? { likeCount: -1, createdAt: -1 } : { trendScore: -1, createdAt: -1 };
                break;
        }

        const countPipeline = [{ $match: matchStage }, { $count: 'total' }];
        const totalCountResult = await Message.aggregate(countPipeline);
        const totalMessages = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
        
        let idAggregation = [
            { $match: matchStage },
            { $addFields: { likeCount: { $size: "$likes" } } }
        ];
        if (!q && sort === 'relevance') {
            idAggregation.push({ $addFields: { trendScore: { $add: ["$likeCount", { $size: "$replies" }] } } });
        }
        idAggregation.push({ $sort: sortStage }, { $skip: skip }, { $limit: limit }, { $project: { _id: 1 } });
        
        const sortedMessageDocs = await Message.aggregate(idAggregation);
        const messageIds = sortedMessageDocs.map(doc => doc._id);
        
        if (messageIds.length === 0) {
            return res.status(200).json({ messages: [], totalPages: 0, currentPage: page });
        }

        const messages = await Message.find({ _id: { $in: messageIds } })
            .populate({ path: 'sender', model: User, select: 'username profilePicturePublicId' })
            .populate('referencedMessage', 'title _id messageStatus')
            .lean({ virtuals: true });
            
        const sortedMessages = messageIds.map(id => messages.find(msg => msg._id.toString() === id.toString())).filter(Boolean);

        res.status(200).json({
            searchType: 'messages',
            messages: processMessagesForClient(sortedMessages, req.session.userId),
            totalPages: Math.ceil(totalMessages / limit),
            currentPage: page
        });

    } catch (error) {
        console.error('Error en GET /api/search:', error);
        res.status(500).json({ message: 'Error en el servidor al realizar la búsqueda.' });
    }
});

/**
 * @route   POST /api/games/impostor/init
 * @description Inicializa una partida obteniendo una palabra aleatoria basada en categorías.
 * @access  Private
 */
app.post('/api/games/impostor/init', apiLimiter, isAuthenticated, async (req, res) => {
    try {
        const { categories } = req.body; // Array de categorías seleccionadas
        
        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({ message: 'Debes seleccionar al menos una categoría.' });
        }

        // Obtener una palabra aleatoria que coincida con las categorías
        const query = { 
            category: { $in: categories },
            gameType: 'impostor' 
        };

        const count = await GameWord.countDocuments(query);
        
        if (count === 0) {
            return res.status(404).json({ message: 'No hay palabras disponibles para estas categorías en el juego El Impostor.' });
        }

        const random = Math.floor(Math.random() * count);
        const selectedWord = await GameWord.findOne({ category: { $in: categories } }).skip(random);

        res.status(200).json({
            category: selectedWord.category,
            word: selectedWord.word,
            impostorHint: selectedWord.impostorHint
        });

    } catch (error) {
        console.error('Error en /api/games/impostor/init:', error);
        res.status(500).json({ message: 'Error al iniciar la partida.' });
    }
});

// =================================================================
//  ADMIN & MODERATION ROUTES
// =================================================================

/**
 * @route   GET /api/admin/tickets
 * @description Obtiene los tickets de contacto. Solo para administradores.
 * @access  Private (Admin)
 * @param {string} [req.query.status] - Filtra los tickets por estado ('pendiente' o 'completado').
 * @returns {object} 200 - Una lista de tickets.
 * @returns {object} 500 - Error del servidor.
 */
app.get('/api/admin/tickets', apiLimiter, isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && ['pendiente', 'completado'].includes(status)) {
            filter.status = status;
        } else {
            filter.status = 'pendiente';
        }

        const tickets = await ContactTicket.find(filter).sort({ createdAt: 1 }); // FIFO
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error en GET /api/admin/tickets:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener los tickets.' });
    }
});

/**
 * @route   PATCH /api/admin/tickets/:id/status
 * @description Actualiza el estado de un ticket de contacto. Solo para administradores.
 * @access  Private (Admin)
 * @param {string} req.params.id - El ID del ticket a actualizar.
 * @param {object} req.body - El cuerpo de la petición.
 * @param {string} req.body.status - El nuevo estado ('completado').
 * @returns {object} 200 - El ticket actualizado.
 * @returns {object} 400 - Si el estado no es válido.
 * @returns {object} 404 - Si el ticket no se encuentra.
 * @returns {object} 500 - Error del servidor.
 */
app.patch('/api/admin/tickets/:id/status', actionLimiter, isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (status !== 'completado') {
            return res.status(400).json({ message: 'El único estado válido para la actualización es "completado".' });
        }

        const updatedTicket = await ContactTicket.findByIdAndUpdate(
            id,
            { $set: { status: 'completado' } },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: 'Ticket no encontrado.' });
        }

        res.status(200).json(updatedTicket);
    } catch (error) {
        console.error(`Error en PATCH /api/admin/tickets/${req.params.id}/status:`, error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el ticket.' });
    }
});

/**
 * @route   GET /api/moderation/reports
 * @description Obtiene mensajes reportados. Para moderadores y administradores.
 * @access  Private (Moderator/Admin)
 * @param {string} [req.query.status] - Filtra por estado ('pendiente' o 'revisado'). 'revisado' es solo para admins.
 * @returns {object} 200 - Una lista de mensajes reportados.
 * @returns {object} 500 - Error del servidor.
 */
app.get('/api/moderation/reports', apiLimiter, isAuthenticated, isModeratorOrAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const requesterRole = req.userRole;

        const filter = {
            'reportedBy.0': { $exists: true } // El array reportedBy no está vacío
        };

        if (status === 'revisado' && requesterRole === 'admin') {
            filter.reportStatus = 'revisado';
        } else {
            filter.reportStatus = 'pendiente';
        }

        const reportedMessages = await Message.find(filter)
            .sort({ createdAt: 1 }) // FIFO
            .populate({
                path: 'sender',
                model: User,
                select: 'username'
            })
            .populate({
                path: 'reportedBy',
                model: User,
                select: 'username'
            })
            .lean();

        res.status(200).json(reportedMessages);

    } catch (error) {
        console.error('Error en GET /api/moderation/reports:', error);
        res.status(500).json({ message: 'Error del servidor al obtener los reportes.' });
    }
});

/**
 * @route   PATCH /api/moderation/reports/:id/review
 * @description Marca un mensaje reportado como revisado.
 * @access  Private (Moderator/Admin)
 * @param {string} req.params.id - El ID del mensaje a marcar como revisado.
 * @returns {object} 200 - Mensaje de éxito.
 * @returns {object} 404 - Mensaje no encontrado.
 * @returns {object} 500 - Error del servidor.
 */
app.patch('/api/moderation/reports/:id/review', actionLimiter, isAuthenticated, isModeratorOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const updatedMessage = await Message.findByIdAndUpdate(
            id,
            { $set: { reportStatus: 'revisado' } },
            { new: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ message: 'Mensaje reportado no encontrado.' });
        }

        res.status(200).json({ message: 'El reporte ha sido marcado como revisado.' });
    } catch (error) {
        console.error(`Error en PATCH /api/moderation/reports/${req.params.id}/review:`, error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el estado del reporte.' });
    }
});


// =================================================================
//  HEALTH CHECK ROUTE
// =================================================================

/**
 * @route   GET /health
 * @description Endpoint de comprobación de estado. Devuelve una respuesta 200 OK
 * con un payload mínimo para verificar que el servidor está en línea.
 * Ideal para servicios de monitoreo y "keep-alive".
 * @access  Public
 */
app.get('/health', apiLimiter, (req, res) => {
    // Usamos res.json() para establecer automáticamente el Content-Type a application/json
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});


// =================================================================
//  CATCH-ALL AND START SERVER
// =================================================================

/**
 * @description Ruta "catch-all". Redirige cualquier petición GET no reconocida por las rutas anteriores
 * a la página principal del frontend (`index.html`). Esto es esencial para el funcionamiento de Single Page Applications (SPAs),
 * ya que permite que el enrutador del lado del cliente maneje las URL.
 */
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });

app.listen(PORT, () => { console.log(`🚀 Servidor iniciado en 🌐 ​http://localhost:${PORT} 🌐​`); });