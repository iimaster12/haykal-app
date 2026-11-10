// "Test yourself": multiple choice questions in two levels, grouped by topic.
// Every answer comes with a short explanation, and most can be shown on the
// 3D model. Rules of thumb follow ACI 318 and common textbook practice.
import { L, lang } from './i18n.js';
import { icon } from './icons.js';

const T = (en, ar) => ({ en, ar });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const TOPICS = {
  loads: T('Loads and load path', 'الأحمال ومسار الحمل'),
  elements: T('Structural elements', 'العناصر الإنشائية'),
  steel: T('Reinforcement', 'التسليح'),
  failure: T('Cracks and failure', 'الشقوق والانهيار'),
};
export const LEVELS = {
  beginner: { name: T('Beginner', 'مبتدئ'), desc: T('What each part does and where the load goes.', 'وظيفة كل جزء وأين يذهب الحمل.') },
  intermediate: { name: T('Intermediate', 'متوسط'), desc: T('Where the steel goes, how cracks form, simple sizing.', 'مكان التسليح، وكيف تتكون الشقوق، وحسابات بسيطة.') },
};

// a = index of the correct option; show = element to point at in 3D; fail = failure case to open
const Q = [
  // ---------- beginner ----------
  { level: 'beginner', topic: 'loads', a: 1, show: { key: 'column' },
    q: T('In a concrete frame building, which order does the weight of a floor follow down to the ground?', 'في مبنى ذي هيكل خرساني، ما الترتيب الذي يسلكه وزن الطابق حتى يصل إلى الأرض؟'),
    o: [T('Column → beam → slab → soil → footing', 'العمود ← الجائز ← البلاطة ← التربة ← القاعدة'), T('Slab → beam → column → footing → soil', 'البلاطة ← الجائز ← العمود ← القاعدة ← التربة'),
      T('Beam → slab → footing → column → soil', 'الجائز ← البلاطة ← القاعدة ← العمود ← التربة'), T('Wall → roof → slab → soil', 'الجدار ← السقف ← البلاطة ← التربة')],
    why: T('The slab collects the load and passes it to the beams around it. Beams pass it to the columns, columns to the footings, and footings spread it into the soil.',
      'البلاطة تجمع الحمل وتنقله إلى الجوائز حولها، والجوائز تنقله إلى الأعمدة، والأعمدة إلى القواعد، والقواعد توزعه على التربة.') },
  { level: 'beginner', topic: 'loads', a: 2,
    q: T('Which of these is a live load?', 'أي مما يلي يُعد حملًا حيًا؟'),
    o: [T('The weight of the concrete slab', 'وزن البلاطة الخرسانية'), T('The weight of the brick walls', 'وزن الجدران الطوبية'), T('People and furniture in a room', 'الأشخاص والأثاث في الغرفة'), T('The weight of the floor tiles', 'وزن بلاط الأرضية')],
    why: T('Live loads can move or change, like people, furniture and stored goods. The weight of the building itself (concrete, walls, tiles) is the dead load.',
      'الأحمال الحية هي التي تتحرك أو تتغير، مثل الأشخاص والأثاث والبضائع المخزنة. أما وزن المبنى نفسه (الخرسانة والجدران والبلاط) فهو الحمل الميت.') },
  { level: 'beginner', topic: 'elements', a: 0, show: { key: 'footing' },
    q: T('What is the main job of a footing?', 'ما الوظيفة الرئيسية للقاعدة؟'),
    o: [T('To spread the column load over a larger area of soil', 'توزيع حمل العمود على مساحة أكبر من التربة'), T('To keep rain away from the walls', 'إبعاد مياه الأمطار عن الجدران'),
      T('To make the building look taller', 'جعل المبنى يبدو أعلى'), T('To hold the water pipes', 'حمل أنابيب المياه')],
    why: T('Soil is much weaker than concrete. The footing makes the contact area bigger, so the pressure on the soil (load ÷ area) stays below what the soil can safely carry.',
      'التربة أضعف بكثير من الخرسانة. القاعدة تكبّر مساحة التلامس، فيبقى الضغط على التربة (الحمل ÷ المساحة) أقل مما تتحمله التربة بأمان.') },
  { level: 'beginner', topic: 'elements', a: 3, show: { key: 'column' },
    q: T('In a reinforced concrete frame, what carries the floor loads down to the footings?', 'في الهيكل الخرساني المسلح، ما الذي ينقل أحمال الطوابق إلى القواعد؟'),
    o: [T('The brick or block walls', 'الجدران الطوبية أو البلوك'), T('The plaster', 'اللياسة'), T('The windows and doors', 'النوافذ والأبواب'), T('The beams and columns', 'الجوائز والأعمدة')],
    why: T('In a frame building the walls only fill the spaces between the columns. They carry their own weight to the beam below, but the floors rest on the beams and columns.',
      'في المبنى الهيكلي تملأ الجدران الفراغات بين الأعمدة فقط، وتنقل وزنها إلى الجائز أسفلها، أما الطوابق فترتكز على الجوائز والأعمدة.') },
  { level: 'beginner', topic: 'steel', a: 1,
    q: T('Concrete is very strong when it is…', 'الخرسانة قوية جدًا عندما تكون…'),
    o: [T('Stretched (in tension)', 'مشدودة (في حالة شد)'), T('Squeezed (in compression)', 'مضغوطة (في حالة ضغط)'), T('Bent and twisted at the same time', 'منحنية وملتوية في الوقت نفسه'), T('Wet', 'مبللة')],
    why: T('Concrete resists squeezing well, but its tensile strength is only about one tenth of that. Steel bars are added to carry the tension.',
      'الخرسانة تقاوم الضغط جيدًا، لكن مقاومتها للشد نحو عُشر ذلك فقط، لذلك يُضاف الفولاذ ليحمل الشد.') },
  { level: 'beginner', topic: 'steel', a: 0, show: { key: 'beam' }, fail: 'flexure',
    q: T('A beam rests on two columns. Where does its main steel go?', 'جائز يرتكز على عمودين. أين يوضع تسليحه الرئيسي؟'),
    o: [T('At the bottom', 'في الأسفل'), T('At the top', 'في الأعلى'), T('In the middle of the depth', 'في منتصف العمق'), T('Only on the sides', 'على الجانبين فقط')],
    why: T('Under load the beam bends down, so its bottom is stretched. The main bars sit at the bottom to carry that tension.',
      'تحت الحمل ينحني الجائز إلى الأسفل فيُشد أسفله، لذلك توضع القضبان الرئيسية في الأسفل لتحمل هذا الشد.') },
  { level: 'beginner', topic: 'steel', a: 2, show: { key: 'beam' },
    q: T('What do the stirrups (the closed loops around the bars) mainly do in a beam?', 'ما الوظيفة الرئيسية للأساور (الحلقات المغلقة حول القضبان) في الجائز؟'),
    o: [T('Carry the bending at mid-span', 'تحمل الانحناء في منتصف المجاز'), T('Make the concrete set faster', 'تسرّع تصلب الخرسانة'), T('Resist shear and hold the main bars in place', 'تقاوم القص وتثبت القضبان الرئيسية في مكانها'), T('Hang the ceiling', 'تعليق السقف المعلق')],
    why: T('Stirrups cross the slanted cracks that shear tries to open near the supports. They also keep the main bars in position while the concrete is poured.',
      'الأساور تعبر الشقوق المائلة التي يحاول القص فتحها قرب الركائز، كما تثبت القضبان الرئيسية في مكانها أثناء الصب.') },
  { level: 'beginner', topic: 'steel', a: 1,
    q: T('Why is there a layer of concrete (the cover) outside the steel bars?', 'لماذا توجد طبقة من الخرسانة (الغطاء) خارج قضبان الفولاذ؟'),
    o: [T('To make the element look smoother', 'لجعل العنصر أنعم مظهرًا'), T('To protect the steel from rust and fire and to bond it to the concrete', 'لحماية الفولاذ من الصدأ والحريق ولربطه بالخرسانة'),
      T('To save steel', 'لتوفير الفولاذ'), T('It has no purpose', 'ليس لها فائدة')],
    why: T('Concrete keeps water and air away from the steel, slows heat in a fire, and grips the bars so steel and concrete work together.',
      'الخرسانة تبعد الماء والهواء عن الفولاذ، وتبطئ وصول الحرارة إليه عند الحريق، وتمسك القضبان فيعمل الفولاذ والخرسانة معًا.') },
  { level: 'beginner', topic: 'failure', a: 0, fail: 'flexure',
    q: T('Thin vertical cracks appear at the bottom, in the middle of a beam. What causes them?', 'ظهرت شقوق رأسية رفيعة في أسفل منتصف الجائز. ما سببها؟'),
    o: [T('Bending: the bottom of the beam is stretched', 'الانحناء: أسفل الجائز مشدود'), T('The beam is too heavy for the columns', 'الجائز أثقل من أن تحمله الأعمدة'),
      T('Rain water', 'مياه الأمطار'), T('The columns are too strong', 'الأعمدة قوية أكثر من اللازم')],
    why: T('Bending stretches the bottom face, and concrete cracks when stretched. Fine cracks here are normal: the bottom steel holds the beam together.',
      'الانحناء يشد الوجه السفلي، والخرسانة تتشقق عند الشد. الشقوق الرفيعة هنا طبيعية، والتسليح السفلي يمسك الجائز.') },
  { level: 'beginner', topic: 'failure', a: 3, fail: 'shear',
    q: T('Which kind of failure usually gives the least warning?', 'أي نوع من الانهيار يعطي عادةً أقل إنذار؟'),
    o: [T('A beam bending slowly with plenty of steel', 'جائز ينحني ببطء وفيه تسليح كافٍ'), T('Hairline cracks in plaster', 'شقوق شعرية في اللياسة'),
      T('Cracks in floor tiles', 'شقوق في بلاط الأرضية'), T('A shear failure near a beam support', 'انهيار بالقص قرب ركيزة الجائز')],
    why: T('Shear failure is brittle: a diagonal crack can split the beam suddenly. Bending failure in a well designed beam is ductile, with large sagging and wide cracks first.',
      'الانهيار بالقص هش، فقد يشق شق مائل الجائز فجأة. أما الانهيار بالانحناء في جائز مصمم جيدًا فهو مطيل، يسبقه ترخيم كبير وشقوق واسعة.') },

  // ---------- intermediate ----------
  { level: 'intermediate', topic: 'loads', a: 2,
    q: T('A column carries 900 kN. The soil can safely take 150 kPa. What footing area is needed (ignoring the footing\'s own weight)?', 'عمود يحمل 900 kN، والتربة تتحمل بأمان 150 kPa. ما مساحة القاعدة المطلوبة (بإهمال وزن القاعدة نفسها)؟'),
    o: [T('1.5 m²', '1.5 m²'), T('0.17 m²', '0.17 m²'), T('6 m²', '6 m²'), T('135 m²', '135 m²')],
    why: T('Area = load ÷ allowable pressure = 900 kN ÷ 150 kN/m² = 6 m², for example a square pad 2.45 m wide. Try it in the Foundation lab.',
      'المساحة = الحمل ÷ الضغط المسموح = 900 kN ÷ 150 kN/m² = 6 m²، مثل قاعدة مربعة عرضها 2.45 m. جرّب ذلك في مختبر الأساسات.') },
  { level: 'intermediate', topic: 'loads', a: 0, show: { key: 'shearwall', alt: 'column' }, fail: 'earthquake',
    q: T('In this building, which element takes most of the sideways force from wind or an earthquake?', 'في هذا المبنى، أي عنصر يتحمل معظم القوة الأفقية الناتجة عن الرياح أو الزلزال؟'),
    o: [T('The shear wall', 'جدار القص'), T('The floor tiles', 'بلاط الأرضية'), T('The water tank', 'خزان المياه'), T('The brick partitions', 'الجدران الطوبية الفاصلة')],
    why: T('A shear wall is a long, stiff concrete wall that acts like a deep column standing on edge. It resists sideways push much better than slender columns.',
      'جدار القص جدار خرساني طويل وصلب يعمل كعمود عميق قائم على حافته، ويقاوم الدفع الأفقي أفضل بكثير من الأعمدة النحيلة.') },
  { level: 'intermediate', topic: 'elements', a: 1, show: { key: 'tiebeam' }, fail: 'settlement',
    q: T('Why are tie beams cast between isolated footings?', 'لماذا تُصب جوائز الربط بين القواعد المنفصلة؟'),
    o: [T('To hold the water pipes', 'لحمل أنابيب المياه'), T('To link the footings so they move together and to carry the ground floor walls', 'لربط القواعد حتى تتحرك معًا ولحمل جدران الطابق الأرضي'),
      T('To replace the columns', 'لتحل محل الأعمدة'), T('To make excavation easier', 'لتسهيل الحفر')],
    why: T('Tie beams connect the footings, which reduces uneven settlement and sideways movement, and they give the ground floor walls something to stand on.',
      'جوائز الربط تصل القواعد ببعضها، فتقلل الهبوط غير المتساوي والحركة الأفقية، وتحمل جدران الطابق الأرضي.') },
  { level: 'intermediate', topic: 'steel', a: 1, show: { key: 'balcony' }, fail: 'balcony',
    q: T('Where does the main steel go in a cantilever balcony?', 'أين يوضع التسليح الرئيسي في الشرفة الناتئة؟'),
    o: [T('At the bottom, near the free edge', 'في الأسفل قرب الطرف الحر'), T('At the top, anchored well back into the slab', 'في الأعلى، مثبتًا جيدًا داخل البلاطة'),
      T('In the middle of the thickness', 'في منتصف السماكة'), T('A cantilever needs no steel', 'العنصر الناتئ لا يحتاج إلى تسليح')],
    why: T('A cantilever bends like a diving board, so its top is stretched at the support. Main bars at the top, carried back into the floor slab, hold it up.',
      'العنصر الناتئ ينحني مثل لوح القفز، فيُشد أعلاه عند الركيزة. القضبان الرئيسية في الأعلى والممتدة إلى داخل بلاطة الطابق هي التي تحمله.') },
  { level: 'intermediate', topic: 'steel', a: 3, show: { key: 'slab' }, fail: 'slab',
    q: T('A slab runs continuously over a beam. Over that beam, which face of the slab is stretched?', 'بلاطة مستمرة فوق جائز. فوق هذا الجائز، أي وجه من البلاطة يكون مشدودًا؟'),
    o: [T('The bottom face', 'الوجه السفلي'), T('Neither face', 'لا يوجد وجه مشدود'), T('Both faces equally', 'الوجهان بالتساوي'), T('The top face', 'الوجه العلوي')],
    why: T('Over a support the slab bends the other way (hogging), so the top is in tension. That is why slabs need top steel over the beams.',
      'فوق الركيزة تنحني البلاطة في الاتجاه المعاكس (عزم سالب)، فيكون أعلاها مشدودًا، ولهذا تحتاج البلاطات إلى تسليح علوي فوق الجوائز.') },
  { level: 'intermediate', topic: 'steel', a: 0, show: { key: 'beam' }, fail: 'shear',
    q: T('Why are stirrups placed closer together near the ends of a beam?', 'لماذا تكون الأساور أكثر تقاربًا قرب طرفي الجائز؟'),
    o: [T('Because the shear force is largest near the supports', 'لأن قوة القص أكبر ما تكون قرب الركائز'), T('Because bending is largest there', 'لأن الانحناء أكبر ما يكون هناك'),
      T('To use up leftover steel', 'لاستهلاك الفولاذ المتبقي'), T('To make the beam lighter', 'لجعل الجائز أخف')],
    why: T('In a beam carrying a spread load, shear is greatest at the supports and zero near mid-span. More stirrups go where shear is highest.',
      'في الجائز المحمّل بحمل موزع تكون قوة القص أكبر ما يمكن عند الركائز وتقارب الصفر عند المنتصف، لذلك تُكثف الأساور حيث يكون القص أكبر.') },
  { level: 'intermediate', topic: 'steel', a: 2, show: { key: 'beam' },
    q: T('Per ACI 318, about how much concrete cover do the bars of an indoor cast-in-place beam need?', 'وفق ACI 318، كم يبلغ تقريبًا غطاء الخرسانة لقضبان جائز داخلي مصبوب في الموقع؟'),
    o: [T('About 10 mm', 'نحو 10 mm'), T('About 100 mm', 'نحو 100 mm'), T('About 40 mm (1.5 in)', 'نحو 40 mm (1.5 in)'), T('No cover is needed indoors', 'لا يلزم غطاء في الداخل')],
    why: T('ACI 318 asks for 1.5 in (38 mm) on beams and columns not exposed to weather or soil. Concrete cast against soil needs 3 in (75 mm).',
      'يشترط ACI 318 غطاءً قدره 1.5 in (38 mm) للجوائز والأعمدة غير المعرضة للطقس أو التربة، أما الخرسانة المصبوبة على التربة مباشرة فتحتاج 3 in (75 mm).') },
  { level: 'intermediate', topic: 'failure', a: 1, fail: 'shear',
    q: T('Where do shear cracks usually appear in a beam, and how do they look?', 'أين تظهر شقوق القص عادةً في الجائز، وما شكلها؟'),
    o: [T('At mid-span, vertical', 'في منتصف المجاز، رأسية'), T('Near the supports, slanted at about 45°', 'قرب الركائز، مائلة بنحو 45°'),
      T('On the top face, along the beam', 'على الوجه العلوي، بطول الجائز'), T('Anywhere, as round holes', 'في أي مكان، على شكل ثقوب دائرية')],
    why: T('Shear is largest near the supports. It stretches the concrete on a slant, so the cracks open at roughly 45°, rising toward mid-span.',
      'القص أكبر ما يكون قرب الركائز، وهو يشد الخرسانة بشكل مائل، فتنفتح الشقوق بزاوية 45° تقريبًا وترتفع باتجاه منتصف المجاز.') },
  { level: 'intermediate', topic: 'failure', a: 2, show: { key: 'column' }, fail: 'column',
    q: T('Column ties (stirrups) are spaced too far apart. What can happen under heavy load?', 'أساور العمود متباعدة أكثر من اللازم. ماذا قد يحدث تحت حمل كبير؟'),
    o: [T('Nothing, ties are only for looks', 'لا شيء، الأساور للشكل فقط'), T('The column becomes stronger', 'يصبح العمود أقوى'),
      T('The main bars buckle outward and the concrete core crushes', 'تنبعج القضبان الرئيسية إلى الخارج وتتهشم الخرسانة الداخلية'), T('The column gets longer', 'يزداد طول العمود')],
    why: T('Ties hold the long bars in line and confine the concrete inside. Without them the bars bow out, the cover spalls and the column can fail suddenly.',
      'الأساور تمسك القضبان الطويلة في مكانها وتحصر الخرسانة داخلها. بدونها تنبعج القضبان وتتساقط طبقة الغطاء وقد ينهار العمود فجأة.') },
  { level: 'intermediate', topic: 'failure', a: 0, fail: 'settlement',
    q: T('A wall shows diagonal cracks rising toward one column. What does that usually point to?', 'يظهر في جدار شقوق مائلة ترتفع باتجاه أحد الأعمدة. إلى ماذا يشير ذلك عادةً؟'),
    o: [T('The footing under that column has settled more than the others', 'القاعدة أسفل ذلك العمود هبطت أكثر من غيرها'), T('The paint was bad', 'الدهان كان رديئًا'),
      T('The wall is too thick', 'الجدار سميك أكثر من اللازم'), T('The roof is too light', 'السقف خفيف أكثر من اللازم')],
    why: T('When one support sinks, the wall panel is pulled out of square. It stretches along one diagonal and cracks across it, with the crack rising toward the sinking side.',
      'عندما تهبط ركيزة واحدة يتشوه الجدار عن شكله القائم، فيُشد على أحد قطريه ويتشقق عموديًا عليه، ويرتفع الشق باتجاه الجهة الهابطة.') },
  { level: 'intermediate', topic: 'failure', a: 3, fail: 'earthquake',
    q: T('X-shaped cracks appear in the ground floor walls. What is the most likely cause?', 'ظهرت شقوق على شكل X في جدران الطابق الأرضي. ما السبب الأرجح؟'),
    o: [T('Too much live load on the roof', 'حمل حي زائد على السطح'), T('Hot weather', 'الطقس الحار'), T('Water leaking from a pipe', 'تسرب المياه من أنبوب'), T('Sideways shaking that pushed the building one way, then back', 'اهتزاز أفقي دفع المبنى في اتجاه ثم في الاتجاه المعاكس')],
    why: T('Each sideways push stretches the wall along one diagonal. When the push reverses, the other diagonal cracks too, which makes the X.',
      'كل دفعة أفقية تشد الجدار على أحد قطريه، وعندما ينعكس الدفع يتشقق القطر الآخر أيضًا، فيتكون شكل X.') },
];

const UI = {
  title: T('Test yourself', 'اختبر نفسك'),
  intro: T('Short questions on what you have seen in the model. Pick a level. You get the answer and a short explanation right after each question.',
    'أسئلة قصيرة عمّا رأيته في النموذج. اختر المستوى، وستظهر الإجابة مع شرح قصير بعد كل سؤال مباشرة.'),
  questions: T('{n} questions', '{n} سؤالًا'),
  of: T('Question {i} of {n}', 'السؤال {i} من {n}'),
  right: T('Correct', 'إجابة صحيحة'),
  wrong: T('Not quite', 'إجابة غير صحيحة'),
  answer: T('The answer is: {a}', 'الإجابة الصحيحة: {a}'),
  next: T('Next question', 'السؤال التالي'),
  finish: T('See my score', 'عرض النتيجة'),
  show3d: T('Show it on the model', 'اعرضه على النموذج'),
  showFail: T('See this failure', 'شاهد هذا الانهيار'),
  score: T('Your score', 'نتيجتك'),
  byTopic: T('By topic', 'حسب الموضوع'),
  missed: T('Review the ones you missed', 'راجع الأسئلة التي أخطأت فيها'),
  again: T('Try again', 'أعد المحاولة'),
  other: T('Try the {lvl} level', 'جرّب المستوى {lvl}'),
  close: T('Close', 'إغلاق'),
  back: T('Change level', 'تغيير المستوى'),
  great: T('Excellent. You know how this structure works.', 'ممتاز، أنت تفهم كيف يعمل هذا الهيكل.'),
  good: T('Good work. Review the questions below to fill the gaps.', 'عمل جيد. راجع الأسئلة أدناه لسد الثغرات.'),
  low: T('Keep going. Use the Guide and the Failures tool, then try again.', 'استمر. استخدم الدليل وأداة الانهيارات، ثم حاول مرة أخرى.'),
};
const LETTERS = { en: ['A', 'B', 'C', 'D'], ar: ['أ', 'ب', 'ج', 'د'] };
const fmt = (o, p = {}) => Object.entries(p).reduce((s, [k, v]) => s.replaceAll('{' + k + '}', v), L(o));

export class Quiz {
  constructor(el, { onShow, onFail, onClose }) {
    this.el = el; this.onShow = onShow; this.onFail = onFail; this.onClose = onClose;
    this.state = null;
    el.addEventListener('click', (e) => this.click(e));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); this.close(); }
    });
  }

  get isOpen() { return !this.el.hidden; }

  // resume keeps the current question or result screen; otherwise a finished run starts over
  open(resume = false) {
    if (!this.state || (this.state.done && !resume)) this.state = { level: null };
    this.el.hidden = false; this.render(); this.focus();
  }
  close() { this.el.hidden = true; this.onClose?.(); }

  begin(level) {
    const list = Q.filter((q) => q.level === level);
    // keep the topic order so questions build on each other
    const order = Object.keys(TOPICS);
    list.sort((a, b) => order.indexOf(a.topic) - order.indexOf(b.topic));
    this.state = { level, list, i: 0, picked: null, answers: [], done: false };
    this.render(); this.focus();
  }

  focus() { requestAnimationFrame(() => this.el.querySelector('[data-autofocus]')?.focus()); }

  click(e) {
    if (e.target === this.el) { this.close(); return; }
    const b = e.target.closest('button'); if (!b) return;
    const s = this.state, a = b.dataset.qa;
    if (a === 'close') this.close();
    else if (a === 'level') this.begin(b.dataset.level);
    else if (a === 'menu') { this.state = { level: null }; this.render(); this.focus(); }
    else if (a === 'pick' && s.picked == null) {
      s.picked = +b.dataset.i; s.answers[s.i] = s.picked;
      this.render(); this.focus();
    } else if (a === 'next') {
      s.i++; s.picked = null;
      if (s.i >= s.list.length) s.done = true;
      this.render(); this.focus();
    } else if (a === 'show') { const q = s.list[+b.dataset.q]; this.el.hidden = true; this.onShow?.(q.show); }
    else if (a === 'fail') { const q = s.list[+b.dataset.q]; this.el.hidden = true; this.onFail?.(q.fail); }
  }

  render() {
    const s = this.state;
    const head = (sub) => `<header class="qz-head"><div><h2 id="qzTitle">${esc(L(UI.title))}</h2>${sub ? `<p class="qz-sub">${sub}</p>` : ''}</div>
      <button class="icon-btn" data-qa="close" aria-label="${esc(L(UI.close))}">${icon('close')}</button></header>`;
    if (!s.level) {
      this.el.innerHTML = `<div class="qz-card" role="dialog" aria-modal="true" aria-labelledby="qzTitle">${head('')}
        <div class="qz-body"><p class="qz-intro">${esc(L(UI.intro))}</p>
        <div class="qz-levels">${Object.entries(LEVELS).map(([k, v], n) => `<button class="qz-level" data-qa="level" data-level="${k}" ${n === 0 ? 'data-autofocus' : ''}>
          <b>${esc(L(v.name))}</b><span>${esc(L(v.desc))}</span><small>${esc(fmt(UI.questions, { n: Q.filter((q) => q.level === k).length }))}</small></button>`).join('')}</div>
        <ul class="qz-topics">${Object.values(TOPICS).map((tp) => `<li>${esc(L(tp))}</li>`).join('')}</ul></div></div>`;
      return;
    }
    if (s.done) { this.renderEnd(); return; }
    const q = s.list[s.i], n = s.list.length, answered = s.picked != null, ok = s.picked === q.a;
    const letters = LETTERS[lang()] || LETTERS.en;
    const pct = ((s.i + (answered ? 1 : 0)) / n) * 100;
    const opts = q.o.map((o, i) => {
      let cls = '';
      if (answered) cls = i === q.a ? 'is-right' : i === s.picked ? 'is-wrong' : 'is-dim';
      const mark = answered && i === q.a ? icon('check') : answered && i === s.picked ? icon('close') : `<i>${letters[i]}</i>`;
      return `<li><button class="qz-opt ${cls}" data-qa="pick" data-i="${i}" ${answered ? 'aria-disabled="true"' : ''} ${!answered && i === 0 ? 'data-autofocus' : ''}>
        <span class="qz-letter">${mark}</span><span>${esc(L(o))}</span></button></li>`;
    }).join('');
    const fb = answered ? `<div class="qz-fb ${ok ? 'ok' : 'bad'}" role="status">
        <p class="qz-verdict">${icon(ok ? 'check' : 'alert')}<b>${esc(L(ok ? UI.right : UI.wrong))}</b>${ok ? '' : `<span>${esc(fmt(UI.answer, { a: L(q.o[q.a]) }))}</span>`}</p>
        <p class="qz-why">${esc(L(q.why))}</p>
        <div class="qz-acts">
          ${q.show ? `<button class="btn" data-qa="show" data-q="${s.i}">${icon('focus')}<span>${esc(L(UI.show3d))}</span></button>` : ''}
          ${q.fail ? `<button class="btn" data-qa="fail" data-q="${s.i}">${icon('crack')}<span>${esc(L(UI.showFail))}</span></button>` : ''}
          <button class="btn primary" data-qa="next" data-autofocus>${esc(L(s.i + 1 >= n ? UI.finish : UI.next))}</button>
        </div></div>` : '';
    this.el.innerHTML = `<div class="qz-card" role="dialog" aria-modal="true" aria-labelledby="qzTitle">${head(esc(L(LEVELS[s.level].name)) + ' · ' + esc(L(TOPICS[q.topic])))}
      <div class="qz-progress"><div class="qz-count"><span>${esc(fmt(UI.of, { i: s.i + 1, n }))}</span>
        <span class="qz-dots" aria-hidden="true">${s.list.map((_, i) => `<i class="${i < s.i ? (s.answers[i] === s.list[i].a ? 'ok' : 'bad') : i === s.i ? (answered ? (ok ? 'ok' : 'bad') : 'cur') : ''}"></i>`).join('')}</span></div>
        <div class="qz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${s.i + (answered ? 1 : 0)}"><span style="width:${pct}%"></span></div></div>
      <div class="qz-body"><h3 class="qz-q">${esc(L(q.q))}</h3><ol class="qz-opts">${opts}</ol>${fb}</div></div>`;
  }

  renderEnd() {
    const s = this.state, n = s.list.length, right = s.list.filter((q, i) => s.answers[i] === q.a).length, pct = Math.round((right / n) * 100);
    const msg = pct >= 80 ? UI.great : pct >= 50 ? UI.good : UI.low;
    const topics = Object.keys(TOPICS).map((k) => {
      const qs = s.list.map((q, i) => [q, i]).filter(([q]) => q.topic === k); if (!qs.length) return '';
      const r = qs.filter(([q, i]) => s.answers[i] === q.a).length;
      return `<li><span>${esc(L(TOPICS[k]))}</span><span class="qz-tbar"><i style="width:${(r / qs.length) * 100}%"></i></span><b>${r}/${qs.length}</b></li>`;
    }).join('');
    const missed = s.list.map((q, i) => [q, i]).filter(([q, i]) => s.answers[i] !== q.a).map(([q, i]) => `<li><p class="qz-mq">${esc(L(q.q))}</p>
      <p class="qz-ma">${icon('check')}<span>${esc(L(q.o[q.a]))}</span></p><p class="qz-why">${esc(L(q.why))}</p>
      ${q.fail ? `<button class="btn small" data-qa="fail" data-q="${i}">${icon('crack')}<span>${esc(L(UI.showFail))}</span></button>` : q.show ? `<button class="btn small" data-qa="show" data-q="${i}">${icon('focus')}<span>${esc(L(UI.show3d))}</span></button>` : ''}</li>`).join('');
    const otherLvl = s.level === 'beginner' ? 'intermediate' : 'beginner';
    const R = 52, C = 2 * Math.PI * R;
    this.el.innerHTML = `<div class="qz-card" role="dialog" aria-modal="true" aria-labelledby="qzTitle">
      <header class="qz-head"><div><h2 id="qzTitle" tabindex="-1" data-autofocus>${esc(L(UI.score))}</h2><p class="qz-sub">${esc(L(LEVELS[s.level].name))}</p></div>
        <button class="icon-btn" data-qa="close" aria-label="${esc(L(UI.close))}">${icon('close')}</button></header>
      <div class="qz-body">
        <div class="qz-result"><svg viewBox="0 0 128 128" class="qz-ring" aria-hidden="true"><circle cx="64" cy="64" r="${R}" class="trk"/>
          <circle cx="64" cy="64" r="${R}" class="val ${pct >= 80 ? 'ok' : pct >= 50 ? 'mid' : 'bad'}" stroke-dasharray="${(C * right) / n} ${C}" transform="rotate(-90 64 64)"/></svg>
          <div class="qz-big"><b>${right}<small>/${n}</small></b><span>${pct}%</span></div><p>${esc(L(msg))}</p></div>
        <section><h3>${esc(L(UI.byTopic))}</h3><ul class="qz-tlist">${topics}</ul></section>
        ${missed ? `<section><h3>${esc(L(UI.missed))}</h3><ol class="qz-missed">${missed}</ol></section>` : ''}
        <div class="qz-acts end"><button class="btn primary" data-qa="level" data-level="${s.level}">${esc(L(UI.again))}</button>
          <button class="btn" data-qa="level" data-level="${otherLvl}">${esc(fmt(UI.other, { lvl: L(LEVELS[otherLvl].name) }))}</button>
          <button class="btn" data-qa="close">${esc(L(UI.close))}</button></div>
      </div></div>`;
  }
}
