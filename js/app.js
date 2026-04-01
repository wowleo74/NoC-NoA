const State = {
    currentTab: 'smoke',
    currentModal: null,
    isGameRunning: false
};

const App = {
    init() {
        Data.init(); 
        this.bindEvents(); 
        UI.updateAll();
        
        // 에러로 인해 타이머가 죽는 것을 방지하는 try-catch 문 적용
        setInterval(() => {
            try {
                UI.updateCore();
            } catch (error) {
                console.error("타이머 에러 방어:", error);
            }
        }, 1000); 
    },

    bindEvents() {
        this.bindTabEvents();
        this.bindModalEvents();
        this.bindSettingsEvents();
        this.bindGameEvents();
    },

    bindTabEvents() {
        const $ = id => document.getElementById(id);
        
        let tabSmoke = $('tabSmoke');
        let tabDrink = $('tabDrink');
        
        if (tabSmoke) {
            tabSmoke.addEventListener('click', () => UI.switchTab('smoke'));
        }
        if (tabDrink) {
            tabDrink.addEventListener('click', () => UI.switchTab('drink'));
        }
    },

    bindModalEvents() {
        const $ = id => document.getElementById(id);
        
        let btnRecordSmoke = $('btnRecordSmoke');
        if (btnRecordSmoke) {
            btnRecordSmoke.addEventListener('click', () => {
                UI.showCustomModal('정말 실패하셨나요? 타이머가 초기화됩니다.', () => { 
                    Data.addLog('smoke'); 
                    UI.updateAll(); 
                });
            });
        }

        let btnRecordDrink = $('btnRecordDrink');
        if (btnRecordDrink) {
            btnRecordDrink.addEventListener('click', () => {
                let prefix = Data.getPrefix('drink'); 
                let todayStr = new Date().toDateString();
                
                if (localStorage.getItem(prefix + 'LastDate') === todayStr) {
                    UI.showAlertModal('오늘은 이미 기록되었습니다.\n(기록은 하루 1회만 가능합니다)');
                } else {
                    UI.showCustomModal('정말 마셨나요? (하루 1회만 카운트됩니다)', () => { 
                        Data.addLog('drink'); 
                        UI.updateAll(); 
                    });
                }
            });
        }

        let modalConfirmBtn = $('modalConfirmBtn');
        if (modalConfirmBtn) {
            modalConfirmBtn.addEventListener('click', () => {
                if (window.currentModalAction) { 
                    window.currentModalAction(); 
                    window.currentModalAction = null; 
                }
                UI.closeModal('customModal');
            });
        }
        
        let btnModalCancel = $('btnModalCancel');
        if (btnModalCancel) {
            btnModalCancel.addEventListener('click', () => UI.closeModal('customModal'));
        }

        let btnRoadmapSmoke = $('btnRoadmapSmoke');
        if (btnRoadmapSmoke) {
            btnRoadmapSmoke.addEventListener('click', () => UI.openRoadmap('smoke'));
        }
        
        let btnRoadmapDrink = $('btnRoadmapDrink');
        if (btnRoadmapDrink) {
            btnRoadmapDrink.addEventListener('click', () => UI.openRoadmap('drink'));
        }
        
        let btnRoadmapClose = $('btnRoadmapClose');
        if (btnRoadmapClose) {
            btnRoadmapClose.addEventListener('click', () => UI.closeModal('roadmapModal'));
        }
        
        // 빈 화면에서 '도전 시작' 버튼
        let btnStartChallenge = $('btnStartChallenge');
        if (btnStartChallenge) {
            btnStartChallenge.addEventListener('click', () => UI.openSettingsModal());
        }
    },

    bindSettingsEvents() {
        const $ = id => document.getElementById(id);
        
        let navSettings = $('navSettings');
        if (navSettings) {
            navSettings.addEventListener('click', () => UI.openSettingsModal());
        }
        
        let btnSettingsClose = $('btnSettingsClose');
        if (btnSettingsClose) {
            btnSettingsClose.addEventListener('click', () => UI.closeModal('settingsModal'));
        }
        
        let btnSettingsSave = $('btnSettingsSave');
        if (btnSettingsSave) {
            btnSettingsSave.addEventListener('click', () => this.saveSettings());
        }

        document.querySelectorAll('input[name="setSmokeMode"], input[name="setDrinkMode"]').forEach(radio => {
            radio.addEventListener('change', () => UI.toggleSettingsInputs());
        });

        let btnResetSmoke = $('btnResetSmoke');
        if (btnResetSmoke) {
            btnResetSmoke.addEventListener('click', () => this.askReset('smoke'));
        }
        
        let btnResetDrink = $('btnResetDrink');
        if (btnResetDrink) {
            btnResetDrink.addEventListener('click', () => this.askReset('drink'));
        }

        document.querySelectorAll('.comma-input').forEach(input => {
            input.addEventListener('input', function(e) {
                let val = this.value.replace(/[^0-9]/g, '');
                if (val) {
                    this.value = parseInt(val).toLocaleString();
                } else {
                    this.value = '';
                }
            });
        });
    },

    saveSettings() {
        let oldSmokeMode = Data.getMode('smoke');
        let oldDrinkMode = Data.getMode('drink');
        
        let smokeRadio = document.querySelector('input[name="setSmokeMode"]:checked');
        let drinkRadio = document.querySelector('input[name="setDrinkMode"]:checked');
        
        let sMode = smokeRadio ? smokeRadio.value : 'off';
        let dMode = drinkRadio ? drinkRadio.value : 'off';

        let now = Date.now();
        
        // 모드가 꺼져 있다가 켜지는 순간을 새로운 도전 시작일로 설정
        if (oldSmokeMode === 'off' && sMode !== 'off') {
            localStorage.setItem('smokeStart', now);
            localStorage.setItem('smokeAppStart', now);
            localStorage.setItem('smokeReduceStart', now);
            localStorage.setItem('smokeReduceAppStart', now);
        }
        if (oldDrinkMode === 'off' && dMode !== 'off') {
            localStorage.setItem('drinkStart', now);
            localStorage.setItem('drinkAppStart', now);
            localStorage.setItem('drinkReduceStart', now);
            localStorage.setItem('drinkReduceAppStart', now);
        }

        const parseVal = (id, def) => {
            let el = document.getElementById(id);
            if (!el) return def;
            let val = el.value.replace(/,/g, '');
            return (val !== '' && !isNaN(val)) ? parseInt(val) : def;
        };

        Data.saveSettings({
            "smokeMode": sMode, 
            "drinkMode": dMode,
            "smokePrice": Math.max(1, parseVal('setSmokePrice', 4500)),
            "smokePerDay": Math.max(1, parseVal('setSmokePerDay', 10)),
            "smokeTarget": Math.max(1, parseVal('setSmokeTarget', 5)),
            "drinkCost": Math.max(1, parseVal('setDrinkCost', 50000)),
            "drinkPerWeek": Math.max(1, parseVal('setDrinkPerWeek', 2)),
            "drinkTarget": Math.max(1, parseVal('setDrinkTarget', 1))
        });
        
        UI.closeModal('settingsModal'); 
        UI.updateAll();
    },

    askReset(type) {
        let name = type === 'smoke' ? '담배' : '술';
        UI.closeModal('settingsModal');
        UI.showCustomModal(`⚠️ ${name} 관련 모든 기록(완전 끊기 및 줄이기)을 초기화하시겠습니까?\n삭제된 기록은 복구할 수 없습니다.`, () => {
            Data.resetData(type); 
            UI.updateAll();
        });
    },

    // 10초 게임 관련
    gameTimerId: null, 
    gameStartTime: 0,
    
    bindGameEvents() {
        let navDefense = document.getElementById('navDefense');
        if (navDefense) {
            navDefense.addEventListener('click', () => this.openDefenseGame());
        }
        
        let btnDefenseClose = document.getElementById('btnDefenseClose');
        if (btnDefenseClose) {
            btnDefenseClose.addEventListener('click', () => this.closeDefenseGame());
        }
        
        let gameMainBtn = document.getElementById('gameMainBtn');
        if (gameMainBtn) {
            gameMainBtn.addEventListener('click', () => this.handleDefenseBtn());
        }
    },
    
    openDefenseGame() {
        document.getElementById('gameTimer').innerText = "0.00"; 
        document.getElementById('gameResult').innerText = "";
        
        let btn = document.getElementById('gameMainBtn'); 
        if (btn) {
            btn.innerText = "🔥 10초 버티기 시작"; 
            btn.classList.remove('stop');
        }
        
        State.isGameRunning = false; 
        UI.openModal('defenseModal');
    },
    
    closeDefenseGame() { 
        cancelAnimationFrame(this.gameTimerId); 
        State.isGameRunning = false;
        this.gameStartTime = 0;
        
        let timer = document.getElementById('gameTimer');
        if (timer) timer.innerText = "0.00";
        
        let result = document.getElementById('gameResult');
        if (result) result.innerText = "";
        
        UI.closeModal('defenseModal'); 
    },
    
    handleDefenseBtn() {
        let btn = document.getElementById('gameMainBtn');
        if (!btn) return;
        
        if (!State.isGameRunning) {
            State.isGameRunning = true; 
            this.gameStartTime = performance.now();
            btn.innerText = "🛑 멈춰!"; 
            btn.classList.add('stop');
            this.updateGame();
        } else {
            State.isGameRunning = false; 
            cancelAnimationFrame(this.gameTimerId);
            
            let finalTime = ((performance.now() - this.gameStartTime) / 1000).toFixed(2);
            document.getElementById('gameTimer').innerText = finalTime;
            
            btn.innerText = "🔄 다시 도전"; 
            btn.classList.remove('stop');
            
            let result = document.getElementById('gameResult');
            if (result) {
                result.innerText = finalTime === "10.00" ? "🎉 완벽합니다!" : `😢 실패! (${finalTime}초)`;
            }
        }
    },
    
    updateGame() {
        if (!State.isGameRunning) return;
        let timer = document.getElementById('gameTimer');
        if (timer) {
            timer.innerText = ((performance.now() - this.gameStartTime) / 1000).toFixed(2);
        }
        this.gameTimerId = requestAnimationFrame(() => this.updateGame());
    }
};

window.onload = () => App.init();