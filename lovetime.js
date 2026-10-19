/* 연애·결혼 운: 맞는 사람, 앞으로 10년 연애운, 결혼감이 들어오는 해, 그해 만날 사람 */
(function (root) {
  'use strict';
  var E = root.SajuEngine, C = root.SajuContent, L = root.SajuLove;
  var G = E.G, Z = E.Z, ANIMAL = E.ANIMAL;
  var ELS = ['목', '화', '토', '금', '수'];
  var SAMHAP = { 인: 0, 오: 0, 술: 0, 사: 1, 유: 1, 축: 1, 신: 2, 자: 2, 진: 2, 해: 3, 묘: 3, 미: 3 };
  var DOHWA = ['묘', '오', '유', '자'];
  var YUKHAP = { 자: '축', 축: '자', 인: '해', 해: '인', 묘: '술', 술: '묘', 진: '유', 유: '진', 사: '신', 신: '사', 오: '미', 미: '오' };
  var CHUNG = { 자: '오', 오: '자', 축: '미', 미: '축', 인: '신', 신: '인', 묘: '유', 유: '묘', 진: '술', 술: '진', 사: '해', 해: '사' };

  /* 일지(배우자 자리)의 십신으로 본 잘 맞는 사람 */
  var SPOUSE = {
    비견: '친구처럼 편한 사람. 취미와 생각이 비슷한 사람과 오래가요.',
    겁재: '활동적이고 승부욕 있는 사람. 서로 자극이 되는 관계가 맞아요.',
    식신: '여유롭고 다정한 사람. 같이 먹고 웃는 게 즐거운 사람이 맞아요.',
    상관: '재치 있고 말 잘하는 사람. 대화가 끊이지 않는 사람에게 끌려요.',
    편재: '활발하고 사교적인 사람. 함께 여기저기 다니는 사람이 맞아요.',
    정재: '알뜰하고 성실한 사람. 생활을 같이 꾸려 갈 수 있는 사람이 맞아요.',
    편관: '카리스마 있고 강단 있는 사람. 나를 이끌어 주는 사람에게 끌려요.',
    정관: '반듯하고 책임감 있는 사람. 믿을 수 있는 사람이 맞아요.',
    편인: '독특하고 생각이 깊은 사람. 나만 아는 매력이 있는 사람에게 끌려요.',
    정인: '배려 깊고 챙겨 주는 사람. 기댈 수 있는 사람이 맞아요.'
  };
  var EL_PERSON = {
    목: '계획적이고 앞으로 나아가는 사람', 화: '밝고 표현이 확실한 사람', 토: '묵직하고 믿음직한 사람',
    금: '결단력 있고 깔끔한 사람', 수: '생각 깊고 유연한 사람'
  };

  /* 그해 만날 사람과 장소 */
  var MEET = {
    stemHap: { who: '나와 정반대 같은데 이상하게 끌리는 사람', where: '우연한 자리' },
    dohwa: { who: '분위기와 외모가 눈에 띄는 사람', where: '모임, SNS, 소개팅' },
    dayHap: { who: '생활 리듬이 잘 맞는 사람', where: '지인 소개, 가까운 동네' },
    samhap: { who: '같은 목표를 가진 사람', where: '동호회, 스터디, 일 모임' },
    wealth: { who: '현실 감각 있고 성실한 사람', where: '일, 돈과 관련된 자리' },
    officer: { who: '책임감 있고 반듯한 사람', where: '직장, 공식적인 자리' }
  };

  function analyze(res, gender) {
    if (!res.dayStem || !res.pillars[2].value) return null;
    var M = root.Manseryeok, ds = res.dayStem, db = res.pillars[2].value[1], yb = res.yearBranch;
    var birthY = res.solar.y, y0 = res.thisYear;
    var dohwa = [yb, db].filter(Boolean).map(function (b) { return DOHWA[SAMHAP[b]]; });

    /* 맞는 사람 */
    var spouseTg = M.getBranchTenGod(ds, db);
    var weakest = ELS.slice().sort(function (a, b) { return res.elements[a] - res.elements[b]; })[0];
    var hapStem = G[(G.indexOf(ds) + 5) % 10];
    var ideal = {
      spouse: SPOUSE[spouseTg],
      fill: '나에게 부족한 ' + weakest + ' 기운을 가진 ' + EL_PERSON[weakest] + '이 나를 채워 줘요.',
      stem: '일간이 ' + hapStem + '(' + L.IMG[hapStem] + ')인 사람과는 처음부터 끌림이 강해요.'
    };

    /* 앞으로 10년 */
    var years = [];
    for (var y = y0; y < y0 + 10; y++) {
      var gz = C.yearGanji(y), st = gz[0], br = gz[1];
      var love = 0, marry = 0, tags = [], meet = null;
      if ((G.indexOf(ds) + 5) % 10 === G.indexOf(st)) { love += 3; marry += 2; tags.push('천간합'); meet = meet || MEET.stemHap; }
      if (YUKHAP[db] === br) { love += 3; marry += 3; tags.push('배우자 자리 합'); meet = meet || MEET.dayHap; }
      if (dohwa.indexOf(br) >= 0) { love += 3; tags.push('도화'); meet = meet || MEET.dohwa; }
      if (br !== db && SAMHAP[br] === SAMHAP[db] && YUKHAP[db] !== br) { love += 2; marry += 1; tags.push('배우자 자리 삼합'); meet = meet || MEET.samhap; }
      var tgS = M.getTenGod(ds, st), tgB = M.getBranchTenGod(ds, br);
      if (gender === 'male') {
        if (tgS === '정재' || tgB === '정재') { love += 2; marry += 2; tags.push('정재'); meet = meet || MEET.wealth; }
        else if (tgS === '편재' || tgB === '편재') { love += 2; tags.push('편재'); meet = meet || MEET.wealth; }
      } else if (gender === 'female') {
        if (tgS === '정관' || tgB === '정관') { love += 2; marry += 2; tags.push('정관'); meet = meet || MEET.officer; }
        else if (tgS === '편관' || tgB === '편관') { love += 2; tags.push('편관'); meet = meet || MEET.officer; }
      }
      var chung = CHUNG[db] === br;
      if (chung) { love -= 1; tags.push('배우자 자리 충'); }
      years.push({ year: y, ganji: gz, age: y - birthY + 1, love: love, marry: marry, tags: tags, meet: meet, chung: chung,
        stars: Math.max(0, Math.min(5, Math.round(love / 1.6))) });
    }
    var adult = function (yy) { return yy.age >= 20; };
    var best = years.filter(function (x) { return x.love >= 3; }).sort(function (a, b) { return b.love - a.love || a.year - b.year; }).slice(0, 3)
      .sort(function (a, b) { return a.year - b.year; });
    var marryYear = years.filter(adult).filter(function (x) { return x.marry >= 3; }).sort(function (a, b) { return b.marry - a.marry || a.year - b.year; })[0] || null;
    var thisYear = years[0];

    function yearText(x) {
      var parts = [];
      if (x.tags.indexOf('천간합') >= 0) parts.push('나와 합이 되는 해라 강하게 끌리는 사람이 나타나요.');
      if (x.tags.indexOf('배우자 자리 합') >= 0) parts.push('배우자 자리가 묶이는 해라 진지한 만남과 결혼 이야기가 나오기 쉬워요.');
      if (x.tags.indexOf('도화') >= 0) parts.push('도화가 들어와 매력이 잘 드러나고 인연이 많아요.');
      if (x.tags.indexOf('배우자 자리 삼합') >= 0) parts.push('함께할 사람이 자연스럽게 곁에 와요.');
      if (x.tags.indexOf('정재') >= 0 || x.tags.indexOf('정관') >= 0) parts.push('오래 갈 사람을 만나기 좋은 해예요.');
      else if (x.tags.indexOf('편재') >= 0 || x.tags.indexOf('편관') >= 0) parts.push('설레는 만남이 생기지만 가볍게 끝날 수도 있어요.');
      if (x.chung) parts.push('관계에 변화가 와요. 새로 시작하거나 정리하는 일이 생기기 쉬워요.');
      if (!parts.length) parts.push('연애운은 잔잔한 해예요. 지금 곁에 있는 사람과의 관계를 다지기 좋아요.');
      return parts.slice(0, 2).join(' ');
    }
    years.forEach(function (x) { x.text = yearText(x); });

    return {
      ideal: ideal, years: years, best: best, marry: marryYear, now: thisYear,
      gendered: gender === 'male' || gender === 'female'
    };
  }

  root.SajuLoveTime = { analyze: analyze };
})(typeof window !== 'undefined' ? window : globalThis);
