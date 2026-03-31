const MINUTE = 60 * 1000; const HOUR = 60 * MINUTE; const DAY = 24 * HOUR;

const smokeStages = [
    { ms: 0, label: "0분", msg: "몸이 회복을 시작합니다." },
    { ms: 20 * MINUTE, label: "20분", msg: "혈압과 맥박이 안정됩니다." },
    { ms: 30 * MINUTE, label: "30분", msg: "대화 시 느껴지던 입 냄새가 줄어듭니다." },
    { ms: 1 * HOUR, label: "1시간", msg: "금단 증상이 시작될 수 있습니다." },
    { ms: 6 * HOUR, label: "6시간", msg: "심장이 조금 편해집니다." },
    { ms: 12 * HOUR, label: "12시간", msg: "산소 수치가 회복됩니다." },
    { ms: 24 * HOUR, label: "24시간", msg: "몸과 옷에 밴 냄새가 옅어집니다." },
    { ms: 2 * DAY, label: "2일", msg: "주변 사람들이 느끼는 담배 냄새가 줄어듭니다." },
    { ms: 3 * DAY, label: "3일", msg: "니코틴이 대부분 배출됩니다." },
    { ms: 4 * DAY, label: "4일", msg: "폐가 정화를 시작합니다." },
    { ms: 5 * DAY, label: "5일", msg: "금단 증상이 줄어들 수 있습니다." },
    { ms: 7 * DAY, label: "7일", msg: "일주일을 버텼습니다." },
    { ms: 10 * DAY, label: "10일", msg: "호흡이 조금 편해집니다." },
    { ms: 14 * DAY, label: "14일", msg: "폐 기능이 개선됩니다." },
    { ms: 21 * DAY, label: "21일", msg: "의존이 약해지기 시작합니다." },
    { ms: 30 * DAY, label: "30일", msg: "재흡연 위험이 감소합니다." },
    { ms: 60 * DAY, label: "60일", msg: "몸의 변화가 느껴집니다." },
    { ms: 90 * DAY, label: "90일", msg: "체력이 좋아질 수 있습니다." },
    { ms: 180 * DAY, label: "180일", msg: "면역력이 회복됩니다." },
    { ms: 365 * DAY, label: "365일", msg: "심장질환 위험이 크게 감소합니다." },
    { ms: 730 * DAY, label: "730일", msg: "비흡연자 수준에 가까워집니다." }
];

const drinkStages = [
    { ms: 0, label: "0시간", msg: "간이 회복을 시작합니다." },
    { ms: 6 * HOUR, label: "6시간", msg: "몸이 안정되기 시작합니다." },
    { ms: 12 * HOUR, label: "12시간", msg: "탈수 상태가 개선됩니다." },
    { ms: 24 * HOUR, label: "24시간", msg: "알코올이 대부분 분해됩니다." },
    { ms: 2 * DAY, label: "2일", msg: "수면이 좋아질 수 있습니다." },
    { ms: 3 * DAY, label: "3일", msg: "집중력이 회복됩니다." },
    { ms: 5 * DAY, label: "5일", msg: "피부가 맑아질 수 있습니다." },
    { ms: 7 * DAY, label: "7일", msg: "간이 회복되기 시작합니다." },
    { ms: 10 * DAY, label: "10일", msg: "염증 수치가 감소합니다." },
    { ms: 14 * DAY, label: "14일", msg: "소화 기능이 개선됩니다." },
    { ms: 21 * DAY, label: "21일", msg: "습관이 약해지기 시작합니다." },
    { ms: 30 * DAY, label: "30일", msg: "간 기능이 개선됩니다." },
    { ms: 45 * DAY, label: "45일", msg: "에너지가 안정됩니다." },
    { ms: 60 * DAY, label: "60일", msg: "혈압이 안정될 수 있습니다." },
    { ms: 90 * DAY, label: "90일", msg: "간 지방이 감소합니다." },
    { ms: 120 * DAY, label: "120일", msg: "몸 상태가 전반적으로 좋아집니다." },
    { ms: 180 * DAY, label: "180일", msg: "피로가 줄어듭니다." },
    { ms: 270 * DAY, label: "270일", msg: "정신적 안정감이 증가합니다." },
    { ms: 365 * DAY, label: "365일", msg: "심혈관 위험이 감소합니다." },
    { ms: 730 * DAY, label: "730일", msg: "건강한 생활이 자리잡습니다." }
];

const Data = {
    init() {
        let now = Date.now();
        if (!localStorage.getItem("smokeStart")) localStorage.setItem("smokeStart", now);
        if (!localStorage.getItem("drinkStart")) localStorage.setItem("drinkStart", now);
        if (!localStorage.getItem("smokeLogs")) localStorage.setItem("smokeLogs", "[]");
        if (!localStorage.getItem("drinkLogs")) localStorage.setItem("drinkLogs", "[]");

        if (!localStorage.getItem("smokePrice")) localStorage.setItem("smokePrice", "4500");
        if (!localStorage.getItem("drinkCost")) localStorage.setItem("drinkCost", "50000");
        if (!localStorage.getItem("smokePerDay")) localStorage.setItem("smokePerDay", "10");
        if (!localStorage.getItem("smokeTarget")) localStorage.setItem("smokeTarget", "5");
        if (!localStorage.getItem("drinkPerWeek")) localStorage.setItem("drinkPerWeek", "2");
        if (!localStorage.getItem("drinkTarget")) localStorage.setItem("drinkTarget", "1");

        if (!localStorage.getItem("smokeMode")) localStorage.setItem("smokeMode", "quit");
        if (!localStorage.getItem("drinkMode")) localStorage.setItem("drinkMode", "quit");
    },
    getMode(type) { return localStorage.getItem(type + "Mode") || "quit"; },

    // 💡 버그 수정: 0을 입력해도 기본값으로 바뀌지 않도록 null 체크 방식으로 변경
    getSetting(key, defaultVal) {
        let val = localStorage.getItem(key);
        return val !== null ? parseInt(val) : defaultVal;
    },

    getLogs(type) { return JSON.parse(localStorage.getItem(type + "Logs")) || []; },
    getRecords(type) { return JSON.parse(localStorage.getItem(type + "Records")) || [0, 0, 0]; },
    getStartTime(type) { return parseInt(localStorage.getItem(type + "Start")) || Date.now(); },
    getTotalMoney(type) { return parseInt(localStorage.getItem(type === 'smoke' ? "totalSmokeMoney" : "totalDrinkMoney")) || 0; },
    saveSettings(obj) { Object.keys(obj).forEach(k => localStorage.setItem(k, obj[k])); },
    resetData(type) {
        localStorage.setItem(type + "Start", Date.now());
        localStorage.setItem(type + "Logs", "[]");
        localStorage.setItem(type + "Records", "[0,0,0]");
        localStorage.setItem(type === 'smoke' ? "totalSmokeMoney" : "totalDrinkMoney", "0");
    },

    addLog(type) {
        let now = Date.now();

        if (type === 'drink') {
            let todayStr = new Date().toDateString();
            if (localStorage.getItem('lastDrinkDate') === todayStr) {
                return false;
            }
            localStorage.setItem('lastDrinkDate', todayStr);
        }

        let startTime = this.getStartTime(type);
        let elapsedMs = now - startTime;
        let isSmokeCooldown = (type === 'smoke' && elapsedMs < (1 * HOUR));

        let logs = this.getLogs(type); logs.push(now);
        localStorage.setItem(type + "Logs", JSON.stringify(logs));

        let recordsArr = this.getRecords(type); recordsArr.push(elapsedMs);
        recordsArr.sort((a, b) => b - a);
        localStorage.setItem(type + "Records", JSON.stringify(recordsArr.slice(0, 3)));

        if (this.getMode(type) === 'quit') {
            let elapsedDays = Math.max(0, elapsedMs / DAY);
            if (type === 'smoke') {
                let earned = Math.floor(elapsedDays * this.getSetting("smokePerDay", 10) * (this.getSetting("smokePrice", 4500) / 20));
                let penalty = isSmokeCooldown ? 0 : Math.floor(this.getSetting("smokePrice", 4500) / 20);
                localStorage.setItem("totalSmokeMoney", this.getTotalMoney('smoke') + earned - penalty);
            } else {
                let earned = Math.floor(elapsedDays * (this.getSetting("drinkPerWeek", 2) / 7) * this.getSetting("drinkCost", 50000));
                let penalty = this.getSetting("drinkCost", 50000);
                localStorage.setItem("totalDrinkMoney", this.getTotalMoney('drink') + earned - penalty);
            }
        }
        localStorage.setItem(type + "Start", now);
        return true;
    },

    getReduceStatus(type) {
        let logs = this.getLogs(type); let now = new Date();
        if (type === 'smoke') {
            let startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            let countToday = logs.filter(t => t >= startOfDay).length;
            let target = this.getSetting("smokeTarget", 5);
            return { count: countToday, remaining: target - countToday, isFail: (target - countToday) < 0 };
        } else {
            let dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
            let startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - dayOfWeek); startOfWeek.setHours(0, 0, 0, 0);
            let countWeek = logs.filter(t => t >= startOfWeek.getTime()).length;
            let target = this.getSetting("drinkTarget", 1);
            return { count: countWeek, remaining: target - countWeek, isFail: (target - countWeek) < 0 };
        }
    },
    getTimeParsed(ms) { let sec = Math.floor(ms / 1000), min = Math.floor(sec / 60), hour = Math.floor(min / 60), day = Math.floor(hour / 24); return { day, hour: hour % 24, min: min % 60, sec: sec % 60 }; },
    getExactDurationText(ms) { if (ms === 0) return "기록 없음"; let s = this.getTimeParsed(ms); if (s.day > 0) return `${s.day}일 ${s.hour}시간`; if (s.hour > 0) return `${s.hour}시간 ${s.min}분`; return `${s.min}분`; }
};