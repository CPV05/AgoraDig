/**
 * @file seeds/impostorData.js
 * @description Contiene el set inicial de palabras para el juego 'El Impostor'.
 * Se separa del servidor principal para mantener el código limpio.
 */

const impostorWords = [
    // --- ACCIONES ---
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
    { gameType: 'impostor', category: 'Acciones', word: 'Pensar', impostorHint: 'Dudar' },               // Reflexionar sobre una idea
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
    { gameType: 'impostor', category: 'Acciones', word: 'Estornudar', impostorHint: 'Explotar' }, // Expulsión violenta
    { gameType: 'impostor', category: 'Acciones', word: 'Llorar', impostorHint: 'Regar' }, // Echar agua por los ojos
    { gameType: 'impostor', category: 'Acciones', word: 'Mentir', impostorHint: 'Inventar' }, // Crear una historia
    { gameType: 'impostor', category: 'Acciones', word: 'Acariciar', impostorHint: 'Limpiar' }, // Movimiento de mano suave
    { gameType: 'impostor', category: 'Acciones', word: 'Trepar', impostorHint: 'Gatear' }, // Usar cuatro extremidades (vertical vs horizontal)
    { gameType: 'impostor', category: 'Acciones', word: 'Vigilar', impostorHint: 'Mirar' }, // Observar con atención
    { gameType: 'impostor', category: 'Acciones', word: 'Suspirar', impostorHint: 'Desinflarse' }, // Soltar aire
    { gameType: 'impostor', category: 'Acciones', word: 'Rascarse', impostorHint: 'Arar' }, // Surcos en la piel
    { gameType: 'impostor', category: 'Acciones', word: 'Pellizcar', impostorHint: 'Morder' }, // Presión en un punto pequeño
    { gameType: 'impostor', category: 'Acciones', word: 'Gatear', impostorHint: 'Limpiar el suelo' }, // Estás a ras de suelo
    { gameType: 'impostor', category: 'Acciones', word: 'Aplastar', impostorHint: 'Pisar' }, // Ejercer presión hacia abajo
    { gameType: 'impostor', category: 'Acciones', word: 'Beber', impostorHint: 'Ahogarse' }, // Tragar líquido
    { gameType: 'impostor', category: 'Acciones', word: 'Escupir', impostorHint: 'Disparar' }, // Lanzar proyectil bucal
    { gameType: 'impostor', category: 'Acciones', word: 'Guiñar', impostorHint: 'Apagar' }, // Cerrar un ojo/luz
    { gameType: 'impostor', category: 'Acciones', word: 'Soplar', impostorHint: 'Silbar' }, // Echar aire por la boca
    { gameType: 'impostor', category: 'Acciones', word: 'Morder', impostorHint: 'Comer' }, // Usar los dientes
    { gameType: 'impostor', category: 'Acciones', word: 'Chupar', impostorHint: 'Besar' }, // Acción con los labios
    { gameType: 'impostor', category: 'Acciones', word: 'Lamer', impostorHint: 'Pintar' }, // Pasar la lengua/brocha
    { gameType: 'impostor', category: 'Acciones', word: 'Tragar', impostorHint: 'Esconder' }, // Hacer desaparecer algo dentro
    { gameType: 'impostor', category: 'Acciones', word: 'Inhalar', impostorHint: 'Oler' }, // Meter aire/aroma
    { gameType: 'impostor', category: 'Acciones', word: 'Exhalar', impostorHint: 'Suspirar' }, // Sacar aire
    { gameType: 'impostor', category: 'Acciones', word: 'Parpadear', impostorHint: 'Aletear' }, // Movimiento rápido de "alas"
    { gameType: 'impostor', category: 'Acciones', word: 'Estirarse', impostorHint: 'Crecer' }, // Hacerse más largo
    { gameType: 'impostor', category: 'Acciones', word: 'Encogerse', impostorHint: 'Esconderse' }, // Hacerse pequeño
    { gameType: 'impostor', category: 'Acciones', word: 'Saludar', impostorHint: 'Despedirse' }, // Mismo gesto, distinto significado
    { gameType: 'impostor', category: 'Acciones', word: 'Despedirse', impostorHint: 'Irse' }, // Abandonar el lugar
    { gameType: 'impostor', category: 'Acciones', word: 'Empujar', impostorHint: 'Alejar' }, // Mover algo lejos de ti
    { gameType: 'impostor', category: 'Acciones', word: 'Arrastrar', impostorHint: 'Barrer' }, // Mover algo por el suelo
    { gameType: 'impostor', category: 'Acciones', word: 'Levantar', impostorHint: 'Sostener' }, // Vencer la gravedad
    { gameType: 'impostor', category: 'Acciones', word: 'Cargar', impostorHint: 'Llevar' }, // Transportar peso
    { gameType: 'impostor', category: 'Acciones', word: 'Lanzar', impostorHint: 'Soltar' }, // Dejar ir con fuerza
    { gameType: 'impostor', category: 'Acciones', word: 'Recoger', impostorHint: 'Limpiar' }, // Tomar del suelo
    { gameType: 'impostor', category: 'Acciones', word: 'Agacharse', impostorHint: 'Sentarse' }, // Bajar el cuerpo
    { gameType: 'impostor', category: 'Acciones', word: 'Arrodillarse', impostorHint: 'Rezar' }, // Postura de súplica
    { gameType: 'impostor', category: 'Acciones', word: 'Tumbarse', impostorHint: 'Dormir' }, // Ponerse horizontal
    { gameType: 'impostor', category: 'Acciones', word: 'Rodar', impostorHint: 'Caer' }, // Girar sobre el suelo
    { gameType: 'impostor', category: 'Acciones', word: 'Girar', impostorHint: 'Bailar' }, // Rotar sobre uno mismo
    { gameType: 'impostor', category: 'Acciones', word: 'Equilibrar', impostorHint: 'Caminar' }, // No caerse
    { gameType: 'impostor', category: 'Acciones', word: 'Colgarse', impostorHint: 'Balancearse' }, // Sujetarse de arriba
    { gameType: 'impostor', category: 'Acciones', word: 'Balancearse', impostorHint: 'Mecer' }, // Movimiento de vaivén
    { gameType: 'impostor', category: 'Acciones', word: 'Mecer', impostorHint: 'Dormir' }, // Acción para calmar
    { gameType: 'impostor', category: 'Acciones', word: 'Abofetear', impostorHint: 'Aplaudir' }, // Palma contra cara
    { gameType: 'impostor', category: 'Acciones', word: 'Golpear', impostorHint: 'Llamar' }, // Tocar fuerte (puerta)
    { gameType: 'impostor', category: 'Acciones', word: 'Patear', impostorHint: 'Caminar' }, // Usar el pie con fuerza
    { gameType: 'impostor', category: 'Acciones', word: 'Cabecear', impostorHint: 'Asentir' }, // Golpe con la cabeza
    { gameType: 'impostor', category: 'Acciones', word: 'Codear', impostorHint: 'Avisar' }, // Golpe con el codo
    { gameType: 'impostor', category: 'Acciones', word: 'Pisar', impostorHint: 'Caminar' }, // Poner el pie encima
    { gameType: 'impostor', category: 'Acciones', word: 'Chocar', impostorHint: 'Saludar' }, // Impacto (broma de choque de manos)
    { gameType: 'impostor', category: 'Acciones', word: 'Rozar', impostorHint: 'Tocar' }, // Contacto ligero
    { gameType: 'impostor', category: 'Acciones', word: 'Apretar', impostorHint: 'Ahogar' }, // Ejercer presión
    { gameType: 'impostor', category: 'Acciones', word: 'Estrujar', impostorHint: 'Abrazar' }, // Apretar fuerte
    { gameType: 'impostor', category: 'Acciones', word: 'Sacudir', impostorHint: 'Temblar' }, // Mover violentamente
    { gameType: 'impostor', category: 'Acciones', word: 'Vibrar', impostorHint: 'Sonar' }, // Movimiento rápido
    { gameType: 'impostor', category: 'Acciones', word: 'Oscilar', impostorHint: 'Dudar' }, // Moverse entre dos puntos
    { gameType: 'impostor', category: 'Acciones', word: 'Fluir', impostorHint: 'Correr' }, // Movimiento líquido
    { gameType: 'impostor', category: 'Acciones', word: 'Deslizarse', impostorHint: 'Patinar' }, // Movimiento suave
    { gameType: 'impostor', category: 'Acciones', word: 'Frotar', impostorHint: 'Limpiar' }, // Fricción
    { gameType: 'impostor', category: 'Acciones', word: 'Lavar', impostorHint: 'Mojar' }, // Usar agua
    { gameType: 'impostor', category: 'Acciones', word: 'Secar', impostorHint: 'Soplar' }, // Quitar agua
    { gameType: 'impostor', category: 'Acciones', word: 'Peinar', impostorHint: 'Barrer' }, // Ordenar filamentos
    { gameType: 'impostor', category: 'Acciones', word: 'Vestir', impostorHint: 'Tapar' }, // Poner ropa
    { gameType: 'impostor', category: 'Acciones', word: 'Desnudar', impostorHint: 'Pelar' }, // Quitar capas
    { gameType: 'impostor', category: 'Acciones', word: 'Abrochar', impostorHint: 'Cerrar' }, // Unir botones
    { gameType: 'impostor', category: 'Acciones', word: 'Desabrochar', impostorHint: 'Abrir' }, // Soltar botones
    { gameType: 'impostor', category: 'Acciones', word: 'Atar', impostorHint: 'Inmovilizar' }, // Hacer nudos
    { gameType: 'impostor', category: 'Acciones', word: 'Desatar', impostorHint: 'Liberar' }, // Soltar nudos
    { gameType: 'impostor', category: 'Acciones', word: 'Envolver', impostorHint: 'Esconder' }, // Cubrir con papel
    { gameType: 'impostor', category: 'Acciones', word: 'Desenvolver', impostorHint: 'Descubrir' }, // Quitar envoltorio
    { gameType: 'impostor', category: 'Acciones', word: 'Tapar', impostorHint: 'Ocultar' }, // Poner tapa
    { gameType: 'impostor', category: 'Acciones', word: 'Destapar', impostorHint: 'Revelar' }, // Quitar tapa
    { gameType: 'impostor', category: 'Acciones', word: 'Encender', impostorHint: 'Quemar' }, // Iniciar fuego/luz
    { gameType: 'impostor', category: 'Acciones', word: 'Apagar', impostorHint: 'Matar' }, // Extinguir
    { gameType: 'impostor', category: 'Acciones', word: 'Romper', impostorHint: 'Quebrar' }, // Partir en trozos
    { gameType: 'impostor', category: 'Acciones', word: 'Doblar', impostorHint: 'Plegar' }, // Curvar material
    { gameType: 'impostor', category: 'Acciones', word: 'Arrugar', impostorHint: 'Envejecer' }, // Hacer pliegues
    { gameType: 'impostor', category: 'Acciones', word: 'Alisar', impostorHint: 'Planchar' }, // Quitar arrugas
    { gameType: 'impostor', category: 'Acciones', word: 'Estirar', impostorHint: 'Alargar' }, // Tensar
    { gameType: 'impostor', category: 'Acciones', word: 'Inflar', impostorHint: 'Engordar' }, // Llenar de aire
    { gameType: 'impostor', category: 'Acciones', word: 'Pinchar', impostorHint: 'Herir' }, // Clavar algo fino

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
    { gameType: 'impostor', category: 'Animales', word: 'Hormiga', impostorHint: 'Soldado' }, // Trabajan en filas
    { gameType: 'impostor', category: 'Animales', word: 'Mosca', impostorHint: 'Helicóptero' }, // Vuela y molesta
    { gameType: 'impostor', category: 'Animales', word: 'Avispa', impostorHint: 'Aguja' }, // Pincha
    { gameType: 'impostor', category: 'Animales', word: 'Mantis', impostorHint: 'Monja' }, // Religiosa
    { gameType: 'impostor', category: 'Animales', word: 'Escarabajo', impostorHint: 'Tanque' }, // Duro y acorazado
    { gameType: 'impostor', category: 'Animales', word: 'Libélula', impostorHint: 'Dron' }, // Vuelo estático
    { gameType: 'impostor', category: 'Animales', word: 'Cucaracha', impostorHint: 'Nuclear' }, // Sobreviven a todo
    { gameType: 'impostor', category: 'Animales', word: 'Pulga', impostorHint: 'Saltamontes' }, // Saltan mucho
    { gameType: 'impostor', category: 'Animales', word: 'Garrapata', impostorHint: 'Vampiro' }, // Chupa sangre
    { gameType: 'impostor', category: 'Animales', word: 'Piojo', impostorHint: 'Caspa' }, // Está en la cabeza
    { gameType: 'impostor', category: 'Animales', word: 'Lombriz', impostorHint: 'Fideo' }, // Forma alargada
    { gameType: 'impostor', category: 'Animales', word: 'Sanguijuela', impostorHint: 'Médico' }, // Usadas en medicina antigua
    { gameType: 'impostor', category: 'Animales', word: 'Caracol', impostorHint: 'Casa' }, // Llevan la casa a cuestas
    { gameType: 'impostor', category: 'Animales', word: 'Babosa', impostorHint: 'Lengua' }, // Sin concha
    { gameType: 'impostor', category: 'Animales', word: 'Ostra', impostorHint: 'Roca' }, // Parece una piedra
    { gameType: 'impostor', category: 'Animales', word: 'Almeja', impostorHint: 'Castañuela' }, // Se abren y cierran
    { gameType: 'impostor', category: 'Animales', word: 'Mejillón', impostorHint: 'Naranja' }, // Color de la carne
    { gameType: 'impostor', category: 'Animales', word: 'Calamar', impostorHint: 'Bolígrafo' }, // Tinta
    { gameType: 'impostor', category: 'Animales', word: 'Pulpo', impostorHint: 'Pegatina' }, // Ventosas
    { gameType: 'impostor', category: 'Animales', word: 'Medusa', impostorHint: 'Fantasma' }, // Transparente
    { gameType: 'impostor', category: 'Animales', word: 'Erizo de mar', impostorHint: 'Cactus' }, // Pinchos
    { gameType: 'impostor', category: 'Animales', word: 'Estrella de mar', impostorHint: 'Cielo' }, // Forma
    { gameType: 'impostor', category: 'Animales', word: 'Caballito de mar', impostorHint: 'Ajedrez' }, // Pieza
    { gameType: 'impostor', category: 'Animales', word: 'Tiburón', impostorHint: 'Sierra' }, // Dientes
    { gameType: 'impostor', category: 'Animales', word: 'Raya', impostorHint: 'Alfombra' }, // Plana
    { gameType: 'impostor', category: 'Animales', word: 'Pez Espada', impostorHint: 'Esgrima' }, // Nariz larga
    { gameType: 'impostor', category: 'Animales', word: 'Pez Globo', impostorHint: 'Balón' }, // Se infla
    { gameType: 'impostor', category: 'Animales', word: 'Pez Payaso', impostorHint: 'Circo' }, // Nombre
    { gameType: 'impostor', category: 'Animales', word: 'Salmón', impostorHint: 'Río' }, // Remonta corriente
    { gameType: 'impostor', category: 'Animales', word: 'Piraña', impostorHint: 'Tijeras' }, // Muerden rápido
    { gameType: 'impostor', category: 'Animales', word: 'Anguila', impostorHint: 'Cable' }, // Electricidad
    { gameType: 'impostor', category: 'Animales', word: 'Rana', impostorHint: 'Príncipe' }, // Cuento
    { gameType: 'impostor', category: 'Animales', word: 'Sapo', impostorHint: 'Verruga' }, // Piel rugosa
    { gameType: 'impostor', category: 'Animales', word: 'Salamandra', impostorHint: 'Lagartija' }, // Parecido visual
    { gameType: 'impostor', category: 'Animales', word: 'Camaleón', impostorHint: 'Espía' }, // Se camufla
    { gameType: 'impostor', category: 'Animales', word: 'Iguana', impostorHint: 'Dinosaurio' }, // Parecido prehistórico
    { gameType: 'impostor', category: 'Animales', word: 'Tortuga', impostorHint: 'Casco' }, // Caparazón
    { gameType: 'impostor', category: 'Animales', word: 'Cocodrilo', impostorHint: 'Bolso' }, // Piel cara
    { gameType: 'impostor', category: 'Animales', word: 'Serpiente', impostorHint: 'Cuerda' }, // Forma
    { gameType: 'impostor', category: 'Animales', word: 'Cobra', impostorHint: 'Flauta' }, // Encantador de serpientes
    { gameType: 'impostor', category: 'Animales', word: 'Boa', impostorHint: 'Abrazo' }, // Constrictora
    { gameType: 'impostor', category: 'Animales', word: 'Avestruz', impostorHint: 'Arena' }, // Esconde la cabeza
    { gameType: 'impostor', category: 'Animales', word: 'Pingüino', impostorHint: 'Camarero' }, // Traje blanco y negro
    { gameType: 'impostor', category: 'Animales', word: 'Pavo Real', impostorHint: 'Abanico' }, // Cola
    { gameType: 'impostor', category: 'Animales', word: 'Loro', impostorHint: 'Grabadora' }, // Repite sonidos
    { gameType: 'impostor', category: 'Animales', word: 'Búho', impostorHint: 'Gafas' }, // Ojos grandes
    { gameType: 'impostor', category: 'Animales', word: 'Cuervo', impostorHint: 'Bruja' }, // Mascota típica
    { gameType: 'impostor', category: 'Animales', word: 'Paloma', impostorHint: 'Cartero' }, // Mensajera
    { gameType: 'impostor', category: 'Animales', word: 'Gaviota', impostorHint: 'Ladrón' }, // Roban comida
    { gameType: 'impostor', category: 'Animales', word: 'Flamenco', impostorHint: 'Bailarín' }, // Se para en una pata
    { gameType: 'impostor', category: 'Animales', word: 'Cigüeña', impostorHint: 'Bebé' }, // Trae niños
    { gameType: 'impostor', category: 'Animales', word: 'Pato', impostorHint: 'Goma' }, // Juguete de baño
    { gameType: 'impostor', category: 'Animales', word: 'Cisne', impostorHint: 'Patito Feo' }, // Cuento
    { gameType: 'impostor', category: 'Animales', word: 'Águila', impostorHint: 'Bandera' }, // Símbolo común
    { gameType: 'impostor', category: 'Animales', word: 'Murciélago', impostorHint: 'Radar' }, // Ecolocalización
    { gameType: 'impostor', category: 'Animales', word: 'Topo', impostorHint: 'Excavadora' }, // Cava túneles
    { gameType: 'impostor', category: 'Animales', word: 'Erizo', impostorHint: 'Cepillo' }, // Púas
    { gameType: 'impostor', category: 'Animales', word: 'Canguro', impostorHint: 'Muelle' }, // Salta
    { gameType: 'impostor', category: 'Animales', word: 'Koala', impostorHint: 'Eucalipto' }, // Comida única
    { gameType: 'impostor', category: 'Animales', word: 'Perezoso', impostorHint: 'Siesta' }, // Lento
    { gameType: 'impostor', category: 'Animales', word: 'Armadillo', impostorHint: 'Balón' }, // Se enrolla
    { gameType: 'impostor', category: 'Animales', word: 'Mofeta', impostorHint: 'Pedo' }, // Mal olor
    { gameType: 'impostor', category: 'Animales', word: 'Mapache', impostorHint: 'Antifaz' }, // Manchas en ojos
    { gameType: 'impostor', category: 'Animales', word: 'Castor', impostorHint: 'Presa' }, // Construye diques
    { gameType: 'impostor', category: 'Animales', word: 'Ardilla', impostorHint: 'Nuez' }, // Comida típica
    { gameType: 'impostor', category: 'Animales', word: 'Rata', impostorHint: 'Alcantarilla' }, // Hábitat urbano
    { gameType: 'impostor', category: 'Animales', word: 'Ratón', impostorHint: 'Queso' }, // Comida dibujo animado
    { gameType: 'impostor', category: 'Animales', word: 'Hámster', impostorHint: 'Rueda' }, // Juguete
    { gameType: 'impostor', category: 'Animales', word: 'Conejo', impostorHint: 'Sombrero' }, // Magia
    { gameType: 'impostor', category: 'Animales', word: 'Liebre', impostorHint: 'Tortuga' }, // Carrera fábula
    { gameType: 'impostor', category: 'Animales', word: 'Lobo', impostorHint: 'Luna' }, // Aúlla
    { gameType: 'impostor', category: 'Animales', word: 'Zorro', impostorHint: 'Astuto' }, // Adjetivo típico
    { gameType: 'impostor', category: 'Animales', word: 'Oso', impostorHint: 'Miel' }, // Comida Winnie
    { gameType: 'impostor', category: 'Animales', word: 'Panda', impostorHint: 'Yin Yang' }, // Blanco y negro
    { gameType: 'impostor', category: 'Animales', word: 'León', impostorHint: 'Rey' }, // Título selva
    { gameType: 'impostor', category: 'Animales', word: 'Tigre', impostorHint: 'Raya' }, // Patrón piel
    { gameType: 'impostor', category: 'Animales', word: 'Gato', impostorHint: 'Ovillo' }, // Juguete
    { gameType: 'impostor', category: 'Animales', word: 'Perro', impostorHint: 'Hueso' }, // Comida típica

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
    { gameType: 'impostor', category: 'Lugar', word: 'Ascensor', impostorHint: 'Jaula' }, // Caja cerrada que sube
    { gameType: 'impostor', category: 'Lugar', word: 'Escalera', impostorHint: 'Montaña' }, // Subir peldaños
    { gameType: 'impostor', category: 'Lugar', word: 'Pasillo', impostorHint: 'Túnel' }, // Conector largo
    { gameType: 'impostor', category: 'Lugar', word: 'Recibidor', impostorHint: 'Bienvenida' }, // Entrada casa
    { gameType: 'impostor', category: 'Lugar', word: 'Salón', impostorHint: 'Sofá' }, // Mueble principal
    { gameType: 'impostor', category: 'Lugar', word: 'Comedor', impostorHint: 'Mesa' }, // Lugar de comer
    { gameType: 'impostor', category: 'Lugar', word: 'Cocina', impostorHint: 'Humo' }, // Se cocina
    { gameType: 'impostor', category: 'Lugar', word: 'Despensa', impostorHint: 'Almacén' }, // Guardar comida
    { gameType: 'impostor', category: 'Lugar', word: 'Baño', impostorHint: 'Trono' }, // Eufemismo inodoro
    { gameType: 'impostor', category: 'Lugar', word: 'Ducha', impostorHint: 'Lluvia' }, // Agua cayendo
    { gameType: 'impostor', category: 'Lugar', word: 'Dormitorio', impostorHint: 'Sueño' }, // Actividad principal
    { gameType: 'impostor', category: 'Lugar', word: 'Armario', impostorHint: 'Monstruo' }, // Lugar de miedo infantil
    { gameType: 'impostor', category: 'Lugar', word: 'Desván', impostorHint: 'Fantasma' }, // Lugar viejo arriba
    { gameType: 'impostor', category: 'Lugar', word: 'Sótano', impostorHint: 'Oscuridad' }, // Lugar bajo tierra
    { gameType: 'impostor', category: 'Lugar', word: 'Garaje', impostorHint: 'Aceite' }, // Manchas de coche
    { gameType: 'impostor', category: 'Lugar', word: 'Jardín', impostorHint: 'Edén' }, // Paraíso verde
    { gameType: 'impostor', category: 'Lugar', word: 'Patio', impostorHint: 'Recreo' }, // Zona de juego
    { gameType: 'impostor', category: 'Lugar', word: 'Balcón', impostorHint: 'Mirador' }, // Ver la calle
    { gameType: 'impostor', category: 'Lugar', word: 'Terraza', impostorHint: 'Bar' }, // Tomar algo fuera
    { gameType: 'impostor', category: 'Lugar', word: 'Tejado', impostorHint: 'Gato' }, // Donde andan
    { gameType: 'impostor', category: 'Lugar', word: 'Chimenea', impostorHint: 'Papá Noel' }, // Entrada mágica
    { gameType: 'impostor', category: 'Lugar', word: 'Piscina', impostorHint: 'Cloro' }, // Olor químico
    { gameType: 'impostor', category: 'Lugar', word: 'Calle', impostorHint: 'Asfalto' }, // Suelo
    { gameType: 'impostor', category: 'Lugar', word: 'Acera', impostorHint: 'Peatón' }, // Zona de andar
    { gameType: 'impostor', category: 'Lugar', word: 'Carretera', impostorHint: 'Ruta' }, // Viaje
    { gameType: 'impostor', category: 'Lugar', word: 'Autopista', impostorHint: 'Peaje' }, // Pagar por ir rápido
    { gameType: 'impostor', category: 'Lugar', word: 'Puente', impostorHint: 'Río' }, // Lo cruza
    { gameType: 'impostor', category: 'Lugar', word: 'Túnel', impostorHint: 'Eco' }, // Sonido dentro
    { gameType: 'impostor', category: 'Lugar', word: 'Rotonda', impostorHint: 'Círculo' }, // Forma vial
    { gameType: 'impostor', category: 'Lugar', word: 'Aparcamiento', impostorHint: 'Rayas' }, // Líneas suelo
    { gameType: 'impostor', category: 'Lugar', word: 'Gasolinera', impostorHint: 'Manguera' }, // Surtidor
    { gameType: 'impostor', category: 'Lugar', word: 'Taller', impostorHint: 'Grasa' }, // Suciedad mecánica
    { gameType: 'impostor', category: 'Lugar', word: 'Lavadero', impostorHint: 'Espuma' }, // Jabón coches
    { gameType: 'impostor', category: 'Lugar', word: 'Parada', impostorHint: 'Espera' }, // Bus/Tren
    { gameType: 'impostor', category: 'Lugar', word: 'Estación', impostorHint: 'Despedida' }, // Adiós en el andén
    { gameType: 'impostor', category: 'Lugar', word: 'Aeropuerto', impostorHint: 'Control' }, // Seguridad
    { gameType: 'impostor', category: 'Lugar', word: 'Puerto', impostorHint: 'Marinero' }, // Trabajador
    { gameType: 'impostor', category: 'Lugar', word: 'Faro', impostorHint: 'Luz' }, // Guía
    { gameType: 'impostor', category: 'Lugar', word: 'Playa', impostorHint: 'Toalla' }, // Objeto indispensable
    { gameType: 'impostor', category: 'Lugar', word: 'Acantilado', impostorHint: 'Vértigo' }, // Sensación
    { gameType: 'impostor', category: 'Lugar', word: 'Cueva', impostorHint: 'Murciélago' }, // Habitante
    { gameType: 'impostor', category: 'Lugar', word: 'Mina', impostorHint: 'Enanito' }, // Blancanieves
    { gameType: 'impostor', category: 'Lugar', word: 'Volcán', impostorHint: 'Lava' }, // Magma
    { gameType: 'impostor', category: 'Lugar', word: 'Isla', impostorHint: 'Naufrago' }, // Robinson
    { gameType: 'impostor', category: 'Lugar', word: 'Desierto', impostorHint: 'Espejismo' }, // Visión falsa
    { gameType: 'impostor', category: 'Lugar', word: 'Oasis', impostorHint: 'Palmera' }, // Árbol típico
    { gameType: 'impostor', category: 'Lugar', word: 'Selva', impostorHint: 'Machete' }, // Herramienta para pasar
    { gameType: 'impostor', category: 'Lugar', word: 'Bosque', impostorHint: 'Cuento' }, // Escenario típico
    { gameType: 'impostor', category: 'Lugar', word: 'Pantano', impostorHint: 'Shrek' }, // Habitante famoso
    { gameType: 'impostor', category: 'Lugar', word: 'Lago', impostorHint: 'Monstruo' }, // Ness
    { gameType: 'impostor', category: 'Lugar', word: 'Río', impostorHint: 'Corriente' }, // Agua que mueve
    { gameType: 'impostor', category: 'Lugar', word: 'Cascada', impostorHint: 'Ruido' }, // Sonido del agua
    { gameType: 'impostor', category: 'Lugar', word: 'Montaña', impostorHint: 'Nieve' }, // Cima blanca
    { gameType: 'impostor', category: 'Lugar', word: 'Valle', impostorHint: 'Eco' }, // Rebote sonido
    { gameType: 'impostor', category: 'Lugar', word: 'Granja', impostorHint: 'Olor' }, // Estiércol
    { gameType: 'impostor', category: 'Lugar', word: 'Huerto', impostorHint: 'Espantapájaros' }, // Guardián
    { gameType: 'impostor', category: 'Lugar', word: 'Invernadero', impostorHint: 'Cristal' }, // Material
    { gameType: 'impostor', category: 'Lugar', word: 'Viñedo', impostorHint: 'Uva' }, // Fruta
    { gameType: 'impostor', category: 'Lugar', word: 'Pueblo', impostorHint: 'Fiesta' }, // Patronales
    { gameType: 'impostor', category: 'Lugar', word: 'Ciudad', impostorHint: 'Tráfico' }, // Coches
    { gameType: 'impostor', category: 'Lugar', word: 'Plaza', impostorHint: 'Fuente' }, // Centro habitual
    { gameType: 'impostor', category: 'Lugar', word: 'Parque', impostorHint: 'Banco' }, // Asiento
    { gameType: 'impostor', category: 'Lugar', word: 'Escuela', impostorHint: 'Pizarra' }, // Objeto aula
    { gameType: 'impostor', category: 'Lugar', word: 'Universidad', impostorHint: 'Fiesta' }, // Vida estudiantil
    { gameType: 'impostor', category: 'Lugar', word: 'Biblioteca', impostorHint: 'Silencio' }, // Regla número 1
    { gameType: 'impostor', category: 'Lugar', word: 'Museo', impostorHint: 'Antiguo' }, // Cosas viejas
    { gameType: 'impostor', category: 'Lugar', word: 'Teatro', impostorHint: 'Telón' }, // Cortina roja
    { gameType: 'impostor', category: 'Lugar', word: 'Cine', impostorHint: 'Palomitas' }, // Olor
    { gameType: 'impostor', category: 'Lugar', word: 'Circo', impostorHint: 'Carpa' }, // Techo lona
    { gameType: 'impostor', category: 'Lugar', word: 'Zoo', impostorHint: 'Jaula' }, // Encierro
    { gameType: 'impostor', category: 'Lugar', word: 'Acuario', impostorHint: 'Cristal' }, // Pared
    { gameType: 'impostor', category: 'Lugar', word: 'Estadio', impostorHint: 'Grada' }, // Asientos
    { gameType: 'impostor', category: 'Lugar', word: 'Gimnasio', impostorHint: 'Sudor' }, // Olor
    { gameType: 'impostor', category: 'Lugar', word: 'Hospital', impostorHint: 'Bata' }, // Ropa
    { gameType: 'impostor', category: 'Lugar', word: 'Farmacia', impostorHint: 'Cruz' }, // Símbolo verde
    { gameType: 'impostor', category: 'Lugar', word: 'Cementerio', impostorHint: 'Flores' }, // Ofrenda
    { gameType: 'impostor', category: 'Lugar', word: 'Iglesia', impostorHint: 'Campana' }, // Sonido
    { gameType: 'impostor', category: 'Lugar', word: 'Castillo', impostorHint: 'Princesa' }, // Cuento
    { gameType: 'impostor', category: 'Lugar', word: 'Ruinas', impostorHint: 'Piedras' }, // Restos
    { gameType: 'impostor', category: 'Lugar', word: 'Prisión', impostorHint: 'Barrotes' }, // Rejas

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
    { gameType: 'impostor', category: 'Comida', word: 'Pan', impostorHint: 'Duro' }, // Estado si se deja
    { gameType: 'impostor', category: 'Comida', word: 'Tostada', impostorHint: 'Quemada' }, // Error común
    { gameType: 'impostor', category: 'Comida', word: 'Bocadillo', impostorHint: 'Recreo' }, // Momento de comerlo
    { gameType: 'impostor', category: 'Comida', word: 'Sandwich', impostorHint: 'Triángulo' }, // Forma de corte
    { gameType: 'impostor', category: 'Comida', word: 'Pizza', impostorHint: 'Tortuga' }, // Ninja Turtles
    { gameType: 'impostor', category: 'Comida', word: 'Hamburguesa', impostorHint: 'Payaso' }, // McDonald's
    { gameType: 'impostor', category: 'Comida', word: 'Perrito caliente', impostorHint: 'Mostaza' }, // Salsa típica
    { gameType: 'impostor', category: 'Comida', word: 'Patatas fritas', impostorHint: 'Aceite' }, // Medio de cocción
    { gameType: 'impostor', category: 'Comida', word: 'Puré', impostorHint: 'Volcán' }, // Forma para echar salsa
    { gameType: 'impostor', category: 'Comida', word: 'Sopa', impostorHint: 'Cuchara' }, // Cubierto
    { gameType: 'impostor', category: 'Comida', word: 'Ensalada', impostorHint: 'Dieta' }, // Asociación común
    { gameType: 'impostor', category: 'Comida', word: 'Huevo frito', impostorHint: 'Sol' }, // Yema amarilla
    { gameType: 'impostor', category: 'Comida', word: 'Tortilla', impostorHint: 'Vuelta' }, // Acción difícil
    { gameType: 'impostor', category: 'Comida', word: 'Espaguetis', impostorHint: 'Cordones' }, // Forma
    { gameType: 'impostor', category: 'Comida', word: 'Macarrones', impostorHint: 'Tubo' }, // Forma
    { gameType: 'impostor', category: 'Comida', word: 'Lasaña', impostorHint: 'Garfield' }, // Comedor famoso
    { gameType: 'impostor', category: 'Comida', word: 'Ravioli', impostorHint: 'Cojín' }, // Forma
    { gameType: 'impostor', category: 'Comida', word: 'Arroz', impostorHint: 'Boda' }, // Se tira
    { gameType: 'impostor', category: 'Comida', word: 'Paella', impostorHint: 'Domingo' }, // Día típico
    { gameType: 'impostor', category: 'Comida', word: 'Sushi', impostorHint: 'Palillos' }, // Cubiertos
    { gameType: 'impostor', category: 'Comida', word: 'Tacos', impostorHint: 'Picante' }, // Sabor
    { gameType: 'impostor', category: 'Comida', word: 'Burrito', impostorHint: 'Manta' }, // Envolver
    { gameType: 'impostor', category: 'Comida', word: 'Pollo asado', impostorHint: 'Domingo' }, // Comida familiar
    { gameType: 'impostor', category: 'Comida', word: 'Alitas', impostorHint: 'Vuelo' }, // Parte del cuerpo
    { gameType: 'impostor', category: 'Comida', word: 'Filete', impostorHint: 'Suela' }, // Si está muy hecho
    { gameType: 'impostor', category: 'Comida', word: 'Albóndigas', impostorHint: 'Pelotas' }, // Forma
    { gameType: 'impostor', category: 'Comida', word: 'Jamón', impostorHint: 'Pata' }, // Origen
    { gameType: 'impostor', category: 'Comida', word: 'Chorizo', impostorHint: 'Collar' }, // Forma de sarta
    { gameType: 'impostor', category: 'Comida', word: 'Salchicha', impostorHint: 'Perro' }, // Animal asociado
    { gameType: 'impostor', category: 'Comida', word: 'Bacon', impostorHint: 'Desayuno' }, // Momento típico
    { gameType: 'impostor', category: 'Comida', word: 'Pescado', impostorHint: 'Espina' }, // Peligro al comer
    { gameType: 'impostor', category: 'Comida', word: 'Sardinas', impostorHint: 'Lata' }, // Envase
    { gameType: 'impostor', category: 'Comida', word: 'Atún', impostorHint: 'Gato' }, // A quien le gusta
    { gameType: 'impostor', category: 'Comida', word: 'Gambas', impostorHint: 'Bigote' }, // Antenas
    { gameType: 'impostor', category: 'Comida', word: 'Calamares', impostorHint: 'Anillos' }, // Forma frita
    { gameType: 'impostor', category: 'Comida', word: 'Pulpo', impostorHint: 'Gallega' }, // Estilo típico
    { gameType: 'impostor', category: 'Comida', word: 'Mejillones', impostorHint: 'Limón' }, // Aliño
    { gameType: 'impostor', category: 'Comida', word: 'Queso', impostorHint: 'Agujeros' }, // Gruyere
    { gameType: 'impostor', category: 'Comida', word: 'Yogur', impostorHint: 'Cuchara' }, // Textura
    { gameType: 'impostor', category: 'Comida', word: 'Leche', impostorHint: 'Vaca' }, // Origen
    { gameType: 'impostor', category: 'Comida', word: 'Mantequilla', impostorHint: 'Resbalar' }, // Efecto
    { gameType: 'impostor', category: 'Comida', word: 'Helado', impostorHint: 'Cerebro' }, // Se congela
    { gameType: 'impostor', category: 'Comida', word: 'Chocolate', impostorHint: 'Espinilla' }, // Mito acné
    { gameType: 'impostor', category: 'Comida', word: 'Galleta', impostorHint: 'Monstruo' }, // Triki
    { gameType: 'impostor', category: 'Comida', word: 'Magdalena', impostorHint: 'Desayuno' }, // Hora
    { gameType: 'impostor', category: 'Comida', word: 'Croissant', impostorHint: 'Luna' }, // Forma
    { gameType: 'impostor', category: 'Comida', word: 'Donut', impostorHint: 'Policía' }, // Estereotipo
    { gameType: 'impostor', category: 'Comida', word: 'Churros', impostorHint: 'Chocolate' }, // Pareja
    { gameType: 'impostor', category: 'Comida', word: 'Tarta', impostorHint: 'Velas' }, // Cumpleaños
    { gameType: 'impostor', category: 'Comida', word: 'Bizcocho', impostorHint: 'Esponja' }, // Textura
    { gameType: 'impostor', category: 'Comida', word: 'Flan', impostorHint: 'Temblor' }, // Movimiento
    { gameType: 'impostor', category: 'Comida', word: 'Gelatina', impostorHint: 'Transparente' }, // Aspecto
    { gameType: 'impostor', category: 'Comida', word: 'Fruta', impostorHint: 'Salud' }, // Concepto
    { gameType: 'impostor', category: 'Comida', word: 'Manzana', impostorHint: 'Bruja' }, // Blancanieves
    { gameType: 'impostor', category: 'Comida', word: 'Plátano', impostorHint: 'Resbalón' }, // Cáscara suelo
    { gameType: 'impostor', category: 'Comida', word: 'Naranja', impostorHint: 'Media' }, // Pareja ideal
    { gameType: 'impostor', category: 'Comida', word: 'Uvas', impostorHint: 'Nochevieja' }, // 12
    { gameType: 'impostor', category: 'Comida', word: 'Fresa', impostorHint: 'Nata' }, // Pareja
    { gameType: 'impostor', category: 'Comida', word: 'Sandía', impostorHint: 'Pepitas' }, // Molestia
    { gameType: 'impostor', category: 'Comida', word: 'Melón', impostorHint: 'Jamón' }, // Pareja
    { gameType: 'impostor', category: 'Comida', word: 'Piña', impostorHint: 'Bob Esponja' }, // Casa
    { gameType: 'impostor', category: 'Comida', word: 'Coco', impostorHint: 'Feria' }, // Puesto de comida
    { gameType: 'impostor', category: 'Comida', word: 'Limón', impostorHint: 'Mueca' }, // Cara ácida
    { gameType: 'impostor', category: 'Comida', word: 'Cereza', impostorHint: 'Pachá' }, // Logo famoso
    { gameType: 'impostor', category: 'Comida', word: 'Tomate', impostorHint: 'Sangre' }, // Color salsa
    { gameType: 'impostor', category: 'Comida', word: 'Lechuga', impostorHint: 'Conejo' }, // Comida animal
    { gameType: 'impostor', category: 'Comida', word: 'Zanahoria', impostorHint: 'Vista' }, // Mito ojos
    { gameType: 'impostor', category: 'Comida', word: 'Cebolla', impostorHint: 'Lloro' }, // Efecto
    { gameType: 'impostor', category: 'Comida', word: 'Ajo', impostorHint: 'Vampiro' }, // Repelente
    { gameType: 'impostor', category: 'Comida', word: 'Pimiento', impostorHint: 'Rojo' }, // Color común
    { gameType: 'impostor', category: 'Comida', word: 'Champiñón', impostorHint: 'Gnomo' }, // Casa
    { gameType: 'impostor', category: 'Comida', word: 'Maíz', impostorHint: 'Diente' }, // Parecido
    { gameType: 'impostor', category: 'Comida', word: 'Palomitas', impostorHint: 'Cine' }, // Lugar
    { gameType: 'impostor', category: 'Comida', word: 'Aceituna', impostorHint: 'Hueso' }, // Interior
    { gameType: 'impostor', category: 'Comida', word: 'Nuez', impostorHint: 'Cerebro' }, // Forma
    { gameType: 'impostor', category: 'Comida', word: 'Cacahuete', impostorHint: 'Elefante' }, // Comida circo
    { gameType: 'impostor', category: 'Comida', word: 'Almendra', impostorHint: 'Ojo' }, // Forma
    { gameType: 'impostor', category: 'Comida', word: 'Pistacho', impostorHint: 'Uña' }, // Abrirlo

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
    { gameType: 'impostor', category: 'Objetos', word: 'Mesa', impostorHint: 'Patas' }, // Tiene 4
    { gameType: 'impostor', category: 'Objetos', word: 'Silla', impostorHint: 'Respaldo' }, // Parte trasera
    { gameType: 'impostor', category: 'Objetos', word: 'Sofá', impostorHint: 'Siesta' }, // Uso
    { gameType: 'impostor', category: 'Objetos', word: 'Cama', impostorHint: 'Sábana' }, // Ropa
    { gameType: 'impostor', category: 'Objetos', word: 'Armario', impostorHint: 'Narnia' }, // Puerta mágica
    { gameType: 'impostor', category: 'Objetos', word: 'Espejo', impostorHint: 'Reflejo' }, // Función
    { gameType: 'impostor', category: 'Objetos', word: 'Lámpara', impostorHint: 'Genio' }, // Aladdín
    { gameType: 'impostor', category: 'Objetos', word: 'Alfombra', impostorHint: 'Vuelo' }, // Aladdín
    { gameType: 'impostor', category: 'Objetos', word: 'Cortina', impostorHint: 'Vecino' }, // Privacidad
    { gameType: 'impostor', category: 'Objetos', word: 'Puerta', impostorHint: 'Pomo' }, // Manilla
    { gameType: 'impostor', category: 'Objetos', word: 'Ventana', impostorHint: 'Cristal' }, // Material
    { gameType: 'impostor', category: 'Objetos', word: 'Llave', impostorHint: 'Cárcel' }, // Carcelero
    { gameType: 'impostor', category: 'Objetos', word: 'Teléfono', impostorHint: 'Cuerda' }, // Antiguamente tenían
    { gameType: 'impostor', category: 'Objetos', word: 'Ordenador', impostorHint: 'Ratón' }, // Periférico
    { gameType: 'impostor', category: 'Objetos', word: 'Teclado', impostorHint: 'Piano' }, // Teclas
    { gameType: 'impostor', category: 'Objetos', word: 'Pantalla', impostorHint: 'Ojos' }, // Cansa la vista
    { gameType: 'impostor', category: 'Objetos', word: 'Reloj', impostorHint: 'Tiempo' }, // Medida
    { gameType: 'impostor', category: 'Objetos', word: 'Despertador', impostorHint: 'Pesadilla' }, // Sonido odiado
    { gameType: 'impostor', category: 'Objetos', word: 'Mando', impostorHint: 'Poder' }, // Control
    { gameType: 'impostor', category: 'Objetos', word: 'Pila', impostorHint: 'Energía' }, // Carga
    { gameType: 'impostor', category: 'Objetos', word: 'Enchufe', impostorHint: 'Cerdo' }, // Forma nariz
    { gameType: 'impostor', category: 'Objetos', word: 'Bombilla', impostorHint: 'Idea' }, // Cómic
    { gameType: 'impostor', category: 'Objetos', word: 'Ventilador', impostorHint: 'Viento' }, // Genera
    { gameType: 'impostor', category: 'Objetos', word: 'Radiador', impostorHint: 'Calor' }, // Genera
    { gameType: 'impostor', category: 'Objetos', word: 'Nevera', impostorHint: 'Imán' }, // Decoración
    { gameType: 'impostor', category: 'Objetos', word: 'Lavadora', impostorHint: 'Calcetín' }, // Se pierden
    { gameType: 'impostor', category: 'Objetos', word: 'Plancha', impostorHint: 'Vapor' }, // Sale humo
    { gameType: 'impostor', category: 'Objetos', word: 'Aspiradora', impostorHint: 'Ruido' }, // Molestia
    { gameType: 'impostor', category: 'Objetos', word: 'Escoba', impostorHint: 'Bruja' }, // Transporte
    { gameType: 'impostor', category: 'Objetos', word: 'Fregona', impostorHint: 'Pelo' }, // Parecido visual
    { gameType: 'impostor', category: 'Objetos', word: 'Cubo', impostorHint: 'Agua' }, // Contenido
    { gameType: 'impostor', category: 'Objetos', word: 'Basura', impostorHint: 'Olor' }, // Peste
    { gameType: 'impostor', category: 'Objetos', word: 'Sartén', impostorHint: 'Mango' }, // Agarre
    { gameType: 'impostor', category: 'Objetos', word: 'Olla', impostorHint: 'Bruja' }, // Poción
    { gameType: 'impostor', category: 'Objetos', word: 'Cuchillo', impostorHint: 'Sangre' }, // Corte
    { gameType: 'impostor', category: 'Objetos', word: 'Tenedor', impostorHint: 'Diablo' }, // Tridente
    { gameType: 'impostor', category: 'Objetos', word: 'Cuchara', impostorHint: 'Sopa' }, // Uso
    { gameType: 'impostor', category: 'Objetos', word: 'Plato', impostorHint: 'Frisbee' }, // Vuelo
    { gameType: 'impostor', category: 'Objetos', word: 'Vaso', impostorHint: 'Agua' }, // Contenido
    { gameType: 'impostor', category: 'Objetos', word: 'Taza', impostorHint: 'Asa' }, // Oreja
    { gameType: 'impostor', category: 'Objetos', word: 'Botella', impostorHint: 'Mensaje' }, // Náufrago
    { gameType: 'impostor', category: 'Objetos', word: 'Servilleta', impostorHint: 'Papel' }, // Material
    { gameType: 'impostor', category: 'Objetos', word: 'Cepillo de dientes', impostorHint: 'Pasta' }, // Pareja
    { gameType: 'impostor', category: 'Objetos', word: 'Peine', impostorHint: 'Calvo' }, // Inútil para él
    { gameType: 'impostor', category: 'Objetos', word: 'Jabón', impostorHint: 'Resbalón' }, // Efecto suelo
    { gameType: 'impostor', category: 'Objetos', word: 'Toalla', impostorHint: 'Playa' }, // Uso
    { gameType: 'impostor', category: 'Objetos', word: 'Papel higiénico', impostorHint: 'Momia' }, // Disfraz
    { gameType: 'impostor', category: 'Objetos', word: 'Libro', impostorHint: 'Hoja' }, // Parte
    { gameType: 'impostor', category: 'Objetos', word: 'Cuaderno', impostorHint: 'Muelle' }, // Espiral
    { gameType: 'impostor', category: 'Objetos', word: 'Lápiz', impostorHint: 'Goma' }, // Borrar
    { gameType: 'impostor', category: 'Objetos', word: 'Bolígrafo', impostorHint: 'Tinta' }, // Mancha
    { gameType: 'impostor', category: 'Objetos', word: 'Tijeras', impostorHint: 'Piedra' }, // Juego
    { gameType: 'impostor', category: 'Objetos', word: 'Pegamento', impostorHint: 'Moco' }, // Textura
    { gameType: 'impostor', category: 'Objetos', word: 'Regla', impostorHint: 'Castigo' }, // Uso antiguo
    { gameType: 'impostor', category: 'Objetos', word: 'Mochila', impostorHint: 'Tortuga' }, // Caparazón
    { gameType: 'impostor', category: 'Objetos', word: 'Gafas', impostorHint: 'Cuatro ojos' }, // Broma
    { gameType: 'impostor', category: 'Objetos', word: 'Paraguas', impostorHint: 'Mala suerte' }, // Si se abre dentro
    { gameType: 'impostor', category: 'Objetos', word: 'Cartera', impostorHint: 'Dinero' }, // Contenido
    { gameType: 'impostor', category: 'Objetos', word: 'Llaves', impostorHint: 'Ruido' }, // Al andar
    { gameType: 'impostor', category: 'Objetos', word: 'Maleta', impostorHint: 'Viaje' }, // Vacaciones
    { gameType: 'impostor', category: 'Objetos', word: 'Coche', impostorHint: 'Ruedas' }, // Partes
    { gameType: 'impostor', category: 'Objetos', word: 'Bicicleta', impostorHint: 'Cadena' }, // Mecanismo
    { gameType: 'impostor', category: 'Objetos', word: 'Casco', impostorHint: 'Cabeza' }, // Protección
    { gameType: 'impostor', category: 'Objetos', word: 'Pelota', impostorHint: 'Gol' }, // Objetivo
    { gameType: 'impostor', category: 'Objetos', word: 'Raqueta', impostorHint: 'Mosquito' }, // Eléctrica
    { gameType: 'impostor', category: 'Objetos', word: 'Guitarra', impostorHint: 'Cuerdas' }, // Tiene 6
    { gameType: 'impostor', category: 'Objetos', word: 'Piano', impostorHint: 'Cola' }, // Tipo de piano
    { gameType: 'impostor', category: 'Objetos', word: 'Tambor', impostorHint: 'Ruido' }, // Vecinos molestos
    { gameType: 'impostor', category: 'Objetos', word: 'Micrófono', impostorHint: 'Karaoke' }, // Uso
    { gameType: 'impostor', category: 'Objetos', word: 'Cámara', impostorHint: 'Pajarito' }, // Dicho
    { gameType: 'impostor', category: 'Objetos', word: 'Foto', impostorHint: 'Recuerdo' }, // Nostalgia
    { gameType: 'impostor', category: 'Objetos', word: 'Cuadro', impostorHint: 'Clavo' }, // Colgar
    { gameType: 'impostor', category: 'Objetos', word: 'Estatua', impostorHint: 'Paloma' }, // Baño de pájaro
    { gameType: 'impostor', category: 'Objetos', word: 'Anillo', impostorHint: 'Compromiso' }, // Boda
    { gameType: 'impostor', category: 'Objetos', word: 'Collar', impostorHint: 'Perro' }, // Uso animal
    { gameType: 'impostor', category: 'Objetos', word: 'Pendientes', impostorHint: 'Oreja' }, // Lugar
    { gameType: 'impostor', category: 'Objetos', word: 'Reloj de arena', impostorHint: 'Desierto' }, // Contenido
    { gameType: 'impostor', category: 'Objetos', word: 'Mapa', impostorHint: 'Tesoro' }, // Pirata
    { gameType: 'impostor', category: 'Objetos', word: 'Bandera', impostorHint: 'Viento' }, // Ondea
];

module.exports = impostorWords;