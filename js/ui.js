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
    },

    formatTimeDisplay(ms) {
        let s = Data.getTimeParsed(ms);
        let timeStr = `${String(s.hour).padStart(2, '0')}:${String(s.min).padStart(2, '0')}:${String(s.sec).padStart(2, '0')}`;
        return s.day > 0 ? `${s.day}일 ${timeStr}` : timeStr;
    },

    updateTime() {
        let now = Date.now();
        let sT = Math.max(0, now - Data.getStartTime('smoke'));
        let dT = Math.max(0, now - Data.getStartTime('drink'));

        let smokeTitle = document.getElementById('smokeTitle');
        let drinkTitle = document.getElementById('drinkTitle');

        if (smokeTitle) smokeTitle.innerText = `금연기간 : ${this.formatTimeDisplay(sT)}`;
        if (drinkTitle) drinkTitle.innerText = `금주기간 : ${this.formatTimeDisplay(dT)}`;
    },

    updateMoney() {
        let now = Date.now();
        let sMode = Data.getMode('smoke');
        let dMode = Data.getMode('drink');

        let smokeMainBoard = document.getElementById('smokeMainBoard');
        let drinkMainBoard = document.getElementById('drinkMainBoard');

        if (sMode === 'quit' && smokeMainBoard) {
            smokeMainBoard.className = 'saved-money-box mode-quit smoke';

            let smokeBoardLabel = document.getElementById('smokeBoardLabel');
            if (smokeBoardLabel) smokeBoardLabel.innerText = '절약금액';

            let sStart = Data.getStartTime('smoke');
            let streakDays = Math.max(0, (now - sStart) / (1000 * 60 * 60 * 24));
            let cigPrice = Data.getSetting("smokePrice", 4500) / 20;
            let smokePerDay = Data.getSetting("smokePerDay", 10);

            let targetMoney = Math.floor(streakDays * smokePerDay * cigPrice);

            let smokeBoardText = document.getElementById('smokeBoardText');
            if (smokeBoardText) smokeBoardText.innerText = targetMoney.toLocaleString();

            let smokeTotalMoney = document.getElementById('smokeTotalMoney');
            if (smokeTotalMoney) {
                let appStart = Data.getAppStartTime('smoke');
                let todayMidnight = new Date(now).setHours(0, 0, 0, 0);
                let appStartMidnight = new Date(appStart).setHours(0, 0, 0, 0);

                let passedDays = Math.max(0, (todayMidnight - appStartMidnight) / (1000 * 60 * 60 * 24));
                let expectedTotal = passedDays * smokePerDay;
                let actualTotal = Data.getLogs('smoke').filter(t => t >= appStart && t < todayMidnight).length;

                let totalSavedMoney = Math.max(0, Math.floor((expectedTotal - actualTotal) * cigPrice));
                smokeTotalMoney.innerText = totalSavedMoney.toLocaleString();
            }

            let smokeUnit = document.getElementById('smokeUnit');
            if (smokeUnit) {
                smokeUnit.innerText = '원';
                smokeUnit.style.display = 'inline';
            }

        } else if (sMode === 'reduce' && smokeMainBoard) {
            let stat = Data.getReduceStatus('smoke');
            let target = Data.getSetting("smokeTarget", 5);

            smokeMainBoard.className = stat.isFail ? 'saved-money-box mode-fail' : 'saved-money-box mode-reduce smoke';

            let smokeBoardLabel = document.getElementById('smokeBoardLabel');
            if (smokeBoardLabel) {
                smokeBoardLabel.innerText = stat.isFail ? `🚨 일일 목표 초과! (목표: ${target}개)` : `🚬 오늘 남은 담배 (목표: ${target}개)`;
            }

            let smokeBoardText = document.getElementById('smokeBoardText');
            if (smokeBoardText) {
                smokeBoardText.innerText = stat.isFail ? Math.abs(stat.remaining) : stat.remaining;
            }

            let smokeUnit = document.getElementById('smokeUnit');
            if (smokeUnit) {
                smokeUnit.innerText = stat.isFail ? '개 초과' : '개비';
                smokeUnit.style.display = 'inline';
            }
        }

        if (dMode === 'quit' && drinkMainBoard) {
            drinkMainBoard.className = 'saved-money-box mode-quit drink';

            let drinkBoardLabel = document.getElementById('drinkBoardLabel');
            if (drinkBoardLabel) drinkBoardLabel.innerText = '절약금액';

            let dStart = Data.getStartTime('drink');
            let streakWeeks = Math.max(0, (now - dStart) / (1000 * 60 * 60 * 24 * 7));
            let drinkCost = Data.getSetting("drinkCost", 50000);
            let drinkPerWeek = Data.getSetting("drinkPerWeek", 2);

            let targetMoney = Math.floor(streakWeeks * drinkPerWeek * drinkCost);

            let drinkBoardText = document.getElementById('drinkBoardText');
            if (drinkBoardText) drinkBoardText.innerText = targetMoney.toLocaleString();

            let drinkTotalMoney = document.getElementById('drinkTotalMoney');
            if (drinkTotalMoney) {
                let appStart = Data.getAppStartTime('drink');
                let todayMidnight = new Date(now).setHours(0, 0, 0, 0);
                let appStartMidnight = new Date(appStart).setHours(0, 0, 0, 0);

                let passedDays = Math.max(0, (todayMidnight - appStartMidnight) / (1000 * 60 * 60 * 24));
                let dailyDrinkBudget = (drinkPerWeek * drinkCost) / 7;

                let expectedSaved = passedDays * dailyDrinkBudget;
                let actualSpent = Data.getLogs('drink').filter(t => t >= appStart && t < todayMidnight).length * drinkCost;

                let totalSavedMoney = Math.floor(expectedSaved - actualSpent);

                drinkTotalMoney.innerText = totalSavedMoney.toLocaleString();
                drinkTotalMoney.style.color = totalSavedMoney < 0 ? 'var(--status-fail)' : 'inherit';
            }

            let drinkUnit = document.getElementById('drinkUnit');
            if (drinkUnit) {
                drinkUnit.innerText = '원';
                drinkUnit.style.display = 'inline';
            }

        } else if (dMode === 'reduce' && drinkMainBoard) {
            let stat = Data.getReduceStatus('drink');
            let target = Data.getSetting("drinkTarget", 1);

            drinkMainBoard.className = stat.isFail ? 'saved-money-box mode-fail' : 'saved-money-box mode-reduce drink';

            let drinkBoardLabel = document.getElementById('drinkBoardLabel');
            if (drinkBoardLabel) {
                drinkBoardLabel.innerText = stat.isFail ? `🚨 주간 목표 초과! (목표: ${target}회)` : `🍺 이번 주 남은 기회 (목표: ${target}회)`;
            }

            let drinkBoardText = document.getElementById('drinkBoardText');
            if (drinkBoardText) {
                drinkBoardText.innerText = stat.isFail ? Math.abs(stat.remaining) : stat.remaining;
            }

            let drinkUnit = document.getElementById('drinkUnit');
            if (drinkUnit) {
                drinkUnit.innerText = stat.isFail ? '회 초과' : '번';
                drinkUnit.style.display = 'inline';
            }
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
            // 💡 화면 렌더링도 5위까지 반영되도록 변경
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

    // 💡 불필요한 updateStats 제거 
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

        Chart.defaults.color = '#8B95A1';
        Chart.defaults.font.family = "'Pretendard', sans-serif";
        Chart.defaults.font.weight = '800';

        const smokeBarColor = '#FF5B73';
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