/**
 * @file impostor.js
 * @description Lógica del juego "El Impostor". Gestiona estados, tiempos y DOM.
 */

let gameState = {
    players: [], // { name: "Juan", role: "impostor/player", isEliminated: false }
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
    container.innerHTML = `
        <div class="game-phase animate-fade-in">
            <h2>Configuración de Partida</h2>
            <form id="game-config-form">
                <div class="form-group">
                    <label>Número de Jugadores (3-10)</label>
                    <input type="number" id="num-players" min="3" max="10" value="4" required>
                </div>
                <div id="player-names-container" class="names-grid"></div>
                
                <div class="form-group">
                    <label>Número de Impostores (1-4)</label>
                    <input type="number" id="num-impostors" min="1" max="4" value="1" required>
                </div>

                <div class="form-group">
                    <label>Categorías</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="category" value="Comida" checked> Comida</label>
                        <label><input type="checkbox" name="category" value="Objetos" checked> Objetos</label>
                        <label><input type="checkbox" name="category" value="Animales" checked> Animales</label>
                        <label><input type="checkbox" name="category" value="Lugar" checked> Lugar</label>
                    </div>
                </div>
                <p id="game-error" class="error-text hidden"></p>
                <button type="submit" class="button-primary">Siguiente</button>
            </form>
        </div>
    `;

    const numPlayersInput = document.getElementById('num-players');
    const namesContainer = document.getElementById('player-names-container');

    const generateNameInputs = (num) => {
        namesContainer.innerHTML = '';
        for (let i = 0; i < num; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Jugador ${i + 1}`;
            input.required = true;
            input.value = gameState.players[i]?.name || ''; // Mantener nombres si existen
            input.className = 'player-name-input';
            namesContainer.appendChild(input);
        }
    };

    numPlayersInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        if (val > 10) val = 10;
        if (val < 3) val = 3; // Validación visual
        generateNameInputs(val);
    });

    // Generar inputs iniciales
    generateNameInputs(parseInt(numPlayersInput.value));

    document.getElementById('game-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('game-error');
        errorEl.classList.add('hidden');

        // Recoger datos
        const inputs = document.querySelectorAll('.player-name-input');
        const names = Array.from(inputs).map(input => input.value.trim());
        const impostorCount = parseInt(document.getElementById('num-impostors').value);
        const categories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);

        // Validaciones
        if (impostorCount >= names.length) {
            errorEl.textContent = 'Debe haber más jugadores que impostores.';
            errorEl.classList.remove('hidden');
            return;
        }
        if (categories.length === 0) {
            errorEl.textContent = 'Selecciona al menos una categoría.';
            errorEl.classList.remove('hidden');
            return;
        }

        // Obtener palabra del servidor
        try {
            const response = await fetch('/api/games/impostor/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categories })
            });
            
            if (!response.ok) throw new Error('Error al conectar con el servidor.');
            const data = await response.json();

            // Configurar Estado
            gameState.config.impostorCount = impostorCount;
            gameState.secretWord = data.word;
            gameState.impostorHint = data.impostorHint;
            gameState.currentCategory = data.category;
            
            // Asignar roles aleatorios
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
            errorEl.textContent = error.message;
            errorEl.classList.remove('hidden');
        }
    });
}

// --- FASE 2: PRESENTACIÓN (CARTAS) ---
function renderPresentationPhase(playerIndex) {
    const container = document.getElementById('game-container');
    
    if (playerIndex >= gameState.players.length) {
        // Fin de presentaciones, empezar juego
        gameState.startTime = new Date();
        renderVotingPhase(1); // Ronda 1
        return;
    }

    const player = gameState.players[playerIndex];
    const isImpostor = player.role === 'impostor';
    const secretText = isImpostor ? `Eres el IMPOSTOR<br><small>Pista: ${gameState.impostorHint}</small>` : `Palabra:<br><strong>${gameState.secretWord}</strong>`;
    const roleClass = isImpostor ? 'role-impostor' : 'role-player';

    container.innerHTML = `
        <div class="game-phase center-text animate-fade-in">
            <h3>Turno de: ${player.name}</h3>
            <p>Pasa el dispositivo a ${player.name}.</p>
            
            <div class="card-container" id="game-card">
                <div class="card-inner">
                    <div class="card-front">
                        <span class="card-icon">?</span>
                        <p>Toca para revelar</p>
                    </div>
                    <div class="card-back ${roleClass}">
                        <p>${secretText}</p>
                        <p class="category-hint">Categoría: ${gameState.currentCategory}</p>
                    </div>
                </div>
            </div>

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
    
    // Verificar condiciones de victoria antes de votar
    const activeImpostors = activePlayers.filter(p => p.role === 'impostor').length;
    const activeCivilians = activePlayers.length - activeImpostors;

    if (activeImpostors === 0) {
        renderResults('Jugadores'); // Ganan los jugadores
        return;
    }
    // Si quedan igual o menos civiles que impostores, ganan impostores (opcional, simplificado aquí se juega hasta expulsar N veces)
    if (roundNumber > gameState.config.impostorCount) {
         // Se acabaron las rondas de votación
         if (activeImpostors > 0) renderResults('Impostores');
         else renderResults('Jugadores');
         return;
    }

    let html = `
        <div class="game-phase animate-fade-in">
            <h2>Fase de Votación (Ronda ${roundNumber}/${gameState.config.impostorCount})</h2>
            <p>Debatid y votad a quién expulsar.</p>
            <div class="voting-grid">
    `;

    activePlayers.forEach((player, idx) => {
        html += `
            <button class="vote-card" data-name="${player.name}">
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
        // Verificar victoria inmediata
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

    const winClass = winner === 'Jugadores' ? 'success-text' : 'error-text';

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
        // Reset parcial (mantenemos nombres y config)
        gameState.players.forEach(p => p.isEliminated = false);
        gameState.impostorsFound = 0;
        renderConfigurationPhase();
    });
}