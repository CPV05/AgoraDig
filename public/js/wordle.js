/**
 * @file wordle.js
 * @description Lógica del cliente para Wordle.
 */

window.initWordleGame = function() {
    // Referencias al DOM
    const board = document.getElementById('board');
    const keyboard = document.getElementById('keyboard');
    const overlay = document.getElementById('game-overlay');
    const messageTitle = document.getElementById('message-area');
    const messageDetails = document.getElementById('message-details');
    const restartBtn = document.getElementById('restart-btn');

    // Seguridad: Validación de elementos críticos
    if (!board || !keyboard || !overlay || !restartBtn) {
        console.error("Error crítico: Elementos del DOM de Wordle no encontrados.");
        return;
    }

    let secretWord = ""; 
    let currentRow = 0;
    let currentTile = 0;
    let isGameOver = false;
    
    // Matriz lógica del estado del juego
    let guesses = Array(6).fill(null).map(() => Array(5).fill(""));

    // ==========================================
    // INICIO Y REINICIO DEL JUEGO
    // ==========================================

    async function initGame() {
        resetUI(); // Limpia tablero y oculta overlay
        
        try {
            restartBtn.textContent = "Cargando...";
            restartBtn.disabled = true;

            const response = await fetch('/api/games/wordle/init', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 401) {
                showGameOver("Sesión Expirada", "Por favor, recarga la página y vuelve a iniciar sesión.", "error");
                return;
            }

            if (!response.ok) throw new Error('Error al conectar con el servidor');
            
            const data = await response.json();
            secretWord = data.word;

            createBoard();
            setupListeners(); // Configurar listeners nuevos y limpios

        } catch (error) {
            console.error(error);
            showGameOver("Error de Conexión", "No se pudo iniciar el juego. Inténtalo de nuevo.", "error");
        } finally {
             restartBtn.textContent = "Jugar de Nuevo";
             restartBtn.disabled = false;
        }
    }

    function resetUI() {
        isGameOver = false;
        currentRow = 0;
        currentTile = 0;
        guesses = Array(6).fill(null).map(() => Array(5).fill(""));
        
        board.innerHTML = ''; 
        
        // FIX PRINCIPAL: Aseguramos ocultar el overlay añadiendo 'hidden' y quitando 'show'
        overlay.classList.remove('show');
        overlay.classList.add('hidden'); 

        // Resetear teclado visual
        keyboard.querySelectorAll('button').forEach(btn => {
            btn.className = '';
            if (btn.dataset.key === 'ENTER' || btn.dataset.key === 'BACKSPACE') {
                btn.className = 'wide-key';
            }
        });
    }

    function createBoard() {
        for (let r = 0; r < 6; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'wordle-row';
            rowDiv.id = `row-${r}`;
            for (let c = 0; c < 5; c++) {
                const tileDiv = document.createElement('div');
                tileDiv.className = 'tile';
                tileDiv.id = `row-${r}-tile-${c}`;
                rowDiv.appendChild(tileDiv);
            }
            board.appendChild(rowDiv);
        }
    }

    // ==========================================
    // MANEJO DE EVENTOS (HANDLERS)
    // ==========================================
    
    // Definimos los handlers fuera para poder referenciarlos en removeEventListener
    const handleVirtualClick = (e) => {
        if (e.target.matches('button')) handleInput(e.target.dataset.key);
    };

    const handlePhysicalKey = (e) => {
        if (isGameOver) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key.toUpperCase();
        if (key === 'ENTER') handleInput('ENTER');
        else if (key === 'BACKSPACE') handleInput('BACKSPACE');
        else if (/^[A-ZÑ]$/.test(key)) handleInput(key);
    };

    const handleRestartClick = (e) => {
        e.preventDefault();
        initGame();
    };

    function setupListeners() {
        // FIX BUG REINICIO: Limpiamos explícitamente los listeners anteriores
        keyboard.removeEventListener('click', handleVirtualClick);
        document.removeEventListener('keydown', handlePhysicalKey);
        restartBtn.removeEventListener('click', handleRestartClick);

        // Añadimos los nuevos
        keyboard.addEventListener('click', handleVirtualClick);
        document.addEventListener('keydown', handlePhysicalKey);
        restartBtn.addEventListener('click', handleRestartClick);
    }

    // ==========================================
    // LÓGICA DEL JUEGO
    // ==========================================

    function handleInput(key) {
        if (isGameOver) return;
        if (key === 'Ñ') key = 'N';

        if (key === 'BACKSPACE' || key === '⌫') {
            deleteLetter();
        } else if (key === 'ENTER' || key === 'ENVIAR') {
            checkRow();
        } else if (/^[A-Z]$/.test(key)) {
            addLetter(key);
        }
    }

    function addLetter(letter) {
        if (currentTile < 5 && currentRow < 6) {
            const tile = document.getElementById(`row-${currentRow}-tile-${currentTile}`);
            tile.textContent = letter;
            tile.setAttribute('data-status', 'active');
            guesses[currentRow][currentTile] = letter;
            currentTile++;
        }
    }

    function deleteLetter() {
        if (currentTile > 0) {
            currentTile--;
            const tile = document.getElementById(`row-${currentRow}-tile-${currentTile}`);
            tile.textContent = '';
            tile.removeAttribute('data-status');
            guesses[currentRow][currentTile] = "";
        }
    }

    function checkRow() {
        if (currentTile < 5) return; // Faltan letras

        const guess = guesses[currentRow].join("");
        flipTiles(guess);
        
        if (guess === secretWord) {
            isGameOver = true;
            setTimeout(() => {
                showGameOver("¡Felicidades! 🎉", `Has adivinado la palabra en ${currentRow + 1} intentos.`, "success");
            }, 1500);
        } else {
            if (currentRow >= 5) {
                isGameOver = true;
                setTimeout(() => {
                    showGameOver("Fin del Juego", `La palabra correcta era: **${secretWord}**`, "error");
                }, 1500);
            } else {
                currentRow++;
                currentTile = 0;
            }
        }
    }

    function flipTiles(guess) {
        const rowTiles = document.getElementById(`row-${currentRow}`).children;
        let checkSecretWord = secretWord;
        const guessArray = guess.split("");
        const resultColors = Array(5).fill('absent');

        guessArray.forEach((letter, i) => {
            if (letter === secretWord[i]) {
                resultColors[i] = 'correct';
                checkSecretWord = checkSecretWord.substring(0, i) + "_" + checkSecretWord.substring(i + 1);
            }
        });

        guessArray.forEach((letter, i) => {
            if (resultColors[i] === 'correct') return;
            if (checkSecretWord.includes(letter)) {
                resultColors[i] = 'present';
                checkSecretWord = checkSecretWord.replace(letter, "_");
            }
        });

        guessArray.forEach((letter, i) => {
            setTimeout(() => {
                const tile = rowTiles[i];
                tile.classList.add('flip');
                tile.setAttribute('data-status', resultColors[i]);
                updateKeyboardColor(letter, resultColors[i]);
            }, 250 * i);
        });
    }

    function updateKeyboardColor(letter, status) {
        const keyBtn = document.querySelector(`button[data-key="${letter}"]`) || document.querySelector(`button[data-key="Ñ"]`);
        if (!keyBtn) return;

        const currentClasses = keyBtn.classList;
        if (status === 'correct') {
            keyBtn.className = 'correct';
        } else if (status === 'present' && !currentClasses.contains('correct')) {
            keyBtn.className = 'present';
        } else if (status === 'absent' && !currentClasses.contains('correct') && !currentClasses.contains('present')) {
            keyBtn.className = 'absent';
        }
    }

    // ==========================================
    // FUNCIONES VISUALES (OVERLAY)
    // ==========================================

    function showGameOver(title, details, type) {
        messageTitle.textContent = title;
        messageDetails.innerHTML = details.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        messageTitle.classList.remove('success', 'error');
        messageTitle.classList.add(type);
        
        // FIX PRINCIPAL: Primero quitamos 'hidden' para que display deje de ser none
        overlay.classList.remove('hidden');
        
        // Pequeño delay para permitir que el navegador procese el cambio de display
        // antes de aplicar la opacidad, asegurando la transición visual.
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });
    }

    // Iniciar el juego
    initGame();
};