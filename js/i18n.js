// Interface text in English and standard Arabic. Element content lives in data.js.
const UI = {
  en: {
    appName: 'Haykal', appSub: 'Structure Lab', appBy: 'By Team Hewar', langBtn: 'العربية', langLabel: 'Switch to Arabic', themeLabel: 'Switch light or dark',
    'mode.building': 'Building', 'mode.house': 'House', 'mode.lab': 'Foundation lab',
    'tool.layers': 'Layers', 'tool.xray': 'X-ray', 'tool.section': 'Section', 'tool.explode': 'Explode', 'tool.loads': 'Load path',
    'tool.build': 'Build it', 'tool.foundation': 'Foundation', 'tool.quiz': 'Test', 'tool.guide': 'Guide', 'tool.safety': 'Safety', 'insp.safety': 'Safety on site', 'fnd.help': 'Help me choose', 'tool.fail': 'Failures', 'tool.reset': 'Reset view',
    'hint.drag': 'Drag to rotate', 'hint.zoom': 'Pinch or scroll to zoom', 'hint.tap': 'Tap any part to inspect it',
    'zoomx': 'Zoomed in: the concrete fades so you can see the steel',
    'insp.emptyT': 'Tap any part of the model', 'insp.emptyB': 'Columns, beams, footings, bricks, pipes and roof layers all open a card like this one, with what they are made of and how they carry load.',
    'insp.made': 'What it is made of', 'insp.nums': 'Key numbers', 'insp.load': 'How it carries load', 'insp.mistake': 'Common site mistake',
    'insp.this': 'This element', 'insp.inside': 'Look inside', 'insp.focus': 'Zoom to it', 'insp.close': 'Close',
    'this.code': 'Drawing code', 'this.level': 'Level', 'this.size': 'Size', 'this.volume': 'Concrete volume', 'this.vol': 'Volume', 'this.weight': 'Weight', 'this.length': 'Length', 'this.bars': 'Bar pieces',
    'layers.title': 'Show layers', 'layer.soil': 'Soil', 'layer.foundation': 'Foundation', 'layer.structure': 'Concrete frame', 'layer.masonry': 'Walls',
    'layer.openings': 'Doors and windows', 'layer.mep': 'Pipes and wiring', 'layer.roof': 'Roof',
    'sec.title': 'Section cut', 'sec.off': 'Off', 'sec.h': 'Plan cut', 'sec.v': 'Front cut', 'sec.pos': 'Cut position',
    'exp.title': 'Pull floors apart', 'exp.amount': 'Gap between floors',
    'fnd.title': 'Foundation type', 'fnd.isolated': 'Isolated footings', 'fnd.strip': 'Strip footings', 'fnd.raft': 'Raft', 'fnd.piles': 'Piles and pile caps',
    'fnd.isolatedD': 'One pad per column. Good soil.', 'fnd.stripD': 'A continuous footing under each row.', 'fnd.raftD': 'One slab under the whole building. Weak soil.', 'fnd.pilesD': 'Deep piles down to a strong layer.',
    'build.play': 'Play', 'build.pause': 'Pause', 'build.prev': 'Previous step', 'build.next': 'Next step', 'build.step': 'Step {n} of {total}', 'build.close': 'Exit build mode', 'build.scrub': 'Construction progress',
    'quiz.resume': 'Back to the test', 'more': 'Details',
    'fail.title': 'Failure simulation', 'fail.pick': 'Tap a ! marker on the model, or choose a case here.', 'fail.where': 'Where it happens', 'fail.why': 'Why it happens',
    'fail.effects': 'What it does', 'fail.effEl': 'To the element', 'fail.effBld': 'To the whole building', 'fail.forces': 'Direction of forces', 'fail.note': 'Remember',
    'fail.replay': 'Replay the steps', 'fail.zoom': 'Zoom to it', 'fail.close': 'Close failure simulation', 'fail.cases': 'Failure cases', 'fail.steps': 'Steps',
    'fail.legStress': 'Stress, low to high', 'fail.legPot': 'Possible cracks', 'fail.legAct': 'Failure', 'fail.illus': 'Illustration of typical behaviour, not a structural analysis.',
    'fail.play': 'Play the steps', 'fail.pause': 'Pause', 'fail.none': 'This case does not apply to the chosen foundation type.', 'fail.sev': 'How it fails',
    'dg.load': 'Load', 'dg.comp': 'Compression', 'dg.ten': 'Tension', 'dg.crack': 'Crack', 'dg.shape': 'Deformed shape (exaggerated)', 'dg.steel': 'Steel bars',
    'detail.back': 'Back to model', 'detail.explode': 'Pull apart', 'detail.hint': 'Drag to rotate. Slide to pull the parts apart.',
    'lvl.0': 'Foundation', 'lvl.1': 'Ground floor', 'lvl.2': 'First floor', 'lvl.3': 'Second floor', 'lvl.4': 'Third floor', 'lvl.5': 'Roof',
    'st.blinding': 'Excavate, compact the soil and pour the blinding', 'st.piles': 'Drill and cast the bored piles', 'st.footings': 'Fix the footing steel and starter bars, then pour',
    'st.strips': 'Fix the strip footing steel, then pour', 'st.raft': 'Fix both raft meshes, then pour the raft', 'st.pilecaps': 'Cut the pile heads, fix the cap steel, pour the caps',
    'st.necks': 'Cast the neck columns', 'st.tiebeams': 'Cast the tie beams that link the columns', 'st.groundslab': 'Backfill, compact and cast the ground floor slab',
    'st.columns': '{lvl}: columns', 'st.slab': '{lvl}: beams and ceiling slab', 'st.roofslab': '{lvl}: beams and roof slab', 'st.ringbeam': '{lvl}: ring beams for the roof',
    'st.walls': 'Build the walls and cast the lintels', 'st.openings': 'Fix doors, windows and the railing', 'st.roof': 'Waterproof and insulate the roof, build the parapet',
    'st.truss': 'Lift the timber trusses and purlins', 'st.tiles': 'Lay the clay roof tiles', 'st.mep': 'Install water, drainage and electrical lines', 'st.finish': 'Plaster and paint',
    'toast.fnd': 'Foundation changed to {name}', 'toast.noDetail': 'No close-up for this part yet',
    'lab.title': 'Design a footing', 'lab.type': 'Footing type', 'lab.isolated': 'Isolated', 'lab.strip': 'Strip', 'lab.pilecap': 'Pile cap',
    'lab.load': 'Column load (service)', 'lab.wload': 'Wall load per metre', 'lab.soil': 'Soil', 'lab.q': 'Allowable soil pressure', 'lab.B': 'Width B', 'lab.L': 'Length L', 'lab.h': 'Thickness h',
    'lab.dia': 'Bar diameter', 'lab.sp': 'Bar spacing', 'lab.pileQ': 'Capacity of one pile', 'lab.col': 'Column size',
    'lab.results': 'Check', 'lab.areaReq': 'Area needed', 'lab.areaProv': 'Area provided', 'lab.press': 'Soil pressure', 'lab.punch': 'Punching shear', 'lab.shear': 'One-way shear', 'lab.capH': 'Cap thickness', 'lab.perm': 'per metre', 'lab.steel': 'Bottom steel (each way)',
    'lab.piles': 'Piles needed', 'lab.pileLoad': 'Load per pile', 'lab.qty': 'Quantities', 'lab.conc': 'Concrete', 'lab.rebarW': 'Steel', 'lab.bars': 'Bars each way',
    'lab.ok': 'OK', 'lab.fail': 'Too small', 'lab.suggest': 'Try B ≥ {b} m', 'lab.thick': 'Make h thicker', 'lab.moreSteel': 'Add steel',
    'lab.steps': 'Build sequence', 'lab.arrows': 'Show soil pressure', 'lab.note': 'Simplified checks for learning, based on ACI 318 rules of thumb. A real design needs a licensed engineer.',
    'soil.soft': 'Soft clay', 'soil.stiff': 'Stiff clay', 'soil.sand': 'Dense sand', 'soil.gravel': 'Gravel',
    'ls.0': 'Excavate and compact', 'ls.1': 'Pour the blinding', 'ls.2': 'Lay the bottom mesh', 'ls.3': 'Fix the starter bars', 'ls.4': 'Set up the formwork', 'ls.5': 'Pour the concrete', 'ls.6': 'Strip formwork and cast the column',
    'ls.d0': 'Dig to the founding level and compact the bottom of the pit.', 'ls.d1': 'Pour 10 cm of plain concrete for a clean, level base.',
    'ls.d2': 'Set the bars on spacer blocks so they keep their concrete cover.', 'ls.d3': 'Tie the L-shaped column starter bars into the mesh.',
    'ls.d4': 'Fix plywood shutters around the footing.', 'ls.d5': 'Pour and vibrate the concrete, then keep it wet for 7 days.', 'ls.d6': 'Remove the shutters and start the column on the starter bars.',
    'install': 'Install app', 'install.ios': 'On iPhone or iPad: tap Share, then Add to Home Screen.', 'install.done': 'Installed. Open Haykal from your home screen or apps list.', 'loading': 'Building the model', 'skip': 'Skip to the 3D model',
  },
  ar: {
    appName: 'هيكل', appSub: 'مختبر المنشآت', appBy: 'بواسطة فريق حوار', langBtn: 'English', langLabel: 'التبديل إلى الإنجليزية', themeLabel: 'التبديل بين الوضع الفاتح والداكن',
    'mode.building': 'المبنى', 'mode.house': 'المنزل', 'mode.lab': 'مختبر الأساسات',
    'tool.layers': 'الطبقات', 'tool.xray': 'شفافية', 'tool.section': 'مقطع', 'tool.explode': 'فصل الطوابق', 'tool.loads': 'مسار الأحمال',
    'tool.build': 'مراحل البناء', 'tool.foundation': 'الأساسات', 'tool.quiz': 'اختبار', 'tool.guide': 'الدليل', 'tool.safety': 'السلامة', 'insp.safety': 'السلامة في الموقع', 'fnd.help': 'ساعدني في الاختيار', 'tool.fail': 'الانهيارات', 'tool.reset': 'إعادة العرض',
    'hint.drag': 'اسحب للتدوير', 'hint.zoom': 'باعد إصبعيك أو استخدم عجلة الفأرة للتكبير', 'hint.tap': 'المس أي جزء لمعرفة تفاصيله',
    'zoomx': 'أنت قريب الآن: تتلاشى الخرسانة تدريجيًا لترى حديد التسليح داخلها',
    'insp.emptyT': 'المس أي جزء من النموذج', 'insp.emptyB': 'الأعمدة والجوائز والقواعد والطوب والأنابيب وطبقات السطح، كلها تفتح بطاقة مثل هذه تعرض مكوناتها وطريقة نقلها للأحمال.',
    'insp.made': 'المكونات', 'insp.nums': 'أرقام مهمة', 'insp.load': 'كيف ينقل الحمل', 'insp.mistake': 'خطأ شائع في الموقع',
    'insp.this': 'هذا العنصر', 'insp.inside': 'شاهد من الداخل', 'insp.focus': 'كبّر عليه', 'insp.close': 'إغلاق',
    'this.code': 'الرمز في المخطط', 'this.level': 'الطابق', 'this.size': 'الأبعاد', 'this.volume': 'حجم الخرسانة', 'this.vol': 'الحجم', 'this.weight': 'الوزن', 'this.length': 'الطول', 'this.bars': 'عدد قطع التسليح',
    'layers.title': 'إظهار الطبقات', 'layer.soil': 'التربة', 'layer.foundation': 'الأساسات', 'layer.structure': 'الهيكل الخرساني', 'layer.masonry': 'الجدران',
    'layer.openings': 'الأبواب والنوافذ', 'layer.mep': 'الأنابيب والكهرباء', 'layer.roof': 'السقف',
    'sec.title': 'مقطع', 'sec.off': 'بدون', 'sec.h': 'مقطع أفقي', 'sec.v': 'مقطع أمامي', 'sec.pos': 'موضع القطع',
    'exp.title': 'فصل الطوابق', 'exp.amount': 'المسافة بين الطوابق',
    'fnd.title': 'نوع الأساسات', 'fnd.isolated': 'قواعد منفصلة', 'fnd.strip': 'قواعد شريطية', 'fnd.raft': 'أساس حصيري', 'fnd.piles': 'خوازيق وأغطيتها',
    'fnd.isolatedD': 'قاعدة لكل عمود. تربة جيدة.', 'fnd.stripD': 'قاعدة مستمرة أسفل كل صف.', 'fnd.raftD': 'بلاطة واحدة أسفل المبنى. تربة ضعيفة.', 'fnd.pilesD': 'خوازيق عميقة حتى طبقة قوية.',
    'build.play': 'تشغيل', 'build.pause': 'إيقاف مؤقت', 'build.prev': 'الخطوة السابقة', 'build.next': 'الخطوة التالية', 'build.step': 'الخطوة {n} من {total}', 'build.close': 'الخروج من مراحل البناء', 'build.scrub': 'تقدم التنفيذ',
    'quiz.resume': 'العودة إلى الاختبار', 'more': 'التفاصيل',
    'fail.title': 'محاكاة الانهيار', 'fail.pick': 'اضغط على علامة ! في النموذج، أو اختر حالة من هنا.', 'fail.where': 'أين يحدث', 'fail.why': 'لماذا يحدث',
    'fail.effects': 'ماذا يسبب', 'fail.effEl': 'على العنصر', 'fail.effBld': 'على المبنى كله', 'fail.forces': 'اتجاه القوى', 'fail.note': 'تذكّر',
    'fail.replay': 'أعد عرض الخطوات', 'fail.zoom': 'قرّب إليه', 'fail.close': 'إغلاق محاكاة الانهيار', 'fail.cases': 'حالات الانهيار', 'fail.steps': 'الخطوات',
    'fail.legStress': 'الإجهاد، من الأقل إلى الأعلى', 'fail.legPot': 'شقوق محتملة', 'fail.legAct': 'انهيار', 'fail.illus': 'رسم توضيحي للسلوك المعتاد، وليس تحليلًا إنشائيًا.',
    'fail.play': 'تشغيل الخطوات', 'fail.pause': 'إيقاف مؤقت', 'fail.none': 'هذه الحالة لا تنطبق على نوع الأساس المختار.', 'fail.sev': 'طريقة الانهيار',
    'dg.load': 'الحمل', 'dg.comp': 'ضغط', 'dg.ten': 'شد', 'dg.crack': 'شق', 'dg.shape': 'الشكل بعد التشوه (مكبّر)', 'dg.steel': 'قضبان الفولاذ',
    'detail.back': 'العودة إلى النموذج', 'detail.explode': 'تفكيك', 'detail.hint': 'اسحب للتدوير، وحرّك المؤشر لتفكيك الأجزاء.',
    'lvl.0': 'الأساسات', 'lvl.1': 'الطابق الأرضي', 'lvl.2': 'الطابق الأول', 'lvl.3': 'الطابق الثاني', 'lvl.4': 'الطابق الثالث', 'lvl.5': 'السطح',
    'st.blinding': 'الحفر ودك التربة وصب خرسانة النظافة', 'st.piles': 'حفر الخوازيق وصبها', 'st.footings': 'تركيب تسليح القواعد وقضبان الانتظار ثم الصب',
    'st.strips': 'تركيب تسليح القواعد الشريطية ثم الصب', 'st.raft': 'تركيب شبكتي الأساس الحصيري ثم صبه', 'st.pilecaps': 'تكسير رؤوس الخوازيق وتركيب تسليح الأغطية وصبها',
    'st.necks': 'صب رقاب الأعمدة', 'st.tiebeams': 'صب جوائز الربط التي تصل الأعمدة', 'st.groundslab': 'الردم والدك وصب بلاطة الطابق الأرضي',
    'st.columns': '{lvl}: الأعمدة', 'st.slab': '{lvl}: الجوائز وبلاطة السقف', 'st.roofslab': '{lvl}: الجوائز وبلاطة السطح', 'st.ringbeam': '{lvl}: الجوائز المحيطية لحمل السقف',
    'st.walls': 'بناء الجدران وصب السواكف', 'st.openings': 'تركيب الأبواب والنوافذ والدرابزين', 'st.roof': 'عزل السطح وبناء الحاجز',
    'st.truss': 'تركيب الجملونات الخشبية والعوارض', 'st.tiles': 'تركيب القرميد', 'st.mep': 'تمديد أنابيب المياه والصرف والكهرباء', 'st.finish': 'اللياسة والطلاء',
    'toast.fnd': 'تم تغيير الأساسات إلى {name}', 'toast.noDetail': 'لا يوجد عرض تفصيلي لهذا الجزء بعد',
    'lab.title': 'صمّم قاعدة', 'lab.type': 'نوع القاعدة', 'lab.isolated': 'منفصلة', 'lab.strip': 'شريطية', 'lab.pilecap': 'غطاء خوازيق',
    'lab.load': 'حمل العمود (التشغيلي)', 'lab.wload': 'حمل الجدار لكل متر', 'lab.soil': 'التربة', 'lab.q': 'إجهاد التربة المسموح', 'lab.B': 'العرض B', 'lab.L': 'الطول L', 'lab.h': 'السماكة h',
    'lab.dia': 'قطر القضيب', 'lab.sp': 'المسافة بين القضبان', 'lab.pileQ': 'حمل الخازوق الواحد', 'lab.col': 'أبعاد العمود',
    'lab.results': 'المراجعة', 'lab.areaReq': 'المساحة المطلوبة', 'lab.areaProv': 'المساحة الفعلية', 'lab.press': 'الضغط على التربة', 'lab.punch': 'قص الاختراق', 'lab.shear': 'القص في اتجاه واحد', 'lab.capH': 'سماكة الغطاء', 'lab.perm': 'لكل متر', 'lab.steel': 'التسليح السفلي (لكل اتجاه)',
    'lab.piles': 'عدد الخوازيق', 'lab.pileLoad': 'الحمل على الخازوق', 'lab.qty': 'الكميات', 'lab.conc': 'الخرسانة', 'lab.rebarW': 'الفولاذ', 'lab.bars': 'عدد القضبان لكل اتجاه',
    'lab.ok': 'آمن', 'lab.fail': 'غير كافٍ', 'lab.suggest': 'جرّب B ≥ {b} م', 'lab.thick': 'زِد السماكة h', 'lab.moreSteel': 'زِد التسليح',
    'lab.steps': 'خطوات التنفيذ', 'lab.arrows': 'إظهار ضغط التربة', 'lab.note': 'مراجعات مبسطة للتعلم مبنية على قواعد تقريبية من الكود ACI 318. التصميم الحقيقي يحتاج إلى مهندس مرخّص.',
    'soil.soft': 'طين ضعيف', 'soil.stiff': 'طين متماسك', 'soil.sand': 'رمل كثيف', 'soil.gravel': 'حصى',
    'ls.0': 'الحفر والدك', 'ls.1': 'صب خرسانة النظافة', 'ls.2': 'فرد الشبكة السفلية', 'ls.3': 'تركيب قضبان الانتظار', 'ls.4': 'تركيب القوالب', 'ls.5': 'صب الخرسانة', 'ls.6': 'فك القوالب وصب العمود',
    'ls.d0': 'الحفر حتى منسوب التأسيس ودك قاع الحفرة.', 'ls.d1': 'صب 10 سم من خرسانة النظافة لعمل سطح نظيف ومستوٍ.',
    'ls.d2': 'وضع القضبان على المباعدات حتى تحافظ على الغطاء الخرساني.', 'ls.d3': 'ربط قضبان انتظار العمود على شكل L بالشبكة.',
    'ls.d4': 'تثبيت ألواح القوالب الخشبية حول القاعدة.', 'ls.d5': 'صب الخرسانة ورجّها، ثم رشها بالماء 7 أيام.', 'ls.d6': 'فك القوالب وبدء صب العمود على قضبان الانتظار.',
    'install': 'تثبيت التطبيق', 'install.ios': 'على iPhone أو iPad: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».', 'install.done': 'تم التثبيت. افتح «هيكل» من الشاشة الرئيسية أو قائمة التطبيقات.', 'loading': 'جارٍ بناء النموذج', 'skip': 'انتقل إلى النموذج ثلاثي الأبعاد',
  },
};

let current = 'en';
try {
  const saved = localStorage.getItem('haykal.lang');
  if (saved === 'ar' || saved === 'en') current = saved;
  else if ((navigator.language || '').toLowerCase().startsWith('ar')) current = 'ar';
} catch { if ((navigator.language || '').toLowerCase().startsWith('ar')) current = 'ar'; }

export const lang = () => current;
export function setLang(l) {
  current = l;
  try { localStorage.setItem('haykal.lang', l); } catch { /* storage may be blocked */ }
}
export function t(key, params) {
  let s = UI[current][key] ?? UI.en[key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll('{' + k + '}', v);
  return s;
}
// In Arabic text, runs of numbers, units and Latin names ("900 kN ÷ 150 kN/m²",
// "ACI 318", "1.5 in (38 mm)") are wrapped in direction isolates so the bidi
// algorithm keeps them in reading order instead of flipping "900 kN" to "kN 900".
const LTR_RUN = /\{\w+\}|[0-9A-Za-z][0-9A-Za-z.,/²³°×÷=+()\s-]*[0-9A-Za-z²³°)]|[0-9A-Za-z]/g;
export const bidi = (s) => (current === 'ar' && typeof s === 'string' ? s.replace(LTR_RUN, (m) => (m[0] === '{' ? m : '\u2066' + m + '\u2069')) : s);
// pick the right language from a {en, ar} object
export const L = (o) => (o ? bidi(o[current] ?? o.en) : '');
// Western digits in both languages, as on engineering drawings
export const num = (v, d = 2) => Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
