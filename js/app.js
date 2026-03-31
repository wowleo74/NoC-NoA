const App = {
    init() {
        Data.init(); this.bindEvents(); UI.updateAll();
        setInterval(() => UI.updateTime(), 1000);
    },

    bindEvents() {
        const $ = id => document.getElementById(id);

        // 🚨 방어 코드(?.) 적용: HTML 요소를 못 찾아도 에러로 멈추지 않음!
        $('tabSmoke')?.addEventListener('click', () => UI.switchTab('smoke'));
        $('tabDrink')?.addEventListener('click', () => UI.switchTab('drink'));

        $('navDefense')?.addEventListener('click', () => this.openDefenseGame());
        $('navSettings')?.addEventListener('click', () => UI.openSettingsModal());

        $('btnRecordSmoke')?.addEventListener('click', () => {
            UI.showCustomModal('정말 실패하셨나요? 타이머가 초기화됩니다.', () => { Data.addLog('smoke'); UI.updateAll(); });
        });

        $('btnRecordDrink')?.addEventListener('click', () => {
            UI.showCustomModal('정말 마셨나요? (하루 1회만 카운트됩니다)', () => {
                let success = Data.addLog('drink');
                if (!success) { setTimeout(() => alert('오늘은 이미 실패를 기록하셨습니다. (하루 1회 제한)'), 100); }
                UI.updateAll();
            });
        });

        $('modalConfirmBtn')?.addEventListener('click', () => {
            if (window.currentModalAction) { window.currentModalAction(); window.currentModalAction = null; }
            UI.closeModal();
        });
        $('btnModalCancel')?.addEventListener('click', () => UI.closeModal());

        $('btnSettingsClose')?.addEventListener('click', () => UI.closeSettingsModal());
        $('btnSettingsSave')?.addEventListener('click', () => this.saveSettings());

        document.querySelectorAll('input[name="setSmokeMode"], input[name="setDrinkMode"]').forEach(radio => radio.addEventListener('change', () => UI.toggleSettingsInputs()));

        $('gameMainBtn')?.addEventListener('click', () => this.handleDefenseBtn());
        $('btnDefenseClose')?.addEventListener('click', () => this.closeDefenseGame());

        $('btnRoadmapSmoke')?.addEventListener('click', () => UI.openRoadmap('smoke'));
        $('btnRoadmapDrink')?.addEventListener('click', () => UI.openRoadmap('drink'));
        $('btnRoadmapClose')?.addEventListener('click', () => document.getElementById('roadmapModal').classList.remove('active'));

        $('btnResetSmoke')?.addEventListener('click', () => this.askReset('smoke'));
        $('btnResetDrink')?.addEventListener('click', () => this.askReset('drink'));
    },

    saveSettings() {
        let sMode = document.querySelector('input[name="setSmokeMode"]:checked').value;
        let dMode = document.querySelector('input[name="setDrinkMode"]:checked').value;
        if (sMode === 'off' && dMode === 'off') { alert("최소 하나의 목표는 켜져 있어야 합니다!"); return; }

        Data.saveSettings({
            "smokeMode": sMode, "drinkMode": dMode,
            "smokePrice": Math.max(1, document.getElementById('setSmokePrice').value || 4500),
            "smokePerDay": Math.max(1, document.getElementById('setSmokePerDay').value || 10),
            "smokeTarget": Math.max(1, document.getElementById('setSmokeTarget').value || 5),
            "drinkCost": Math.max(1, document.getElementById('setDrinkCost').value || 50000),
            "drinkPerWeek": Math.max(1, document.getElementById('setDrinkPerWeek').value || 2),
            "drinkTarget": Math.max(1, document.getElementById('setDrinkTarget').value || 1)
        });
        UI.closeSettingsModal(); UI.updateAll();
    },

    askReset(type) {
        let name = type === 'smoke' ? '담배' : '술';
        UI.closeSettingsModal();
        UI.showCustomModal(`⚠️ ${name} 관련 모든 기록을 초기화할까요?`, () => {
            Data.resetData(type); UI.updateAll();
        });
    },

    gameTimerId: null, isGameRunning: false, gameStartTime: 0,
    openDefenseGame() {
        document.getElementById('gameTimer').innerText = "0.00"; document.getElementById('gameResult').innerText = "";
        let btn = document.getElementById('gameMainBtn'); btn.innerText = "🔥 10초 버티기 시작"; btn.classList.remove('stop');
        this.isGameRunning = false; document.getElementById('defenseModal').classList.add('active');
    },
    closeDefenseGame() { cancelAnimationFrame(this.gameTimerId); document.getElementById('defenseModal').classList.remove('active'); },
    handleDefenseBtn() {
        if (!this.isGameRunning) {
            this.isGameRunning = true; this.gameStartTime = performance.now();
            document.getElementById('gameMainBtn').innerText = "🛑 멈춰!"; document.getElementById('gameMainBtn').classList.add('stop');
            this.updateGame();
        } else {
            this.isGameRunning = false; cancelAnimationFrame(this.gameTimerId);
            let finalTime = ((performance.now() - this.gameStartTime) / 1000).toFixed(2);
            document.getElementById('gameTimer').innerText = finalTime;
            let btn = document.getElementById('gameMainBtn'); btn.innerText = "🔄 다시 도전"; btn.classList.remove('stop');
            document.getElementById('gameResult').innerText = finalTime === "10.00" ? "🎉 완벽합니다!" : `😢 실패! (${finalTime}초)`;
        }
    },
    updateGame() {
        if (!this.isGameRunning) return;
        document.getElementById('gameTimer').innerText = ((performance.now() - this.gameStartTime) / 1000).toFixed(2);
        this.gameTimerId = requestAnimationFrame(() => this.updateGame());
    }
};

window.onload = () => App.init();