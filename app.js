/* ============================================================
   誰是菜英文 · Who's Bad at English?  —  app.js
   全部邏輯 + 資料都在這裡，方便組內閱讀與報告。
   ============================================================ */

/* ---------- 0. 安全的 localStorage（file:// 或隱私模式也不會壞）---------- */
const store = (() => {
  let ok = true;
  try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); }
  catch (e) { ok = false; }
  const mem = {};
  return {
    get(k){ try { return ok ? localStorage.getItem(k) : (mem[k] ?? null); } catch(e){ return mem[k] ?? null; } },
    set(k,v){ try { ok ? localStorage.setItem(k,v) : (mem[k]=v); } catch(e){ mem[k]=v; } },
    del(k){ try { ok ? localStorage.removeItem(k) : (delete mem[k]); } catch(e){ delete mem[k]; } }
  };
})();
const J = {
  get(k, fallback){ const v = store.get(k); if(v==null) return fallback; try{ return JSON.parse(v); }catch(e){ return fallback; } },
  set(k, obj){ store.set(k, JSON.stringify(obj)); }
};

/* ============================================================
   1. 多語系字串（中 / 英）
   ============================================================ */
const I18N = {
  zh: {
    brandSub:"Who's Bad at English? — 把「菜英文」變強的學習遊樂場",
    tabLogin:"登入", tabRegister:"註冊", username:"使用者名稱", password:"密碼",
    guestLogin:"以訪客身份逛逛 →",
    authNote:"＊此為前端教學示範，帳密僅存於你自己的瀏覽器（localStorage），請勿使用真實密碼。",
    navHome:"首頁", navQuiz:"測驗", navVocab:"單字卡", navArticles:"推薦文章", navMemes:"梗圖", logout:"登出",
    heroKicker:"SDG 4 · 優質教育",
    heroSub:"做測驗、收單字、看好文、集梗圖。把學英文變成一場好玩的收集遊戲。",
    exploreLabel:"四大區域",
    tileQuizTitle:"英文測驗", tileQuizDesc:"10 題填空挑戰，邊測邊收單字與梗圖",
    tileVocabTitle:"單字卡", tileVocabDesc:"一張一張複習你不會的單字（中英對照）",
    tileArtTitle:"推薦文章", tileArtDesc:"精選英文閱讀網站，依主題開啟新分頁",
    tileMemeTitle:"梗圖收集", tileMemeDesc:"依測驗結果發放梗圖，三種等級各 10 張",
    quizTitle:"英文填空測驗",
    quizIntro:"<b>10 題</b>單選填空，涵蓋字彙、文法、介系詞、片語、閱讀五大題型。看不懂的單字，<b>用滑鼠框選</b>就能存進單字卡；每題作答後馬上看到詳解，完成後系統會分析你的弱點並發放梗圖。",
    quizRuleBad:"答對 0–2 題 → 解鎖「菜英文」梗圖 🍜",
    quizRuleMid:"答對 3–7 題 → 解鎖「漸入佳境」梗圖 📈",
    quizRuleGood:"答對 8–10 題 → 解鎖「英文達人」梗圖 🏆",
    quizStart:"開始測驗", selectTip:"💡 提示：用滑鼠框選句子裡不會的單字 → 加入單字卡",
    prev:"上一題", next:"下一題", submit:"交卷！",
    vocabTitle:"我的單字卡", vocabLead:"測驗時框選存下來的單字會出現在這裡。點卡片可以翻面看中文意思。",
    vocabEmpty:"還沒有單字喔！去測驗區框選不會的單字吧。", goQuiz:"前往測驗",
    fcWord:"English", fcFlip:"點一下翻面 ↻", fcMeaning:"中文意思",
    markLearned:"✓ 已學會（移除）", shuffle:"🔀 洗牌", speakBtn:"🔊 朗讀",
    artTitle:"推薦文章", artLead:"選一個你有興趣的主題，點下方連結會在新分頁開啟我們精選的英文閱讀網站。", back:"‹ 回主題",
    memeTitle:"梗圖蒐集冊", memeLead:"完成測驗後，系統會依你的分數發放對應等級的梗圖。蒐集滿三種等級各 10 張就破關啦！",
    saveWord:"加入單字卡", newMeme:"🎉 新梗圖入手！", nice:"收下它！",
    // 動態
    heroPre:"嗨", heroPost:"，準備好不再是", heroBad:"菜英文", heroEnd:"了嗎？",
    statVocab:"已收單字", statMeme:"梗圖收集", statQuiz:"測驗次數", statBest:"最佳成績", statStreak:"連續學習天數",
    tileQuizStat:n=>`最佳 ${n}/10`, tileVocabStat:n=>`${n} 張單字`, tileArtStat:n=>`${n} 個主題`, tileMemeStat:n=>`${n}/30`,
    progress:n=>`${n} / 10`, qcounter:(a,b)=>`${a} / ${b}`,
    toastSaved:w=>`已加入單字卡：${w}`, toastDup:w=>`「${w}」已經在單字卡裡囉`,
    toastLearned:"已標記為學會 ✓", reviewTitle:"📋 詳解",
    correctIs:"正解", yourAns:"你的答案", noAns:"未作答",
    ansCorrect:"答對了！", ansWrong:"答錯了", ansCorrectIs:(a)=>`正解是 ${a}`,
    dictLoading:"查詢中…", dictFail:"一時查不到，建議自己查一下 🔍", speak:"朗讀",
    tierBadName:"菜英文無誤", tierMidName:"漸入佳境", tierGoodName:"英文小達人",
    tierBadMsg:"沒關係，每個高手都是從菜開始的！把框起來的單字背一背，下次一定進步 💪",
    tierMidMsg:"不錯喔，已經有一半的實力！再多練幾回就能晉級英文達人了 🚀",
    tierGoodMsg:"太強了，誰敢說你菜英文？你就是英文界的扛壩子 👑",
    scoreLabel:(s)=>`答對 <b>${s}</b> / 10 題`,
    retake:"再測一次", seeMemes:"查看我的梗圖", reviewBtn:"看詳解",
    needAnswer:"請先選一個答案！", awardGot:"恭喜解鎖一張新梗圖！", awardFull:"這個等級的梗圖已經全部收集完成 🎉",
    locked:"未解鎖", collectDone:"已收集完成！",
    badSub:"答對 0–2 題會掉這區的梗圖", midSub:"答對 3–7 題會掉這區的梗圖", goodSub:"答對 8–10 題會掉這區的梗圖",
    loginNeedFill:"請輸入帳號與密碼", userExists:"這個帳號已經有人用了", userNotFound:"帳號不存在，先去註冊吧", wrongPw:"密碼錯誤", regOk:"註冊成功！自動幫你登入 ✨",
    // 題型 / 測驗模式 / 學習分析
    navAnalytics:"學習分析",
    tileAnalyticsTitle:"學習分析", tileAnalyticsDesc:"幫你揪出最弱的題型，再針對弱點出練習題 — 個人化學習！",
    tileAnalyticsStat:(a)=> a==null ? "尚無資料" : `整體正確率 ${a}%`,
    quizModeRandom:"🎲 隨機挑戰 10 題", quizModeWeak:"🎯 練習我的弱點",
    quizModeBadgeRandom:"🎲 隨機題", quizModeBadgeWeak:"🎯 弱點加強",
    weakNeedFirst:"先做一次「隨機挑戰」，系統才知道你的弱點在哪喔！",
    weakReady:"已根據你的弱點客製這 10 題，加油！",
    resultPerf:"📊 本次各題型表現",
    resultReport:"📈 看完整學習報告",
    practiceWeak:"🎯 練習這些弱點",
    analyticsTitle:"我的學習報告", analyticsLead:"系統會記錄你每一次的作答，分析五大題型的強弱，並針對弱點出題。這就是個人化學習！",
    anEmpty:"還沒有資料！先去做一次測驗，這裡就會生成你的專屬學習報告 📊",
    anOverall:"整體正確率", anAnswered:"總作答題數", anAttempts:"測驗次數",
    anRadar:"🕸️ 能力雷達圖", anRadarNote:"離中心越遠代表該題型越強。",
    anBars:"📊 各題型正確率", anWeak:"🩹 弱點分析",
    anWeakNone:"目前五大題型都很均衡，繼續保持！👏",
    anWeakLead:(names)=>`你最需要加強的是 <b>${names}</b>。`,
    anHistory:"📈 進步軌跡", anHistoryNote:"每一條代表一次測驗的答對題數（滿分 10）。",
    catLabel:"題型", noData:"—",
    welcome:n=>`歡迎回來，${n}！`
  },
  en: {
    brandSub:"Master English the fun way — turn “bad English” into great English.",
    tabLogin:"Log in", tabRegister:"Sign up", username:"Username", password:"Password",
    guestLogin:"Continue as guest →",
    authNote:"* Front-end demo only. Your username/password is stored in your own browser (localStorage). Don't use a real password.",
    navHome:"Home", navQuiz:"Quiz", navVocab:"Cards", navArticles:"Articles", navMemes:"Memes", logout:"Log out",
    heroKicker:"SDG 4 · Quality Education",
    heroSub:"Take quizzes, collect words, read great articles, and gather memes. Learning English, gamified.",
    exploreLabel:"Four zones",
    tileQuizTitle:"English Quiz", tileQuizDesc:"10 fill-in-the-blank questions; collect words & memes",
    tileVocabTitle:"Flashcards", tileVocabDesc:"Review your saved words one by one (EN ↔ 中)",
    tileArtTitle:"Articles", tileArtDesc:"Hand-picked English reading sites by topic",
    tileMemeTitle:"Meme Collection", tileMemeDesc:"Earn memes by score — 10 in each of 3 tiers",
    quizTitle:"Fill-in-the-blank Quiz",
    quizIntro:"<b>10 questions</b>, covering vocabulary, grammar, prepositions, phrases and reading. See a word you don't know? <b>Select it with your mouse</b> to save it. You'll see the explanation right after each answer, and a weak-spot analysis plus a meme at the end.",
    quizRuleBad:"0–2 correct → unlock “Bad English” memes 🍜",
    quizRuleMid:"3–7 correct → unlock “Getting Better” memes 📈",
    quizRuleGood:"8–10 correct → unlock “English Pro” memes 🏆",
    quizStart:"Start quiz", selectTip:"💡 Tip: select any word in the sentence to add it to your flashcards.",
    prev:"Prev", next:"Next", submit:"Submit!",
    vocabTitle:"My Flashcards", vocabLead:"Words you saved during quizzes appear here. Tap a card to flip and see the meaning.",
    vocabEmpty:"No words yet! Go to the quiz and select words you don't know.", goQuiz:"Go to quiz",
    fcWord:"English", fcFlip:"tap to flip ↻", fcMeaning:"Meaning",
    markLearned:"✓ Learned (remove)", shuffle:"🔀 Shuffle", speakBtn:"🔊 Speak",
    artTitle:"Recommended Articles", artLead:"Pick a topic you like; links open our hand-picked English reading sites in a new tab.", back:"‹ Back",
    memeTitle:"Meme Collection Book", memeLead:"Finish a quiz and you'll earn a meme matching your score. Fill all 3 tiers (10 each) to 100%!",
    saveWord:"Add to cards", newMeme:"🎉 New meme unlocked!", nice:"Claim it!",
    heroPre:"Hey", heroPost:", ready to stop being", heroBad:"bad at English", heroEnd:"?",
    statVocab:"Words saved", statMeme:"Memes", statQuiz:"Quizzes taken", statBest:"Best score", statStreak:"Day streak",
    tileQuizStat:n=>`Best ${n}/10`, tileVocabStat:n=>`${n} cards`, tileArtStat:n=>`${n} topics`, tileMemeStat:n=>`${n}/30`,
    progress:n=>`${n} / 10`, qcounter:(a,b)=>`${a} / ${b}`,
    toastSaved:w=>`Saved to cards: ${w}`, toastDup:w=>`“${w}” is already in your cards`,
    toastLearned:"Marked as learned ✓", reviewTitle:"📋 Review",
    correctIs:"Correct", yourAns:"Your answer", noAns:"No answer",
    ansCorrect:"Correct!", ansWrong:"Not quite", ansCorrectIs:(a)=>`Answer: ${a}`,
    dictLoading:"Looking up…", dictFail:"Couldn't fetch it — look it up 🔍", speak:"Speak",
    tierBadName:"Officially Bad", tierMidName:"Getting Better", tierGoodName:"English Pro",
    tierBadMsg:"It's fine — every pro started here! Study the words you saved and you'll improve next time 💪",
    tierMidMsg:"Nice, you're halfway there! A few more rounds and you'll be an English Pro 🚀",
    tierGoodMsg:"Amazing! Who said you were bad at English? You're the boss now 👑",
    scoreLabel:(s)=>`You got <b>${s}</b> / 10`,
    retake:"Retake", seeMemes:"See my memes", reviewBtn:"Review answers",
    needAnswer:"Pick an answer first!", awardGot:"New meme unlocked!", awardFull:"You've collected every meme in this tier 🎉",
    locked:"Locked", collectDone:"Complete!",
    badSub:"Dropped when you get 0–2 correct", midSub:"Dropped when you get 3–7 correct", goodSub:"Dropped when you get 8–10 correct",
    loginNeedFill:"Enter a username and password", userExists:"That username is taken", userNotFound:"User not found — sign up first", wrongPw:"Wrong password", regOk:"Signed up! Logging you in ✨",
    navAnalytics:"Analytics",
    tileAnalyticsTitle:"Learning Analytics", tileAnalyticsDesc:"We find your weakest skill and drill it with targeted questions — personalized learning!",
    tileAnalyticsStat:(a)=> a==null ? "No data yet" : `${a}% overall`,
    quizModeRandom:"🎲 Random 10 questions", quizModeWeak:"🎯 Drill my weak spots",
    quizModeBadgeRandom:"🎲 Random", quizModeBadgeWeak:"🎯 Weak-spot drill",
    weakNeedFirst:"Take a Random quiz first so we can find your weak spots!",
    weakReady:"These 10 are tailored to your weak spots — good luck!",
    resultPerf:"📊 This round by skill",
    resultReport:"📈 See full report",
    practiceWeak:"🎯 Drill these weak spots",
    analyticsTitle:"My Learning Report", analyticsLead:"We log every answer you give, map your strengths and weaknesses across five skills, and drill the weak ones. That's personalized learning!",
    anEmpty:"No data yet! Take a quiz and your personal report will appear here 📊",
    anOverall:"Overall accuracy", anAnswered:"Questions answered", anAttempts:"Quizzes taken",
    anRadar:"🕸️ Skill radar", anRadarNote:"Further from the center = stronger in that skill.",
    anBars:"📊 Accuracy by skill", anWeak:"🩹 Weak-spot analysis",
    anWeakNone:"All five skills look balanced — keep it up! 👏",
    anWeakLead:(names)=>`Focus next on <b>${names}</b>.`,
    anHistory:"📈 Progress", anHistoryNote:"Each bar is one quiz score (out of 10).",
    catLabel:"Skill", noData:"—",
    welcome:n=>`Welcome back, ${n}!`
  }
};
let lang = store.get("cy_lang") || "zh";
const t = (k) => (I18N[lang][k] ?? I18N.zh[k] ?? k);

/* ============================================================
   2. 資料：題庫 / 單字字典 / 梗圖 / 文章主題
   ============================================================ */

/* 題型分類（每題都會貼一個 cat 標籤，用來做弱點分析）*/
const CATS = [
  { key:"vocab",   zh:"字彙",     en:"Vocabulary",   zhShort:"字彙",   enShort:"Vocab",   color:"#12A594",
    tip:{zh:"多累積單字量，善用「單字卡」反覆複習。", en:"Build your word bank and review with flashcards."} },
  { key:"grammar", zh:"文法",     en:"Grammar",      zhShort:"文法",   enShort:"Grammar", color:"#3D7BFF",
    tip:{zh:"特別注意時態、單複數一致與冠詞 a/an/the。", en:"Watch verb tense, subject–verb agreement and articles."} },
  { key:"prep",    zh:"介系詞",   en:"Prepositions", zhShort:"介系詞", enShort:"Prep",    color:"#FF5A4D",
    tip:{zh:"介系詞最好整組片語一起記，不要單背。", en:"Learn prepositions inside whole phrases, not alone."} },
  { key:"phrase",  zh:"片語搭配", en:"Phrases",      zhShort:"片語",   enShort:"Phrase",  color:"#E0A100",
    tip:{zh:"把動詞片語 (take action, give up…) 當一個單位背。", en:"Memorize phrasal verbs as a single chunk."} },
  { key:"reading", zh:"閱讀理解", en:"Reading",      zhShort:"閱讀",   enShort:"Reading", color:"#FF8FB1",
    tip:{zh:"靠上下文與連接詞 (although, as a result…) 推測語意。", en:"Use context and linking words to infer meaning."} }
];
const CAT_KEYS = CATS.map(c => c.key);
const CAT = Object.fromEntries(CATS.map(c => [c.key, c]));
const catName  = k => (lang === "en" ? CAT[k].en : CAT[k].zh);
const catShort = k => (lang === "en" ? CAT[k].enShort : CAT[k].zhShort);
const catColor = k => CAT[k].color;
const catDot   = k => `<span class="cat-dot" style="background:${CAT[k].color}"></span>`;

/* 題庫（45 題，5 類題型 × 9 題；主題全部圍繞 SDG 永續議題）。
   每次測驗從題庫隨機抽 10 題；弱點模式則依分析結果加重抽弱項。 */
const QUESTIONS = [
  /* ---------- 字彙 vocab ---------- */
  { cat:"vocab", q:"We should use ___ energy like solar and wind to protect the planet.",
    options:["renewable","expensive","heavy","loud"], answer:0,
    explain:{zh:"renewable = 可再生的。太陽能、風能屬於再生能源。\n📚 字根：re-（再次）+ new（新）+ -able（可以…的）；形容詞放在名詞 energy 前修飾。", en:"renewable = able to be replaced naturally, like solar and wind.\n📚 Word parts: re- (again) + new + -able (capable of). It's an adjective modifying the noun 'energy'."} },
  { cat:"vocab", q:"Reducing ___ helps make sure everyone has enough food and shelter.",
    options:["poverty","poetry","pottery","property"], answer:0,
    explain:{zh:"poverty = 貧窮。SDG 1 的目標就是終結貧窮。\n📚 提醒：poverty 是不可數名詞；別和 poetry（詩）、property（財產）拼錯。動名詞 Reducing 當主詞。", en:"poverty = the state of being poor; SDG 1 aims to end it.\n📚 Note: 'poverty' is uncountable; don't mix it up with poetry or property. The gerund 'Reducing' is the subject."} },
  { cat:"vocab", q:"Quality ___ gives children the skills they need for the future.",
    options:["decoration","vacation","education","celebration"], answer:2,
    explain:{zh:"education = 教育。本網站響應的正是 SDG 4 優質教育！\n📚 字尾：-tion 把動詞變名詞，educate → education；Quality education 是名詞片語當主詞。", en:"education = teaching and learning; this site supports SDG 4!\n📚 Suffix: '-tion' turns a verb into a noun (educate → education). 'Quality education' is a noun phrase acting as the subject."} },
  { cat:"vocab", q:"Air ___ from cars and factories is bad for our health.",
    options:["solution","collection","population","pollution"], answer:3,
    explain:{zh:"pollution = 污染。\n📚 字尾：pollute（動詞）+ -tion → pollution（名詞）。from cars and factories 是介系詞片語，修飾前面的 Air pollution。", en:"pollution = harmful substances in the air, water, or land.\n📚 Suffix: pollute (verb) + -tion → pollution (noun). 'from cars and factories' is a prepositional phrase modifying 'Air pollution'."} },
  { cat:"vocab", q:"Clean water and good ___ keep communities healthy.",
    options:["station","sanitation","situation","salvation"], answer:1,
    explain:{zh:"sanitation = 衛生設施（如乾淨廁所）。SDG 6。\n📚 文法：and 連接兩個主詞（Clean water and good sanitation），動詞用複數 keep。拉丁語根 sanit-（健康/清潔）+ -ation。", en:"sanitation = clean conditions, like safe toilets and drainage. SDG 6.\n📚 Grammar: a compound subject (water AND sanitation) takes the plural verb 'keep'. Latin root sanit- (clean/healthy) + -ation."} },
  { cat:"vocab", q:"Gender ___ means men and women have the same rights.",
    options:["quality","equality","quantity","equally"], answer:1,
    explain:{zh:"equality = 平等。gender equality 性別平等是 SDG 5。\n📚 字尾：equal（形容詞）+ -ity（名詞字尾）= equality。和 quality（品質）只差一個 e，別拼錯！", en:"equality = the state of being equal in rights; gender equality is SDG 5.\n📚 Suffix: equal (adj) + -ity = equality. It differs from 'quality' by just one letter!"} },
  { cat:"vocab", q:"Protecting ___ means protecting the huge variety of life on Earth.",
    options:["biology","biodiversity","bilingual","binary"], answer:1,
    explain:{zh:"biodiversity = 生物多樣性。\n📚 字根：bio-（生命）+ diversity（多樣性）。其他選項 biology（生物學）、bilingual（雙語）、binary（二進位）也含 bi-/bio-，但意思不同。", en:"biodiversity = the variety of living things in an area.\n📚 Roots: bio- (life) + diversity. Compare biology, bilingual, binary — same bi-/bio- start, very different meanings."} },
  { cat:"vocab", q:"After months with no rain, the ___ destroyed the farmers' crops.",
    options:["drought","delight","doubt","draft"], answer:0,
    explain:{zh:"drought = 乾旱（長期不下雨）。\n📚 提醒：drought 唸 /draʊt/，gh 不發音；別和 doubt（懷疑）、draft（草稿）搞混。", en:"drought = a long period with little or no rain.\n📚 Note: 'gh' is silent (/draʊt/). Don't confuse it with 'doubt' or 'draft'."} },
  { cat:"vocab", q:"Please ___ your plastic bottles instead of throwing them away.",
    options:["destroy","recycle","waste","ignore"], answer:1,
    explain:{zh:"recycle = 回收再利用。\n📚 文法：祈使句（Please + 動詞原形）。re-（再次）+ cycle（循環）；instead of 後面接動名詞 throwing。", en:"recycle = to use materials again instead of trashing them.\n📚 Grammar: imperative (Please + base verb). re- (again) + cycle. 'instead of' is followed by a gerund (throwing)."} },

  /* ---------- 文法 grammar ---------- */
  { cat:"grammar", q:"Each of us ___ a part to play in protecting the planet.",
    options:["have","has","having","to have"], answer:1,
    explain:{zh:"答案 has。\n📚 文法：each of us 雖然指很多人，但 each 視為單數，第三人稱動詞用 has。", en:"Answer: has.\n📚 Grammar: 'each of us' takes a singular verb — 'each' is treated as singular, so use 'has'."} },
  { cat:"grammar", q:"Yesterday we ___ trees in the school garden.",
    options:["plant","plants","planted","planting"], answer:2,
    explain:{zh:"答案 planted。\n📚 文法：時間副詞 Yesterday 表過去，用過去式；規則動詞加 -ed（plant → planted）。", en:"Answer: planted.\n📚 Grammar: 'Yesterday' marks past time, so use the past tense; regular verbs add -ed (plant → planted)."} },
  { cat:"grammar", q:"Solar power is much ___ than it was ten years ago.",
    options:["cheap","cheaper","cheapest","more cheap"], answer:1,
    explain:{zh:"答案 cheaper。\n📚 文法：兩者比較用比較級；短形容詞直接加 -er（cheap → cheaper），不可說 more cheap。", en:"Answer: cheaper.\n📚 Grammar: comparing two things uses the comparative. Short adjectives add -er (cheap → cheaper), never 'more cheap'."} },
  { cat:"grammar", q:"The Earth ___ around the Sun once a year.",
    options:["spin","spins","spun","spinning"], answer:1,
    explain:{zh:"答案 spins。\n📚 文法：科學事實/習慣用現在簡單式；主詞 The Earth 是第三人稱單數，動詞加 -s。", en:"Answer: spins.\n📚 Grammar: scientific facts use the present simple; a third-person singular subject (The Earth) adds -s."} },
  { cat:"grammar", q:"Plastic waste ___ been a huge problem for our oceans.",
    options:["have","has","is","are"], answer:1,
    explain:{zh:"答案 has。\n📚 文法：現在完成式 has/have been；waste 在這是不可數名詞，視為單數，用 has。", en:"Answer: has.\n📚 Grammar: present perfect (has/have been). 'Waste' here is uncountable (singular), so 'has'."} },
  { cat:"grammar", q:"We need ___ honest conversation about climate change.",
    options:["a","an","the","(no word)"], answer:1,
    explain:{zh:"答案 an。\n📚 文法：a/an 看「發音」不是看字母。honest 的 h 不發音，開頭是母音 /ɒ/，所以用 an。", en:"Answer: an.\n📚 Grammar: a/an depends on sound, not spelling. 'honest' has a silent h and starts with a vowel sound, so use 'an'."} },
  { cat:"grammar", q:"If we ___ now, we can still save the planet.",
    options:["act","acted","will act","acting"], answer:0,
    explain:{zh:"答案 act。\n📚 文法：第一條件句 if + 現在簡單式, ... can + 原形動詞；if 子句不用未來式。", en:"Answer: act.\n📚 Grammar: first conditional — 'if' + present simple, then 'can' + base verb. The if-clause doesn't use 'will'."} },
  { cat:"grammar", q:"The number of electric cars ___ growing every year.",
    options:["are","is","have","were"], answer:1,
    explain:{zh:"答案 is。\n📚 文法：the number of...（…的數量）視為單數，用 is；對比 a number of...（許多）才用複數。", en:"Answer: is.\n📚 Grammar: 'the number of...' is singular (use 'is'). Compare 'a number of...' (= many), which is plural."} },
  { cat:"grammar", q:"By 2050, many cities ___ powered by clean energy.",
    options:["are","were","will be","being"], answer:2,
    explain:{zh:"答案 will be。\n📚 文法：By 2050 指向未來，用未來式；這裡是被動 will be powered（被…供電）。", en:"Answer: will be.\n📚 Grammar: 'By 2050' points to the future. This is passive: 'will be powered'."} },

  /* ---------- 介系詞 prep ---------- */
  { cat:"prep", q:"Turn ___ the lights when you leave a room to save energy.",
    options:["off","in","at","for"], answer:0,
    explain:{zh:"turn off = 關掉（電器/燈）。\n📚 用法：可分離片語動詞，受詞是名詞時可說 turn off the lights 或 turn the lights off。", en:"turn off = to switch something off.\n📚 Usage: a separable phrasal verb — say 'turn off the lights' or 'turn the lights off'."} },
  { cat:"prep", q:"Millions of people still live ___ the poverty line.",
    options:["under","below","on","over"], answer:1,
    explain:{zh:"below the poverty line = 在貧窮線以下（固定說法）。\n📚 比較：under 多指正下方、被覆蓋；below 指水平/標準之下，這裡指數值低於某條線。", en:"'below the poverty line' is the fixed phrase.\n📚 Compare: 'under' = directly beneath/covered; 'below' = lower than a level or line."} },
  { cat:"prep", q:"A healthy future depends ___ healthy oceans.",
    options:["of","on","to","for"], answer:1,
    explain:{zh:"depend on = 依賴、取決於（固定搭配）。\n📚 提醒：depend 後面固定接 on，不可用 depend of / depend to。", en:"depend on = to rely on.\n📚 Note: 'depend' is always followed by 'on' — never 'of' or 'to'."} },
  { cat:"prep", q:"Recycling is good ___ the environment.",
    options:["to","at","for","of"], answer:2,
    explain:{zh:"be good for = 對…有益。\n📚 比較：good for（對…有益）≠ good at（擅長某事）。", en:"'good for' = beneficial to.\n📚 Compare: 'good for' (beneficial to) vs 'good at' (skilled at)."} },
  { cat:"prep", q:"We should care ___ future generations.",
    options:["about","of","at","to"], answer:0,
    explain:{zh:"care about = 在乎、關心。\n📚 比較：care about（在意某事）≠ care for（照顧／喜歡）。", en:"care about = to feel concern for.\n📚 Compare: 'care about' (be concerned) vs 'care for' (look after / like)."} },
  { cat:"prep", q:"The average temperature has risen ___ about one degree.",
    options:["in","by","at","of"], answer:1,
    explain:{zh:"rise by + 數量 = 上升了多少（變化幅度）。\n📚 比較：rise to 是上升「到」某數值；rise by 是上升「了」多少。", en:"'rise by' shows the amount of increase.\n📚 Compare: 'rise to' = up to a value; 'rise by' = increased by an amount."} },
  { cat:"prep", q:"Many ocean species are ___ danger of extinction.",
    options:["on","at","in","by"], answer:2,
    explain:{zh:"in danger of = 有…的危險（固定片語）。\n📚 搭配：in danger of + 名詞/動名詞，如 in danger of extinction（瀕臨滅絕）。", en:"'in danger of' = at risk of.\n📚 Pattern: in danger of + noun/gerund, e.g. 'in danger of extinction'."} },
  { cat:"prep", q:"Let's work together ___ a cleaner, fairer world.",
    options:["for","in","at","of"], answer:0,
    explain:{zh:"work for a goal = 為某目標努力。\n📚 比較：work for（為…而努力／受僱於）；work on（致力於某件工作）。", en:"'work for' a goal = to strive toward it.\n📚 Compare: 'work for' (strive toward / be employed by) vs 'work on' (focus on a task)."} },
  { cat:"prep", q:"Solar panels turn sunlight ___ electricity.",
    options:["into","in","at","for"], answer:0,
    explain:{zh:"turn A into B = 把 A 轉變成 B。\n📚 提醒：表「轉變成」用 into，不是 in；同類還有 change/translate ... into。", en:"'turn A into B' = to change A into B.\n📚 Note: use 'into' (not 'in') for transformation; also change/translate ... into."} },

  /* ---------- 片語搭配 phrase ---------- */
  { cat:"phrase", q:"It's time to ___ action against climate change.",
    options:["take","make","do","have"], answer:0,
    explain:{zh:"take action = 採取行動（固定搭配）。\n📚 提醒：action 搭配動詞 take，不說 make action / do action。", en:"'take action' is the set collocation.\n📚 Note: 'action' goes with 'take' — not 'make' or 'do'."} },
  { cat:"phrase", q:"Don't ___ up — small steps still make a difference.",
    options:["give","take","put","get"], answer:0,
    explain:{zh:"give up = 放棄。\n📚 用法：片語動詞 give up（停止嘗試）；比較 give in（屈服）、give out（發放／耗盡）。", en:"give up = to stop trying.\n📚 Usage: phrasal verb; compare give in (surrender) and give out (distribute / run out)."} },
  { cat:"phrase", q:"The world is quickly ___ out of clean fresh water.",
    options:["running","going","taking","making"], answer:0,
    explain:{zh:"run out of = 用完、耗盡（資源）。\n📚 文法：is running 為現在進行式，表示正在快速耗盡。", en:"run out of = to use up your supply.\n📚 Grammar: 'is running' (present continuous) shows it's happening right now."} },
  { cat:"phrase", q:"Riding a bike helps ___ your carbon footprint.",
    options:["reduce","grow","raise","build"], answer:0,
    explain:{zh:"reduce = 減少；carbon footprint = 碳足跡。\n📚 搭配：reduce / cut / lower one's carbon footprint 都可表「減少碳排」。", en:"reduce = to make smaller; 'carbon footprint' = your CO₂ impact.\n📚 Collocation: reduce / cut / lower your carbon footprint."} },
  { cat:"phrase", q:"Everyone can ___ a difference just by saving water.",
    options:["make","do","take","get"], answer:0,
    explain:{zh:"make a difference = 帶來改變、產生影響（固定搭配）。\n📚 提醒：difference 搭配 make，不說 do a difference。", en:"'make a difference' is the set phrase.\n📚 Note: 'a difference' goes with 'make' — not 'do'."} },
  { cat:"phrase", q:"We must ___ after our planet for future generations.",
    options:["look","see","watch","view"], answer:0,
    explain:{zh:"look after = 照顧。\n📚 比較：look after（照顧）、look for（尋找）、look up（查詢）——同一個 look，介系詞不同意思就不同。", en:"look after = to take care of.\n📚 Compare: look after (care for), look for (search), look up (check) — same verb, different particle."} },
  { cat:"phrase", q:"Clean energy is really ___ on around the world right now.",
    options:["catching","taking","running","going"], answer:0,
    explain:{zh:"catch on = 開始流行、被廣泛接受。\n📚 文法：is catching on 現在進行式，描述正在興起的趨勢。", en:"catch on = to become popular.\n📚 Grammar: 'is catching on' (present continuous) describes a rising trend."} },
  { cat:"phrase", q:"Let's ___ down on single-use plastic this year.",
    options:["cut","put","take","turn"], answer:0,
    explain:{zh:"cut down on = 減少（某事物的使用量）。\n📚 比較：cut down on（減少用量）≈ reduce；cut off 則是「切斷」。", en:"cut down on = to use less of something.\n📚 Compare: 'cut down on' ≈ reduce; 'cut off' = to disconnect."} },
  { cat:"phrase", q:"It is up to all of us to ___ care of the environment.",
    options:["take","make","do","give"], answer:0,
    explain:{zh:"take care of = 照料、負責處理。\n📚 搭配：care of 搭配 take；意思和 look after 接近。", en:"take care of = to look after / handle.\n📚 Collocation: 'care of' goes with 'take'; similar to 'look after'."} },

  /* ---------- 閱讀理解 reading ---------- */
  { cat:"reading", q:"\"The report warns that coral reefs are dying fast.\" Here, 'warns' shows the news is ___.",
    options:["funny","serious","boring","fake"], answer:1,
    explain:{zh:"warn = 警告，代表這是嚴肅、需要注意的消息。\n📚 閱讀技巧：靠關鍵動詞判斷語氣——warn 帶有提醒危險的口吻。", en:"'warn' signals a serious message.\n📚 Reading tip: use the key verb to judge tone — 'warn' implies danger or urgency."} },
  { cat:"reading", q:"\"Solar panels are now affordable, so more families can buy them.\" 'Affordable' means ___.",
    options:["too expensive","cheap enough","very rare","hard to use"], answer:1,
    explain:{zh:"affordable = 負擔得起的，也就是「夠便宜」。\n📚 字根：afford（負擔得起）+ -able（能…的）；so 引導結果（所以更多人買得起）。", en:"affordable = cheap enough to buy.\n📚 Word parts: afford + -able; 'so' introduces the result (more families can buy them)."} },
  { cat:"reading", q:"\"She is passionate about recycling and never wastes a bottle.\" 'Passionate' shows she ___ recycling.",
    options:["dislikes","strongly cares about","forgets","fears"], answer:1,
    explain:{zh:"passionate = 充滿熱情的，代表非常在乎。\n📚 閱讀技巧：後半句 never wastes a bottle 是線索，印證她很重視回收。", en:"passionate = caring very strongly.\n📚 Reading tip: the clue 'never wastes a bottle' confirms how much she cares."} },
  { cat:"reading", q:"\"Although the city is crowded, its parks give people room to breathe.\" 'Although' signals a ___.",
    options:["contrast","reason","result","time"], answer:0,
    explain:{zh:"although = 雖然，引導對比/轉折。\n📚 閱讀技巧：看到 although / though / but，就預期前後語意相反（擁擠 vs 有喘息空間）。", en:"'Although' introduces a contrast.\n📚 Reading tip: although / though / but signal opposite ideas (crowded vs room to breathe)."} },
  { cat:"reading", q:"\"If we waste water today, future generations will suffer.\" This sentence is mainly a ___.",
    options:["warning","joke","recipe","greeting"], answer:0,
    explain:{zh:"這句在提醒未來可能的後果，屬於警告。\n📚 閱讀技巧：if + 現在式, ... will + 原形（第一條件句）常用來預告後果。", en:"It warns of a future consequence.\n📚 Reading tip: 'if + present, ... will' (first conditional) often forecasts a result."} },
  { cat:"reading", q:"\"Volunteers cleaned the beach, and as a result the turtles returned.\" 'As a result' introduces a ___.",
    options:["cause","result","question","contrast"], answer:1,
    explain:{zh:"as a result = 結果，引導前因造成的結果。\n📚 閱讀技巧：as a result / so / therefore 都是「結果」的訊號詞。", en:"'As a result' introduces an effect/result.\n📚 Reading tip: as a result / so / therefore all signal a result."} },
  { cat:"reading", q:"\"The new policy aims to cut pollution by half.\" 'Aims to' tells us the policy's ___.",
    options:["goal","failure","history","price"], answer:0,
    explain:{zh:"aim to = 目標是，描述目的。\n📚 閱讀技巧：aim to / in order to / so as to 都在說明「目的」。", en:"'aim to' states the goal.\n📚 Reading tip: aim to / in order to / so as to all express purpose."} },
  { cat:"reading", q:"\"Electric buses are quiet and clean, unlike old diesel ones.\" 'Unlike' tells us the two are ___.",
    options:["the same","different","broken","new"], answer:1,
    explain:{zh:"unlike = 不像，表示兩者不同。\n📚 閱讀技巧：unlike 是對比訊號（電動公車 vs 老柴油車）；對比的另一面通常是相反特性。", en:"'Unlike' shows the two are different.\n📚 Reading tip: 'unlike' is a contrast signal (electric vs old diesel buses)."} },
  { cat:"reading", q:"\"Tiny actions, such as turning off a tap, add up over time.\" 'Such as' is used to give an ___.",
    options:["example","opinion","order","excuse"], answer:0,
    explain:{zh:"such as = 例如，用來舉例。\n📚 閱讀技巧：such as / for example / like 後面接的是例子，幫你理解前面的概念。", en:"'Such as' introduces an example.\n📚 Reading tip: such as / for example / like are followed by examples that clarify the idea."} }
];
/* 給每題一個穩定 id（弱點分析會用到，記錄每題的答對率）*/
QUESTIONS.forEach((q, i) => { q.id = "q" + i; });

/* 單字字典：框選到的單字會在這裡查中文意思 */
const DICT = {
  renewable:"可再生的", expensive:"昂貴的", heavy:"重的", loud:"大聲的、吵的",
  poverty:"貧窮", poetry:"詩（作品）", pottery:"陶器", property:"財產；性質",
  destroy:"破壞、摧毀", recycle:"回收再利用", waste:"浪費；廢棄物", ignore:"忽視",
  decoration:"裝飾", vacation:"假期", education:"教育", celebration:"慶祝",
  change:"改變、變化", chance:"機會", cheese:"起司", charge:"收費；充電",
  spill:"灑出、溢出", conserve:"節約、保護", pour:"倒、傾倒",
  quality:"品質", equality:"平等", quantity:"數量", equally:"平等地、同樣地",
  solution:"解決方法；溶液", collection:"收集、收藏", population:"人口", pollution:"污染",
  sustainable:"永續的、可持續的", suitable:"適合的", sensible:"明智的", valuable:"有價值的",
  station:"車站", sanitation:"衛生設施", situation:"情況、處境", salvation:"拯救、救贖",
  energy:"能源；活力", solar:"太陽的、太陽能的", wind:"風", planet:"行星；地球",
  protect:"保護", reduce:"減少", shelter:"庇護所、遮蔽", plastic:"塑膠（的）",
  bottle:"瓶子", children:"孩子們", skills:"技能", future:"未來",
  climate:"氣候", problem:"問題", world:"世界", water:"水",
  limited:"有限的", resource:"資源", gender:"性別", rights:"權利",
  factory:"工廠", factories:"工廠（複數）", community:"社區", communities:"社區（複數）",
  healthy:"健康的", health:"健康", environment:"環境", throw:"丟、投擲",
  enough:"足夠的", everyone:"每個人", instead:"取而代之", away:"離開、走開",
  // 新題庫新增的字
  biodiversity:"生物多樣性", biology:"生物學", bilingual:"雙語的", binary:"二進位的；二元的",
  drought:"乾旱", delight:"喜悅、樂事", doubt:"懷疑", draft:"草稿；徵兵；氣流",
  spin:"旋轉", spins:"旋轉（第三人稱）", spun:"旋轉（過去式）",
  cheaper:"比較便宜的", cheapest:"最便宜的", cheap:"便宜的",
  honest:"誠實的", conversation:"對話、交談", act:"行動；演出", acted:"行動（過去式）",
  electric:"電動的", electricity:"電", powered:"以…為動力的", panels:"板子（複數）", panel:"板子；面板",
  affordable:"負擔得起的", passionate:"有熱情的", crowded:"擁擠的", contrast:"對比",
  warning:"警告", policy:"政策", diesel:"柴油", volunteers:"志工（複數）", volunteer:"志工；自願",
  turtles:"海龜（複數）", turtle:"海龜", species:"物種", extinction:"滅絕", generations:"世代（複數）", generation:"世代",
  footprint:"足跡（如碳足跡）", carbon:"碳", reduce:"減少", oceans:"海洋（複數）", ocean:"海洋",
  temperature:"溫度", degree:"度；學位", risen:"上升（過去分詞）", line:"線；界線",
  coral:"珊瑚", reef:"礁", reefs:"礁（複數）", suffer:"受苦、受害",
  although:"雖然", result:"結果", reason:"原因", example:"例子", goal:"目標", different:"不同的",
  tiny:"微小的", actions:"行動（複數）", tap:"水龍頭；輕拍", breathe:"呼吸",
  take:"拿；採取", make:"製作；使", give:"給予", look:"看；尋找", cut:"切；削減",
  sunlight:"陽光", planet:"行星；地球", crops:"農作物（複數）", farmers:"農夫（複數）",

  /* ---- 常用字（讓多數框選的單字都能離線即時翻譯）---- */
  // be 動詞 / 助動詞 / 情態
  be:"是；存在", am:"是", is:"是", are:"是", was:"是（過去）", were:"是（過去複數）", been:"是（過去分詞）", being:"存在；正在",
  have:"有；擁有", has:"有（第三人稱）", had:"有（過去）", do:"做", does:"做（第三人稱）", did:"做（過去）", done:"做（過去分詞）",
  will:"將會", would:"將會（語氣/過去）", can:"能夠", could:"能夠（語氣/過去）", shall:"將", should:"應該", may:"可以；也許", might:"也許", must:"必須",
  // 常用動詞
  go:"去", goes:"去（第三人稱）", went:"去（過去）", gone:"去（過去分詞）", come:"來", came:"來（過去）",
  get:"得到；變得", got:"得到（過去）", see:"看見", saw:"看見（過去）", seen:"看見（過去分詞）",
  know:"知道", knew:"知道（過去）", known:"知道（過去分詞）", think:"想；認為", thought:"想（過去）",
  want:"想要", need:"需要", like:"喜歡", love:"愛", hate:"討厭", find:"找到", found:"找到（過去）",
  feel:"感覺", felt:"感覺（過去）", become:"變成", became:"變成（過去）", leave:"離開", left:"離開（過去）；左邊",
  put:"放", mean:"意思是；卑鄙的", meant:"意思是（過去）", keep:"保持", kept:"保持（過去）", let:"讓",
  begin:"開始", began:"開始（過去）", start:"開始", stop:"停止", help:"幫助", talk:"談話",
  speak:"說", spoke:"說（過去）", spoken:"說（過去分詞）", tell:"告訴", told:"告訴（過去）",
  ask:"問", work:"工作", play:"玩；播放", run:"跑；經營", ran:"跑（過去）", walk:"走路",
  move:"移動", live:"居住；活著", believe:"相信", bring:"帶來", brought:"帶來（過去）",
  happen:"發生", write:"寫", wrote:"寫（過去）", written:"寫（過去分詞）", read:"閱讀",
  sit:"坐", sat:"坐（過去）", stand:"站；忍受", stood:"站（過去）", lose:"失去；輸", lost:"失去（過去）",
  pay:"付錢", paid:"付錢（過去）", meet:"見面", met:"見面（過去）", include:"包含", continue:"繼續",
  set:"設定；一組", learn:"學習", learned:"學習（過去）", understand:"理解", understood:"理解（過去）",
  watch:"觀看；手錶", follow:"跟隨", create:"創造", open:"打開", close:"關閉；接近的",
  win:"贏", won:"贏（過去）", buy:"買", bought:"買（過去）", send:"寄送", sent:"寄送（過去）",
  build:"建造", built:"建造（過去）", spend:"花費", spent:"花費（過去）", grow:"成長", grew:"成長（過去）",
  hold:"握住；舉行", held:"握住（過去）", fall:"落下；秋天", fell:"落下（過去）", eat:"吃", ate:"吃（過去）", eaten:"吃（過去分詞）",
  drink:"喝", drank:"喝（過去）", drive:"開車", drove:"開車（過去）", choose:"選擇", chose:"選擇（過去）",
  wear:"穿戴", wore:"穿戴（過去）", broke:"打破（過去）", teach:"教", taught:"教（過去）",
  catch:"抓住", caught:"抓住（過去）", fly:"飛", flew:"飛（過去）", draw:"畫；拉", drew:"畫（過去）",
  show:"展示", showed:"展示（過去）", hear:"聽見", heard:"聽見（過去）", save:"拯救；儲存",
  carry:"攜帶", carried:"攜帶（過去）", decide:"決定", hope:"希望", wish:"願望", try:"嘗試", tried:"嘗試（過去）",
  use:"使用", used:"使用（過去）；習慣於", call:"打電話；稱呼", turn:"轉動；輪到", join:"加入", share:"分享",
  // 常用形容詞
  good:"好的", bad:"壞的", big:"大的", small:"小的", large:"大的", little:"小的；少的", long:"長的", short:"短的；矮的",
  high:"高的", low:"低的", old:"老的；舊的", young:"年輕的", new:"新的", hot:"熱的", cold:"冷的", warm:"溫暖的", cool:"涼的；酷的",
  fast:"快的", slow:"慢的", easy:"容易的", hard:"困難的；硬的", difficult:"困難的", simple:"簡單的",
  important:"重要的", beautiful:"美麗的", happy:"快樂的", sad:"傷心的", angry:"生氣的", tired:"疲倦的",
  hungry:"飢餓的", rich:"富有的", poor:"貧窮的；可憐的", strong:"強壯的", weak:"虛弱的", clean:"乾淨的", dirty:"骯髒的",
  full:"滿的", empty:"空的", dark:"黑暗的", light:"光；輕的", bright:"明亮的", soft:"柔軟的", dry:"乾的", wet:"濕的",
  safe:"安全的", dangerous:"危險的", free:"自由的；免費的", busy:"忙碌的", quiet:"安靜的",
  ready:"準備好的", true:"真的", false:"假的", real:"真實的", same:"相同的", clear:"清楚的", famous:"有名的",
  // 常用名詞
  time:"時間", year:"年", day:"天；白天", week:"星期", month:"月", hour:"小時", minute:"分鐘",
  morning:"早上", afternoon:"下午", evening:"傍晚", night:"夜晚", today:"今天", tomorrow:"明天", yesterday:"昨天",
  man:"男人", woman:"女人", child:"小孩", people:"人們", person:"人", friend:"朋友", family:"家庭",
  mother:"母親", father:"父親", parent:"父母（一方）", parents:"父母", brother:"兄弟", sister:"姊妹",
  teacher:"老師", student:"學生", school:"學校", book:"書", word:"單字；話語", name:"名字", language:"語言",
  country:"國家", city:"城市", town:"城鎮", street:"街道", road:"道路", house:"房子", home:"家", room:"房間",
  food:"食物", meal:"一餐", breakfast:"早餐", lunch:"午餐", dinner:"晚餐", fruit:"水果", vegetable:"蔬菜",
  money:"金錢", job:"工作", business:"生意；商業", company:"公司", government:"政府", market:"市場", store:"商店",
  hospital:"醫院", doctor:"醫生", animal:"動物", dog:"狗", cat:"貓", bird:"鳥", fish:"魚",
  tree:"樹", flower:"花", sky:"天空", sun:"太陽", moon:"月亮", star:"星星", sea:"海", river:"河",
  lake:"湖", mountain:"山", forest:"森林", rain:"雨", snow:"雪", weather:"天氣", color:"顏色",
  music:"音樂", song:"歌曲", movie:"電影", game:"遊戲", sport:"運動", car:"汽車", bus:"公車", train:"火車",
  phone:"電話", computer:"電腦", internet:"網際網路", news:"新聞", story:"故事", picture:"圖片",
  idea:"點子；想法", question:"問題", answer:"答案", way:"方法；路", thing:"東西；事情", place:"地方",
  part:"部分", number:"數字", letter:"字母；信", point:"點；重點",
  // 常用連接詞 / 介系詞 / 副詞
  and:"和", or:"或", but:"但是", because:"因為", so:"所以；如此", if:"如果", when:"當…時", while:"當…時；然而",
  before:"在…之前", after:"在…之後", during:"在…期間", until:"直到", since:"自從；既然",
  about:"關於；大約", above:"在…上方", below:"在…下方", under:"在…下面", over:"在…上方；超過",
  between:"在…之間", through:"穿過", around:"周圍；大約", near:"靠近", here:"這裡", there:"那裡",
  where:"哪裡", why:"為什麼", how:"如何", what:"什麼", who:"誰", which:"哪一個",
  this:"這個", that:"那個", these:"這些", those:"那些", some:"一些", any:"任何", all:"全部", many:"許多", much:"許多",
  few:"很少", more:"更多", most:"最多；大部分", less:"較少", very:"非常", too:"太；也", also:"也", only:"只有", just:"剛剛；只是",
  even:"甚至", still:"仍然", again:"再次", always:"總是", never:"從不", often:"經常", sometimes:"有時", usually:"通常",
  maybe:"也許", perhaps:"也許", please:"請", yes:"是的", "no":"不", "not":"不"
};

/* 30 張梗圖（使用 memes/ 資料夾中的真實圖檔；分三等級各 10 張）
   注意：bad6 在資料夾中為 .jpg（原始版本誤寫成 .gif，這裡已修正）*/
function M(tier, i, ext = "jpg"){
  return { id:`${tier}-${i}`, tier, imgSrc:`memes/${tier}/${tier}${i}.${ext}` };
}
const MEMES = [
  // 🍜 ---- bad（菜英文：1~10）----
  M("bad", 1, "jpg"),
  M("bad", 2, "jpg"),
  M("bad", 3, "jpg"),
  M("bad", 4, "jpg"),
  M("bad", 5, "jpg"),
  M("bad", 6, "jpg"),
  M("bad", 7, "jpg"),
  M("bad", 8, "jpg"),
  M("bad", 9, "gif"),
  M("bad", 10, "jpg"),
  // 📈 ---- mid（漸入佳境：1~10）----
  M("mid", 1, "jpg"),
  M("mid", 2, "jpg"),
  M("mid", 3, "jpg"),
  M("mid", 4, "jpg"),
  M("mid", 5, "jpg"),
  M("mid", 6, "jpg"),
  M("mid", 7, "jpg"),
  M("mid", 8, "jpg"),
  M("mid", 9, "jpg"),
  M("mid", 10, "jpg"),
  // 🏆 ---- good（英文達人：1~10）----
  M("good", 1, "jpg"),
  M("good", 2, "jpg"),
  M("good", 3, "jpg"),
  M("good", 4, "jpg"),
  M("good", 5, "jpg"),
  M("good", 6, "gif"),
  M("good", 7, "gif"),
  M("good", 8, "gif"),
  M("good", 9, "gif"),
  M("good", 10, "gif")
];

/* 推薦文章主題 + 連結（點擊開新分頁，連到真實英文學習網站）*/
const TOPICS = [
  { id:"news", emoji:"🗞️", title:{zh:"新聞時事",en:"News"}, desc:{zh:"用淺顯英文讀世界大小事",en:"World news in simple English"},
    links:[
      { emoji:"📻", name:"BBC Learning English", url:"https://www.bbc.co.uk/learningenglish", desc:{zh:"BBC 官方英語學習，影音＋測驗",en:"BBC's official English-learning hub"} },
      { emoji:"📊", name:"News in Levels", url:"https://www.newsinlevels.com/", desc:{zh:"同一則新聞分三種難度，附音檔",en:"Daily news at 3 levels, with audio"} },
      { emoji:"📰", name:"Breaking News English", url:"https://breakingnewsenglish.com/", desc:{zh:"同一則新聞分七種難度＋練習",en:"Each story at 7 levels, with exercises"} }
    ] },
  { id:"sdg", emoji:"🌍", title:{zh:"環境永續",en:"Sustainability"}, desc:{zh:"讀 SDG 與地球的故事",en:"SDGs and our planet"},
    links:[
      { emoji:"🎯", name:"UN Sustainable Development Goals", url:"https://www.un.org/sustainabledevelopment/", desc:{zh:"聯合國 17 項永續目標官網",en:"The UN's 17 global goals"} },
      { emoji:"🌡️", name:"NASA Climate Kids", url:"https://climatekids.nasa.gov/", desc:{zh:"NASA 用簡單英文＋遊戲講氣候",en:"NASA explains climate, simply"} },
      { emoji:"🐘", name:"National Geographic Kids", url:"https://kids.nationalgeographic.com/", desc:{zh:"國家地理兒童版，自然與動物",en:"NatGeo for kids — nature & animals"} }
    ] },
  { id:"sci", emoji:"🔬", title:{zh:"科學科技",en:"Science & Tech"}, desc:{zh:"探索有趣的知識",en:"Curious ideas worth reading"},
    links:[
      { emoji:"💡", name:"TED-Ed", url:"https://ed.ted.com/", desc:{zh:"動畫短片＋課程，含字幕",en:"Animated lessons with subtitles"} },
      { emoji:"🎤", name:"TED Talks", url:"https://www.ted.com/talks", desc:{zh:"附逐字稿與字幕的演講",en:"Talks with transcripts & subtitles"} },
      { emoji:"🧪", name:"Science News Explores", url:"https://www.snexplores.org/", desc:{zh:"寫給學生的科學新聞",en:"Science news for students"} }
    ] },
  { id:"life", emoji:"🍵", title:{zh:"生活英文",en:"Everyday English"}, desc:{zh:"日常用得到的實用英文",en:"Practical day-to-day English"},
    links:[
      { emoji:"🎬", name:"VoiceTube", url:"https://www.voicetube.com/", desc:{zh:"台灣團隊，看影片配中英字幕學英文",en:"Taiwan-made — videos with EN/中文 subtitles"} },
      { emoji:"⏱️", name:"BBC 6 Minute English", url:"https://www.bbc.co.uk/learningenglish/english/features/6-minute-english", desc:{zh:"六分鐘學一個主題（含逐字稿）",en:"Learn a topic in 6 minutes (with transcript)"} },
      { emoji:"🗽", name:"VOA Learning English", url:"https://learningenglish.voanews.com/", desc:{zh:"放慢語速的美國之音新聞與課程",en:"News & lessons at a slower pace"} }
    ] }
];

/* ============================================================
   3. 使用者狀態 & 每位使用者的資料
   ============================================================ */
let currentUser = store.get("cy_current") || null;
const K = {
  vocab:  u => `cy::${u}::vocab`,
  memes:  u => `cy::${u}::memes`,
  stats:  u => `cy::${u}::stats`,
  analytics: u => `cy::${u}::analytics`
};
const getVocab = () => J.get(K.vocab(currentUser), []);
const setVocab = (v) => J.set(K.vocab(currentUser), v);
const getMemes = () => J.get(K.memes(currentUser), []);      // 已收集的梗圖 id 陣列
const setMemes = (m) => J.set(K.memes(currentUser), m);
const getStats = () => J.get(K.stats(currentUser), { quizzes:0, best:0, last:0, streak:0, bestStreak:0, lastDay:"" });
const setStats = (s) => J.set(K.stats(currentUser), s);
/* 以「本地時間」算日期字串與天數差（給連續學習天數用）*/
function todayStr(d = new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function dayGap(a, b){
  const [ay,am,ad] = a.split("-").map(Number), [by,bm,bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by,bm-1,bd) - Date.UTC(ay,am-1,ad)) / 86400000);
}
/* 學習分析資料：累積各題型/各題答對率 + 每次測驗紀錄 */
const getAnalytics = () => J.get(K.analytics(currentUser), { cat:{}, q:{}, attempts:[] });
const setAnalytics = (a) => J.set(K.analytics(currentUser), a);
/* 計算某題型的累積正確率（0~1）；沒做過回傳 null */
function catAccuracy(a, key){
  const c = a.cat[key];
  if(!c || !c.seen) return null;
  return c.correct / c.seen;
}

/* ============================================================
   4. DOM 快捷
   ============================================================ */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

/* ============================================================
   5. 語言切換
   ============================================================ */
function applyLang(){
  document.body.classList.toggle("lang-en", lang === "en");
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
  // 套用所有 [data-i18n]
  $$("[data-i18n]").forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  // 動態區塊重繪
  renderDynamicLang();
  store.set("cy_lang", lang);
}
function toggleLang(){ lang = lang === "zh" ? "en" : "zh"; applyLang(); }
$("#lang-toggle-auth").addEventListener("click", toggleLang);
$("#lang-toggle").addEventListener("click", toggleLang);

function renderDynamicLang(){
  // hero 標題
  const u = currentUser && currentUser !== "__guest__" ? currentUser : (lang==="en"?"friend":"朋友");
  const hero = $(".hero-title");
  if(hero) hero.innerHTML = `${t("heroPre")} <span class="hi">${escapeHtml(u)}</span>${t("heroPost")}<span class="hi-yellow">${t("heroBad")}</span>${t("heroEnd")}`;
  // 若目前在某些動態畫面，重新渲染
  if(!$("#app").classList.contains("hidden")){
    renderHome(); 
    if($("#view-articles").classList.contains("active")) renderTopics();
    if($("#view-memes").classList.contains("active")) renderMemes();
    if($("#view-vocab").classList.contains("active")) renderVocab();
    if($("#view-analytics").classList.contains("active")) renderAnalytics();
    if($("#view-quiz").classList.contains("active") && !$("#quiz-intro").classList.contains("hidden"))
      $("#quiz-bank-note").textContent = "";
  }
}

/* ============================================================
   6. 登入 / 註冊 / 訪客
   ============================================================ */
let authMode = "login";
$$(".auth-tab").forEach(tab => tab.addEventListener("click", () => {
  authMode = tab.dataset.tab;
  $$(".auth-tab").forEach(t2 => t2.classList.toggle("active", t2===tab));
  $("#auth-submit").innerHTML = t(authMode === "login" ? "tabLogin" : "tabRegister");
  $("#auth-msg").textContent = "";
}));

$("#auth-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const u = $("#auth-username").value.trim();
  const p = $("#auth-password").value;
  const msg = $("#auth-msg");
  if(!u || !p){ msg.textContent = t("loginNeedFill"); return; }
  const users = J.get("cy_users", {});
  if(authMode === "register"){
    if(users[u]){ msg.textContent = t("userExists"); return; }
    users[u] = { p }; J.set("cy_users", users);
    msg.style.color = "var(--teal)"; msg.textContent = t("regOk");
    setTimeout(() => loginAs(u), 500);
  } else {
    if(!users[u]){ msg.style.color="var(--coral)"; msg.textContent = t("userNotFound"); return; }
    if(users[u].p !== p){ msg.style.color="var(--coral)"; msg.textContent = t("wrongPw"); return; }
    loginAs(u);
  }
});
$("#guest-btn").addEventListener("click", () => loginAs("__guest__"));

function loginAs(u){
  currentUser = u;
  store.set("cy_current", u);
  enterApp();
}
$("#logout-btn").addEventListener("click", () => {
  currentUser = null; store.del("cy_current");
  $("#app").classList.add("hidden");
  $("#auth-screen").classList.remove("hidden");
  $("#auth-username").value = ""; $("#auth-password").value = "";
});

function enterApp(){
  $("#auth-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  const display = currentUser === "__guest__" ? (lang==="en"?"guest":"訪客") : currentUser;
  $("#user-name").textContent = display;
  applyLang();
  const v = (location.hash || "").slice(1);
  if(ROUTES.includes(v)) routeFromHash();
  else go("home");
}

/* ============================================================
   7. 導覽（hash 路由：#home #quiz #vocab #articles #memes #analytics）
   ============================================================ */
const ROUTES = ["home","quiz","vocab","articles","memes","analytics"];

/* 真正切換畫面（不動 hash，避免迴圈）*/
function applyView(view){
  if(!ROUTES.includes(view)) view = "home";
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${view}`));
  $$(".navlink").forEach(n => n.classList.toggle("active", n.dataset.go === view));
  window.scrollTo({ top:0, behavior:"smooth" });
  if(view==="home")     renderHome();
  if(view==="vocab")    renderVocab();
  if(view==="articles") { renderTopics(); $("#topic-detail").classList.add("hidden"); $("#topic-grid").classList.remove("hidden"); }
  if(view==="memes")    renderMemes();
  if(view==="quiz")     resetQuizToIntro();
  if(view==="analytics") renderAnalytics();
}

/* 對外導覽：改 hash → 由 hashchange 統一切換（同頁則直接重繪）*/
function go(view){
  if(!ROUTES.includes(view)) view = "home";
  const target = "#" + view;
  if(location.hash === target) applyView(view);
  else location.hash = target;
}
function routeFromHash(){ applyView((location.hash || "#home").slice(1)); }
window.addEventListener("hashchange", routeFromHash);
$$("[data-go]").forEach(btn => btn.addEventListener("click", () => go(btn.dataset.go)));
$("#go-home").addEventListener("click", () => go("home"));

/* ============================================================
   8. 首頁統計
   ============================================================ */
function renderHome(){
  renderDynamicLang === undefined ? null : null;
  const vocab = getVocab().length;
  const memes = getMemes().length;
  const stats = getStats();
  // hero 統計
  $("#hero-stats").innerHTML = [
    statBox(vocab, t("statVocab")),
    statBox(`${memes}/30`, t("statMeme")),
    statBox(stats.quizzes, t("statQuiz")),
    statBox(`${stats.best}/10`, t("statBest")),
    statBox(`${stats.streak||0} 🔥`, t("statStreak"), "stat-box-wide")
  ].join("");
  // 磚塊小標
  $("#tile-quiz-stat").textContent  = t("tileQuizStat")(stats.best);
  $("#tile-vocab-stat").textContent = t("tileVocabStat")(vocab);
  $("#tile-art-stat").textContent   = t("tileArtStat")(TOPICS.length);
  $("#tile-meme-stat").textContent  = t("tileMemeStat")(memes);
  // 學習分析磚塊：整體正確率（沒資料則顯示「尚無資料」）
  const an = getAnalytics();
  let seen=0, correct=0; CAT_KEYS.forEach(k => { const c=an.cat[k]; if(c){ seen+=c.seen; correct+=c.correct; } });
  const accStat = seen ? Math.round((correct/seen)*100) : null;
  const tAnStat = $("#tile-analytics-stat"); if(tAnStat) tAnStat.textContent = t("tileAnalyticsStat")(accStat);
}
const statBox = (n,l,cls="") => `<div class="stat-box ${cls}"><div class="stat-num">${n}</div><div class="stat-label">${l}</div></div>`;

/* ============================================================
   9. 測驗流程（兩種模式：隨機 / 弱點加強）
   ============================================================ */
const QUIZ_LEN = 10;
let qIndex = 0;
let quizMode = "normal";          // "normal" | "weak"
let quizSet = [];                 // 本次抽到的 10 題（題目物件）
let qAnswers = new Array(QUIZ_LEN).fill(null);

/* 洗牌（Fisher–Yates） */
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}

/* 依弱點程度把題型由弱到強排序（沒做過的視為最弱，最該練）*/
function catsByWeakness(a){
  return CAT_KEYS.map(k => {
    const c = a.cat[k] || { seen:0, correct:0 };
    const acc = c.seen ? c.correct / c.seen : -1;   // -1 = 沒做過 → 排最前面
    return { key:k, acc, seen:c.seen };
  }).sort((x,y) => x.acc - y.acc || x.seen - y.seen);
}

/* 隨機模式：每個題型抽 2 題 = 10 題，保證五大題型都測到 */
function pickNormalSet(){
  let set = [];
  CAT_KEYS.forEach(k => {
    const inCat = shuffle(QUESTIONS.filter(q => q.cat === k));
    set.push(...inCat.slice(0, 2));
  });
  return shuffle(set).slice(0, QUIZ_LEN);
}

/* 弱點模式：弱的題型分到比較多題，且優先抽「以前答錯或沒做過」的題 */
function pickWeaknessSet(){
  const a = getAnalytics();
  const ranked = catsByWeakness(a);            // 由弱到強
  const pattern = [4, 3, 2, 1, 0];             // 五個題型分到的題數（共 10）
  let set = [];
  ranked.forEach((c, i) => {
    const need = pattern[i] || 0;
    if(need <= 0) return;
    const scored = QUESTIONS.filter(q => q.cat === c.key).map(q => {
      const s = a.q[q.id] || { seen:0, correct:0 };
      const wrongRate = s.seen ? 1 - s.correct / s.seen : 1;   // 沒做過 = 1（最該練）
      return { q, pri: wrongRate + Math.random() * 0.001 };
    }).sort((x,y) => y.pri - x.pri);
    set.push(...scored.slice(0, need).map(o => o.q));
  });
  // 萬一不足 10 題，從剩下的補滿
  if(set.length < QUIZ_LEN){
    const have = new Set(set.map(q => q.id));
    set.push(...shuffle(QUESTIONS.filter(q => !have.has(q.id))).slice(0, QUIZ_LEN - set.length));
  }
  return shuffle(set).slice(0, QUIZ_LEN);
}

function resetQuizToIntro(){
  $("#quiz-intro").classList.remove("hidden");
  $("#quiz-play").classList.add("hidden");
  $("#quiz-result").classList.add("hidden");
  $("#quiz-bank-note").textContent = "";
}

function startQuiz(mode){
  quizMode = mode;
  quizSet  = mode === "weak" ? pickWeaknessSet() : pickNormalSet();
  qIndex = 0;
  qAnswers = new Array(quizSet.length).fill(null);
  $("#quiz-intro").classList.add("hidden");
  $("#quiz-result").classList.add("hidden");
  $("#quiz-play").classList.remove("hidden");
  if(mode === "weak") toast(t("weakReady"));
  renderQuestion();
}
$("#quiz-start").addEventListener("click", () => startQuiz("normal"));
$("#quiz-start-weak").addEventListener("click", () => {
  if(getAnalytics().attempts.length === 0){ toast(t("weakNeedFirst")); return; }
  startQuiz("weak");
});

function renderQuestion(){
  const q = quizSet[qIndex];
  $("#q-num").textContent = qIndex + 1;
  // 模式徽章 + 題型徽章
  $("#quiz-mode-badge").innerHTML =
    `<span class="qbadge mode">${quizMode==="weak"?t("quizModeBadgeWeak"):t("quizModeBadgeRandom")}</span>` +
    `<span class="qbadge cat" style="background:${catColor(q.cat)}">${catName(q.cat)}</span>`;
  // 進度
  const pct = ((qIndex+1) / quizSet.length) * 100;
  $("#quiz-progress-fill").style.width = pct + "%";
  $("#quiz-progress-text").textContent = t("qcounter")(qIndex+1, quizSet.length);
  // 題目（把 ___ 換成底線空格）
  const old = document.getElementById("quiz-explain");
  if(old) old.remove();
  const parts = q.q.split(/_{2,}/);
  $("#quiz-question").innerHTML = parts.map(escapeHtml).join('<span class="blank">?</span>');
  // 選項
  const keys = ["A","B","C","D"];
  $("#quiz-options").innerHTML = q.options.map((opt,i) =>
    `<button class="opt${qAnswers[qIndex]===i?" selected":""}" data-opt="${i}">
       <span class="opt-key">${keys[i]}</span><span>${escapeHtml(opt)}</span>
     </button>`).join("");
  $$("#quiz-options .opt").forEach(btn => btn.addEventListener("click", () => {
    if(qAnswers[qIndex] !== null) return;            // 已作答則鎖定
    qAnswers[qIndex] = +btn.dataset.opt;
    $$("#quiz-options .opt").forEach(b => b.classList.toggle("selected", b===btn));
    showExplain(qIndex);
  }));
  if(qAnswers[qIndex] !== null) showExplain(qIndex);  // 回到已作答的題目 → 重新顯示詳解
  // 導覽按鈕
  $("#quiz-prev").style.visibility = qIndex === 0 ? "hidden" : "visible";
  $("#quiz-next").innerHTML = qIndex === quizSet.length-1 ? t("submit") : t("next");
}

/* 秀出紅綠顏色對錯與詳解的關鍵函數（沿用原始檔案的做法）*/
function showExplain(idx){
  const q = quizSet[idx];
  const my = qAnswers[idx];
  const correct = q.answer;
  const isOk = my === correct;
  const keys = ["A","B","C","D"];

  // 鎖定所有選項不讓重複點擊，並染上紅/綠色
  $$("#quiz-options .opt").forEach(b => {
    b.style.pointerEvents = "none";
    const oi = +b.dataset.opt;
    if(oi === correct){
      b.style.background = "var(--teal)";
      b.style.color = "#fff";
      b.querySelector(".opt-key").style.background = "rgba(255,255,255,.25)";
      b.querySelector(".opt-key").style.color = "#fff";
    }
    if(oi === my && !isOk){
      b.style.background = "var(--coral)";
      b.style.color = "#fff";
      b.querySelector(".opt-key").style.background = "rgba(255,255,255,.25)";
      b.querySelector(".opt-key").style.color = "#fff";
    }
  });

  const old = document.getElementById("quiz-explain");
  if(old) old.remove();

  const explainText = (q.explain[lang] || q.explain.zh).replace(/\n/g, "<br>");

  const box = document.createElement("div");
  box.id = "quiz-explain";
  box.className = "quiz-explain " + (isOk ? "explain-ok" : "explain-wrong");
  box.innerHTML = isOk
    ? `<div class="explain-verdict explain-correct">✓ ${lang==="en"?"Correct!":"答對了！"}</div>
       <div class="explain-text">${explainText}</div>`
    : `<div class="explain-verdict explain-incorrect">✗ ${lang==="en"?"Wrong — correct answer:":"答錯了！正確答案是"} <b>${keys[correct]}. ${escapeHtml(q.options[correct])}</b></div>
       <div class="explain-text">${explainText}</div>`;

  document.getElementById("quiz-card-wrap").appendChild(box);
}
$("#quiz-prev").addEventListener("click", () => { if(qIndex>0){ qIndex--; renderQuestion(); } });
$("#quiz-next").addEventListener("click", () => {
  if(qAnswers[qIndex] === null){ toast(t("needAnswer")); return; }
  if(qIndex < quizSet.length-1){ qIndex++; renderQuestion(); }
  else finishQuiz();
});
/* 鍵盤支援：A–D 或 1–4 作答、← → 換題、Enter 下一題 */
document.addEventListener("keydown", (e) => {
  if($("#quiz-play").classList.contains("hidden")) return;       // 只在測驗進行中
  if(/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || "")) return;
  const k = e.key.toLowerCase();
  const map = { a:0, b:1, c:2, d:3, "1":0, "2":1, "3":2, "4":3 };
  if(k in map && qAnswers[qIndex] === null){
    e.preventDefault();
    qAnswers[qIndex] = map[k];
    renderQuestion();
  } else if(e.key === "ArrowRight" || e.key === "Enter"){
    e.preventDefault(); $("#quiz-next").click();
  } else if(e.key === "ArrowLeft"){
    e.preventDefault(); if(qIndex>0){ qIndex--; renderQuestion(); }
  }
});

/* 把本次作答結果寫進學習分析（累積各題型 / 各題 / 歷史紀錄）*/
function recordAnalytics(score){
  const a = getAnalytics();
  const perCat = {};
  quizSet.forEach((q,i) => {
    const ok = qAnswers[i] === q.answer;
    const c = a.cat[q.cat] || (a.cat[q.cat] = { seen:0, correct:0 });
    c.seen++; if(ok) c.correct++;
    const s = a.q[q.id] || (a.q[q.id] = { seen:0, correct:0 });
    s.seen++; if(ok) s.correct++;
    const pc = perCat[q.cat] || (perCat[q.cat] = { seen:0, correct:0 });
    pc.seen++; if(ok) pc.correct++;
  });
  a.attempts.push({ t:Date.now(), score, total:quizSet.length, mode:quizMode, perCat });
  if(a.attempts.length > 30) a.attempts = a.attempts.slice(-30);
  setAnalytics(a);
  return perCat;
}

function finishQuiz(){
  const score = qAnswers.reduce((s,a,i) => s + (a === quizSet[i].answer ? 1 : 0), 0);
  // 統計 + 分析
  const stats = getStats();
  stats.quizzes += 1; stats.last = score; stats.best = Math.max(stats.best, score);
  // 連續學習天數（每天完成至少一次測驗就 +1；中斷則歸 1）
  const today = todayStr();
  if(stats.lastDay !== today){
    const gap = stats.lastDay ? dayGap(stats.lastDay, today) : null;
    stats.streak = (gap === 1) ? (stats.streak || 0) + 1 : 1;
    stats.lastDay = today;
    stats.bestStreak = Math.max(stats.bestStreak || 0, stats.streak);
  }
  setStats(stats);
  const perCat = recordAnalytics(score);
  // 等級：0-2 bad / 3-7 mid / 8-10 good
  const tier = score <= 2 ? "bad" : score <= 7 ? "mid" : "good";
  const award = awardMeme(tier);
  // 結果畫面
  $("#quiz-play").classList.add("hidden");
  const tierName = { bad:t("tierBadName"), mid:t("tierMidName"), good:t("tierGoodName") }[tier];
  const tierMsg  = { bad:t("tierBadMsg"),  mid:t("tierMidMsg"),  good:t("tierGoodMsg")  }[tier];
  const tierEmoji= { bad:"🍜", mid:"📈", good:"🏆" }[tier];
  const tierClass= { bad:"bad", mid:"mid", good:"good" }[tier];

  // 本次各題型表現
  const perfRows = CAT_KEYS.filter(k => perCat[k]).map(k =>
    skillBarRow(k, perCat[k].correct, perCat[k].seen)).join("");
  // 弱點建議（依累積資料）
  const weak = weakestCats(getAnalytics(), 2);
  const weakHtml = weak.length
    ? `<div class="weak-mini">${t("anWeakLead")(weak.map(w => `${catName(w.key)}`).join(lang==="en"?" & ":"、"))}</div>`
    : `<div class="weak-mini">${t("anWeakNone")}</div>`;

  $("#quiz-result").innerHTML = `
    <div class="result-card card">
      <div class="result-emoji">${tierEmoji}</div>
      <div class="result-tier ${tierClass}">${tierName}</div>
      <div class="result-score">${t("scoreLabel")(score)}</div>
      <p class="result-msg">${tierMsg}</p>
      <div class="result-msg" style="color:var(--teal);font-weight:900">
        ${award ? `🎁 ${t("awardGot")}` : `✅ ${t("awardFull")}`}
      </div>
      <div class="result-perf">
        <h4 class="result-perf-title">${t("resultPerf")}</h4>
        <div class="skill-bars">${perfRows}</div>
        ${weakHtml}
      </div>
      <div class="result-actions">
        <button class="btn btn-coral" id="res-retake">${t("retake")}</button>
        <button class="btn btn-yellow" id="res-weak">${t("practiceWeak")}</button>
        <button class="btn btn-blue" id="res-report">${t("resultReport")}</button>
      </div>
      <div class="result-actions">
        <button class="btn btn-ghost btn-mini" id="res-memes">${t("seeMemes")}</button>
        <button class="btn btn-ghost btn-mini" id="res-review">${t("reviewBtn")}</button>
      </div>
      <div id="review-box"></div>
    </div>`;
  $("#quiz-result").classList.remove("hidden");
  $("#res-retake").addEventListener("click", () => startQuiz("normal"));
  $("#res-weak").addEventListener("click", () => startQuiz("weak"));
  $("#res-report").addEventListener("click", () => go("analytics"));
  $("#res-memes").addEventListener("click", () => { lastAward = award; go("memes"); });
  $("#res-review").addEventListener("click", renderReview);

  if(award) showMemeModal(award);
}

function renderReview(){
  const box = $("#review-box");
  if(box.dataset.open === "1"){ box.innerHTML=""; box.dataset.open="0"; return; }
  box.dataset.open = "1";
  const keys=["A","B","C","D"];
  box.innerHTML = `<div class="review"><h4>${t("reviewTitle")}</h4>` +
    quizSet.map((q,i) => {
      const my = qAnswers[i];
      const correct = q.answer;
      const myTxt = my===null ? t("noAns") : `${keys[my]}. ${q.options[my]}`;
      const ok = my === correct;
      return `<div class="review-item">
        <div class="rv-q"><span class="rv-cat" style="background:${catColor(q.cat)}">${catName(q.cat)}</span> Q${i+1}. ${escapeHtml(q.q.replace(/_{2,}/,'＿＿＿'))}</div>
        <div class="rv-a ${ok?'rv-correct':'rv-wrong'}">${ok?'✓':'✗'} ${t("yourAns")}：${escapeHtml(myTxt)}</div>
        ${ok?'':`<div class="rv-a rv-correct">✓ ${t("correctIs")}：${keys[correct]}. ${escapeHtml(q.options[correct])}</div>`}
        <div class="rv-exp">${escapeHtml(q.explain[lang] || q.explain.zh)}</div>
      </div>`;
    }).join("") + `</div>`;
}

/* ============================================================
   9b. 學習分析 / 圖表
   ============================================================ */
const pct1 = (correct, seen) => seen ? Math.round((correct/seen)*100) : 0;

/* 找出最弱的題型（只看做過的，正確率 < 70% 才算弱）*/
function weakestCats(a, limit){
  return CAT_KEYS.map(k => {
    const c = a.cat[k]; if(!c || !c.seen) return null;
    return { key:k, acc:c.correct/c.seen, seen:c.seen };
  }).filter(Boolean)
    .filter(c => c.acc < 0.7)
    .sort((x,y) => x.acc - y.acc)
    .slice(0, limit);
}

/* 一條題型正確率長條（結果頁 & 分析頁共用）*/
function skillBarRow(key, correct, seen){
  const p = pct1(correct, seen);
  return `<div class="skill-row">
    <span class="skill-name">${catDot(key)}${catName(key)}</span>
    <span class="skill-track"><span style="width:${p}%;background:${catColor(key)}"></span></span>
    <span class="skill-val">${p}% <small>(${correct}/${seen})</small></span>
  </div>`;
}

/* 自己手刻的 SVG 雷達圖：五個題型各一軸，離中心越遠越強 */
function radarChartSVG(a){
  const cx=160, cy=152, R=104, n=CAT_KEYS.length;
  const ang = i => (-Math.PI/2) + i*(2*Math.PI/n);
  const pt  = (i,r) => [cx + Math.cos(ang(i))*r, cy + Math.sin(ang(i))*r];
  const fmt = ([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`;
  // 同心格線
  let rings = "";
  [0.25,0.5,0.75,1].forEach(f => {
    rings += `<polygon points="${CAT_KEYS.map((_,i)=>fmt(pt(i,R*f))).join(" ")}" fill="none" stroke="var(--ink)" stroke-opacity="0.12" stroke-width="2"/>`;
  });
  // 軸線
  let axes = "";
  CAT_KEYS.forEach((_,i)=>{ axes += `<line x1="${cx}" y1="${cy}" x2="${pt(i,R)[0].toFixed(1)}" y2="${pt(i,R)[1].toFixed(1)}" stroke="var(--ink)" stroke-opacity="0.12" stroke-width="2"/>`; });
  // 資料多邊形
  const vals = CAT_KEYS.map(k => { const acc = catAccuracy(a,k); return acc==null?0:acc; });
  const dataPts = CAT_KEYS.map((k,i)=> fmt(pt(i, R*Math.max(0.03, vals[i])))).join(" ");
  let dots = "";
  CAT_KEYS.forEach((k,i)=>{ const [x,y]=pt(i, R*Math.max(0.03, vals[i])); dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${catColor(k)}" stroke="var(--ink)" stroke-width="2"/>`; });
  // 標籤（emoji + %）
  let labels = "";
  CAT_KEYS.forEach((k,i)=>{
    const [lx,ly]=pt(i,R+24);
    const acc = catAccuracy(a,k);
    labels += `<text x="${lx.toFixed(1)}" y="${(ly-2).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${catColor(k)}">${catShort(k)}</text>`;
    labels += `<text x="${lx.toFixed(1)}" y="${(ly+13).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="800" fill="var(--ink)">${acc==null?t("noData"):Math.round(acc*100)+"%"}</text>`;
  });
  return `<svg viewBox="0 0 320 320" width="100%" style="max-width:340px" role="img" aria-label="skill radar">
    ${rings}${axes}
    <polygon points="${dataPts}" fill="var(--teal)" fill-opacity="0.30" stroke="var(--teal)" stroke-width="3"/>
    ${dots}${labels}
  </svg>`;
}

/* 歷史成績長條（最近最多 12 次）*/
function historyHTML(attempts){
  const last = attempts.slice(-12);
  const bars = last.map(at => {
    const h = Math.max(6, (at.score/(at.total||10))*100);
    const col = at.score<=2 ? "var(--coral)" : at.score<=7 ? "var(--yellow)" : "var(--teal)";
    return `<div class="hist-bar" style="height:${h}%;background:${col}" title="${at.score}/${at.total}">
      <span>${at.score}</span></div>`;
  }).join("");
  return `<div class="hist-bars">${bars}</div>`;
}

function renderAnalytics(){
  const a = getAnalytics();
  const body = $("#analytics-body");
  if(a.attempts.length === 0){
    body.innerHTML = `<div class="empty-box">
      <span class="empty-emoji">📊</span>
      <p>${t("anEmpty")}</p>
      <button class="btn btn-coral" data-go="quiz">${t("goQuiz")}</button>
    </div>`;
    $$("#analytics-body [data-go]").forEach(b => b.addEventListener("click", () => go(b.dataset.go)));
    return;
  }
  // 總覽
  let totSeen=0, totCorrect=0;
  CAT_KEYS.forEach(k => { const c=a.cat[k]; if(c){ totSeen+=c.seen; totCorrect+=c.correct; } });
  const overall = pct1(totCorrect, totSeen);
  // 各題型長條
  const bars = CAT_KEYS.map(k => {
    const c = a.cat[k] || {seen:0,correct:0};
    return skillBarRow(k, c.correct, c.seen);
  }).join("");
  // 弱點
  const weak = weakestCats(a, 2);
  let weakHtml;
  if(weak.length === 0){
    weakHtml = `<p class="weak-none">${t("anWeakNone")}</p>`;
  } else {
    const names = weak.map(w => `${catName(w.key)}`).join(lang==="en"?" & ":"、");
    const tips  = weak.map(w => `<li><b>${catName(w.key)}</b>（${pct1(a.cat[w.key].correct,a.cat[w.key].seen)}%）— ${CAT[w.key].tip[lang]||CAT[w.key].tip.zh}</li>`).join("");
    weakHtml = `<p class="weak-lead">${t("anWeakLead")(names)}</p><ul class="weak-tips">${tips}</ul>
      <button class="btn btn-coral" id="an-practice">${t("practiceWeak")}</button>`;
  }

  body.innerHTML = `
    <div class="an-top">
      ${statBox(overall+"%", t("anOverall"))}
      ${statBox(totSeen, t("anAnswered"))}
      ${statBox(a.attempts.length, t("anAttempts"))}
    </div>
    <div class="an-grid">
      <div class="an-card card">
        <h3 class="an-h">${t("anRadar")}</h3>
        <div class="radar-wrap">${radarChartSVG(a)}</div>
        <p class="an-note">${t("anRadarNote")}</p>
      </div>
      <div class="an-card card">
        <h3 class="an-h">${t("anBars")}</h3>
        <div class="skill-bars">${bars}</div>
      </div>
    </div>
    <div class="an-card card weak-card">
      <h3 class="an-h">${t("anWeak")}</h3>
      ${weakHtml}
    </div>
    <div class="an-card card">
      <h3 class="an-h">${t("anHistory")}</h3>
      ${historyHTML(a.attempts)}
      <p class="an-note">${t("anHistoryNote")}</p>
    </div>`;

  const pBtn = $("#an-practice");
  if(pBtn) pBtn.addEventListener("click", () => { go("quiz"); startQuiz("weak"); });
}

/* ============================================================
   10. 框選單字 → 存單字卡
   ============================================================ */
const saveBtn = $("#save-word-btn");
let pendingWord = "";

document.addEventListener("mouseup", (e) => {
  // 只在測驗進行畫面內生效
  if(e.target.closest && e.target.closest("#save-word-btn")) return;
  const playArea = $("#quiz-play");
  if(playArea.classList.contains("hidden")) { hideSaveBtn(); return; }
  const sel = window.getSelection();
  const text = sel ? sel.toString().trim() : "";
  // 選取必須落在測驗卡內
  if(text && text.length >= 2 && text.length <= 40 && sel.anchorNode && playArea.contains(sel.anchorNode)){
    pendingWord = text;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    saveBtn.style.left = (window.scrollX + rect.left + rect.width/2 - 55) + "px";
    saveBtn.style.top  = (window.scrollY + rect.top - 44) + "px";
    saveBtn.classList.remove("hidden");
  } else {
    hideSaveBtn();
  }
});
function hideSaveBtn(){ saveBtn.classList.add("hidden"); pendingWord=""; }

saveBtn.addEventListener("mousedown", (e) => e.preventDefault()); // 不要清掉 selection
saveBtn.addEventListener("click", () => {
  if(pendingWord) saveWord(pendingWord);
  hideSaveBtn();
  window.getSelection().removeAllRanges();
});

function saveWord(raw){
  // 清乾淨：去頭尾標點
  const word = raw.replace(/^[^A-Za-z\u4e00-\u9fff]+|[^A-Za-z\u4e00-\u9fff]+$/g, "").trim();
  if(!word) return;
  const key = word.toLowerCase();
  const vocab = getVocab();
  if(vocab.some(v => v.word.toLowerCase() === key)){ toast(t("toastDup")(word)); return; }
  const meaning = DICT[key] || null;   // 不在本地字典 → 之後線上查詢
  vocab.push({ word, meaning, addedAt: Date.now() });
  setVocab(vocab);
  toast(t("toastSaved")(word));
}

/* ============================================================
   11. 單字卡 flashcards
   ============================================================ */

/* 線上翻譯（本地字典查不到時的後備）：MyMemory 免金鑰 API + localStorage 快取 */
const DICT_CACHE = "cy::dictcache";
async function lookupMeaning(word){
  const key = word.toLowerCase();
  if(DICT[key]) return DICT[key];
  const cache = J.get(DICT_CACHE, {});
  if(cache[key]) return cache[key];
  try{
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-TW`;
    const res = await fetch(url);
    const data = await res.json();
    let txt = data && data.responseData && data.responseData.translatedText;
    if(txt){ txt = txt.trim(); }
    // 過濾掉沒翻到（回傳原字）或明顯失敗的結果
    if(txt && txt.toLowerCase() !== key && !/^(no query|invalid|mymemory)/i.test(txt)){
      cache[key] = txt; J.set(DICT_CACHE, cache);
      return txt;
    }
  }catch(e){ /* 離線或被擋 → 落到下方 null */ }
  return null;
}

/* 朗讀英文單字（Web Speech API，免網路、免金鑰）。挑選較自然的英文聲線，避開沙啞的 eSpeak 預設音 */
let ttsVoice = null;
function pickVoice(){
  if(!("speechSynthesis" in window) || typeof speechSynthesis.getVoices !== "function") return;
  const voices = speechSynthesis.getVoices() || [];
  if(!voices.length) return;
  const en = voices.filter(v => /^en(-|_|$)/i.test(v.lang));
  if(!en.length) return;
  const prefer = [
    "Google US English","Google UK English Female","Google UK English Male",
    "Samantha","Karen","Moira","Tessa","Serena","Daniel","Aaron","Allison",
    "Microsoft Aria","Microsoft Jenny","Microsoft Guy","Microsoft Zira","Microsoft Mark"
  ];
  ttsVoice =
    prefer.map(name => en.find(v => v.name === name || v.name.includes(name))).find(Boolean) ||
    en.find(v => /google|natural|premium|enhanced|neural/i.test(v.name)) ||
    en.find(v => v.localService === false && !/espeak/i.test(v.name)) ||
    en.find(v => !/espeak/i.test(v.name)) ||
    en[0];
}
if("speechSynthesis" in window){
  pickVoice();
  try { speechSynthesis.addEventListener("voiceschanged", pickVoice); } catch(e){}
}
function speakWord(word){
  if(!("speechSynthesis" in window)){ toast(t("dictFail")); return; }
  try{
    speechSynthesis.cancel();
    if(!ttsVoice) pickVoice();
    const u = new SpeechSynthesisUtterance(word);
    if(ttsVoice){ u.voice = ttsVoice; u.lang = ttsVoice.lang; }
    else { u.lang = "en-US"; }
    u.rate = 0.95; u.pitch = 1.0;
    speechSynthesis.speak(u);
  }catch(e){ /* 忽略 */ }
}

let vIndex = 0;
function renderVocab(){
  const vocab = getVocab();
  if(vocab.length === 0){
    $("#vocab-empty").classList.remove("hidden");
    $("#vocab-stage").classList.add("hidden");
    return;
  }
  $("#vocab-empty").classList.add("hidden");
  $("#vocab-stage").classList.remove("hidden");
  if(vIndex >= vocab.length) vIndex = vocab.length-1;
  if(vIndex < 0) vIndex = 0;
  const card = vocab[vIndex];
  $("#fc-word").textContent = card.word;
  $("#flashcard").classList.remove("flipped");
  $("#vocab-counter").textContent = t("qcounter")(vIndex+1, vocab.length);
  // 中文意思：本地有就直接顯示，否則線上查詢（並回寫快取/紀錄）
  if(card.meaning){
    $("#fc-meaning").textContent = card.meaning;
  } else {
    const askedWord = card.word;
    $("#fc-meaning").textContent = t("dictLoading");
    lookupMeaning(askedWord).then(m => {
      if(m){
        const list = getVocab();                       // 回寫到該單字
        const hit = list.find(v => v.word === askedWord);
        if(hit){ hit.meaning = m; setVocab(list); }
      }
      // 只有在使用者還停在同一張卡時才更新畫面
      const cur = getVocab()[vIndex];
      if(cur && cur.word === askedWord){
        $("#fc-meaning").textContent = m || t("dictFail");
      }
    });
  }
}
$("#flashcard").addEventListener("click", () => $("#flashcard").classList.toggle("flipped"));
$("#vocab-speak").addEventListener("click", (e) => {
  e.stopPropagation();
  const vocab = getVocab(); if(vocab.length) speakWord(vocab[vIndex].word);
});
$("#vocab-prev").addEventListener("click", () => { const n=getVocab().length; if(!n)return; vIndex=(vIndex-1+n)%n; renderVocab(); });
$("#vocab-next").addEventListener("click", () => { const n=getVocab().length; if(!n)return; vIndex=(vIndex+1)%n; renderVocab(); });
$("#vocab-learned").addEventListener("click", () => {
  const vocab = getVocab(); if(!vocab.length) return;
  vocab.splice(vIndex,1); setVocab(vocab); toast(t("toastLearned")); renderVocab();
});
$("#vocab-shuffle").addEventListener("click", () => {
  const vocab = getVocab();
  for(let i=vocab.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [vocab[i],vocab[j]]=[vocab[j],vocab[i]]; }
  setVocab(vocab); vIndex=0; renderVocab();
});

/* ============================================================
   12. 推薦文章
   ============================================================ */
function renderTopics(){
  $("#topic-grid").innerHTML = TOPICS.map(tp => `
    <button class="topic-card" data-topic="${tp.id}">
      <span class="tc-emoji">${tp.emoji}</span>
      <span class="tc-title">${tp.title[lang]}</span>
      <span class="tc-desc">${tp.desc[lang]}</span>
      <span class="tc-count">${tp.links.length} ${lang==="en"?"sites →":"個網站 →"}</span>
    </button>`).join("");
  $$("#topic-grid .topic-card").forEach(c => c.addEventListener("click", () => openTopic(c.dataset.topic)));
}
function openTopic(id){
  const tp = TOPICS.find(x => x.id === id);
  $("#topic-grid").classList.add("hidden");
  $("#topic-detail").classList.remove("hidden");
  $("#topic-detail-title").textContent = `${tp.emoji} ${tp.title[lang]}`;
  $("#topic-links").innerHTML = tp.links.map(lk => `
    <a class="link-card" href="${lk.url}" target="_blank" rel="noopener noreferrer">
      <span class="lk-emoji">${lk.emoji}</span>
      <span class="lk-body">
        <span class="lk-name">${escapeHtml(lk.name)}</span><br>
        <span class="lk-desc">${lk.desc[lang]}</span>
      </span>
      <span class="lk-go">↗</span>
    </a>`).join("");
}
$("#topic-back").addEventListener("click", () => {
  $("#topic-detail").classList.add("hidden");
  $("#topic-grid").classList.remove("hidden");
});

/* ============================================================
   13. 梗圖收集
   ============================================================ */
let lastAward = null;  // 剛剛拿到的梗圖（給動畫用）

function awardMeme(tier){
  const owned = getMemes();
  const pool = MEMES.filter(m => m.tier === tier && !owned.includes(m.id));
  if(pool.length === 0) return null;            // 該等級已收滿
  const got = pool[Math.floor(Math.random()*pool.length)];
  owned.push(got.id); setMemes(owned);
  return got;
}

function renderMemes(){
  const owned = getMemes();
  const tiers = [
    { key:"bad",  emoji:"🍜", name:t("tierBadName"),  sub:t("badSub"),  cls:"bad",  mp:"mp-bad"  },
    { key:"mid",  emoji:"📈", name:t("tierMidName"),  sub:t("midSub"),  cls:"mid",  mp:"mp-mid"  },
    { key:"good", emoji:"🏆", name:t("tierGoodName"), sub:t("goodSub"), cls:"good", mp:"mp-good" }
  ];
  $("#meme-tiers").innerHTML = tiers.map(ti => {
    const list = MEMES.filter(m => m.tier === ti.key);
    const have = list.filter(m => owned.includes(m.id)).length;
    const pct  = (have / list.length) * 100;
    const grid = list.map(m => {
      const unlocked = owned.includes(m.id);
      const justGot = lastAward && lastAward.id === m.id ? " just-got" : "";
      if(!unlocked){
        return `<div class="meme locked"><span class="lock">🔒</span><span class="lock-txt">${t("locked")}</span></div>`;
      }
      return `<div class="meme has-img${justGot}">
        <img src="${m.imgSrc}" alt="meme ${m.id}" loading="lazy">
      </div>`;
    }).join("");
    return `<div class="meme-tier">
      <div class="meme-tier-head">
        <span class="mt-emoji">${ti.emoji}</span>
        <span class="mt-name ${ti.cls}">${ti.name}</span>
        <span class="mt-sub">${ti.sub}</span>
      </div>
      <div class="meme-progress">
        <div class="meme-progress-track ${ti.mp}"><span style="width:${pct}%"></span></div>
        <div class="meme-progress-label">${have} / ${list.length} ${have===list.length?'· '+t("collectDone"):''}</div>
      </div>
      <div class="meme-grid">${grid}</div>
    </div>`;
  }).join("");
  lastAward = null; // 動畫只播一次
}

function showMemeModal(m){
  $("#modal-meme").innerHTML = `<div class="meme has-img modal-img">
    <img src="${m.imgSrc}" alt="meme ${m.id}">
  </div>`;
  $("#meme-modal").classList.remove("hidden");
}
$("#modal-close").addEventListener("click", () => $("#meme-modal").classList.add("hidden"));
$("#meme-modal").addEventListener("click", (e) => { if(e.target.id==="meme-modal") $("#meme-modal").classList.add("hidden"); });

/* ============================================================
   14. 小工具：toast / escapeHtml
   ============================================================ */
let toastTimer;
function toast(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2200);
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ============================================================
   15. 啟動
   ============================================================ */
(function init(){
  applyLang();
  $("#auth-submit").innerHTML = t("tabLogin");
  if(currentUser){ enterApp(); }   // 之前登入過 → 直接進入
})();
