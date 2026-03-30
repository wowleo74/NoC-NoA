let smokeChartObj = null; let drinkChartObj = null; Chart.register(ChartDataLabels);

const UI = {
    updateTime() {
        let now = Date.now();
        let sStart = Data.getStartTime('smoke'), dStart = Data.getStartTime('drink');
        let sT = Data.getTimeParsed(now - sStart), dT = Data.getTimeParsed(now - dStart);
        const $ = id => document.getElementById(id);
        
        if ($('smokeTime')) $('smokeTime').innerText = `${sT.day}일 ${String(sT.hour).padStart(2, '0')}:${String(sT.min).padStart(2, '0')}:${String(sT.sec).padStart(2, '0')}`;
        if ($('drinkDay')) $('drinkDay').innerText = `${dT.day}일 ${dT.hour}시간`;
        if ($('smokeStreak')) $('smokeStreak').innerText = `🔥 ${sT.day}일째`;
        if ($('drinkStreak')) $('drinkStreak').innerText = `🔥 ${dT.day}일째`;
    },

    updateMode() {
        let sMode = Data.getMode('smoke'), dMode = Data.getMode('drink');
        const $ = id => document.getElementById(id);
        if ($('smokeCard')) { $('smokeCard').classList.toggle('hidden', sMode === 'off'); $('smokeCard').className = `card smoke-card ${sMode === 'reduce' ? 'mode-reduce' : 'mode-quit'}`; }
        if ($('drinkCard')) { $('drinkCard').classList.toggle('hidden', dMode === 'off'); $('drinkCard').className = `card drink-card ${dMode === 'reduce' ? 'mode-reduce' : 'mode-quit'}`; }
    },

    updateMoney() {
        let now = Date.now(); let sMode = Data.getMode('smoke'), dMode = Data.getMode('drink');
        let sStart = Data.getStartTime('smoke'), dStart = Data.getStartTime('drink');
        const $ = id => document.getElementById(id);

        if (sMode === 'quit') {
            let targetMoney = Math.floor(Math.max(0, (now - sStart) / (1000 * 60 * 60 * 24)) * Data.getSetting("smokePerDay", 10) * (Data.getSetting("smokePrice", 4500) / 20));
            $('smokeBoardIcon').innerText = 'payments'; $('smokeMainBoard').style.background = 'var(--money-btn-grad)';
            $('smokeBoardText').innerText = targetMoney.toLocaleString() + "원 절약중!";
            if($('smokeTotalMoney')) $('smokeTotalMoney').innerText = (Data.getTotalMoney('smoke') + targetMoney).toLocaleString() + "원";
        } else if (sMode === 'reduce') {
            let stat = Data.getReduceStatus('smoke');
            $('smokeBoardIcon').innerText = stat.isFail ? 'warning' : 'task_alt'; $('smokeMainBoard').style.background = stat.isFail ? 'var(--status-fail)' : 'var(--smoke-main)';
            $('smokeBoardText').innerText = stat.isFail ? `목표 초과! (${Math.abs(stat.remaining)}개 오버)` : `오늘 ${stat.count}개 피움 / ${stat.remaining}개 남음`;
        }

        if (dMode === 'quit') {
            let targetMoney = Math.floor(Math.max(0, (now - dStart) / (1000 * 60 * 60 * 24)) * (Data.getSetting("drinkPerWeek", 2) / 7) * Data.getSetting("drinkCost", 50000));
            $('drinkBoardIcon').innerText = 'payments'; $('drinkMainBoard').style.background = 'var(--money-btn-grad)';
            $('drinkBoardText').innerText = targetMoney.toLocaleString() + "원 절약중!";
            if($('drinkTotalMoney')) $('drinkTotalMoney').innerText = (Data.getTotalMoney('drink') + targetMoney).toLocaleString() + "원";
        } else if (dMode === 'reduce') {
            let stat = Data.getReduceStatus('drink');
            $('drinkBoardIcon').innerText = stat.isFail ? 'warning' : 'task_alt'; $('drinkMainBoard').style.background = stat.isFail ? 'var(--status-fail)' : 'var(--drink-main)';
            $('drinkBoardText').innerText = stat.isFail ? `목표 초과! (${Math.abs(stat.remaining)}번 오버)` : `이번 주 ${stat.count}번 마심 / ${stat.remaining}번 남음`;
        }
    },

    updateRanking() {
        let now = Date.now(); const $ = id => document.getElementById(id);
        let smokeRecs = Data.getRecords('smoke'); let combinedSmoke = [...smokeRecs, now - Data.getStartTime('smoke')].sort((a,b) => b - a); 
        if($('smokeTop1Val')) $('smokeTop1Val').innerText = Data.getExactDurationText(combinedSmoke[0]);
        if($('smokeTop2Val')) $('smokeTop2Val').innerText = Data.getExactDurationText(combinedSmoke[1]);
        if($('smokeTop3Val')) $('smokeTop3Val').innerText = Data.getExactDurationText(combinedSmoke[2]);

        let drinkRecs = Data.getRecords('drink'); let combinedDrink = [...drinkRecs, now - Data.getStartTime('drink')].sort((a,b) => b - a);
        if($('drinkTop1Val')) $('drinkTop1Val').innerText = Data.getExactDurationText(combinedDrink[0]);
        if($('drinkTop2Val')) $('drinkTop2Val').innerText = Data.getExactDurationText(combinedDrink[1]);
        if($('drinkTop3Val')) $('drinkTop3Val').innerText = Data.getExactDurationText(combinedDrink[2]);
    },

    updateStats() {
        let todayStart = new Date().setHours(0, 0, 0, 0); let monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        let $ = id => document.getElementById(id);
        if($('todaySmoke')) $('todaySmoke').innerText = Data.getLogs('smoke').filter(t => t > todayStart).length;
        if($('monthDrink')) $('monthDrink').innerText = Data.getLogs('drink').filter(t => t > monthAgo).length;
    },

    updateHealth() {
        let now = Date.now(); this._calcHealthUI('smoke', now - Data.getStartTime('smoke')); this._calcHealthUI('drink', now - Data.getStartTime('drink'));
    },

    _calcHealthUI(type, elapsedMs) {
        const stages = type === 'smoke' ? smokeStages : drinkStages; let currentIdx = 0;
        for (let i = 0; i < stages.length; i++) { if (elapsedMs >= stages[i].ms) currentIdx = i; else break; }
        let currentStage = stages[currentIdx]; let nextStage = stages[currentIdx + 1];
        let textEl = document.getElementById(type + 'HealthText'); let nextEl = document.getElementById(type + 'HealthNext');
        let percentEl = document.getElementById(type + 'HealthPercent'); let barEl = document.getElementById(type + 'HealthBar');
        if (!textEl) return;
        textEl.innerText = currentStage.msg;
        if (!nextStage) {
            nextEl.innerText = "🎉 [MAX] 완전한 자유 달성!"; nextEl.style.color = "var(--money-main)";
            percentEl.innerText = "100%"; percentEl.style.color = "var(--money-main)";
            barEl.style.width = "100%"; barEl.classList.add('max'); 
        } else {
            nextEl.innerText = `👉 다음: ${nextStage.label}`; nextEl.style.color = "var(--text-gray)";
            percentEl.style.color = "var(--text-main)"; barEl.classList.remove('max');
            let stageDuration = nextStage.ms - currentStage.ms; let passed = elapsedMs - currentStage.ms;
            let percentage = Math.min(100, Math.max(0, (passed / stageDuration) * 100));
            percentEl.innerText = percentage.toFixed(1) + "%"; barEl.style.width = percentage + "%";
        }
    },

    updateAll() {
        this.updateMode(); this.updateTime(); this.updateMoney(); this.updateRanking(); this.updateStats(); this.updateHealth(); this.renderCharts();
    },

    openRoadmap(type) {
        const isSmoke = type === 'smoke'; const stages = isSmoke ? smokeStages : drinkStages;
        const elapsedMs = Date.now() - Data.getStartTime(type); const listContainer = document.getElementById('roadmapList');
        document.getElementById('roadmapTitle').innerHTML = isSmoke ? "🌿 금연 회복 도감" : "💧 금주 회복 도감";
        let html = ""; let themeClass = isSmoke ? 'smoke-theme' : 'drink-theme';
        
        for (let i = 0; i < stages.length; i++) {
            let st = stages[i]; let nextSt = stages[i+1]; let status = "future"; let icon = "🔒";
            if (elapsedMs >= st.ms) {
                if (!nextSt || elapsedMs < nextSt.ms) { status = "current " + themeClass; icon = "🔥"; } 
                else { status = "past"; icon = "✅"; }
            }
            html += `<div class="roadmap-item ${status}"><div class="rm-icon">${icon}</div><div class="rm-text"><span class="rm-label">${st.label} ${status === 'past' ? '달성 완료!' : (status.includes('current') ? '진행 중' : '미달성')}</span><span class="rm-msg">${st.msg}</span></div></div>`;
        }
        listContainer.innerHTML = html; document.getElementById('roadmapModal').classList.add('active');
        setTimeout(() => { const currentEl = listContainer.querySelector('.current'); if (currentEl) currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
    },

    renderCharts() {
        Chart.defaults.color = getComputedStyle(document.body).getPropertyValue('--text-gray').trim() || '#8B95A1'; 
        Chart.defaults.font.family = "'Pretendard', sans-serif"; Chart.defaults.font.weight = '800';
        const rs = getComputedStyle(document.documentElement);
        const smokeBarColor = rs.getPropertyValue('--smoke-main').trim() || '#FF5B73';
        const drinkBarColor = rs.getPropertyValue('--drink-main').trim() || '#5C80FF';

        let now = new Date(); let smokeLogs = Data.getLogs('smoke'), drinkLogs = Data.getLogs('drink');
        const labels = [], smokeData = [], drinkData = [];
        for (let i = 29; i >= 0; i--) {
            let d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            let sDay = d.setHours(0,0,0,0); let eDay = d.setHours(23,59,59,999);
            labels.push(`${d.getMonth()+1}/${d.getDate()}`);
            smokeData.push(smokeLogs.filter(t => t >= sDay && t <= eDay).length);
            drinkData.push(Math.min(1, drinkLogs.filter(t => t >= sDay && t <= eDay).length)); 
        }

        const commonOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', color: '#8B95A1', font: { weight: 'bold', size: 12 }, formatter: function(value) { return value > 0 ? value : ''; } } },
            layout: { padding: { top: 20 } }, scales: { y: { display: false, beginAtZero: true }, x: { grid: { display: false }, border: { display: false } } }, animation: { duration: 500 }
        };

        if (!smokeChartObj && document.getElementById('smokeChart')) {
            smokeChartObj = new Chart(document.getElementById('smokeChart').getContext('2d'), { type: 'bar', data: { labels: labels, datasets: [{ data: smokeData, backgroundColor: smokeBarColor, borderRadius: 6 }] }, options: commonOptions });
        } else if (smokeChartObj) { smokeChartObj.data.labels = labels; smokeChartObj.data.datasets[0].data = smokeData; smokeChartObj.update(); }
        
        if (!drinkChartObj && document.getElementById('drinkChart')) {
            drinkChartObj = new Chart(document.getElementById('drinkChart').getContext('2d'), { type: 'bar', data: { labels: labels, datasets: [{ data: drinkData, backgroundColor: drinkBarColor, borderRadius: 6 }] }, options: commonOptions });
        } else if (drinkChartObj) { drinkChartObj.data.labels = labels; drinkChartObj.data.datasets[0].data = drinkData; drinkChartObj.update(); }
    },

    openSettingsModal() {
        document.getElementById('setSmokePrice').value = Data.getSetting('smokePrice', 4500); document.getElementById('setSmokePerDay').value = Data.getSetting('smokePerDay', 10); document.getElementById('setSmokeTarget').value = Data.getSetting('smokeTarget', 5);
        document.getElementById('setDrinkCost').value = Data.getSetting('drinkCost', 50000); document.getElementById('setDrinkPerWeek').value = Data.getSetting('drinkPerWeek', 2); document.getElementById('setDrinkTarget').value = Data.getSetting('drinkTarget', 1);
        let sMode = Data.getMode('smoke'); let dMode = Data.getMode('drink');
        document.getElementById(`sm_${sMode}`).checked = true; document.getElementById(`dr_${dMode}`).checked = true;
        this.toggleSettingsInputs(); document.getElementById('settingsModal').classList.add('active');
    },

    closeSettingsModal() { document.getElementById('settingsModal').classList.remove('active'); },
    
    toggleSettingsInputs() {
        let sMode = document.querySelector('input[name="setSmokeMode"]:checked').value; let dMode = document.querySelector('input[name="setDrinkMode"]:checked').value;
        document.getElementById('wrapSmokePrice').style.display = (sMode === 'quit') ? 'flex' : 'none'; document.getElementById('wrapSmokeOriginal').style.display = (sMode === 'quit') ? 'flex' : 'none'; document.getElementById('wrapSmokeTarget').style.display = (sMode === 'reduce') ? 'flex' : 'none';
        document.getElementById('wrapDrinkCost').style.display = (dMode === 'quit') ? 'flex' : 'none'; document.getElementById('wrapDrinkOriginal').style.display = (dMode === 'quit') ? 'flex' : 'none'; document.getElementById('wrapDrinkTarget').style.display = (dMode === 'reduce') ? 'flex' : 'none';
    },

    showCustomModal(msg, action) { document.getElementById('modalMsg').innerText = msg; window.currentModalAction = action; document.getElementById('customModal').classList.add('active'); },
    closeModal() { document.getElementById('customModal').classList.remove('active'); }
};