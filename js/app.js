const App = {
    init() {
        Data.init();
        this.bindEvents();
        UI.updateAll(); 
        setInterval(() => UI.updateTime(), 1000); 
        setTimeout(() => UI.renderCharts(), 200);
    },

    bindEvents() {
        // 🚀 새롭게 추가된 상단 네비게이션 버튼들 연결
        document.getElementById('navSmoke').addEventListener('click', () => {
            document.getElementById('smokeCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        document.getElementById('navDrink').addEventListener('click', () => {
            document.getElementById('drinkCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        document.getElementById('navDefense').addEventListener('click', () => this.openDefenseGame());
        document.getElementById('navSettings').addEventListener('click', () => UI.openSettingsModal());

        document.getElementById('btnRecordSmoke').addEventListener('click', () => {
            UI.showCustomModal('정말 실패하셨나요? 타이머가 초기화됩니다.', () => { 
                Data.addLog('smoke'); UI.updateAll(); 
            });
        });

        document.getElementById('btnRecordDrink').addEventListener('click', () => {
            UI.showCustomModal('정말 실패하셨나요? 타이머가 초기화됩니다.', () => { 
                Data.addLog('drink'); UI.updateAll(); 
            });
        });

        // 🚨 모달 더블클릭 버그 방지
        document.getElementById('modalConfirmBtn').addEventListener('click', () => {
            if (window.currentModalAction) {
                window.currentModalAction();
                window.currentModalAction = null; // 중복 실행 차단
            }
            UI.closeModal();
        });
        
        document.getElementById('btnModalCancel').addEventListener('click', () => {
            UI.closeModal();
        });

        document.getElementById('gameMainBtn').addEventListener('click', () => this.handleDefenseBtn());
        document.getElementById('btnDefenseClose').addEventListener('click', () => this.closeDefenseGame());

        document.getElementById('btnRoadmapSmoke').addEventListener('click', () => UI.openRoadmap('smoke'));
        document.getElementById('btnRoadmapDrink').addEventListener('click', () => UI.openRoadmap('drink'));
        document.getElementById('btnRoadmapClose').addEventListener('click', () => document.getElementById('roadmapModal').classList.remove('active'));

        document.getElementById('btnSettingsClose').addEventListener('click', () => UI.closeSettingsModal());
        document.getElementById('btnSettingsSave').addEventListener('click', () => this.saveSettings());

        document.getElementById('btnResetSmoke').addEventListener('click', () => this.askReset('smoke'));
        document.getElementById('btnResetDrink').addEventListener('click', () => this.askReset('drink'));

        document.querySelectorAll('input[name="setSmokeMode"], input[name="setDrinkMode"]').forEach(radio => {
            radio.addEventListener('change', () => UI.toggleSettingsInputs());
        });
    },

    saveSettings() {
        let sMode = document.querySelector('input[name="setSmokeMode"]:checked').value;
        let dMode = document.querySelector('input[name="setDrinkMode"]:checked').value;
        if (sMode === 'off' && dMode === 'off') { alert("최소 하나의 목표는 켜져 있어야 합니다!"); return; }

        Data.saveSettings({
            "smokeMode": sMode, "drinkMode": dMode,
            "smokePrice": Math.max(1, document.getElementById('setSmokePrice').value),
            "smokePerDay": Math.max(1, document.getElementById('setSmokePerDay').value),
            "smokeTarget": Math.max(1, document.getElementById('setSmokeTarget').value),
            "drinkCost": Math.max(1, document.getElementById('setDrinkCost').value),
            "drinkPerWeek": Math.max(1, document.getElementById('setDrinkPerWeek').value),
            "drinkTarget": Math.max(1, document.getElementById('setDrinkTarget').value)
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
        document.getElementById('defenseStepText').innerText = "1단계: 눈으로 보고 누르기";
        document.getElementById('gameTimer').innerText = "0.00";
        document.getElementById('gameResult').innerText = "";
        let btn = document.getElementById('gameMainBtn');
        btn.innerText = "🔥 10초 버티기 시작";
        btn.classList.remove('stop');
        this.isGameRunning = false;
        document.getElementById('defenseModal').classList.add('active');
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
            document.getElementById('gameMainBtn').innerText = "🔄 다시 도전"; document.getElementById('gameMainBtn').classList.remove('stop');
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