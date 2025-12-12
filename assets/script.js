// ====== 1) データ ======
const SITE = window.SITE;
if(!SITE){
  throw new Error("SITE data not loaded. Make sure assets/site-data.js is included before assets/script.js");
}

// ====== 2) 共通UI ======
function $(sel){ return document.querySelector(sel); }
function el(tag, props={}, children=[]){
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k,v])=>{
    if(k === "class") e.className = v;
    else if(k === "html") e.innerHTML = v;
    else e.setAttribute(k, v);
  });
  children.forEach(c => e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return e;
}

function setActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(a=>{
    const href = a.getAttribute("href");
    if(href === path) a.classList.add("active");
  });
}

function setupMobileNav(){
  const btn = $("#navToggle");
  const nav = $("nav");
  if(!btn || !nav) return;

  btn.addEventListener("click", ()=>{
    nav.classList.toggle("open");
    const expanded = nav.classList.contains("open");
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  });

  // 外側クリックで閉じる（モバイル）
  document.addEventListener("click", (e)=>{
    if(window.matchMedia("(max-width: 720px)").matches){
      const isClickInside = nav.contains(e.target) || btn.contains(e.target);
      if(!isClickInside) nav.classList.remove("open");
    }
  });
}

function showToast(message){
  const t = $("#toast");
  if(!t) return;
  t.textContent = message;
  t.style.display = "block";
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(()=>{ t.style.display="none"; }, 1800);
}

// ====== 3) ページ別レンダリング ======
function newsItemNode(n){
  const tags = (n.tags || []);
  const tagsNode = tags.length
    ? el("div", { class:"news-tags" }, tags.map(t => el("span", { class:"tag" }, [t])))
    : el("div", { class:"news-tags" });

  const titleNode = n.url
    ? el("a", { href:n.url, target:"_blank", rel:"noopener" }, [n.text])
    : el("div", {}, [n.text]);

  return el("li", {}, [
    // 1行目：日付 + タグ
    el("div", { class:"news-head" }, [
      el("div", { class:"news-date" }, [n.date]),
      tagsNode,
    ]),
    // 2行目：タイトル
    el("div", { class:"news-title" }, [titleNode]),
  ]);
}

function renderNewsTimeline(limit = 5){
  const ul = $("#newsTimeline");
  if(!ul) return;
  ul.innerHTML = "";

  // 日付の新しい順に並べ替え（YYYY-MM-DD想定）
  const sorted = [...(SITE.news || [])].sort((a,b)=> new Date(b.date) - new Date(a.date));
  sorted.slice(0,limit).forEach(n => ul.appendChild(newsItemNode(n)));
}

function renderNewsAll(){
  const ul = $("#newsAllList");
  if(!ul) return;
  ul.innerHTML = "";

  // 日付の新しい順に並べ替え（YYYY-MM-DD想定）
  const sorted = [...(SITE.news || [])].sort((a,b)=> new Date(b.date) - new Date(a.date));
  sorted.forEach(n => ul.appendChild(newsItemNode(n)));
}

function renderNews(){
  const ul = $("#newsList");
  if(!ul) return;
  ul.innerHTML = "";

  // 日付の新しい順に並べ替え（YYYY-MM-DD想定）
  const sorted = [...(SITE.news || [])].sort((a,b)=> new Date(b.date) - new Date(a.date));
  sorted.slice(0,5).forEach(n => ul.appendChild(newsItemNode(n)));
}

function renderLinks(){
  const box = $("#linkButtons");
  if(!box) return;
  box.innerHTML = "";
  SITE.links.forEach(l=>{
    box.appendChild(el("a", { class:"btn", href:l.url, target:"_blank", rel:"noopener" }, [l.label]));
  });
}

function renderFeatured(){
  const pub = $("#featuredPubs");
  const prj = $("#featuredProjects");

  if(pub){
    pub.innerHTML = "";
    SITE.publications.slice(0,3).forEach(p=>{
      pub.appendChild(el("li", {}, [
        el("div", { class:"kicker" }, [`${p.year} • ${p.venue}`]),
        p.url ? el("a", { href:p.url, target:"_blank", rel:"noopener" }, [p.title]) : el("div", {}, [p.title]),
        el("div", { class:"small" }, [p.authors]),
      ]));
    });
  }

  if(prj){
    prj.innerHTML = "";
    SITE.projects.slice(0,3).forEach(p=>{
      prj.appendChild(el("li", {}, [
        el("div", { class:"kicker" }, [`${p.year}`]),
        p.url ? el("a", { href:p.url, target:"_blank", rel:"noopener" }, [p.title]) : el("div", {}, [p.title]),
        el("div", { class:"small" }, [p.desc]),
      ]));
    });
  }
}

function renderPublicationsAndProjects(){
  const pub = $("#pubList");
  const prj = $("#projectList");
  if(pub){
    pub.innerHTML = "";
    SITE.publications
      .sort((a,b)=>b.year-a.year)
      .forEach(p=>{
        pub.appendChild(el("li", {}, [
          el("div", { class:"row" }, [
            el("div", {}, [
              el("div", { class:"kicker" }, [`${p.year} • ${p.venue}`]),
              p.url ? el("a", { href:p.url, target:"_blank", rel:"noopener" }, [p.title]) : el("div", {}, [p.title]),
              el("div", { class:"small" }, [p.authors]),
            ]),
          ]),
        ]));
      });
  }
  if(prj){
    prj.innerHTML = "";
    SITE.projects
      .sort((a,b)=>b.year-a.year)
      .forEach(p=>{
        prj.appendChild(el("li", {}, [
          el("div", { class:"kicker" }, [`${p.year}`]),
          p.url ? el("a", { href:p.url, target:"_blank", rel:"noopener" }, [p.title]) : el("div", {}, [p.title]),
          el("div", { class:"small" }, [p.desc]),
        ]));
      });
  }
}

function setupEmailCopy(){
  const btn = $("#copyEmail");
  const span = $("#emailText");
  if(!btn || !span) return;
  span.textContent = SITE.email;

  btn.addEventListener("click", async ()=>{
    try{
      await navigator.clipboard.writeText(SITE.email);
      showToast("メールアドレスをコピーしました");
    }catch{
      showToast("コピーできませんでした（ブラウザ権限をご確認ください）");
    }
  });
}

// function pubItemNode(p){
//   const titleNode = p.url
//     ? el("a", { href:p.url, target:"_blank", rel:"noopener" }, [p.title])
//     : el("div", {}, [p.title]);

//   return el("li", {}, [
//     el("div", { class:"kicker" }, [String(p.year)]),
//     titleNode,
//     el("div", { class:"small" }, [p.authors || ""])
//   ]);
// }

function renderPublicationsByType(type, listId){
  const ul = document.getElementById(listId);
  if(!ul) return;

  ul.innerHTML = "";

  const items = (SITE.publications || [])
    .filter(p => p.type === type)
    .sort((a,b) => b.year - a.year);

  items.forEach(p => ul.appendChild(pubItemNode(p)));
}

function awardItemNode(a){
  const titleNode = a.url
    ? el("a", { href:a.url, target:"_blank", rel:"noopener" }, [a.title])
    : el("div", {}, [a.title]);

  return el("li", {}, [
    el("div", { class:"kicker" }, [String(a.year)]),
    titleNode,
    el("div", { class:"small" }, [a.event || ""])
  ]);
}

function renderAwards(){
  const ul = document.getElementById("awardList");
  if(!ul || !SITE.awards) return;

  ul.innerHTML = "";

  const items = [...SITE.awards].sort((a,b) => b.year - a.year);

  items.forEach(a => ul.appendChild(awardItemNode(a)));
}

// type をもとに、"journal" / "thesis" / "conf" に正規化する
function getPubKind(p){
  const t = (p.type || "").toLowerCase();

  if(t === "journal") return "journal";
  if(t === "thesis")  return "thesis";

  // それ以外（IntConf, DomConf など）はひとまず全部 conference 扱い
  return "conf";
}

// IEEE風フォーマットを「ノード列」で作る（venueだけ斜体にする）
function buildPublicationInline(p){
  const nodes = [];
  const kind    = getPubKind(p);
  const authors = p.authors || "";
  const title   = p.title   || "";
  const venue   = p.venue   || "";
  const year    = p.year    || "";
  const pages   = p.pages;

  const vol   = p.volume;
  const no    = p.number;

  const hasPages = pages && pages !== "TBD";

  const addText = (s) => {
    if(!s) return;
    nodes.push(document.createTextNode(s));
  };

  const addVenue = () => {
    if(!venue) return;
    nodes.push(el("span", { class:"pub-venue" }, [venue]));
  };

  // ---------- Journal ----------
  if(kind === "journal"){
    addText(`${authors}, "${title}," `);
    if(venue){
      addVenue();
      addText(", ");
    }
    if(vol != null) addText(`vol. ${vol}, `);
    if(no  != null) addText(`no. ${no}, `);
    if(hasPages)    addText(`pp. ${pages}, `);
    if(year)        addText(`${year}.`);
    return nodes;
  }

  // ---------- Thesis ----------
  if(kind === "thesis"){
    addText(`${authors}, "${title}," `);
    if(venue){
      addVenue();
      addText(", ");
    }
    if(year) addText(`${year}.`);
    return nodes;
  }

  // ---------- Conference (IntConf / DomConf / その他) ----------
  addText(`${authors}, "${title}," `);
  if(venue){
    addVenue();
    addText(", ");
  }
  if(hasPages) addText(`pp. ${pages}, `);
  if(year)     addText(`${year}.`);

  return nodes;
}

function pubItemNode(p, index){
  const authors = p.authors || "";
  const title   = p.title   || "";
  const venue   = p.venue   || "";
  const year    = p.year    || "";

  // 1行目: 著者
  const authorsEl = el("div", { class:"pub-authors" }, [authors]);

  // 2行目: タイトル（クリック可能なら a に）
  const titleInner = p.url
    ? el("a", { href:p.url, target:"_blank", rel:"noopener" }, [`"${title},"`])
    : document.createTextNode(`"${title},"`);

  const titleEl = el("div", { class:"pub-title" }, [titleInner]);

  // 3行目: venue（斜体）と year
  const metaChildren = [];
  if(venue){
    metaChildren.push(el("span", { class:"pub-venue" }, [venue]));
  }
  if(year){
    const prefix = venue ? ", " : "";
    metaChildren.push(document.createTextNode(`${prefix}${year}.`));
  }
  const metaEl = el("div", { class:"pub-meta" }, metaChildren);

  const body = el("div", { class:"pub-body" }, [
    authorsEl,
    titleEl,
    metaEl,
  ]);

  return el("li", { class:"pub-item" }, [
    el("div", { class:"pub-row" }, [
      el("span", { class:"pub-index" }, [`[${index}]`]),
      body,
    ])
  ]);
}

function renderPublicationsByType(type, listId){
  const ul = document.getElementById(listId);
  if(!ul) return;

  ul.innerHTML = "";

  const items = (SITE.publications || [])
    .filter(p => p.type === type)
    .sort((a,b) => b.year - a.year);  // 年が新しい順（ここはそのまま）

  const n = items.length;

  items.forEach((p, idx) => {
    const displayIndex = n - idx;        // ← 一番上が [n]、最後が [1]
    ul.appendChild(pubItemNode(p, displayIndex));
  });
}


// ====== 4) 初期化 ======
document.addEventListener("DOMContentLoaded", ()=>{
  setActiveNav();
  setupMobileNav();

  // 共通
  const nameEl = $("#siteName");
  if(nameEl) nameEl.textContent = SITE.name;

  // index
  renderLinks();
  renderNews();
  renderFeatured();

  // profile
  renderAwards();

  // pubs
  renderPublicationsAndProjects();
  renderPublicationsByType("IntConf", "pubListIntConf");
  renderPublicationsByType("DomConf", "pubListDomConf");
  renderPublicationsByType("Journal", "pubListJournal");

  // contact
  setupEmailCopy();

  // news
  renderNewsTimeline(3);
  renderNewsAll();

  // footer year
  const y = $("#year");
  if(y) y.textContent = String(new Date().getFullYear());
});
  