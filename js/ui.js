let smokeChartObj = null; Chart.register(ChartDataLabels);

const UI = {
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

    switchTab(tab) {
        State.currentTab = tab;
        if (document.getElementById('smokeSection')) document.getElementById('smokeSection').style.display = (tab === 'smoke') ? 'block' : 'none';
        if (document.getElementById('drinkSection')) document.getElementById('drinkSection').style.display = (tab === 'drink') ? 'block' : 'none';

        if (document.getElementById('tabSmoke')) document.getElementById('tabSmoke').classList.toggle('active', tab === 'smoke');
        if (document.getElementById('tabDrink')) document.getElementById('tabDrink').classList.toggle('active', tab === 'drink');

        this.updateCharts();
    },

    formatTimeDisplay(ms) {
        let s = Data.getTimeParsed(ms);
        let timeStr = `${String(s.hour).padStart(2, '0')}:${String(s.min).padStart(2, '0')}:${String(s.sec).padStart(2, '0')}`;
        return s.day > 0 ? `${s.day}일 ${timeStr}` : timeStr;
    },

    updateTime() {
        let now = Date.now();
        let sT = now - Data.getStartTime('smoke');
        let dT = now - Data.getStartTime('drink');
        const $ = id => document.getElementById(id);

        if ($('smokeTitle')) $('smokeTitle').innerText = `금연기간 : ${this.formatTimeDisplay(sT)}`;
        if ($('drinkTitle')) $('drinkTitle').innerText = `금주기간 : ${this.formatTimeDisplay(dT)}`;
    },

    updateMoney() {
        let now = Date.now();
        let sMode = Data.getMode('smoke'), dMode = Data.getMode('drink');
        const $ = id => document.getElementById(id);

        // 🚬 금연 금액 처리
        if (sMode === 'quit' && $('smokeMainBoard')) {
            $('smokeMainBoard').className = 'saved-money-box mode-quit smoke';
            $('smokeBoardLabel').innerText = '현재 진행중인 절약 금액';

            let sStart = Data.getStartTime('smoke');
            // 실시간 진행 금액 (초 단위 반영)
            let streakDays = (now - sStart) / (1000 * 60 * 60 * 24);
            let cigPrice = Data.getSetting("smokePrice", 4500) / 20;
            let smokePerDay = Data.getSetting("smokePerDay", 10);

            let targetMoney = Math.floor(streakDays * smokePerDay * cigPrice);
            $('smokeBoardText').innerText = targetMoney.toLocaleString();

            // 💡 [기획 반영] 자정 기준 일일 정산 로직
            if ($('smokeTotalMoney')) {
                let appStart = Data.getAppStartTime('smoke');

                let todayMidnight = new Date(now).setHours(0, 0, 0, 0);
                let appStartMidnight = new Date(appStart).setHours(0, 0, 0, 0);

                // 앱 설치일로부터 '어제'까지 완전히 지난 일수
                let passedDays = Math.max(0, (todayMidnight - appStartMidnight) / (1000 * 60 * 60 * 24));

                let expectedTotal = passedDays * smokePerDay;
                // 오늘 자정(00:00) 이전의 실패 기록만 추출
                let actualTotal = Data.getLogs('smoke').filter(t => t >= appStart && t < todayMidnight).length;

                // 확정된 누적 금액 (금연은 마이너스 방지 유지)
                let totalSavedMoney = Math.max(0, Math.floor((expectedTotal - actualTotal) * cigPrice));

                $('smokeTotalMoney').innerText = totalSavedMoney.toLocaleString();
                $('smokeTotalMoney').style.color = 'inherit';
            }
            if ($('smokeUnit')) $('smokeUnit').style.display = 'inline';

        } else if (sMode === 'reduce' && $('smokeMainBoard')) {
            let stat = Data.getReduceStatus('smoke');
            let target = Data.getSetting("smokeTarget", 5);
            $('smokeMainBoard').className = stat.isFail ? 'saved-money-box mode-fail' : 'saved-money-box mode-reduce smoke';
            $('smokeBoardLabel').innerText = stat.isFail ? '🚨 목표 초과!' : '🚬 오늘의 목표치 확인';
            $('smokeBoardText').innerText = stat.isFail ? Math.abs(stat.remaining) + '개 초과' : `하루 목표 ${target}개 중 ${stat.remaining}개 남음`;
            if ($('smokeUnit')) $('smokeUnit').style.display = 'none';
        }

        // 🍺 금주 금액 처리
        if (dMode === 'quit' && $('drinkMainBoard')) {
            $('drinkMainBoard').className = 'saved-money-box mode-quit drink';
            $('drinkBoardLabel').innerText = '현재 진행중인 절약 금액';

            let dStart = Data.getStartTime('drink');
            // 실시간 진행 금액
            let streakWeeks = (now - dStart) / (1000 * 60 * 60 * 24 * 7);
            let drinkCost = Data.getSetting("drinkCost", 50000);
            let drinkPerWeek = Data.getSetting("drinkPerWeek", 2);

            let targetMoney = Math.floor(streakWeeks * drinkPerWeek * drinkCost);
            $('drinkBoardText').innerText = targetMoney.toLocaleString();

            // 💡 [기획 반영] 주간 정산 로직 (월요일 시작 기준)
            if ($('drinkTotalMoney')) {
                let appStart = Data.getAppStartTime('drink');

                // 특정 날짜가 속한 주의 '월요일 자정(00:00)'을 구하는 함수
                const getMondayMidnight = (d) => {
                    let date = new Date(d);
                    let day = date.getDay(); // 0(일) ~ 6(토)
                    let diff = date.getDate() - day + (day === 0 ? -6 : 1); // 일요일이면 지난주 월요일로
                    return new Date(date.getFullYear(), date.getMonth(), diff).setHours(0, 0, 0, 0);
                };

                let currentMonday = getMondayMidnight(now);
                let appStartMonday = getMondayMidnight(appStart);

                // 앱 설치 주차부터 '지난주'까지 온전히 끝난 주(Week)의 수
                let passedWeeks = Math.max(0, Math.round((currentMonday - appStartMonday) / (1000 * 60 * 60 * 24 * 7)));

                let expectedTotal = passedWeeks * drinkPerWeek;
                // 이번 주 월요일 00:00 이전의 실패 기록만 추출 (지난주까지의 성적표)
                let actualTotal = Data.getLogs('drink').filter(t => t >= appStart && t < currentMonday).length;

                // 확정된 누적 금액
                let totalSavedMoney = Math.floor((expectedTotal - actualTotal) * drinkCost);

                $('drinkTotalMoney').innerText = totalSavedMoney.toLocaleString();

                // 💡 금주는 초과 실패 시 마이너스 금액(적자) 허용 및 빨간색 표시!
                $('drinkTotalMoney').style.color = totalSavedMoney < 0 ? 'var(--status-fail)' : 'inherit';
            }
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
        let now = Date.now();
        const $ = id => document.getElementById(id);

        const renderRank = (prefix, dataArr) => {
            for (let i = 0; i < 3; i++) {
                let r = dataArr[i];
                let dateEl = $(`${prefix}Top${i + 1}Date`);
                let valEl = $(`${prefix}Top${i + 1}Val`);

                if (!r || r.duration === 0) {
                    if (dateEl) { dateEl.innerText = "-"; dateEl.style.color = "var(--text-gray)"; }
                    if (valEl) valEl.innerText = "기록 없음";
                    continue;
                }

                if (valEl) valEl.innerText = Data.getExactDurationText(r.duration);

                if (dateEl) {
                    if (r.date === 'current') {
                        dateEl.innerText = "현재 진행중";
                        dateEl.style.color = prefix === 'smoke' ? "var(--smoke-main)" : "var(--drink-main)";
                    } else if (!r.date) {
                        dateEl.innerText = "과거 기록";
                        dateEl.style.color = "var(--text-gray)";
                    } else {
                        let d = new Date(r.date);
                        dateEl.innerText = `${d.getFullYear().toString().slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                        dateEl.style.color = "var(--text-gray)";
                    }
                }
            }
        };

        let smokeRecs = Data.getRecords('smoke');
        let combinedSmoke = [...smokeRecs, { duration: now - Data.getStartTime('smoke'), date: 'current' }].sort((a, b) => b.duration - a.duration);
        renderRank('smoke', combinedSmoke);

        let drinkRecs = Data.getRecords('drink');
        let combinedDrink = [...drinkRecs, { duration: now - Data.getStartTime('drink'), date: 'current' }].sort((a, b) => b.duration - a.duration);
        renderRank('drink', combinedDrink);
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

    updateCore() {
        this.updateTime(); this.updateMoney(); this.updateRanking(); this.updateStats(); this.updateHealth();
    },
    updateCharts() {
        this.renderCharts();
        this.renderDrinkCalendar();
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
        this.openModal('roadmapModal');

        setTimeout(() => {
            const currentEl = listContainer.querySelector('.current');
            if (currentEl) currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    },

    renderCharts() {
        Chart.defaults.color = '#8B95A1'; Chart.defaults.font.family = "'Pretendard', sans-serif"; Chart.defaults.font.weight = '800';
        const smokeBarColor = '#FF5B73';

        let now = new Date(); let smokeLogs = Data.getLogs('smoke');
        const labels = [], smokeData = [];
        for (let i = 29; i >= 0; i--) {
            let d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            let sDay = d.setHours(0, 0, 0, 0); let eDay = d.setHours(23, 59, 59, 999);
            labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
            smokeData.push(smokeLogs.filter(t => t >= sDay && t <= eDay).length);
        }

        const commonOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'end', color: '#8B95A1', font: { weight: 'bold', size: 12 }, formatter: function (v) { return v > 0 ? v : ''; } } }, layout: { padding: { top: 20 } }, scales: { y: { display: false, beginAtZero: true, suggestedMax: 4 }, x: { grid: { display: false }, border: { display: false } } }, animation: { duration: 0 } };

        let sWrap = document.getElementById('smokeChartWrapper');
        if (document.getElementById('smokeChart')) {
            if (smokeChartObj && document.getElementById('smokeChart').clientHeight === 0 && sWrap.offsetWidth > 0) {
                smokeChartObj.destroy(); smokeChartObj = null;
            }
            if (!smokeChartObj && sWrap.offsetWidth > 0) {
                smokeChartObj = new Chart(document.getElementById('smokeChart').getContext('2d'), { type: 'bar', data: { labels: labels, datasets: [{ data: smokeData, backgroundColor: smokeBarColor, borderRadius: 6 }] }, options: commonOptions });
            } else if (smokeChartObj) {
                smokeChartObj.data.labels = labels;
                smokeChartObj.data.datasets[0].data = smokeData;
                smokeChartObj.update();
            }
        }
        setTimeout(() => { if (sWrap) sWrap.scrollLeft = sWrap.scrollWidth; }, 50);
    },

    renderDrinkCalendar() {
        const slider = document.getElementById('drinkCalendarSlider');
        if (!slider) return;

        const drinkLogs = Data.getLogs('drink');
        const drinkDates = new Set(drinkLogs.map(ms => {
            let d = new Date(ms);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }));

        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        let html = '';
        let now = new Date();
        let todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

        for (let i = 0; i < 6; i++) {
            let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            let year = d.getFullYear();
            let month = d.getMonth();
            let daysInMonth = new Date(year, month + 1, 0).getDate();
            let firstDayIndex = new Date(year, month, 1).getDay();

            let gridHtml = `<div class="calendar-month-wrapper">
                                <div class="calendar-month-title">${year}년 ${month + 1}월</div>
                                <div class="calendar-grid">`;

            dayNames.forEach((name, idx) => {
                let cls = 'cal-day-header';
                if (idx === 0) cls += ' sun';
                if (idx === 6) cls += ' sat';
                gridHtml += `<div class="${cls}">${name}</div>`;
            });

            for (let j = 0; j < firstDayIndex; j++) {
                gridHtml += `<div class="cal-day empty"></div>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                let currentStr = `${year}-${month}-${day}`;
                let isToday = (currentStr === todayStr);
                let hasDrank = drinkDates.has(currentStr);
                let dayOfWeek = (firstDayIndex + day - 1) % 7;

                let cls = 'cal-day';
                if (dayOfWeek === 0) cls += ' sun';
                if (dayOfWeek === 6) cls += ' sat';
                if (isToday) cls += ' today';
                if (hasDrank) cls += ' drank';

                gridHtml += `<div class="${cls}">${day}</div>`;
            }

            gridHtml += `</div></div>`;
            html += gridHtml;
        }

        slider.innerHTML = html;
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
        this.openModal('settingsModal');
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
        this.openModal('customModal');
    },

    showAlertModal(msg) {
        document.getElementById('alertMsg').innerText = msg;
        this.openModal('alertModal');
        document.getElementById('btnAlertConfirm').onclick = () => this.closeModal('alertModal');
    }
};