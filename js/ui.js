let smokeChartObj = null; let drinkChartObj = null; Chart.register(ChartDataLabels);

const UI = {
    // 💡 모달 단일화: 모든 모달을 열고 닫는 전담 함수 생성
    openModal(id) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        State.currentModal = id;
    },
    closeModal(id) {
        document.getElementById(id).classList.remove('active');
        State.currentModal = null;
    },

    initTabs() {
        let sMode = Data.getMode('smoke');
        let dMode = Data.getMode('drink');
        const $ = id => document.getElementById(id);

        if (!$('tabGroup')) return;

        $('tabGroup').style.display = 'flex';

        if ($('tabSmoke')) $('tabSmoke').style.display = (sMode !== 'off') ? 'block' : 'none';
        if ($('tabDrink')) $('tabDrink').style.display = (dMode !== 'off') ? 'block' : 'none';

        if (sMode === 'off' && dMode === 'off') {
            $('tabGroup').style.display = 'none';
        } else {
            if (sMode === 'off' && State.currentTab === 'smoke') State.currentTab = 'drink';
            if (dMode === 'off' && State.currentTab === 'drink') State.currentTab = 'smoke';
        }

        this.switchTab(State.currentTab);
    },

    // 💡 탭 상태를 State로 통합
    switchTab(tab) {
        State.currentTab = tab;
        if (document.getElementById('smokeSection')) document.getElementById('smokeSection').style.display = (tab === 'smoke') ? 'block' : 'none';
        if (document.getElementById('drinkSection')) document.getElementById('drinkSection').style.display = (tab === 'drink') ? 'block' : 'none';

        if (document.getElementById('tabSmoke')) document.getElementById('tabSmoke').classList.toggle('active', tab === 'smoke');
        if (document.getElementById('tabDrink')) document.getElementById('tabDrink').classList.toggle('active', tab === 'drink');

        this.updateCharts();
    },

    updateTime() {
        let now = Date.now();
        let sT = Data.getTimeParsed(now - Data.getStartTime('smoke'));
        let dT = Data.getTimeParsed(now - Data.getStartTime('drink'));
        const $ = id => document.getElementById(id);

        if ($('smokeTitle')) $('smokeTitle').innerText = `금연기간 : ${sT.day}일 ${String(sT.hour).padStart(2, '0')}:${String(sT.min).padStart(2, '0')}:${String(sT.sec).padStart(2, '0')}`;
        if ($('drinkTitle')) $('drinkTitle').innerText = `금주기간 : ${dT.day}일 ${dT.hour}시간`;

        let drinkBtn = $('btnRecordDrink');
        if (drinkBtn) {
            let todayStr = new Date().toDateString();
            if (localStorage.getItem('lastDrinkDate') === todayStr) {
                drinkBtn.classList.add('disabled-btn');
                drinkBtn.innerText = "오늘의 기록 완료 (내일 초기화)";
                drinkBtn.disabled = true;
            } else {
                drinkBtn.classList.remove('disabled-btn');
                drinkBtn.innerText = "방금 마셨음 🥲 (하루 1회 제한)";
                drinkBtn.disabled = false;
            }
        }
    },

    updateMoney() {
        let now = Date.now();
        let sMode = Data.getMode('smoke'), dMode = Data.getMode('drink');
        let sStart = Data.getStartTime('smoke'), dStart = Data.getStartTime('drink');
        const $ = id => document.getElementById(id);

        if (sMode === 'quit' && $('smokeMainBoard')) {
            let targetMoney = Math.floor(Math.max(0, (now - sStart) / (1000 * 60 * 60 * 24)) * Data.getSetting("smokePerDay", 10) * (Data.getSetting("smokePrice", 4500) / 20));
            $('smokeMainBoard').className = 'saved-money-box mode-quit smoke';
            $('smokeBoardLabel').innerText = '현재 진행중인 절약 금액';
            $('smokeBoardText').innerText = targetMoney.toLocaleString();
            if ($('smokeTotalMoney')) $('smokeTotalMoney').innerText = (Data.getTotalMoney('smoke') + targetMoney).toLocaleString();
            if ($('smokeUnit')) $('smokeUnit').style.display = 'inline';
        } else if (sMode === 'reduce' && $('smokeMainBoard')) {
            let stat = Data.getReduceStatus('smoke');
            let target = Data.getSetting("smokeTarget", 5);
            $('smokeMainBoard').className = stat.isFail ? 'saved-money-box mode-fail' : 'saved-money-box mode-reduce smoke';
            $('smokeBoardLabel').innerText = stat.isFail ? '🚨 목표 초과!' : '🚬 오늘의 목표치 확인';
            $('smokeBoardText').innerText = stat.isFail ? Math.abs(stat.remaining) + '개 초과' : `하루 목표 ${target}개 중 ${stat.remaining}개 남음`;
            if ($('smokeUnit')) $('smokeUnit').style.display = 'none';
        }

        if (dMode === 'quit' && $('drinkMainBoard')) {
            let targetMoney = Math.floor(Math.max(0, (now - dStart) / (1000 * 60 * 60 * 24)) * (Data.getSetting("drinkPerWeek", 2) / 7) * Data.getSetting("drinkCost", 50000));
            $('drinkMainBoard').className = 'saved-money-box mode-quit drink';
            $('drinkBoardLabel').innerText = '현재 진행중인 절약 금액';
            $('drinkBoardText').innerText = targetMoney.toLocaleString();
            if ($('drinkTotalMoney')) $('drinkTotalMoney').innerText = (Data.getTotalMoney('drink') + targetMoney).toLocaleString();
            if ($('drinkUnit')) $('drinkUnit').style.display = 'inline';
        } else if (dMode === 'reduce' && $('drinkMainBoard')) {
            let stat = Data.getReduceStatus('drink');
            let target = Data.getSetting("drinkTarget", 1);
            $('drinkMainBoard').className = stat.isFail ? 'saved-money-box mode-fail' : 'saved-money-box mode-reduce drink';
            $('drinkBoardLabel').innerText = stat.isFail ? '🚨 목표 초과!' : '🍺 이번 주 목표치 확인';
            $('drinkBoardText').innerText = stat.isFail ? Math.abs(stat.remaining) + '회 초과' : `주간 목표 ${target}회 중 ${stat.remaining}회 남음`;
            if ($('drinkUnit')) $('drinkUnit').style.display = 'none';
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
        let monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (document.getElementById('monthDrink')) document.getElementById('monthDrink').innerText = Data.getLogs('drink').filter(t => t > monthAgo).length;
    },

    updateHealth() {
        let now = Date.now(); this._calcHealthUI('smoke', now - Data.getStartTime('smoke')); this._calcHealthUI('drink', now - Data.getStartTime('drink'));
    },

    _calcHealthUI(type, elapsedMs) {
        const stages = type === 'smoke' ? smokeStages : drinkStages; let currentIdx = 0;
        for (let i = 0; i < stages.length; i++) { if (elapsedMs >= stages[i].ms) currentIdx = i; else break; }
        let currentStage = stages[currentIdx]; let nextStage = stages[currentIdx + 1];
        let textEl = document.getElementById(type + 'HealthText'), percentEl = document.getElementById(type + 'HealthPercent'), barEl = document.getElementById(type + 'HealthBar'), nextEl = document.getElementById(type + 'HealthNext');

        if (!textEl) return;
        textEl.innerText = currentStage.msg;

        if (!nextStage) {
            percentEl.innerText = "100%"; barEl.style.width = "100%"; barEl.classList.add('max');
            if (nextEl) nextEl.innerText = "🎉 모든 회복 단계를 달성했습니다!";
        } else {
            barEl.classList.remove('max');
            let percentage = Math.min(100, Math.max(0, ((elapsedMs - currentStage.ms) / (nextStage.ms - currentStage.ms)) * 100));
            percentEl.innerText = percentage.toFixed(1) + "%"; barEl.style.width = percentage + "%";
            if (nextEl) nextEl.innerText = `👉 다음: ${nextStage.label} (${nextStage.msg})`;
        }
    },

    // 💡 updateAll 구조 분리: 무거운 차트 그리기와 핵심 데이터 업데이트를 분리
    updateCore() {
        this.updateTime(); this.updateMoney(); this.updateRanking(); this.updateStats(); this.updateHealth();
    },
    updateCharts() {
        this.renderCharts();
    },
    updateAll() {
        this.initTabs(); this.updateCore(); this.updateCharts();
    },

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
        this.openModal('roadmapModal'); // 통일된 모달 열기 적용

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
        document.getElementById('setSmokePrice').value = Data.getSetting('smokePrice', 4500).toLocaleString();
        document.getElementById('setSmokePerDay').value = Data.getSetting('smokePerDay', 10).toLocaleString();
        document.getElementById('setSmokeTarget').value = Data.getSetting('smokeTarget', 5).toLocaleString();
        document.getElementById('setDrinkCost').value = Data.getSetting('drinkCost', 50000).toLocaleString();
        document.getElementById('setDrinkPerWeek').value = Data.getSetting('drinkPerWeek', 2).toLocaleString();
        document.getElementById('setDrinkTarget').value = Data.getSetting('drinkTarget', 1).toLocaleString();

        document.getElementById(`sm_${Data.getMode('smoke')}`).checked = true; document.getElementById(`dr_${Data.getMode('drink')}`).checked = true;
        this.toggleSettingsInputs();
        this.openModal('settingsModal'); // 통일된 모달 열기 적용
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

    showCustomModal(msg, action) {
        document.getElementById('modalMsg').innerText = msg;
        window.currentModalAction = action;
        this.openModal('customModal'); // 통일된 모달 열기 적용
    }
};