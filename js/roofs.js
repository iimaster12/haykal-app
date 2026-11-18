// Slabs and roofs: two separate study panels.
//  1. Structural slab systems: what carries the loads (drawn as plan + section).
//  2. Architectural roof shapes: the outside form (drawn in 3D, with rain flow).
// Figures are common rules of thumb for students; a real design follows the
// local code and an engineer's calculations.
import { L } from './i18n.js';
import { icon } from './icons.js';

const T = (en, ar) => ({ en, ar });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// where a type is used
export const APPS = {
  res: { icon: 'house', name: T('Houses and apartments', 'المنازل والشقق') },
  com: { icon: 'building', name: T('Commercial buildings', 'المباني التجارية') },
  ind: { icon: 'factory', name: T('Industrial buildings', 'المباني الصناعية') },
  pub: { icon: 'dome', name: T('Public and religious buildings', 'المباني العامة والدينية') },
};

// =====================================================================
// 1. STRUCTURAL SLAB SYSTEMS
// =====================================================================
export const SLABS = [
  { id: 'oneway', name: T('Solid one-way slab', 'بلاطة مصمتة في اتجاه واحد'),
    short: T('A flat concrete slab resting on two parallel beams or walls. When a panel is more than twice as long as it is wide, it bends mainly across the short direction, like a plank.',
      'بلاطة خرسانية مستوية ترتكز على جائزين أو جدارين متوازيين. عندما يكون طول اللوح أكثر من ضعف عرضه فإنه ينحني أساسًا في الاتجاه القصير مثل اللوح الخشبي.'),
    span: T('Span 3–4.5 m · thickness about span ÷ 25 (12–18 cm)', 'البحر 3–4.5 m · السماكة نحو البحر ÷ 25 (12–18 سم)'),
    path: T('Slab → the two long beams → columns → footings', 'البلاطة ← الجائزان الطويلان ← الأعمدة ← القواعد'),
    plus: [T('Simple formwork and simple steel: one main bar direction.', 'شدة بسيطة وتسليح بسيط: اتجاه رئيسي واحد للقضبان.'),
      T('Cheap and quick for short spans.', 'رخيصة وسريعة للبحور القصيرة.'),
      T('Ideal for long, narrow spaces.', 'مثالية للفراغات الطويلة الضيقة.')],
    minus: [T('Heavy for what it carries; uneconomic beyond about 4.5 m.', 'ثقيلة بالنسبة لما تحمله، وغير اقتصادية بعد 4.5 m تقريبًا.'),
      T('Needs dropped beams that lower the ceiling.', 'تحتاج إلى جسور ساقطة تخفض السقف.')],
    use: [{ k: 'res', why: T('Corridors, balconies, stair landings and narrow rooms: short spans where simple formwork saves money.', 'الممرات والشرفات وبسطات الدرج والغرف الضيقة: بحور قصيرة توفر فيها الشدة البسيطة التكلفة.') },
      { k: 'com', why: T('Walkways, canopies and covered corridors between blocks.', 'الممرات المشاة والمظلات والممرات المسقوفة بين المباني.') }],
    when: T('Choose it when the panel is long and narrow (long side ÷ short side > 2) and the short span is about 3–4.5 m.', 'اخترها عندما يكون اللوح طويلًا وضيقًا (الضلع الطويل ÷ الضلع القصير > 2) والبحر القصير نحو 3–4.5 m.') },

  { id: 'twoway', name: T('Solid two-way slab on beams', 'بلاطة مصمتة في اتجاهين على جسور'),
    short: T('A slab with a beam on all four sides. In a near-square panel (long ÷ short ≤ 2) it bends in both directions and shares its load between all four beams.',
      'بلاطة يحيط بها جسر من الجهات الأربع. في اللوح القريب من المربع (الطويل ÷ القصير ≤ 2) تنحني في الاتجاهين وتوزع حملها على الجسور الأربعة.'),
    span: T('Panels 4–7 m · thickness about 12–20 cm', 'ألواح 4–7 m · السماكة نحو 12–20 سم'),
    path: T('Slab → four edge beams → columns → footings', 'البلاطة ← الجسور الأربعة ← الأعمدة ← القواعد'),
    plus: [T('Thinner than a one-way slab for the same panel size.', 'أرق من البلاطة ذات الاتجاه الواحد لنفس مساحة اللوح.'),
      T('Very stiff; the beams also carry the walls above.', 'جاسئة جدًا، والجسور تحمل الجدران التي فوقها أيضًا.'),
      T('Every contractor knows how to build it.', 'كل مقاول يعرف طريقة تنفيذها.')],
    minus: [T('Dropped beams lower the ceiling and get in the way of ducts and pipes.', 'الجسور الساقطة تخفض السقف وتعترض مجاري التكييف والأنابيب.'),
      T('More formwork labour than a flat slab.', 'عمالة شدة أكثر من البلاطة اللاكمرية.')],
    use: [{ k: 'res', why: T('The usual frame of apartment blocks and villas: partition walls sit on the beams.', 'الهيكل المعتاد للعمارات والفلل: جدران القواطع ترتكز على الجسور.') },
      { k: 'pub', why: T('Schools and clinics with regular classrooms of 6–7 m.', 'المدارس والعيادات ذات الفصول المنتظمة بأبعاد 6–7 m.') },
      { k: 'com', why: T('Small offices and shops on a regular grid.', 'المكاتب والمحلات الصغيرة على شبكة منتظمة.') }],
    when: T('Near-square bays of 4–7 m, heavy walls above, and where dropped beams are acceptable. This is the slab in the Haykal building model.', 'فتحات قريبة من المربع بأبعاد 4–7 m، وجدران ثقيلة فوقها، وحين تكون الجسور الساقطة مقبولة. هذه هي بلاطة نموذج المبنى في «هيكل».'),
    model: { mode: 'building', key: 'slab' } },

  { id: 'flatslab', name: T('Flat slab with drop panels', 'بلاطة لا كمرية مع سقوط حول الأعمدة'),
    short: T('A slab resting straight on columns with no beams. Around each column the slab is made thicker (a drop panel) or the column flares out (a capital) to resist the high shear there.',
      'بلاطة ترتكز مباشرة على الأعمدة دون جسور. حول كل عمود تُزاد سماكة البلاطة (سقوط) أو يتسع رأس العمود (تاج) لمقاومة القص العالي في تلك المنطقة.'),
    span: T('Grid 6–9 m · slab about 20–30 cm', 'شبكة 6–9 m · البلاطة نحو 20–30 سم'),
    path: T('Slab → strips over the columns → drop panels → columns', 'البلاطة ← شرائح الأعمدة ← السقوط ← الأعمدة'),
    plus: [T('Flat ceiling: ducts and pipes run freely, partitions go anywhere.', 'سقف مستوٍ: تمر المجاري والأنابيب بحرية، والقواطع توضع في أي مكان.'),
      T('Fast, simple formwork; lower storey height, so more floors fit in the same height.', 'شدة سريعة وبسيطة، وارتفاع طابق أقل، فتتسع طوابق أكثر في نفس الارتفاع.'),
      T('Carries heavy loads well thanks to the drop panels.', 'تحمل الأحمال الكبيرة جيدًا بفضل السقوط.')],
    minus: [T('Punching shear around the columns must be checked carefully.', 'يجب فحص القص الثاقب حول الأعمدة بعناية.'),
      T('Less stiff against wind and earthquakes: shear walls or cores are needed.', 'أقل جساءة أمام الرياح والزلازل: تلزم جدران قص أو أنوية.'),
      T('Openings next to columns are restricted.', 'الفتحات بجوار الأعمدة مقيدة.')],
    use: [{ k: 'com', why: T('Car parks, offices and hospitals: heavy loads, flat ceilings for services, and free layouts.', 'مواقف السيارات والمكاتب والمستشفيات: أحمال كبيرة وسقف مستوٍ للخدمات وتقسيم حر.') },
      { k: 'ind', why: T('Warehouses and cold stores with heavy shelving.', 'المستودعات والمخازن المبردة ذات الرفوف الثقيلة.') },
      { k: 'res', why: T('High-rise apartments where storey height is precious.', 'الأبراج السكنية حيث يكون ارتفاع الطابق ثمينًا.') }],
    when: T('Regular grids of 6–9 m with heavy loads, when a flat ceiling and fast construction matter more than the extra concrete.', 'شبكات منتظمة بأبعاد 6–9 m وأحمال كبيرة، عندما يكون السقف المستوي وسرعة التنفيذ أهم من الخرسانة الإضافية.') },

  { id: 'flatplate', name: T('Flat plate', 'بلاطة مسطحة دون سقوط'),
    short: T('The simplest beamless slab: one even thickness sitting directly on the columns, with no drop panels and no beams.',
      'أبسط أنواع البلاطات اللاكمرية: سماكة واحدة منتظمة ترتكز مباشرة على الأعمدة دون سقوط ودون جسور.'),
    span: T('Grid 5–7 m · slab about 18–25 cm', 'شبكة 5–7 m · البلاطة نحو 18–25 سم'),
    path: T('Slab → columns directly', 'البلاطة ← الأعمدة مباشرة'),
    plus: [T('The fastest formwork: flat tables moved from floor to floor.', 'أسرع شدة: طاولات مستوية تُنقل من طابق إلى آخر.'),
      T('The thinnest floor zone; the soffit can be painted as the ceiling.', 'أقل سماكة للأرضية، ويمكن دهان السطح السفلي ليكون هو السقف.')],
    minus: [T('Only for light loads and moderate spans.', 'للأحمال الخفيفة والبحور المتوسطة فقط.'),
      T('Punching shear governs: may need shear studs or bigger columns.', 'القص الثاقب هو الحاكم: قد تلزم مسامير قص أو أعمدة أكبر.'),
      T('Deflection must be controlled.', 'يجب التحكم في الترخيم.')],
    use: [{ k: 'res', why: T('Apartment towers and hotels: light loads, regular grids, minimum floor height.', 'الأبراج السكنية والفنادق: أحمال خفيفة وشبكات منتظمة وأقل ارتفاع للطابق.') },
      { k: 'com', why: T('Offices with light loads and open plans.', 'المكاتب ذات الأحمال الخفيفة والمساحات المفتوحة.') }],
    when: T('Light loads such as homes and hotels, short regular spans, and when the total building height is limited.', 'أحمال خفيفة مثل المساكن والفنادق، وبحور قصيرة منتظمة، وعندما يكون ارتفاع المبنى الكلي محدودًا.') },

  { id: 'ribbed', name: T('Ribbed (hollow-block) slab', 'بلاطة هوردي (أعصاب وبلوك)'),
    short: T('Narrow concrete ribs every 50–60 cm under a thin topping slab. Hollow concrete, clay or foam blocks fill the gaps and stay in place, giving a flat ceiling.',
      'أعصاب خرسانية ضيقة كل 50–60 سم أسفل بلاطة علوية رقيقة. تملأ الفراغات بينها بلوكات مفرغة من الخرسانة أو الطين أو الفوم تبقى في مكانها وتعطي سقفًا مستويًا.'),
    span: T('Span 5–8 m · total depth 25–35 cm', 'البحر 5–8 m · العمق الكلي 25–35 سم'),
    path: T('Topping → ribs → hidden or main beams → columns', 'البلاطة العلوية ← الأعصاب ← الجسور المخفية أو الرئيسية ← الأعمدة'),
    plus: [T('Lighter than a solid slab of the same depth, so it spans further.', 'أخف من البلاطة المصمتة بنفس العمق، فتغطي بحورًا أطول.'),
      T('Flat ceiling with hidden beams; blocks add some heat and sound insulation.', 'سقف مستوٍ بجسور مخفية، والبلوك يضيف بعض العزل الحراري والصوتي.'),
      T('Less concrete and steel.', 'خرسانة وحديد أقل.')],
    minus: [T('Thicker floor; more labour to place the blocks.', 'أرضية أسمك، وعمالة أكثر لرص البلوك.'),
      T('Heavy point loads and new openings later are difficult.', 'الأحمال المركزة الثقيلة وعمل فتحات جديدة لاحقًا أمر صعب.')],
    use: [{ k: 'res', why: T('Villas and houses across the Middle East: flat ceilings and longer spans at low cost.', 'الفلل والمنازل في أنحاء الشرق الأوسط: أسقف مستوية وبحور أطول بتكلفة قليلة.') },
      { k: 'pub', why: T('Schools and small public buildings with ordinary loads.', 'المدارس والمباني العامة الصغيرة ذات الأحمال العادية.') },
      { k: 'com', why: T('Small offices and shops wanting a flat ceiling.', 'المكاتب والمحلات الصغيرة التي تريد سقفًا مستويًا.') }],
    when: T('Spans of 5–8 m with ordinary floor loads, when you want a flat ceiling without dropped beams and a lighter slab.', 'بحور 5–8 m بأحمال عادية، عندما تريد سقفًا مستويًا دون جسور ساقطة وبلاطة أخف.') },

  { id: 'waffle', name: T('Waffle slab', 'بلاطة وافل (أعصاب في اتجاهين)'),
    short: T('Ribs in both directions form a grid of square pockets (coffers) under a thin top slab, like a waffle. Near the columns the pockets are filled solid.',
      'أعصاب في الاتجاهين تكوّن شبكة من التجاويف المربعة أسفل بلاطة علوية رقيقة، مثل قطعة الوافل. وقرب الأعمدة تُملأ التجاويف بالخرسانة.'),
    span: T('Span 9–15 m · total depth 35–60 cm', 'البحر 9–15 m · العمق الكلي 35–60 سم'),
    path: T('Top slab → ribs both ways → solid heads → columns', 'البلاطة العلوية ← الأعصاب في الاتجاهين ← الرؤوس المصمتة ← الأعمدة'),
    plus: [T('Very stiff and light for long spans: few columns.', 'جاسئة جدًا وخفيفة للبحور الطويلة: أعمدة قليلة.'),
      T('Small deflection and good control of vibration.', 'ترخيم صغير وتحكم جيد في الاهتزاز.'),
      T('An attractive exposed ceiling.', 'سقف ظاهر جميل.')],
    minus: [T('Needs special moulds (pans) and skilled labour.', 'تحتاج إلى قوالب خاصة وعمالة ماهرة.'),
      T('Deep floor; costly for small jobs.', 'أرضية عميقة، ومكلفة للمشاريع الصغيرة.')],
    use: [{ k: 'pub', why: T('Lobbies, museums, airports, mosque halls and auditoriums: large column-free halls.', 'الردهات والمتاحف والمطارات وقاعات المساجد والمسارح: قاعات كبيرة بلا أعمدة.') },
      { k: 'com', why: T('Long-span offices and showrooms.', 'المكاتب وصالات العرض ذات البحور الطويلة.') },
      { k: 'ind', why: T('Laboratories and floors that must not vibrate.', 'المختبرات والأرضيات التي يجب ألا تهتز.') }],
    when: T('Long spans with few columns, or where the ceiling is left exposed as part of the architecture.', 'بحور طويلة بأعمدة قليلة، أو حين يُترك السقف ظاهرًا كجزء من التصميم المعماري.') },

  { id: 'hollowcore', name: T('Precast hollow-core planks', 'ألواح مفرغة مسبقة الصب'),
    short: T('Factory-made prestressed planks, usually 1.2 m wide, with long round voids inside. A crane lays them side by side on beams or walls; a thin topping ties them together.',
      'ألواح سابقة الإجهاد تُصنع في المصنع، عرضها عادة 1.2 m، وبداخلها فراغات دائرية طويلة. ترصّها رافعة جنبًا إلى جنب على الجسور أو الجدران، وتربطها طبقة علوية رقيقة.'),
    span: T('Span 6–12 m · plank 15–40 cm deep', 'البحر 6–12 m · عمق اللوح 15–40 سم'),
    path: T('Planks span one way → supporting beams or walls → columns', 'الألواح تعمل في اتجاه واحد ← الجسور أو الجدران الحاملة ← الأعمدة'),
    plus: [T('Very fast: no formwork and few props on site.', 'سريعة جدًا: لا شدة ودعامات قليلة في الموقع.'),
      T('Long spans for its weight; steady factory quality.', 'بحور طويلة بالنسبة لوزنها، وجودة مصنعية ثابتة.')],
    minus: [T('Needs a crane, road access and careful joints.', 'تحتاج إلى رافعة وطريق وصول ومعالجة دقيقة للفواصل.'),
      T('Cutting openings later is very limited; the design is hard to change.', 'عمل الفتحات لاحقًا محدود جدًا، وتغيير التصميم صعب.')],
    use: [{ k: 'com', why: T('Shopping centres, offices and car parks built to a tight schedule.', 'المراكز التجارية والمكاتب ومواقف السيارات ذات الجداول الزمنية الضيقة.') },
      { k: 'ind', why: T('Warehouses and factory floors with long spans.', 'المستودعات وأرضيات المصانع ذات البحور الطويلة.') },
      { k: 'res', why: T('Repeated housing blocks where the same plank is used again and again.', 'المجمعات السكنية المتكررة حيث يُستخدم نفس اللوح مرارًا.') }],
    when: T('Repeated layouts, tight schedules, and sites where formwork would be slow or expensive.', 'التصاميم المتكررة والجداول الضيقة والمواقع التي تكون فيها الشدة بطيئة أو مكلفة.') },

  { id: 'composite', name: T('Composite steel-deck slab', 'بلاطة مركبة على صاج معدني'),
    short: T('Concrete poured onto a ribbed steel sheet that rests on steel beams. Shear studs welded to the beams make the steel and concrete act together as one.',
      'خرسانة تُصب على صاج معدني مضلع يرتكز على جسور فولاذية. مسامير القص الملحومة على الجسور تجعل الفولاذ والخرسانة يعملان معًا كعنصر واحد.'),
    span: T('Deck 3–4 m between beams · beams 9–15 m', 'الصاج 3–4 m بين الجسور · الجسور 9–15 m'),
    path: T('Concrete + deck → secondary steel beams → main beams → steel columns', 'الخرسانة والصاج ← الجسور الفولاذية الثانوية ← الجسور الرئيسية ← الأعمدة الفولاذية'),
    plus: [T('The steel deck is permanent formwork and a safe working platform.', 'الصاج المعدني شدة دائمة ومنصة عمل آمنة.'),
      T('Light and very fast with a steel frame; long spans.', 'خفيفة وسريعة جدًا مع الهيكل الفولاذي، وبحور طويلة.')],
    minus: [T('Steel needs fire protection and corrosion protection.', 'الفولاذ يحتاج إلى حماية من الحريق ومن الصدأ.'),
      T('Long spans can feel bouncy; needs skilled welders.', 'البحور الطويلة قد تهتز، وتحتاج إلى لحّامين مهرة.')],
    use: [{ k: 'com', why: T('High-rise office towers on steel frames.', 'الأبراج المكتبية ذات الهياكل الفولاذية.') },
      { k: 'ind', why: T('Factories, mezzanines and plant platforms.', 'المصانع والطوابق المسروقة (الميزانين) ومنصات المعدات.') },
      { k: 'pub', why: T('Airports and stadiums with large spans.', 'المطارات والملاعب ذات البحور الكبيرة.') }],
    when: T('When the frame is steel, speed matters and spans are large.', 'عندما يكون الهيكل فولاذيًا والسرعة مهمة والبحور كبيرة.') },
];

// =====================================================================
// 2. ARCHITECTURAL ROOF SHAPES
// =====================================================================
export const ROOFS = [
  { id: 'flat', name: T('Flat roof', 'السقف المستوي'),
    short: T('An almost level roof with a small fall of 1–2% (1–2 cm per metre) so that rain runs to the drains. It is usually a concrete slab with insulation and a waterproof layer on top, often with a low parapet wall around it.',
      'سقف شبه أفقي بميل صغير 1–2% (1–2 سم لكل متر) حتى يجري المطر إلى المصارف. عادةً يكون بلاطة خرسانية فوقها عزل حراري وطبقة عازلة للماء، وغالبًا يحيط به جدار دروة منخفض.'),
    pitch: T('Fall 1–2% (about 1°)', 'الميل 1–2% (نحو 1°)'),
    plus: [T('Usable space: a terrace, water tanks, solar panels and AC units.', 'مساحة قابلة للاستخدام: سطح للجلوس وخزانات مياه وألواح شمسية ووحدات تكييف.'),
      T('Easy and cheap on a concrete frame, and a storey can be added later.', 'سهل ورخيص على الهيكل الخرساني، ويمكن إضافة طابق لاحقًا.'),
      T('The simplest form for large footprints.', 'أبسط شكل للمساقط الكبيرة.')],
    minus: [T('Water ponds if the fall is wrong, and ponding leads to leaks.', 'تتجمع المياه إذا كان الميل خاطئًا، وتجمعها يسبب التسرب.'),
      T('The waterproof layer needs checking and renewing every 10–20 years.', 'الطبقة العازلة للماء تحتاج إلى فحص وتجديد كل 10–20 سنة.'),
      T('Poor under heavy snow; without insulation the sun heats the rooms below.', 'ضعيف تحت الثلوج الكثيفة، ودون عزل تسخّن الشمس الغرف التي تحته.')],
    use: [{ k: 'res', why: T('Houses and apartment blocks in hot, dry climates: roof terrace, water tanks and solar heaters.', 'المنازل والعمارات في المناخ الحار الجاف: سطح للجلوس وخزانات مياه وسخانات شمسية.') },
      { k: 'com', why: T('Malls and offices: room for chillers and air-handling units out of sight.', 'المولات والمكاتب: مكان لوحدات التبريد ومعالجة الهواء بعيدًا عن الأنظار.') },
      { k: 'ind', why: T('Large factories: low-slope membrane roofs over wide steel frames.', 'المصانع الكبيرة: أسقف بأغشية عازلة قليلة الميل فوق هياكل فولاذية واسعة.') }],
    when: T('Low rainfall, hot dry climates, multi-storey concrete buildings, and whenever the roof will be used or another floor may be added.', 'الأمطار القليلة والمناخ الحار الجاف والمباني الخرسانية متعددة الطوابق، وكلما كان السطح سيُستخدم أو قد يُضاف طابق آخر.'),
    water: [T('Lay a sloping screed (1–2%) towards the drains, with no flat dead spots.', 'نفّذ طبقة ميول (1–2%) نحو المصارف، دون مناطق مستوية تتجمع فيها المياه.'),
      T('Use at least two drains per roof area in case one blocks, plus an overflow outlet (scupper) through the parapet.', 'استخدم مصرفين على الأقل لكل مساحة سقف تحسبًا لانسداد أحدهما، مع فتحة طوارئ (مزراب) في الدروة.'),
      T('Turn the waterproof membrane at least 15 cm up the parapet and seal it under a cap.', 'ارفع الغشاء العازل 15 سم على الأقل على الدروة واحمِ طرفه بغطاء.'),
      T('Add thermal insulation and protect the membrane with tiles or gravel. Do a 24–48 hour flood test before tiling.', 'أضف العزل الحراري واحمِ الغشاء بالبلاط أو الحصى، وأجرِ اختبار الغمر بالماء 24–48 ساعة قبل التبليط.')],
    model: { mode: 'building', key: 'roof' } },

  { id: 'gable', name: T('Gable roof', 'السقف الجملوني'),
    short: T('Two slopes meeting at a central ridge, with a triangular wall (the gable) at each end. The most common pitched roof in the world.',
      'سطحان مائلان يلتقيان في خط قمة (الحِرف) في المنتصف، مع جدار مثلث (الجملون) في كل طرف. أكثر الأسقف المائلة انتشارًا في العالم.'),
    pitch: T('Pitch 20–45°', 'الميل 20–45°'),
    plus: [T('Sheds rain and snow quickly.', 'يصرّف المطر والثلج بسرعة.'),
      T('Simple, cheap timber or light-steel trusses.', 'جمالونات خشبية أو فولاذية خفيفة بسيطة ورخيصة.'),
      T('Attic space for storage, insulation and ventilation.', 'علّية للتخزين والعزل والتهوية.')],
    minus: [T('The flat gable ends catch strong wind; the roof can lift in storms if not tied down.', 'الجملونات المستوية تواجه الرياح القوية، وقد يرتفع السقف في العواصف إذا لم يُثبَّت جيدًا.'),
      T('Large overhangs are exposed to wind uplift.', 'البروزات الكبيرة معرضة لقوى رفع الرياح.')],
    use: [{ k: 'res', why: T('Houses in rainy or snowy climates: water runs off fast and the attic insulates.', 'المنازل في المناخ الممطر أو الثلجي: تجري المياه بسرعة والعلّية تعزل.') },
      { k: 'ind', why: T('Workshops and warehouses on steel portal frames with a low-pitch gable.', 'الورش والمستودعات على هياكل بوابية فولاذية بجملون قليل الميل.') },
      { k: 'com', why: T('Small shops, rural and roadside buildings.', 'المحلات الصغيرة والمباني الريفية وعلى الطرق.') }],
    when: T('Moderate to heavy rain or snow, simple rectangular plans and a modest budget.', 'أمطار أو ثلوج متوسطة إلى كثيفة، ومساقط مستطيلة بسيطة، وميزانية محدودة.'),
    water: [T('Gutters along both eaves with a downpipe about every 10–12 m.', 'مزاريب على طول الحافتين السفليتين مع ماسورة تصريف كل 10–12 m تقريبًا.'),
      T('A waterproof underlay under the tiles stops wind-driven rain.', 'طبقة عازلة تحت القرميد تمنع المطر الذي تدفعه الرياح.'),
      T('Metal flashing at the ridge, chimneys and wall joints.', 'رقائق معدنية (فلاشنج) عند القمة والمداخن ووصلات الجدران.'),
      T('Ventilate the attic to stop condensation.', 'هوِّ العلّية لمنع التكثف.')],
    model: { mode: 'house', key: 'rooftiles' } },

  { id: 'hip', name: T('Hip roof', 'السقف الهرمي'),
    short: T('Slopes on all four sides that meet at a short ridge, or at a single point on a square plan. There are no vertical gable walls.',
      'أسطح مائلة من الجهات الأربع تلتقي في خط قمة قصير، أو في نقطة واحدة إذا كان المسقط مربعًا. لا توجد جدران جملونية رأسية.'),
    pitch: T('Pitch 20–35°', 'الميل 20–35°'),
    plus: [T('The most wind-resistant pitched roof: no flat gable for the wind to push on.', 'أكثر الأسقف المائلة مقاومة للرياح: لا جملون مستوٍ تدفعه الرياح.'),
      T('Eaves all round shade every wall.', 'البروزات من كل الجهات تظلل كل الجدران.'),
      T('Water runs off evenly on all sides.', 'تجري المياه بالتساوي من جميع الجهات.')],
    minus: [T('More complex framing and tile cutting, so it costs more.', 'هيكل وقص قرميد أكثر تعقيدًا، فتكلفته أعلى.'),
      T('Less attic space; hips and valleys need careful sealing.', 'علّية أصغر، والأركان المائلة والمجاري تحتاج إلى إحكام دقيق.')],
    use: [{ k: 'res', why: T('Houses in windy, coastal and cyclone-prone areas.', 'المنازل في المناطق العاصفة والساحلية والمعرضة للأعاصير.') },
      { k: 'com', why: T('Hotels and resorts wanting shaded verandas all round.', 'الفنادق والمنتجعات التي تريد شرفات مظللة من كل الجهات.') },
      { k: 'pub', why: T('Single-storey schools and clinics in hot, rainy regions.', 'المدارس والعيادات ذات الطابق الواحد في المناطق الحارة الممطرة.') }],
    when: T('Windy or cyclone regions, and when overhangs on every side are wanted for shade.', 'المناطق العاصفة أو المعرضة للأعاصير، وعندما تُطلب بروزات من كل الجهات للتظليل.'),
    water: [T('Gutters run all the way round, so plan more downpipes.', 'المزاريب تحيط بالسقف كله، فخطط لعدد أكبر من مواسير التصريف.'),
      T('Seal the hip ridge caps well.', 'أحكم أغطية الأركان المائلة جيدًا.'),
      T('Line any valleys (on L-shaped plans) with metal.', 'بطّن أي مجارٍ (في المساقط على شكل L) بالمعدن.')] },

  { id: 'shed', name: T('Shed roof (mono-pitch)', 'السقف أحادي الميل'),
    short: T('A single slope running from a high wall down to a low wall.', 'سطح مائل واحد ينحدر من جدار مرتفع إلى جدار منخفض.'),
    pitch: T('Pitch 5–20°', 'الميل 5–20°'),
    plus: [T('The simplest and cheapest pitched roof.', 'أبسط سقف مائل وأرخصه.'),
      T('The high side leaves room for tall windows that bring in daylight.', 'الجانب المرتفع يتيح نوافذ عالية تُدخل ضوء النهار.'),
      T('One plane can face the sun for solar panels.', 'سطح واحد يمكن توجيهه نحو الشمس للألواح الشمسية.')],
    minus: [T('The tall wall is exposed to wind.', 'الجدار المرتفع معرض للرياح.'),
      T('All the water goes to one side, so that gutter must be large.', 'كل المياه تذهب إلى جهة واحدة، فيجب أن يكون المزراب كبيرًا.')],
    use: [{ k: 'res', why: T('Extensions against an existing wall, carports and modern homes.', 'الإضافات الملاصقة لجدار قائم ومظلات السيارات والمنازل الحديثة.') },
      { k: 'ind', why: T('Sheds, workshops and lean-to stores.', 'السقائف والورش والمخازن الملاصقة.') },
      { k: 'com', why: T('Small modern buildings with clerestory light.', 'المباني الحديثة الصغيرة ذات النوافذ العلوية.') }],
    when: T('Small spans, additions to existing buildings, and roofs that should face the sun.', 'البحور الصغيرة، والإضافات إلى المباني القائمة، والأسقف التي يجب أن تواجه الشمس.'),
    water: [T('Size the single low-side gutter for the whole roof area.', 'صمّم المزراب الوحيد في الجهة المنخفضة لكامل مساحة السقف.'),
      T('Keep the minimum slope of the covering: metal sheet ≥ 5°, tiles ≥ 15–20°.', 'التزم بأقل ميل لمادة التغطية: الصاج ≥ 5°، والقرميد ≥ 15–20°.'),
      T('Flash the joint where the roof meets the high wall.', 'ركّب رقائق معدنية عند التقاء السقف بالجدار المرتفع.')] },

  { id: 'mansard', name: T('Mansard roof', 'السقف المانسارد'),
    short: T('A four-sided roof where every side has two slopes: a very steep lower slope (60–70°) and an almost flat upper part. Dormer windows are set in the steep slopes.',
      'سقف بأربع جهات لكل جهة ميلان: ميل سفلي شديد جدًا (60–70°) وجزء علوي شبه مستوٍ. وتوضع نوافذ ناتئة (دورمر) في الأسطح شديدة الميل.'),
    pitch: T('Lower 60–70° · upper 5–15°', 'السفلي 60–70° · العلوي 5–15°'),
    plus: [T('Gives an extra full-height storey inside the roof.', 'يوفر طابقًا إضافيًا بارتفاع كامل داخل السقف.'),
      T('Adds living space where height rules limit the number of floors.', 'يضيف مساحة معيشة حيث تحدّ قوانين الارتفاع عدد الطوابق.'),
      T('A classic, elegant look.', 'مظهر كلاسيكي أنيق.')],
    minus: [T('Expensive and complex to build.', 'مكلف ومعقد التنفيذ.'),
      T('The almost flat top can leak, and steep slopes are hard to maintain.', 'الجزء العلوي شبه المستوي قد يسرّب، والأسطح شديدة الميل صعبة الصيانة.')],
    use: [{ k: 'res', why: T('City houses and apartments that need rooms in the roof.', 'منازل وشقق المدن التي تحتاج إلى غرف داخل السقف.') },
      { k: 'com', why: T('Hotels and offices in a historic style.', 'الفنادق والمكاتب ذات الطراز التاريخي.') },
      { k: 'pub', why: T('Civic buildings, town halls and museums.', 'المباني المدنية ومباني البلديات والمتاحف.') }],
    when: T('When you need living space under the roof within height limits, or a classical style.', 'عندما تحتاج إلى مساحة معيشة تحت السقف ضمن حدود الارتفاع، أو طرازًا كلاسيكيًا.'),
    water: [T('Treat the upper part like a flat roof, with a membrane and a fall to outlets.', 'عامل الجزء العلوي كسقف مستوٍ، بغشاء عازل وميل نحو المصارف.'),
      T('Flash the line where the two slopes meet, and around every dormer.', 'ركّب رقائق معدنية عند خط التقاء الميلين وحول كل نافذة ناتئة.'),
      T('Gutters at the eaves.', 'مزاريب عند الحواف السفلية.')] },

  { id: 'gambrel', name: T('Gambrel roof', 'سقف الجمبرل (سقف الحظيرة)'),
    short: T('The "barn" roof: two slopes on each of two sides, a steep lower one and a shallow upper one, with gable walls at the ends.',
      'سقف «الحظيرة»: ميلان في كل من الجهتين، سفلي شديد وعلوي خفيف، مع جدارين جملونيين في الطرفين.'),
    pitch: T('Lower about 60° · upper about 30°', 'السفلي نحو 60° · العلوي نحو 30°'),
    plus: [T('A large, tall loft for storage or bedrooms.', 'علّية كبيرة وعالية للتخزين أو غرف النوم.'),
      T('Simpler framing than a mansard.', 'هيكل أبسط من المانسارد.')],
    minus: [T('Weak under heavy snow or wind unless well braced.', 'ضعيف تحت الثلوج الكثيفة أو الرياح ما لم يُدعَّم جيدًا.'),
      T('The joint between the two slopes needs care; gable ends are exposed.', 'الوصلة بين الميلين تحتاج إلى عناية، والجملونات مكشوفة.')],
    use: [{ k: 'ind', why: T('Barns, farm stores and agricultural buildings: maximum storage under the roof.', 'الحظائر والمخازن الزراعية: أكبر مساحة تخزين تحت السقف.') },
      { k: 'res', why: T('Barn-style houses with bedrooms in the roof.', 'المنازل بطراز الحظيرة مع غرف نوم في السقف.') },
      { k: 'com', why: T('Rustic shops and cafés.', 'المحلات والمقاهي ذات الطابع الريفي.') }],
    when: T('When you want the most space under a two-sided roof, such as farm buildings.', 'عندما تريد أكبر مساحة تحت سقف ذي جهتين، مثل المباني الزراعية.'),
    water: [T('Flash the change of slope carefully.', 'ركّب رقائق معدنية بعناية عند تغير الميل.'),
      T('Keep the upper slope at least 15° if it is tiled.', 'اجعل الميل العلوي 15° على الأقل إذا كان مغطى بالقرميد.'),
      T('Gutters at the eaves on both sides.', 'مزاريب عند الحافتين السفليتين.')] },

  { id: 'butterfly', name: T('Butterfly roof', 'السقف الفراشي'),
    short: T('Two roof planes that slope inwards to a central valley: an upside-down gable, shaped like a V or a butterfly\'s wings.',
      'سطحان يميلان إلى الداخل نحو مجرى في المنتصف: جملون مقلوب على شكل حرف V أو جناحي فراشة.'),
    pitch: T('Pitch 5–15° each side', 'الميل 5–15° لكل جهة'),
    plus: [T('Collects all the rain at one valley: easy to harvest into a tank.', 'يجمع كل المطر في مجرى واحد: سهل التجميع في خزان.'),
      T('High outer walls allow big windows and plenty of daylight.', 'الجدران الخارجية العالية تتيح نوافذ كبيرة وضوءًا وفيرًا.'),
      T('Modern look; good for solar panels.', 'مظهر حديث، ومناسب للألواح الشمسية.')],
    minus: [T('The valley gutter must be large and perfectly waterproofed; a blocked valley leaks.', 'مجرى المنتصف يجب أن يكون كبيرًا ومعزولًا تمامًا، فانسداده يسبب التسرب.'),
      T('Snow and leaves collect in the valley; costlier than a gable.', 'يتجمع الثلج وأوراق الشجر في المجرى، وأغلى من الجملوني.')],
    use: [{ k: 'res', why: T('Modern eco-houses that harvest rainwater.', 'المنازل البيئية الحديثة التي تجمع مياه الأمطار.') },
      { k: 'pub', why: T('Schools and visitor centres that teach sustainability.', 'المدارس ومراكز الزوار التي تعلّم الاستدامة.') },
      { k: 'com', why: T('Showrooms that want a striking roofline.', 'صالات العرض التي تريد خط سقف لافتًا.') }],
    when: T('When you want to collect rainwater, in dry to moderate climates, or as an architectural statement.', 'عندما تريد جمع مياه الأمطار، في المناخ الجاف إلى المعتدل، أو كبصمة معمارية.'),
    water: [T('A wide box gutter in the valley with a fall to the outlets, and overflows at both ends.', 'مزراب صندوقي عريض في المجرى بميل نحو المخارج، مع فتحات طوارئ في الطرفين.'),
      T('Line the valley with a continuous membrane.', 'بطّن المجرى بغشاء عازل متصل.'),
      T('Lead the downpipes to a storage tank, and clear leaves often.', 'وجّه مواسير التصريف إلى خزان، ونظّف الأوراق باستمرار.')] },

  { id: 'dome', name: T('Dome roof', 'السقف القبوي (القبة)'),
    short: T('A curved shell, usually half a sphere. It carries its own weight by compression in every direction, so it can cover a large space with no columns.',
      'قشرة منحنية، غالبًا نصف كرة، تحمل وزنها بالضغط في كل الاتجاهات، فتغطي مساحة كبيرة دون أعمدة.'),
    pitch: T('Curved: steep at the base, flat at the top', 'منحنٍ: شديد الميل عند القاعدة ومستوٍ عند القمة'),
    plus: [T('Covers a large hall with no columns using little material.', 'يغطي قاعة كبيرة دون أعمدة بمواد قليلة.'),
      T('Very strong: the shell works in compression.', 'قوي جدًا: القشرة تعمل بالضغط.'),
      T('Sheds rain all round; hot air rises into the dome, which helps cooling.', 'يصرّف المطر من كل الجهات، والهواء الساخن يرتفع داخل القبة فيساعد على التبريد.')],
    minus: [T('Complex formwork and skilled work.', 'شدة معقدة وعمل يحتاج إلى مهارة.'),
      T('Joints in the covering are hard to waterproof.', 'الفواصل في التغطية صعبة العزل.'),
      T('The space inside is hard to divide and can echo.', 'الفراغ الداخلي صعب التقسيم وقد يحدث فيه صدى.')],
    use: [{ k: 'pub', why: T('Mosques, churches, observatories and government buildings: large symbolic halls without columns.', 'المساجد والكنائس والمراصد والمباني الحكومية: قاعات رمزية كبيرة بلا أعمدة.') },
      { k: 'com', why: T('Stadiums, exhibition halls and planetariums.', 'الملاعب وقاعات المعارض والقبب الفلكية.') },
      { k: 'res', why: T('Traditional mud-brick houses in hot, dry regions, where domes keep rooms cool.', 'البيوت التقليدية من الطوب اللبن في المناطق الحارة الجافة، حيث تحافظ القباب على برودة الغرف.') }],
    when: T('Large column-free halls, symbolic buildings, and hot dry climates.', 'القاعات الكبيرة بلا أعمدة، والمباني الرمزية، والمناخ الحار الجاف.'),
    water: [T('Water runs off all round: add a gutter ring or a drip edge at the base.', 'تجري المياه من كل الجهات: أضف حلقة مزاريب أو حافة تقطير عند القاعدة.'),
      T('Cover with a waterproof coating, copper, lead or sealed tiles.', 'غطِّ بطبقة عازلة أو نحاس أو رصاص أو بلاط محكم الفواصل.'),
      T('Seal carefully around skylights, and allow for expansion joints.', 'أحكم العزل حول فتحات الإضاءة، واترك فواصل للتمدد.')] },

  { id: 'pitched', name: T('Pitched roof (the general family)', 'السقف المائل (العائلة العامة)'),
    short: T('Any roof with a slope of more than about 10°. Gable, hip, mansard and gambrel roofs are all kinds of pitched roof. The pitch is the rise divided by the run, often given in degrees.',
      'أي سقف ميله أكثر من 10° تقريبًا. الجملوني والهرمي والمانسارد والجمبرل كلها أنواع من الأسقف المائلة. الميل هو الارتفاع مقسومًا على المسافة الأفقية، ويُعطى غالبًا بالدرجات.'),
    pitch: T('Pitch above 10°, chosen to suit the covering', 'الميل أكثر من 10°، ويُختار بما يناسب مادة التغطية'),
    plus: [T('Sheds rain and snow quickly; tiles and metal last a long time.', 'يصرّف المطر والثلج بسرعة، والقرميد والمعدن يعمّران طويلًا.'),
      T('The roof space holds insulation and ventilation.', 'فراغ السقف يستوعب العزل والتهوية.')],
    minus: [T('More roof area and material than a flat roof.', 'مساحة سقف ومواد أكثر من السقف المستوي.'),
      T('The roof cannot be used as a terrace; work is at height.', 'لا يمكن استخدام السطح للجلوس، والعمل يكون على ارتفاع.')],
    use: [{ k: 'res', why: T('Houses in rainy and snowy climates.', 'المنازل في المناخ الممطر والثلجي.') },
      { k: 'ind', why: T('Steel portal frames with a low pitch of 6–10°.', 'الهياكل البوابية الفولاذية بميل قليل 6–10°.') },
      { k: 'com', why: T('Small commercial buildings and petrol stations.', 'المباني التجارية الصغيرة ومحطات الوقود.') }],
    when: T('Rain and snow climates. Match the pitch to the covering: metal sheets ≥ 5°, concrete or clay tiles about 17–22° or more, slate 25° or more; snowy regions use 30–45°.', 'المناخ الممطر والثلجي. اختر الميل حسب التغطية: الصاج ≥ 5°، والقرميد الخرساني أو الطيني نحو 17–22° أو أكثر، والإردواز 25° أو أكثر، والمناطق الثلجية 30–45°.'),
    water: [T('Underlay membrane beneath the covering.', 'غشاء عازل تحت مادة التغطية.'),
      T('Gutters and downpipes at the eaves.', 'مزاريب ومواسير تصريف عند الحواف السفلية.'),
      T('Flashing at walls, chimneys and valleys.', 'رقائق معدنية عند الجدران والمداخن والمجاري.'),
      T('Overhangs of 30–60 cm keep rain off the walls.', 'بروزات 30–60 سم تحمي الجدران من المطر.')] },
];

// =====================================================================
// drawings
// =====================================================================
const MARKERS = `<defs>
  <marker id="rfA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--amber-ink)"/></marker>
  <marker id="rfW" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--comp)"/></marker>
</defs>`;

// ---------- slab plans and sections (2D) ----------
const C = 'fill="var(--dg-concrete)" stroke="var(--dg-edge)" stroke-width="1.2"';
const BM = 'fill="var(--dg-edge)"';
const BL = 'fill="var(--dg-brick)" stroke="var(--dg-edge)" stroke-width="1"';
const ST = 'stroke="var(--dg-steel)" stroke-width="1.4" fill="none"';
const AR = 'stroke="var(--amber-ink)" stroke-width="1.8" fill="none" marker-end="url(#rfA)"';
const AR2 = 'stroke="var(--amber-ink)" stroke-width="1.8" fill="none" marker-start="url(#rfA)" marker-end="url(#rfA)"';
const r = (x, y, w, h, a) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${a}/>`;
const ln = (x1, y1, x2, y2, a) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${a}/>`;
const tx = (x, y, s, a = '') => `<text x="${x}" y="${y}" class="rf-t" ${a}>${esc(s)}</text>`;
const PLAN = T('Plan', 'مسقط'), SEC = T('Section', 'قطاع');
const labels = () => tx(6, 12, L(PLAN)) + tx(6, 110, L(SEC));
const col = (x, y, s = 8) => r(x - s / 2, y - s / 2, s, s, BM);

const SLAB_SVG = {
  oneway: () => labels() + r(24, 22, 196, 56, C + ' fill-opacity=".55"') + r(20, 17, 204, 6, BM) + r(20, 77, 204, 6, BM)
    + [60, 122, 184].map((x) => ln(x, 30, x, 70, AR2)).join('') + tx(122, 95, L(T('long side > 2 × short side', 'الطويل > 2 × القصير')), 'text-anchor="middle"')
    + r(40, 118, 164, 7, C) + ln(44, 123, 200, 123, ST) + r(40, 125, 14, 24, BM) + r(190, 125, 14, 24, BM)
    + [80, 122, 164].map((x) => ln(x, 104, x, 115, AR)).join(''),
  twoway: () => labels() + r(66, 20, 112, 60, C + ' fill-opacity=".55"') + r(60, 15, 124, 6, BM) + r(60, 79, 124, 6, BM) + r(60, 15, 6, 70, BM) + r(178, 15, 6, 70, BM)
    + ln(122, 28, 122, 72, AR2) + ln(76, 50, 168, 50, AR2) + tx(122, 97, L(T('long ÷ short ≤ 2', 'الطويل ÷ القصير ≤ 2')), 'text-anchor="middle"')
    + r(40, 118, 164, 7, C) + ln(44, 123, 200, 123, ST) + r(40, 125, 14, 24, BM) + r(190, 125, 14, 24, BM) + r(115, 125, 14, 24, BM + ' opacity=".55"')
    + [80, 164].map((x) => ln(x, 104, x, 115, AR)).join(''),
  flatslab: () => labels() + r(20, 18, 204, 66, C + ' fill-opacity=".55"')
    + [[44, 34], [200, 34], [44, 70], [200, 70], [122, 34], [122, 70]].map(([x, y]) => r(x - 13, y - 11, 26, 22, 'fill="none" stroke="var(--dg-edge)" stroke-dasharray="3 2"') + col(x, y)).join('')
    + ln(83, 52, 52, 40, AR) + ln(161, 52, 192, 40, AR) + ln(83, 52, 114, 40, AR)
    + r(14, 116, 216, 9, C) + r(30, 125, 32, 6, C) + r(182, 125, 32, 6, C) + r(40, 131, 12, 26, BM) + r(192, 131, 12, 26, BM)
    + tx(46, 103, L(T('drop panel', 'سقوط')), 'text-anchor="middle"'),
  flatplate: () => labels() + r(20, 18, 204, 66, C + ' fill-opacity=".55"')
    + [[44, 34], [200, 34], [44, 70], [200, 70], [122, 34], [122, 70]].map(([x, y]) => col(x, y)).join('')
    + [[44, 70], [200, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="none" stroke="var(--ten)" stroke-dasharray="2 2"/>`).join('')
    + r(14, 118, 216, 8, C) + ln(18, 120, 226, 120, ST) + r(40, 126, 12, 30, BM) + r(192, 126, 12, 30, BM)
    + `<path d="M34 126 L22 118 M58 126 L70 118 M186 126 L174 118 M210 126 L222 118" stroke="var(--ten)" stroke-dasharray="2 2"/>`
    + tx(122, 100, L(T('punching shear checked around each column', 'يُفحص القص الثاقب حول كل عمود')), 'text-anchor="middle"'),
  ribbed: () => labels() + r(20, 17, 204, 6, BM) + r(20, 77, 204, 6, BM)
    + Array.from({ length: 9 }, (_, i) => r(26 + i * 22, 23, 14, 54, BL)).join('') + Array.from({ length: 10 }, (_, i) => r(20 + i * 22, 23, 6, 54, C)).join('')
    + ln(232, 28, 232, 72, AR2)
    + r(16, 112, 212, 6, C) + Array.from({ length: 5 }, (_, i) => r(16 + i * 46, 118, 10, 22, C)).join('')
    + Array.from({ length: 4 }, (_, i) => r(27 + i * 46, 118, 34, 20, BL) + `<circle cx="${37 + i * 46}" cy="128" r="4" fill="none" stroke="var(--dg-edge)"/><circle cx="${51 + i * 46}" cy="128" r="4" fill="none" stroke="var(--dg-edge)"/>`).join('')
    + ln(18, 137, 226, 137, ST) + tx(122, 156, L(T('hollow blocks between ribs', 'بلوك مفرغ بين الأعصاب')), 'text-anchor="middle"'),
  waffle: () => labels() + r(20, 16, 204, 70, C + ' fill-opacity=".55"')
    + Array.from({ length: 6 }, (_, i) => Array.from({ length: 3 }, (_, j) => r(28 + i * 33, 22 + j * 21, 25, 15, 'fill="var(--surface-solid)" stroke="var(--dg-edge)" stroke-width="1" rx="1.5"')).join('')).join('')
    + r(16, 110, 212, 7, C) + Array.from({ length: 6 }, (_, i) => `<path d="M${18 + i * 41} 117 h12 l-2 22 h-8z" ${C}/>`).join('')
    + ln(18, 136, 226, 136, ST) + tx(122, 156, L(T('ribs in both directions, empty coffers', 'أعصاب في الاتجاهين وتجاويف فارغة')), 'text-anchor="middle"'),
  hollowcore: () => labels() + r(20, 15, 204, 6, BM) + r(20, 81, 204, 6, BM)
    + Array.from({ length: 6 }, (_, i) => r(22 + i * 33.5, 21, 32, 60, C) + [8, 16, 24].map((d) => ln(22 + i * 33.5 + d, 26, 22 + i * 33.5 + d, 76, 'stroke="var(--dg-edge)" stroke-dasharray="3 2" opacity=".7"')).join('')).join('')
    + ln(232, 26, 232, 76, AR2)
    + Array.from({ length: 5 }, (_, i) => r(18 + i * 42, 116, 40, 22, C) + [0, 1, 2, 3].map((k) => `<circle cx="${25 + i * 42 + k * 8.7}" cy="127" r="3.4" fill="var(--surface-solid)" stroke="var(--dg-edge)"/>`).join('')).join('')
    + r(18, 112, 208, 4, C + ' fill-opacity=".6"') + tx(122, 156, L(T('prestressed planks with round voids', 'ألواح سابقة الإجهاد بفراغات دائرية')), 'text-anchor="middle"'),
  composite: () => labels() + Array.from({ length: 3 }, (_, i) => r(20, 22 + i * 26, 204, 5, BM)).join('')
    + Array.from({ length: 26 }, (_, i) => ln(24 + i * 7.8, 18, 24 + i * 7.8, 82, 'stroke="var(--dg-edge)" stroke-width=".8" opacity=".55"')).join('')
    + ln(232, 28, 232, 72, AR2)
    + `<path d="M14 112 H230 V128 H14 Z" ${C}/>`
    + `<path d="M14 128 ${Array.from({ length: 6 }, (_, i) => `L${22 + i * 36} 128 L${28 + i * 36} 120 L${40 + i * 36} 120 L${46 + i * 36} 128`).join(' ')} L230 128" fill="none" stroke="var(--dg-steel)" stroke-width="2"/>`
    + r(112, 128, 20, 3, 'fill="var(--dg-steel)"') + r(120, 131, 4, 18, 'fill="var(--dg-steel)"') + r(110, 149, 24, 3, 'fill="var(--dg-steel)"')
    + ln(117, 128, 117, 121, 'stroke="var(--dg-steel)" stroke-width="2"') + ln(127, 128, 127, 121, 'stroke="var(--dg-steel)" stroke-width="2"')
    + tx(60, 160, L(T('steel deck', 'صاج معدني')), 'text-anchor="middle"') + tx(184, 160, L(T('studs + steel beam', 'مسامير + جسر فولاذي')), 'text-anchor="middle"'),
};

// ---------- roof shapes (3D, simple projection) ----------
const W = 4.4, D = 3.2, H = 1.6, K = 25, OX = 98, OY = 72;
const pr = ([x, y, z]) => [OX + (x - z) * K * 0.866, OY + (x + z) * K * 0.5 - y * K];
const f2 = (n) => Math.round(n * 10) / 10;
const LIGHT = (() => { const v = [-0.55, 1, 0.75], m = Math.hypot(...v); return v.map((c) => c / m); })();
function normal(pts) {
  let n = [0, 0, 0];
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); }
  const m = Math.hypot(...n) || 1; return n.map((c) => c / m);
}
const face = (kind, ...pts) => ({ kind, pts });
const frontWall = (prof = [[0, H], [W, H]]) => face('wall', [0, 0, D], [W, 0, D], ...prof.slice().reverse().map(([x, y]) => [x, y, D]));
const sideWall = (prof = [[0, H], [D, H]]) => face('wall', [W, 0, 0], ...prof.map(([z, y]) => [W, y, z]), [W, 0, D]);
const onF = (f) => Object.assign(f, { on: 'front' }), onS = (f) => Object.assign(f, { on: 'side' });
const winF = (x0, x1, y0, y1) => onF(face('glass', [x0, y0, D + 0.01], [x1, y0, D + 0.01], [x1, y1, D + 0.01], [x0, y1, D + 0.01]));
const winS = (z0, z1, y0, y1) => onS(face('glass', [W + 0.01, y0, z0], [W + 0.01, y0, z1], [W + 0.01, y1, z1], [W + 0.01, y1, z0]));
const openings = () => [winF(0.5, 1.3, 0.75, 1.3), winF(2.9, 3.7, 0.75, 1.3), onF(face('door', [1.8, 0, D + 0.01], [2.5, 0, D + 0.01], [2.5, 1.15, D + 0.01], [1.8, 1.15, D + 0.01])), winS(0.5, 1.3, 0.75, 1.3), winS(1.9, 2.7, 0.75, 1.3)];

function drawFaces(all, extra = '') {
  const faces = all.filter((f) => !f.on);
  const items = faces.map((f) => {
    let n = normal(f.pts);
    if (f.kind === 'roof' || f.kind === 'flat') { if (n[1] < 0) n = n.map((c) => -c); }
    else if (n[0] + n[1] + n[2] < 0) n = n.map((c) => -c);
    const lit = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
    const c = f.pts.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]).map((v) => v / f.pts.length);
    const depth = c[0] + c[2] + c[1] * 0.35 + (f.kind === 'glass' || f.kind === 'door' ? 0.05 : 0);
    return { f, lit, depth };
  }).sort((a, b) => a.depth - b.depth);
  // windows, doors and dormers are drawn straight after the wall or roof plane they sit on
  const parentOf = (o) => typeof o.on === 'object' ? o.on
    : faces.find((f) => f.kind === 'wall' && f.pts.every((p) => (o.on === 'front' ? p[2] === D : p[0] === W)));
  for (const o of all.filter((f) => f.on)) {
    const at = items.findIndex((it) => it.f === parentOf(o));
    items.splice(at + 1, 0, { f: o, lit: 1 });
  }
  const fill = { wall: 'var(--rf-wall)', roof: 'var(--rf-roof)', flat: 'var(--rf-flat)', glass: 'var(--rf-glass)', door: 'var(--rf-door)', dome: 'var(--rf-roof)' };
  return items.map(({ f, lit }) => {
    const d = f.pts.map(pr).map(([x, y]) => `${f2(x)},${f2(y)}`).join(' ');
    const shade = f.kind === 'glass' || f.kind === 'door' ? 0 : (1 - lit) * 0.42;
    return `<polygon points="${d}" fill="${fill[f.kind]}" stroke="var(--rf-edge)" stroke-width=".9" stroke-linejoin="round"/>`
      + (shade > 0.01 ? `<polygon points="${d}" fill="#000" fill-opacity="${f2(shade * 100) / 100}" stroke="none"/>` : '');
  }).join('') + extra;
}
const seg = (a, b, cls) => { const [x1, y1] = pr(a), [x2, y2] = pr(b); return `<line x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(x2)}" y2="${f2(y2)}" class="${cls}"/>`; };
const rain = (...pairs) => pairs.map(([a, b]) => seg(a, b, 'rf-rain')).join('');
const gutter = (...pairs) => pairs.map(([a, b]) => seg(a, b, 'rf-gut')).join('');
const label3 = (p, s, anchor = 'start') => { const [x, y] = pr(p); return `<text x="${f2(x)}" y="${f2(y)}" class="rf-t" text-anchor="${anchor}">${esc(s)}</text>`; };
const ground = () => { const g = [[-0.5, 0, -0.5], [W + 0.5, 0, -0.5], [W + 0.5, 0, D + 0.5], [-0.5, 0, D + 0.5]].map(pr).map(([x, y]) => `${f2(x)},${f2(y)}`).join(' '); return `<polygon points="${g}" class="rf-ground"/>`; };

// rebuild the gable/pitched family with a given ridge height and eave overhang
function gableFaces(rise, e = 0.25) {
  const R = H + rise, s = rise / (D / 2), yE = H - e * s;
  return { R, yE, faces: [frontWall(), sideWall([[0, H], [D / 2, R], [D, H]]), ...openings(),
    face('roof', [-0.2, yE, D + e], [W + 0.2, yE, D + e], [W + 0.2, R, D / 2], [-0.2, R, D / 2]),
    face('roof', [-0.2, R, D / 2], [W + 0.2, R, D / 2], [W + 0.2, yE, -e], [-0.2, yE, -e])] };
}

const ROOF_SVG = {
  flat: () => {
    const P = H + 0.28, i = 0.14;
    return ground() + drawFaces([frontWall([[0, P], [W, P]]), sideWall([[0, P], [D, P]]), ...openings(),
      face('flat', [0, P, 0], [W, P, 0], [W, P, D], [0, P, D])])
      + `<polygon points="${[[i, P, i], [W - i, P, i], [W - i, P, D - i], [i, P, D - i]].map(pr).map(([x, y]) => `${f2(x)},${f2(y)}`).join(' ')}" fill="none" stroke="var(--rf-edge)" stroke-width=".8"/>`
      + rain([[1.0, P, 0.8], [W - 0.55, P, D - 0.55]], [[W - 0.6, P, 0.6], [W - 0.55, P, D - 0.85]], [[1.0, P, D - 0.6], [W - 0.85, P, D - 0.55]])
      + (() => { const [x, y] = pr([W - 0.45, P, D - 0.45]); return `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="4.5" ry="2.6" fill="var(--comp)"/>`; })()
      + gutter([[W, P - 0.12, D - 0.45], [W + 0.25, P - 0.12, D - 0.45]], [[W + 0.25, P - 0.12, D - 0.45], [W + 0.25, 0.1, D - 0.45]])
      + label3([0.3, P + 0.15, 0.2], L(T('fall 1–2% → drain', 'ميل 1–2% ← مصرف')));
  },
  gable: () => {
    const { R, yE, faces } = gableFaces(1.2);
    return ground() + drawFaces(faces) + rain([[1.4, R - 0.1, D / 2 + 0.2], [1.4, yE + 0.15, D + 0.1]], [[3.1, R - 0.1, D / 2 + 0.2], [3.1, yE + 0.15, D + 0.1]])
      + gutter([[-0.2, yE, D + 0.25], [W + 0.2, yE, D + 0.25]], [[W + 0.15, yE, D + 0.25], [W + 0.15, 0.1, D + 0.25]])
      + label3([W / 2 - 1.1, R + 0.35, D / 2 - 0.4], L(T('ridge', 'خط القمة'))) + label3([W + 0.2, H + 0.3, D / 2 + 0.05], L(T('gable', 'الجملون')));
  },
  hip: () => {
    const e = 0.25, rise = 1.15, s = rise / (D / 2), R = H + rise, yE = H - e * s, x1 = D / 2, x2 = W - D / 2, a = -e, b = W + e, c = -e, d = D + e;
    return ground() + drawFaces([frontWall(), sideWall(), ...openings(),
      face('roof', [a, yE, d], [b, yE, d], [x2, R, D / 2], [x1, R, D / 2]),
      face('roof', [b, yE, c], [a, yE, c], [x1, R, D / 2], [x2, R, D / 2]),
      face('roof', [a, yE, c], [a, yE, d], [x1, R, D / 2]),
      face('roof', [b, yE, d], [b, yE, c], [x2, R, D / 2])])
      + rain([[2.2, R - 0.12, D / 2 + 0.2], [2.2, yE + 0.15, D + 0.1]], [[x2 + 0.25, R - 0.15, D / 2], [W + 0.05, yE + 0.15, D / 2]])
      + gutter([[a, yE, d], [b, yE, d]], [[b, yE, d], [b, yE, c]], [[b, yE, d], [b, 0.1, d]]);
  },
  shed: () => {
    const hi = H + 1.15, lo = H + 0.2, at = (z) => hi + (lo - hi) * (z / D);
    return ground() + drawFaces([frontWall([[0, lo], [W, lo]]), sideWall([[0, hi], [D, lo]]), ...openings(), winS(0.25, 2.0, H + 0.1, at(2.0) - 0.15),
      face('roof', [-0.2, at(-0.2), -0.2], [W + 0.2, at(-0.2), -0.2], [W + 0.2, at(D + 0.3), D + 0.3], [-0.2, at(D + 0.3), D + 0.3])])
      + rain([[1.3, at(0.3) + 0.03, 0.3], [1.3, at(D) + 0.03, D]], [[3.1, at(0.3) + 0.03, 0.3], [3.1, at(D) + 0.03, D]])
      + gutter([[-0.2, at(D + 0.3), D + 0.3], [W + 0.2, at(D + 0.3), D + 0.3]], [[W + 0.15, at(D + 0.3), D + 0.3], [W + 0.15, 0.1, D + 0.3]])
      + label3([W + 0.2, H + 0.95, 0.4], L(T('high windows', 'نوافذ عالية')));
  },
  mansard: () => {
    const e = 0.1, i = 0.5, t = H + 1.05, top = H + 1.25, a = -e, b = W + e, c = -e, d = D + e;
    const front = face('roof', [a, H, d], [b, H, d], [W - i, t, D - i], [i, t, D - i]);
    const dorm = (u0, u1) => { const X = (u) => a + (b - a) * u; const v0 = 0.25, v1 = 0.78; const pt = (u, v) => [X(u), H + (t - H) * v, d - (i + e) * v + 0.02]; return Object.assign(face('glass', pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)), { on: front }); };
    return ground() + drawFaces([frontWall(), sideWall(), ...openings(), front,
      face('roof', [b, H, c], [a, H, c], [i, t, i], [W - i, t, i]),
      face('roof', [a, H, c], [a, H, d], [i, t, D - i], [i, t, i]),
      face('roof', [b, H, d], [b, H, c], [W - i, t, i], [W - i, t, D - i]),
      face('roof', [i, t, i], [W - i, t, i], [W - i, top, D / 2], [i, top, D / 2]),
      face('roof', [i, t, D - i], [W - i, t, D - i], [W - i, top, D / 2], [i, top, D / 2]),
      face('roof', [W - i, t, i], [W - i, t, D - i], [W - i, top, D / 2]),
      dorm(0.2, 0.33), dorm(0.67, 0.8)])
      + rain([[2.2, top - 0.02, D / 2 + 0.2], [2.2, t + 0.04, D - i]])
      + gutter([[a, H, d], [b, H, d]], [[b, H, d], [b, H, c]], [[b, H, d], [b, 0.1, d]])
      + label3([W + 0.35, H + 0.6, D / 2 + 0.2], L(T('steep lower slope', 'ميل سفلي شديد')));
  },
  gambrel: () => {
    const k = 0.55, m = H + 1.0, R = H + 1.5, e = 0.15;
    const prof = [[0, H], [k, m], [D / 2, R], [D - k, m], [D, H]];
    return ground() + drawFaces([frontWall(), sideWall(prof), ...openings(), winS(1.3, 1.9, H + 0.55, H + 1.05),
      face('roof', [-e, H, D], [W + e, H, D], [W + e, m, D - k], [-e, m, D - k]),
      face('roof', [-e, m, D - k], [W + e, m, D - k], [W + e, R, D / 2], [-e, R, D / 2]),
      face('roof', [-e, R, D / 2], [W + e, R, D / 2], [W + e, m, k], [-e, m, k]),
      face('roof', [-e, m, k], [W + e, m, k], [W + e, H, 0], [-e, H, 0])])
      + rain([[1.5, R - 0.05, D / 2 + 0.15], [1.5, m + 0.05, D - k - 0.05]], [[1.5, m - 0.05, D - k + 0.05], [1.5, H + 0.1, D - 0.05]])
      + gutter([[-e, H, D], [W + e, H, D]], [[W + 0.1, H, D], [W + 0.1, 0.1, D]]);
  },
  butterfly: () => {
    const hi = H + 0.95, lo = H + 0.3, e = 0.25, s = (hi - lo) / (D / 2), hE = hi + e * s;
    return ground() + drawFaces([frontWall([[0, hi], [W, hi]]), sideWall([[0, hi], [D / 2, lo], [D, hi]]), ...openings(), winF(0.5, 3.7, H + 0.1, hi - 0.12),
      face('roof', [-0.2, hE, D + e], [W + 0.2, hE, D + e], [W + 0.2, lo, D / 2], [-0.2, lo, D / 2]),
      face('roof', [-0.2, lo, D / 2], [W + 0.2, lo, D / 2], [W + 0.2, hE, -e], [-0.2, hE, -e])])
      + rain([[1.4, hi - 0.05, D - 0.2], [1.4, lo + 0.1, D / 2 + 0.2]], [[3.0, hi - 0.05, D - 0.2], [3.0, lo + 0.1, D / 2 + 0.2]], [[2.2, hi - 0.1, 0.3], [2.2, lo + 0.1, D / 2 - 0.2]])
      + gutter([[-0.2, lo, D / 2], [W + 0.2, lo, D / 2]], [[W + 0.25, lo, D / 2], [W + 0.25, 0.1, D / 2]])
      + label3([W + 0.4, lo - 0.25, D / 2], L(T('valley gutter → tank', 'مجرى ← خزان')));
  },
  dome: () => {
    const P = H + 0.15, rr = 1.35, cx = W / 2, cz = D / 2;
    const base = drawFaces([frontWall([[0, P], [W, P]]), sideWall([[0, P], [D, P]]), ...openings(), face('flat', [0, P, 0], [W, P, 0], [W, P, D], [0, P, D])]);
    const [sx, sy] = pr([cx, P, cz]), rx = rr * K * 1.2247 * 0.82, ry = rr * K * 0.7071 * 0.82, hh = rr * K * 1.05;
    // drum
    const dh = 0.35 * K;
    const drum = `<path d="M${f2(sx - rx)} ${f2(sy)} v${f2(-dh)} a${f2(rx)} ${f2(ry)} 0 0 0 ${f2(2 * rx)} 0 v${f2(dh)} a${f2(rx)} ${f2(ry)} 0 0 1 ${f2(-2 * rx)} 0z" fill="var(--rf-wall)" stroke="var(--rf-edge)" stroke-width=".9"/>`
      + `<path d="M${f2(sx - rx)} ${f2(sy)} v${f2(-dh)} a${f2(rx)} ${f2(ry)} 0 0 0 ${f2(2 * rx)} 0 v${f2(dh)} a${f2(rx)} ${f2(ry)} 0 0 1 ${f2(-2 * rx)} 0z" fill="url(#rfDomeShade)" stroke="none"/>`;
    const y0 = sy - dh;
    const dome = `<path d="M${f2(sx - rx)} ${f2(y0)} A${f2(rx)} ${f2(hh)} 0 0 1 ${f2(sx + rx)} ${f2(y0)} A${f2(rx)} ${f2(ry)} 0 0 1 ${f2(sx - rx)} ${f2(y0)}z" fill="var(--rf-roof)" stroke="var(--rf-edge)" stroke-width=".9"/>`
      + `<path d="M${f2(sx - rx)} ${f2(y0)} A${f2(rx)} ${f2(hh)} 0 0 1 ${f2(sx + rx)} ${f2(y0)} A${f2(rx)} ${f2(ry)} 0 0 1 ${f2(sx - rx)} ${f2(y0)}z" fill="url(#rfDomeShade)"/>`
      + `<line x1="${f2(sx)}" y1="${f2(y0 - hh)}" x2="${f2(sx)}" y2="${f2(y0 - hh - 8)}" stroke="var(--rf-edge)" stroke-width="1.4"/><circle cx="${f2(sx)}" cy="${f2(y0 - hh - 9)}" r="2" fill="var(--amber)"/>`;
    const arc = (dx) => `<path d="M${f2(sx + dx * 0.15)} ${f2(y0 - hh + 6)} Q${f2(sx + dx * 0.75)} ${f2(y0 - hh * 0.8)} ${f2(sx + dx)} ${f2(y0 + ry * 0.55)}" class="rf-rain" fill="none"/>`;
    return `<defs><linearGradient id="rfDomeShade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient></defs>`
      + ground() + base + drum + dome + arc(-rx * 0.8) + arc(rx * 0.55)
      + label3([0.2, P + 0.05, D - 0.1], L(T('ring gutter at the base', 'حلقة مزاريب عند القاعدة')));
  },
  pitched: () => {
    const rise = 1.55, { R, yE, faces } = gableFaces(rise, 0.35);
    faces.push(face('wall', [3.2, R - 0.85, 1.0], [3.55, R - 0.85, 1.0], [3.55, R + 0.35, 1.0], [3.2, R + 0.35, 1.0]), face('wall', [3.55, R - 0.85, 1.0], [3.55, R - 0.85, 0.65], [3.55, R + 0.35, 0.65], [3.55, R + 0.35, 1.0]),
      face('flat', [3.2, R + 0.35, 0.65], [3.55, R + 0.35, 0.65], [3.55, R + 0.35, 1.0], [3.2, R + 0.35, 1.0]));
    const dim = (a, b) => seg(a, b, 'rf-dim');
    return ground() + drawFaces(faces) + dim([W + 0.02, H, D], [W + 0.02, H, D / 2]) + dim([W + 0.02, H, D / 2], [W + 0.02, R, D / 2])
      + label3([W + 0.15, H - 0.38, D * 0.78], L(T('run', 'المسافة الأفقية'))) + label3([W + 0.18, H + 0.65, D / 2 - 0.05], L(T('rise', 'الارتفاع')))
      + label3([W + 0.25, H + 0.12, D + 0.05], 'θ') + rain([[1.4, R - 0.1, D / 2 + 0.2], [1.4, yE + 0.15, D + 0.15]])
      + gutter([[-0.2, yE, D + 0.35], [W + 0.2, yE, D + 0.35]]);
  },
};

const figure = (inner, cls = '') => `<svg class="rf-svg ${cls}" viewBox="0 0 240 172" role="img" aria-hidden="true">${MARKERS}${inner}</svg>`;
export const slabFigure = (id) => figure(SLAB_SVG[id]?.() || '', 'is-slab');
export const roofFigure = (id) => figure(ROOF_SVG[id]?.() || '', 'is-roof');

// =====================================================================
// panel
// =====================================================================
const UI = {
  title: T('Slabs and roofs', 'البلاطات والأسقف'),
  intro: T('Two different questions. First: which structural system carries the loads? Second: what shape does the roof have on the outside?', 'سؤالان مختلفان: أولًا، أي نظام إنشائي يحمل الأحمال؟ وثانيًا، ما الشكل الخارجي للسقف؟'),
  tab1: T('Structure: slab systems', 'الإنشاء: أنظمة البلاطات'), tab1s: T('What carries the loads', 'ما الذي يحمل الأحمال'),
  tab2: T('Shape: roof forms', 'الشكل: أنواع الأسقف'), tab2s: T('The outside architectural form', 'الشكل المعماري الخارجي'),
  lead1: T('A slab system is hidden inside the floor. It decides how the weight of people, furniture and walls travels to the beams, columns and footings, how far you can span, and how thick the floor is.',
    'نظام البلاطة مخفي داخل الأرضية، وهو يحدد كيف ينتقل وزن الناس والأثاث والجدران إلى الجسور والأعمدة والقواعد، وإلى أي مدى يمكن أن يمتد البحر، وكم تكون سماكة الأرضية.'),
  lead2: T('The roof shape is what you see from outside. It decides how rain and snow run off, how the building stands up to wind and sun, and how it looks. Blue arrows show where the rain goes.',
    'شكل السقف هو ما تراه من الخارج، وهو يحدد كيف يجري المطر والثلج، وكيف يقاوم المبنى الرياح والشمس، وكيف يبدو. الأسهم الزرقاء تبين اتجاه جريان المطر.'),
  link: T('How the two fit together: a flat roof is normally one of the slab systems with insulation and waterproofing on top. Pitched roofs usually sit on timber or steel trusses, or on a sloping concrete slab. A dome is a shell that is its own structure.',
    'كيف يرتبط الاثنان: السقف المستوي عادةً أحد أنظمة البلاطات وفوقه عزل حراري ومائي. والأسقف المائلة ترتكز غالبًا على جمالونات خشبية أو فولاذية، أو على بلاطة خرسانية مائلة. أما القبة فهي قشرة تشكّل هيكلها بنفسها.'),
  path: T('How the load travels', 'مسار الأحمال'), span: T('Typical size', 'الأبعاد المعتادة'), pitch: T('Typical slope', 'الميل المعتاد'),
  plus: T('Advantages', 'المزايا'), minus: T('Disadvantages', 'العيوب'),
  use: T('Where it is preferred, and why', 'أين يُفضَّل ولماذا'),
  when: T('Why and when to choose it', 'لماذا ومتى يُختار'),
  water: T('Drainage, rainwater and waterproofing', 'التصريف ومياه الأمطار والعزل المائي'),
  show: T('See it on the 3D model', 'شاهده على النموذج ثلاثي الأبعاد'),
  pick: T('Pick a type', 'اختر نوعًا'),
  legendLoad: T('Load direction', 'اتجاه الحمل'), legendRain: T('Rain flow', 'جريان المطر'), legendGut: T('Gutter and downpipe', 'مزراب وماسورة تصريف'),
  note: T('Study figures, not a design. Real slabs and roofs are designed by an engineer to the local code.', 'أرقام للتعلم وليست تصميمًا. يصمم المهندس البلاطات والأسقف الحقيقية وفق الكود المحلي.'),
  close: T('Close', 'إغلاق'),
};
export const ROOFS_UI = UI;

export class Roofs {
  constructor(el, { onShow, onClose } = {}) {
    this.el = el; this.onShow = onShow; this.onClose = onClose;
    this.tab = 'slab'; this.sel = { slab: 'oneway', roof: 'flat' };
    el.addEventListener('click', (e) => this.click(e));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); this.close(); return; }
      const chip = e.target.closest('[data-rf="pick"]');
      if (chip && ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        const list = [...this.el.querySelectorAll('[data-rf="pick"]')], i = list.indexOf(chip);
        const fwd = e.key === 'ArrowDown' || e.key === (document.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
        const next = list[(i + (fwd ? 1 : -1) + list.length) % list.length]; e.preventDefault(); next.click(); this.el.querySelector(`[data-id="${next.dataset.id}"]`)?.focus();
      }
    });
  }
  get isOpen() { return !this.el.hidden; }
  open(tab, id) {
    if (tab) this.tab = tab; if (id) this.sel[this.tab] = id;
    this.el.hidden = false; this.render();
    requestAnimationFrame(() => this.el.querySelector('h2')?.focus());
  }
  close() { this.el.hidden = true; this.onClose?.(); }
  click(e) {
    if (e.target === this.el) { this.close(); return; }
    const b = e.target.closest('button'); if (!b) return;
    const a = b.dataset.rf;
    if (a === 'close') this.close();
    else if (a === 'tab') { this.tab = b.dataset.tab; this.render(); this.el.querySelector(`[data-tab="${this.tab}"]`)?.focus(); }
    else if (a === 'pick') { this.sel[this.tab] = b.dataset.id; this.render(); this.el.querySelector(`[data-id="${b.dataset.id}"]`)?.focus(); this.el.querySelector('.rf-detail')?.scrollIntoView({ block: 'nearest' }); }
    else if (a === 'show') { const it = this.item(); if (it?.model) { this.el.hidden = true; this.onShow?.(it.model.mode, it.model.key); } }
  }
  list() { return this.tab === 'slab' ? SLABS : ROOFS; }
  item() { return this.list().find((x) => x.id === this.sel[this.tab]) || this.list()[0]; }
  render() {
    const isSlab = this.tab === 'slab', it = this.item(), fig = isSlab ? slabFigure : roofFigure;
    const li = (arr) => `<ul>${arr.map((x) => `<li>${esc(L(x))}</li>`).join('')}</ul>`;
    const legend = isSlab
      ? `<span><i class="lg-load"></i>${esc(L(UI.legendLoad))}</span>`
      : `<span><i class="lg-rain"></i>${esc(L(UI.legendRain))}</span><span><i class="lg-gut"></i>${esc(L(UI.legendGut))}</span>`;
    this.el.innerHTML = `<div class="qz-card ln-card rf-card" role="dialog" aria-modal="true" aria-label="${esc(L(UI.title))}">
      <header class="qz-head"><div><h2 tabindex="-1">${esc(L(UI.title))}</h2><p class="qz-sub">${esc(L(UI.intro))}</p></div>
        <button class="icon-btn" data-rf="close" aria-label="${esc(L(UI.close))}">${icon('close')}</button></header>
      <div class="rf-tabs" role="tablist">
        ${[['slab', '1', UI.tab1, UI.tab1s, 'layers'], ['roof', '2', UI.tab2, UI.tab2s, 'roof']].map(([k, n, a, s, ic]) => `<button role="tab" data-rf="tab" data-tab="${k}" aria-selected="${this.tab === k}">
          <b class="rf-num">${n}</b>${icon(ic)}<span><strong>${esc(L(a))}</strong><small>${esc(L(s))}</small></span></button>`).join('')}
      </div>
      <div class="qz-body">
        <p class="rf-lead">${esc(L(isSlab ? UI.lead1 : UI.lead2))}</p>
        <div class="rf-picks" role="listbox" aria-label="${esc(L(UI.pick))}">${this.list().map((x) => `<button role="option" data-rf="pick" data-id="${x.id}" aria-selected="${x.id === it.id}" tabindex="${x.id === it.id ? 0 : -1}">
          ${fig(x.id)}<span>${esc(L(x.name))}</span></button>`).join('')}</div>
        <article class="rf-detail" aria-live="polite">
          <div class="rf-fig">${fig(it.id)}<div class="rf-legend">${legend}</div></div>
          <div class="rf-info">
            <h3 class="rf-name">${esc(L(it.name))}</h3>
            <p class="rf-badge">${icon(isSlab ? 'layers' : 'roof')}<span><b>${esc(L(isSlab ? UI.span : UI.pitch))}:</b> ${esc(L(isSlab ? it.span : it.pitch))}</span></p>
            <p>${esc(L(it.short))}</p>
            ${isSlab ? `<p class="rf-path"><b>${esc(L(UI.path))}:</b> ${esc(L(it.path))}</p>` : ''}
            ${it.model ? `<button class="btn small" data-rf="show">${icon('focus')}<span>${esc(L(UI.show))}</span></button>` : ''}
          </div>
          <div class="rf-pm">
            <section class="rf-plus"><h4>${icon('check')}<span>${esc(L(UI.plus))}</span></h4>${li(it.plus)}</section>
            <section class="rf-minus"><h4>${icon('alert')}<span>${esc(L(UI.minus))}</span></h4>${li(it.minus)}</section>
          </div>
          <section class="rf-use"><h4>${esc(L(UI.use))}</h4>
            <ul>${it.use.map((u) => `<li><span class="rf-app">${icon(APPS[u.k].icon)}<b>${esc(L(APPS[u.k].name))}</b></span><span>${esc(L(u.why))}</span></li>`).join('')}</ul></section>
          <section class="rf-when"><h4>${esc(L(UI.when))}</h4><p>${esc(L(it.when))}</p></section>
          ${!isSlab ? `<section class="rf-water"><h4>${icon('drop')}<span>${esc(L(UI.water))}</span></h4>${li(it.water)}</section>` : ''}
        </article>
        <p class="rf-link">${icon('guide')}<span>${esc(L(UI.link))}</span></p>
        <p class="rf-note">${esc(L(UI.note))}</p>
      </div></div>`;
  }
}
