/* 오늘의 운세: 그날 일진(日辰)과 내 사주의 관계로 정해진 규칙에 따라 계산 */
(function (root) {
  'use strict';
  var E = root.SajuEngine, L = root.SajuLove;
  var G = E.G, Z = E.Z, ANIMAL = E.ANIMAL;
  var ELS = ['목', '화', '토', '금', '수'];

  var TG_DAY = {
    비견: { s: 70, one: '내 뜻대로 밀고 가기 좋은 날이에요.', money: '같이 쓰는 돈이 생겨요. 더치페이가 마음 편해요.', love: '친구 같은 편안함이 통하는 날이에요.', work: '혼자 하는 일이 잘 풀려요.', care: '고집' },
    겁재: { s: 60, one: '경쟁심이 올라오는 날이에요. 한 발만 물러서세요.', money: '충동구매와 빌려주는 돈을 조심하세요.', love: '질투가 생길 수 있어요. 말을 아끼세요.', work: '경쟁자가 보여요. 내 몫은 문서로 챙기세요.', care: '돈 거래와 보증' },
    식신: { s: 85, one: '여유롭고 잘 풀리는 날이에요. 맛있는 걸 드세요.', money: '작은 즐거움에 쓰는 돈은 아깝지 않아요.', love: '함께 먹고 웃는 시간이 관계를 키워요.', work: '아이디어가 잘 나와요. 메모해 두세요.', care: '과식과 늦잠' },
    상관: { s: 68, one: '말이 술술 나오는 날이에요. 말실수만 조심하세요.', money: '기분 따라 쓰는 지출을 조심하세요.', love: '솔직함이 매력이지만 한마디는 삼키세요.', work: '발표, 기획, 창작에 좋아요. 윗사람과의 말다툼은 피하세요.', care: '홧김에 보내는 메시지' },
    편재: { s: 78, one: '움직일수록 기회가 생기는 날이에요.', money: '뜻밖의 돈이 들어오거나 크게 쓸 일이 생겨요.', love: '새로운 만남에 좋은 날이에요.', work: '영업, 미팅, 외근이 잘 풀려요.', care: '하루 만에 내리는 큰 결정' },
    정재: { s: 82, one: '성실함이 보상받는 날이에요.', money: '계획한 대로 돈이 들어오고 나가요. 정리하기 좋은 날이에요.', love: '믿음직한 모습이 점수를 따요.', work: '마무리와 정산에 좋아요.', care: '인색해 보이는 말' },
    편관: { s: 62, one: '압박이 느껴지는 날이에요. 버티면 성장해요.', money: '갑자기 나갈 돈이 생길 수 있어요. 여유를 남겨 두세요.', love: '예민해지기 쉬워요. 다툼은 내일로 미루세요.', work: '책임이 커져요. 무리하지 말고 우선순위를 정하세요.', care: '무리한 약속' },
    정관: { s: 80, one: '인정받는 날이에요. 반듯하게 가면 좋아요.', money: '공식적인 돈 문제(계약, 서류)가 잘 풀려요.', love: '진지한 대화가 잘 통해요.', work: '보고, 면접, 계약에 좋은 날이에요.', care: '지각과 약속 시간' },
    편인: { s: 66, one: '생각이 많아지는 날이에요. 혼자만의 시간을 가지세요.', money: '공부나 취미에 쓰는 돈은 괜찮아요.', love: '혼자 결론 내지 말고 물어보세요.', work: '조사, 공부, 기획에 좋아요. 결정은 미루세요.', care: '괜한 걱정' },
    정인: { s: 80, one: '도움이 들어오는 날이에요. 부탁해도 괜찮아요.', money: '어른이나 선배에게서 좋은 정보가 와요.', love: '따뜻한 말 한마디에 마음이 열려요.', work: '배우고 준비하는 일이 잘 풀려요.', care: '받기만 하는 태도' }
  };
  var COLOR = { 목: ['초록', '청록'], 화: ['빨강', '주황'], 토: ['노랑', '베이지'], 금: ['흰색', '은색'], 수: ['검정', '남색'] };
  var COLOR_HEX = { 초록: '#2f7d57', 청록: '#2a8c88', 빨강: '#c4452f', 주황: '#d9772b', 노랑: '#d4a72c', 베이지: '#c9b18a', 흰색: '#f3f3ef', 은색: '#a9b0b6', 검정: '#22262a', 남색: '#27407a' };
  var DIR = { 목: '동쪽', 화: '남쪽', 토: '가까운 곳', 금: '서쪽', 수: '북쪽' };
  var NUM = { 목: [3, 8], 화: [2, 7], 토: [5, 10], 금: [4, 9], 수: [1, 6] };
  var ITEM = { 목: ['작은 화분', '책'], 화: ['향초', '빨간 소품'], 토: ['머그잔', '흙빛 가방'], 금: ['시계', '반지'], 수: ['텀블러', '검은 펜'] };
  var FOOD = { 목: ['샐러드', '쌈밥'], 화: ['매콤한 볶음', '커피'], 토: ['고구마', '떡'], 금: ['배', '흰 쌀밥'], 수: ['국물 요리', '해산물'] };

  var YUKHAP = { 자: '축', 축: '자', 인: '해', 해: '인', 묘: '술', 술: '묘', 진: '유', 유: '진', 사: '신', 신: '사', 오: '미', 미: '오' };
  var CHUNG = { 자: '오', 오: '자', 축: '미', 미: '축', 인: '신', 신: '인', 묘: '유', 유: '묘', 진: '술', 술: '진', 사: '해', 해: '사' };

  /* 시진 → 시계 시각 (실제 해 기준 30분 보정 반영) */
  function hourRange(branch, lon) {
    var shift = Math.round((135 - lon) * 4); /* 분 */
    var start = (Z.indexOf(branch) * 120 - 60 + shift + 1440) % 1440, end = (start + 119) % 1440;
    function f(m) { var h = Math.floor(m / 60), mi = m % 60; return (h < 12 ? '오전 ' : '오후 ') + ((h % 12) || 12) + '시' + (mi ? ' ' + mi + '분' : ''); }
    return f(start) + '~' + f(end);
  }

  /* 행운의 시간: 그날 일진과 합이 되는 시진 중 깨어 있는 시간(묘~해) */
  var SAMHAP_G = [['인', '오', '술'], ['사', '유', '축'], ['신', '자', '진'], ['해', '묘', '미']];
  function luckyBranch(dayBranch) {
    var cands = [YUKHAP[dayBranch]];
    SAMHAP_G.forEach(function (g) { if (g.indexOf(dayBranch) >= 0) g.forEach(function (b) { if (b !== dayBranch) cands.push(b); }); });
    var awake = cands.filter(function (b) { var i = Z.indexOf(b); return i >= 3 && i <= 11; });
    return (awake[0] || cands[0]);
  }

  /* 서울 기준 오늘 날짜 */
  function seoulDate(offsetDays) {
    var d = new Date(Date.now() + 9 * 3600e3 + (offsetDays || 0) * 864e5);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() };
  }
  function dayGanji(dt) {
    return root.Manseryeok.calculateFourPillars({ year: dt.y, month: dt.m, day: dt.d, hour: 12, minute: 0 }).dayString;
  }
  function seed(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003; return h; }

  function forMe(res, offsetDays) {
    var dt = seoulDate(offsetDays), gz = dayGanji(dt);
    var ds = res.dayStem;
    if (!ds) return null;
    var tg = root.Manseryeok.getTenGod(ds, gz[0]);
    var base = TG_DAY[tg];
    var db = res.pillars[2].value[1], yb = res.yearBranch;
    var rel = L._branchRel(db, gz[1]), relY = yb ? L._branchRel(yb, gz[1]) : 'plain';
    var key = res.pillars.map(function (p) { return p.value || '-'; }).join('') + dt.y + dt.m + dt.d;
    var h = seed(key);
    var score = base.s + ({ yukhap: 10, samhap: 7, same: 2, plain: 0, chung: -12, wonjin: -6 })[rel] + (({ yukhap: 4, samhap: 3, chung: -4 })[relY] || 0) + (h % 9) - 4;
    score = Math.max(40, Math.min(97, score));
    var relLine = rel === 'chung' ? '오늘 일진이 내 일지와 부딪혀요. 이동, 약속 변경이 생기기 쉬워요.'
      : rel === 'yukhap' ? '오늘 일진이 내 일지와 합이에요. 사람 운이 좋아요.'
      : rel === 'samhap' ? '오늘 일진이 내 일지와 같은 편이에요. 하는 일에 힘이 실려요.'
      : rel === 'wonjin' ? '괜히 서운한 일이 생길 수 있어요. 오해는 그날 푸세요.' : '';

    /* 행운의 기운: 날마다 바꿔 가며, 내게 부족한 기운 또는 나를 살리는 기운 */
    /* 그날 기운에 맞춰 고른다: 누르는 날엔 나를 살리는 기운, 경쟁하는 날엔 풀어 주는 기운 */
    var myEl = ELS.indexOf(E.EL_G[G.indexOf(ds)]);
    var weakest = ELS.slice().sort(function (a, b) { return res.elements[a] - res.elements[b]; })[0];
    var GROUP = { 비견: 1, 겁재: 1, 식신: 2, 상관: 2, 편재: 0, 정재: 0, 편관: 4, 정관: 4, 편인: -1, 정인: -1 };
    var gshift = GROUP[tg];
    var luckyEl = gshift < 0 ? weakest : ELS[(myEl + gshift) % 5];
    var pick = h % 2;
    return {
      date: dt, ganji: gz, tenGod: tg, score: score,
      one: base.one, relLine: relLine,
      rows: [['돈', base.money], ['연애', base.love], ['일', base.work]],
      care: base.care,
      lucky: {
        element: luckyEl,
        color: COLOR[luckyEl][pick], colorHex: COLOR_HEX[COLOR[luckyEl][pick]],
        dir: DIR[luckyEl], num: NUM[luckyEl][(h >> 1) % 2],
        item: ITEM[luckyEl][(h >> 2) % 2], food: FOOD[luckyEl][(h >> 3) % 2],
        time: hourRange(luckyBranch(gz[1]), res.rule.longitude)
      }
    };
  }

  /* 띠별 오늘 (숏폼 소재용): 오늘 일진 지지와 띠의 관계만 본다 */
  var ANIMAL_DAY = {
    yukhap: { s: 4, t: ['귀인을 만나는 날. 부탁하면 들어줘요.', '반가운 연락이 오는 날. 먼저 손 내밀어도 좋아요.', '좋은 인연이 붙는 날. 약속을 잡아 보세요.'] },
    samhap: { s: 3, t: ['하는 일에 힘이 실리는 날.', '같은 편이 생기는 날. 함께하면 빨라요.', '밀어붙이면 되는 날. 미뤄 둔 일을 하세요.'] },
    same: { s: 2, t: ['나와 닮은 사람과 잘 통하는 날.', '익숙한 곳에서 편안한 날.', '내 페이스대로 가면 되는 날.'] },
    plain: { s: 2, t: ['무난한 하루. 루틴대로 가면 좋아요.', '큰 변화 없는 날. 정리하기 좋아요.', '조용히 실속 챙기는 날.', '작은 일부터 끝내면 개운한 날.'] },
    wonjin: { s: 1, t: ['사소한 말에 서운해지는 날. 말을 아끼세요.', '괜히 예민해지는 날. 혼자 시간을 가지세요.'] },
    chung: { s: 0, t: ['계획이 틀어지기 쉬운 날. 여유 있게 움직이세요.', '부딪힘이 생기는 날. 큰 결정은 미루세요.'] }
  };
  function byAnimal(offsetDays) {
    var dt = seoulDate(offsetDays), gz = dayGanji(dt);
    return Z.map(function (b) {
      var rel = L._branchRel(b, gz[1]);
      var v = ANIMAL_DAY[rel].t, k = (Z.indexOf(b) + dt.d + dt.m) % v.length;
      return { branch: b, animal: ANIMAL[Z.indexOf(b)] + '띠', stars: ANIMAL_DAY[rel].s, text: v[k], rel: rel };
    });
  }

  root.SajuToday = { forMe: forMe, byAnimal: byAnimal, seoulDate: seoulDate, dayGanji: dayGanji };
})(typeof window !== 'undefined' ? window : globalThis);
