/* 사주 계산 엔진: 기본 계산(A) + 독립 교차 검증(B) + 경계 감지
 * A: manseryeok (KASI 절입표, IANA 한국 시간대 표)
 * B: 시스템 시간대 DB(Intl) + lunar-javascript 절기 + 율리우스일 공식 + 시두법
 */
(function (root) {
  'use strict';
  var G = '갑을병정무기경신임계'.split('');
  var Z = '자축인묘진사오미신유술해'.split('');
  var HAN_G = '甲乙丙丁戊己庚辛壬癸', HAN_Z = '子丑寅卯辰巳午未申酉戌亥';
  var EL_G = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];
  var EL_Z = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'];
  var ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

  /* 계산 기준 (대표 결정: 대중적인 기준 하나로 고정). 비교용으로만 바꿀 수 있다. */
  var DEFAULT_RULE = { longitude: 127.5, dayBoundary: 'midnight' };

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- A. 기본 계산 ---------- */
  function calcA(s, rule) {
    var M = root.Manseryeok;
    var r = M.calculateFourPillars({
      year: s.y, month: s.m, day: s.d, hour: s.h, minute: s.mi,
      trueSolarTime: { longitude: rule.longitude, applyEquationOfTime: false, applyHistoricalDst: true },
      dayBoundary: rule.dayBoundary
    });
    return r;
  }
  function key4(r) { return [r.yearString, r.monthString, r.dayString, r.hourString]; }

  /* ---------- B. 독립 교차 검증 ---------- */
  var fmt = null;
  function seoulOffsetMin(instantMs) {
    if (!fmt) fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    var p = {}; fmt.formatToParts(new Date(instantMs)).forEach(function (x) { p[x.type] = x.value; });
    return Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - instantMs) / 60000);
  }
  /* 기록된 서울 벽시계 시각 → 절대 순간. 없는 시각(서머타임 시작)·두 번 있는 시각이면 ambiguous */
  function wallToInstant(s) {
    var wall = Date.UTC(s.y, s.m - 1, s.d, s.h, s.mi);
    var hits = [];
    [480, 510, 540, 570, 600].forEach(function (off) {
      var inst = wall - off * 60000;
      if (seoulOffsetMin(inst) === off && hits.indexOf(inst) < 0) hits.push(inst);
    });
    return { instant: hits[0], ambiguous: hits.length !== 1 };
  }
  function jdn(y, m, d) {
    var a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function hanToKo(s) {
    return s.split('').map(function (c) {
      var i = HAN_G.indexOf(c); if (i >= 0) return G[i];
      i = HAN_Z.indexOf(c); return i >= 0 ? Z[i] : c;
    }).join('');
  }
  function calcB(s, rule) {
    if (!root.Solar) return null; // 검증 라이브러리 미로딩
    var w = wallToInstant(s);
    if (w.instant === undefined) return { ambiguous: true };
    var bj = new Date(w.instant + 8 * 3600e3); // 북경 벽시계(절기 계산 기준)
    var ec = root.Solar.fromYmdHms(bj.getUTCFullYear(), bj.getUTCMonth() + 1, bj.getUTCDate(), bj.getUTCHours(), bj.getUTCMinutes(), bj.getUTCSeconds()).getLunar().getEightChar();
    var ap = new Date(w.instant + rule.longitude * 4 * 60000); // 지방 평균태양시
    var ay = ap.getUTCFullYear(), am = ap.getUTCMonth() + 1, ad = ap.getUTCDate(), ah = ap.getUTCHours(), ami = ap.getUTCMinutes();
    var minutes = ah * 60 + ami;
    var dayShift = (rule.dayBoundary === 'jasi' && ah === 23) ? 1 : 0;
    var di = ((jdn(ay, am, ad) + dayShift + 49) % 60 + 60) % 60;
    var hb = Math.floor((minutes + 60) / 120) % 12;
    var stemDay = di % 10;
    if (rule.dayBoundary === 'splitJasi' && ah === 23) stemDay = (stemDay + 1) % 10;
    var hs = ((stemDay % 5) * 2 + hb) % 10;
    return {
      ambiguous: w.ambiguous,
      p: [hanToKo(ec.getYear()), hanToKo(ec.getMonth()), G[di % 10] + Z[di % 12], G[hs] + Z[hb]]
    };
  }

  /* ---------- 경계 감지 ---------- */
  function addMin(s, k) {
    var t = new Date(Date.UTC(s.y, s.m - 1, s.d, s.h, s.mi) + k * 60000);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), mi: t.getUTCMinutes() };
  }
  var NAMES = ['연주', '월주', '일주', '시주'];
  /* 입력 시각 ±window분 안에서 기둥이 바뀌는 지점을 찾는다 */
  function findSwitches(s, rule, windowMin) {
    var base = key4(calcA(s, rule)).join();
    var out = [], prev = null;
    for (var k = -windowMin; k <= windowMin; k++) {
      var t = addMin(s, k), cur = key4(calcA(t, rule));
      if (prev && cur.join() !== prev.p.join()) {
        var changed = [];
        for (var i = 0; i < 4; i++) if (cur[i] !== prev.p[i]) changed.push(NAMES[i]);
        out.push({ at: t, offset: k, changed: changed, before: prev.p, after: cur });
      }
      prev = { p: cur };
    }
    out.base = base;
    return out;
  }

  /* ---------- 공개: 계산 ---------- */
  /* input: {calendar:'solar'|'lunar', y,m,d, leap, timeKnown, h, mi}
   * 반환: {status:'ok'|'ask'|'invalid', ...} */
  function compute(input, rule) {
    rule = rule || DEFAULT_RULE;
    var M = root.Manseryeok;
    var y = input.y, m = input.m, d = input.d;
    if (input.calendar === 'lunar') {
      try { var sd = M.lunarToSolar(y, m, d, !!input.leap); y = sd.year; m = sd.month; d = sd.day; }
      catch (e) { return { status: 'invalid', message: '음력 ' + m + '월 ' + d + '일' + (input.leap ? '(윤달)' : '') + '은 그해에 없는 날짜예요. 날짜나 윤달 체크를 확인해 주세요.' }; }
    } else if (!M.isValidSolarDate(y, m, d)) {
      return { status: 'invalid', message: '없는 날짜예요. 다시 확인해 주세요.' };
    }
    if (y < 1920 || y > 2100) return { status: 'invalid', message: '1920년부터 2100년 사이만 볼 수 있어요.' };
    var solar = { y: y, m: m, d: d };

    if (!input.timeKnown) {
      /* 시간 모름: 하루 전체를 훑어 확실한 기둥만 확정 */
      /* 하루 중 1시간 이상 이어지는 값만 후보로 친다.
       * (지역 시간 보정 때문에 자정 직후 30분은 전날 일주가 되지만, 그 가능성 때문에
       *  모든 사람의 일주를 미확정으로 두지 않는다) */
      var seen = [{}, {}, {}];
      for (var mins = 0; mins < 1440; mins += 5) {
        var r0 = key4(calcA({ y: y, m: m, d: d, h: Math.floor(mins / 60), mi: mins % 60 }, rule));
        for (var i = 0; i < 3; i++) seen[i][r0[i]] = (seen[i][r0[i]] || 0) + 5;
      }
      var noon = calcA({ y: y, m: m, d: d, h: 12, mi: 0 }, rule);
      var pillars = key4(noon).slice(0, 3).map(function (p, i) {
        var opts = Object.keys(seen[i]).filter(function (k) { return seen[i][k] >= 60; });
        if (opts.length === 0) opts = [p];
        return { name: NAMES[i], value: opts.length === 1 ? opts[0] : null, options: opts };
      });
      pillars.push({ name: '시주', value: null, options: [] });
      return finish({ solar: solar, time: null, pillars: pillars, raw: noon, rule: rule, verify: verify({ y: y, m: m, d: d, h: 12, mi: 0 }, rule, key4(noon)) });
    }

    var s = { y: y, m: m, d: d, h: input.h, mi: input.mi };
    var raw = calcA(s, rule);
    var p4 = key4(raw);
    var v = verify(s, rule, p4);

    if (!input.resolved) {
      /* 질문 기준
       * - 10분 단위(예: 1시 20분)로 넣으면 대충 기억한 시간일 수 있어 넓게 묻는다: 시·일 ±10분, 절입 ±60분
       * - 분까지(예: 1시 27분) 넣으면 정확한 기록으로 보고 바뀌는 순간에 아주 가까울 때만 묻는다: 시·일 ±2분, 절입 ±5분 */
      var approx = s.mi % 10 === 0;
      var sw = findSwitches(s, rule, 60).filter(function (x) {
        var big = x.changed.some(function (c) { return c === '연주' || c === '월주'; });
        var lim = big ? (approx ? 60 : 5) : (approx ? 10 : 2);
        return Math.abs(x.offset) <= lim;
      });
      if (sw.length) {
        var near = sw.slice().sort(function (a, b) { return Math.abs(a.offset) - Math.abs(b.offset); })[0];
        return {
          status: 'ask', solar: solar, time: s, switchAt: near ? near.at : null,
          changed: near ? near.changed : [], ambiguousTime: v && v.ambiguousTime,
          before: near ? near.before : null, after: near ? near.after : null
        };
      }
    }
    if (input.resolved && input.before && input.after) {
      /* 경계 질문에 답한 경우: 바뀌는 순간에서 2분 떨어진 시각으로 계산·검증한다
       * (절입 시각은 두 라이브러리가 수 초 차이가 날 수 있어 딱 그 분은 피한다) */
      if (input.resolved === 'unsure') {
        var pl = [0, 1, 2, 3].map(function (i) {
          var same = input.before[i] === input.after[i];
          return { name: NAMES[i], value: same ? input.before[i] : null, options: same ? [] : [input.before[i], input.after[i]] };
        });
        return finish({ solar: solar, time: s, pillars: pl, raw: raw, rule: rule, verify: verify(addMin(input.switchAt, -2), rule, input.before) });
      }
      var pick = input.resolved === 'before' ? input.before : input.after;
      var at = addMin(input.switchAt, input.resolved === 'before' ? -2 : 2);
      return finish({
        solar: solar, time: s, rule: rule, raw: raw, verify: verify(at, rule, pick), side: input.resolved,
        pillars: pick.map(function (p, i) { return { name: NAMES[i], value: p, options: [] }; })
      });
    }
    return finish({
      solar: solar, time: s, rule: rule, raw: raw, verify: v,
      pillars: p4.map(function (p, i) { return { name: NAMES[i], value: p, options: [] }; })
    });
  }

  function verify(s, rule, p4) {
    var b = calcB(s, rule);
    if (!b) return { done: false };
    if (b.ambiguous && !b.p) return { done: true, ok: false, ambiguousTime: true };
    var mism = [];
    for (var i = 0; i < 4; i++) if (b.p[i] !== p4[i]) mism.push(NAMES[i]);
    return { done: true, ok: mism.length === 0, mismatch: mism, other: b.p, ambiguousTime: b.ambiguous };
  }

  function finish(o) {
    o.status = o.verify && o.verify.done && !o.verify.ok && !o.verify.ambiguousTime ? 'hold' : 'ok';
    /* 오행 개수: 확정된 기둥만 */
    var count = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }, n = 0;
    o.pillars.forEach(function (p) {
      if (!p.value) return;
      count[EL_G[G.indexOf(p.value[0])]]++; count[EL_Z[Z.indexOf(p.value[1])]]++; n += 2;
    });
    o.elements = count; o.charCount = n;
    var day = o.pillars[2].value;
    o.dayStem = day ? day[0] : null;
    var yr = o.pillars[0].value;
    o.animal = yr ? ANIMAL[Z.indexOf(yr[1])] : null;
    o.yearBranch = yr ? yr[1] : null;
    return o;
  }

  root.SajuEngine = {
    compute: compute, DEFAULT_RULE: DEFAULT_RULE, G: G, Z: Z, EL_G: EL_G, EL_Z: EL_Z, ANIMAL: ANIMAL,
    _calcA: calcA, _calcB: calcB, _key4: key4, pad: pad
  };
})(typeof window !== 'undefined' ? window : globalThis);
