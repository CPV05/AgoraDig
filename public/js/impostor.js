/**
 * @file impostor.js
 * @description Lógica del juego "El Impostor". Gestiona estados, tiempos y DOM.
 */

let gameState = {
    players: [], 
    config: {
        impostorCount: 1, 
        categories: []
    },
    secretWord: '',
    impostorHint: '',
    currentCategory: '',
    startTime: null,
    impostorsFound: 0
};

async function initImpostorGame() {
    const appRoot = document.getElementById('app-root');
    renderConfigurationPhase();
}

// --- FASE 1: CONFIGURACIÓN ---
function renderConfigurationPhase() {
    const container = document.getElementById('game-container');
    
    // Recuperar configuración previa o valores por defecto
    const savedPlayerCount = gameState.players.length > 0 ? gameState.players.length : 4;
    
    // Función auxiliar para calcular el máximo permitido
    const calculateMaxImpostors = (players) => Math.max(1, Math.ceil(players / 2) - 1);
    
    const initialMaxImpostors = calculateMaxImpostors(savedPlayerCount);
    
    // Validar impostores guardados contra el límite inicial
    let savedImpostorCount = gameState.config.impostorCount > 0 ? gameState.config.impostorCount : 1;
    if (savedImpostorCount > initialMaxImpostors) {
        savedImpostorCount = initialMaxImpostors;
    }

    container.innerHTML = `
        <div class="game-phase animate-fade-in">
            <h2>Configuración de Partida</h2>
            <form id="game-config-form">
                
                <div class="form-group range-group">
                    <label>Número de Jugadores: <span id="players-val" class="highlight-val">${savedPlayerCount}</span></label>
                    <input type="range" id="num-players" min="3" max="12" value="${savedPlayerCount}" class="slider">
                </div>
                
                <div id="player-names-container" class="names-grid"></div>
                
                <div class="form-group range-group">
                    <label>Número de Impostores: <span id="impostors-val" class="highlight-val">${savedImpostorCount}</span></label>
                    <input type="range" id="num-impostors" min="1" max="${initialMaxImpostors}" value="${savedImpostorCount}" class="slider">
                </div>

                <div class="form-group">
                    <label>Categorías</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="category" value="Acciones" checked> Acciones</label>
                        <label><input type="checkbox" name="category" value="Animales" checked> Animales</label>
                        <label><input type="checkbox" name="category" value="Comida" checked> Comida</label>
                        <label><input type="checkbox" name="category" value="Lugar" checked> Lugar</label>
                        <label><input type="checkbox" name="category" value="Objetos" checked> Objetos</label>
                    </div>
                </div>
                <p id="game-error" class="error-text hidden"></p>
                <button type="submit" class="button-primary center">Siguiente</button>
            </form>
        </div>
    `;

    // Referencias DOM
    const numPlayersInput = document.getElementById('num-players');
    const playersValDisplay = document.getElementById('players-val');
    
    const numImpostorsInput = document.getElementById('num-impostors');
    const impostorsValDisplay = document.getElementById('impostors-val');
    
    const namesContainer = document.getElementById('player-names-container');

    // Generador de Inputs para Nombres
    const generateNameInputs = (num) => {
        const currentInputs = document.querySelectorAll('.player-name-input');
        const currentNamesFromDom = Array.from(currentInputs).map(i => i.value);

        namesContainer.innerHTML = '';
        for (let i = 0; i < num; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Jugador ${i + 1}`;
            // Validacion de seguridad: maxlength para evitar buffer overflows visuales o spam
            input.maxLength = 15; 
            input.required = true;
            // Preservar nombre si existe, o usar el del estado
            input.value = currentNamesFromDom[i] || gameState.players[i]?.name || ''; 
            input.className = 'player-name-input';
            namesContainer.appendChild(input);
        }
    };

    // Lógica Central de Sincronización
    const syncImpostorLimits = (playerCount) => {
        const maxAllowed = calculateMaxImpostors(playerCount);
        const currentImpostorVal = parseInt(numImpostorsInput.value, 10);

        // 1. Actualizar el atributo HTML max
        numImpostorsInput.max = maxAllowed;

        // 2. Lógica de corrección (Clamping)
        if (currentImpostorVal > maxAllowed) {
            // Si tenemos más impostores de los permitidos, bajamos al máximo
            numImpostorsInput.value = maxAllowed;
            impostorsValDisplay.textContent = maxAllowed;
        } else {
            // Si es válido, aseguramos que el texto coincida con el valor actual
            // (Esto corrige casos donde el DOM visual no se haya repintado)
            impostorsValDisplay.textContent = currentImpostorVal;
        }
    };

    // Listeners
    numPlayersInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        playersValDisplay.textContent = val;
        
        // Primero ajustamos límites, luego generamos nombres
        syncImpostorLimits(val); 
        generateNameInputs(val);
    });

    numImpostorsInput.addEventListener('input', (e) => {
        impostorsValDisplay.textContent = e.target.value;
    });

    // Inicialización al renderizar
    generateNameInputs(savedPlayerCount);
    // Ejecutamos la sincronización una vez al inicio para asegurar consistencia
    syncImpostorLimits(savedPlayerCount);

    // Manejo del Submit
    document.getElementById('game-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('game-error');
        errorEl.classList.add('hidden');

        // Sanitización básica de entradas
        const inputs = document.querySelectorAll('.player-name-input');
        const names = Array.from(inputs).map(input => input.value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")); // Simple XSS prevent
        
        const impostorCount = parseInt(numImpostorsInput.value, 10);
        const categories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);

        // Validación final de seguridad (Server-side logic en cliente)
        const maxAllowedImpostors = calculateMaxImpostors(names.length);

        if (impostorCount > maxAllowedImpostors) {
            errorEl.textContent = `Error de configuración: Máximo ${maxAllowedImpostors} impostores para ${names.length} jugadores.`;
            errorEl.classList.remove('hidden');
            // Autocorrección final
            syncImpostorLimits(names.length);
            return;
        }

        if (categories.length === 0) {
            errorEl.textContent = 'Selecciona al menos una categoría.';
            errorEl.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('/api/games/impostor/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categories })
            });
            
            if (!response.ok) throw new Error('Error al conectar con el servidor.');
            const data = await response.json();

            gameState.config.impostorCount = impostorCount;
            gameState.secretWord = data.word;
            gameState.impostorHint = data.impostorHint;
            gameState.currentCategory = data.category;
            
            gameState.players = names.map(name => ({ name, role: 'player', isEliminated: false }));
            
            let impostorsAssigned = 0;
            while (impostorsAssigned < impostorCount) {
                const idx = Math.floor(Math.random() * gameState.players.length);
                if (gameState.players[idx].role !== 'impostor') {
                    gameState.players[idx].role = 'impostor';
                    impostorsAssigned++;
                }
            }
            renderPresentationPhase(0);

        } catch (error) {
            console.error(error);
            errorEl.textContent = error.message || 'Error desconocido';
            errorEl.classList.remove('hidden');
        }
    });
}

// --- FASE 2: PRESENTACIÓN (CARTAS) ---
function renderPresentationPhase(playerIndex) {
    const container = document.getElementById('game-container');
    
    if (playerIndex >= gameState.players.length) {
        gameState.startTime = new Date();
        renderVotingPhase(1); 
        return;
    }

    const player = gameState.players[playerIndex];
    const isImpostor = player.role === 'impostor';
    
    const secretText = isImpostor 
        ? `Eres el IMPOSTOR<br><br>Pista:<strong> ${gameState.impostorHint}</strong>` 
        : `Palabra:<br><strong>${gameState.secretWord}</strong>`;
    const roleClass = isImpostor ? 'role-impostor' : 'role-player';

    container.innerHTML = `
        <div class="game-phase center-text animate-fade-in">
            <h3>Turno de: <span class="safe-name">${player.name}</span></h3>
            
            <div class="card-container" id="game-card">
                <div class="card-inner">
                    <div class="card-front">
                        <span class="card-icon">?</span>
                        <p>Toca para revelar</p>
                    </div>
                    <div class="card-back ${roleClass}">
                        <p>${secretText}</p>
                    </div>
                </div>
            </div>
            <br>
            <button id="next-player-btn" class="button-primary hidden">
                ${playerIndex === gameState.players.length - 1 ? 'Empezar Partida' : 'Siguiente Jugador'}
            </button>
        </div>
    `;

    const card = document.getElementById('game-card');
    const nextBtn = document.getElementById('next-player-btn');
    let revealed = false;

    card.addEventListener('click', () => {
        if (!revealed) {
            card.classList.add('flipped');
            nextBtn.classList.remove('hidden');
            revealed = true;
        }
    });

    nextBtn.addEventListener('click', () => {
        renderPresentationPhase(playerIndex + 1);
    });
}

// --- FASE 3: VOTACIÓN ---
function renderVotingPhase(roundNumber) {
    const container = document.getElementById('game-container');
    const activePlayers = gameState.players.filter(p => !p.isEliminated);
    
    const activeImpostors = activePlayers.filter(p => p.role === 'impostor').length;

    if (activeImpostors === 0) {
        renderResults('Jugadores'); 
        return;
    }
    
    if (roundNumber > gameState.config.impostorCount) {
         if (activeImpostors > 0) renderResults('Impostores');
         else renderResults('Jugadores');
         return;
    }

    let html = `
        <div class="game-phase animate-fade-in center-text">
            <h2>Fase de Votación (Ronda ${roundNumber}/${gameState.config.impostorCount})</h2>
            <p>Debatid y votad a quién expulsar.</p>
            <div class="voting-grid">
    `;

    activePlayers.forEach((player) => {
        const safeName = player.name.replace(/"/g, '&quot;');
        html += `
            <button class="vote-card" data-name="${safeName}">
                ${player.name}
            </button>
        `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    document.querySelectorAll('.vote-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            if (confirm(`¿Seguro que queréis expulsar a ${name}?`)) {
                handleExpulsion(name, roundNumber);
            }
        });
    });
}

function handleExpulsion(name, roundNumber) {
    const player = gameState.players.find(p => p.name === name);
    player.isEliminated = true;
    
    if (player.role === 'impostor') {
        gameState.impostorsFound++;
    }

    const container = document.getElementById('game-container');
    const resultClass = player.role === 'impostor' ? 'success-text' : 'error-text';
    const resultMsg = player.role === 'impostor' ? '¡Era un Impostor!' : 'Era inocente...';

    container.innerHTML = `
        <div class="game-phase center-text animate-fade-in">
            <h2 class="${resultClass}">${resultMsg}</h2>
            <p>Expulsado: ${player.name}</p>
            <br>
            <button id="next-round-btn" class="button-primary">Continuar</button>
        </div>
    `;

    document.getElementById('next-round-btn').addEventListener('click', () => {
        const remainingImpostors = gameState.players.filter(p => p.role === 'impostor' && !p.isEliminated).length;
        if (remainingImpostors === 0) {
            renderResults('Jugadores');
        } else {
            renderVotingPhase(roundNumber + 1);
        }
    });
}

// --- FASE 4: RESULTADOS ---
function renderResults(winner) {
    const container = document.getElementById('game-container');
    const endTime = new Date();
    const durationMs = endTime - gameState.startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);

    const impostorList = gameState.players
        .filter(p => p.role === 'impostor')
        .map(p => `<li>${p.name}</li>`)
        .join('');

    const winClass = winner === 'Jugadores' ? 'victory-player' : 'victory-impostor';

    container.innerHTML = `
        <div class="game-phase center-text animate-fade-in">
            <h1 class="${winClass}">¡Han ganado los ${winner}!</h1>
            
            <div class="results-card">
                <p><strong>Tiempo de juego:</strong> ${minutes}min ${seconds}seg</p>
                <p><strong>Impostores eliminados:</strong> ${gameState.impostorsFound}/${gameState.config.impostorCount}</p>
                <p><strong>Los impostores eran:</strong></p>
                <ul class="impostor-list-ul">${impostorList}</ul>
            </div>

            <button id="play-again-btn" class="button-primary">Volver a Jugar</button>
        </div>
    `;

    document.getElementById('play-again-btn').addEventListener('click', () => {
        gameState.players.forEach(p => p.isEliminated = false);
        gameState.impostorsFound = 0;
        renderConfigurationPhase();
    });
}