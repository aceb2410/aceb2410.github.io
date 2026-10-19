/* 연애와 궁합 (정해진 문장 방식). 성별을 묻지 않는 규칙만 쓴다. */
(function (root) {
  'use strict';
  var E = root.SajuEngine, C = root.SajuContent;
  var G = E.G, Z = E.Z, ANIMAL = E.ANIMAL;
  var ELS = ['목', '화', '토', '금', '수'];
  var IMG = { 갑: '큰 나무', 을: '풀과 덩굴', 병: '태양', 정: '촛불', 무: '큰 산', 기: '논밭', 경: '단단한 쇠', 신: '보석', 임: '큰 바다', 계: '비와 이슬' };

  /* 일간별 연애 스타일 */
  var LOVE_STYLE = {
    갑: { one: '좋아하면 직진. 지켜 주고 이끌어 주는 연애를 해요.', more: '책임감 있는 연인이에요. 다만 내 방식이 맞다고 밀어붙이면 상대가 숨이 막힐 수 있어요. 결정할 때 한 번은 상대에게 먼저 물어보세요.' },
    을: { one: '천천히 스며드는 연애. 다정하고 상대에게 잘 맞춰 줘요.', more: '맞춰 주는 게 편해서 서운한 걸 쌓아 두기 쉬워요. 작은 불만은 작을 때 말해야 큰 싸움이 안 나요.' },
    병: { one: '표현이 확실한 연애. 좋으면 숨기지 못해요.', more: '뜨겁게 시작하지만 금방 식었다는 오해를 받기도 해요. 처음의 표현을 오래 이어 가는 게 숙제예요.' },
    정: { one: '한 사람만 깊게. 작은 것까지 기억해 주는 연애를 해요.', more: '정성이 큰 만큼 기대도 커요. 상대가 같은 방식으로 표현하지 않아도 사랑이 없는 건 아니에요.' },
    무: { one: '변하지 않는 연애. 한번 마음 주면 오래가요.', more: '표현이 적어서 무심하다는 말을 들을 수 있어요. 말 한마디로 전해지는 게 생각보다 많아요.' },
    기: { one: '챙겨 주는 연애. 생활을 같이 꾸려 가는 데 강해요.', more: '현실을 먼저 따지다 설렘을 놓칠 때가 있어요. 가끔은 계획 없는 데이트도 좋아요.' },
    경: { one: '의리 있는 연애. 내 사람은 끝까지 지켜요.', more: '말이 직설적이라 상처를 줄 때가 있어요. 맞는 말이라도 부드럽게 하면 더 잘 들려요.' },
    신: { one: '취향이 맞아야 시작되는 연애. 기준이 높고 섬세해요.', more: '작은 말에 오래 마음이 쓰여요. 상대의 진심은 말보다 행동에서 찾으면 편해요.' },
    임: { one: '자유로운 연애. 서로의 시간을 존중해요.', more: '구속을 싫어해서 가까워질수록 거리를 두기도 해요. 혼자 있고 싶을 땐 이유를 말해 주세요.' },
    계: { one: '말없이 알아채는 연애. 눈치가 빠르고 다정해요.', more: '혼자 짐작하고 혼자 결론 내기 쉬워요. 궁금하면 직접 물어보는 게 제일 빨라요.' }
  };

  /* 관계 판정 */
  function elOf(stem) { return E.EL_G[G.indexOf(stem)]; }
  function stemRel(a, b) {
    var ia = G.indexOf(a), ib = G.indexOf(b);
    if ((ia + 5) % 10 === ib) return 'hap';
    var ea = ELS.indexOf(elOf(a)), eb = ELS.indexOf(elOf(b));
    if (ea === eb) return 'same';
    if ((ea + 1) % 5 === eb) return 'give';      /* 내가 상대를 살림 */
    if ((eb + 1) % 5 === ea) return 'take';      /* 상대가 나를 살림 */
    if ((ea + 2) % 5 === eb) return 'press';     /* 내가 상대를 누름 */
    return 'pressed';                            /* 상대가 나를 누름 */
  }
  var YUKHAP = { 자: '축', 축: '자', 인: '해', 해: '인', 묘: '술', 술: '묘', 진: '유', 유: '진', 사: '신', 신: '사', 오: '미', 미: '오' };
  var CHUNG = { 자: '오', 오: '자', 축: '미', 미: '축', 인: '신', 신: '인', 묘: '유', 유: '묘', 진: '술', 술: '진', 사: '해', 해: '사' };
  var WONJIN = { 자: '미', 미: '자', 축: '오', 오: '축', 인: '유', 유: '인', 묘: '신', 신: '묘', 진: '해', 해: '진', 사: '술', 술: '사' };
  var SAMHAP = { 인: 0, 오: 0, 술: 0, 사: 1, 유: 1, 축: 1, 신: 2, 자: 2, 진: 2, 해: 3, 묘: 3, 미: 3 };
  var DOHWA = ['묘', '오', '유', '자'];
  function branchRel(a, b) {
    if (a === b) return 'same';
    if (YUKHAP[a] === b) return 'yukhap';
    if (SAMHAP[a] === SAMHAP[b]) return 'samhap';
    if (CHUNG[a] === b) return 'chung';
    if (WONJIN[a] === b) return 'wonjin';
    return 'plain';
  }
  function animal(b) { return ANIMAL[Z.indexOf(b)] + '띠'; }

  /* ---------- 혼자 볼 때: 연애 스타일 + 잘 맞는 사람 ---------- */
  function loveSelf(res) {
    if (!res.dayStem) return null;
    var ds = res.dayStem, st = LOVE_STYLE[ds];
    var hapStem = G[(G.indexOf(ds) + 5) % 10];
    var out = { one: st.one, more: st.more,
      idealStem: { stem: hapStem, img: IMG[hapStem], text: '일간이 ' + hapStem + '(' + IMG[hapStem] + ')인 사람에게 자연스럽게 끌려요. 사주에서 가장 강한 끌림인 천간합 관계예요.' } };
    var yb = res.yearBranch;
    if (yb) {
      var good = Z.filter(function (z) { return z !== yb && (SAMHAP[z] === SAMHAP[yb] || YUKHAP[yb] === z); });
      var care = [CHUNG[yb], WONJIN[yb]];
      out.goodAnimals = good.map(animal);
      out.careAnimals = care.map(animal);
    }
    /* 다음 도화 해 (연지·일지 기준) */
    var bases = [res.yearBranch, res.pillars[2].value ? res.pillars[2].value[1] : null].filter(Boolean);
    var y0 = res.thisYear, found = null;
    for (var y = y0; y < y0 + 12 && !found; y++) {
      var b = C.yearGanji(y)[1];
      for (var i = 0; i < bases.length; i++) if (DOHWA[SAMHAP[bases[i]]] === b) { found = y; break; }
    }
    if (found !== null) out.dohwa = { year: found, ganji: C.yearGanji(found), now: found === y0,
      text: found === y0 ? '올해 도화가 들어와요. 새로운 인연이 눈에 띄고 매력이 잘 드러나는 해예요.'
        : found + '년에 도화가 들어와요. 인연이 들어오는 해라 그때 만남을 넓혀 보세요.' };
    return out;
  }

  /* ---------- 궁합 ---------- */
  var STEM_TEXT = {
    hap: { tag: '천간합', one: '처음부터 끌려요. 서로를 알아보는 인연이에요.', more: '일간끼리 합이 되는 가장 강한 끌림이에요. 같이 있으면 편하고 자연스럽게 한쪽이 다른 쪽에 맞춰져요. 너무 편해서 서로를 당연하게 여기지 않게 조심하세요.' },
    give: { tag: '내가 채워 줌', one: '내가 주는 쪽이에요. 챙겨 주고 키워 주는 사랑이에요.', more: '내 기운이 상대를 살려 줘요. 상대는 나와 있을 때 힘이 나요. 대신 주기만 하다 지치지 않게, 받고 싶은 것도 말해 주세요.' },
    take: { tag: '상대가 채워 줌', one: '상대가 나를 살려 줘요. 기대고 싶어지는 사람이에요.', more: '상대의 기운이 나를 키워 줘요. 같이 있으면 마음이 놓여요. 받는 만큼 고맙다는 표현을 자주 해 주세요.' },
    same: { tag: '같은 기운', one: '친구 같은 연인. 말 안 해도 통해요.', more: '같은 오행이라 생각과 속도가 비슷해요. 편하지만 둘 다 고집을 부리면 물러설 사람이 없어요. 역할을 나눠 두면 좋아요.' },
    press: { tag: '내가 이끎', one: '내가 이끄는 쪽이에요. 긴장감이 있는 끌림이에요.', more: '내 기운이 상대를 누르는 관계라 내가 주도권을 잡기 쉬워요. 상대가 눌린다고 느끼지 않게 결정권을 나눠 주세요.' },
    pressed: { tag: '상대가 이끎', one: '상대가 이끄는 쪽이에요. 자극이 되는 사람이에요.', more: '상대의 기운이 나를 다잡아 줘요. 나를 성장시키지만 가끔은 답답할 수 있어요. 불편한 건 쌓아 두지 말고 바로 말하세요.' }
  };
  var DAYBR_TEXT = {
    yukhap: { tag: '육합', one: '같이 살면 더 잘 맞아요.', more: '일지끼리 합이라 생활 리듬과 취향이 잘 맞아요. 함께 사는 일상이 편안한 조합이에요.' },
    samhap: { tag: '삼합', one: '같은 방향을 보는 사이예요.', more: '일지가 같은 무리에 속해 목표와 가치관이 비슷해요. 함께 무언가를 이뤄 가는 데 강해요.' },
    same: { tag: '같은 자리', one: '생활 방식이 닮았어요.', more: '일지가 같아 생활 습관이 비슷해요. 편하지만 서로의 단점도 똑같이 보여서 거울을 보는 느낌일 수 있어요.' },
    plain: { tag: '무난', one: '생활은 무난하게 맞춰 가요.', more: '일지끼리 특별한 합도 충도 없어요. 생활은 서로 맞춰 가는 만큼 맞아요. 집안일과 돈 관리 방식을 일찍 정해 두면 편해요.' },
    chung: { tag: '충', one: '생활 리듬이 부딪힐 수 있어요.', more: '일지끼리 충이라 생활 방식과 속도가 달라요. 끌림은 강하지만 같이 살면 사소한 일로 부딪히기 쉬워요. 각자의 공간과 시간을 지켜 주면 오래가요.' },
    wonjin: { tag: '원진', one: '이유 없이 서운한 순간이 생겨요.', more: '일지끼리 원진이라 좋다가도 괜히 서운해지는 때가 있어요. 오해는 그날 풀고 넘어가는 규칙을 만들어 두세요.' }
  };
  var ANIMAL_REL_TEXT = {
    samhap: '띠끼리 삼합이에요. 함께 있으면 운이 모이는 조합이에요.',
    yukhap: '띠끼리 육합이에요. 집안끼리도 잘 어울리는 조합이에요.',
    same: '같은 띠예요. 공감대가 크고 말이 잘 통해요.',
    plain: '띠끼리는 무난해요. 큰 걸림이 없어요.',
    chung: '띠끼리 충이에요. 서로 달라서 끌리지만 의견이 갈릴 때가 많아요.',
    wonjin: '띠끼리 원진이에요. 사소한 일로 마음이 상할 수 있으니 말을 아끼지 마세요.'
  };

  var SCORE = {
    stem: { hap: 18, give: 14, take: 14, same: 10, press: 6, pressed: 6 },
    day: { yukhap: 14, samhap: 12, same: 8, plain: 8, chung: 2, wonjin: 3 },
    year: { samhap: 10, yukhap: 10, same: 6, plain: 6, chung: 1, wonjin: 2 }
  };

  function compat(a, b) {
    var sa = a.dayStem, sb = b.dayStem;
    var rs = stemRel(sa, sb);
    var da = a.pillars[2].value[1], db = b.pillars[2].value[1];
    var rd = branchRel(da, db);
    var ry = a.yearBranch && b.yearBranch ? branchRel(a.yearBranch, b.yearBranch) : null;
    /* 서로 채워 주는 오행: 한쪽은 없고 다른 쪽은 2개 이상 */
    var fills = [];
    ELS.forEach(function (k) {
      if (a.elements[k] === 0 && b.elements[k] >= 2) fills.push({ el: k, to: 'me' });
      if (b.elements[k] === 0 && a.elements[k] >= 2) fills.push({ el: k, to: 'you' });
    });
    var score = 50 + SCORE.stem[rs] + SCORE.day[rd] + (ry ? SCORE.year[ry] : 6) + Math.min(6, fills.length * 3);
    score = Math.max(52, Math.min(98, score));
    var band = score >= 90 ? '찰떡궁합' : score >= 80 ? '잘 맞는 사이' : score >= 70 ? '맞춰 가면 좋은 사이' : '서로 달라서 끌리는 사이';
    var ELNAME = { 목: '목(나무)를', 화: '화(불)을', 토: '토(흙)을', 금: '금(쇠)를', 수: '수(물)을' };
    var fillText = fills.length
      ? fills.map(function (f) { return f.to === 'me' ? '나에게 없는 ' + ELNAME[f.el] + ' 상대가 채워 줘요.' : '상대에게 없는 ' + ELNAME[f.el] + ' 내가 채워 줘요.'; }).join(' ')
      : '서로 비어 있는 기운을 채워 주는 관계는 아니에요. 비슷한 점이 많아 편한 대신 새로운 자극은 적어요.';
    var cares = [];
    if (rd === 'chung' || rd === 'wonjin') cares.push(DAYBR_TEXT[rd].more);
    if (ry === 'chung' || ry === 'wonjin') cares.push('띠끼리 ' + (ry === 'chung' ? '충' : '원진') + '이라 집안 행사나 가족 일에서 의견이 갈리기 쉬워요.');
    if (rs === 'press' || rs === 'pressed') cares.push('한쪽이 계속 이끄는 관계예요. 큰 결정은 번갈아 정해 보세요.');
    if (!cares.length) cares.push('큰 걸림은 없어요. 편한 만큼 고마움을 말로 표현하는 걸 잊지 마세요.');
    return {
      score: score, band: band,
      rows: [
        { key: '끌림', sub: '일간 ' + sa + ' · ' + sb, tag: STEM_TEXT[rs].tag, one: STEM_TEXT[rs].one, more: STEM_TEXT[rs].more },
        { key: '생활', sub: '일지 ' + da + ' · ' + db, tag: DAYBR_TEXT[rd].tag, one: DAYBR_TEXT[rd].one, more: DAYBR_TEXT[rd].more },
        { key: '띠', sub: ry ? animal(a.yearBranch) + ' · ' + animal(b.yearBranch) : '', tag: ry ? { samhap: '삼합', yukhap: '육합', same: '같은 띠', plain: '무난', chung: '충', wonjin: '원진' }[ry] : '', one: ry ? ANIMAL_REL_TEXT[ry] : '', more: '' },
        { key: '채움', sub: '오행', tag: fills.length ? fills.length + '가지' : '없음', one: fillText, more: '' }
      ],
      cares: cares,
      styles: [LOVE_STYLE[sa].one, LOVE_STYLE[sb].one]
    };
  }

  root.SajuLove = { loveSelf: loveSelf, compat: compat, _stemRel: stemRel, _branchRel: branchRel, IMG: IMG };
})(typeof window !== 'undefined' ? window : globalThis);
