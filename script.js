// Phone Emulator Controller

class PhoneEmulator {
    constructor() {
        this.currentScreen = 'lock';
        this.init();
    }

    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        window.phoneInstance = this;
    }

    cacheElements() {
        this.lockScreen = document.getElementById('lockScreen');
        this.homeScreen = document.getElementById('homeScreen');
        this.screen = document.getElementById('screen');
        this.appGrid = document.getElementById('appGrid');
        this.quickPanel = document.getElementById('quickPanel');
        this.quickPanelToggle = document.getElementById('quickPanelToggle');
        this.closeQuickPanel = document.getElementById('closeQuickPanel');
        this.homeBtn = document.getElementById('homeBtn');
        this.backBtn = document.getElementById('backBtn');
        this.recentBtn = document.getElementById('recentBtn');
        this.brightnesSlider = document.getElementById('brightness');
    }

    attachEventListeners() {
        // Lock screen unlock
        this.lockScreen.addEventListener('click', () => this.unlockPhone());
        this.lockScreen.addEventListener('swipeup', () => this.unlockPhone());

        // Unlock button
        const unlockBtn = document.getElementById('unlockBtn');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.unlockPhone();
            });
        }

        // App grid
        this.appGrid.addEventListener('click', (e) => this.handleAppLaunch(e));

        // Quick panel
        this.quickPanelToggle.addEventListener('click', () => this.toggleQuickPanel());
        this.closeQuickPanel.addEventListener('click', () => this.closeQuickPanelFn());

        // Quick toggles
        document.querySelectorAll('.quick-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleQuickSetting(e));
        });

        // Brightness
        this.brightnesSlider.addEventListener('input', (e) => this.adjustBrightness(e));

        // App back buttons
        document.querySelectorAll('.app-back').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeApp(e));
        });

        // Navigation buttons
        this.homeBtn.addEventListener('click', () => this.goHome());
        this.backBtn.addEventListener('click', () => this.goBack());
        this.recentBtn.addEventListener('click', () => this.showRecents());

        // Touch gestures
        this.detectSwipe();

        // Settings controls
        this.setupSettingsControls();
    }

    setupSettingsControls() {
        // Toggle switches
        document.querySelectorAll('.toggle-switch').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                btn.classList.toggle('active');
                const setting = btn.dataset.setting;
                const isActive = btn.classList.contains('active');
                btn.textContent = isActive ? 'ON' : 'OFF';

                if (setting === 'darkmode') {
                    this.toggleDarkMode(isActive);
                }
                this.addFeedback(`${this.capitalizeFirst(setting)}: ${isActive ? 'ON' : 'OFF'}`);
            });
        });

        // Brightness slider in settings
        document.querySelectorAll('.setting-brightness').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const brightness = e.target.value;
                document.documentElement.style.setProperty('--brightness', brightness / 100);
                const overlay = document.querySelector('.screen');
                if (overlay) {
                    overlay.style.filter = `brightness(${brightness / 100})`;
                }
            });
        });

        // Animation speed selector
        const animationSpeedSelect = document.getElementById('animation-speed');
        if (animationSpeedSelect) {
            animationSpeedSelect.addEventListener('change', (e) => {
                const speed = e.target.value;
                this.addFeedback(`Animation speed: ${e.target.options[e.target.selectedIndex].text}`);
            });
        }

        // Screen timeout selector
        document.querySelectorAll('.setting-select').forEach(select => {
            select.addEventListener('change', (e) => {
                if (e.target !== animationSpeedSelect) {
                    this.addFeedback(`Setting changed to: ${e.target.value}`);
                }
            });
        });

        // Device name input
        document.querySelectorAll('.setting-input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.addFeedback(`Device name: ${e.target.value}`);
            });
        });
    }

    toggleDarkMode(isActive) {
        const screen = document.querySelector('.screen');
        if (isActive) {
            screen.style.background = '#1a1a1a';
            screen.style.color = '#fff';
            document.querySelectorAll('.home-content').forEach(el => {
                el.style.background = '#1a1a1a';
                el.style.color = '#fff';
            });
        } else {
            screen.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)';
            screen.style.color = '#000';
            document.querySelectorAll('.home-content').forEach(el => {
                el.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)';
                el.style.color = '#000';
            });
        }
    }

    updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        document.getElementById('time').textContent = timeStr;
        document.getElementById('lockTime').textContent = this.formatLockTime(now);
        document.getElementById('lockDate').textContent = this.formatDate(now);
        document.getElementById('homeTime').textContent = hours;
    }

    formatLockTime(date) {
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    formatDate(date) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
    }

    unlockPhone() {
        if (this.currentScreen === 'lock') {
            this.lockScreen.classList.remove('active');
            this.homeScreen.classList.add('active');
            this.currentScreen = 'home';
            this.addFeedback('Phone unlocked!');
        }
    }

    handleAppLaunch(e) {
        const appIcon = e.target.closest('.app-icon');
        if (!appIcon) return;

        const appName = appIcon.dataset.app;
        this.launchApp(appName);
    }

    launchApp(appName) {
        // Hide home screen
        this.homeScreen.classList.remove('active');

        // Show app
        const appElement = document.getElementById(`app${this.capitalizeFirst(appName)}`);
        if (appElement) {
            appElement.style.display = 'flex';
            
            // Apply animation speed from settings
            const speedSelect = document.getElementById('animation-speed');
            if (speedSelect) {
                const speed = speedSelect.value;
                appElement.style.setProperty('--animation-speed', speed);
            }

            // Start camera if camera app
            if (appName === 'camera') {
                this.startCamera();
            }
            
            this.currentScreen = appName;
            this.addFeedback(`${this.capitalizeFirst(appName)} opened`);
        }
    }

    startCamera() {
        const video = document.getElementById('cameraStream');
        if (!video) return;

        // Stop any existing stream first
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
        }

        navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        }).then(stream => {
            this.currentStream = stream;
            video.srcObject = stream;
            video.play();
            this.addFeedback('Camera started');
        }).catch(err => {
            this.addFeedback('Camera access denied');
            console.error('Camera error:', err);
        });
    }

    stopCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
    }

    closeApp(e) {
        const appName = e.target.dataset.close;
        const appElement = document.getElementById(`app${this.capitalizeFirst(appName)}`);
        if (appElement) {
            appElement.style.display = 'none';
            
            // Stop camera if camera app
            if (appName === 'camera') {
                this.stopCamera();
            }
            
            this.homeScreen.classList.add('active');
            this.currentScreen = 'home';
        }
    }

    toggleQuickPanel() {
        this.quickPanel.classList.toggle('open');
        if (this.quickPanel.classList.contains('open')) {
            this.addFeedback('Quick panel opened');
        }
    }

    closeQuickPanelFn() {
        this.quickPanel.classList.remove('open');
    }

    toggleQuickSetting(e) {
        const btn = e.target.closest('.quick-toggle');
        if (btn) {
            btn.classList.toggle('active');
            const setting = btn.dataset.toggle;
            this.addFeedback(`${this.capitalizeFirst(setting)} ${btn.classList.contains('active') ? 'enabled' : 'disabled'}`);
        }
    }

    adjustBrightness(e) {
        const brightness = e.target.value;
        document.documentElement.style.setProperty('--brightness', brightness / 100);
        
        // Visual feedback on screen
        const overlay = document.querySelector('.screen');
        if (overlay) {
            overlay.style.filter = `brightness(${brightness / 100})`;
        }
    }

    goHome() {
        // Close any open app
        document.querySelectorAll('[class^="app-"]').forEach(app => {
            if (app.classList.contains('app-phone') || app.classList.contains('app-messages') || 
                app.classList.contains('app-camera') || app.classList.contains('app-gallery') ||
                app.classList.contains('app-calendar') || app.classList.contains('app-settings') ||
                app.classList.contains('app-music') || app.classList.contains('app-weather') ||
                app.classList.contains('app-calculator')) {
                app.style.display = 'none';
            }
        });

        this.homeScreen.classList.add('active');
        this.lockScreen.classList.remove('active');
        this.currentScreen = 'home';
        this.closeQuickPanelFn();
    }

    goBack() {
        if (this.currentScreen !== 'home' && this.currentScreen !== 'lock') {
            this.goHome();
        }
    }

    showRecents() {
        this.addFeedback('Recent apps');
        alert('Recently used apps:\n📱 Phone\n💬 Messages\n📷 Camera');
    }

    detectSwipe() {
        let touchStartY = 0;
        let touchEndY = 0;

        this.screen.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });

        this.screen.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        });

        const handleSwipe = () => {
            if (this.currentScreen === 'lock' && touchStartY < touchEndY) {
                this.unlockPhone();
            }
        };
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    addFeedback(message) {
        // Visual feedback (haptic on real device, visual here)
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1000;
            animation: slideUp 0.3s ease;
        `;
        feedback.textContent = message;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => feedback.remove(), 300);
        }, 1500);
    }
}

// Initialize phone emulator
document.addEventListener('DOMContentLoaded', () => {
    const phone = new PhoneEmulator();

    // Additional interactions for apps
    setupCalculator();
    setupMusicPlayer();
    setupFlappyBird();
    setupSnakeGame();
    setup2048();
    setupCamera();
});

// Camera functionality
function setupCamera() {
    const captureBtn = document.getElementById('captureBtn');
    const toggleCamBtn = document.getElementById('toggleCamBtn');

    captureBtn.addEventListener('click', () => {
        const video = document.getElementById('cameraStream');
        if (video && video.srcObject) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            // Simulate saving photo
            const feedback = document.createElement('div');
            feedback.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 20px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 1000;
                animation: slideUp 0.3s ease;
            `;
            feedback.textContent = '📸 Photo saved!';
            document.body.appendChild(feedback);

            setTimeout(() => {
                feedback.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => feedback.remove(), 300);
            }, 1500);
        }
    });

    toggleCamBtn.addEventListener('click', () => {
        const video = document.getElementById('cameraStream');
        if (video && video.srcObject) {
            navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            }).then(stream => {
                const phone = window.phoneInstance;
                if (phone.currentStream) {
                    phone.currentStream.getTracks().forEach(track => track.stop());
                }
                phone.currentStream = stream;
                video.srcObject = stream;
                video.play();
            }).catch(err => console.error('Error toggling camera:', err));
        }
    });
}

// Calculator functionality
function setupCalculator() {
    let display = '0';
    let operation = null;
    let previousValue = null;
    let currentValue = null;

    const displayEl = document.querySelector('.calc-display');
    const buttons = document.querySelectorAll('.calc-buttons button');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.textContent;

            if (value === '=') {
                if (operation && previousValue !== null && display !== '') {
                    currentValue = parseFloat(display);
                    const result = calculate(previousValue, currentValue, operation);
                    display = String(result);
                    operation = null;
                    previousValue = null;
                }
            } else if (value === '÷' || value === '×' || value === '−' || value === '+') {
                if (display !== '') {
                    if (previousValue === null) {
                        previousValue = parseFloat(display);
                    }
                    operation = value === '÷' ? '/' : value === '×' ? '*' : value === '−' ? '-' : '+';
                    display = '';
                }
            } else if (value === 'C' || value === 'AC') {
                display = '0';
                operation = null;
                previousValue = null;
                currentValue = null;
            } else {
                if (display === '0' && value !== '.') {
                    display = value;
                } else {
                    display += value;
                }
            }

            displayEl.textContent = display || '0';
        });
    });

    function calculate(prev, curr, op) {
        switch (op) {
            case '+': return prev + curr;
            case '-': return prev - curr;
            case '*': return prev * curr;
            case '/': return prev / curr;
            default: return curr;
        }
    }
}

// Music player functionality
function setupMusicPlayer() {
    const playBtn = document.querySelector('.play-btn');
    let isPlaying = false;

    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playBtn.textContent = isPlaying ? '⏸️' : '▶️';
        
        const tracks = [
            'Summer Vibes',
            'Night Drive',
            'Chill Lofi',
            'Electric Dreams'
        ];
        
        if (isPlaying) {
            const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
            document.querySelector('.track-name').textContent = randomTrack;
        }
    });

    // Next button
    const nextBtn = document.querySelectorAll('.music-controls button')[2];
    nextBtn.addEventListener('click', () => {
        const tracks = [
            'Summer Vibes',
            'Night Drive',
            'Chill Lofi',
            'Electric Dreams'
        ];
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
        document.querySelector('.track-name').textContent = randomTrack;
    });
}

// Add CSS animation for feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Flappy Bird Game
function setupFlappyBird() {
    let gameActive = false;
    let birdY = 150;
    let birdVelocity = 0;
    let pipeX = 300;
    let score = 0;
    const gravity = 0.4;
    const bird = document.getElementById('bird');
    const board = document.getElementById('flappyBoard');
    const startBtn = document.getElementById('flappyStart');
    const scoreEl = document.getElementById('flappyScore');

    startBtn.addEventListener('click', () => {
        if (!gameActive) {
            gameActive = true;
            score = 0;
            birdY = 150;
            birdVelocity = 0;
            pipeX = 300;
            startBtn.textContent = 'Game Running...';
            gameLoop();
        }
    });

    document.addEventListener('keypress', (e) => {
        if (e.key === ' ' && gameActive) {
            birdVelocity = -8;
        }
    });

    board.addEventListener('click', () => {
        if (gameActive) {
            birdVelocity = -8;
        }
    });

    function gameLoop() {
        if (!gameActive) return;

        birdVelocity += gravity;
        birdY += birdVelocity;

        bird.style.top = birdY + 'px';

        if (birdY > 370 || birdY < 0) {
            endFlappyGame();
            return;
        }

        pipeX -= 5;
        if (pipeX < -50) {
            pipeX = 300;
            score++;
            scoreEl.textContent = score;
        }

        document.querySelector('.pipe.top').style.right = (300 - pipeX) + 'px';
        document.querySelector('.pipe.bottom').style.right = (300 - pipeX) + 'px';

        if (pipeX > 20 && pipeX < 70 && (birdY < 100 || birdY > 250)) {
            endFlappyGame();
            return;
        }

        setTimeout(gameLoop, 30);
    }

    function endFlappyGame() {
        gameActive = false;
        startBtn.textContent = `Game Over! Score: ${score} - Start Again`;
    }
}

// Snake Game
function setupSnakeGame() {
    let gameActive = false;
    let snake = [{x: 5, y: 5}];
    let food = {x: 8, y: 8};
    let direction = {x: 1, y: 0};
    let nextDirection = {x: 1, y: 0};
    let score = 0;
    const board = document.getElementById('snakeBoard');
    const startBtn = document.getElementById('snakeStart');
    const scoreEl = document.getElementById('snakeScore');
    const gridSize = 10;

    startBtn.addEventListener('click', () => {
        if (!gameActive) {
            gameActive = true;
            snake = [{x: 5, y: 5}];
            food = {x: 8, y: 8};
            direction = {x: 1, y: 0};
            score = 0;
            scoreEl.textContent = 0;
            startBtn.textContent = 'Game Running...';
            gameLoop();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!gameActive) return;
        if (e.key === 'ArrowUp' && direction.y === 0) nextDirection = {x: 0, y: -1};
        if (e.key === 'ArrowDown' && direction.y === 0) nextDirection = {x: 0, y: 1};
        if (e.key === 'ArrowLeft' && direction.x === 0) nextDirection = {x: -1, y: 0};
        if (e.key === 'ArrowRight' && direction.x === 0) nextDirection = {x: 1, y: 0};
    });

    function gameLoop() {
        if (!gameActive) return;

        direction = nextDirection;
        const head = snake[0];
        const newHead = {x: head.x + direction.x, y: head.y + direction.y};

        if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
            endSnakeGame();
            return;
        }

        if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
            endSnakeGame();
            return;
        }

        snake.unshift(newHead);

        if (newHead.x === food.x && newHead.y === food.y) {
            score++;
            scoreEl.textContent = score;
            food = {x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize)};
        } else {
            snake.pop();
        }

        renderSnake();
        setTimeout(gameLoop, 200);
    }

    function renderSnake() {
        const cells = board.querySelectorAll('.snake-cell');
        cells.forEach(cell => {
            cell.className = 'snake-cell';
        });

        snake.forEach((segment, index) => {
            const cellIndex = segment.y * gridSize + segment.x;
            if (cells[cellIndex]) {
                cells[cellIndex].className = index === 0 ? 'snake-cell head' : 'snake-cell body';
            }
        });

        const foodIndex = food.y * gridSize + food.x;
        if (cells[foodIndex]) {
            cells[foodIndex].className = 'snake-cell food';
        }
    }

    function endSnakeGame() {
        gameActive = false;
        startBtn.textContent = `Game Over! Score: ${score} - Start Again`;
    }

    // Initialize board cells
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'snake-cell';
        board.appendChild(cell);
    }

    renderSnake();
}

// 2048 Game
function setup2048() {
    let grid = [];
    const gameBoard = document.getElementById('game2048');
    const startBtn = document.getElementById('game2048Start');
    const scoreEl = document.getElementById('game2048Score');
    let score = 0;

    function initGrid() {
        grid = Array(4).fill(null).map(() => Array(4).fill(0));
        addNewTile();
        addNewTile();
        renderGrid();
    }

    function addNewTile() {
        const empty = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) empty.push({i, j});
            }
        }
        if (empty.length > 0) {
            const {i, j} = empty[Math.floor(Math.random() * empty.length)];
            grid[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function renderGrid() {
        const tiles = gameBoard.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.textContent = '';
            tile.removeAttribute('data-value');
        });

        let index = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] !== 0) {
                    tiles[index].textContent = grid[i][j];
                    tiles[index].setAttribute('data-value', grid[i][j]);
                }
                index++;
            }
        }
    }

    function move(direction) {
        let moved = false;
        const oldGrid = JSON.stringify(grid);

        if (direction === 'left') {
            for (let i = 0; i < 4; i++) {
                let row = grid[i].filter(val => val !== 0);
                for (let j = 0; j < row.length - 1; j++) {
                    if (row[j] === row[j + 1]) {
                        row[j] *= 2;
                        score += row[j];
                        row.splice(j + 1, 1);
                    }
                }
                grid[i] = [...row, ...Array(4 - row.length).fill(0)];
            }
        }

        moved = oldGrid !== JSON.stringify(grid);
        if (moved) {
            addNewTile();
            renderGrid();
            scoreEl.textContent = score;
        }
    }

    startBtn.addEventListener('click', () => {
        grid = [];
        score = 0;
        scoreEl.textContent = 0;
        initGrid();
        startBtn.textContent = 'Playing...';
    });

    document.addEventListener('keydown', (e) => {
        if (grid.length === 0) return;
        if (e.key === 'ArrowLeft') { move('left'); e.preventDefault(); }
        if (e.key === 'ArrowRight') { move('right'); e.preventDefault(); }
        if (e.key === 'ArrowUp') { move('up'); e.preventDefault(); }
        if (e.key === 'ArrowDown') { move('down'); e.preventDefault(); }
    });
}
