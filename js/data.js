const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const smokeStages = [
    { ms: 0, label: "0분", msg: "몸이 회복을 시작합니다.", icon: "🌱" },
    { ms: 20 * MINUTE, label: "20분", msg: "혈압과 맥박이 안정됩니다.", icon: "💓" },
    { ms: 30 * MINUTE, label: "30분", msg: "대화 시 느껴지던 입 냄새가 줄어듭니다.", icon: "🌬️" },
    { ms: 1 * HOUR, label: "1시간", msg: "금단 증상이 시작될 수 있습니다.", icon: "😬" },
    { ms: 6 * HOUR, label: "6시간", msg: "심장이 조금 편해집니다.", icon: "❤️" },
    { ms: 12 * HOUR, label: "12시간", msg: "산소 수치가 회복됩니다.", icon: "🧠" },
    { ms: 24 * HOUR, label: "24시간", msg: "몸과 옷에 밴 냄새가 옅어집니다.", icon: "👕" },
    { ms: 2 * DAY, label: "2일", msg: "주변 사람들이 느끼는 담배 냄새가 줄어듭니다.", icon: "👃" },
    { ms: 3 * DAY, label: "3일", msg: "니코틴이 대부분 배출됩니다.", icon: "💧" },
    { ms: 4 * DAY, label: "4일", msg: "폐가 정화를 시작합니다.", icon: "✨" },
    { ms: 5 * DAY, label: "5일", msg: "금단 증상이 줄어들 수 있습니다.", icon: "😌" },
    { ms: 7 * DAY, label: "7일", msg: "일주일을 버텼습니다.", icon: "🥇" },
    { ms: 10 * DAY, label: "10일", msg: "호흡이 조금 편해집니다.", icon: "😮" },
    { ms: 14 * DAY, label: "14일", msg: "폐 기능이 개선됩니다.", icon: "💪" },
    { ms: 21 * DAY, label: "21일", msg: "의존이 약해지기 시작합니다.", icon: "🎈" },
    { ms: 30 * DAY, label: "30일", msg: "재흡연 위험이 감소합니다.", icon: "🛡️" },
    { ms: 60 * DAY, label: "60일", msg: "몸의 변화가 느껴집니다.", icon: "🤩" },
    { ms: 90 * DAY, label: "90일", msg: "체력이 좋아질 수 있습니다.", icon: "🏃" },
    { ms: 180 * DAY, label: "180일", msg: "면역력이 회복됩니다.", icon: "🛡️" },
    { ms: 365 * DAY, label: "365일", msg: "심장질환 위험이 크게 감소합니다.", icon: "💖" },
    { ms: 730 * DAY, label: "730일", msg: "비흡연자 수준에 가까워집니다.", icon: "🏆" }
];

const drinkStages = [
    { ms: 0, label: "0시간", msg: "간이 회복을 시작합니다.", icon: "🌱" },
    { ms: 6 * HOUR, label: "6시간", msg: "몸이 안정되기 시작합니다.", icon: "😌" },
    { ms: 12 * HOUR, label: "12시간", msg: "탈수 상태가 개선됩니다.", icon: "💧" },
    { ms: 24 * HOUR, label: "24시간", msg: "알코올이 대부분 분해됩니다.", icon: "✨" },
    { ms: 2 * DAY, label: "2일", msg: "수면이 좋아질 수 있습니다.", icon: "😴" },
    { ms: 3 * DAY, label: "3일", msg: "집중력이 회복됩니다.", icon: "🧠" },
    { ms: 5 * DAY, label: "5일", msg: "피부가 맑아질 수 있습니다.", icon: "✨" },
    { ms: 7 * DAY, label: "7일", msg: "간이 회복되기 시작합니다.", icon: "🥇" },
    { ms: 10 * DAY, label: "10일", msg: "염증 수치가 감소합니다.", icon: "🩺" },
    { ms: 14 * DAY, label: "14일", msg: "소화 기능이 개선됩니다.", icon: "💪" },
    { ms: 21 * DAY, label: "21일", msg: "습관이 약해지기 시작합니다.", icon: "🎈" },
    { ms: 30 * DAY, label: "30일", msg: "간 기능이 개선됩니다.", icon: "🛡️" },
    { ms: 45 * DAY, label: "45일", msg: "에너지가 안정됩니다.", icon: "⚡" },
    { ms: 60 * DAY, label: "60일", msg: "혈압이 안정될 수 있습니다.", icon: "🩺" },
    { ms: 90 * DAY, label: "90일", msg: "간 지방이 감소합니다.", icon: "💧" },
    { ms: 120 * DAY, label: "120일", msg: "몸 상태가 전반적으로 좋아집니다.", icon: "🤩" },
    { ms: 180 * DAY, label: "180일", msg: "피로가 줄어듭니다.", icon: "😌" },
    { ms: 270 * DAY, label: "270일", msg: "정신적 안정감이 증가합니다.", icon: "🧠" },
    { ms: 365 * DAY, label: "365일", msg: "심혈관 위험이 감소합니다.", icon: "💖" },
    { ms: 730 * DAY, label: "730일", msg: "건강한 생활이 자리잡습니다.", icon: "🏆" }
];

const Data = {
    init() {
        let now = Date.now();
        ['smoke', 'drink', 'smokeReduce', 'drinkReduce'].forEach(key => {
            if (!localStorage.getItem(key + "Start")) localStorage.setItem(key + "Start", now);
            if (!localStorage.getItem(key + "AppStart")) localStorage.setItem(key + "AppStart", now);
            if (!localStorage.getItem(key + "Logs")) localStorage.setItem(key + "Logs", "[]");
            if (!localStorage.getItem(key + "Records")) localStorage.setItem(key + "Records", "[]");
        });

        if (!localStorage.getItem("smokePrice")) localStorage.setItem("smokePrice", "4500");
        if (!localStorage.getItem("drinkCost")) localStorage.setItem("drinkCost", "50000");
        if (!localStorage.getItem("smokePerDay")) localStorage.setItem("smokePerDay", "10");
        if (!localStorage.getItem("smokeTarget")) localStorage.setItem("smokeTarget", "5");
        if (!localStorage.getItem("drinkPerWeek")) localStorage.setItem("drinkPerWeek", "2");
        if (!localStorage.getItem("drinkTarget")) localStorage.setItem("drinkTarget", "1");

        if (!localStorage.getItem("smokeMode")) localStorage.setItem("smokeMode", "off");
        if (!localStorage.getItem("drinkMode")) localStorage.setItem("drinkMode", "off");
    },

    getMode(type) {
        return localStorage.getItem(type + "Mode") || "off";
    },

    getPrefix(type) {
        return this.getMode(type) === 'reduce' ? type + 'Reduce' : type;
    },

    getSetting(key, defaultVal) {
        let val = localStorage.getItem(key);
        return val !== null ? parseInt(val) : defaultVal;
    },

    getLogs(type) {
        return JSON.parse(localStorage.getItem(this.getPrefix(type) + "Logs")) || [];
    },

    getRecords(type) {
        let raw = JSON.parse(localStorage.getItem(this.getPrefix(type) + "Records")) || [];
        raw = raw.filter(r => r !== 0 && r !== null);
        return raw.map(r => typeof r === 'number' ? { duration: r, date: null } : r);
    },

    getStartTime(type) {
        return parseInt(localStorage.getItem(this.getPrefix(type) + "Start")) || Date.now();
    },

    getAppStartTime(type) {
        return parseInt(localStorage.getItem(this.getPrefix(type) + "AppStart")) || Date.now();
    },

    saveSettings(obj) {
        Object.keys(obj).forEach(k => localStorage.setItem(k, obj[k]));
    },

    resetData(type) {
        let now = Date.now();
        let prefixes = [type, type + 'Reduce'];

        prefixes.forEach(prefix => {
            localStorage.setItem(prefix + "Start", now);
            localStorage.setItem(prefix + "AppStart", now);
            localStorage.setItem(prefix + "Logs", "[]");
            localStorage.setItem(prefix + "Records", "[]");
            localStorage.removeItem(prefix + "LastDate");
        });

        if (type === 'drink') {
            localStorage.removeItem('lastDrinkDate');
        }
    },

    addLog(type) {
        let now = Date.now();
        let prefix = this.getPrefix(type);

        if (type === 'drink') {
            localStorage.setItem(prefix + 'LastDate', new Date().toDateString());
        }

        let startTime = this.getStartTime(type);
        let elapsedMs = now - startTime;

        let logs = this.getLogs(type);
        logs.push(now);
        localStorage.setItem(prefix + "Logs", JSON.stringify(logs));

        let recordsArr = this.getRecords(type);
        recordsArr.push({ duration: elapsedMs, date: now });
        recordsArr.sort((a, b) => b.duration - a.duration);
        // 💡 5위까지 저장하도록 변경
        localStorage.setItem(prefix + "Records", JSON.stringify(recordsArr.slice(0, 5)));

        localStorage.setItem(prefix + "Start", now);
        return true;
    },

    getReduceStatus(type) {
        let logs = this.getLogs(type);
        let now = new Date();

        if (type === 'smoke') {
            let startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            let countToday = logs.filter(t => t >= startOfDay).length;
            let target = this.getSetting("smokeTarget", 5);
            return {
                count: countToday,
                remaining: target - countToday,
                isFail: (target - countToday) < 0
            };
        } else {
            let dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
            let startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - dayOfWeek);
            startOfWeek.setHours(0, 0, 0, 0);

            let countWeek = logs.filter(t => t >= startOfWeek.getTime()).length;
            let target = this.getSetting("drinkTarget", 1);
            return {
                count: countWeek,
                remaining: target - countWeek,
                isFail: (target - countWeek) < 0
            };
        }
    },

    getTimeParsed(ms) {
        let sec = Math.floor(ms / 1000);
        let min = Math.floor(sec / 60);
        let hour = Math.floor(min / 60);
        let day = Math.floor(hour / 24);
        return {
            day: day,
            hour: hour % 24,
            min: min % 60,
            sec: sec % 60
        };
    },

    getExactDurationText(ms) {
        if (ms === 0) return "기록 없음";
        let s = this.getTimeParsed(ms);
        if (s.day > 0) return `${s.day}일 ${s.hour}시간`;
        if (s.hour > 0) return `${s.hour}시간 ${s.min}분`;
        return `${s.min}분`;
    }
};