/* ============================================================
   誰是蔡英文 · Who's Bad at English?  —  app.js
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
    quizIntro:"共 10 題單選填空。看不懂的單字，<b>用滑鼠左鍵把它框選起來</b>就能存進單字卡！完成後依分數發放專屬梗圖。",
    quizRuleBad:"答對 0–2 題 → 解鎖「菜英文」梗圖 🍜",
    quizRuleMid:"答對 3–7 題 → 解鎖「漸入佳境」梗圖 📈",
    quizRuleGood:"答對 8–10 題 → 解鎖「英文達人」梗圖 🏆",
    quizStart:"開始測驗", selectTip:"💡 提示：用滑鼠框選句子裡不會的單字 → 加入單字卡",
    prev:"上一題", next:"下一題", submit:"交卷！",
    vocabTitle:"我的單字卡", vocabLead:"測驗時框選存下來的單字會出現在這裡。點卡片可以翻面看中文意思。",
    vocabEmpty:"還沒有單字喔！去測驗區框選不會的單字吧。", goQuiz:"前往測驗",
    fcWord:"English", fcFlip:"點一下翻面 ↻", fcMeaning:"中文意思",
    markLearned:"✓ 已學會（移除）", shuffle:"🔀 洗牌",
    artTitle:"推薦文章", artLead:"選一個你有興趣的主題，點下方連結會在新分頁開啟我們精選的英文閱讀網站。", back:"‹ 回主題",
    memeTitle:"梗圖蒐集冊", memeLead:"完成測驗後，系統會依你的分數發放對應等級的梗圖。蒐集滿三種等級各 10 張就破關啦！",
    saveWord:"加入單字卡", newMeme:"🎉 新梗圖入手！", nice:"收下它！",
    // 動態
    heroPre:"嗨", heroPost:"，準備好不再是", heroBad:"菜英文", heroEnd:"了嗎？",
    statVocab:"已收單字", statMeme:"梗圖收集", statQuiz:"測驗次數", statBest:"最佳成績",
    tileQuizStat:n=>`最佳 ${n}/10`, tileVocabStat:n=>`${n} 張單字`, tileArtStat:n=>`${n} 個主題`, tileMemeStat:n=>`${n}/30`,
    progress:n=>`${n} / 10`, qcounter:(a,b)=>`${a} / ${b}`,
    toastSaved:w=>`已加入單字卡：${w}`, toastDup:w=>`「${w}」已經在單字卡裡囉`,
    toastLearned:"已標記為學會 ✓", reviewTitle:"📋 詳解",
    correctIs:"正解", yourAns:"你的答案", noAns:"未作答",
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
    quizIntro:"10 multiple-choice blanks. See a word you don't know? <b>Select it with your mouse</b> to save it to your flashcards! Finish to earn a meme based on your score.",
    quizRuleBad:"0–2 correct → unlock “Bad English” memes 🍜",
    quizRuleMid:"3–7 correct → unlock “Getting Better” memes 📈",
    quizRuleGood:"8–10 correct → unlock “English Pro” memes 🏆",
    quizStart:"Start quiz", selectTip:"💡 Tip: select any word in the sentence to add it to your flashcards.",
    prev:"Prev", next:"Next", submit:"Submit!",
    vocabTitle:"My Flashcards", vocabLead:"Words you saved during quizzes appear here. Tap a card to flip and see the meaning.",
    vocabEmpty:"No words yet! Go to the quiz and select words you don't know.", goQuiz:"Go to quiz",
    fcWord:"English", fcFlip:"tap to flip ↻", fcMeaning:"Meaning",
    markLearned:"✓ Learned (remove)", shuffle:"🔀 Shuffle",
    artTitle:"Recommended Articles", artLead:"Pick a topic you like; links open our hand-picked English reading sites in a new tab.", back:"‹ Back",
    memeTitle:"Meme Collection Book", memeLead:"Finish a quiz and you'll earn a meme matching your score. Fill all 3 tiers (10 each) to 100%!",
    saveWord:"Add to cards", newMeme:"🎉 New meme unlocked!", nice:"Claim it!",
    heroPre:"Hey", heroPost:", ready to stop being", heroBad:"bad at English", heroEnd:"?",
    statVocab:"Words saved", statMeme:"Memes", statQuiz:"Quizzes taken", statBest:"Best score",
    tileQuizStat:n=>`Best ${n}/10`, tileVocabStat:n=>`${n} cards`, tileArtStat:n=>`${n} topics`, tileMemeStat:n=>`${n}/30`,
    progress:n=>`${n} / 10`, qcounter:(a,b)=>`${a} / ${b}`,
    toastSaved:w=>`Saved to cards: ${w}`, toastDup:w=>`“${w}” is already in your cards`,
    toastLearned:"Marked as learned ✓", reviewTitle:"📋 Review",
    correctIs:"Correct", yourAns:"Your answer", noAns:"No answer",
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
    welcome:n=>`Welcome back, ${n}!`
  }
};
let lang = store.get("cy_lang") || "zh";
const t = (k) => (I18N[lang][k] ?? I18N.zh[k] ?? k);

/* ============================================================
   2. 資料：題庫 / 單字字典 / 梗圖 / 文章主題
   ============================================================ */

/* 10 題填空（主題扣 SDG：能源、貧窮、回收、教育、氣候、水、平等、污染、永續、衛生）*/
const QUESTIONS = [
   { q:"We should use ___ energy like solar and wind to protect the planet.",
    options:["renewable","expensive","heavy","loud"], answer:0,
    explain:{
      zh:"renewable = 可再生的。太陽能、風能屬於再生能源。\n📚 文法：形容詞放在名詞 energy 前修飾，re-（再次）+ new（新）+ -able（可以…的）= 可再生的。",
      en:"renewable = able to be replaced naturally (solar, wind).\n📚 Grammar: adjective before noun 'energy'. re- (again) + new + -able (capable of) = renewable."
    }
  },
  { q:"Reducing ___ helps make sure everyone has enough food and shelter.",
    options:["poverty","poetry","pottery","property"], answer:0,
    explain:{
      zh:"poverty = 貧窮。SDG 1 的目標就是終結貧窮。\n📚 文法：動名詞 Reducing 當主詞；poverty 是不可數名詞，注意拼字不要和 poetry（詩）搞混。",
      en:"poverty = being poor; SDG 1 aims to end it.\n📚 Grammar: 'Reducing' is a gerund (subject). 'poverty' is uncountable — don't mix it up with 'poetry' (poems)."
    }
  },
  { q:"Please ___ your plastic bottles instead of throwing them away.",
    options:["destroy","recycle","waste","ignore"], answer:1,
    explain:{
      zh:"recycle = 回收再利用。\n📚 文法：祈使句（Please + 動詞原形）。re-（再次）+ cycle（循環）= 循環再利用。instead of + 動名詞 throwing，表示「而不是…」。",
      en:"recycle = to process used materials for reuse.\n📚 Grammar: imperative sentence (Please + base verb). re- (again) + cycle = recycle. 'instead of' is followed by a gerund (throwing)."
    }
  },
  { q:"Quality ___ gives children the skills they need for the future.",
    options:["decoration","vacation","education","celebration"], answer:2,
    explain:{
      zh:"education = 教育。本網站響應的正是 SDG 4 優質教育！\n📚 文法：-tion 是名詞字尾，educate（動詞）→ education（名詞）。Quality education 是名詞片語當主詞。",
      en:"education = the process of teaching/learning; this site supports SDG 4!\n📚 Grammar: '-tion' turns verbs into nouns: educate → education. 'Quality education' is a noun phrase acting as subject."
    }
  },
  { q:"Climate ___ is one of the biggest problems facing our world today.",
    options:["change","chance","cheese","charge"], answer:0,
    explain:{
      zh:"climate change = 氣候變遷。\n📚 文法：climate + change 是複合名詞（compound noun）。注意 change / chance / charge 三個字拼法很像，靠語意判斷：問題脈絡是環境，所以選 change。",
      en:"climate change = long-term shifts in global weather patterns.\n📚 Grammar: compound noun (climate + change). Watch out for similar spellings: change / chance / charge — use context (environment topic) to pick the right one."
    }
  },
  { q:"We must ___ water because it is a limited resource.",
    options:["waste","spill","conserve","pour"], answer:2,
    explain:{
      zh:"conserve = 節約、保護（資源）。\n📚 文法：must + 動詞原形（情態助動詞）。con-（一起/加強）+ serve（保持）= 妥善保存。because 引導原因副詞子句。",
      en:"conserve = to use carefully and avoid wasting.\n📚 Grammar: 'must' + base verb (modal auxiliary). con- (together/intensive) + serve (keep) = conserve. 'because' introduces a reason clause."
    }
  },
  { q:"Gender ___ means men and women have the same rights.",
    options:["quality","equality","quantity","equally"], answer:1,
    explain:{
      zh:"equality = 平等。gender equality 性別平等是 SDG 5。\n📚 文法：equal（形容詞）+ -ity（名詞字尾）= equality。注意 quality（品質）和 equality 只差一個字母 e，別拼錯！",
      en:"equality = the state of having equal rights.\n📚 Grammar: equal (adj) + -ity (noun suffix) = equality. Don't confuse with 'quality' (standard/level) — they differ by just one letter!"
    }
  },
  { q:"Air ___ from cars and factories is bad for our health.",
    options:["solution","collection","population","pollution"], answer:3,
    explain:{
      zh:"pollution = 污染。\n📚 文法：pollute（動詞）+ -tion → pollution（名詞）。from cars and factories 是介系詞片語，修飾前面的 Air pollution。",
      en:"pollution = harmful substances in the environment.\n📚 Grammar: pollute (verb) + -tion → pollution (noun). 'from cars and factories' is a prepositional phrase modifying 'Air pollution'."
    }
  },
  { q:"A ___ city tries to grow without harming the environment.",
    options:["sustainable","suitable","sensible","valuable"], answer:0,
    explain:{
      zh:"sustainable = 永續的。SDG 11 講的就是永續城市。\n📚 文法：形容詞修飾名詞 city。sustain（維持）+ -able（能…的）= 能持續維持的。without + 動名詞 harming，表示「不…的情況下」。",
      en:"sustainable = able to continue without damaging the planet.\n📚 Grammar: adjective before noun 'city'. sustain + -able = sustainable. 'without + gerund (harming)' expresses doing something without a certain action."
    }
  },
  { q:"Clean water and good ___ keep communities healthy.",
    options:["station","sanitation","situation","salvation"], answer:1,
    explain:{
      zh:"sanitation = 衛生設施（如乾淨廁所）。SDG 6。\n📚 文法：and 連接兩個主詞（Clean water and good sanitation），所以動詞用複數 keep。sanit-（健康/清潔，拉丁語根）+ -ation（名詞字尾）。",
      en:"sanitation = clean conditions like safe toilets and drainage. SDG 6.\n📚 Grammar: compound subject (Clean water AND good sanitation) → plural verb 'keep'. Latin root sanit- (healthy/clean) + -ation (noun suffix)."
    }
  }
];

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
  enough:"足夠的", everyone:"每個人", instead:"取而代之", away:"離開、走開"
};

/* 30 張原創梗圖（純文字＋emoji，避免侵權；分三等級各 10 張）*/
const MEME_BG = {
  bad:["#FF5A4D","#FF7A45","#E8533F","#FF6F61","#F4623A","#FF8552","#E25746","#FF6B6B","#F26430","#FF5252"],
  mid:["#FFC83D","#FFB02E","#3D7BFF","#F4A300","#5B8DEF","#FFB703","#4D96FF","#FFC75F","#3C91E6","#FFA62B"],
  good:["#12A594","#1BA784","#0FB67A","#16B89B","#13A89F","#2BB673","#08A88A","#1FAB89","#0FB18C","#19B5A0"]
};
function M(tier, i, emoji, top, bottom){ return { id:`${tier}-${i}`, tier, emoji, top, bottom, bg:MEME_BG[tier][i-1] }; }
const MEMES = [
  // ---- bad（菜英文）----
  M("bad",1,"😅","When the teacher says","“read it in english”"),
  M("bad",2,"🫠","my brain in the test","404: vocab not found"),
  M("bad",3,"🥲","got 2 correct","but i showed up, ok?"),
  M("bad",4,"🐢","slow progress","is still progress"),
  M("bad",5,"🔥","this is fine","我英文沒事（其實有事）"),
  M("bad",6,"🆘","english:","why you no make sense"),
  M("bad",7,"🍜","菜英文?","at least i can order noodles"),
  M("bad",8,"😴","vocabulary","saved for later (forever)"),
  M("bad",9,"🧠","loading english...","0%"),
  M("bad",10,"💪","today: 菜英文","tomorrow: less 菜"),
  // ---- mid（漸入佳境）----
  M("mid",1,"😎","halfway to fluent","not bad, human"),
  M("mid",2,"📈","my english","stonks ↗"),
  M("mid",3,"🚀","leveling up","vocabulary +5"),
  M("mid",4,"🧗","still climbing","但風景變好了"),
  M("mid",5,"🦉","the owl is proud","今天沒偷懶"),
  M("mid",6,"☕","one more quiz","one more coffee"),
  M("mid",7,"🎯","getting closer","命中率上升中"),
  M("mid",8,"🌱","english skill","now growing"),
  M("mid",9,"🤓","i understood that","most of it"),
  M("mid",10,"🏃","keep going","終點在前面"),
  // ---- good（英文達人）----
  M("good",1,"🏆","english boss","defeated"),
  M("good",2,"🧠","big brain","energy"),
  M("good",3,"👑","who is 菜英文?","not me anymore"),
  M("good",4,"✨","fluent mode","activated"),
  M("good",5,"🎓","certified","英文小達人"),
  M("good",6,"🦾","vocabulary","maxed out"),
  M("good",7,"🌟","teacher: explain this","me: easy"),
  M("good",8,"🚀","to fluency","and beyond"),
  M("good",9,"🔥","on fire","答對 8+ 題"),
  M("good",10,"🥇","english olympics","gold medal")
];

/* 推薦文章主題 + 連結（點擊開新分頁，連到真實英文學習網站）*/
const TOPICS = [
  { id:"news", emoji:"🗞️", title:{zh:"新聞時事",en:"News"}, desc:{zh:"用淺顯英文讀世界大小事",en:"World news in simple English"},
    links:[
      { emoji:"📻", name:"BBC Learning English", url:"https://www.bbc.co.uk/learningenglish", desc:{zh:"BBC 官方英語學習，含影音與測驗",en:"BBC's official English-learning hub"} },
      { emoji:"🇺🇸", name:"VOA Learning English", url:"https://learningenglish.voanews.com/", desc:{zh:"放慢語速的美國之音新聞",en:"News read at a slower pace"} },
      { emoji:"📰", name:"Breaking News English", url:"https://breakingnewsenglish.com/", desc:{zh:"同一則新聞分七種難度",en:"Each story at 7 difficulty levels"} }
    ] },
  { id:"sdg", emoji:"🌍", title:{zh:"環境永續",en:"Sustainability"}, desc:{zh:"讀 SDG 與地球的故事",en:"SDGs and our planet"},
    links:[
      { emoji:"🎯", name:"UN Sustainable Development Goals", url:"https://www.un.org/sustainabledevelopment/", desc:{zh:"聯合國 17 項永續目標官網",en:"The UN's 17 global goals"} },
      { emoji:"🦋", name:"National Geographic — Environment", url:"https://www.nationalgeographic.com/environment", desc:{zh:"國家地理的環境專題",en:"NatGeo environment stories"} },
      { emoji:"🌡️", name:"NASA Climate Kids", url:"https://climatekids.nasa.gov/", desc:{zh:"NASA 用簡單英文講氣候",en:"NASA explains climate simply"} }
    ] },
  { id:"sci", emoji:"🔬", title:{zh:"科學科技",en:"Science & Tech"}, desc:{zh:"探索有趣的知識",en:"Curious ideas worth reading"},
    links:[
      { emoji:"🎤", name:"TED Talks", url:"https://www.ted.com/talks", desc:{zh:"附逐字稿與字幕的演講",en:"Talks with transcripts & subtitles"} },
      { emoji:"💡", name:"TED-Ed", url:"https://ed.ted.com/", desc:{zh:"動畫短片＋課程",en:"Animated lessons"} },
      { emoji:"🧪", name:"Science News Explores", url:"https://www.snexplores.org/", desc:{zh:"寫給學生的科學新聞",en:"Science news for students"} }
    ] },
  { id:"life", emoji:"🍵", title:{zh:"生活英文",en:"Everyday English"}, desc:{zh:"日常用得到的實用英文",en:"Practical day-to-day English"},
    links:[
      { emoji:"⏱️", name:"BBC 6 Minute English", url:"https://www.bbc.co.uk/learningenglish/english/features/6-minute-english", desc:{zh:"六分鐘學一個主題",en:"Learn a topic in 6 minutes"} },
      { emoji:"📖", name:"Cambridge Dictionary Blog", url:"https://dictionaryblog.cambridge.org/", desc:{zh:"劍橋字典的用字部落格",en:"Word & usage blog"} },
      { emoji:"🗽", name:"VOA — Everyday Grammar", url:"https://learningenglish.voanews.com/z/1689", desc:{zh:"生活情境文法教學",en:"Grammar for real life"} }
    ] }
];

/* ============================================================
   3. 使用者狀態 & 每位使用者的資料
   ============================================================ */
let currentUser = store.get("cy_current") || null;
const K = {
  vocab:  u => `cy::${u}::vocab`,
  memes:  u => `cy::${u}::memes`,
  stats:  u => `cy::${u}::stats`
};
const getVocab = () => J.get(K.vocab(currentUser), []);
const setVocab = (v) => J.set(K.vocab(currentUser), v);
const getMemes = () => J.get(K.memes(currentUser), []);      // 已收集的梗圖 id 陣列
const setMemes = (m) => J.set(K.memes(currentUser), m);
const getStats = () => J.get(K.stats(currentUser), { quizzes:0, best:0, last:0 });
const setStats = (s) => J.set(K.stats(currentUser), s);

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
  if($("#view-home").classList.contains("active")) renderHome();
if($("#view-articles").classList.contains("active")) renderTopics();
if($("#view-memes").classList.contains("active")) renderMemes();
if($("#view-vocab").classList.contains("active")) renderVocab();
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
  go("home");
}

/* ============================================================
   7. 導覽
   ============================================================ */
function go(view){
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${view}`));
  $$(".navlink").forEach(n => n.classList.toggle("active", n.dataset.go === view));
  window.scrollTo({ top:0, behavior:"smooth" });
  if(view==="home")     renderHome();
  if(view==="vocab")    renderVocab();
  if(view==="articles") { renderTopics(); $("#topic-detail").classList.add("hidden"); $("#topic-grid").classList.remove("hidden"); }
  if(view==="memes")    renderMemes();
  if(view==="quiz")     resetQuizToIntro();
}
$$("[data-go]").forEach(btn => btn.addEventListener("click", () => go(btn.dataset.go)));
$("#go-home").addEventListener("click", () => go("home"));

/* ============================================================
   8. 首頁統計
   ============================================================ */
function renderHome(){
  const vocab = getVocab().length;
  const memes = getMemes().length;
  const stats = getStats();
  // hero 統計
  $("#hero-stats").innerHTML = [
    statBox(vocab, t("statVocab")),
    statBox(`${memes}/30`, t("statMeme")),
    statBox(stats.quizzes, t("statQuiz")),
    statBox(`${stats.best}/10`, t("statBest"))
  ].join("");
  // 磚塊小標
  $("#tile-quiz-stat").textContent  = t("tileQuizStat")(stats.best);
  $("#tile-vocab-stat").textContent = t("tileVocabStat")(vocab);
  $("#tile-art-stat").textContent   = t("tileArtStat")(TOPICS.length);
  $("#tile-meme-stat").textContent  = t("tileMemeStat")(memes);
}
const statBox = (n,l) => `<div class="stat-box"><div class="stat-num">${n}</div><div class="stat-label">${l}</div></div>`;

/* ============================================================
   9. 測驗流程
   ============================================================ */
let qIndex = 0;
let qAnswers = new Array(QUESTIONS.length).fill(null);

function resetQuizToIntro(){
  $("#quiz-intro").classList.remove("hidden");
  $("#quiz-play").classList.add("hidden");
  $("#quiz-result").classList.add("hidden");
}
$("#quiz-start").addEventListener("click", () => {
  qIndex = 0; qAnswers = new Array(QUESTIONS.length).fill(null);
  $("#quiz-intro").classList.add("hidden");
  $("#quiz-result").classList.add("hidden");
  $("#quiz-play").classList.remove("hidden");
  renderQuestion();
});

function renderQuestion(){
  const q = QUESTIONS[qIndex];
  $("#q-num").textContent = qIndex + 1;
  // 進度
  const pct = ((qIndex+1) / QUESTIONS.length) * 100;
  $("#quiz-progress-fill").style.width = pct + "%";
  $("#quiz-progress-text").textContent = t("qcounter")(qIndex+1, QUESTIONS.length);
  // 已作答過的題目，不論從哪個方向過來都顯示解釋
  const old = document.getElementById("quiz-explain");
  if(old) old.remove();
  if(qAnswers[qIndex] !== null) showExplain(qIndex);
  // 題目（把 ___ 換成底線空格）
  const parts = q.q.split(/_{2,}/);
  $("#quiz-question").innerHTML = parts.join('<span class="blank">?</span>');
  // 選項
  const keys = ["A","B","C","D"];
  $("#quiz-options").innerHTML = q.options.map((opt,i) =>
    `<button class="opt${qAnswers[qIndex]===i?" selected":""}" data-opt="${i}">
       <span class="opt-key">${keys[i]}</span><span>${escapeHtml(opt)}</span>
     </button>`).join("");
  $$("#quiz-options .opt").forEach(btn => btn.addEventListener("click", () => {
    if(qAnswers[qIndex] !== null) return;
    qAnswers[qIndex] = +btn.dataset.opt;
    $$("#quiz-options .opt").forEach(b => b.classList.toggle("selected", b===btn));
    showExplain(qIndex);
  }));
  
  // 導覽按鈕
  $("#quiz-prev").style.visibility = qIndex === 0 ? "hidden" : "visible";
  $("#quiz-next").innerHTML = qIndex === QUESTIONS.length-1 ? t("submit") : t("next");
}
$("#quiz-prev").addEventListener("click", () => { if(qIndex>0){ qIndex--; renderQuestion(); } });
$("#quiz-next").addEventListener("click", () => {
  if(qAnswers[qIndex] === null){ toast(t("needAnswer")); return; }
  if(qIndex < QUESTIONS.length-1){ qIndex++; renderQuestion(); }
  else finishQuiz();
});

function showExplain(idx){
  const q = QUESTIONS[idx];
  const my = qAnswers[idx];
  const correct = q.answer;
  const isOk = my === correct;
  const keys = ["A","B","C","D"];

  // 鎖定所有選項
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

  // 移除舊的解釋區（避免重複）
  const old = document.getElementById("quiz-explain");
  if(old) old.remove();

  // 解釋文字：把 \n 換成 <br>
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

function finishQuiz(){
  const score = qAnswers.reduce((s,a,i) => s + (a === QUESTIONS[i].answer ? 1 : 0), 0);
  // 更新統計
  const stats = getStats();
  stats.quizzes += 1; stats.last = score; stats.best = Math.max(stats.best, score);
  setStats(stats);
  // 決定等級：0-2 bad / 3-7 mid / 8-10 good
  const tier = score <= 2 ? "bad" : score <= 7 ? "mid" : "good";
  // 發梗圖
  const award = awardMeme(tier);
  // 顯示結果
  $("#quiz-play").classList.add("hidden");
  const tierName = { bad:t("tierBadName"), mid:t("tierMidName"), good:t("tierGoodName") }[tier];
  const tierMsg  = { bad:t("tierBadMsg"),  mid:t("tierMidMsg"),  good:t("tierGoodMsg")  }[tier];
  const tierEmoji= { bad:"🍜", mid:"📈", good:"🏆" }[tier];
  const tierClass= { bad:"bad", mid:"mid", good:"good" }[tier];

  $("#quiz-result").innerHTML = `
    <div class="result-card card">
      <div class="result-emoji">${tierEmoji}</div>
      <div class="result-tier ${tierClass}">${tierName}</div>
      <div class="result-score">${t("scoreLabel")(score)}</div>
      <p class="result-msg">${tierMsg}</p>
      <div class="result-msg" style="color:var(--teal);font-weight:900">
        ${award ? `🎁 ${t("awardGot")}` : `✅ ${t("awardFull")}`}
      </div>
      <div class="result-actions">
        <button class="btn btn-coral" id="res-retake">${t("retake")}</button>
        <button class="btn btn-yellow" id="res-memes">${t("seeMemes")}</button>
        <button class="btn btn-ghost" id="res-review">${t("reviewBtn")}</button>
      </div>
      <div id="review-box"></div>
    </div>`;
  $("#quiz-result").classList.remove("hidden");
  $("#res-retake").addEventListener("click", () => $("#quiz-start").click());
  $("#res-memes").addEventListener("click", () => { lastAward = award; go("memes"); });
  $("#res-review").addEventListener("click", renderReview);

  // 跳出解鎖彈窗
  if(award) showMemeModal(award);
}

function renderReview(){
  const box = $("#review-box");
  if(box.dataset.open === "1"){ box.innerHTML=""; box.dataset.open="0"; return; }
  box.dataset.open = "1";
  const keys=["A","B","C","D"];
  box.innerHTML = `<div class="review"><h4>${t("reviewTitle")}</h4>` +
    QUESTIONS.map((q,i) => {
      const my = qAnswers[i];
      const correct = q.answer;
      const myTxt = my===null ? t("noAns") : `${keys[my]}. ${q.options[my]}`;
      const ok = my === correct;
      return `<div class="review-item">
        <div class="rv-q">Q${i+1}. ${escapeHtml(q.q.replace(/_{2,}/,'＿＿＿'))}</div>
        <div class="rv-a ${ok?'rv-correct':'rv-wrong'}">${ok?'✓':'✗'} ${t("yourAns")}：${escapeHtml(myTxt)}</div>
        ${ok?'':`<div class="rv-a rv-correct">✓ ${t("correctIs")}：${keys[correct]}. ${q.options[correct]}</div>`}
        <div class="rv-exp">${q.explain[lang] || q.explain.zh}</div>
      </div>`;
    }).join("") + `</div>`;
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
  const meaning = DICT[key] || (lang==="en" ? "(custom word — look it up!)" : "（自訂單字，記得自己查一下意思）");
  vocab.push({ word, meaning, addedAt: Date.now() });
  setVocab(vocab);
  toast(t("toastSaved")(word));
}

/* ============================================================
   11. 單字卡 flashcards
   ============================================================ */
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
  $("#fc-meaning").textContent = card.meaning;
  $("#flashcard").classList.remove("flipped");
  $("#vocab-counter").textContent = t("qcounter")(vIndex+1, vocab.length);
}
$("#flashcard").addEventListener("click", () => $("#flashcard").classList.toggle("flipped"));
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
      return `<div class="meme${justGot}" style="background:${m.bg}">
        <div class="meme-top">${escapeHtml(m.top)}</div>
        <div class="meme-emoji">${m.emoji}</div>
        <div class="meme-bottom">${escapeHtml(m.bottom)}</div>
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
  $("#modal-meme").innerHTML = `<div class="meme" style="background:${m.bg}">
    <div class="meme-top">${escapeHtml(m.top)}</div>
    <div class="meme-emoji">${m.emoji}</div>
    <div class="meme-bottom">${escapeHtml(m.bottom)}</div>
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