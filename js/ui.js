let smokeChartObj = null;
Chart.register(ChartDataLabels);

const UI = {
    openModal(id) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        let modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
        }
        State.currentModal = id;
    },

    closeModal(id) {
        let modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
        }
        State.currentModal = null;
    },

    initTabs() {
        let sMode = Data.getMode('smoke');
        let dMode = Data.getMode('drink');

        let tabGroup = document.getElementById('tabGroup');
        let emptyState = document.getElementById('emptyState');
        let smokeSection = document.getElementById('smokeSection');
        let drinkSection = document.getElementById('drinkSection');

        if (!tabGroup) return;

        if (sMode === 'off' && dMode === 'off') {
            tabGroup.style.display = 'none';
            if (smokeSection) smokeSection.style.display = 'none';
            if (drinkSection) drinkSection.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        } else {
            tabGroup.style.display = 'flex';
            if (emptyState) emptyState.style.display = 'none';
        }

        let tabSmoke = document.getElementById('tabSmoke');
        let tabDrink = document.getElementById('tabDrink');

        if (tabSmoke) tabSmoke.style.display = (sMode !== 'off') ? 'block' : 'none';
        if (tabDrink) tabDrink.style.display = (dMode !== 'off') ? 'block' : 'none';

        if (sMode === 'off' && State.currentTab === 'smoke') State.currentTab = 'drink';
        if (dMode === 'off' && State.currentTab === 'drink') State.currentTab = 'smoke';

        this.switchTab(State.currentTab);
    },

    switchTab(tab) {
        State.currentTab = tab;

        let smokeSec = document.getElementById('smokeSection');
        let drinkSec = document.getElementById('drinkSection');

        if (smokeSec) smokeSec.style.display = (tab === 'smoke') ? 'block' : 'none';
        if (drinkSec) drinkSec.style.display = (tab === 'drink') ? 'block' : 'none';

        let tabSmoke = document.getElementById('tabSmoke');
        let tabDrink = document.getElementById('tabDrink');

        if (tabSmoke) tabSmoke.classList.toggle('active', tab === 'smoke');
        if (tabDrink) tabDrink.classList.toggle('active', tab === 'drink');

        this.updateCharts();

        if (typeof fitTextToContainer === 'function') {
            setTimeout(fitTextToContainer, 10);
        }
    },

    formatTimeDisplay(ms) {
        let s = Data.getTimeParsed(ms);
        let hStr = String(s.hour).padStart(2, '0');
        let mStr = String(s.min).padStart(2, '0');
        let secStr = String(s.sec).padStart(2, '0');

        if (s.day < 1) {
            return `${hStr}:${mStr}:${secStr}`;
        } else if (s.day < 10) {
            return `${s.day}일 ${hStr}:${mStr}:${secStr}`;
        } else {
            return `${s.day}일 ${hStr}:${mStr}`;
        }
    },

    updateTime() {
        let now = Date.now();
        let sT = Math.max(0, now - Data.getStartTime('smoke'));
        let dT = Math.max(0, now - Data.getStartTime('drink'));

        let smokeTitle = document.getElementById('smokeTitle');
        let drinkTitle = document.getElementById('drinkTitle');

        if (smokeTitle) {
            let span = smokeTitle.querySelector('.fit-text');
            if(span) span.innerText = `금연기간 : ${this.formatTimeDisplay(sT)}`;
        }
        if (drinkTitle) {
            let span = drinkTitle.querySelector('.fit-text');
            if(span) span.innerText = `금주기간 : ${this.formatTimeDisplay(dT)}`;
        }
    },

    updateMoney() {
        let now = Date.now();
        let sMode = Data.getMode('smoke');
        let dMode = Data.getMode('drink');

        let smokeQuitBoard = document.getElementById('smokeQuitBoard');
        let smokeReduceBoard = document.getElementById('smokeReduceBoard');
        let drinkQuitBoard = document.getElementById('drinkQuitBoard');
        let drinkReduceBoard = document.getElementById('drinkReduceBoard');

        // 🚬 담배 완전 끊기 모드
        if (sMode === 'quit' && smokeQuitBoard) {
            if (smokeReduceBoard) smokeReduceBoard.style.display = 'none';
            smokeQuitBoard.style.display = 'block';

            let todayMidnight = new Date(now).setHours(0, 0, 0, 0);
            let smokedToday = Data.getLogs('smoke').filter(t => t >= todayMidnight).length;

            let sStart = Data.getStartTime('smoke');
            let streakDays = Math.max(0, (now - sStart) / (1000 * 60 * 60 * 24));
            let cigPrice = Data.getSetting("smokePrice", 4500) / 20;
            let smokePerDay = Data.getSetting("smokePerDay", 10);
            let currentSaved = Math.floor(streakDays * smokePerDay * cigPrice);

            let appStart = Data.getAppStartTime('smoke');
            let appStartMidnight = new Date(appStart).setHours(0, 0, 0, 0);
            let passedDays = Math.max(0, (todayMidnight - appStartMidnight) / (1000 * 60 * 60 * 24));
            let expectedTotal = passedDays * smokePerDay;
            let actualTotal = Data.getLogs('smoke').filter(t => t >= appStart && t < todayMidnight).length;
            let totalSavedMoney = Math.max(0, Math.floor((expectedTotal - actualTotal) * cigPrice));

            let numClass = smokedToday === 0 ? "pq-number" : "pq-number fail";

            // 💡 카드 전체가 회색으로 변하는 fail 클래스 조건 삭제! 원래 핑크색 유지
            smokeQuitBoard.className = 'premium-quit-board smoke';
            smokeQuitBoard.innerHTML = `
                <div class="pq-header">
                    <div class="pq-title">🚬 오늘 피운 담배</div>
                </div>
                <div class="pq-body">
                    <div class="pq-number-wrap">
                        <div><span class="${numClass}">${smokedToday}</span><span class="pq-unit">개</span></div>
                    </div>
                    <div class="pq-icon-wrap">🚬</div>
                </div>
                <div class="pq-money-grid">
                    <div class="pq-money-box">
                        <div class="pq-money-label">현재 절약 금액</div>
                        <div class="pq-money-value"><span class="fit-text">${currentSaved.toLocaleString()}</span><span class="unit">원</span></div>
                    </div>
                    <div class="pq-money-box">
                        <div class="pq-money-label">총 누적 (자정 업데이트)</div>
                        <div class="pq-money-value"><span class="fit-text">${totalSavedMoney.toLocaleString()}</span><span class="unit">원</span></div>
                    </div>
                </div>
            `;

        } else if (sMode === 'reduce' && smokeReduceBoard) {
            if (smokeQuitBoard) smokeQuitBoard.style.display = 'none';
            smokeReduceBoard.style.display = 'block';

            let stat = Data.getReduceStatus('smoke');
            let target = Data.getSetting("smokeTarget", 5);
            let remaining = stat.remaining;
            let isFail = stat.isFail;
            let used = target - remaining;
            if (isFail) used = target + Math.abs(remaining);

            let percentage = target > 0 ? Math.floor((used / target) * 100) : 0;

            let msg = "";
            if (isFail) msg = "앗, 목표 초과. 내일은 꼭 성공해요! 🥲";
            else if (used === target) msg = "오늘 목표 달성! 여기서 멈추면 성공 🛑";
            else if (percentage >= 90) msg = "목표가 코앞! 이번 한 번만 꾹 참기 🚨";
            else if (percentage >= 50) msg = "절반 썼어요! 페이스 조절 타임 🤔";
            else if (percentage >= 1) msg = "페이스 굿! 아주 잘하고 있어요 👏";
            else msg = "하루의 시작! 오늘도 화이팅 ☀️";

            let barsHtml = '';
            if (target <= 10) {
                barsHtml = '<div class="pr-bar-container">';
                for (let i = 0; i < target; i++) {
                    barsHtml += `<div class="pr-bar-segment ${i < used ? 'filled' : ''}"></div>`;
                }
                barsHtml += '</div>';
            } else {
                barsHtml = `<div class="pr-bar-smooth"><div class="pr-bar-smooth-fill" style="width: ${Math.min(percentage, 100)}%;"></div></div>`;
            }

            smokeReduceBoard.className = `premium-reduce-board smoke ${isFail ? 'fail' : ''}`;
            smokeReduceBoard.innerHTML = `
                <div class="pr-header">
                    <div class="pr-title">🚬 오늘 남은 담배</div>
                    <div class="pr-target-badge">목표 ${target}개</div>
                </div>
                <div class="pr-body">
                    <div class="pr-number-wrap">
                        <div><span class="pr-number">${isFail ? 0 : remaining}</span><span class="pr-unit">개</span></div>
                        <div class="pr-used-badge">${used}개 사용</div>
                    </div>
                    <div class="pr-icon-wrap">🚬</div>
                </div>
                <div class="pr-message"><span class="fit-text">${msg}</span></div>
                <div class="pr-progress-wrap">
                    <div class="pr-progress-header">
                        <span>오늘 진행률</span>
                        <span>${Math.min(percentage, 100)}%</span>
                    </div>
                    ${barsHtml}
                </div>
            `;
        }

        // 🍺 술 완전 끊기 모드
        if (dMode === 'quit' && drinkQuitBoard) {
            if (drinkReduceBoard) drinkReduceBoard.style.display = 'none';
            drinkQuitBoard.style.display = 'block';

            let curr = new Date(now);
            let day = curr.getDay(); 
            let diff = curr.getDate() - day + (day === 0 ? -6 : 1); 
            let startOfWeek = new Date(curr.setDate(diff)).setHours(0, 0, 0, 0);
            let drankThisWeek = Data.getLogs('drink').filter(t => t >= startOfWeek).length;

            let dStart = Data.getStartTime('drink');
            let streakWeeks = Math.max(0, (now - dStart) / (1000 * 60 * 60 * 24 * 7));
            let drinkCost = Data.getSetting("drinkCost", 50000);
            let drinkPerWeek = Data.getSetting("drinkPerWeek", 2);
            let currentSaved = Math.floor(streakWeeks * drinkPerWeek * drinkCost);

            let appStart = Data.getAppStartTime('drink');
            let appStartMidnight = new Date(appStart).setHours(0, 0, 0, 0);
            let todayMidnight = new Date(now).setHours(0, 0, 0, 0);
            let passedDays = Math.max(0, (todayMidnight - appStartMidnight) / (1000 * 60 * 60 * 24));
            let dailyDrinkBudget = (drinkPerWeek * drinkCost) / 7;
            let expectedSaved = passedDays * dailyDrinkBudget;
            let actualSpent = Data.getLogs('drink').filter(t => t >= appStart && t < todayMidnight).length * drinkCost;
            let totalSavedMoney = Math.floor(expectedSaved - actualSpent);

            let numClass = drankThisWeek === 0 ? "pq-number" : "pq-number fail";

            // 💡 카드 전체가 회색으로 변하는 fail 클래스 조건 삭제! 원래 오렌지색 유지
            drinkQuitBoard.className = 'premium-quit-board drink';
            drinkQuitBoard.innerHTML = `
                <div class="pq-header">
                    <div class="pq-title">🍺 이번 주 마신 횟수</div>
                </div>
                <div class="pq-body">
                    <div class="pq-number-wrap">
                        <div><span class="${numClass}">${drankThisWeek}</span><span class="pq-unit">번</span></div>
                    </div>
                    <div class="pq-icon-wrap">🍺</div>
                </div>
                <div class="pq-money-grid">
                    <div class="pq-money-box">
                        <div class="pq-money-label">현재 절약 금액</div>
                        <div class="pq-money-value"><span class="fit-text">${currentSaved.toLocaleString()}</span><span class="unit">원</span></div>
                    </div>
                    <div class="pq-money-box">
                        <div class="pq-money-label">총 누적 (자정 업데이트)</div>
                        <div class="pq-money-value"><span class="fit-text">${totalSavedMoney.toLocaleString()}</span><span class="unit">원</span></div>
                    </div>
                </div>
            `;

        } else if (dMode === 'reduce' && drinkReduceBoard) {
            if (drinkQuitBoard) drinkQuitBoard.style.display = 'none';
            drinkReduceBoard.style.display = 'block';

            let stat = Data.getReduceStatus('drink');
            let target = Data.getSetting("drinkTarget", 1);
            let remaining = stat.remaining;
            let isFail = stat.isFail;
            let used = target - remaining;
            if (isFail) used = target + Math.abs(remaining);

            let percentage = target > 0 ? Math.floor((used / target) * 100) : 0;

            let msg = "";
            if (isFail) msg = "앗, 목표 초과. 다음 주엔 꼭 성공해요 🥲";
            else if (used === target) msg = "이번 주 달성! 주말까지 꾹 참기 🛑";
            else if (percentage >= 90) msg = "마지막 기회일지도! 신중하게 🚨";
            else if (percentage >= 50) msg = "벌써 절반! 남은 일정을 관리해요 🗓️";
            else if (percentage >= 1) msg = "기회가 넉넉해요! 페이스 굿 🥂";
            else msg = "새로운 한 주! 건강하게 시작해요 ✨";

            let barsHtml = '';
            if (target <= 10) {
                barsHtml = '<div class="pr-bar-container">';
                for (let i = 0; i < target; i++) {
                    barsHtml += `<div class="pr-bar-segment ${i < used ? 'filled' : ''}"></div>`;
                }
                barsHtml += '</div>';
            } else {
                barsHtml = `<div class="pr-bar-smooth"><div class="pr-bar-smooth-fill" style="width: ${Math.min(percentage, 100)}%;"></div></div>`;
            }

            drinkReduceBoard.className = `premium-reduce-board drink ${isFail ? 'fail' : ''}`;
            drinkReduceBoard.innerHTML = `
                <div class="pr-header">
                    <div class="pr-title">🍺 이번 주 남은 기회</div>
                    <div class="pr-target-badge">목표 ${target}번</div>
                </div>
                <div class="pr-body">
                    <div class="pr-number-wrap">
                        <div><span class="pr-number">${isFail ? 0 : remaining}</span><span class="pr-unit">번</span></div>
                        <div class="pr-used-badge">${used}번 사용</div>
                    </div>
                    <div class="pr-icon-wrap">🍺</div>
                </div>
                <div class="pr-message"><span class="fit-text">${msg}</span></div>
                <div class="pr-progress-wrap">
                    <div class="pr-progress-header">
                        <span>이번 주 진행률</span>
                        <span>${Math.min(percentage, 100)}%</span>
                    </div>
                    ${barsHtml}
                </div>
            `;
        }

        document.querySelectorAll('.smoke-card .hide-on-reduce').forEach(el => {
            el.style.display = sMode === 'reduce' ? 'none' : 'flex';
        });

        document.querySelectorAll('.drink-card .hide-on-reduce').forEach(el => {
            el.style.display = dMode === 'reduce' ? 'none' : 'flex';
        });
    },

    updateRanking() {
        let now = Date.now();

        const renderRank = (prefix, dataArr) => {
            for (let i = 0; i < 5; i++) {
                let r = dataArr[i];
                let dateEl = document.getElementById(`${prefix}Top${i + 1}Date`);
                let valEl = document.getElementById(`${prefix}Top${i + 1}Val`);

                if (!r || r.duration === 0) {
                    if (dateEl) {
                        dateEl.innerText = "-";
                        dateEl.style.color = "var(--text-gray)";
                    }
                    if (valEl) {
                        valEl.innerText = "기록 없음";
                    }
                    continue;
                }

                if (valEl) {
                    valEl.innerText = Data.getExactDurationText(r.duration);
                }

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
        let combinedSmoke = [...smokeRecs, { duration: Math.max(0, now - Data.getStartTime('smoke')), date: 'current' }].sort((a, b) => b.duration - a.duration);
        renderRank('smoke', combinedSmoke);

        let drinkRecs = Data.getRecords('drink');
        let combinedDrink = [...drinkRecs, { duration: Math.max(0, now - Data.getStartTime('drink')), date: 'current' }].sort((a, b) => b.duration - a.duration);
        renderRank('drink', combinedDrink);
    },

    updateHealth() {
        let now = Date.now();
        this._calcHealthUI('smoke', Math.max(0, now - Data.getStartTime('smoke')));
        this._calcHealthUI('drink', Math.max(0, now - Data.getStartTime('drink')));
    },

    _calcHealthUI(type, elapsedMs) {
        const stages = type === 'smoke' ? smokeStages : drinkStages;
        let currentIdx = 0;

        for (let i = 0; i < stages.length; i++) {
            if (elapsedMs >= stages[i].ms) {
                currentIdx = i;
            } else {
                break;
            }
        }

        let currentStage = stages[currentIdx];
        let nextStage = stages[currentIdx + 1];

        let textEl = document.getElementById(type + 'HealthText');
        let percentEl = document.getElementById(type + 'HealthPercent');
        let barEl = document.getElementById(type + 'HealthBar');
        let nextEl = document.getElementById(type + 'HealthNext');
        let iconEl = document.getElementById(type + 'HealthIcon');

        if (!textEl || !percentEl || !barEl || !iconEl) return;

        textEl.innerText = currentStage.msg;
        iconEl.innerText = currentStage.icon;

        if (!nextStage) {
            percentEl.innerText = "100%";
            barEl.style.width = "100%";
            barEl.classList.add('max');
            if (nextEl) nextEl.innerText = "🎉 모든 회복 단계를 달성했습니다!";
            iconEl.style.transform = "scale(1.2)";
        } else {
            barEl.classList.remove('max');
            iconEl.style.transform = "scale(1)";

            let percentage = Math.min(100, Math.max(0, ((elapsedMs - currentStage.ms) / (nextStage.ms - currentStage.ms)) * 100));

            if (isNaN(percentage)) percentage = 0;

            percentEl.innerText = percentage.toFixed(1) + "%";
            barEl.style.width = percentage + "%";

            if (nextEl) nextEl.innerText = `👉 다음 목표: ${nextStage.label} (${nextStage.msg})`;
        }
    },

    updateCore() {
        this.updateTime();
        this.updateMoney();
        this.updateRanking();
        this.updateHealth();
    },

    updateCharts() {
        this.renderCharts();
        this.renderDrinkCalendar();
    },

    updateAll() {
        this.initTabs();
        this.updateCore();
        this.updateCharts();
    },

    openRoadmap(type) {
        const isSmoke = type === 'smoke';
        const stages = isSmoke ? smokeStages : drinkStages;
        const elapsedMs = Math.max(0, Date.now() - Data.getStartTime(type));

        const listContainer = document.getElementById('roadmapList');
        const roadmapTitle = document.getElementById('roadmapTitle');

        if (roadmapTitle) {
            roadmapTitle.innerHTML = isSmoke ? "🌿 금연 회복 도감" : "💧 금주 회복 도감";
        }

        if (!listContainer) return;

        let html = "";
        let themeClass = isSmoke ? 'smoke-theme' : 'drink-theme';

        for (let i = 0; i < stages.length; i++) {
            let st = stages[i];
            let nextSt = stages[i + 1];
            let status = "future";
            let icon = st.icon || "🔒";

            if (elapsedMs >= st.ms) {
                if (!nextSt || elapsedMs < nextSt.ms) {
                    status = "current " + themeClass;
                    icon = st.icon || "🔥";
                } else {
                    status = "past";
                    icon = st.icon || "✅";
                }
            } else {
                icon = "🔒";
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
            if (currentEl) {
                currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    },

    renderCharts() {
        if (typeof Chart === 'undefined') return;

        Chart.defaults.color = '#9CA3AF';
        Chart.defaults.font.family = "'Pretendard', sans-serif";
        Chart.defaults.font.weight = '800';

        const smokeBarColor = '#10B981';
        let now = new Date();
        let smokeLogs = Data.getLogs('smoke');
        const labels = [];
        const smokeData = [];

        for (let i = 29; i >= 0; i--) {
            let d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            let sDay = d.setHours(0, 0, 0, 0);
            let eDay = d.setHours(23, 59, 59, 999);

            labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
            smokeData.push(smokeLogs.filter(t => t >= sDay && t <= eDay).length);
        }

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#8B95A1',
                    font: { weight: 'bold', size: 12 },
                    formatter: function (v) { return v > 0 ? v : ''; }
                }
            },
            layout: { padding: { top: 20 } },
            scales: {
                y: { display: false, beginAtZero: true, suggestedMax: 4 },
                x: { grid: { display: false }, border: { display: false } }
            },
            animation: { duration: 0 }
        };

        let sWrap = document.getElementById('smokeChartWrapper');
        let sCanvas = document.getElementById('smokeChart');

        if (sCanvas && sWrap) {
            if (smokeChartObj && sCanvas.clientHeight === 0 && sWrap.offsetWidth > 0) {
                smokeChartObj.destroy();
                smokeChartObj = null;
            }
            if (!smokeChartObj && sWrap.offsetWidth > 0) {
                let ctx = sCanvas.getContext('2d');
                smokeChartObj = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: smokeData,
                            backgroundColor: smokeBarColor,
                            borderRadius: 6
                        }]
                    },
                    options: commonOptions
                });
            } else if (smokeChartObj) {
                smokeChartObj.data.labels = labels;
                smokeChartObj.data.datasets[0].data = smokeData;
                smokeChartObj.update();
            }
        }

        setTimeout(() => {
            if (sWrap) sWrap.scrollLeft = sWrap.scrollWidth;
        }, 50);
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

            let gridHtml = `
            <div class="calendar-month-wrapper">
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
        let setSmokePrice = document.getElementById('setSmokePrice');
        let setSmokePerDay = document.getElementById('setSmokePerDay');
        let setSmokeTarget = document.getElementById('setSmokeTarget');
        let setDrinkCost = document.getElementById('setDrinkCost');
        let setDrinkPerWeek = document.getElementById('setDrinkPerWeek');
        let setDrinkTarget = document.getElementById('setDrinkTarget');

        if (setSmokePrice) setSmokePrice.value = Data.getSetting('smokePrice', 4500).toLocaleString();
        if (setSmokePerDay) setSmokePerDay.value = Data.getSetting('smokePerDay', 10).toLocaleString();
        if (setSmokeTarget) setSmokeTarget.value = Data.getSetting('smokeTarget', 5).toLocaleString();
        if (setDrinkCost) setDrinkCost.value = Data.getSetting('drinkCost', 50000).toLocaleString();
        if (setDrinkPerWeek) setDrinkPerWeek.value = Data.getSetting('drinkPerWeek', 2).toLocaleString();
        if (setDrinkTarget) setDrinkTarget.value = Data.getSetting('drinkTarget', 1).toLocaleString();

        let smokeModeRadio = document.getElementById(`sm_${Data.getMode('smoke')}`);
        let drinkModeRadio = document.getElementById(`dr_${Data.getMode('drink')}`);

        if (smokeModeRadio) smokeModeRadio.checked = true;
        if (drinkModeRadio) drinkModeRadio.checked = true;

        this.toggleSettingsInputs();
        this.openModal('settingsModal');
    },

    toggleSettingsInputs() {
        let smokeRadio = document.querySelector('input[name="setSmokeMode"]:checked');
        let drinkRadio = document.querySelector('input[name="setDrinkMode"]:checked');

        let sMode = smokeRadio ? smokeRadio.value : 'off';
        let dMode = drinkRadio ? drinkRadio.value : 'off';

        let wrapSmokePrice = document.getElementById('wrapSmokePrice');
        let wrapSmokeOriginal = document.getElementById('wrapSmokeOriginal');
        let wrapSmokeTarget = document.getElementById('wrapSmokeTarget');

        if (wrapSmokePrice) wrapSmokePrice.style.display = (sMode !== 'off') ? 'flex' : 'none';
        if (wrapSmokeOriginal) wrapSmokeOriginal.style.display = (sMode !== 'off') ? 'flex' : 'none';
        if (wrapSmokeTarget) wrapSmokeTarget.style.display = (sMode === 'reduce') ? 'flex' : 'none';

        let wrapDrinkCost = document.getElementById('wrapDrinkCost');
        let wrapDrinkOriginal = document.getElementById('wrapDrinkOriginal');
        let wrapDrinkTarget = document.getElementById('wrapDrinkTarget');

        if (wrapDrinkCost) wrapDrinkCost.style.display = (dMode !== 'off') ? 'flex' : 'none';
        if (wrapDrinkOriginal) wrapDrinkOriginal.style.display = (dMode !== 'off') ? 'flex' : 'none';
        if (wrapDrinkTarget) wrapDrinkTarget.style.display = (dMode === 'reduce') ? 'flex' : 'none';
    },

    showCustomModal(msg, action) {
        let modalMsg = document.getElementById('modalMsg');
        if (modalMsg) modalMsg.innerText = msg;

        window.currentModalAction = action;
        this.openModal('customModal');
    },

    showAlertModal(msg) {
        let alertMsg = document.getElementById('alertMsg');
        if (alertMsg) alertMsg.innerText = msg;

        this.openModal('alertModal');

        let btnAlertConfirm = document.getElementById('btnAlertConfirm');
        if (btnAlertConfirm) {
            btnAlertConfirm.onclick = () => this.closeModal('alertModal');
        }
    }
};