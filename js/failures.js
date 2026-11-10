// Failure simulation: typical ways reinforced concrete elements crack or fail,
// drawn on the real model in four teaching steps (loads, stress zone, possible
// cracks, failure). The zones follow textbook behaviour (bending stress grows
// with distance from the neutral axis, shear peaks near supports at mid-depth,
// and so on). They are illustrations, not results of a structural analysis.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { arrowGeometry } from './loadpath.js';
import { L, lang } from './i18n.js';

const T = (en, ar) => ({ en, ar });

export const STAGES = [T('Loads', 'الأحمال'), T('Stress zone', 'منطقة الإجهاد'), T('Possible cracks', 'الشقوق المحتملة'), T('Failure', 'الانهيار')];
export const SEVERITY = {
  warning: T('Gives warning', 'يعطي إنذارًا'),
  serious: T('Serious', 'خطير'),
  critical: T('Sudden and dangerous', 'مفاجئ وخطير'),
};
export const DISCLAIMER = T('Teaching illustration based on typical structural behaviour. It is not the result of a structural analysis of this building.',
  'رسم توضيحي تعليمي مبني على السلوك الإنشائي المعتاد، وليس نتيجة تحليل إنشائي لهذا المبنى.');

export const FAILURES = [
  {
    id: 'flexure', severity: 'warning', load: 'udl', deform: 'sag', diagram: 'flexure',
    name: T('Bending cracks in a beam', 'شقوق الانحناء في الجائز'),
    targets: {
      building: [{ key: 'beam', code: 'B1-3/B-C', face: '+z', pattern: 'flexure' }],
      house: [{ key: 'beam', code: 'B1-3/A-B', face: '+z', pattern: 'flexure' }],
    },
    where: T('The bottom face of the beam, around the middle of the span.', 'الوجه السفلي للجائز حول منتصف المجاز.'),
    why: [
      T('The load makes the beam bend downward. When it bends, the bottom is stretched and the top is squeezed.', 'الحمل يجعل الجائز ينحني إلى الأسفل، فيتمدد أسفله ويُضغط أعلاه.'),
      T('Concrete cannot take much stretching, so it cracks at the bottom first.', 'الخرسانة لا تتحمل الشد كثيرًا، لذلك تتشقق من الأسفل أولًا.'),
      T('The cracks grow if the load is too high or the bottom steel is too little.', 'تكبر الشقوق إذا زاد الحمل أو قلّ التسليح السفلي.'),
    ],
    effEl: T('Thin vertical cracks are normal: the steel holds the beam together. If the steel stretches too far, the beam sags clearly before it fails.',
      'الشقوق الرأسية الرفيعة طبيعية، والتسليح يمسك الجائز. إذا تمدد الفولاذ كثيرًا يترخّم الجائز بوضوح قبل أن ينهار.'),
    effBld: T('The slab above sags with it, tiles and walls under the beam can crack, and doors may stick. Because it gives warning, people have time to act.',
      'تنحني البلاطة معه، وقد تتشقق البلاطات والجدران أسفله وتتعثر الأبواب. ولأنه يعطي إنذارًا مسبقًا يكون هناك وقت للتصرف.'),
    note: T('Steel goes where concrete is stretched. In a normal beam that is the bottom in the middle, exactly where these cracks appear.',
      'يوضع الفولاذ حيث تُشد الخرسانة، وفي الجائز العادي يكون ذلك في الأسفل عند المنتصف، وهو مكان هذه الشقوق تمامًا.'),
    stages: [
      T('The slab and everything on it push down on the beam.', 'البلاطة وكل ما عليها تضغط على الجائز إلى الأسفل.'),
      T('The top is squeezed and the bottom is stretched. The colours are strongest in the middle of the span, at the top and bottom edges.', 'الأعلى مضغوط والأسفل مشدود. تكون الألوان أقوى في منتصف المجاز عند الحافتين العلوية والسفلية.'),
      T('Hairline cracks can start at the bottom, where the concrete is stretched.', 'قد تبدأ شقوق شعرية في الأسفل حيث تُشد الخرسانة.'),
      T('When overloaded, the cracks open wide, the beam sags and the top concrete crushes.', 'عند زيادة الحمل تتسع الشقوق ويترخّم الجائز وتتهشم الخرسانة العلوية.'),
    ],
  },
  {
    id: 'shear', severity: 'critical', load: 'udl', deform: null, diagram: 'shear',
    name: T('Shear cracks near a support', 'شقوق القص قرب الركيزة'),
    targets: {
      building: [{ key: 'beam', code: 'B1-3/A-B', face: '+z', pattern: 'shear' }],
      house: [{ key: 'beam', code: 'B1-A/2-3', face: '-x', pattern: 'shear' }],
    },
    where: T('The sides of the beam close to the columns, running at about 45°.', 'جانبا الجائز قرب الأعمدة، بميل نحو 45°.'),
    why: [
      T('Next to a column the beam carries the most shear: the load tries to slide one part of the beam down past the next.', 'بجوار العمود يتحمل الجائز أكبر قوة قص، وهي قوة تحاول أن تُنزل جزءًا من الجائز بالنسبة للجزء المجاور.'),
      T('This stretches the concrete on a slant, so the cracks open diagonally.', 'ينتج عن ذلك شد مائل في الخرسانة، فتتشقق بشكل مائل.'),
      T('Stirrups resist it. Too few stirrups, or stirrups too far apart, let these cracks grow.', 'الأساور تقاوم هذا الشد، وقلة الأساور أو تباعدها تسمح للشقوق بأن تكبر.'),
    ],
    effEl: T('A diagonal crack can split the beam suddenly, with little warning.', 'قد يشق الشق المائل الجائز فجأة ودون إنذار يُذكر.'),
    effBld: T('The slab loses its support on that side and can drop, adding load to the beams and columns nearby.', 'تفقد البلاطة ركيزتها من تلك الجهة وقد تهبط، فيزيد الحمل على الجوائز والأعمدة المجاورة.'),
    note: T('Bending gives warning; shear often does not. That is why codes require enough stirrups, so a beam bends before it can fail in shear.',
      'الانحناء يعطي إنذارًا والقص غالبًا لا يعطي. لذلك تشترط الكودات أساور كافية حتى ينحني الجائز قبل أن ينهار بالقص.'),
    stages: [
      T('The load on the beam travels to the columns at each end.', 'ينتقل الحمل على الجائز إلى العمودين عند طرفيه.'),
      T('Shear is largest near the columns and in the middle of the beam depth.', 'القص أكبر ما يكون قرب الأعمدة وفي منتصف عمق الجائز.'),
      T('Slanted cracks can start near the supports.', 'قد تبدأ شقوق مائلة قرب الركائز.'),
      T('A diagonal crack runs through the beam and it can break suddenly.', 'يمتد شق مائل عبر الجائز وقد ينكسر فجأة.'),
    ],
  },
  {
    id: 'column', severity: 'critical', load: 'axial', deform: 'bulge', diagram: 'axial',
    name: T('Column crushing', 'تهشم العمود'),
    targets: {
      building: [{ key: 'column', code: 'C-B3', floor: 1, face: '+z', pattern: 'axial' }],
      house: [{ key: 'column', code: 'C-A3', floor: 1, face: '+z', pattern: 'axial' }],
    },
    where: T('A ground floor column, usually around mid-height or just below the beams.', 'عمود في الطابق الأرضي، غالبًا حول منتصف ارتفاعه أو أسفل الجوائز مباشرة.'),
    why: [
      T('Ground floor columns carry the weight of every floor above them.', 'أعمدة الطابق الأرضي تحمل وزن كل الطوابق فوقها.'),
      T('If the load is too high or the concrete is weak, the concrete is squeezed beyond its strength.', 'إذا زاد الحمل أو كانت الخرسانة ضعيفة، تُضغط الخرسانة فوق مقاومتها.'),
      T('Stirrups that are too far apart let the main bars bend outward and the concrete core burst.', 'الأساور المتباعدة تسمح للقضبان الرئيسية بالانبعاج للخارج ولبّ الخرسانة بالتفتت.'),
    ],
    effEl: T('The outer concrete flakes off, the bars bulge outward and the column can shorten suddenly.', 'تتساقط الخرسانة الخارجية وتنبعج القضبان إلى الخارج وقد يقصر العمود فجأة.'),
    effBld: T('Every floor above loses its support at that point. This can start a progressive collapse, where one failure leads to the next.', 'تفقد كل الطوابق العلوية ركيزتها في تلك النقطة، وقد يبدأ انهيار متتابع يؤدي فيه انهيار عنصر إلى انهيار ما بعده.'),
    note: T('Columns are the most important members of a frame, so engineers give them extra safety and closely spaced stirrups near the joints.', 'الأعمدة أهم عناصر الهيكل، لذلك يصممها المهندسون بأمان إضافي وأساور متقاربة قرب الوصلات.'),
    stages: [
      T('The weight of all the floors above presses down on the column.', 'وزن كل الطوابق العلوية يضغط على العمود.'),
      T('The whole column is squeezed. The middle of its height is the most likely to bulge.', 'العمود كله مضغوط، ومنتصف ارتفاعه هو الأكثر عرضة للانتفاخ.'),
      T('Fine vertical cracks can appear, a sign the concrete is near its limit.', 'قد تظهر شقوق رأسية رفيعة، وهي علامة على أن الخرسانة قريبة من حدها.'),
      T('The cover spalls off and the bars buckle outward. The column can no longer carry the floors.', 'تتساقط طبقة الغطاء وتنبعج القضبان إلى الخارج، فلا يعود العمود قادرًا على حمل الطوابق.'),
    ],
  },
  {
    id: 'slab', severity: 'warning', load: 'area', deform: null, diagram: 'hogging', clipAbove: true,
    name: T('Cracks on top of a slab over the beams', 'شقوق أعلى البلاطة فوق الجوائز'),
    targets: {
      building: [{ key: 'slab', code: 'S1-AB/23', face: '+y', pattern: 'hogging' }],
      house: [{ key: 'slab', code: 'S1-AB/23', face: '+y', pattern: 'hogging' }],
    },
    where: T('The top surface of the slab, along the lines of the beams.', 'السطح العلوي للبلاطة على امتداد خطوط الجوائز.'),
    why: [
      T('Over a beam the slab bends the other way, like an upside-down hill, so its top is stretched.', 'فوق الجائز تنحني البلاطة في الاتجاه المعاكس كتلة مقلوبة، فيتمدد سطحها العلوي.'),
      T('Top steel resists this. If it was pushed down during the pour or is too short, the top cracks.', 'التسليح العلوي يقاوم ذلك، وإذا نزل أثناء الصب أو كان قصيرًا يتشقق السطح العلوي.'),
    ],
    effEl: T('Long cracks appear along the beam lines. Over time water can get in and reach the steel.', 'تظهر شقوق طويلة على امتداد الجوائز، وقد تتسرب المياه مع الوقت إلى الفولاذ.'),
    effBld: T('Floor tiles crack in straight lines above the beams. It is rarely a collapse risk, but it shortens the life of the slab.', 'تتشقق البلاطات في خطوط مستقيمة فوق الجوائز. نادرًا ما يسبب انهيارًا لكنه يقصّر عمر البلاطة.'),
    note: T('The middle of a slab is stretched at the bottom; over the beams it is stretched at the top. That is why slabs have two layers of steel.', 'منتصف البلاطة مشدود من الأسفل، وفوق الجوائز مشدود من الأعلى، ولهذا تحتوي البلاطات على طبقتين من التسليح.'),
    stages: [
      T('People and furniture load the whole slab.', 'الأشخاص والأثاث يحمّلون البلاطة كلها.'),
      T('On the top surface, stress is highest along the beams at the edges.', 'على السطح العلوي يكون الإجهاد أكبر على امتداد الجوائز عند الحواف.'),
      T('Cracks can start along the beam lines.', 'قد تبدأ شقوق على امتداد خطوط الجوائز.'),
      T('The cracks run the full length of the beams and open up.', 'تمتد الشقوق بطول الجوائز كاملًا وتتسع.'),
    ],
  },
  {
    id: 'settlement', severity: 'serious', load: 'settle', deform: 'drop', diagram: 'settlement',
    name: T('Uneven settlement of a footing', 'الهبوط غير المتساوي للقاعدة'),
    targets: {
      building: [{ key: ['footing', 'pilecap', 'strip'], code: ['F-B3', 'CAP-B3', 'SF-3'], face: '+z', pattern: 'pressure', drop: true },
        { key: 'brickwall', code: 'W1-3/A-B', face: '+z', pattern: 'settleR' }, { key: 'brickwall', code: 'W1-3/B-C', face: '+z', pattern: 'settleL' }],
      house: [{ key: ['footing', 'pilecap', 'strip'], code: ['F-B3', 'CAP-B3', 'SF-3'], face: '+z', pattern: 'pressure', drop: true },
        { key: 'blockwall', code: 'W1-3/A-B', face: '+z', pattern: 'settleR' }, { key: 'blockwall', code: 'W1-3/B-C', face: '+z', pattern: 'settleL' }],
    },
    where: T('The soil under one footing, with the cracks showing in the walls above it.', 'التربة أسفل قاعدة واحدة، وتظهر الشقوق في الجدران فوقها.'),
    why: [
      T('One footing sits on weaker or wetter soil, or on badly compacted fill.', 'تقع قاعدة على تربة أضعف أو مبللة أو على ردم غير مدكوك جيدًا.'),
      T('That footing sinks more than its neighbours.', 'فتهبط هذه القاعدة أكثر من القواعد المجاورة.'),
      T('The frame above is pulled out of shape. Stiff brick walls cannot stretch, so they crack.', 'يتشوه الهيكل فوقها، والجدران الطوبية الصلبة لا تتحمل التمدد فتتشقق.'),
    ],
    effEl: T('The footing and its column drop a little compared with the others.', 'تنخفض القاعدة وعمودها قليلًا مقارنة ببقية القواعد.'),
    effBld: T('Diagonal cracks run up the walls toward the sinking column, doors and windows jam, and the beams take extra bending.', 'تمتد شقوق مائلة في الجدران نحو العمود الهابط، وتتعثر الأبواب والنوافذ، وتتحمل الجوائز انحناءً إضافيًا.'),
    note: T('Diagonal wall cracks point to the cause: they rise toward the part that sank. Tie beams help prevent this by holding the footings together.', 'الشقوق المائلة في الجدران تدل على السبب، فهي ترتفع متجهة نحو الجزء الهابط. وجوائز الربط تساعد على منع ذلك بربط القواعد معًا.'),
    stages: [
      T('The column pushes its footing into the soil.', 'العمود يدفع قاعدته في التربة.'),
      T('The pressure under this footing is high, and the soil here is weaker.', 'الضغط أسفل هذه القاعدة كبير، والتربة هنا أضعف.'),
      T('Small diagonal cracks may appear in the walls next to that column.', 'قد تظهر شقوق مائلة صغيرة في الجدران بجوار ذلك العمود.'),
      T('The footing sinks. The walls crack diagonally and the frame above is pulled out of shape.', 'تهبط القاعدة، وتتشقق الجدران بشكل مائل، ويتشوه الهيكل فوقها.'),
    ],
  },
  {
    id: 'earthquake', severity: 'serious', load: 'lateral', deform: null, diagram: 'lateral',
    name: T('X-shaped cracks from an earthquake', 'شقوق على شكل X بسبب الزلزال'),
    targets: {
      building: [{ key: 'brickwall', code: 'W1-A/2-3', face: '-x', pattern: 'xcross' }, { key: 'brickwall', code: 'W1-A/1-2', face: '-x', pattern: 'xcross' }],
      house: [{ key: 'blockwall', code: 'W1-A/2-3', face: '-x', pattern: 'xcross' }, { key: 'blockwall', code: 'W1-A/1-2', face: '-x', pattern: 'xcross' }],
    },
    where: T('The walls between the columns on the ground floor.', 'الجدران بين الأعمدة في الطابق الأرضي.'),
    why: [
      T('An earthquake shakes the ground sideways, so the floors are pushed one way and then back.', 'الزلزال يهز الأرض أفقيًا، فتُدفع الطوابق في اتجاه ثم في الاتجاه المعاكس.'),
      T('Each push squeezes the wall along one diagonal and stretches it along the other.', 'كل دفعة تضغط الجدار على أحد قطريه وتشده على القطر الآخر.'),
      T('The shaking reverses, so cracks form along both diagonals and make an X.', 'ولأن الاهتزاز يتكرر في الاتجاهين، تتكون الشقوق على القطرين معًا وتشكل حرف X.'),
    ],
    effEl: T('The wall panel cracks and can fall out of the frame.', 'يتشقق الجدار وقد يسقط من داخل الهيكل.'),
    effBld: T('The ground floor carries the largest sideways force. Shear walls take most of it and stop the frame from swaying too far.', 'الطابق الأرضي يتحمل أكبر قوة أفقية، وجدران القص تحمل معظمها وتمنع الهيكل من التمايل كثيرًا.'),
    note: T('X cracks are a classic earthquake sign. A building with well placed shear walls moves less, so its walls crack less.', 'الشقوق على شكل X علامة معروفة للزلازل. المبنى الذي فيه جدران قص موزعة جيدًا يتحرك أقل، فتتشقق جدرانه أقل.'),
    stages: [
      T('The earthquake pushes every floor sideways. The ground floor carries the sum of all these pushes.', 'يدفع الزلزال كل طابق أفقيًا، والطابق الأرضي يتحمل مجموع هذه الدفعات.'),
      T('The wall is squeezed along one diagonal and stretched along the other.', 'يُضغط الجدار على أحد قطريه ويُشد على الآخر.'),
      T('Cracks can start along the stretched diagonal.', 'قد تبدأ الشقوق على القطر المشدود.'),
      T('The shaking reverses, cracks form along both diagonals, and the wall can break apart.', 'ينعكس الاهتزاز فتتكون الشقوق على القطرين، وقد يتفكك الجدار.'),
    ],
  },
  {
    id: 'balcony', severity: 'critical', load: 'cantilever', deform: 'tilt', diagram: 'cantilever',
    name: T('Cantilever balcony failure', 'انهيار الشرفة الناتئة'),
    targets: { house: [{ key: 'balcony', code: 'BL1-1', face: '+y', pattern: 'cantilever', tilt: true }] },
    where: T('The top of the balcony slab, right where it leaves the building.', 'أعلى بلاطة الشرفة عند خروجها من المبنى مباشرة.'),
    why: [
      T('A balcony hangs out with nothing under its edge, so it bends down like a diving board.', 'الشرفة معلقة دون ركيزة تحت طرفها، فتنحني إلى الأسفل مثل لوح القفز.'),
      T('That stretches the top of the slab at the support.', 'ينتج عن ذلك شد في أعلى البلاطة عند الركيزة.'),
      T('If the main steel was placed at the bottom by mistake, nothing resists that stretching.', 'إذا وُضع التسليح الرئيسي في الأسفل بالخطأ، فلا شيء يقاوم هذا الشد.'),
    ],
    effEl: T('A crack opens across the top at the support, the balcony tips down and it can break off.', 'ينفتح شق عرضي في الأعلى عند الركيزة، وتميل الشرفة إلى الأسفل، وقد تنفصل.'),
    effBld: T('A falling balcony endangers people on it and below it. Extra load such as a water tank makes it worse.', 'سقوط الشرفة يعرّض من عليها ومن تحتها للخطر، والأحمال الإضافية مثل خزان المياه تزيد الخطر.'),
    note: T('In a cantilever the stretched side is the top. Main steel at the top, anchored well back into the slab, is what holds it up.', 'في العنصر الناتئ يكون الجانب المشدود في الأعلى. التسليح الرئيسي العلوي المثبت جيدًا داخل البلاطة هو ما يحمل الشرفة.'),
    stages: [
      T('People on the balcony push its free edge down.', 'الأشخاص على الشرفة يدفعون طرفها الحر إلى الأسفل.'),
      T('Stretching is greatest at the top, where the balcony meets the building.', 'الشد أكبر ما يكون في الأعلى عند التقاء الشرفة بالمبنى.'),
      T('A crack can start across the top along the support line.', 'قد يبدأ شق عرضي في الأعلى على خط الركيزة.'),
      T('The crack opens, the balcony tips down and can break away.', 'ينفتح الشق وتميل الشرفة إلى الأسفل وقد تنفصل.'),
    ],
  },
];

// ---------- stress patterns: u along the face width, v up the face (0..1) ----------
const gauss = (d, s) => Math.exp(-(d * d) / (s * s));
const diagDist = (u, v, u0, v0, u1, v1) => {
  const dx = u1 - u0, dy = v1 - v0, t = Math.max(0, Math.min(1, ((u - u0) * dx + (v - v0) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(u - (u0 + t * dx), v - (v0 + t * dy));
};
const PATTERN = {
  flexure: (u, v) => 4 * u * (1 - u) * Math.abs(2 * v - 1),                     // σ = M·y/I
  shear: (u, v) => Math.abs(1 - 2 * u) * (1 - (2 * v - 1) ** 2),                 // τ peaks at supports, mid-depth
  axial: (u, v) => 0.72 + 0.28 * Math.sin(Math.PI * v),
  hogging: (u, v) => 0.08 + 0.92 * Math.max(0, 1 - Math.min(u, 1 - u, v, 1 - v) * 4.5),
  pressure: (u, v) => 0.25 + 0.75 * (1 - v) ** 1.4,
  // the sinking column is on the right (settleR) or left (settleL); the stretched
  // diagonal runs from the top of the firm side down to the sinking column, so
  // cracks form across it and rise toward the column that sank
  settleR: (u, v) => gauss(diagDist(u, v, 0.15, 0, 1, 0.95), 0.17) * (0.65 + 0.35 * u),
  settleL: (u, v) => gauss(diagDist(u, v, 0.85, 0, 0, 0.95), 0.17) * (0.65 + 0.35 * (1 - u)),
  xcross: (u, v) => Math.max(gauss(diagDist(u, v, 0, 0, 1, 1), 0.14), 0.75 * gauss(diagDist(u, v, 1, 0, 0, 1), 0.14)),
  cantilever: (u, v) => 0.1 + 0.9 * v ** 2.2,                                     // v = 1 at the support
};
// colour scale: low (cool) to high (red), mostly see-through when low
const STOPS = [[0, 40, 96, 210], [0.35, 50, 180, 170], [0.6, 245, 205, 50], [0.8, 245, 135, 35], [1, 215, 38, 38]];
function heat(t) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < STOPS.length; i++) if (t <= STOPS[i][0]) {
    const [a0, r0, g0, b0] = STOPS[i - 1], [a1, r1, g1, b1] = STOPS[i], k = (t - a0) / (a1 - a0);
    return [r0 + (r1 - r0) * k, g0 + (g1 - g0) * k, b0 + (b1 - b0) * k];
  }
  return STOPS[STOPS.length - 1].slice(1);
}
export const HEAT_CSS = `linear-gradient(90deg, ${STOPS.map(([a, r, g, b]) => `rgb(${r},${g},${b}) ${a * 100}%`).join(', ')})`;
function heatTexture(fn) {
  const W = 160, H = 80, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), img = g.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = fn((x + 0.5) / W, 1 - (y + 0.5) / H), [r, gg, b] = heat(t), i = (y * W + x) * 4;
    img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b; img.data[i + 3] = 255 * (0.2 + 0.78 * t);
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

// ---------- cracks and zones per pattern (normalised face coordinates) ----------
const CRACKS = {
  flexure: {
    zones: [[0.28, 0, 0.72, 0.62]],
    pot: [0.38, 0.45, 0.5, 0.55, 0.62].map((u, i) => [[u, 0.02], [u + 0.002, 0.18], [u - 0.001, 0.3 + (i % 2) * 0.1]]),
    act: [0.3, 0.36, 0.42, 0.48, 0.54, 0.6, 0.66, 0.72].map((u, i) => [[u, 0.02], [u + 0.003, 0.25], [u - 0.002, 0.48 + (i % 3) * 0.08]])
      .concat([[[0.42, 0.97], [0.47, 0.93], [0.5, 0.97], [0.54, 0.93], [0.58, 0.97]]]),
  },
  shear: {
    zones: [[0, 0, 0.33, 1], [0.67, 0, 1, 1]],
    pot: [[[0.06, 0.15], [0.13, 0.36], [0.2, 0.56]], [[0.94, 0.15], [0.87, 0.36], [0.8, 0.56]]],
    act: [[[0.03, 0.06], [0.11, 0.3], [0.19, 0.55], [0.3, 0.94]], [[0.13, 0.04], [0.22, 0.38], [0.33, 0.72]],
      [[0.97, 0.06], [0.89, 0.3], [0.81, 0.55], [0.7, 0.94]], [[0.87, 0.04], [0.78, 0.38], [0.67, 0.72]]],
  },
  axial: {
    zones: [[0, 0.25, 1, 0.75]],
    pot: [[[0.3, 0.28], [0.32, 0.5], [0.29, 0.7]], [[0.55, 0.32], [0.53, 0.52], [0.56, 0.74]], [[0.75, 0.36], [0.73, 0.62]]],
    act: [[[0.1, 0.36], [0.5, 0.5], [0.9, 0.64]], [[0.9, 0.36], [0.5, 0.5], [0.1, 0.64]], [[0.04, 0.5], [0.5, 0.53], [0.96, 0.5]],
      [[0.3, 0.2], [0.32, 0.5], [0.28, 0.82]], [[0.7, 0.18], [0.68, 0.5], [0.71, 0.84]]],
  },
  hogging: {
    zones: [[0, 0, 1, 0.2], [0, 0.8, 1, 1], [0, 0, 0.2, 1], [0.8, 0, 1, 1]],
    pot: [[[0.2, 0.1], [0.5, 0.11], [0.8, 0.1]], [[0.2, 0.9], [0.5, 0.89], [0.8, 0.9]]],
    act: [[[0.06, 0.1], [0.5, 0.11], [0.94, 0.1]], [[0.06, 0.9], [0.5, 0.89], [0.94, 0.9]], [[0.1, 0.08], [0.11, 0.5], [0.1, 0.92]],
      [[0.9, 0.08], [0.89, 0.5], [0.9, 0.92]], [[0.1, 0.1], [0.2, 0.2]], [[0.9, 0.9], [0.8, 0.8]]],
  },
  pressure: { zones: [], pot: [], act: [] },
  settleR: {
    zones: [[0.3, 0, 1, 1]],
    pot: [[[0.5, 0.36], [0.62, 0.5], [0.72, 0.63]]],
    act: [[[0.18, 0.03], [0.34, 0.22], [0.5, 0.42], [0.66, 0.62], [0.8, 0.8], [0.95, 0.97]], [[0.5, 0.03], [0.62, 0.2], [0.74, 0.38]]],
  },
  settleL: {
    zones: [[0, 0, 0.7, 1]],
    pot: [[[0.5, 0.36], [0.38, 0.5], [0.28, 0.63]]],
    act: [[[0.82, 0.03], [0.66, 0.22], [0.5, 0.42], [0.34, 0.62], [0.2, 0.8], [0.05, 0.97]], [[0.5, 0.03], [0.38, 0.2], [0.26, 0.38]]],
  },
  xcross: {
    zones: [[0, 0, 1, 1]],
    pot: [[[0.12, 0.12], [0.3, 0.32], [0.45, 0.47]]],
    act: [[[0.04, 0.04], [0.28, 0.3], [0.5, 0.5], [0.72, 0.7], [0.96, 0.96]], [[0.96, 0.04], [0.72, 0.3], [0.5, 0.5], [0.28, 0.7], [0.04, 0.96]]],
  },
  cantilever: {
    zones: [[0, 0.78, 1, 1]],
    pot: [[[0.15, 0.93], [0.3, 0.94], [0.42, 0.92]], [[0.58, 0.93], [0.72, 0.94], [0.85, 0.92]]],
    act: [[[0.02, 0.94], [0.25, 0.95], [0.5, 0.93], [0.75, 0.95], [0.98, 0.94]], [[0.35, 0.94], [0.4, 0.84]], [[0.7, 0.95], [0.66, 0.85]]],
  },
};

function rand(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

export class FailureSim {
  constructor(scene, model, kind, onPick) {
    this.scene = scene; this.model = model; this.onPick = onPick;
    this.group = new THREE.Group(); scene.add(this.group);
    this.markers = new THREE.Group(); this.markers.visible = false; scene.add(this.markers);
    this.arrowGeo = arrowGeometry();
    this.mats = {
      load: new THREE.MeshBasicMaterial({ color: 0xffb43d, depthTest: false, transparent: true }),
      pot: new THREE.MeshBasicMaterial({ color: 0xffa21f }),
      act: new THREE.MeshBasicMaterial({ color: 0x9e1111 }),
      zone: new THREE.MeshBasicMaterial({ color: 0xffa21f, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
      zoneLine: new THREE.LineDashedMaterial({ color: 0xffa21f, dashSize: 0.12, gapSize: 0.08 }),
      deform: new THREE.LineDashedMaterial({ color: 0xe0352f, dashSize: 0.14, gapSize: 0.08 }),
      hit: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),
    };
    for (const m of Object.values(this.mats)) m.toneMapped = false; // keep the teaching colours true
    this.available = FAILURES.map((f) => ({ f, targets: (f.targets[kind] || []).map((t) => ({ ...t, mesh: this.find(t) })) }))
      .filter((s) => s.targets.length && s.targets.every((t) => t.mesh));
    this.hits = []; this.active = null; this.stage = 0; this.moved = [];
    for (const s of this.available) this.addMarker(s);
  }

  find(t) {
    const has = (v, x) => (Array.isArray(v) ? v.includes(x) : v === x);
    return this.model.elements.find((e) => has(t.key, e.userData.key) && has(t.code, e.userData.code) && (t.floor == null || e.userData.floor === t.floor));
  }

  // a plane lying on the chosen face of the element, in world space
  facePlane(mesh, face) {
    const b = new THREE.Box3().setFromObject(mesh), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3()), off = 0.018;
    const g = new THREE.Group();
    if (face === '+z') { g.position.set(c.x, c.y, b.max.z + off); return { g, w: s.x, h: s.y, normal: new THREE.Vector3(0, 0, 1) }; }
    if (face === '-x') { g.position.set(b.min.x - off, c.y, c.z); g.rotation.y = -Math.PI / 2; return { g, w: s.z, h: s.y, normal: new THREE.Vector3(-1, 0, 0) }; }
    g.position.set(c.x, b.max.y + off, c.z); g.rotation.x = -Math.PI / 2; return { g, w: s.x, h: s.z, normal: new THREE.Vector3(0, 1, 0) };
  }

  addMarker(s) {
    const t = s.targets[0];
    const { g, normal } = this.facePlane(t.mesh, t.face);
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'failmark sev-' + s.f.severity;
    el.innerHTML = '<i>!</i><span></span>';
    el.addEventListener('click', (e) => { e.stopPropagation(); this.onPick(s.f.id); });
    const o = new CSS2DObject(el); o.position.copy(g.position).addScaledVector(normal, 0.35);
    o.userData = { id: s.f.id, normal, back: false };
    o.visible = this.markers.visible; this.markers.add(o); s.marker = o;
    this.refreshLabels();
  }

  // CSS2DRenderer checks each label's own visibility, not its parents', so toggle every marker
  showMarkers(on) { this.markers.visible = on; for (const m of this.markers.children) m.visible = on; }

  // which failure case an element belongs to, if any
  caseFor(obj) {
    const u = obj.userData;
    const s = this.available.find((x) => x.targets.some((t) => t.mesh === obj || (t.mesh.userData.key === u.key && t.mesh.userData.code === u.code && t.mesh.userData.floor === u.floor)));
    return s ? s.f.id : null;
  }

  // dim markers on faces turned away from the camera, and mark the open case
  faceMarkers(camPos) {
    const d = new THREE.Vector3();
    for (const s of this.available) {
      const o = s.marker; if (!o) continue;
      const back = d.copy(camPos).sub(o.position).dot(o.userData.normal) < 0;
      o.element.classList.toggle('back', back);
      o.element.classList.toggle('on', this.active === s);
    }
  }

  refreshLabels() {
    for (const s of this.available) if (s.marker) s.marker.element.querySelector('span').textContent = L(s.f.name);
  }

  crackMesh(pts, w, h, radius, mat, seed) {
    const r = rand(seed), v3 = pts.map(([u, v], i) => {
      const j = i === 0 || i === pts.length - 1 ? 0 : 0.025; // metres, the same on short and long faces
      return new THREE.Vector3((u - 0.5) * w + (r() - 0.5) * j, (v - 0.5) * h + (r() - 0.5) * j, 0.004);
    });
    // add a small zig-zag between the given points so it reads as a crack
    const dense = [];
    for (let i = 0; i < v3.length - 1; i++) {
      const a = v3[i], b = v3[i + 1], n = Math.max(2, Math.round(a.distanceTo(b) / 0.06));
      for (let k = 0; k < n; k++) {
        const p = a.clone().lerp(b, k / n), d = b.clone().sub(a).normalize();
        p.x += -d.y * (r() - 0.5) * 0.02; p.y += d.x * (r() - 0.5) * 0.02; dense.push(p);
      }
    }
    dense.push(v3[v3.length - 1]);
    const curve = new THREE.CatmullRomCurve3(dense, false, 'catmullrom', 0.2);
    return new THREE.Mesh(new THREE.TubeGeometry(curve, dense.length * 3, radius, 5, false), mat);
  }

  build(id) {
    this.clear();
    const s = this.available.find((x) => x.f.id === id); if (!s) return null;
    this.active = s;
    const layers = { heat: [], zone: [], pot: [], act: [], deform: [], load: [] };
    s.targets.forEach((t, ti) => {
      const { g, w, h } = this.facePlane(t.mesh, t.face);
      g.userData.target = t; this.group.add(g); t.plane = g;
      const heatMat = new THREE.MeshBasicMaterial({ map: heatTexture(PATTERN[t.pattern]), transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const heatMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), heatMat); g.add(heatMesh); layers.heat.push(heatMesh);
      const hit = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.2, h + 0.2), this.mats.hit); hit.userData.failId = id; g.add(hit); this.hits.push(hit);
      const C = CRACKS[t.pattern];
      for (const [u0, v0, u1, v1] of C.zones) {
        const zw = (u1 - u0) * w, zh = (v1 - v0) * h, cx = ((u0 + u1) / 2 - 0.5) * w, cy = ((v0 + v1) / 2 - 0.5) * h;
        const z = new THREE.Mesh(new THREE.PlaneGeometry(zw, zh), this.mats.zone); z.position.set(cx, cy, 0.002); g.add(z); layers.zone.push(z);
        const pts = [[-zw / 2, -zh / 2], [zw / 2, -zh / 2], [zw / 2, zh / 2], [-zw / 2, zh / 2], [-zw / 2, -zh / 2]].map(([x, y]) => new THREE.Vector3(cx + x, cy + y, 0.003));
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.mats.zoneLine); line.computeLineDistances(); g.add(line); layers.zone.push(line);
      }
      const scale = Math.min(w, h);
      C.pot.forEach((p, i) => { const m = this.crackMesh(p, w, h, Math.max(0.008, scale * 0.012), this.mats.pot, 11 + i + ti * 7); g.add(m); layers.pot.push(m); });
      C.act.forEach((p, i) => { const m = this.crackMesh(p, w, h, Math.max(0.014, scale * 0.024), this.mats.act, 37 + i + ti * 7); g.add(m); layers.act.push(m); });
      // exaggerated deformed shape for the failure step
      if (s.f.deform === 'sag' && ti === 0) {
        const pts = Array.from({ length: 25 }, (_, i) => { const u = i / 24; return new THREE.Vector3((u - 0.5) * w, -h / 2 - 0.06 - 0.22 * 4 * u * (1 - u), 0.01); });
        const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.mats.deform); l.computeLineDistances(); g.add(l); layers.deform.push(l);
      }
      if (s.f.deform === 'bulge' && ti === 0) {
        for (const side of [-1, 1]) {
          const pts = Array.from({ length: 25 }, (_, i) => { const v = i / 24; return new THREE.Vector3(side * (w / 2 + 0.03 + 0.14 * Math.sin(Math.PI * v)), (v - 0.5) * h, 0.01); });
          const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.mats.deform); l.computeLineDistances(); g.add(l); layers.deform.push(l);
        }
      }
    });
    this.buildLoads(s, layers);
    this.layers = layers;
    this.setStage(this.stage);
    return s;
  }

  buildLoads(s, layers) {
    const t = s.targets[0], b = new THREE.Box3().setFromObject(t.mesh), c = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3());
    const items = [], down = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    const toX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
    const add = (x, y, z, q, sc) => items.push({ p: new THREE.Vector3(x, y, z), q, s: sc });
    const L2 = s.f.load;
    if (L2 === 'udl') {
      const along = size.x >= size.z ? 'x' : 'z', len = Math.max(size.x, size.z);
      for (let i = 0; i < 7; i++) { const k = -len / 2 + (len * (i + 0.5)) / 7; add(along === 'x' ? c.x + k : c.x, b.max.y + 0.75, along === 'z' ? c.z + k : c.z + 0.05, down, 0.9); }
    } else if (L2 === 'axial') {
      add(c.x, b.max.y + 1.1, c.z + 0.3, down, 2.4);
    } else if (L2 === 'area') {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) add(b.min.x + size.x * (i + 0.5) / 3, b.max.y + 0.7, b.min.z + size.z * (j + 0.5) / 3, down, 1.0);
    } else if (L2 === 'settle') {
      add(c.x, b.min.y - 0.55, c.z + 0.4, down, 1.6);
    } else if (L2 === 'lateral') {
      for (const tt of s.targets) {
        const bb = new THREE.Box3().setFromObject(tt.mesh), cc = bb.getCenter(new THREE.Vector3());
        add(bb.min.x - 1.4, bb.max.y - 0.3, cc.z, toX, 1.6); add(bb.min.x - 1.4, cc.y, cc.z, toX, 1.1);
      }
    } else if (L2 === 'cantilever') {
      for (let i = 0; i < 4; i++) add(b.min.x + size.x * (i + 0.5) / 4, b.max.y + 0.65, b.max.z - 0.25, down, 0.9);
    }
    const im = new THREE.InstancedMesh(this.arrowGeo, this.mats.load, items.length);
    const m = new THREE.Matrix4();
    items.forEach((it, i) => { m.compose(it.p, it.q, new THREE.Vector3(it.s, it.s, it.s)); im.setMatrixAt(i, m); });
    im.frustumCulled = false; im.renderOrder = 10; this.group.add(im); layers.load.push(im);
  }

  // move or rotate the real element for the failure step, and put it back after
  applyDeform(on) {
    for (const r of this.moved) { r.obj.position.copy(r.pos); r.obj.quaternion.copy(r.q); }
    this.moved = [];
    if (!on || !this.active) return;
    for (const t of this.active.targets) {
      const objs = [t.mesh, t.plane];
      if (t.drop) for (const o of objs) { this.moved.push({ obj: o, pos: o.position.clone(), q: o.quaternion.clone() }); o.position.y -= 0.14; }
      if (t.tilt) {
        const b = new THREE.Box3().setFromObject(t.mesh), pivot = new THREE.Vector3((b.min.x + b.max.x) / 2, b.max.y, b.min.z);
        const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(8));
        // the railing stands on the balcony, so it tips with it
        const rail = this.model.elements.filter((e) => e.userData.key === 'railing' && e.parent === t.mesh.parent);
        for (const o of [...objs, ...rail]) {
          this.moved.push({ obj: o, pos: o.position.clone(), q: o.quaternion.clone() });
          o.position.sub(pivot).applyQuaternion(q).add(pivot); o.quaternion.premultiply(q);
        }
      }
    }
  }

  setStage(n) {
    this.stage = n;
    const L2 = this.layers; if (!L2) return;
    const vis = (arr, on) => arr.forEach((o) => { o.visible = on; });
    vis(L2.load, true);
    vis(L2.heat, n >= 1);
    L2.heat.forEach((o) => { o.material.opacity = n === 1 ? 1 : n === 2 ? 0.55 : 0.3; });
    vis(L2.zone, n === 2);
    vis(L2.pot, n === 2);
    vis(L2.act, n === 3);
    vis(L2.deform, n === 3);
    this.applyDeform(n === 3);
  }

  focusBox() {
    const b = new THREE.Box3();
    if (this.active) for (const t of this.active.targets) b.expandByObject(t.mesh);
    return b;
  }

  clear() {
    this.applyDeform(false);
    this.group.traverse((o) => { if (o.geometry && o.geometry !== this.arrowGeo) o.geometry.dispose(); if (o.material?.map) { o.material.map.dispose(); o.material.dispose(); } });
    this.group.clear(); this.hits = []; this.active = null; this.layers = null;
  }

  dispose() {
    this.clear();
    for (const m of this.markers.children) m.element.remove();
    this.scene.remove(this.group); this.scene.remove(this.markers);
  }
}

// ---------- force diagrams (2D, for the information window) ----------
const W = { load: T('Load', 'الحمل'), comp: T('Compression (squeezed)', 'ضغط (انضغاط)'), ten: T('Tension (stretched)', 'شد (تمدد)'), sag: T('Bent shape (exaggerated)', 'شكل الانحناء (مكبّر)'),
  react: T('Support pushes up', 'الركيزة تدفع لأعلى'), diag: T('Diagonal tension', 'شد مائل'), crack45: T('Crack at about 45°', 'شق مائل قرب الركيزة'),
  floors: T('Weight of floors above', 'وزن الطوابق العلوية'), bars: T('Bars push outward', 'القضبان تندفع للخارج'), topT: T('Tension at the top over the beam', 'شد في الأعلى فوق الجائز'),
  botT: T('Tension at the bottom mid-span', 'شد في الأسفل عند المنتصف'), sinks: T('Weaker soil: footing sinks', 'تربة أضعف: القاعدة تهبط'), wallCr: T('Diagonal wall cracks', 'شقوق مائلة في الجدار'),
  eq: T('Earthquake force', 'قوة الزلزال'), shake: T('Shaking reverses', 'الاهتزاز ينعكس'), steelTop: T('Main steel must be at the top', 'التسليح الرئيسي يجب أن يكون في الأعلى') };
const arrow = (x1, y1, x2, y2, cls) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" marker-end="url(#ah-${cls})"/>`;
const sup = (x, y) => `<path d="M${x} ${y} l-10 15 h20 z" class="dg-sup"/>`;
const udl = (x0, x1, y0, y1) => { let s = `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" class="dg-load"/>`; for (let x = x0; x <= x1 + 0.1; x += (x1 - x0) / 8) s += arrow(x, y0, x, y1, 'dg-load'); return s; };
// Arabic labels get an RTL base direction; start and end swap so they sit in the same place
const FLIP = { start: 'end', end: 'start', middle: 'middle' };
const txt = (x, y, s, cls = '', anchor = 'middle') => {
  const ar = lang() === 'ar';
  return `<text x="${x}" y="${y}" text-anchor="${ar ? FLIP[anchor] : anchor}"${ar ? ' direction="rtl"' : ''} class="dg-t ${cls}">${s}</text>`;
};

export function diagramSVG(kind) {
  const l = (k) => L(W[k]);
  const defs = `<defs>${['dg-load', 'dg-ten', 'dg-comp', 'dg-crack'].map((c) => `<marker id="ah-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="${c}-fill"/></marker>`).join('')}</defs>`;
  let body = '';
  if (kind === 'flexure') body = `${udl(46, 274, 30, 64)}${txt(160, 22, l('load'))}<rect x="30" y="70" width="260" height="34" class="dg-member"/>${sup(42, 104)}${sup(278, 104)}
    ${arrow(118, 78, 146, 78, 'dg-comp')}${arrow(202, 78, 174, 78, 'dg-comp')}${arrow(146, 97, 118, 97, 'dg-ten')}${arrow(174, 97, 202, 97, 'dg-ten')}
    <path d="M150 104 l3 -6 l-3 -5 M160 104 l-2 -8 l3 -6 M170 104 l3 -6 l-2 -5" class="dg-crack"/>
    <path d="M42 112 Q160 152 278 112" class="dg-dash"/>${txt(160, 165, l('sag'))}${txt(300, 82, l('comp'), 'dg-comp-t', 'end')}${txt(20, 136, l('ten'), 'dg-ten-t', 'start')}`;
  else if (kind === 'shear') body = `${udl(46, 274, 30, 64)}${txt(160, 22, l('load'))}<rect x="30" y="70" width="260" height="34" class="dg-member"/>${sup(42, 104)}${sup(278, 104)}
    ${arrow(42, 150, 42, 124, 'dg-load')}${txt(56, 150, l('react'), '', 'start')}<path d="M50 102 L58 94 L56 89 L66 80 L64 76 L72 72" class="dg-crack"/>
    ${arrow(64, 86, 52, 74, 'dg-ten')}${arrow(64, 86, 76, 98, 'dg-ten')}${txt(84, 92, l('diag'), 'dg-ten-t', 'start')}${txt(160, 128, l('crack45'))}
    <path d="M270 102 L262 94 L264 89 L254 80 L256 76 L248 72" class="dg-crack" opacity=".45"/>`;
  else if (kind === 'axial') body = `<rect x="100" y="22" width="120" height="12" class="dg-member"/><rect x="142" y="34" width="36" height="104" class="dg-member"/><rect x="112" y="138" width="96" height="14" class="dg-member"/>
    ${arrow(160, 2, 160, 19, 'dg-load')}${txt(172, 12, l('floors'), '', 'start')}${[46, 60, 74, 88, 102, 116, 130].map((y) => `<line x1="144" y1="${y}" x2="176" y2="${y}" class="dg-thin"/>`).join('')}
    <path d="M142 40 Q118 86 142 132 M178 40 Q202 86 178 132" class="dg-dash"/>${arrow(142, 86, 120, 86, 'dg-ten')}${arrow(178, 86, 200, 86, 'dg-ten')}
    <path d="M154 66 l-2 10 l3 8 l-2 10 M166 70 l2 9 l-3 8 l2 9" class="dg-crack"/>${txt(212, 90, l('bars'), 'dg-ten-t', 'start')}${txt(108, 90, l('comp'), 'dg-comp-t', 'end')}`;
  else if (kind === 'hogging') body = `${udl(26, 294, 34, 70)}${txt(160, 26, l('load'))}<rect x="20" y="76" width="280" height="14" class="dg-member"/>
    ${[30, 160, 290].map((x) => `<rect x="${x - 9}" y="90" width="18" height="30" class="dg-member"/>`).join('')}
    <path d="M152 76 l2 6 l-2 5 M160 76 l-2 6 l2 5 M168 76 l2 6 l-2 5" class="dg-crack"/>${arrow(156, 72, 130, 72, 'dg-ten')}${arrow(164, 72, 190, 72, 'dg-ten')}
    <path d="M30 96 Q95 116 160 96 Q225 116 290 96" class="dg-dash"/>${txt(160, 138, l('topT'), 'dg-ten-t')}${txt(160, 158, l('botT'))}`;
  else if (kind === 'settlement') body = `<line x1="10" y1="140" x2="310" y2="140" class="dg-thin"/>
    <path d="M50 40 L160 56 L270 40 L270 130 L160 144 L50 130 Z" class="dg-wall"/><path d="M50 40 L160 56 L270 40" class="dg-member-line"/>
    <line x1="50" y1="40" x2="50" y2="130" class="dg-member-line"/><line x1="160" y1="56" x2="160" y2="144" class="dg-member-line"/><line x1="270" y1="40" x2="270" y2="130" class="dg-member-line"/>
    <rect x="30" y="130" width="40" height="10" class="dg-member"/><rect x="140" y="144" width="40" height="10" class="dg-member"/><rect x="250" y="130" width="40" height="10" class="dg-member"/>
    <path d="M70 126 L86 112 L98 104 L114 92 L128 80 L150 64" class="dg-crack"/><path d="M250 126 L234 112 L222 104 L206 92 L192 80 L170 64" class="dg-crack"/>
    ${arrow(160, 156, 160, 170, 'dg-load')}${txt(186, 168, l('sinks'), '', 'start')}${txt(160, 24, l('wallCr'), 'dg-ten-t')}`;
  else if (kind === 'lateral') body = `<line x1="10" y1="140" x2="310" y2="140" class="dg-thin"/><rect x="70" y="40" width="180" height="100" class="dg-wall"/>
    <line x1="70" y1="40" x2="70" y2="140" class="dg-member-line"/><line x1="250" y1="40" x2="250" y2="140" class="dg-member-line"/><line x1="64" y1="40" x2="256" y2="40" class="dg-member-line"/>
    ${arrow(10, 46, 62, 46, 'dg-load')}${txt(12, 34, l('eq'), '', 'start')}<line x1="74" y1="44" x2="246" y2="136" class="dg-strut"/>
    <path d="M78 48 L110 66 L130 80 L160 92 L190 108 L214 120 L242 132 M242 48 L214 64 L190 78 L160 92 L130 106 L110 118 L78 132" class="dg-crack"/>
    ${txt(160, 30, l('comp') + ' / ' + l('ten'))}${txt(160, 160, '↔ ' + l('shake'))}`;
  else if (kind === 'cantilever') body = `<rect x="20" y="40" width="40" height="112" class="dg-member"/><rect x="20" y="70" width="240" height="14" class="dg-member"/>
    ${udl(150, 250, 36, 64)}${txt(200, 28, l('load'))}<path d="M66 70 l-2 5 l3 4" class="dg-crack"/>${arrow(70, 64, 100, 64, 'dg-ten')}${arrow(62, 64, 32, 64, 'dg-ten')}
    <path d="M60 84 Q170 92 260 116" class="dg-dash"/><line x1="64" y1="73" x2="250" y2="73" class="dg-steel"/>${txt(160, 110, l('steelTop'), 'dg-ten-t')}${txt(70, 52, l('ten'), 'dg-ten-t', 'start')}${txt(170, 140, l('sag'))}`;
  return `<svg class="diagram" viewBox="0 0 320 172" role="img" aria-label="${L(T('Force diagram', 'مخطط القوى'))}">${defs}${body}</svg>`;
}
