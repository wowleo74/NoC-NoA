const App = {
    currentModalAction: null,

    init() {
        Data.init();
        this.bindEvents();
        setInterval(() => UI.renderMain(), 1000);
        UI.renderMain();
        setTimeout(() => UI.renderCharts(), 200);
    },

    bindEvents() {
        document.getElementById('btnRecordSmoke').addEventListener('click', () => {
            let msg = '정말 실패하셨나요? 타이머가 초기화됩니다.';
            UI.showCustomModal(msg, () => { Data.addLog('smoke'); UI.renderMain(); UI.renderCharts(); });
        });

        document.getElementById('btnRecordDrink').addEventListener('click', () => {
            let msg = '정말 실패하셨나요? 타이머가 초기화됩니다.';
            UI.showCustomModal(msg, () => { Data.addLog('drink'); UI.renderMain(); UI.renderCharts(); });
        });

        document.getElementById('modalConfirmBtn').addEventListener('click', () => {
            if (this.currentModalAction) this.currentModalAction();
            UI.closeModal();
        });
    },

    saveSettings() {
        let sMode = document.querySelector('input[name="setSmokeMode"]:checked').value;
        let dMode = document.querySelector('input[name="setDrinkMode"]:checked').value;

        if (sMode === 'off' && dMode === 'off') {
            alert("최소 하나의 목표는 켜져 있어야 합니다!");
            return;
        }

        localStorage.setItem("smokeMode", sMode);
        localStorage.setItem("drinkMode", dMode);

        // 각각의 입력창 값을 개별적으로 저장
        localStorage.setItem("smokePrice", Math.max(1, document.getElementById('setSmokePrice').value));
        localStorage.setItem("smokePerDay", Math.max(1, document.getElementById('setSmokePerDay').value));
        localStorage.setItem("smokeTarget", Math.max(1, document.getElementById('setSmokeTarget').value));

        localStorage.setItem("drinkCost", Math.max(1, document.getElementById('setDrinkCost').value));
        localStorage.setItem("drinkPerWeek", Math.max(1, document.getElementById('setDrinkPerWeek').value));
        localStorage.setItem("drinkTarget", Math.max(1, document.getElementById('setDrinkTarget').value));

        UI.closeSettingsModal();
        UI.renderMain();
    },

    askReset(type) {
        let name = type === 'smoke' ? '담배' : '술';
        UI.closeSettingsModal();
        UI.showCustomModal(`⚠️ ${name} 관련 모든 기록을 초기화할까요?`, () => {
            localStorage.setItem(type + "Start", Date.now());
            localStorage.setItem(type + "Logs", "[]");
            localStorage.setItem(type + "Records", "[0,0,0]");
            localStorage.setItem(type === 'smoke' ? "totalSmokeMoney" : "totalDrinkMoney", "0");
            UI.renderMain();
            UI.renderCharts();
        });
    },

    gameTimerId: null,
    isGameRunning: false,
    gameStartTime: 0,

    openDefenseGame(type) {
        document.getElementById('defenseStepText').innerText = "1단계: 눈으로 보고 누르기";
        document.getElementById('gameTimer').innerText = "0.00";
        document.getElementById('gameResult').innerText = "";
        let btn = document.getElementById('gameMainBtn');
        btn.innerText = "🔥 10초 버티기 시작";
        btn.classList.remove('stop');
        this.isGameRunning = false;
        document.getElementById('defenseModal').classList.add('active');
    },

    closeDefenseGame() {
        cancelAnimationFrame(this.gameTimerId);
        document.getElementById('defenseModal').classList.remove('active');
    },

    handleDefenseBtn() {
        if (!this.isGameRunning) {
            this.isGameRunning = true;
            this.gameStartTime = performance.now();
            document.getElementById('gameMainBtn').innerText = "🛑 멈춰!";
            document.getElementById('gameMainBtn').classList.add('stop');
            this.updateGame();
        } else {
            this.isGameRunning = false;
            cancelAnimationFrame(this.gameTimerId);
            let finalTime = ((performance.now() - this.gameStartTime) / 1000).toFixed(2);
            document.getElementById('gameTimer').innerText = finalTime;
            document.getElementById('gameMainBtn').innerText = "🔄 다시 도전";
            document.getElementById('gameMainBtn').classList.remove('stop');
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