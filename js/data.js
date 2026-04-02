const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const smokeStages = [
    { ms: 0, label: "0분", msg: "몸이 회복을 시작합니다.", icon: "🌱" },
    { ms: 30 * MINUTE, label: "30분", msg: "대화 시 느껴지던 독한 담배 냄새와 불쾌감이 드디어 사라집니다.", icon: "🌬️" },
    { ms: 1 * HOUR, label: "1시간", msg: "금단 증상이 시작될 수 있습니다. 참을 수 있습니다!", icon: "💪" },
    { ms: 2 * HOUR, label: "2시간", msg: "간접흡연 노출원이 완전히 차단되었습니다.", icon: "🛡️" },
    { ms: 3 * HOUR, label: "3시간", msg: "실내 공기가 점점 맑아지고 있습니다.", icon: "✨" },
    { ms: 6 * HOUR, label: "6시간", msg: "심장이 조금 편해집니다.", icon: "❤️" },
    { ms: 9 * HOUR, label: "9시간", msg: "주변 사람의 호흡기 자극이 줄어들기 시작합니다.", icon: "😮" },
    { ms: 12 * HOUR, label: "12시간", msg: "산소 수치가 회복됩니다.", icon: "🧠" },
    { ms: 18 * HOUR, label: "18시간", msg: "주변 사람들이 담배 연기 없는 환경에 적응하고 있습니다.", icon: "😊" },
    { ms: 24 * HOUR, label: "24시간", msg: "몸과 옷에 밴 냄새가 옅어집니다.", icon: "👕" },
    { ms: 36 * HOUR, label: "36시간", msg: "옷과 머리카락에서 나는 냄새가 약해집니다.", icon: "✨" },
    { ms: 2 * DAY, label: "2일", msg: "주변 사람들이 느끼는 담배 냄새가 줄어듭니다.", icon: "👃" },
    { ms: 60 * HOUR, label: "2.5일", msg: "주변 사람이 맡던 불쾌한 냄새가 거의 사라집니다.", icon: "🌬️" },
    { ms: 3 * DAY, label: "3일", msg: "미각과 후각이 살아나 음식이 맛있어집니다.", icon: "😋" },
    { ms: 4 * DAY, label: "4일", msg: "폐가 정화를 시작합니다.", icon: "✨" },
    { ms: 5 * DAY, label: "5일", msg: "주변 사람들의 간접흡연 위험이 크게 감소합니다.", icon: "🛡️" },
    { ms: 7 * DAY, label: "7일", msg: "일주일을 버텼습니다. 대단합니다!", icon: "🥇" },
    { ms: 10 * DAY, label: "10일", msg: "옷과 생활공간에서 3차 흡연 영향이 줄어듭니다.", icon: "🏠" },
    { ms: 14 * DAY, label: "14일", msg: "폐 기능이 개선되고 혈액순환이 좋아집니다.", icon: "💪" },
    { ms: 18 * DAY, label: "18일", msg: "주변 사람들이 더 깨끗한 공기 속에서 생활하고 있습니다.", icon: "🌬️" },
    { ms: 21 * DAY, label: "21일", msg: "니코틴 의존도가 뚝 떨어지기 시작합니다.", icon: "🎈" },
    { ms: 25 * DAY, label: "25일", msg: "생활 공간 내 간접흡연 노출 위험이 지속적으로 감소합니다.", icon: "🛡️" },
    { ms: 30 * DAY, label: "30일", msg: "한 달 달성! 피부에 생기가 돌기 시작합니다.", icon: "✨" },
    { ms: 40 * DAY, label: "40일", msg: "주변 사람의 호흡기 건강 환경이 개선되었습니다.", icon: "😮" },
    { ms: 50 * DAY, label: "50일", msg: "기침과 가래가 눈에 띄게 줄어듭니다.", icon: "💪" },
    { ms: 60 * DAY, label: "60일", msg: "스트레스 상황에서도 담배 생각이 덜 납니다.", icon: "😌" },
    { ms: 75 * DAY, label: "75일", msg: "주변 사람들의 장기적인 간접흡연 위험이 크게 줄어듭니다.", icon: "🛡️" },
    { ms: 90 * DAY, label: "90일", msg: "폐의 감염 저항력이 크게 높아졌습니다.", icon: "💪" },
    { ms: 100 * DAY, label: "100일", msg: "💯 100일의 기적! 뇌의 도파민이 정상화됩니다.", icon: "💯" },
    { ms: 120 * DAY, label: "120일", msg: "생활 공간의 공기 질이 완전히 비흡연 환경에 가까워졌습니다.", icon: "✨" },
    { ms: 150 * DAY, label: "150일", msg: "계단을 오를 때 숨이 훨씬 덜 차는 것을 체감합니다.", icon: "🏃" },
    { ms: 180 * DAY, label: "180일", msg: "면역력이 완전히 회복되었습니다.", icon: "💪" },
    { ms: 200 * DAY, label: "200일", msg: "누군가와 가까이서 접촉하거나 포옹할 때 냄새 때문에 눈치 보지 않아도 됩니다.", icon: "🤗" },
    { ms: 250 * DAY, label: "250일", msg: "주변 사람의 건강 위험 요인이 크게 감소했습니다.", icon: "🛡️" },
    { ms: 300 * DAY, label: "300일", msg: "담배 연기 냄새가 오히려 역하게 느껴집니다.", icon: "👃" },
    { ms: 365 * DAY, label: "365일", msg: "🎉 1주년! 심장질환 위험이 절반으로 감소합니다.", icon: "🏆" }
];

const drinkStages = [
    { ms: 0, label: "0시간", msg: "간이 독소를 분해하며 회복을 시작합니다.", icon: "🌱" },
    { ms: 6 * HOUR, label: "6시간", msg: "알코올로 자극받았던 몸이 안정되기 시작합니다.", icon: "😌" },
    { ms: 12 * HOUR, label: "12시간", msg: "심한 갈증과 탈수 상태가 눈에 띄게 개선됩니다.", icon: "💧" },
    { ms: 18 * HOUR, label: "18시간", msg: "몸과 숨결에 배어있던 독한 술 냄새가 사라져 사람들과의 대화가 당당해집니다.", icon: "✨" },
    { ms: 24 * HOUR, label: "24시간", msg: "체내 알코올이 대부분 분해되어 컨디션이 돌아옵니다.", icon: "🤩" },
    { ms: 2 * DAY, label: "2일", msg: "수면의 질이 높아져 아침에 일어나는 것이 가뿐해집니다.", icon: "😴" },
    { ms: 3 * DAY, label: "3일", msg: "머릿속 안개가 걷히고 사고력과 집중력이 회복됩니다.", icon: "🧠" },
    { ms: 4 * DAY, label: "4일", msg: "숙취로 인한 예민함이 사라져 사람들을 대하는 태도가 훨씬 부드러워집니다.", icon: "😊" },
    { ms: 5 * DAY, label: "5일", msg: "거칠었던 피부 트러블이 줄고 안색이 맑아집니다.", icon: "✨" },
    { ms: 7 * DAY, label: "7일", msg: "일주일을 버텼습니다! 간 기능이 본격적으로 좋아집니다.", icon: "🥇" },
    { ms: 10 * DAY, label: "10일", msg: "술로 인한 다음 날의 후회나 실수에 대한 걱정이 사라져 인간관계에 자신감이 생깁니다.", icon: "😎" },
    { ms: 14 * DAY, label: "14일", msg: "소화 기능이 정상화되고 만성적인 속 쓰림이 해결됩니다.", icon: "💪" },
    { ms: 18 * DAY, label: "18일", msg: "술자리에 쓰던 시간과 비용을 나 자신을 돌보거나 소중한 인연을 챙기는 데 쓰게 됩니다.", icon: "❤️" },
    { ms: 21 * DAY, label: "21일", msg: "술 없이도 일상을 즐기는 새로운 습관이 몸에 익기 시작합니다.", icon: "🎈" },
    { ms: 25 * DAY, label: "25일", msg: "숙취로 날려버리던 주말 아침 대신, 쾌적하고 맑은 모습으로 여유로운 주말을 맞이합니다.", icon: "✨" },
    { ms: 30 * DAY, label: "30일", msg: "한 달 달성! 간 수치가 눈에 띄게 정상으로 돌아옵니다.", icon: "🛡️" },
    { ms: 45 * DAY, label: "45일", msg: "일상생활에서 느끼는 에너지가 기복 없이 꾸준하게 유지됩니다.", icon: "⚡" },
    { ms: 60 * DAY, label: "60일", msg: "알코올로 높아졌던 혈압이 정상 범위로 안정됩니다.", icon: "🩺" },
    { ms: 75 * DAY, label: "75일", msg: "절제력 있고 흔들림 없는 모습에 주변 사람들의 신뢰가 두터워집니다.", icon: "🤝" },
    { ms: 90 * DAY, label: "90일", msg: "간에 쌓여있던 지방이 대폭 감소하고 몸이 가벼워집니다.", icon: "💧" },
    { ms: 100 * DAY, label: "100일", msg: "💯 100일의 기적! 알코올 의존에서 완전히 해방됩니다.", icon: "💯" },
    { ms: 120 * DAY, label: "120일", msg: "불필요한 체중(술배)이 빠지며 옷 태가 살아나기 시작합니다.", icon: "✨" },
    { ms: 150 * DAY, label: "150일", msg: "감정 기복이 줄어들고 단단한 심리적 안정감이 찾아옵니다.", icon: "😌" },
    { ms: 180 * DAY, label: "180일", msg: "만성 피로가 사라지고 아침마다 넘치는 활력을 체감합니다.", icon: "🤩" },
    { ms: 200 * DAY, label: "200일", msg: "술자리 없이도 사람들과 맑은 정신으로 깊고 의미 있는 대화를 나누게 됩니다.", icon: "🧠" },
    { ms: 300 * DAY, label: "300일", msg: "손상되었던 뇌세포와 기억력이 회복되어 머릿속이 맑아집니다.", icon: "✨" },
    { ms: 365 * DAY, label: "365일", msg: "🥂 1주년! 심혈관 질환 위험이 비음주자 수준으로 크게 감소합니다.", icon: "🏆" },
    { ms: 500 * DAY, label: "500일", msg: "술이 낯설게 느껴지는 완벽한 건강 체질로 거듭났습니다.", icon: "🥇" }
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