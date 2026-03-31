// 💡 전역 상태 관리 객체 (State 도입)
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
        // 매 초마다 갱신할 때는 무거운 전체 갱신 대신 시간과 핵심 정보만 가볍게 갱신
        setInterval(() => UI.updateCore(), 1000);
    },

    // 💡 이벤트 구조를 역할별로 깔끔하게 분리
    bindEvents() {
        this.bindTabEvents();
        this.bindModalEvents();
        this.bindSettingsEvents();
        this.bindGameEvents();
    },

    bindTabEvents() {
        const $ = id => document.getElementById(id);
        $('tabSmoke')?.addEventListener('click', () => UI.switchTab('smoke'));
        $('tabDrink')?.addEventListener('click', () => UI.switchTab('drink'));
    },

    bindModalEvents() {
        const $ = id => document.getElementById(id);
        $('btnRecordSmoke')?.addEventListener('click', () => {
            UI.showCustomModal('정말 실패하셨나요? 타이머가 초기화됩니다.', () => { Data.addLog('smoke'); UI.updateAll(); });
        });

        $('btnRecordDrink')?.addEventListener('click', () => {
            UI.showCustomModal('정말 마셨나요? (하루 1회만 카운트됩니다)', () => {
                let success = Data.addLog('drink');
                if (success) UI.updateAll();
            });
        });

        $('modalConfirmBtn')?.addEventListener('click', () => {
            if (window.currentModalAction) { window.currentModalAction(); window.currentModalAction = null; }
            UI.closeModal('customModal');
        });
        $('btnModalCancel')?.addEventListener('click', () => UI.closeModal('customModal'));

        $('btnRoadmapSmoke')?.addEventListener('click', () => UI.openRoadmap('smoke'));
        $('btnRoadmapDrink')?.addEventListener('click', () => UI.openRoadmap('drink'));
        $('btnRoadmapClose')?.addEventListener('click', () => UI.closeModal('roadmapModal'));
    },

    bindSettingsEvents() {
        const $ = id => document.getElementById(id);
        $('navSettings')?.addEventListener('click', () => UI.openSettingsModal());
        $('btnSettingsClose')?.addEventListener('click', () => UI.closeModal('settingsModal'));
        $('btnSettingsSave')?.addEventListener('click', () => this.saveSettings());

        document.querySelectorAll('input[name="setSmokeMode"], input[name="setDrinkMode"]').forEach(radio => radio.addEventListener('change', () => UI.toggleSettingsInputs()));

        $('btnResetSmoke')?.addEventListener('click', () => this.askReset('smoke'));
        $('btnResetDrink')?.addEventListener('click', () => this.askReset('drink'));

        // 설정 창 입력 시 자동 콤마(,) 찍기
        document.querySelectorAll('.comma-input').forEach(input => {
            input.addEventListener('input', function (e) {
                let val = this.value.replace(/[^0-9]/g, '');
                if (val) this.value = parseInt(val).toLocaleString();
                else this.value = '';
            });
        });
    },

    bindGameEvents() {
        const $ = id => document.getElementById(id);
        $('navDefense')?.addEventListener('click', () => this.openDefenseGame());
        $('gameMainBtn')?.addEventListener('click', () => this.handleDefenseBtn());
        $('btnDefenseClose')?.addEventListener('click', () => this.closeDefenseGame());
    },

    saveSettings() {
        let sMode = document.querySelector('input[name="setSmokeMode"]:checked').value;
        let dMode = document.querySelector('input[name="setDrinkMode"]:checked').value;
        if (sMode === 'off' && dMode === 'off') { alert("최소 하나의 목표는 켜져 있어야 합니다!"); return; }

        // 💡 입력값 처리 안정화 (콤마 제거 및 빈 값 방어)
        const parseVal = (id, def) => {
            let val = document.getElementById(id).value.replace(/,/g, '');
            return (val !== '' && !isNaN(val)) ? parseInt(val) : def;
        };

        Data.saveSettings({
            "smokeMode": sMode, "drinkMode": dMode,
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
        UI.showCustomModal(`⚠️ ${name} 관련 모든 기록을 초기화할까요?\n삭제된 데이터는 복구할 수 없습니다.`, () => {
            Data.resetData(type); UI.updateAll();
        });
    },

    gameTimerId: null, gameStartTime: 0,
    openDefenseGame() {
        document.getElementById('gameTimer').innerText = "0.00"; document.getElementById('gameResult').innerText = "";
        let btn = document.getElementById('gameMainBtn'); btn.innerText = "🔥 10초 버티기 시작"; btn.classList.remove('stop');
        State.isGameRunning = false;
        UI.openModal('defenseModal');
    },

    // 💡 게임 상태 완벽 초기화 수정
    closeDefenseGame() {
        cancelAnimationFrame(this.gameTimerId);
        State.isGameRunning = false;
        this.gameStartTime = 0;
        document.getElementById('gameTimer').innerText = "0.00";
        document.getElementById('gameResult').innerText = "";
        UI.closeModal('defenseModal');
    },

    handleDefenseBtn() {
        if (!State.isGameRunning) {
            State.isGameRunning = true; this.gameStartTime = performance.now();
            document.getElementById('gameMainBtn').innerText = "🛑 멈춰!"; document.getElementById('gameMainBtn').classList.add('stop');
            this.updateGame();
        } else {
            State.isGameRunning = false; cancelAnimationFrame(this.gameTimerId);
            let finalTime = ((performance.now() - this.gameStartTime) / 1000).toFixed(2);
            document.getElementById('gameTimer').innerText = finalTime;
            let btn = document.getElementById('gameMainBtn'); btn.innerText = "🔄 다시 도전"; btn.classList.remove('stop');
            document.getElementById('gameResult').innerText = finalTime === "10.00" ? "🎉 완벽합니다!" : `😢 실패! (${finalTime}초)`;
        }
    },
    updateGame() {
        if (!State.isGameRunning) return;
        document.getElementById('gameTimer').innerText = ((performance.now() - this.gameStartTime) / 1000).toFixed(2);
        this.gameTimerId = requestAnimationFrame(() => this.updateGame());
    }
};

window.onload = () => App.init();