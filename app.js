// Pokémon Typen-Meister - Hauptanwendung

// Typen-Effektivitäts-Matrix (Angreifer -> Verteidiger)
const TYPE_EFFECTIVENESS = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// Alle 18 Typen
const ALL_TYPES = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

// Generation-Grenzen (Pokémon-ID-Bereiche)
const GENERATION_RANGES = {
    1: { start: 1, end: 151, starters: [1, 4, 7], name: 'Kanto' },
    2: { start: 152, end: 251, starters: [152, 155, 158], name: 'Johto' },
    3: { start: 252, end: 386, starters: [252, 255, 258], name: 'Hoenn' },
    4: { start: 387, end: 493, starters: [387, 390, 393], name: 'Sinnoh' },
    5: { start: 494, end: 649, starters: [495, 498, 501], name: 'Einall' },
    6: { start: 650, end: 721, starters: [650, 653, 656], name: 'Kalos' },
    7: { start: 722, end: 809, starters: [722, 725, 728], name: 'Alola' },
    8: { start: 810, end: 905, starters: [810, 813, 816], name: 'Galar' },
    9: { start: 906, end: 1025, starters: [906, 909, 912], name: 'Paldea' }
};

// App State
let gameState = {
    difficulty: null,
    questionCount: null,
    selectedGenerations: [],
    megaEvolutions: false,
    regionalForms: false,
    currentQuestion: 0,
    score: 0,
    pokemonList: [],
    currentPokemon: null,
    selectedTypes: [],
    correctAnswers: [],
    results: []
};

// DOM Elemente
const screens = {
    start: document.getElementById('start-screen'),
    difficulty: document.getElementById('difficulty-screen'),
    questionCount: document.getElementById('question-count-screen'),
    generation: document.getElementById('generation-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen'),
    hallOfFame: document.getElementById('hall-of-fame-screen')
};

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    createTypesGrid();
    createGenerationTiles();
});

function initializeEventListeners() {
    // Startbildschirm
    document.getElementById('start-btn').addEventListener('click', () => showScreen('difficulty'));
    document.getElementById('hall-of-fame-btn').addEventListener('click', showHallOfFame);
    
    // Schwierigkeitsgrad
    document.querySelectorAll('.difficulty-tile').forEach(tile => {
        tile.addEventListener('click', () => selectDifficulty(tile));
    });
    document.getElementById('back-from-difficulty').addEventListener('click', () => showScreen('start'));
    
    // Fragenanzahl
    document.querySelectorAll('.count-btn').forEach(btn => {
        btn.addEventListener('click', () => selectQuestionCount(btn));
    });
    document.getElementById('back-from-count').addEventListener('click', () => showScreen('difficulty'));
    
    // Generationen
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('back-from-generation').addEventListener('click', () => showScreen('questionCount'));
    
    // Spiel
    document.getElementById('pokemon-center-btn').addEventListener('click', () => {
        if (confirm('Möchtest du wirklich zum Start zurückkehren? Dein Fortschritt geht verloren.')) {
            showScreen('start');
        }
    });
    document.getElementById('confirm-btn').addEventListener('click', confirmAnswer);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    
    // Ergebnis
    document.getElementById('play-again-btn').addEventListener('click', () => showScreen('start'));
    document.getElementById('hall-of-fame-btn-2').addEventListener('click', showHallOfFame);
    document.getElementById('back-to-start-btn').addEventListener('click', () => showScreen('start'));
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    }
}

function selectDifficulty(tile) {
    document.querySelectorAll('.difficulty-tile').forEach(t => t.classList.remove('selected'));
    tile.classList.add('selected');
    gameState.difficulty = tile.dataset.difficulty;
    
    // Weiter nach kurzer Verzögerung
    setTimeout(() => {
        showScreen('questionCount');
    }, 300);
}

function selectQuestionCount(btn) {
    document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    gameState.questionCount = parseInt(btn.dataset.count);
    
    // Weiter nach kurzer Verzögerung
    setTimeout(() => {
        showScreen('generation');
    }, 300);
}

async function createGenerationTiles() {
    const grid = document.querySelector('.generation-grid');
    grid.innerHTML = '';
    
    for (let gen = 1; gen <= 9; gen++) {
        const genData = GENERATION_RANGES[gen];
        const tile = document.createElement('div');
        tile.className = 'tile generation-tile';
        tile.dataset.generation = gen;
        
        // Lade Starter-Pokémon Bilder
        const starterImages = await Promise.all(
            genData.starters.map(async (id) => {
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                    const data = await response.json();
                    return data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
                } catch {
                    return null;
                }
            })
        );
        
        tile.innerHTML = `
            <div class="tile-header">
                <h3>Gen ${gen}</h3>
            </div>
            <p style="color: var(--text-light); margin-bottom: 1rem; font-size: 0.9rem;">${genData.name}</p>
            <div class="starter-pokemon">
                ${starterImages.map(img => 
                    img ? `<img src="${img}" alt="Starter">` : '<div style="width: 60px; height: 60px;"></div>'
                ).join('')}
            </div>
        `;
        
        tile.addEventListener('click', () => toggleGeneration(gen, tile));
        grid.appendChild(tile);
    }
}

function toggleGeneration(gen, tile) {
    const index = gameState.selectedGenerations.indexOf(gen);
    if (index > -1) {
        gameState.selectedGenerations.splice(index, 1);
        tile.classList.remove('selected');
    } else {
        gameState.selectedGenerations.push(gen);
        tile.classList.add('selected');
    }
    
    // Aktiviere Start-Button nur wenn mindestens eine Generation ausgewählt ist
    document.getElementById('start-game-btn').disabled = gameState.selectedGenerations.length === 0;
}

function createTypesGrid() {
    const grid = document.getElementById('types-grid');
    grid.innerHTML = '';
    
    ALL_TYPES.forEach(type => {
        const btn = document.createElement('button');
        btn.className = `type-btn type-${type}`;
        btn.textContent = getTypeNameGerman(type);
        btn.dataset.type = type;
        btn.addEventListener('click', () => toggleType(type, btn));
        grid.appendChild(btn);
    });
}

function getTypeNameGerman(type) {
    const typeNames = {
        normal: 'Normal',
        fire: 'Feuer',
        water: 'Wasser',
        electric: 'Elektro',
        grass: 'Pflanze',
        ice: 'Eis',
        fighting: 'Kampf',
        poison: 'Gift',
        ground: 'Boden',
        flying: 'Flug',
        psychic: 'Psycho',
        bug: 'Käfer',
        rock: 'Gestein',
        ghost: 'Geist',
        dragon: 'Drache',
        dark: 'Unlicht',
        steel: 'Stahl',
        fairy: 'Fee'
    };
    return typeNames[type] || type;
}

function toggleType(type, btn) {
    if (btn.disabled) return;
    
    const index = gameState.selectedTypes.indexOf(type);
    if (index > -1) {
        gameState.selectedTypes.splice(index, 1);
        btn.classList.remove('selected');
    } else {
        gameState.selectedTypes.push(type);
        btn.classList.add('selected');
    }
    
    document.getElementById('confirm-btn').disabled = gameState.selectedTypes.length === 0;
    updateChoiceCount();
}

function updateChoiceCount() {
    const choiceCountEl = document.getElementById('choice-count');
    if (choiceCountEl) {
        choiceCountEl.textContent = gameState.selectedTypes.length;
    }
}

async function startGame() {
    if (gameState.selectedGenerations.length === 0) {
        alert('Bitte wähle mindestens eine Generation aus!');
        return;
    }
    
    // Lade Einstellungen
    gameState.megaEvolutions = document.getElementById('mega-evolutions').checked;
    gameState.regionalForms = document.getElementById('regional-forms').checked;
    
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.results = [];
    gameState.pokemonList = [];
    
    // Lade Pokémon-Liste
    showScreen('game');
    document.getElementById('current-question').textContent = '0';
    document.getElementById('total-questions').textContent = gameState.questionCount;
    document.getElementById('current-score').textContent = '0';
    
    await loadPokemonList();
    if (gameState.pokemonList.length === 0) {
        alert('Fehler beim Laden der Pokémon. Bitte versuche es erneut.');
        showScreen('start');
        return;
    }
    
    nextQuestion();
}

async function loadPokemonList() {
    try {
        let pokemonIds = [];
        
        // Sammle IDs aus allen ausgewählten Generationen
        for (const gen of gameState.selectedGenerations) {
            const range = GENERATION_RANGES[gen];
            for (let id = range.start; id <= range.end; id++) {
                pokemonIds.push(id);
            }
        }
        
        // Filtere Mega-Entwicklungen und Regionalformen falls nötig
        // Für jetzt nehmen wir alle Pokémon, die API-Filterung wäre komplexer
        const shuffled = pokemonIds.sort(() => Math.random() - 0.5);
        const selectedIds = shuffled.slice(0, gameState.questionCount);
        
        // Lade Pokémon-Daten
        for (const id of selectedIds) {
            try {
                const pokemon = await fetchPokemonData(id);
                if (pokemon) {
                    gameState.pokemonList.push(pokemon);
                }
            } catch (error) {
                console.error(`Fehler beim Laden von Pokémon ${id}:`, error);
            }
        }
    } catch (error) {
        console.error('Fehler beim Laden der Pokémon-Liste:', error);
    }
}

async function fetchPokemonData(id) {
    try {
        // Hole Pokémon-Daten
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!pokemonResponse.ok) return null;
        const pokemonData = await pokemonResponse.json();
        
        // Hole Species-Daten für deutschen Namen
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        if (!speciesResponse.ok) return null;
        const speciesData = await speciesResponse.json();
        
        // Finde deutschen Namen
        const germanName = speciesData.names.find(name => name.language.name === 'de');
        const name = germanName ? germanName.name : pokemonData.name;
        
        // Extrahiere Typen
        const types = pokemonData.types.map(t => t.type.name);
        
        // Hole Official Artwork
        const imageUrl = pokemonData.sprites.other['official-artwork'].front_default || 
                        pokemonData.sprites.front_default;
        
        return {
            id: id,
            name: name,
            types: types,
            imageUrl: imageUrl
        };
    } catch (error) {
        console.error(`Fehler beim Abrufen von Pokémon ${id}:`, error);
        return null;
    }
}

function nextQuestion() {
    if (gameState.currentQuestion >= gameState.pokemonList.length) {
        showResults();
        return;
    }
    
    gameState.currentPokemon = gameState.pokemonList[gameState.currentQuestion];
    gameState.selectedTypes = [];
    gameState.correctAnswers = [];
    
    // Berechne korrekte Antworten
    gameState.correctAnswers = calculateEffectiveTypes(gameState.currentPokemon.types);
    
    // Update UI
    document.getElementById('current-question').textContent = gameState.currentQuestion + 1;
    document.getElementById('pokemon-name').textContent = gameState.currentPokemon.name;
    document.getElementById('pokemon-image').src = gameState.currentPokemon.imageUrl;
    document.getElementById('pokemon-image').alt = gameState.currentPokemon.name;
    
    // Update Stats
    const targetCountEl = document.getElementById('target-count');
    if (targetCountEl) {
        targetCountEl.textContent = gameState.correctAnswers.length;
    }
    updateChoiceCount();
    updateProgressBar();
    updateDifficultyBadge();
    
    // Reset Typen-Buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'incorrect', 'missed');
        btn.disabled = false;
    });
    
    // Zeige Hinweis bei Einfach-Modus
    const hintContainer = document.getElementById('hint-container');
    if (gameState.difficulty === 'easy') {
        hintContainer.style.display = 'block';
        const typeNames = gameState.currentPokemon.types.map(t => getTypeNameGerman(t)).join(' & ');
        document.getElementById('hint-text').textContent = 
            `Typen: ${typeNames} | Anzahl sehr effektiver Typen: ${gameState.correctAnswers.length}`;
    } else {
        hintContainer.style.display = 'none';
    }
    
    document.getElementById('confirm-btn').style.display = 'block';
    document.getElementById('confirm-btn').disabled = true;
    document.getElementById('next-btn').style.display = 'none';
    updateChoiceCount();
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar && gameState.questionCount) {
        const progress = ((gameState.currentQuestion) / gameState.questionCount) * 100;
        progressBar.style.width = progress + '%';
    }
}

function updateDifficultyBadge() {
    const difficultyBadge = document.getElementById('difficulty-badge');
    if (difficultyBadge) {
        const difficultyNames = {
            easy: 'EINFACH',
            normal: 'NORMAL',
            hard: 'SCHWER',
            hardcore: 'HARDCORE'
        };
        difficultyBadge.textContent = difficultyNames[gameState.difficulty] || 'NORMAL';
    }
}

function calculateEffectiveTypes(defenderTypes) {
    const effectiveTypes = [];
    
    for (const attackerType of ALL_TYPES) {
        let effectiveness = 1;
        
        // Berechne Effektivität gegen alle Verteidiger-Typen
        for (const defenderType of defenderTypes) {
            const typeEffect = TYPE_EFFECTIVENESS[attackerType] || {};
            const multiplier = typeEffect[defenderType] !== undefined ? typeEffect[defenderType] : 1;
            effectiveness *= multiplier;
        }
        
        // Nur Typen mit Schaden > 1x sind "sehr effektiv"
        if (effectiveness > 1) {
            effectiveTypes.push(attackerType);
        }
    }
    
    return effectiveTypes;
}

function confirmAnswer() {
    const selected = gameState.selectedTypes;
    const correct = gameState.correctAnswers;
    
    // Deaktiviere alle Buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    // Markiere Antworten
    document.querySelectorAll('.type-btn').forEach(btn => {
        const type = btn.dataset.type;
        btn.classList.remove('selected');
        
        const isCorrect = correct.includes(type);
        const isSelected = selected.includes(type);
        
        if (isCorrect && isSelected) {
            btn.classList.add('correct');
        } else if (isCorrect && !isSelected) {
            btn.classList.add('missed');
        } else if (!isCorrect && isSelected) {
            btn.classList.add('incorrect');
        }
    });
    
    // Berechne Punkte
    const points = calculatePoints(selected, correct);
    gameState.score += points;
    document.getElementById('current-score').textContent = gameState.score;
    updateProgressBar();
    
    // Speichere Ergebnis
    gameState.results.push({
        pokemon: gameState.currentPokemon.name,
        selected: [...selected],
        correct: [...correct],
        points: points
    });
    
    // Zeige Weiter-Button
    document.getElementById('confirm-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'block';
    
    gameState.currentQuestion++;
}

function calculatePoints(selected, correct) {
    const correctCount = selected.filter(t => correct.includes(t)).length;
    const incorrectCount = selected.filter(t => !correct.includes(t)).length;
    const missedCount = correct.filter(t => !selected.includes(t)).length;
    
    let points = 0;
    const basePoints = 100;
    
    switch (gameState.difficulty) {
        case 'easy':
            points = correctCount * (basePoints * 0.5) - incorrectCount * (basePoints * 0.1);
            break;
        case 'normal':
            points = correctCount * basePoints - incorrectCount * (basePoints * 0.5) - missedCount * (basePoints * 0.3);
            break;
        case 'hard':
            points = correctCount * (basePoints * 1.5) - incorrectCount * basePoints - missedCount * (basePoints * 0.5);
            break;
        case 'hardcore':
            points = correctCount * (basePoints * 2) - incorrectCount * (basePoints * 2) - missedCount * basePoints;
            break;
    }
    
    return Math.max(0, Math.round(points));
}

function showResults() {
    showScreen('result');
    
    const totalQuestions = gameState.results.length;
    const totalPoints = gameState.score;
    const correctAnswers = gameState.results.filter(r => 
        r.selected.length === r.correct.length && 
        r.selected.every(t => r.correct.includes(t))
    ).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0;
    const isWin = parseFloat(accuracy) >= 90;
    
    const resultContent = document.getElementById('result-content');
    resultContent.innerHTML = `
        <div style="text-align: center; margin: 2rem 0;">
            ${isWin ? '<span class="win-badge">🏆 SIEG!</span>' : '<span class="loss-badge">❌ Verloren</span>'}
            <p style="margin-top: 1rem; color: var(--text-light);">
                ${isWin ? 'Herzlichen Glückwunsch! Du hast das Quiz gemeistert!' : 
                  'Du brauchst mindestens 90% Genauigkeit für einen Sieg.'}
            </p>
        </div>
        
        <div class="result-stats">
            <div class="stat-item">
                <span class="stat-label">Runden gespielt:</span>
                <span class="stat-value">${totalQuestions}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Richtig beantwortet:</span>
                <span class="stat-value">${correctAnswers}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Genauigkeit:</span>
                <span class="stat-value">${accuracy}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Gesamtpunkte:</span>
                <span class="stat-value">${totalPoints}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Schwierigkeit:</span>
                <span class="stat-value">${getDifficultyName(gameState.difficulty)}</span>
            </div>
        </div>
    `;
    
    // Speichere Highscore falls gewonnen
    if (isWin) {
        saveHighscore({
            date: new Date().toLocaleDateString('de-DE'),
            accuracy: parseFloat(accuracy),
            points: totalPoints,
            questions: totalQuestions,
            difficulty: gameState.difficulty
        });
    }
}

function getDifficultyName(difficulty) {
    const names = {
        easy: 'Einfach',
        normal: 'Normal',
        hard: 'Schwer',
        hardcore: 'Hardcore'
    };
    return names[difficulty] || difficulty;
}

function saveHighscore(score) {
    let highscores = JSON.parse(localStorage.getItem('pokemon-typen-meister-highscores') || '[]');
    highscores.push(score);
    highscores.sort((a, b) => {
        if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        return b.points - a.points;
    });
    highscores = highscores.slice(0, 50); // Maximal 50 Einträge
    localStorage.setItem('pokemon-typen-meister-highscores', JSON.stringify(highscores));
}

function showHallOfFame() {
    showScreen('hallOfFame');
    
    const highscores = JSON.parse(localStorage.getItem('pokemon-typen-meister-highscores') || '[]');
    const content = document.getElementById('hall-of-fame-content');
    
    if (highscores.length === 0) {
        content.innerHTML = '<div class="empty-hall">Noch keine Einträge in der Ruhmeshalle. Spiele und gewinne, um hier zu erscheinen!</div>';
        return;
    }
    
    content.innerHTML = '<div class="hall-of-fame-list">' +
        highscores.map((score, index) => `
            <div class="hall-of-fame-item">
                <h3>#${index + 1} - ${score.accuracy}% Genauigkeit</h3>
                <p><strong>Punkte:</strong> ${score.points}</p>
                <p><strong>Runden:</strong> ${score.questions} | <strong>Schwierigkeit:</strong> ${getDifficultyName(score.difficulty)}</p>
                <p><strong>Datum:</strong> ${score.date}</p>
            </div>
        `).join('') +
        '</div>';
}
