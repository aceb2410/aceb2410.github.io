/* 명식 부가 정보: 지장간, 12운성, 12신살, 대운, 세운, 월운 (규칙이 정해진 것만) */
(function (root) {
  'use strict';
  var E = root.SajuEngine, C = root.SajuContent;
  var G = E.G, Z = E.Z;

  /* 지장간 (여기·중기·정기 순서) */
  var JIJANGGAN = { 자: '임계', 축: '계신기', 인: '무병갑', 묘: '갑을', 진: '을계무', 사: '무경병',
    오: '병기정', 미: '정을기', 신: '무임경', 유: '경신', 술: '신정무', 해: '무갑임' };

  /* 12운성: 일간 기준. 양간은 순행, 음간은 역행 */
  var UNSEONG = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
  var JANGSAENG = { 갑: '해', 병: '인', 무: '인', 경: '사', 임: '신', 을: '오', 정: '유', 기: '유', 신: '자', 계: '묘' };
  function unseong(stem, branch) {
    var start = Z.indexOf(JANGSAENG[stem]), b = Z.indexOf(branch);
    var yang = G.indexOf(stem) % 2 === 0;
    var k = yang ? (b - start + 12) % 12 : (start - b + 12) % 12;
    return UNSEONG[k];
  }

  /* 12신살: 연지 삼합의 지살(장생 자리)부터 순서대로 */
  var SINSAL = ['지살', '도화', '월살', '망신', '장성', '반안', '역마', '육해', '화개', '겁살', '재살', '천살'];
  var JISAL = { 인: '인', 오: '인', 술: '인', 사: '사', 유: '사', 축: '사', 신: '신', 자: '신', 진: '신', 해: '해', 묘: '해', 미: '해' };
  function sinsal(yearBranch, branch) {
    var k = (Z.indexOf(branch) - Z.indexOf(JISAL[yearBranch]) + 12) % 12;
    return SINSAL[k];
  }

  /* 대운: 성별이 있어야 계산한다 */
  function daeun(res, gender) {
    if (!gender || !res.pillars[1].value) return null;
    var t = res.time || { h: 12, mi: 0 };
    var r = root.Manseryeok.calculateFourPillars({
      year: res.solar.y, month: res.solar.m, day: res.solar.d, hour: t.h, minute: t.mi, gender: gender,
      trueSolarTime: { longitude: res.rule.longitude, applyEquationOfTime: false, applyHistoricalDst: true },
      dayBoundary: res.rule.dayBoundary
    });
    var lp = r.luckPillars;
    var age = res.thisYear - res.solar.y + 1; /* 한국식 나이(세) */
    var cur = -1;
    lp.pillars.forEach(function (p, i) { if (p.age <= age) cur = i; });
    return { startAge: lp.startAge, forward: lp.forward, current: cur, approx: !res.time,
      list: lp.pillars.slice(0, 10).map(function (p) { return { label: p.age + '세', gz: p.korean }; }) };
  }

  /* 세운: 올해 앞뒤 */
  function seun(thisYear) {
    var out = [];
    for (var y = thisYear - 2; y <= thisYear + 3; y++) out.push({ label: y + '', gz: C.yearGanji(y), current: y === thisYear });
    return out;
  }

  /* 월운: 그 달 15일에 걸린 월주 (절기 기준) */
  function wolun(thisYear, thisMonth) {
    var M = root.Manseryeok, out = [];
    for (var m = 1; m <= 12; m++) {
      var r = M.calculateFourPillars({ year: thisYear, month: m, day: 15, hour: 12, minute: 0 });
      out.push({ label: m + '월', gz: r.monthString, current: m === thisMonth });
    }
    return out;
  }

  root.SajuExtras = { JIJANGGAN: JIJANGGAN, unseong: unseong, sinsal: sinsal, daeun: daeun, seun: seun, wolun: wolun };
})(typeof window !== 'undefined' ? window : globalThis);
