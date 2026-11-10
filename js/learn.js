// Two study panels: site safety notes every student should know, and a
// step-by-step helper for choosing a foundation type. Numbers are common rules
// of thumb (OSHA 29 CFR 1926 for the safety limits); a real site follows local
// regulations, and a real foundation needs a soil investigation and an engineer.
import { L, t } from './i18n.js';
import { icon } from './icons.js';

const T = (en, ar) => ({ en, ar });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- safety ----------
export const SAFETY = [
  { id: 'ppe', icon: 'helmet', title: T('Wear your protective gear', 'ارتدِ معدات الوقاية'),
    notes: [
      T('Hard hat, safety boots with steel toe caps and a high-visibility vest, every time you enter a site.', 'خوذة، وحذاء سلامة بمقدمة فولاذية، وسترة عاكسة، في كل مرة تدخل فيها الموقع.'),
      T('Gloves for steel and concrete, safety glasses when anyone is cutting, grinding or drilling, ear protection near loud machines.', 'قفازات عند التعامل مع الفولاذ والخرسانة، ونظارات واقية عند القص أو الجلخ أو الثقب، وواقيات للأذن قرب الآلات المرتفعة الصوت.'),
      T('No loose clothes, scarves or dangling straps near turning machines such as mixers.', 'لا ملابس فضفاضة أو أوشحة أو أحزمة متدلية قرب الآلات الدوّارة مثل الخلاطات.'),
    ] },
  { id: 'dig', icon: 'dig', title: T('Excavations and trenches', 'الحفريات والخنادق'),
    notes: [
      T('Never step into a trench 1.5 m deep or more unless its sides are shored, stepped or sloped back. Soil walls can collapse without warning.', 'لا تنزل أبدًا إلى خندق عمقه 1.5 m أو أكثر إلا إذا كانت جوانبه مدعّمة أو مدرّجة أو مائلة. جدران التربة قد تنهار دون إنذار.'),
      T('Keep the dug soil, materials and machines at least 0.6 m back from the edge.', 'أبعد التربة المحفورة والمواد والآلات مسافة 0.6 m على الأقل عن حافة الحفرة.'),
      T('Use a ladder to get in and out of trenches 1.2 m deep or more, never climb the shoring.', 'استخدم سلمًا للنزول والصعود في الخنادق التي يبلغ عمقها 1.2 m أو أكثر، ولا تتسلق الدعامات.'),
      T('Check the plans for buried water, gas and power lines before digging.', 'راجع المخططات لمعرفة أماكن أنابيب المياه والغاز وكابلات الكهرباء المدفونة قبل الحفر.'),
    ] },
  { id: 'steel', icon: 'steel', title: T('Steel bars', 'قضبان الفولاذ'),
    notes: [
      T('Cover the ends of vertical starter bars with caps. A fall onto an open bar end can cause a serious injury.', 'غطِّ أطراف قضبان الانتظار الرأسية بأغطية واقية، فالسقوط على طرف قضيب مكشوف قد يسبب إصابة خطيرة.'),
      T('Long bars are heavy and springy: carry them with a partner and watch the ends when turning.', 'القضبان الطويلة ثقيلة ومرنة: احملها مع زميل وانتبه لطرفيها عند الالتفاف.'),
      T('Walk on the bar mesh only where boards are laid. Gaps between bars twist ankles.', 'امشِ على شبكة التسليح فقط حيث توجد ألواح للمشي، فالفراغات بين القضبان تسبب التواء الكاحل.'),
    ] },
  { id: 'concrete', icon: 'drop', title: T('Fresh concrete', 'الخرسانة الطازجة'),
    notes: [
      T('Wet cement is strongly alkaline and can burn skin and eyes. Wear gloves and boots, and wash it off with clean water straight away.', 'الإسمنت الرطب شديد القلوية وقد يحرق الجلد والعينين. ارتدِ القفازات والحذاء، واغسله بالماء النظيف فورًا.'),
      T('Stay clear of the pump hose and the crane bucket during the pour. A blocked hose can whip.', 'ابتعد عن خرطوم المضخة ودلو الرافعة أثناء الصب، فالخرطوم المسدود قد يرتد بقوة.'),
    ] },
  { id: 'form', icon: 'props', title: T('Formwork and props', 'الشدات والدعامات'),
    notes: [
      T('Props under a new slab are removed only when the engineer says the concrete is strong enough. Removing them early can bring the slab down.', 'لا تُزال الدعامات أسفل البلاطة الجديدة إلا عندما يقرر المهندس أن الخرسانة اكتسبت المقاومة الكافية، فإزالتها مبكرًا قد تُسقط البلاطة.'),
      T('Do not stack blocks, bars or cement bags in one heap on a fresh slab or on formwork. Spread the load.', 'لا تكدّس الطوب أو القضبان أو أكياس الإسمنت في كومة واحدة على بلاطة حديثة أو على الشدة، بل وزّع الحمل.'),
    ] },
  { id: 'height', icon: 'height', title: T('Working at height', 'العمل على ارتفاع'),
    notes: [
      T('Slab edges, stair openings and roof edges need guardrails. Where there is none and the drop is 1.8 m or more, a harness is required.', 'حواف البلاطات وفتحات الدرج وحواف السطح تحتاج إلى حواجز. وحيث لا يوجد حاجز ويبلغ ارتفاع السقوط 1.8 m أو أكثر يلزم حزام أمان.'),
      T('Holes in slabs must be covered with a fixed, marked cover that can carry a person.', 'يجب تغطية الفتحات في البلاطات بغطاء مثبت ومعلَّم يتحمل وزن شخص.'),
      T('Use only scaffolds that have been inspected and tagged, and never climb the outside of one.', 'استخدم فقط السقالات التي فُحصت ووُضعت عليها بطاقة فحص، ولا تتسلق السقالة من الخارج.'),
    ] },
  { id: 'lift', icon: 'crane', title: T('Machines and lifting', 'الآلات والرفع'),
    notes: [
      T('Never stand or walk under a load hanging from a crane.', 'لا تقف ولا تمشِ أبدًا تحت حمل معلق من رافعة.'),
      T('Make eye contact with a machine operator before walking near an excavator or a truck. Many have large blind spots behind them.', 'تواصل بصريًا مع مشغل الآلة قبل المرور قرب حفارة أو شاحنة، فكثير منها لا يرى ما خلفه.'),
      T('Lift with your legs, not your back, and get help for anything over about 25 kg.', 'ارفع بقدميك لا بظهرك، واطلب المساعدة لأي شيء يزيد وزنه على 25 kg تقريبًا.'),
    ] },
  { id: 'power', icon: 'bolt', title: T('Electricity', 'الكهرباء'),
    notes: [
      T('Keep ladders, bars and machines well away from overhead power lines.', 'أبعد السلالم والقضبان والآلات مسافة كافية عن خطوط الكهرباء الهوائية.'),
      T('Use tools with undamaged cables, keep them dry, and plug them into a board with an earth-leakage breaker.', 'استخدم أدوات بكابلات سليمة وحافظ عليها جافة، وصِلها بلوحة فيها قاطع للتسرب الأرضي.'),
    ] },
  { id: 'visit', icon: 'guide', title: T('On a site visit', 'في الزيارة الميدانية'),
    notes: [
      T('Sign in, attend the site safety briefing, and stay with your supervisor the whole time.', 'سجّل دخولك، واحضر تعليمات السلامة في الموقع، وابقَ مع المشرف طوال الوقت.'),
      T('Walk only on marked paths. Do not use your phone while walking near edges or machines.', 'امشِ في الممرات المحددة فقط، ولا تستخدم هاتفك أثناء المشي قرب الحواف أو الآلات.'),
      T('If something looks unsafe, stop and tell the supervisor. Reporting a hazard is part of the job.', 'إذا رأيت شيئًا غير آمن فتوقف وأبلغ المشرف، فالإبلاغ عن الخطر جزء من العمل.'),
    ] },
];
// which safety topic matters most for each element in the model
export const SAFETY_FOR = {
  soil: ['dig'], blinding: ['dig'], footing: ['dig', 'steel'], strip: ['dig', 'steel'], raft: ['dig', 'concrete'], pile: ['dig', 'lift'], pilecap: ['dig', 'steel'],
  neck: ['steel'], tiebeam: ['dig', 'steel'], column: ['steel', 'form'], shearwall: ['steel', 'form'], rebar: ['steel'],
  beam: ['form', 'concrete'], slab: ['form', 'height'], groundslab: ['concrete'], stair: ['height'], balcony: ['height', 'form'],
  brickwall: ['lift'], blockwall: ['lift'], partition: ['lift'], lintel: ['lift'], gable: ['height'], window: ['lift'], door: ['lift'], railing: ['height'],
  roof: ['height'], parapet: ['height'], tank: ['height', 'lift'], truss: ['height', 'lift'], purlin: ['height'], rooftiles: ['height'],
  waterpipe: ['ppe'], hotpipe: ['ppe'], drainpipe: ['dig'], chamber: ['dig'], conduit: ['power'], dbpanel: ['power'],
};

// ---------- choosing a foundation ----------
// q = allowable bearing pressure (kPa), matching the soils in the Foundation lab
const SOIL_OPTS = [{ id: 'soft', key: 'soil.soft', q: 75 }, { id: 'stiff', key: 'soil.stiff', q: 150 }, { id: 'sand', key: 'soil.sand', q: 250 }, { id: 'gravel', key: 'soil.gravel', q: 350 }];
const STOREY_OPTS = [{ id: 2, label: T('1 to 2', '1 إلى 2') }, { id: 4, label: T('3 to 4', '3 إلى 4') }, { id: 6, label: T('5 to 7', '5 إلى 7') }, { id: 10, label: T('8 or more', '8 أو أكثر') }];
const PER_STOREY = 10; // kPa over the building's plan area, per storey (dead + live, a common estimate)

export const TYPES = {
  isolated: { when: T('Good soil and moderate loads. Each column gets its own square pad.', 'تربة جيدة وأحمال متوسطة. لكل عمود قاعدة مربعة خاصة به.'),
    plus: T('Least concrete and digging; quick to build.', 'أقل كمية من الخرسانة والحفر، وسريعة التنفيذ.'),
    watch: T('Pads can settle by different amounts, so tie beams are used to link them.', 'قد تهبط القواعد بمقادير مختلفة، لذلك تُربط بجوائز الربط.') },
  strip: { when: T('Medium soil, or columns and walls in close rows. One long footing runs under each row.', 'تربة متوسطة، أو أعمدة وجدران في صفوف متقاربة. قاعدة طويلة واحدة تمتد أسفل كل صف.'),
    plus: T('Spreads the load along a line and evens out settlement along that row.', 'توزع الحمل على امتداد خط وتقلل اختلاف الهبوط على طول الصف.'),
    watch: T('Uses more concrete than pads, and needs steel along its length.', 'تحتاج إلى خرسانة أكثر من القواعد المنفصلة، وإلى تسليح بطولها.') },
  raft: { when: T('Weak soil or heavy loads, when pads would cover more than about half the plan. One thick slab carries the whole building.', 'تربة ضعيفة أو أحمال كبيرة، عندما تغطي القواعد أكثر من نصف المسقط تقريبًا. بلاطة سميكة واحدة تحمل المبنى كله.'),
    plus: T('Uses the whole footprint, so the soil pressure is lowest; reduces uneven settlement; works well with basements.', 'تستخدم المسقط كله فيكون الضغط على التربة أقل ما يمكن، وتقلل الهبوط غير المتساوي، وتناسب الأقبية.'),
    watch: T('A lot of concrete and steel at once. With high groundwater it must be waterproofed and checked for uplift.', 'كمية كبيرة من الخرسانة والفولاذ دفعة واحدة. ومع ارتفاع المياه الجوفية تحتاج إلى عزل مائي وفحص لقوة الطفو.') },
  piles: { when: T('The top soil is too weak for any shallow footing, or the loads are very large. Piles carry the load down to a strong layer.', 'التربة العلوية أضعف من أن تحمل أي أساس سطحي، أو الأحمال كبيرة جدًا. الخوازيق تنقل الحمل إلى طبقة قوية في العمق.'),
    plus: T('Works on soft clay, loose fill and near water; settlement is small.', 'تصلح للطين الطري والردم غير المدكوك وقرب المياه، والهبوط فيها صغير.'),
    watch: T('The most expensive option. Needs special rigs and pile load tests.', 'أعلى الخيارات تكلفة، وتحتاج إلى معدات خاصة واختبارات تحميل للخوازيق.') },
};

export function chooseFoundation({ soil, storeys, water, deepWeak }) {
  const s = SOIL_OPTS.find((x) => x.id === soil) || SOIL_OPTS[1];
  const q = storeys * PER_STOREY, ratio = q / s.q;
  let type, why;
  if (deepWeak) { type = 'piles'; why = T('The strong soil is deep down, so the load has to be carried past the weak layer.', 'التربة القوية في العمق، لذلك يجب نقل الحمل إلى ما بعد الطبقة الضعيفة.'); }
  else if (ratio > 0.8 || (soil === 'soft' && storeys >= 6)) { type = 'piles'; why = T('Even a raft under the whole building would press the soil close to its limit, so the load is taken down by piles.', 'حتى البلاطة الحصيرية أسفل المبنى كله ستضغط التربة قريبًا من حدها، لذلك يُنقل الحمل إلى العمق بالخوازيق.'); }
  else if (ratio > 0.5) { type = 'raft'; why = T('Separate footings would cover more than half the plan, so one slab under everything is simpler and safer.', 'القواعد المنفصلة ستغطي أكثر من نصف المسقط، لذلك تكون بلاطة واحدة أسفل كل شيء أبسط وأكثر أمانًا.'); }
  else if (ratio > 0.25) { type = 'strip'; why = T('Footings would cover a quarter to a half of the plan. Joining them into strips along each row spreads the load better.', 'القواعد ستغطي من ربع إلى نصف المسقط، وضمها في شرائط على امتداد كل صف يوزع الحمل بشكل أفضل.'); }
  else { type = 'isolated'; why = T('The soil is strong for this load: separate pads cover less than a quarter of the plan.', 'التربة قوية بالنسبة لهذا الحمل: القواعد المنفصلة تغطي أقل من ربع المسقط.'); }
  const notes = [];
  if (water) notes.push(type === 'raft' || type === 'piles'
    ? T('High groundwater: waterproof the foundation and check that the water cannot lift it.', 'مياه جوفية مرتفعة: اعزل الأساسات ضد المياه وتحقق من أن المياه لا تستطيع رفعها.')
    : T('High groundwater: the pit must be pumped dry while you build, and the footings need waterproofing. Water also weakens the soil, so check again with the lower value.', 'مياه جوفية مرتفعة: يجب سحب المياه من الحفرة أثناء التنفيذ، وعزل القواعد. والمياه تضعف التربة أيضًا، فأعد الحساب بقيمة أقل.'));
  if (soil === 'soft' && type !== 'piles') notes.push(T('Soft clay settles slowly for years. Tie beams and a stiff foundation help the building settle evenly.', 'الطين الطري يهبط ببطء لسنوات، وجوائز الربط والأساس الصلب يساعدان المبنى على الهبوط بشكل متساوٍ.'));
  return { type, why, notes, q, qa: s.q, ratio, soil: s };
}

const UI = {
  safetyTitle: T('Safety on site', 'السلامة في الموقع'),
  safetyIntro: T('What every student should know before stepping onto a building site. The limits are common ones (from OSHA rules); always follow the site\'s own rules and your supervisor.',
    'ما يجب أن يعرفه كل طالب قبل دخول موقع البناء. الحدود المذكورة شائعة (من قواعد OSHA)، والتزم دائمًا بتعليمات الموقع والمشرف.'),
  chooseTitle: T('Choose a foundation', 'اختيار الأساسات'),
  chooseIntro: T('Answer four questions. The helper estimates how much of the plan the footings would cover and suggests a type, with the reason.',
    'أجب عن أربعة أسئلة، وسيقدّر المساعد المساحة التي ستغطيها القواعد من المسقط ويقترح نوعًا مع السبب.'),
  qSoil: T('1. What is the soil under the building?', '1. ما نوع التربة أسفل المبنى؟'),
  qStoreys: T('2. How many storeys?', '2. كم عدد الطوابق؟'),
  qWater: T('3. Is the groundwater high (within about 2 m of the surface)?', '3. هل منسوب المياه الجوفية مرتفع (في حدود 2 m من السطح تقريبًا)؟'),
  qDeep: T('4. Is there a soft or filled layer more than about 3 m thick before firm soil?', '4. هل توجد طبقة طرية أو ردم سماكتها أكثر من 3 m تقريبًا قبل التربة الصلبة؟'),
  yes: T('Yes', 'نعم'), no: T('No', 'لا'), unsure: T('Not sure', 'غير متأكد'),
  result: T('Suggested foundation', 'الأساس المقترح'),
  calc: T('How it was worked out', 'طريقة الحساب'),
  calcBody: T('Each storey adds about {per} kPa over the building\'s plan, so {n} storeys press about {q} kPa. The soil can safely take {qa} kPa, so footings would need to cover about {pct}% of the plan.',
    'كل طابق يضيف نحو {per} kPa على مسقط المبنى، فيضغط {n} طوابق نحو {q} kPa. والتربة تتحمل بأمان {qa} kPa، لذلك تحتاج القواعد إلى تغطية نحو {pct}% من المسقط.'),
  rule: T('Rule of thumb: under 25% → separate pads; 25–50% → strips; over 50% → raft; if even a raft is near the limit, or strong soil is deep → piles.',
    'قاعدة تقريبية: أقل من 25% ← قواعد منفصلة، ومن 25% إلى 50% ← قواعد شريطية، وأكثر من 50% ← أساس حصيري، وإذا اقتربت البلاطة الحصيرية من حد التربة أو كانت التربة القوية عميقة ← خوازيق.'),
  unsureNote: T('Not sure? That is what a soil investigation is for: boreholes and lab tests tell you the real soil layers and groundwater level.', 'لست متأكدًا؟ هذا هو دور فحص التربة: الجسّات والاختبارات المعملية تحدد طبقات التربة الحقيقية ومنسوب المياه.'),
  apply: T('Show it on the model', 'اعرضه على النموذج'),
  lab: T('Size it in the Foundation lab', 'صمّمه في مختبر الأساسات'),
  types: T('The four types at a glance', 'الأنواع الأربعة باختصار'),
  when: T('Use when', 'يُستخدم عندما'), plus: T('Good', 'المزايا'), watch: T('Watch out', 'انتبه'),
  disclaimer: T('A study helper, not a design. A real foundation is chosen by an engineer from a soil investigation report.', 'أداة للتعلم وليست تصميمًا. يختار المهندس الأساس الحقيقي بناءً على تقرير فحص التربة.'),
  close: T('Close', 'إغلاق'),
  more: T('All safety notes', 'كل ملاحظات السلامة'),
};
export const LEARN_UI = UI;
const fmt = (o, p) => Object.entries(p).reduce((s, [k, v]) => s.replaceAll('{' + k + '}', v), L(o));

export class Learn {
  constructor(el, { onApply, onLab, onClose, storeys }) {
    this.el = el; this.onApply = onApply; this.onLab = onLab; this.onClose = onClose; this.storeys = storeys;
    this.kind = null; this.ans = { soil: 'stiff', storeys: 4, water: 'no', deep: 'no' };
    el.addEventListener('click', (e) => this.click(e));
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); this.close(); } });
  }
  get isOpen() { return !this.el.hidden; }
  open(kind, focusId) {
    this.kind = kind;
    if (kind === 'choose') this.ans.storeys = this.storeys?.() ?? this.ans.storeys;
    this.el.hidden = false; this.render();
    requestAnimationFrame(() => {
      const target = focusId && this.el.querySelector(`#sf-${focusId}`);
      if (target) { target.scrollIntoView({ block: 'start' }); target.classList.add('flash'); }
      this.el.querySelector('h2')?.focus();
    });
  }
  close() { this.el.hidden = true; this.onClose?.(); }
  click(e) {
    if (e.target === this.el) { this.close(); return; }
    const b = e.target.closest('button'); if (!b) return;
    const a = b.dataset.la;
    if (a === 'close') this.close();
    else if (a === 'ans') { const k = b.dataset.k, v = b.dataset.v; this.ans[k] = k === 'storeys' ? +v : v; this.render(); this.el.querySelector(`[data-k="${k}"][data-v="${v}"]`)?.focus(); }
    else if (a === 'apply') { this.el.hidden = true; this.onApply?.(b.dataset.type); }
    else if (a === 'lab') { this.el.hidden = true; this.onLab?.(); }
  }
  render() { this.el.innerHTML = this.kind === 'choose' ? this.chooseHTML() : this.safetyHTML(); }

  head(title, intro) {
    return `<header class="qz-head"><div><h2 tabindex="-1">${esc(L(title))}</h2><p class="qz-sub">${esc(L(intro))}</p></div>
      <button class="icon-btn" data-la="close" aria-label="${esc(L(UI.close))}">${icon('close')}</button></header>`;
  }
  safetyHTML() {
    return `<div class="qz-card ln-card" role="dialog" aria-modal="true" aria-label="${esc(L(UI.safetyTitle))}">${this.head(UI.safetyTitle, UI.safetyIntro)}
      <div class="qz-body"><div class="sf-grid">${SAFETY.map((s) => `<section class="sf-item" id="sf-${s.id}"><h3>${icon(s.icon)}<span>${esc(L(s.title))}</span></h3>
        <ul>${s.notes.map((n) => `<li>${esc(L(n))}</li>`).join('')}</ul></section>`).join('')}</div></div></div>`;
  }
  chooseHTML() {
    const a = this.ans, unsureW = a.water === 'unsure', unsureD = a.deep === 'unsure';
    const r = chooseFoundation({ soil: a.soil, storeys: a.storeys, water: a.water !== 'no', deepWeak: a.deep === 'yes' });
    const seg = (k, opts) => `<div class="seg ln-seg" role="radiogroup">${opts.map((o) => `<button role="radio" aria-checked="${String(a[k]) === String(o.v)}" data-la="ans" data-k="${k}" data-v="${o.v}">${esc(o.label)}</button>`).join('')}</div>`;
    const yn = [{ v: 'no', label: L(UI.no) }, { v: 'yes', label: L(UI.yes) }, { v: 'unsure', label: L(UI.unsure) }];
    const pct = Math.round(r.ratio * 100);
    const types = Object.entries(TYPES).map(([k, v]) => `<li class="${k === r.type ? 'on' : ''}"><b>${esc(t('fnd.' + k))}</b>
      <dl><dt>${esc(L(UI.when))}</dt><dd>${esc(L(v.when))}</dd><dt>${esc(L(UI.plus))}</dt><dd>${esc(L(v.plus))}</dd><dt>${esc(L(UI.watch))}</dt><dd>${esc(L(v.watch))}</dd></dl></li>`).join('');
    return `<div class="qz-card ln-card" role="dialog" aria-modal="true" aria-label="${esc(L(UI.chooseTitle))}">${this.head(UI.chooseTitle, UI.chooseIntro)}
      <div class="qz-body">
        <div class="ln-q"><h3>${esc(L(UI.qSoil))}</h3>${seg('soil', SOIL_OPTS.map((s) => ({ v: s.id, label: `${t(s.key)} · ${s.q} kPa` })))}</div>
        <div class="ln-q"><h3>${esc(L(UI.qStoreys))}</h3>${seg('storeys', STOREY_OPTS.map((s) => ({ v: s.id, label: L(s.label) })))}</div>
        <div class="ln-q"><h3>${esc(L(UI.qWater))}</h3>${seg('water', yn)}</div>
        <div class="ln-q"><h3>${esc(L(UI.qDeep))}</h3>${seg('deep', yn)}</div>
        <section class="ln-result" aria-live="polite">
          <p class="ln-label">${esc(L(UI.result))}</p>
          <h3 class="ln-type">${icon('foundation')}<span>${esc(t('fnd.' + r.type))}</span></h3>
          <p>${esc(L(r.why))}</p>
          ${r.notes.map((n) => `<p class="ln-note">${icon('alert')}<span>${esc(L(n))}</span></p>`).join('')}
          ${unsureW || unsureD ? `<p class="ln-note">${icon('alert')}<span>${esc(L(UI.unsureNote))}</span></p>` : ''}
          <div class="qz-acts"><button class="btn" data-la="lab">${icon('lab')}<span>${esc(L(UI.lab))}</span></button>
            <button class="btn primary" data-la="apply" data-type="${r.type}">${icon('focus')}<span>${esc(L(UI.apply))}</span></button></div>
        </section>
        <section class="ln-calc"><h3>${esc(L(UI.calc))}</h3>
          <p>${esc(fmt(UI.calcBody, { per: PER_STOREY, n: a.storeys, q: r.q, qa: r.qa, pct }))}</p>
          <div class="ln-bar" aria-hidden="true"><span style="width:${Math.min(100, pct)}%"></span><i style="inset-inline-start:25%"></i><i style="inset-inline-start:50%"></i><i style="inset-inline-start:80%"></i></div>
          <p class="ln-rule">${esc(L(UI.rule))}</p></section>
        <section><h3>${esc(L(UI.types))}</h3><ul class="ln-types">${types}</ul></section>
        <p class="disclaimer">${icon('alert')}<span>${esc(L(UI.disclaimer))}</span></p>
      </div></div>`;
  }
}
export const safetyTopic = (id) => SAFETY.find((s) => s.id === id);
