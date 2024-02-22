document.addEventListener('DOMContentLoaded', () => {
    const gameField = document.getElementById('gameField');
    const startGameButton = document.getElementById('startGameButton');
    const playerNameInput = document.getElementById('playerNameInput');
    const mapSelect = document.getElementById('mapSelect');
    const loginScreen = document.getElementById('loginScreen');
    const displayName = document.getElementById('displayName');
    let playerLives = document.getElementById('playerLives');
    const finishPoint = document.createElement('div');
    let isPaused = false;
    let gameTimer, monsterSpawnTimer;
    finishPoint.className = 'finish';
    let lives = 5;
    let gameActive = false;
    let monsterCollisions = 0;
    let trapCollisions = 0;
    let startTime;

    const player = document.createElement('div');
    player.className = 'player';
    player.style.top = '0px';
    player.style.left = '0px';

    finishPoint.style.position = 'absolute';
    finishPoint.style.width = '100px';
    finishPoint.style.height = '100px';

    finishPoint.style.top = '400px'; 
    finishPoint.style.left = '600px';

    mapSelect.addEventListener('change', function() {
        document.body.className = ''; 
        document.body.classList.add(this.value); 
    });

    startGameButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('Пожалуйста, введите ваше имя.');
            return;
        }
        document.body.className = mapSelect.value;
        displayName.textContent = playerName;
        playerLives.textContent = lives;
        loginScreen.style.display = 'none';
        gameField.appendChild(player);
        gameField.appendChild(finishPoint);

        gameField.style.display = 'block';
        gameActive = true;
        startGame();
    });

    function moveMonsters() {
        monsters.forEach(monster => {
            const randomDirection = Math.floor(Math.random() * 16); 
            const step = 20; 
            switch (randomDirection) {
                case 0:
                    monster.style.top = Math.max(0, monster.offsetTop - step) + 'px';
                    break;
                case 1:
                    monster.style.top = Math.min(gameField.offsetHeight - 20, monster.offsetTop + step) + 'px';
                    break;
                case 2:
                    monster.style.left = Math.max(0, monster.offsetLeft - step) + 'px';
                    break;
                case 3:
                    monster.style.left = Math.min(gameField.offsetWidth - 20, monster.offsetLeft + step) + 'px';
                    break;
            }
            if (monster.offsetTop < 0 || monster.offsetTop > gameField.offsetHeight - 20 ||
                monster.offsetLeft < 0 || monster.offsetLeft > gameField.offsetWidth - 20) {
                gameField.removeChild(monster);
                monsters.splice(monsters.indexOf(monster), 1);
            }
        });
    }
    
    function startGame() {
        document.addEventListener('keydown', movePlayer);
        spawnMonstersAndTraps();
        updateCurrentTime();
        moveMonsters();
        startTime = Date.now();
        gameTimer = setInterval(updateGameTime, 1000); 
        monsterSpawnTimer = setInterval(spawnMonstersAndTraps, 3000); 
    }

    function updateGameTime() {
        const delta = Date.now() - startTime; 
        const seconds = Math.floor(delta / 1000) % 60;
        const minutes = Math.floor(delta / 60000);
        document.getElementById('gameElapsedTime').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function updateCurrentTime() {
        setInterval(() => {
            const now = new Date();
            document.getElementById("currentSystemTime").textContent = now.toTimeString().substring(0, 8);
        }, 1000);
    }

    function updatePlayerPosition() {
        player.style.top = `${playerPosition.y}px`;
        player.style.left = `${playerPosition.x}px`;
        checkCollisions();
        checkWinCondition();
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            isPaused ? resumeGame() : pauseGame();
        }
    });

    let playerPosition = { x: 0, y: 0 };

    function movePlayer(e) {
        if (!gameActive || isPaused) return;
        const step = 20; 
        switch (e.key) {
            case 'ArrowUp': playerPosition.y = Math.max(0, playerPosition.y - step); break;
            case 'ArrowDown': playerPosition.y = Math.min(gameField.offsetHeight - 20, playerPosition.y + step); break;
            case 'ArrowLeft': playerPosition.x = Math.max(0, playerPosition.x - step); break;
            case 'ArrowRight': playerPosition.x = Math.min(gameField.offsetWidth - 20, playerPosition.x + step); break;
        }
        updatePlayerPosition();
    }

    let monsters = [];
    let traps = [];
    
    function spawnMonstersAndTraps() {
        monsters.forEach(monster => gameField.removeChild(monster));
        monsters = [];

        for (let i = 0; i < 10; i++) {
            const monster = document.createElement('div');
            monster.className = 'monster';
            monster.style.top = `${Math.random() * (gameField.offsetHeight - 20)}px`;
            monster.style.left = `${Math.random() * (gameField.offsetWidth - 20)}px`;
            gameField.appendChild(monster);
            monsters.push(monster);
        }

        if (traps.length < 2) {
            const trap = document.createElement('div');
            trap.className = 'trap';
            const trapX = Math.random() * (gameField.offsetWidth - 20);
            const trapY = Math.random() * (gameField.offsetHeight - 20);
            trap.style.top = `${trapY}px`;
            trap.style.left = `${trapX}px`;
            gameField.appendChild(trap);
            traps.push(trap);
        }
    }
    
    

    function checkCollisions() {
        monsters.forEach((monster, index) => {
            if (isCollide(player, monster)) {
                gameField.removeChild(monster);
                monsters.splice(index, 1); 
                lives -= 1; 
                playerLives.textContent = lives; 
                monsterCollisions++; 
                if (lives <= 0) {
                    alert("Вы проиграли!");
                    gameActive = false;
                    pauseGameEnd();
                    showResults();
                }
            }
        });
    
        traps.forEach((trap, index) => {
            if (isCollide(player, trap)) {
                gameField.removeChild(trap);
                traps.splice(index, 1);
                lives -= 1; 
                playerLives.textContent = lives; 
                trapCollisions++; 
                if (lives <= 0) {
                    alert("Вы проиграли !\#_____#/!");
                    gameActive = false;
                    pauseGameEnd();
                    showResults();
                }
            }
        });
    }

    function checkWinCondition() {
        if (isCollide(player, finishPoint)) {
            alert("Поздравляем! Победааааа!!!!!! ");
            gameActive = false;
            showResults();
        }
    }

    function isCollide(a, b) {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return !(
            ((aRect.top + aRect.height) < (bRect.top)) ||
            (aRect.top > (bRect.top + bRect.height)) ||
            ((aRect.left + aRect.width) < bRect.left) ||
            (aRect.left > (bRect.left + bRect.width))
        );
    }

    function checkWinCondition() {
        if (isCollide(player, finishPoint)) {
            showResults(true); 
            gameActive = false; 
            pauseGameEnd(); 
        }
    }
    
    function showResults(playerWon) {
        const elapsedTime = Date.now() - startTime;
        const seconds = Math.floor((elapsedTime / 1000) % 60);
        const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    
        resultTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        resultMonsters.textContent = monsterCollisions;
        resultTraps.textContent = trapCollisions;
        resultLives.textContent = lives;
    
        resultScreen.style.display = 'block';
    
        if (playerWon) {
            gameActive = false; 
            pauseGameEnd(); 
        }
    }
    
    function pauseGameEnd() {
        clearInterval(gameTimer);
        clearInterval(monsterSpawnTimer);
        
        isPaused = true;
    }

    function pauseGame() {
        clearInterval(gameTimer);
        clearInterval(monsterSpawnTimer);
        
        isPaused = true;
        alert('Игра Остановлена');
    }

    function resumeGame() {
        updateGameTime();
        gameTimer = setInterval(updateGameTime, 1000); 
        monsterSpawnTimer = setInterval(spawnMonstersAndTraps, 3000); 
        isPaused = false;
        alert('Игра Продолжается');
    }

    function movePlayer(e) {
        if (!gameActive || isPaused) return;
        const step = 20; 
        let newX = playerPosition.x;
        let newY = playerPosition.y;
        switch (e.key) {
            case 'ArrowUp': newY = Math.max(0, playerPosition.y - step); break;
            case 'ArrowDown': newY = Math.min(gameField.offsetHeight - 20, playerPosition.y + step); break;
            case 'ArrowLeft': newX = Math.max(0, playerPosition.x - step); break;
            case 'ArrowRight': newX = Math.min(gameField.offsetWidth - 20, playerPosition.x + step); break;
        }
        if (isPositionValid(newX, newY)) {
            playerPosition.x = newX;
            playerPosition.y = newY;
            updatePlayerPosition();
        }
    }
    
    function isPositionValid(x, y) {
        return x >= 0 && y >= 0 && x <= gameField.offsetWidth - 20 && y <= gameField.offsetHeight - 20;
    }

    document.getElementById('restartGameButton').addEventListener('click', () => {
        document.location.reload(); 
    });
});