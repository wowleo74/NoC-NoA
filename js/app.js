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
                UI.showCustomModal('정말 피우셨습니까?\n(기록 시 타이머가 다시 시작됩니다.)', () => {
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
            input.addEventListener('input', function (e) {
                let val = this.value.replace(/[^0-9]/g, '');
                if (val) {
                    this.value = parseInt(val).toLocaleString();
                } else {
                    this.value = '';
                }
            });
        });

        // 💡 친구에게 추천하기 이벤트 추가
        let btnShareApp = $('btnShareApp');
        if (btnShareApp) {
            btnShareApp.addEventListener('click', () => {
                let shareData = {
                    title: '노담노술 - 금연·금주 도전기',
                    text: '완벽한 금연, 금주를 위한 타이머와 회복 도감! 같이 시작해볼래?',
                    url: 'https://wowleo74.github.io/NoC-NoA/'
                };

                if (navigator.share) {
                    navigator.share(shareData).catch(err => console.log('공유 취소됨', err));
                } else {
                    navigator.clipboard.writeText(shareData.url).then(() => {
                        UI.showAlertModal('앱 링크가 클립보드에 복사되었습니다!\n친구에게 붙여넣기 해주세요.');
                    });
                }
            });
        }
    },

    saveSettings() {
        let oldSmokeMode = Data.getMode('smoke');
        let oldDrinkMode = Data.getMode('drink');

        let smokeRadio = document.querySelector('input[name="setSmokeMode"]:checked');
        let drinkRadio = document.querySelector('input[name="setDrinkMode"]:checked');

        let sMode = smokeRadio ? smokeRadio.value : 'off';
        let dMode = drinkRadio ? drinkRadio.value : 'off';

        let now = Date.now();

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