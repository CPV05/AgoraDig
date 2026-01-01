/**
 * @file impostor.js
 * @description Lógica del juego "El Impostor".
 */

// Constantes de configuración
const AVAILABLE_CATEGORIES = ['Acciones', 'Animales', 'Comida', 'Lugar', 'Objetos'];
const CUSTOM_CAT_KEY = 'Personalizado';
const MAX_NAME_LENGTH = 15;
const MAX_WORD_LENGTH = 25;
const MIN_CUSTOM_WORDS = 5;
const MAX_CUSTOM_WORDS = 20;

let gameState = {
    players: [], 
    config: {
        impostorCount: 1, 
        categories: [],
        customWords: [] 
    },
    secretWord: '',
    impostorHint: '',
    currentCategory: '',
    startTime: null,
    impostorsFound: 0
};

async function initImpostorGame() {
    //SessionStorage para que los datos se mantengan solo durante la sesión actual(navegador abierto)
    const storedCustom = sessionStorage.getItem('impostor_custom_words');
    if (storedCustom) {
        try {
            gameState.config.customWords = JSON.parse(storedCustom);
        } catch (e) { console.error("Error cargando datos de sesión", e); }
    }
    renderConfigurationPhase();
}

// --- FASE 1: CONFIGURACIÓN ---
function renderConfigurationPhase() {
    const container = document.getElementById('game-container');
    
    const savedPlayerCount = gameState.players.length > 0 ? gameState.players.length : 4;
    const calculateMaxImpostors = (players) => Math.max(1, Math.ceil(players / 2) - 1);
    
    const initialMaxImpostors = calculateMaxImpostors(savedPlayerCount);
    let savedImpostorCount = gameState.config.impostorCount > 0 ? gameState.config.impostorCount : 1;
    if (savedImpostorCount > initialMaxImpostors) savedImpostorCount = initialMaxImpostors;

    const selectedCategories = gameState.config.categories.length > 0 
        ? gameState.config.categories 
        : [...AVAILABLE_CATEGORIES];

    const categoriesHTML = AVAILABLE_CATEGORIES.map(cat => {
        const isChecked = selectedCategories.includes(cat) ? 'checked' : '';
        return `<label><input type="checkbox" name="category" value="${cat}" ${isChecked}> ${cat}</label>`;
    }).join('');

    const isCustomChecked = selectedCategories.includes(CUSTOM_CAT_KEY) ? 'checked' : '';
    const customHiddenClass = isCustomChecked ? '' : 'hidden';

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
                        ${categoriesHTML}
                        <label style="color: var(--primary-color); font-weight:bold;">
                            <input type="checkbox" name="category" value="${CUSTOM_CAT_KEY}" id="chk-custom" ${isCustomChecked}> 
                            ${CUSTOM_CAT_KEY}
                        </label>
                    </div>
                </div>

                <div id="custom-config-area" class="custom-area ${customHiddenClass} center-text" style="margin-top:1rem; border-top:1px solid #ccc; padding-top:1rem;">
                    <h3>Palabras Personalizadas (${MIN_CUSTOM_WORDS}-${MAX_CUSTOM_WORDS})</h3>
                    <p class="small-text">Máx ${MAX_WORD_LENGTH} caracteres.</p>
                    <div id="custom-words-list"></div>
                    <button type="button" id="btn-add-word" class="button-secondary small" style="margin-top:0.5rem;">+ Añadir Palabra</button>
                    <br><br>
                </div>

                <p id="game-error" class="error-text hidden center-text"></p>
                <button type="submit" class="button-primary center">Siguiente</button>
            </form>
        </div>
    `;

    const numPlayersInput = document.getElementById('num-players');
    const playersValDisplay = document.getElementById('players-val');
    const numImpostorsInput = document.getElementById('num-impostors');
    const impostorsValDisplay = document.getElementById('impostors-val');
    const namesContainer = document.getElementById('player-names-container');
    const chkCustom = document.getElementById('chk-custom');
    const customArea = document.getElementById('custom-config-area');
    const customListContainer = document.getElementById('custom-words-list');
    const btnAddWord = document.getElementById('btn-add-word');

    const generateNameInputs = (num) => {
        const currentInputs = document.querySelectorAll('.player-name-input');
        const currentNamesFromDom = Array.from(currentInputs).map(i => i.value);

        namesContainer.innerHTML = '';
        for (let i = 0; i < num; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Jugador ${i + 1}`;
            input.maxLength = MAX_NAME_LENGTH;
            input.required = true;
            input.value = currentNamesFromDom[i] || gameState.players[i]?.name || ''; 
            input.className = 'player-name-input';
            namesContainer.appendChild(input);
        }
    };

    const renderCustomInputs = () => {
        let wordsToRender = gameState.config.customWords;
        // Rellenar hasta el mínimo si hace falta
        while (wordsToRender.length < MIN_CUSTOM_WORDS) {
            wordsToRender.push({ word: '', hint: '' });
        }
        customListContainer.innerHTML = '';
        wordsToRender.forEach((obj, index) => addCustomRowToDOM(obj.word, obj.hint, index));
        updateCustomUI();
    };

    const addCustomRowToDOM = (valWord, valHint, index) => {
        const row = document.createElement('div');
        row.className = 'custom-row';
        row.style.display = 'flex';
        row.style.gap = '0.5rem';
        row.style.marginBottom = '0.5rem';
        
        row.innerHTML = `
            <span style="align-self:center;">${index + 1}.</span>
            <input type="text" class="custom-input word" placeholder="Palabra" maxlength="${MAX_WORD_LENGTH}" required style="flex:1;">
            <input type="text" class="custom-input hint" placeholder="Pista" maxlength="${MAX_WORD_LENGTH}" required style="flex:1;">
            <button type="button" class="btn-remove-row" style="background:var(--error-color, red); color:white; border:none; border-radius:4px; cursor:pointer; width:50px;">X </button>
        `;

        const wordInput = row.querySelector('.word');
        const hintInput = row.querySelector('.hint');
        wordInput.value = valWord || '';
        hintInput.value = valHint || '';
        
        row.querySelector('.btn-remove-row').addEventListener('click', () => {
            const currentRows = customListContainer.querySelectorAll('.custom-row');
            
            if (currentRows.length > MIN_CUSTOM_WORDS) {
                // Si hay más del mínimo, eliminamos la fila
                row.remove();
            } else {
                // Si estamos en el mínimo, solo limpiamos el contenido
                wordInput.value = '';
                hintInput.value = '';
            }
            updateCustomUI();
        });
        
        customListContainer.appendChild(row);
    };

    const updateCustomUI = () => {
        const rows = customListContainer.querySelectorAll('.custom-row');
        // Renumerar índices visuales
        rows.forEach((row, idx) => row.querySelector('span').textContent = `${idx + 1}.`);
        
        btnAddWord.style.display = rows.length >= MAX_CUSTOM_WORDS ? 'none' : 'inline-block';
    };

    numPlayersInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        playersValDisplay.textContent = val;
        const maxImpostors = calculateMaxImpostors(val);
        numImpostorsInput.max = maxImpostors;
        impostorsValDisplay.textContent = numImpostorsInput.value;
        generateNameInputs(val);
    });

    numImpostorsInput.addEventListener('input', (e) => {
        impostorsValDisplay.textContent = e.target.value;
    });

    chkCustom.addEventListener('change', (e) => {
        if (e.target.checked) {
            customArea.classList.remove('hidden');
            renderCustomInputs();
        } else {
            customArea.classList.add('hidden');
            customListContainer.innerHTML = ''; 
        }
    });

    btnAddWord.addEventListener('click', () => {
        const currentCount = customListContainer.querySelectorAll('.custom-row').length;
        if (currentCount < MAX_CUSTOM_WORDS) {
            addCustomRowToDOM('', '', currentCount);
            updateCustomUI();
        }
    });

    generateNameInputs(savedPlayerCount);
    if (isCustomChecked) renderCustomInputs();

    document.getElementById('game-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('game-error');
        errorEl.classList.add('hidden');

        const nameInputs = document.querySelectorAll('.player-name-input');
        const names = Array.from(nameInputs).map(i => 
            i.value.trim().substring(0, MAX_NAME_LENGTH).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        );

        const categories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
        const useCustom = categories.includes(CUSTOM_CAT_KEY);
        const standardCategories = categories.filter(c => c !== CUSTOM_CAT_KEY);

        if (useCustom && standardCategories.length < 1) {
            errorEl.textContent = 'Debes seleccionar al menos una categoría "Predefinida" para poder añadir la Personalizada.';
            errorEl.classList.remove('hidden');
            return;
        }
        if (categories.length === 0) {
            errorEl.textContent = 'Selecciona al menos una categoría.';
            errorEl.classList.remove('hidden');
            return;
        }

        const impostorCount = parseInt(numImpostorsInput.value, 10);
        
        let cleanCustomWords = [];
        if (useCustom) {
            const rows = customListContainer.querySelectorAll('.custom-row');
            cleanCustomWords = Array.from(rows).map(row => ({
                word: row.querySelector('.word').value.trim().substring(0, MAX_WORD_LENGTH).replace(/</g, "&lt;"),
                hint: row.querySelector('.hint').value.trim().substring(0, MAX_WORD_LENGTH).replace(/</g, "&lt;")
            })).filter(item => item.word && item.hint); // Filtramos vacíos por seguridad

            if (cleanCustomWords.length < MIN_CUSTOM_WORDS || cleanCustomWords.length > MAX_CUSTOM_WORDS) {
                errorEl.textContent = `La categoría personalizada requiere entre ${MIN_CUSTOM_WORDS} y ${MAX_CUSTOM_WORDS} palabras completas.`;
                errorEl.classList.remove('hidden');
                return;
            }
            sessionStorage.setItem('impostor_custom_words', JSON.stringify(cleanCustomWords));
        }

        gameState.config.impostorCount = impostorCount;
        gameState.config.categories = categories;
        gameState.config.customWords = cleanCustomWords;

        const finalCategory = categories[Math.floor(Math.random() * categories.length)];

        try {
            if (finalCategory === CUSTOM_CAT_KEY) {
                const pick = cleanCustomWords[Math.floor(Math.random() * cleanCustomWords.length)];
                gameState.currentCategory = CUSTOM_CAT_KEY;
                gameState.secretWord = pick.word;
                gameState.impostorHint = pick.hint;
                await new Promise(r => setTimeout(r, 500));
            } else {
                const response = await fetch('/api/games/impostor/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categories: [finalCategory] })
                });
                
                if (!response.ok) throw new Error('Error al conectar con servidor.');
                const data = await response.json();

                gameState.currentCategory = data.category;
                gameState.secretWord = data.word;
                gameState.impostorHint = data.impostorHint;
            }

            gameState.players = names.map(name => ({ name, role: 'player', isEliminated: false }));
            
            let assigned = 0;
            while (assigned < impostorCount) {
                const idx = Math.floor(Math.random() * gameState.players.length);
                if (gameState.players[idx].role !== 'impostor') {
                    gameState.players[idx].role = 'impostor';
                    assigned++;
                }
            }
            renderPresentationPhase(0);

        } catch (error) {
            console.error(error);
            errorEl.textContent = 'Error iniciando partida.';
            errorEl.classList.remove('hidden');
        }
    });
}

// --- FASE 2: PRESENTACIÓN ---
function renderPresentationPhase(playerIndex) {
    const container = document.getElementById('game-container');
    
    if (playerIndex >= gameState.players.length) {
        renderStartPlayerPhase(); 
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
                ${playerIndex === gameState.players.length - 1 ? 'Continuar' : 'Siguiente Jugador'}
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

// --- FASE 3 SELECCIÓN JUGADOR INICIAL ---
function renderStartPlayerPhase() {
    const container = document.getElementById('game-container');
    
    // Elegir aleatoriamente a cualquiera de los jugadores para empezar
    const starterIndex = Math.floor(Math.random() * gameState.players.length);
    const starterPlayer = gameState.players[starterIndex];

    container.innerHTML = `
        <div class="game-phase center-text animate-fade-in">
            <h2>EMPIEZA</h2>
            <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 12px; display:inline-block; border: 2px solid var(--primary-color);">
                <h1 style="color: var(--primary-color); margin:0;">${starterPlayer.name}</h1>
            </div>
            
            <p class="small-text" style="margin-top:2rem;">Cuando estéis listos, iniciad la ronda.</p>
            <button id="start-voting-btn" class="button-primary">Empezar Ronda 1</button>
        </div>
    `;

    document.getElementById('start-voting-btn').addEventListener('click', () => {
        gameState.startTime = new Date(); // El tiempo cuenta desde que empieza el debate
        renderVotingPhase(1);
    });
}

// --- FASE 4: VOTACIÓN ---
function renderVotingPhase(roundNumber) {
    const container = document.getElementById('game-container');
    const activePlayers = gameState.players.filter(p => !p.isEliminated);
    const activeImpostors = activePlayers.filter(p => p.role === 'impostor').length;

    if (activeImpostors === 0) { renderResults('Jugadores'); return; }
    
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

// --- FASE 5: RESULTADOS ---
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