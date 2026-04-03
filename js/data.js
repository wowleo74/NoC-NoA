const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const smokeStages = [
    { ms: 0, label: "0분", msg: "몸이 회복을 시작합니다.", icon: "🌱" },
    { ms: 20 * MINUTE, label: "20분", msg: "혈압과 맥박이 정상 수준으로 돌아오기 시작합니다.", icon: "💓" },
    { ms: 30 * MINUTE, label: "30분", msg: "대화할 때 상대방이 느끼던 입 냄새가 옅어집니다.", icon: "🌬️" },
    { ms: 1 * HOUR, label: "1시간", msg: "금단 증상의 시작. 하지만 충분히 참을 수 있습니다!", icon: "💪" },
    { ms: 2 * HOUR, label: "2시간", msg: "내 몸과 옷에서 나던 담배 냄새가 줄어들기 시작합니다.", icon: "👕" },
    { ms: 3 * HOUR, label: "3시간", msg: "금연의 의지가 보입니다! (혹시.. 주무시는 중인가요?)", icon: "💤" },
    { ms: 6 * HOUR, label: "6시간", msg: "심장이 한결 편안해집니다.", icon: "❤️" },
    { ms: 8 * HOUR, label: "8시간", msg: "혈중 일산화탄소 수치가 정상으로 돌아왔습니다.", icon: "🩸" },
    { ms: 9 * HOUR, label: "9시간", msg: "금연 성공 가능성이 쑥쑥 올라가고 있습니다.", icon: "📈" },
    { ms: 12 * HOUR, label: "12시간", msg: "혈액 속 산소량이 정상 수치로 회복됩니다.", icon: "🧠" },
    { ms: 18 * HOUR, label: "18시간", msg: "흡연으로 인한 몸의 찌뿌둥한 피로도가 눈에 띄게 줄어듭니다.", icon: "😌" },
    { ms: 1 * DAY, label: "1일", msg: "몸과 옷에 밴 찌든 냄새가 많이 사라졌습니다.", icon: "✨" },
    { ms: 36 * HOUR, label: "36시간", msg: "금연으로 인한 몸의 긍정적인 변화가 체감되기 시작합니다.", icon: "🤩" },
    { ms: 2 * DAY, label: "2일", msg: "타인이 내게서 맡던 담배 냄새가 거의 사라집니다.", icon: "👃" },
    { ms: 3 * DAY, label: "3일", msg: "미각과 후각이 살아나 음식이 훨씬 맛있어집니다.", icon: "😋" },
    { ms: 4 * DAY, label: "4일", msg: "기관지가 이완되며 호흡이 한결 부드러워집니다.", icon: "😮‍💨" },
    { ms: 5 * DAY, label: "5일", msg: "가족과 지인들의 간접흡연 위험이 크게 줄었습니다.", icon: "🛡️" },
    { ms: 7 * DAY, label: "7일", msg: "🎉 마의 1주일을 버텼습니다! 정말 대단합니다.", icon: "🥇" },
    { ms: 10 * DAY, label: "10일", msg: "지금까지 참은 게 너무 아깝습니다. 조금만 더 버티세요!", icon: "🔥" },
    { ms: 14 * DAY, label: "14일", msg: "폐 기능이 개선되고 혈액순환이 좋아집니다.", icon: "🩸" },
    { ms: 16 * DAY, label: "16일", msg: "아침에 일어날 때 몸이 가볍고 수면의 질이 높아집니다.", icon: "☀️" },
    { ms: 18 * DAY, label: "18일", msg: "신체의 니코틴 의존도가 확연하게 떨어집니다.", icon: "📉" },
    { ms: 21 * DAY, label: "21일", msg: "이제 어디 가서 \"나 금연 중이야\"라고 당당히 우겨도 됩니다.", icon: "😎" },
    { ms: 25 * DAY, label: "25일", msg: "차나 방 안의 찌든 담배 냄새가 거의 빠졌습니다.", icon: "🚗" },
    { ms: 28 * DAY, label: "28일", msg: "걷거나 뛸 때 폐활량이 좋아진 것을 확실히 느낍니다.", icon: "🏃" },
    { ms: 30 * DAY, label: "30일", msg: "🎉 1개월 달성! 칙칙했던 피부에 맑은 생기가 돕니다.", icon: "🌟" },
    { ms: 40 * DAY, label: "40일", msg: "스스로를 맘껏 대견하게 여겨도 충분한 시간입니다.", icon: "👏" },
    { ms: 50 * DAY, label: "50일", msg: "만성적인 기침과 가래가 확연히 줄어듭니다.", icon: "🗣️" },
    { ms: 60 * DAY, label: "60일", msg: "극심한 스트레스 상황에서도 담배 생각이 덜 납니다.", icon: "🧘" },
    { ms: 75 * DAY, label: "75일", msg: "\"너 진짜 독하다!\" 주변의 칭찬과 경악(?)을 동시에 듣습니다.", icon: "😲" },
    { ms: 90 * DAY, label: "90일", msg: "폐의 감염 저항력이 크게 높아져 잔병치레가 줄어듭니다.", icon: "🛡️" },
    { ms: 100 * DAY, label: "100일", msg: "💯 100일의 기적! 뇌의 도파민 분비가 정상화됩니다.", icon: "💯" },
    { ms: 120 * DAY, label: "120일", msg: "이제 스스로를 '비흡연자'라고 소개하셔도 좋습니다.", icon: "🤝" },
    { ms: 150 * DAY, label: "150일", msg: "계단을 오르내릴 때 숨이 훨씬 덜 찬 것을 체감합니다.", icon: "🧗" },
    { ms: 180 * DAY, label: "180일", msg: "전반적인 면역력이 크게 개선되어 몸이 튼튼해집니다.", icon: "💪" },
    { ms: 200 * DAY, label: "200일", msg: "주변 흡연자들에게 당당히 금연을 권할 자격을 획득하셨습니다.", icon: "🗣️" },
    { ms: 250 * DAY, label: "250일", msg: "지금까지 담배 안 피우고 모은 돈으로 스스로에게 선물을 사주세요!", icon: "🎁" },
    { ms: 300 * DAY, label: "300일", msg: "길거리에서 맡는 남의 담배 연기가 오히려 역하게 느껴집니다.", icon: "🤢" },
    { ms: 365 * DAY, label: "1년", msg: "🎉 금연 1주년! 관상동맥질환 발병 위험이 흡연자의 절반으로 뚝 떨어졌습니다.", icon: "🏆" },
    { ms: 366 * DAY, label: "1년 1일", msg: "당신은 더 이상 이 앱이 필요 없습니다! 당장 앱을 삭제하고 자유를 누리세요!!", icon: "🚀" }
];

const drinkStages = [
    { ms: 0, label: "0시간", msg: "간이 알코올 분해를 위해 쉴 틈 없이 돌아가기 시작합니다.", icon: "🌱" },
    { ms: 6 * HOUR, label: "6시간", msg: "술로 자극받았던 위장과 몸이 서서히 안정을 찾습니다.", icon: "😌" },
    { ms: 12 * HOUR, label: "12시간", msg: "극심한 갈증과 탈수 증상이 가라앉기 시작합니다.", icon: "💧" },
    { ms: 18 * HOUR, label: "18시간", msg: "몸과 숨결에 배어있던 술 냄새가 빠져 대화할 때 자신감이 생깁니다.", icon: "✨" },
    { ms: 1 * DAY, label: "1일", msg: "체내 알코올이 완전히 분해되어 정상 컨디션을 되찾습니다.", icon: "🤩" },
    { ms: 2 * DAY, label: "2일", msg: "깊은 잠에 빠져들며 수면의 질이 극적으로 높아집니다.", icon: "😴" },
    { ms: 3 * DAY, label: "3일", msg: "머릿속 안개(브레인 포그)가 걷히고 집중력이 회복됩니다.", icon: "🧠" },
    { ms: 4 * DAY, label: "4일", msg: "숙취와 짜증이 사라져 대인관계가 한결 부드러워집니다.", icon: "😊" },
    { ms: 5 * DAY, label: "5일", msg: "푸석했던 피부 트러블이 진정되고 안색이 맑아집니다.", icon: "💆" },
    { ms: 7 * DAY, label: "7일", msg: "🎉 마의 1주일 달성! 얼굴의 붓기가 빠지고 간이 꿀맛 같은 휴식을 취합니다.", icon: "🥇" },
    { ms: 10 * DAY, label: "10일", msg: "\"어제 내가 무슨 말 했지?\" 아침마다 하던 스마트폰 확인과 이불킥이 사라집니다.", icon: "📱" },
    { ms: 14 * DAY, label: "14일", msg: "소화 기능이 정상화되어 만성적인 속 쓰림이 해결됩니다.", icon: "🥗" },
    { ms: 18 * DAY, label: "18일", msg: "술 마시던 시간과 돈이 고스란히 내 진짜 스펙과 여유가 됩니다.", icon: "📚" },
    { ms: 21 * DAY, label: "21일", msg: "술 없는 주말과 일상에 완벽히 적응하기 시작합니다.", icon: "☕" },
    { ms: 25 * DAY, label: "25일", msg: "숙취로 날려버리던 주말 아침을 상쾌하고 맑은 정신으로 맞이합니다.", icon: "☀️" },
    { ms: 30 * DAY, label: "30일", msg: "🎉 1개월 달성! 피로 해소의 핵심, 간 수치가 눈에 띄게 개선됩니다.", icon: "🛡️" },
    { ms: 40 * DAY, label: "40일", msg: "장이 튼튼해지며 전반적인 면역력이 쑥쑥 올라갑니다.", icon: "💪" },
    { ms: 50 * DAY, label: "50일", msg: "잔병치레가 줄고, 감기에 걸려도 예전보다 훨씬 빨리 낫습니다.", icon: "💊" },
    { ms: 60 * DAY, label: "60일", msg: "잦은 음주로 높아졌던 혈압이 정상 범위로 안정됩니다.", icon: "🩺" },
    { ms: 75 * DAY, label: "75일", msg: "흔들림 없는 모습에 주변 사람들이 나의 '진짜 금주'를 인정하고 배려하기 시작합니다.", icon: "🤝" },
    { ms: 90 * DAY, label: "90일", msg: "지방간 위험이 크게 줄어들고 몸이 깃털처럼 가벼워집니다.", icon: "🪶" },
    { ms: 100 * DAY, label: "100일", msg: "💯 100일의 기적! 술에 대한 심리적 의존도(갈망)가 거의 사라졌습니다.", icon: "💯" },
    { ms: 120 * DAY, label: "120일", msg: "불필요한 뱃살(술배)이 쏙 빠지며 잃어버렸던 옷 태가 살아납니다.", icon: "👖" },
    { ms: 150 * DAY, label: "150일", msg: "알코올성 우울감과 감정 기복이 사라지고, 단단한 심리적 안정감이 찾아옵니다.", icon: "🧘" },
    { ms: 180 * DAY, label: "180일", msg: "만성 피로 완전 탈출! 아침마다 넘치는 활력을 체감합니다.", icon: "⚡" },
    { ms: 200 * DAY, label: "200일", msg: "맨정신으로도 사람들과 깊고 즐거운 대화를 주도할 수 있습니다.", icon: "🗣️" },
    { ms: 250 * DAY, label: "250일", msg: "지금까지 안 마시고 모은 술값으로 나를 위한 아주 큰 선물을 사주세요!", icon: "🎁" },
    { ms: 300 * DAY, label: "300일", msg: "깜빡깜빡하던 기억력과 뇌의 인지 기능이 뚜렷하게 회복됩니다.", icon: "🧠" },
    { ms: 365 * DAY, label: "1년", msg: "🎉 금주 1주년! 심혈관 질환 발병 위험이 비음주자 수준으로 떨어졌습니다.", icon: "🏆" },
    { ms: 366 * DAY, label: "1년 1일", msg: "당신은 더 이상 이 앱이 필요 없습니다! 당장 앱을 삭제하고 자유를 누리세요!!", icon: "🚀" }
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