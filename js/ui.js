let smokeChartObj = null; let drinkChartObj = null; Chart.register(ChartDataLabels);

const UI = {
    currentTab: 'smoke',

    initTabs() {
        let sMode = Data.getMode('smoke');
        let dMode = Data.getMode('drink');
        const $ = id => document.getElementById(id);

        if (!$('tabGroup')) return; // 방어 코드

        $('tabGroup').style.display = 'flex';

        if ($('tabSmoke')) $('tabSmoke').style.display = (sMode !== 'off') ? 'block' : 'none';
        if ($('tabDrink')) $('tabDrink').style.display = (dMode !== 'off') ? 'block' : 'none';

        if (sMode === 'off' && dMode === 'off') {
            $('tabGroup').style.display = 'none';
        } else {
            if (sMode === 'off' && this.currentTab === 'smoke') this.currentTab = 'drink';
            if (dMode === 'off' && this.currentTab === 'drink') this.currentTab = 'smoke';
        }

        this.switchTab(this.currentTab);
    },

    switchTab(tab) {
        this.currentTab = tab;
        if (document.getElementById('smokeSection')) document.getElementById('smokeSection').style.display = (tab === 'smoke') ? 'block' : 'none';
        if (document.getElementById('drinkSection')) document.getElementById('drinkSection').style.display = (tab === 'drink') ? 'block' : 'none';

        if (document.getElementById('tabSmoke')) document.getElementById('tabSmoke').classList.toggle('active', tab === 'smoke');
        if (document.getElementById('tabDrink')) document.getElementById('tabDrink').classList.toggle('active', tab === 'drink');

        this.renderCharts();
    },

    updateTime() {
        let now = Date.now();
        let sT = Data.getTimeParsed(now - Data.getStartTime('smoke'));
        let dT = Data.getTimeParsed(now - Data.getStartTime('drink'));
        const $ = id => document.getElementById(id);

        if ($('smokeTime')) $('smokeTime').innerText = `${sT.day}일 ${String(sT.hour).padStart(2, '0')}:${String(sT.min).padStart(2, '0')}:${String(sT.sec).padStart(2, '0')}`;
        if ($('drinkDay')) $('drinkDay').innerText = `${dT.day}일 ${dT.hour}시간`;
        if ($('smokeStreak')) $('smokeStreak').innerText = `🔥 ${sT.day}일째`;
        if ($('drinkStreak')) $('drinkStreak').innerText = `🔥 ${dT.day}일째`;
    },

    updateMoney() {
        let now = Date.now();
        let sMode = Data.getMode('smoke'), dMode = Data.getMode('drink');
        let sStart = Data.getStartTime('smoke'), dStart = Data.getStartTime('drink');
        const $ = id => document.getElementById(id);

        if (sMode === 'quit' && $('smokeMainBoard')) {
            let targetMoney = Math.floor(Math.max(0, (now - sStart) / (1000 * 60 * 60 * 24)) * Data.getSetting("smokePerDay", 10) * (Data.getSetting("smokePrice", 4500) / 20));
            $('smokeMainBoard').className = 'saved-money-box mode-quit smoke';
            $('smokeBoardLabel').innerText = '현재 절약 금액';
            $('smokeBoardText').innerText = targetMoney.toLocaleString();
            if ($('smokeTotalMoney')) $('smokeTotalMoney').innerText = (Data.getTotalMoney('smoke') + targetMoney).toLocaleString();
            let unit = document.querySelector('#smokeMainBoard .unit'); if (unit) unit.style.display = 'inline';
        } else if (sMode === 'reduce' && $('smokeMainBoard')) {
            let stat = Data.getReduceStatus('smoke');
            $('smokeMainBoard').className = stat.isFail ? 'saved-money-box mode-fail' : 'saved-money-box mode-reduce smoke';
            $('smokeBoardLabel').innerText = stat.isFail ? '🚨 목표 초과!' : '🚬 오늘 남은 개비 수';
            $('smokeBoardText').innerText = stat.isFail ? Math.abs(stat.remaining) + '개 오버' : stat.remaining + '개';
            let unit = document.querySelector('#smokeMainBoard .unit'); if (unit) unit.style.display = 'none';
        }

        if (dMode === 'quit' && $('drinkMainBoard')) {
            let targetMoney = Math.floor(Math.max(0, (now - dStart) / (1000 * 60 * 60 * 24)) * (Data.getSetting("drinkPerWeek", 2) / 7) * Data.getSetting("drinkCost", 50000));
            $('drinkMainBoard').className = 'saved-money-box mode-quit drink';
            $('drinkBoardLabel').innerText = '현재 절약 금액';
            $('drinkBoardText').innerText = targetMoney.toLocaleString();
            if ($('drinkTotalMoney')) $('drinkTotalMoney').innerText = (Data.getTotalMoney('drink') + targetMoney).toLocaleString();
            let unit = document.querySelector('#drinkMainBoard .unit'); if (unit) unit.style.display = 'inline';
        } else if (dMode === 'reduce' && $('drinkMainBoard')) {
            let stat = Data.getReduceStatus('drink');
            $('drinkMainBoard').className = stat.isFail ? 'saved-money-box mode-fail' : 'saved-money-box mode-reduce drink';
            $('drinkBoardLabel').innerText = stat.isFail ? '🚨 목표 초과!' : '🍺 이번 주 남은 음주 횟수';
            $('drinkBoardText').innerText = stat.isFail ? Math.abs(stat.remaining) + '회 오버' : stat.remaining + '회';
            let unit = document.querySelector('#drinkMainBoard .unit'); if (unit) unit.style.display = 'none';
        }

        document.querySelectorAll('.smoke-card .hide-on-reduce').forEach(el => el.style.display = sMode === 'reduce' ? 'none' : 'flex');
        document.querySelectorAll('.drink-card .hide-on-reduce').forEach(el => el.style.display = dMode === 'reduce' ? 'none' : 'flex');
    },

    updateRanking() {
        let now = Date.now(); const $ = id => document.getElementById(id);
        let smokeRecs = Data.getRecords('smoke'); let combinedSmoke = [...smokeRecs, now - Data.getStartTime('smoke')].sort((a, b) => b - a);
        if ($('smokeTop1Val')) $('smokeTop1Val').innerText = Data.getExactDurationText(combinedSmoke[0]);
        if ($('smokeTop2Val')) $('smokeTop2Val').innerText = Data.getExactDurationText(combinedSmoke[1]);
        if ($('smokeTop3Val')) $('smokeTop3Val').innerText = Data.getExactDurationText(combinedSmoke[2]);

        let drinkRecs = Data.getRecords('drink'); let combinedDrink = [...drinkRecs, now - Data.getStartTime('drink')].sort((a, b) => b - a);
        if ($('drinkTop1Val')) $('drinkTop1Val').innerText = Data.getExactDurationText(combinedDrink[0]);
        if ($('drinkTop2Val')) $('drinkTop2Val').innerText = Data.getExactDurationText(combinedDrink[1]);
        if ($('drinkTop3Val')) $('drinkTop3Val').innerText = Data.getExactDurationText(combinedDrink[2]);
    },

    updateStats() {
        let todayStart = new Date().setHours(0, 0, 0, 0); let monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (document.getElementById('todaySmoke')) document.getElementById('todaySmoke').innerText = Data.getLogs('smoke').filter(t => t > todayStart).length;
        if (document.getElementById('monthDrink')) document.getElementById('monthDrink').innerText = Data.getLogs('drink').filter(t => t > monthAgo).length;
    },

    updateHealth() {
        let now = Date.now(); this._calcHealthUI('smoke', now - Data.getStartTime('smoke')); this._calcHealthUI('drink', now - Data.getStartTime('drink'));
    },

    _calcHealthUI(type, elapsedMs) {
        const stages = type === 'smoke' ? smokeStages : drinkStages; let currentIdx = 0;
        for (let i = 0; i < stages.length; i++) { if (elapsedMs >= stages[i].ms) currentIdx = i; else break; }
        let currentStage = stages[currentIdx]; let nextStage = stages[currentIdx + 1];
        let textEl = document.getElementById(type + 'HealthText'), percentEl = document.getElementById(type + 'HealthPercent'), barEl = document.getElementById(type + 'HealthBar');
        if (!textEl) return;
        textEl.innerText = currentStage.msg;
        if (!nextStage) {
            percentEl.innerText = "100%"; barEl.style.width = "100%"; barEl.classList.add('max');
        } else {
            barEl.classList.remove('max');
            let percentage = Math.min(100, Math.max(0, ((elapsedMs - currentStage.ms) / (nextStage.ms - currentStage.ms)) * 100));
            percentEl.innerText = percentage.toFixed(1) + "%"; barEl.style.width = percentage + "%";
        }
    },

    updateAll() {
        this.initTabs(); this.updateTime(); this.updateMoney(); this.updateRanking(); this.updateStats(); this.updateHealth(); this.renderCharts();
    },

    // 🚨 완전히 복구된 '회복 도감 그리기' 함수입니다!
    openRoadmap(type) {
        const isSmoke = type === 'smoke';
        const stages = isSmoke ? smokeStages : drinkStages;
        const elapsedMs = Date.now() - Data.getStartTime(type);
        const listContainer = document.getElementById('roadmapList');

        document.getElementById('roadmapTitle').innerHTML = isSmoke ? "🌿 금연 회복 도감" : "💧 금주 회복 도감";

        let html = "";
        let themeClass = isSmoke ? 'smoke-theme' : 'drink-theme';

        for (let i = 0; i < stages.length; i++) {
            let st = stages[i];
            let nextSt = stages[i + 1];
            let status = "future";
            let icon = "🔒";

            if (elapsedMs >= st.ms) {
                if (!nextSt || elapsedMs < nextSt.ms) {
                    status = "current " + themeClass;
                    icon = "🔥";
                } else {
                    status = "past";
                    icon = "✅";
                }
            }

            let statusText = status === 'past' ? '달성 완료!' : (status.includes('current') ? '진행 중' : '미달성');

            html += `
            <div class="roadmap-item ${status}">
                <div class="rm-icon">${icon}</div>
                <div class="rm-text">
                    <span class="rm-label">${st.label} - ${statusText}</span>
                    <span class="rm-msg">${st.msg}</span>
                </div>
            </div>`;
        }

        listContainer.innerHTML = html;
        document.getElementById('roadmapModal').classList.add('active');

        // 창이 열렸을 때 현재 진행 중인 카드로 스크롤 자동 이동
        setTimeout(() => {
            const currentEl = listContainer.querySelector('.current');
            if (currentEl) currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    },

    renderCharts() {
        Chart.defaults.color = '#8B95A1'; Chart.defaults.font.family = "'Pretendard', sans-serif"; Chart.defaults.font.weight = '800';
        const smokeBarColor = '#FF5B73'; const drinkBarColor = '#5C80FF';

        let now = new Date(); let smokeLogs = Data.getLogs('smoke'), drinkLogs = Data.getLogs('drink');
        const labels = [], smokeData = [], drinkData = [];
        for (let i = 29; i >= 0; i--) {
            let d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            let sDay = d.setHours(0, 0, 0, 0); let eDay = d.setHours(23, 59, 59, 999);
            labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
            smokeData.push(smokeLogs.filter(t => t >= sDay && t <= eDay).length);
            drinkData.push(drinkLogs.filter(t => t >= sDay && t <= eDay).length);
        }

        const commonOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', color: '#8B95A1', font: { weight: 'bold', size: 12 }, formatter: function (v) { return v > 0 ? v : ''; } } }, layout: { padding: { top: 20 } }, scales: { y: { display: false, beginAtZero: true }, x: { grid: { display: false }, border: { display: false } } }, animation: { duration: 0 } };

        if (!smokeChartObj && document.getElementById('smokeChart')) {
            smokeChartObj = new Chart(document.getElementById('smokeChart').getContext('2d'), { type: 'bar', data: { labels: labels, datasets: [{ data: smokeData, backgroundColor: smokeBarColor, borderRadius: 6 }] }, options: commonOptions });
        } else if (smokeChartObj) { smokeChartObj.data.datasets[0].data = smokeData; smokeChartObj.update(); }

        if (!drinkChartObj && document.getElementById('drinkChart')) {
            drinkChartObj = new Chart(document.getElementById('drinkChart').getContext('2d'), { type: 'bar', data: { labels: labels, datasets: [{ data: drinkData, backgroundColor: drinkBarColor, borderRadius: 6 }] }, options: commonOptions });
        } else if (drinkChartObj) { drinkChartObj.data.datasets[0].data = drinkData; drinkChartObj.update(); }

        setTimeout(() => {
            let sWrap = document.getElementById('smokeChartWrapper'); let dWrap = document.getElementById('drinkChartWrapper');
            if (sWrap) sWrap.scrollLeft = sWrap.scrollWidth; if (dWrap) dWrap.scrollLeft = dWrap.scrollWidth;
        }, 50);
    },

    openSettingsModal() {
        document.getElementById('setSmokePrice').value = Data.getSetting('smokePrice', 4500); document.getElementById('setSmokePerDay').value = Data.getSetting('smokePerDay', 10); document.getElementById('setSmokeTarget').value = Data.getSetting('smokeTarget', 5);
        document.getElementById('setDrinkCost').value = Data.getSetting('drinkCost', 50000); document.getElementById('setDrinkPerWeek').value = Data.getSetting('drinkPerWeek', 2); document.getElementById('setDrinkTarget').value = Data.getSetting('drinkTarget', 1);
        document.getElementById(`sm_${Data.getMode('smoke')}`).checked = true; document.getElementById(`dr_${Data.getMode('drink')}`).checked = true;
        this.toggleSettingsInputs(); document.getElementById('settingsModal').classList.add('active');
    },

    toggleSettingsInputs() {
        let sMode = document.querySelector('input[name="setSmokeMode"]:checked').value; let dMode = document.querySelector('input[name="setDrinkMode"]:checked').value;
        document.getElementById('wrapSmokePrice').style.display = (sMode !== 'off') ? 'flex' : 'none';
        document.getElementById('wrapSmokeOriginal').style.display = (sMode !== 'off') ? 'flex' : 'none';
        document.getElementById('wrapSmokeTarget').style.display = (sMode === 'reduce') ? 'flex' : 'none';
        document.getElementById('wrapDrinkCost').style.display = (dMode !== 'off') ? 'flex' : 'none';
        document.getElementById('wrapDrinkOriginal').style.display = (dMode !== 'off') ? 'flex' : 'none';
        document.getElementById('wrapDrinkTarget').style.display = (dMode === 'reduce') ? 'flex' : 'none';
    },

    showCustomModal(msg, action) { document.getElementById('modalMsg').innerText = msg; window.currentModalAction = action; document.getElementById('customModal').classList.add('active'); },
    closeModal() { document.getElementById('customModal').classList.remove('active'); }
};