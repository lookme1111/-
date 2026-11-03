const BOOK = [
  ['起点', '认识嵌入式学习路径', '先建立地图，学会把问题拆成可验证的任务。', '学习方法', '学习路径'],
  ['C语言', '为嵌入式实践做准备', '只补当前实践真正需要的C语言。', 'C语言', '基础练习'],
  ['GPIO与点灯', '完成第一个可验证项目', '从可观察的现象出发，走完一次最小验证。', 'GPIO', '点灯项目'],
  ['中断', '从轮询到响应事件', '理解设备如何及时响应外部变化。'],
  ['时钟', '理解系统运行的节奏', '弄清时间从哪里来。'],
  ['UART', '让设备说话', '用输出观察设备内部的状态。'],
  ['I2C与SPI', '连接外部器件', '从时序和协议理解通信。'],
  ['定时器、PWM与ADC', '感知和控制', '把时间、输出和模拟世界连接起来。'],
  ['DMA', '让数据搬运更有序', '理解数据搬运与CPU的分工。'],
  ['RTOS', '组织多个任务', '让任务安排更清晰。'],
  ['综合项目', '从需求走到验收', '把知识、调试与验收串起来。'],
  ['下一步', '复盘、选择与持续成长', '根据已经得到的证据选择方向。']
].map(([title, subtitle, description, topic = '', project = ''], index) => ({
  id: index + 1, title, subtitle, description, topic, project,
  volume: index < 3 ? 0 : index < 9 ? 1 : 2,
  open: index < 3
}));
const VOLUMES = [
  { name: '卷一', title: '找到起点，做出第一个结果', ids: [1, 2, 3] },
  { name: '卷二', title: '理解外设，建立排障思路', ids: [4, 5, 6, 7, 8, 9] },
  { name: '卷三', title: '组织系统，决定下一步方向', ids: [10, 11, 12] }
];
const STATUS = ['未读', '进行中', '已读', '已掌握', '需复习'];
const KEY = 'embedded-book-v1';
const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
const state = {
  chapter: Number(saved.chapter) >= 1 && Number(saved.chapter) <= 3 ? Number(saved.chapter) : null,
  statuses: saved.statuses || {},
  dialog: null,
  drawer: null,
  diagnosis: null,
  stuckChoice: null
};
const app = document.querySelector('#app');
const html = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const chapter = id => BOOK[id - 1];
const path = () => (location.hash.slice(1) || '/');
const view = () => path().split('?')[0];
const status = id => STATUS.includes(state.statuses[id]) ? state.statuses[id] : '未读';
const progress = () => [1, 2, 3].filter(id => ['已读', '已掌握'].includes(status(id))).length;
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify({ chapter: state.chapter, statuses: state.statuses })); } catch { /* private mode: this visit still works */ }
}
function link(label, href, kind = 'secondary', extra = '') {
  return `<a class="btn btn-${kind}" href="${href.startsWith('#') ? href : `#${href}`}" ${extra}>${label}</a>`;
}
function button(label, action, kind = 'secondary', extra = '') {
  return `<button class="btn btn-${kind}" type="button" data-action="${action}" ${extra}>${label}</button>`;
}
function header() {
  const current = view();
  return `<header class="topbar">
    <a href="#/" class="brand" aria-label="返回首页"><span class="brand-mark">嵌</span><span class="brand-name">嵌入式成长之书</span></a>
    <nav class="topnav" aria-label="网站导航">
      <a href="#/route" class="nav-link ${current === '/route' ? 'active' : ''}">路线图</a>
      <a href="#/templates" class="nav-link ${current === '/templates' ? 'active' : ''}">内容模板</a>
      <a href="#/diagnosis" class="nav-link ${current === '/diagnosis' ? 'active' : ''}">入口诊断</a>
      <a href="#/search" class="nav-link ${current === '/search' ? 'active' : ''}">搜索</a>
      <button class="nav-link" type="button" data-action="continue">继续学习</button>
    </nav>
    <a href="#/about" class="nav-link nav-link-alt ${current === '/about' ? 'active' : ''}">项目说明</a>
    <button class="global-menu-button" type="button" data-action="global-drawer" aria-controls="mobile-drawer">☰ 导航</button>
    <div class="progress-pill"><span class="progress-dot"></span>${progress() ? `已读 ${progress()} / 3 章` : '从你的起点开始'}</div>
  </header>`;
}
function footer() { return `<footer class="footer"><span>《嵌入式成长之书》 · MVP 范围、视觉规范与行动清单已记录</span><span>第1—3章已开放 · 内容待专家评审 · 版本 v0.5 · 勘误与许可证待确认</span></footer>`; }
function volumeCard(v, index) {
  return `<article class="path-card ${index === 0 ? 'open' : 'locked'}">
    <div class="volume-no">${v.name} / ${index === 0 ? 'CURRENT' : 'ROAD AHEAD'}</div><h3>${v.title}</h3>
    ${v.ids.map(id => `<div class="chapter-row"><span>第${id}章 · ${chapter(id).title}</span><span class="status ${id > 3 ? 'locked' : ''}">${id <= 3 ? '已开放' : '未开放'}</span></div>`).join('')}
  </article>`;
}
function quickCard(no, title, description, href) {
  return `<a class="quick-card" href="#${href}"><div class="quick-icon">${no}</div><h3>${title}</h3><p>${description}</p></a>`;
}
function home() {
  return `<main><section class="hero">
    <div class="hero-text"><div class="eyebrow">A guided book for embedded beginners</div>
      <h1>从迷茫到<br><span class="accent">下一个动作。</span></h1>
      <p class="hero-copy">嵌入式成长之书，不替你收集更多资料。它把每一步放回路线里，让你知道现在该做什么、为什么做、做完去哪。</p>
      <div class="hero-actions">${link('从起点开始 →', '/chapter/1', 'primary')}${link('用 3 个问题找入口', '/diagnosis')}${link('查看全书路线', '/route')}${button('继续学习', 'continue')}</div>
      <div class="hero-note"><span class="progress-dot"></span><span>首版开放 <strong>第1—3章的页面框架</strong> · 全书共 3 卷 12 章</span></div>
    </div>
    <div class="book-card" aria-label="嵌入式成长之书书封"><div class="book-spine"></div><div class="eyebrow">VOL. 01 / FIRST STEPS</div><div class="book-title">嵌入式<br>成长之书</div><div class="book-subtitle">给正在寻找下一步的嵌入式新手。路线、思路、项目与反馈，从一个能验证的结果开始。</div><div class="book-meta">START WHERE YOU ARE · KEEP GOING</div></div>
  </section>
  <section class="section" id="roadmap"><div class="section-inner"><div class="section-head"><div><div class="eyebrow">The roadmap</div><h2>先看见整本书，<br>再走今天这一步。</h2></div><p class="section-intro">每一章都有路线位置，每一次练习都要有结果。首版先把起点、C语言和第一个项目的结构走通。</p></div><div class="path-grid">${VOLUMES.map(volumeCard).join('')}</div><div class="section-more">${link('打开完整目录 →', '/route')}</div></div></section>
  <section class="section"><div class="section-inner"><div class="section-head"><div><div class="eyebrow">Choose your next move</div><h2>你现在要做什么？</h2></div><p class="section-intro">每个入口都通向明确的下一步，不需要从一堆资料中碰运气。</p></div><div class="quick-grid">
    ${quickCard('01','从起点开始','不知道该怎么学？先建立地图。','/chapter/1')}
    ${quickCard('02','入口诊断','用三个问题找到适合你的第一章。','/diagnosis')}
    ${quickCard('03','查看路线图','看清自己在全书的哪一卷、哪一章。','/route')}
    ${quickCard('04','内容模板','关键点、项目、思路、踩坑四套模板。','/templates')}
    <button type="button" class="quick-card" data-action="stuck"><div class="quick-icon">05</div><h3>我卡住了</h3><p>从当前现象出发，回到可验证的步骤。</p></button>
  </div></div></section>
  <section class="section"><div class="section-inner"><div class="section-head"><div><div class="eyebrow">Keep going</div><h2>你的学习位置</h2></div></div><div class="empty-state">${state.chapter ? `上次停在第${state.chapter}章「${chapter(state.chapter).title}」，目前已读 ${progress()} / 3 章。` : '你还没有学习记录。可以用入口诊断找起点，也可以直接从第1章开始。'}<span class="inline-actions">${state.chapter ? button('继续上次内容 →', 'continue', 'primary') : link('开始入口诊断 →', '/diagnosis', 'primary')}</span></div></div></section>
  </main>`;
}
function routeRow(c) {
  return `<div class="route-row"><span class="volume-no">第${String(c.id).padStart(2, '0')}章</span><span><span class="chapter-title">${c.title}：${c.subtitle}</span><br><span class="chapter-description">${c.description}</span></span><span>${c.open ? link('进入 →', `/chapter/${c.id}`) : link('未开放', `/preview/${c.id}`, 'quiet')}</span><details class="route-outline"><summary>查看本章四节目录${c.open ? '' : '（仅路线位置）'}</summary><ol>${LESSONS[c.id - 1].map((item, index) => `<li>${c.id}.${index + 1} ${item[0]}<small>前置知识：${item[1]} · 下一步：${item[2]}</small></li>`).join('')}</ol></details></div>`;
}
function routePage() {
  return `<main class="route-view"><section class="route-hero"><div class="eyebrow">The complete book</div><h1>一张地图，<br><span class="accent">十二个站点。</span></h1><p class="hero-copy">先知道自己在哪里，再决定下一步。第1—3章可进入页面框架，未开放章节只展示路线位置。</p><div class="route-summary"><span><strong>3</strong> 卷</span><span><strong>12</strong> 章</span><span><strong>3</strong> 章可进入</span></div></section>
  <section class="route-table" aria-label="全书目录">${VOLUMES.map((v, i) => `<div class="route-row volume"><strong>${v.name}</strong><span>${v.title}</span><span class="status ${i ? 'locked' : ''}">${i ? '后续路线' : '当前开放'}</span></div>${v.ids.map(id => routeRow(chapter(id))).join('')}`).join('')}</section></main>`;
}
const QUESTIONS = [
  { name:'q1', title:'你现在最想完成什么？', options:[['A','从零开始，先知道嵌入式怎么学'],['B','补好C语言，准备开始做项目'],['C','尽快做出能看到结果的小项目'],['D','我做过一些单片机内容，但知识零散'],['E','想转嵌入式Linux，或正在解决工作问题']] },
  { name:'q2', title:'哪项最接近你的C语言基础？', options:[['A','还不能独立看懂简单C程序'],['B','能看懂变量、条件、循环和函数'],['C','能修改简单程序，并理解编译和运行结果'],['D','能使用指针、结构体，并排查部分代码问题'],['E','不确定']] },
  { name:'q3', title:'哪项最接近你的嵌入式实践经验？', options:[['A','从未使用过开发板或单片机'],['B','看过教程，但没有独立完成过项目'],['C','完成过点灯或类似小项目'],['D','做过多个项目，但遇到问题时不知道如何定位'],['E','当前有一个具体问题卡住']] }
];
function questionMarkup(question, index) {
  return `<fieldset class="question"><legend>${index + 1} / ${question.title}</legend><div class="option-list">${question.options.map(([key, label]) => `<label class="option"><input type="radio" name="${question.name}" value="${key}" required><span><strong>${key}.</strong> ${label}</span></label>`).join('')}</div></fieldset>`;
}
// The precedence is exhaustive: every one of 5 × 5 × 5 answer combinations has exactly one result.
// An immediate blocker wins; weak C wins over prior experience; practiced readers self-check first.
function diagnose(q1, q2, q3) {
  if (q3 === 'E') return { group:'S5 · 方向转换者／问题处理者', title:'我卡住了', why:'当前有具体问题。先描述现象、做最小验证，再考虑要补哪段基础。', next:'选择问题现象，回到原步骤。', action:'stuck' };
  if (q2 === 'A' || q2 === 'E' || (q1 === 'A' && q3 === 'A')) return { group:'S1 · 零基础起步者', title:'第1章 · 起点', why:'先建立学习地图，知道如何判断一个任务是否完成。', next:'从第1章开始，再进入第2章。', href:'/chapter/1' };
  if (q2 === 'B' || q1 === 'B') return { group:'S2 · C语言准备者', title:'第2章 · C语言', why:'先补齐当前项目够用的C语言，再进入实践。', next:'从第2章的前置知识开始。', href:'/chapter/2' };
  if (q3 === 'C' || q3 === 'D' || q1 === 'D') return { group:'S4 · 基础不系统者', title:'第3章 · GPIO与点灯', why:'你已经做过实践，先检查能否解释、验证和定位问题。', next:'进入第3章后打开右侧本页目录，跳到“自测”区，再补需要复习的卡片。', href:'/chapter/3' };
  return { group:'S3 · 首个项目实践者', title:'第3章 · GPIO与点灯', why:'你具备够用的C基础，可以尝试第一个可观察的小项目。', next:'从第3章的前置知识开始。', href:'/chapter/3' };
}
function diagnosisPage() {
  return `<main class="focused-page"><div class="eyebrow">Three questions / 入口诊断</div><h1>找到你现在的起点。</h1><p class="lead">不用证明自己会多少。三个问题，只推荐一个起点；你随时可以重新选择。</p><form id="diagnosis-form">${QUESTIONS.map(questionMarkup).join('')}<div class="form-actions">${link('返回首页', '/') }<button type="submit" class="btn btn-primary">查看我的起点 →</button></div></form></main>`;
}
function resultPage() {
  if (!state.diagnosis) return `<main class="focused-page"><div class="eyebrow">入口诊断 / 结果</div><h1>还没有诊断结果。</h1><p class="lead">回答三个问题后，我们会给出一个推荐起点和它的下一步。</p>${link('开始入口诊断 →','/diagnosis','primary')}</main>`;
  const r = state.diagnosis;
  return `<main class="focused-page"><div class="eyebrow">你的推荐起点 · ${r.group}</div><h1>${r.title}</h1><p class="lead">这不是考试结果，只是现在最省力的一条起步路径。</p><div class="result"><h2>为什么从这里开始？</h2><p>${r.why}</p><h2>下一步做什么？</h2><p>${r.next}</p></div><div class="form-actions">${r.href ? link('进入推荐起点 →',r.href,'primary') : button('选择问题现象 →','stuck','primary')}${link('重新选择起点','/diagnosis')}</div>${r.group.startsWith('S4') ? '<p class="small-muted">自测链接将定位至该章的自测区，未通过可以返回前置知识。</p>' : ''}</main>`;
}
function previewPage(id) {
  const c = chapter(id);
  if (!c || c.open) return routePage();
  return `<main class="focused-page"><div class="eyebrow">${VOLUMES[c.volume].name} / 第${id}章 / 后续路线</div><h1>${c.title}</h1><p class="lead">${c.subtitle}。这是全书路线中的第${id}章，目前正文尚未开放。</p><div class="callout">你现在可以返回已开放章节，完成当前自测或项目结构预览。这里没有“立即学习”，也不会把空页面当作课程。</div><details class="preview-outline"><summary>查看本章目录草案（不含正文）</summary><ol>${LESSONS[id - 1].map((item, index) => `<li>${id}.${index + 1} ${item[0]}<small>前置知识：${item[1]} · 下一步：${item[2]}</small></li>`).join('')}</ol></details><div class="form-actions">${link('返回当前学习 →',`/chapter/${state.chapter || 1}`,'primary')}${link('查看全书路线','/route')}</div></main>`;
}
function searchPage() {
  const raw = new URLSearchParams(path().split('?')[1] || '').get('q') || '';
  const q = raw.trim().toLocaleLowerCase();
  const hits = q ? BOOK.filter(c => c.open && [c.title,c.subtitle,c.description,c.topic,c.project].some(value => value.toLocaleLowerCase().includes(q))) : [];
  return `<main class="focused-page"><div class="eyebrow">Find your place / 搜索</div><h1>按问题找位置，<br><span class="accent">再回到路线。</span></h1><p class="lead">仅搜索当前可进入的章节标题、知识点与项目类型；未开放内容不返回空学习页。</p><form id="search-form" class="search-form"><label for="query">搜索已开放内容</label><div class="search-line"><input id="query" type="search" name="q" value="${html(raw)}" placeholder="试试：GPIO、C语言、学习路径" required><button class="btn btn-primary" type="submit">搜索</button></div></form>
    ${q ? `<div class="result-list"><p class="small-muted">“${html(raw)}”找到 ${hits.length} 个结果</p>${hits.length ? hits.map(c => `<a class="search-hit" href="#/chapter/${c.id}"><span class="eyebrow">第${c.id}章 · ${VOLUMES[c.volume].name}</span><strong>${c.title}：${c.subtitle}</strong><span>${c.description}</span><small>知识点 · ${c.topic || c.title}　项目类型 · ${c.project || '非项目'}　标签值待内容评审后补齐</small></a>`).join('') : `<div class="empty-state">没找到可进入的内容。可以换一个词，或从全书路线选择当前章节。<div class="inline-actions">${link('查看路线图 →','/route')}</div></div>`}</div>` : '<p class="small-muted">你也可以直接查看全书路线，先确定当前所在的章节。</p>'}</main>`;
}
function aboutPage() {
  const doRows = MVP_DO.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="status">${r[3]}</span></td></tr>`).join('');
  const notRows = MVP_NOT.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
  const techRows = TECH.map((t, i) => `<tr class="${i === 0 ? 'recommended' : ''}"><td>${t.name}${i === 0 ? ' <span class="badge">推荐</span>' : ''}</td><td>${t.build}</td><td>${t.format}</td><td>${t.cost}</td><td>${t.fit}</td></tr>`).join('');
  const techDetail = TECH_DETAIL.map(r => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  const flowRows = WORKFLOW.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
  const metricRows = METRICS.map(r => `<tr><td>${r[0]}</td><td><strong>${r[1]}</strong></td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
  const stopRows = STOP_LINES.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
  const colorRows = COLORS.map(r => `<tr><td><code>${r[0]}</code></td><td><code>${r[1]}</code></td><td>${r[2]}</td></tr>`).join('');
  const fontRows = FONTS.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  const typeRows = TYPOGRAPHY.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
  const respRows = RESPONSIVE.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
  const structRows = DESIGN_STRUCTURE.map(r => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td></tr>`).join('');
  const humanRows = DESIGN_HUMAN.map(r => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td></tr>`).join('');
  const startRows = DESIGN_START.map((r, i) => `<tr><td>${i + 1}</td><td><strong>${r[0]}</strong></td><td>${r[1]}</td></tr>`).join('');
  const driftRows = DRIFT_SIGNALS.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
  const guardRows = GUARDRAILS.map(r => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td></tr>`).join('');
  const riskRows = RISKS.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  const planRows = PLAN_14.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  const qualityRows = QUALITY_CHECK.map((r, i) => `<tr><td>${i + 1}</td><td><strong>${r[0]}</strong></td><td>${r[1]}</td></tr>`).join('');
  const nextRows = NEXT_THREE.map((r, i) => `<tr><td>${i + 1}</td><td><strong>${r[0]}</strong></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
  return `<main class="about-view"><section class="about-hero"><div class="eyebrow">Project notes / 项目说明</div><h1>第一版做什么，<br><span class="accent">为什么这么做。</span></h1><p class="hero-copy">这份说明记录 MVP 范围、技术选型、评审工作流、止损线，以及视觉规范、纠偏机制与行动清单，让“给方向、给思路、给经验、给项目、给反馈”不跑偏。</p></section>
  <div class="about-body">
    <section class="about-block" id="about-mvp"><h2>1. MVP 功能清单</h2><h3>第一版做</h3><table class="about-table"><thead><tr><th>功能</th><th>为什么做</th><th>对应阅读目标</th><th>状态</th></tr></thead><tbody>${doRows}</tbody></table><h3>第一版不做（明确排除）</h3><table class="about-table"><thead><tr><th>排除项</th><th>原因</th></tr></thead><tbody>${notRows}</tbody></table></section>
    <section class="about-block" id="about-tech"><h2>2. 技术选型建议</h2><p class="lead">推荐保持纯静态、零构建，内容逐步 Markdown 化。</p><table class="about-table"><thead><tr><th>方案</th><th>构建</th><th>内容格式</th><th>维护成本</th><th>适合度</th></tr></thead><tbody>${techRows}</tbody></table><h3>建议细节</h3><table class="about-table"><thead><tr><th>项</th><th>建议</th><th>理由</th></tr></thead><tbody>${techDetail}</tbody></table></section>
    <section class="about-block" id="about-flow"><h2>3. 内容生产与评审工作流</h2><table class="about-table"><thead><tr><th>步骤</th><th>动作</th><th>产出</th><th>门禁</th></tr></thead><tbody>${flowRows}</tbody></table><div class="callout">AI 内容必须经专家评审才发布；代码未验证前不冒充“可烧录”；内容评审状态与读者阅读状态分开记录。</div></section>
    <section class="about-block" id="about-metrics"><h2>4. 指标、实验与止损线</h2><h3>北极星与过程指标</h3><table class="about-table"><thead><tr><th>层级</th><th>指标</th><th>定义</th><th>用途</th></tr></thead><tbody>${metricRows}</tbody></table><h3>止损线</h3><table class="about-table"><thead><tr><th>止损条件</th><th>触发动作</th></tr></thead><tbody>${stopRows}</tbody></table></section>
    <section class="about-block" id="about-visual"><h2>5. 视觉与阅读体验规范</h2><h3>色彩</h3><table class="about-table"><thead><tr><th>变量</th><th>值</th><th>用途</th></tr></thead><tbody>${colorRows}</tbody></table><h3>字体</h3><table class="about-table"><thead><tr><th>用途</th><th>字体</th><th>说明</th></tr></thead><tbody>${fontRows}</tbody></table><h3>排版与留白</h3><table class="about-table"><thead><tr><th>项</th><th>规范</th></tr></thead><tbody>${typeRows}</tbody></table><h3>响应式</h3><table class="about-table"><thead><tr><th>断点</th><th>行为</th></tr></thead><tbody>${respRows}</tbody></table></section>
    <section class="about-block" id="about-design"><h2>6. 设计规范</h2><h3>结构化</h3><table class="about-table"><thead><tr><th>项</th><th>规则</th></tr></thead><tbody>${structRows}</tbody></table><h3>人性化</h3><table class="about-table"><thead><tr><th>原则</th><th>落地规则</th></tr></thead><tbody>${humanRows}</tbody></table><h3>易上手（3分钟路径）</h3><table class="about-table"><thead><tr><th>#</th><th>步骤</th><th>内容</th></tr></thead><tbody>${startRows}</tbody></table></section>
    <section class="about-block" id="about-drift"><h2>7. 走偏方向与纠偏机制</h2><h3>走偏信号</h3><table class="about-table"><thead><tr><th>信号</th><th>表现</th></tr></thead><tbody>${driftRows}</tbody></table><div class="callout">纠偏动作：暂停扩张 → 回到北极星 → 找证据 → 区分目标与手段 → 最小实验 → 设指标与止损线 → 复盘。</div><h3>护栏</h3><table class="about-table"><thead><tr><th>护栏</th><th>说明</th></tr></thead><tbody>${guardRows}</tbody></table></section>
    <section class="about-block" id="about-risk"><h2>8. 风险与避坑</h2><table class="about-table"><thead><tr><th>风险</th><th>影响</th><th>避坑</th></tr></thead><tbody>${riskRows}</tbody></table></section>
    <section class="about-block" id="about-plan"><h2>9. 14天行动清单</h2><p class="lead">目标：把第1—3章正文完成评审并达到可发布质量，MVP 收尾。</p><table class="about-table"><thead><tr><th>天</th><th>任务</th><th>产出</th></tr></thead><tbody>${planRows}</tbody></table></section>
    <section class="about-block" id="about-quality"><h2>10. 内容质量检查清单</h2><p class="lead">每篇内容发布前逐条核对，全部通过才可发布。</p><table class="about-table"><thead><tr><th>#</th><th>检查项</th><th>通过标准</th></tr></thead><tbody>${qualityRows}</tbody></table></section>
    <section class="about-block" id="about-next"><h2>11. 下一步最该做的三件事</h2><table class="about-table"><thead><tr><th>优先级</th><th>事项</th><th>为什么</th><th>完成标志</th></tr></thead><tbody>${nextRows}</tbody></table></section>
  </div></main>`;
}
function templateTagRow(tags) {
  return `<div class="tag-row">${Object.entries(tags).map(([k, v]) => `<span class="tag"><strong>${k}</strong>${v}</span>`).join('')}</div>`;
}
function templateExampleCard(example, template) {
  const chapterRef = chapter(example.chapter);
  const openNote = chapterRef.open ? '' : ' · 未开放章节（模板示范）';
  const body = template.fields.map(([key, label]) => `
    <div class="tpl-field"><h4>${label}</h4>${example.fields[key] || ''}</div>`).join('');
  return `<article class="tpl-example"><header class="tpl-example-head"><h3>${example.title}<small>· 示例</small></h3><span class="meta-chip">关联：第${example.chapter}章「${chapterRef.title}」${openNote}</span></header>${templateTagRow(example.tags)}${body}</article>`;
}
function templatesPage() {
  const nav = TEMPLATES.map(t => `<a class="tpl-nav-link" href="#tpl-${t.id}" data-anchor="tpl-${t.id}">${t.name}</a>`).join('');
  const blocks = TEMPLATES.map(t => `
    <section class="tpl-block" id="tpl-${t.id}">
      <div class="tpl-block-head"><div class="eyebrow">Template / ${t.id}</div><h2>${t.name}</h2><p>${t.purpose}</p></div>
      <div class="tpl-fields"><h3>字段与填写规则</h3><ol>${t.fields.map(([key, label, q]) => `<li><strong>${label}</strong> — ${q}</li>`).join('')}</ol></div>
      <div class="tpl-examples"><h3>填写示例</h3>${t.examples.map(e => templateExampleCard(e, t)).join('')}</div>
    </section>`).join('');
  return `<main class="templates-view"><section class="templates-hero"><div class="eyebrow">Content templates / 内容模板</div><h1>四个模板，<br><span class="accent">让内容可照着做。</span></h1><p class="hero-copy">关键点、项目、思路、踩坑，各有一套固定字段。写的人不跑偏，读的人知道下一步。</p><div class="callout preview-notice">模板用于指导内容编写，不是未开放章节的正文。涉及第4—10章的示例只作模板示范，伪代码不可编译或烧录。</div></section><div class="templates-layout"><aside class="tpl-nav" aria-label="模板目录">${nav}</aside><div class="tpl-body">${blocks}</div></div></main>`;
}
function bookNav(id) {
  return `<div class="side-label">全书目录</div>${VOLUMES.map(v => `<div class="side-group"><h4>${v.name} · ${v.title}</h4>${v.ids.map(cid => `<a class="side-link ${cid === id ? 'active' : ''} ${cid > 3 ? 'locked' : ''}" href="#/${cid <= 3 ? `chapter/${cid}` : `preview/${cid}`}">第${cid}章 · ${chapter(cid).title}${cid > 3 ? ' · 未开放' : ` · ${status(cid)}`}</a>`).join('')}</div>`).join('')}`;
}
function pageNav() { return `<div class="side-label">本页目录</div>${SECTIONS.map(([id, title]) => `<a class="side-link" href="#${id}" data-anchor="${id}">${title}</a>`).join('')}<div class="side-extra">${button('我卡住了','stuck')}${link('做练习','#practice')}</div>`; }
function section(id, title, content) { return `<section class="content-block" id="${id}"><h2>${title}</h2>${content}</section>`; }
function readerPage(id) {
  const c = chapter(id);
  if (!c || !c.open) return routePage();
  const prev = id === 1 ? '/route' : `/chapter/${id - 1}`;
  const next = id === 3 ? '/preview/4' : `/chapter/${id + 1}`;
  const current = status(id);
  return `<div class="mobile-menu"><button type="button" data-action="book-drawer" aria-controls="mobile-drawer">☰ 全书目录</button><button type="button" data-action="page-drawer" aria-controls="mobile-drawer">本页目录</button></div>
  <main class="reader-view"><div class="page-layout"><aside class="side-nav" aria-label="全书目录">${bookNav(id)}</aside><article class="main-content">
    <div class="breadcrumb">${VOLUMES[c.volume].name} / 第${id}章 / 章节阅读</div><h1>第${id}章<br><span class="accent">${c.title}</span></h1><p class="lead">${c.subtitle}。${c.description}</p>
    <div class="meta-row"><span class="meta-chip">路线位置：${VOLUMES[c.volume].name} / 第${id}章</span><span class="meta-chip">预计时间：${id === 1 ? '10 分钟' : '待评审'}</span><span class="meta-chip">难度：起步</span><span class="meta-chip">状态：${current}</span></div>
    <div class="callout preview-notice">网页已同步任务2的目录与章节结构。硬件相关内容仍需指定开发板、工具链并完成验证；未经验证的内容不会被标为可烧录教程。</div>
    <div class="reader-actions">${link('开始 · 从导读看起','#intro','primary')}${link('做练习','#practice')}${button('跳过已掌握','skip')}${button('我卡住了','stuck')}</div>
    ${section('intro','导读',CHAPTER_CONTENT[id - 1].intro)}
    ${section('goals','你将学会',CHAPTER_CONTENT[id - 1].goals)}
    ${section('prerequisites','前置知识',CHAPTER_CONTENT[id - 1].prerequisites + (id > 1 ? link(`回到第${id - 1}章 →`,`/chapter/${id - 1}`) : ''))}
    ${section('concepts','核心概念',CHAPTER_CONTENT[id - 1].concepts)}
    ${section('steps','逐步操作',`<p>以下四节依次完成；每节都有前置知识、预期现象和下一步：</p><div class="lesson-list">${LESSONS[id - 1].map((item, index) => `<article class="lesson-card"><span class="lesson-index">${id}.${index + 1}</span><div><h3>${item[0]}</h3><p><strong>前置知识：</strong>${item[1]}<br><strong>本节动作：</strong>${item[3]}<br><strong>预期现象：</strong>${item[4]}<br><strong>下一步：</strong>${item[2]}</p></div></article>`).join('')}</div>`)}
    ${section('example','最小示例',CHAPTER_CONTENT[id - 1].example)}
    ${section('pitfalls','常见坑',CHAPTER_CONTENT[id - 1].pitfalls)}
    ${section('thinking','思路训练',CHAPTER_CONTENT[id - 1].thinking)}
    ${section('practice','练习',CHAPTER_CONTENT[id - 1].practice)}
    ${section('project','项目',CHAPTER_CONTENT[id - 1].project)}
    ${section('self-test','自测',`${CHAPTER_CONTENT[id - 1].selfTest}<div class="self-actions">${button('能说清楚，标记已读',`set-read-${id}`,'primary')}${button('还需复习',`set-review-${id}`)}</div><p class="small-muted">“已掌握”需要项目验证，框架阶段不自动授予。</p>`)}
    ${section('summary','小结',CHAPTER_CONTENT[id - 1].summary)}
    ${section('next','下一章',id < 3 ? `<p>下一步：进入第${id + 1}章「${chapter(id + 1).title}」。如果前置不清楚，先回到本章自测。</p>${link(`前往第${id + 1}章 →`,next,'primary')}` : `<p>下一步：第4章尚未开放。先完成第3章的自测与项目验证，再查看后续路线位置。</p>${link('查看后续路线 →','/route','primary')}`)}
    <nav class="bottom-nav" aria-label="章节导航">${link(id === 1 ? '← 返回路线' : '← 上一章',prev)}${link(id === 3 ? '后续路线 →' : '下一章 →',id === 3 ? '/route' : next,'primary')}</nav>
  </article><aside class="side-nav right" aria-label="本页目录">${pageNav()}</aside></div></main>
  <div class="mobile-bottom">${button('我卡住了','stuck')}${link('做练习','#practice')}${link(id === 3 ? '后续路线 →' : '下一章 →', id === 3 ? '/route' : next,'primary')}</div>`;
}
function dialogMarkup() {
  if (!state.dialog) return '';
  let content = '';
  if (state.dialog === 'continue') content = `<div class="eyebrow">继续学习</div><h2>还没有学习记录</h2><p>你可以先用入口诊断找到起点，也可以直接从第1章开始。不用担心选错，之后随时能回到路线图。</p><div class="modal-actions">${link('开始入口诊断 →','/diagnosis','primary')}${link('从第1章开始','/chapter/1')}</div>`;
  if (state.dialog === 'stuck') content = `<div class="eyebrow">It is okay to be stuck / 我卡住了</div><h2>先描述你看到的现象</h2><p>不要先猜原因；选择最接近的一项，再回到当前章节进行最小验证。</p><div class="option-list">${[['no-result','没有看到预期结果'],['different','结果与预期不一致'],['no-next','不知道下一步去哪']].map(([key,text]) => `<button class="option" type="button" data-action="symptom-${key}">${text} →</button>`).join('')}</div>${state.stuckChoice ? `<div class="result"><h3>先做一件小事</h3><p>${state.stuckChoice === 'no-result' ? '确认前置条件与观察方法；一次只检查一个环节，记录现象。' : state.stuckChoice === 'different' ? '把预期与实际结果写在一起，只改变一个变量，再观察差异。' : '回到当前章节的“路线位置”和“自测”，先完成一项再决定下一步。'}</p>${link(state.chapter ? '回到当前章节 →' : '从起点开始 →',`/chapter/${state.chapter || 1}`,'primary')}</div>` : ''}`;
  if (state.dialog === 'skip') content = `<div class="eyebrow">跳过已掌握</div><h2>先确定自己真的会</h2><p>已读不等于已掌握。首版章节只有结构框架，不能据此判断硬件实操是否掌握；你可以直接去下一站，也可以回到自测。</p><div class="modal-actions">${link('先看自测','#self-test','primary')}${link('查看下一步 →',state.chapter === 3 ? '/route' : `/chapter/${(state.chapter || 1) + 1}`)}</div>`;
  return `<div class="modal-backdrop" data-action="dismiss"><section class="modal" role="dialog" aria-modal="true" aria-label="${state.dialog === 'stuck' ? '我卡住了' : state.dialog === 'skip' ? '跳过已掌握' : '继续学习'}"><div class="modal-head"><div>${content}</div><button class="close" type="button" data-action="close" aria-label="关闭">×</button></div></section></div>`;
}
function drawerMarkup() {
  if (!state.drawer) return '';
  const id = Number(view().split('/')[2]) || 1;
  const title = state.drawer === 'book' ? '全书目录' : state.drawer === 'page' ? '本页目录' : '网站导航';
  const globalLinks = `<nav class="drawer-links" aria-label="网站导航">${link('首页','/')}${link('入口诊断','/diagnosis')}${link('全书路线','/route')}${link('内容模板','/templates')}${link('项目说明','/about')}${link('搜索','/search')}${button('继续学习','continue')}${button('我卡住了','stuck')}</nav>`;
  return `<div class="drawer-backdrop" data-action="dismiss-drawer"><aside class="drawer" id="mobile-drawer" aria-label="${title}"><div class="drawer-head"><strong>${title}</strong><button class="close" type="button" data-action="close-drawer" aria-label="关闭目录">×</button></div>${state.drawer === 'book' ? bookNav(id) : state.drawer === 'page' ? pageNav() : globalLinks}</aside></div>`;
}
function render() {
  const route = view();
  let page = route === '/' ? home() : route === '/route' ? routePage() : route === '/templates' ? templatesPage() : route === '/about' ? aboutPage() : route === '/diagnosis' ? diagnosisPage() : route === '/result' ? resultPage() : route === '/search' ? searchPage() : null;
  if (!page && route.startsWith('/chapter/')) page = readerPage(Number(route.split('/')[2]));
  if (!page && route.startsWith('/preview/')) page = previewPage(Number(route.split('/')[2]));
  app.innerHTML = header() + (page || `<main class="focused-page"><h1>没有找到这一页。</h1>${link('返回全书路线 →','/route','primary')}</main>`) + footer() + dialogMarkup() + drawerMarkup();
  if (route.startsWith('/chapter/')) {
    const id = Number(route.split('/')[2]);
    if (id >= 1 && id <= 3) { state.chapter = id; if (status(id) === '未读') state.statuses[id] = '进行中'; persist(); }
  }
  if (state.dialog || state.drawer) setTimeout(() => app.querySelector('.close')?.focus(), 0);
}
function navigate(href) { state.dialog = null; state.drawer = null; if (location.hash === `#${href}`) { render(); scrollTo(0,0); } else location.hash = href; }
function onAction(action) {
  if (action === 'continue') { if (state.chapter) navigate(`/chapter/${state.chapter}`); else { state.dialog = 'continue'; render(); } }
  else if (action === 'stuck' || action === 'skip') { state.dialog = action; state.stuckChoice = null; render(); }
  else if (action === 'close' || action === 'dismiss') { state.dialog = null; render(); }
  else if (action === 'book-drawer' || action === 'page-drawer' || action === 'global-drawer') { state.drawer = action === 'book-drawer' ? 'book' : action === 'page-drawer' ? 'page' : 'global'; render(); }
  else if (action === 'close-drawer' || action === 'dismiss-drawer') { state.drawer = null; render(); }
  else if (action.startsWith('symptom-')) { state.stuckChoice = action.slice(8); render(); }
  else if (action.startsWith('set-')) { const parts = action.split('-'), id = Number(parts[2]); state.statuses[id] = parts[1] === 'read' ? '已读' : '需复习'; persist(); render(); document.getElementById('self-test')?.scrollIntoView(); }
}
app.addEventListener('click', event => {
  const anchor = event.target.closest('[data-anchor]');
  if (anchor) { event.preventDefault(); state.drawer = null; render(); document.getElementById(anchor.dataset.anchor)?.scrollIntoView({ behavior:'smooth' }); return; }
  const action = event.target.closest('[data-action]');
  if (action) { if (action.dataset.action === 'dismiss' && event.target !== action) return; if (action.dataset.action === 'dismiss-drawer' && event.target !== action) return; onAction(action.dataset.action); return; }
  const routeLink = event.target.closest('a[href^="#/"]');
  if (routeLink) { state.dialog = null; state.drawer = null; if (routeLink.hash === location.hash) { render(); scrollTo(0,0); } }
  const localLink = event.target.closest('a[href="#intro"],a[href="#practice"],a[href="#self-test"]');
  if (localLink) { event.preventDefault(); state.dialog = null; state.drawer = null; render(); document.querySelector(localLink.getAttribute('href'))?.scrollIntoView({behavior:'smooth'}); }
});
app.addEventListener('submit', event => {
  if (event.target.id === 'diagnosis-form') { event.preventDefault(); const values = new FormData(event.target); state.diagnosis = diagnose(values.get('q1'),values.get('q2'),values.get('q3')); navigate('/result'); }
  if (event.target.id === 'search-form') { event.preventDefault(); const q = new FormData(event.target).get('q').trim(); navigate(`/search?q=${encodeURIComponent(q)}`); }
});
window.addEventListener('hashchange', () => { render(); scrollTo(0,0); });
render();
