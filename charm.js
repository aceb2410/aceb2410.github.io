/* 매력·복 리포트: 신살을 정해진 규칙으로 찾아 지수(%)와 풀이로 보여 준다 */
(function (root) {
  'use strict';
  var E = root.SajuEngine;
  var G = E.G, Z = E.Z;
  var SAMHAP = { 인: 0, 오: 0, 술: 0, 사: 1, 유: 1, 축: 1, 신: 2, 자: 2, 진: 2, 해: 3, 묘: 3, 미: 3 };
  var DOHWA = ['묘', '오', '유', '자'], HWAGAE = ['술', '축', '진', '미'], YEOKMA = ['신', '해', '인', '사'];
  /* 홍염살 (일간 기준) */
  var HONGYEOM = { 갑: ['오'], 을: ['신'], 병: ['인'], 정: ['미'], 무: ['진'], 기: ['진'], 경: ['술'], 신: ['유'], 임: ['자'], 계: ['신'] };
  /* 천을귀인 (일간 기준) */
  var GWIIN = { 갑: ['축', '미'], 무: ['축', '미'], 경: ['축', '미'], 을: ['자', '신'], 기: ['자', '신'], 병: ['해', '유'], 정: ['해', '유'], 신: ['인', '오'], 임: ['사', '묘'], 계: ['사', '묘'] };
  /* 귀문관살 (일지와 월지·시지) */
  var GWIMUN = { 자: '유', 유: '자', 축: '오', 오: '축', 인: '미', 미: '인', 묘: '신', 신: '묘', 진: '해', 해: '진', 사: '술', 술: '사' };
  var GOEGANG = ['경진', '경술', '임진', '임술', '무진', '무술'];
  var BAEKHO = ['갑진', '을미', '병술', '정축', '무진', '임술', '계축'];

  var INFO = {
    도화: { group: 'charm', title: '도화살', none: '첫인상보다 알수록 좋아지는 사람이에요. 오래 볼수록 매력이 쌓여요.',
      some: '사람을 끄는 매력이 있어요. 모임에서 자연스럽게 시선이 모이고 인기가 따라와요.',
      many: '어딜 가도 눈에 띄는 타입이에요. 인연이 많은 만큼 사람을 고르는 눈이 중요해요.' },
    홍염: { group: 'charm', title: '홍염살', none: '담백하고 깔끔한 매력이에요. 꾸미지 않아도 편안함으로 끌어요.',
      some: '은근한 매력이 있어요. 처음엔 몰랐는데 자꾸 생각나게 하는 사람이에요.',
      many: '분위기 하나로 사람을 빠져들게 해요. 눈빛과 말투에 매력이 있어요.' },
    화개: { group: 'charm', title: '화개살', none: '현실 감각이 좋은 사람이에요. 분위기보다 행동으로 보여 줘요.',
      some: '분위기 있고 신비로운 매력이 있어요. 예술, 음악, 글에 감각이 있어요.',
      many: '혼자 있어도 빛나는 사람이에요. 깊이 있는 취미가 매력이 돼요.' },
    귀문: { group: 'charm', title: '귀문관살', none: '마음이 단단하고 흔들림이 적어요. 사람들이 편하게 기대요.',
      some: '촉이 좋아요. 사람 속마음이나 분위기를 남보다 먼저 알아채요.',
      many: '직감이 남달라요. "왠지 그럴 것 같아"가 잘 맞는 사람이에요. 예민한 만큼 쉬는 시간을 챙기세요.' },
    귀인: { group: 'luck', title: '천을귀인', none: '내 힘으로 길을 여는 사람이에요. 스스로 쌓은 것이 오래가요.',
      some: '어려울 때 도와주는 사람이 나타나요. 귀인복이 있는 사주예요.',
      many: '귀인이 겹으로 있어요. 위기마다 손 내미는 사람이 생기는 큰 복이에요.' },
    배우자: { group: 'luck', title: '배우자복', none: '연애는 천천히 맞춰 가는 타입이에요. 오래 볼수록 잘 맞는 사람을 만나요.',
      some: '좋은 짝을 만날 복이 있어요. 함께하면 힘이 되는 사람이 곁에 와요.',
      many: '배우자 자리가 든든해요. 결혼 뒤에 더 잘 풀리는 사주예요.' },
    식복: { group: 'luck', title: '식복', none: '먹는 것보다 다른 즐거움이 많은 사람이에요.',
      some: '먹을 복이 있어요. 맛집 운이 좋고 늘 먹을 게 생겨요.',
      many: '타고난 미식가예요. 먹는 즐거움이 곧 행운이고 일로 이어질 수도 있어요.' },
    재물: { group: 'luck', title: '재물복', none: '돈보다 실력을 먼저 쌓는 사람이에요. 실력이 쌓이면 돈이 따라와요.',
      some: '돈 감각이 있어요. 버는 만큼 지키면 차곡차곡 쌓여요.',
      many: '돈 흐름을 읽는 눈이 있어요. 기회가 많은 만큼 욕심을 다스리면 크게 모아요.' },
    인복: { group: 'luck', title: '인복', none: '혼자서도 잘 해내는 사람이에요. 대신 먼저 손 내밀면 사람이 모여요.',
      some: '좋은 사람이 곁에 있어요. 선배, 스승, 친구에게서 도움을 받아요.',
      many: '사람이 재산인 사주예요. 인맥이 곧 기회가 돼요.' },
    괴강: { group: 'strong', title: '괴강살', none: '부드러운 카리스마예요. 힘보다 설득으로 이끌어요.',
      some: '센 기운이 있어요. 위기에 강하고 판을 뒤집는 힘이 있는 카리스마예요.',
      many: '기가 센 사주의 대표예요. 큰일을 맡을수록 빛나요.' },
    백호: { group: 'strong', title: '백호살', none: '조심성 있게 움직이는 사람이에요. 무리하지 않아서 오래가요.',
      some: '추진력이 강해요. 한번 마음먹으면 거침없이 밀고 가요.',
      many: '기세가 대단해요. 강한 에너지를 일과 운동에 쓰면 크게 이뤄요.' },
    역마: { group: 'strong', title: '역마살', none: '한곳에 뿌리내리는 사람이에요. 안정 속에서 실력을 키워요.',
      some: '움직일 때 운이 풀려요. 여행, 출장, 이사가 기회가 돼요.',
      many: '자유로운 영혼이에요. 해외나 이동이 많은 일과 인연이 깊어요.' }
  };
  var TYPES = {
    도화: { name: '도화형', line: '첫눈에 반하게 하는 사람' },
    홍염: { name: '홍염형', line: '은근히 빠져들게 하는 사람' },
    화개: { name: '화개형', line: '분위기로 끄는 사람' },
    귀문: { name: '촉 좋은 형', line: '마음을 먼저 읽는 사람' },
    none: { name: '편안형', line: '곁에 있으면 편해지는 사람' }
  };

  function seed(s) { var h = 11; for (var i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) % 99991; return h; }

  function analyze(res, gender) {
    var M = root.Manseryeok, ds = res.dayStem;
    if (!ds) return null;
    var P = res.pillars.map(function (p) { return p.value; });
    var br = P.map(function (p) { return p ? p[1] : null; });
    var bases = [br[0], br[2]].filter(Boolean);
    function countIn(list) { var n = 0; br.forEach(function (b) { if (b && list.indexOf(b) >= 0) n++; }); return n; }
    function byBase(table) { var set = []; bases.forEach(function (b) { var t = table[SAMHAP[b]]; if (set.indexOf(t) < 0) set.push(t); }); return set; }

    var cnt = {};
    cnt.도화 = countIn(byBase(DOHWA));
    cnt.홍염 = countIn(HONGYEOM[ds]);
    cnt.화개 = countIn(byBase(HWAGAE));
    cnt.귀문 = 0;
    if (br[2]) [br[1], br[3]].forEach(function (b) { if (b && GWIMUN[br[2]] === b) cnt.귀문++; });
    cnt.귀인 = countIn(GWIIN[ds]);
    cnt.역마 = countIn(byBase(YEOKMA));
    cnt.괴강 = P[2] && GOEGANG.indexOf(P[2]) >= 0 ? 1 : 0;
    cnt.백호 = P.filter(function (p) { return p && BAEKHO.indexOf(p) >= 0; }).length;

    /* 십신으로 보는 복 */
    var tgs = [];
    P.forEach(function (p, i) {
      if (!p) return;
      if (i !== 2) tgs.push(M.getTenGod(ds, p[0]));
      tgs.push(M.getBranchTenGod(ds, p[1]));
    });
    function tc(names) { return tgs.filter(function (t) { return names.indexOf(t) >= 0; }).length; }
    cnt.식복 = tc(['식신']) + (tc(['상관']) ? 0.5 : 0);
    cnt.재물 = tc(['정재', '편재']) + (tc(['식신', '상관']) ? 0.5 : 0);
    cnt.인복 = tc(['정인', '편인']) + cnt.귀인 * 0.5;
    var spouseTg = br[2] ? M.getBranchTenGod(ds, br[2]) : null;
    var sp = ['정재', '정관', '식신', '정인'].indexOf(spouseTg) >= 0 ? 1 : 0.5;
    if (gender === 'male') sp += tc(['정재']) ? 0.5 : 0;
    if (gender === 'female') sp += tc(['정관']) ? 0.5 : 0;
    if (br[2] && GWIIN[ds].indexOf(br[2]) >= 0) sp += 1;
    cnt.배우자 = sp;

    /* 지수(%) : 개수 단계 + 사람마다 조금씩 다른 값 */
    var h = seed(P.join('') + ds);
    function pct(n, k) {
      var j = (h >> k) % 9;
      if (n <= 0) return 22 + j * 2;
      if (n < 1) return 46 + j * 2;
      if (n < 2) return 66 + j * 2;
      if (n < 3) return 84 + Math.floor(j / 2);
      return 94 + Math.floor(j / 3);
    }
    var keys = ['도화', '홍염', '화개', '귀문', '귀인', '배우자', '식복', '재물', '인복', '괴강', '백호', '역마'];
    var items = keys.map(function (k, i) {
      var n = cnt[k], info = INFO[k];
      return { key: k, title: info.title, group: info.group, count: n, pct: pct(n, i % 7),
        has: n > 0, text: n <= 0 ? info.none : n < 2 ? info.some : info.many };
    });
    /* 화개(진술축미)는 흔해서 유형을 정할 때는 한 단계 낮춰 본다 */
    function w(x) { return x.pct - (x.key === '화개' ? 18 : 0) + (x.key === '귀문' ? 6 : 0); }
    var charm = items.filter(function (x) { return x.group === 'charm' && x.has; }).sort(function (a, b) { return w(b) - w(a); });
    var type = charm.length ? TYPES[charm[0].key] : TYPES.none;
    /* 매력 지수: 가장 강한 매력 기준, 누구나 60 이상 */
    var top = Math.max.apply(null, items.filter(function (x) { return x.group === 'charm'; }).map(function (x) { return x.pct; }));
    var total = Math.round(60 + (top - 18) * 0.45);
    return { type: type, total: total, items: items, partial: P.some(function (p) { return !p; }) };
  }

  root.SajuCharm = { analyze: analyze };
})(typeof window !== 'undefined' ? window : globalThis);
