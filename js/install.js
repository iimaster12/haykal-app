// Install guide: picks the visitor's device, shows numbered steps with a
// drawing of the exact screen and the control to tap, and offers the browser's
// own install prompt where one exists (Chrome, Edge, Android).
const $ = (s) => document.querySelector(s);
const APP_URL = new URL('./', location.href).href;

const T = {
  en: {
    brand: 'Haykal', lang: 'العربية', title: 'Get Haykal on your device',
    lead: 'Haykal installs straight from your browser. No app store, about 3 MB, and it keeps working offline once installed. Pick your device to see the steps.',
    you: 'Your device', install: 'Install Haykal', installed: 'Haykal is installed on this device. Open it from your home screen or apps.',
    copy: 'Copy the app link', copied: 'Link copied. Open Safari and paste it in the address bar.',
    noPrompt: 'If the Install button stays grey, your browser hides its prompt here. The steps below always work.',
    iosStatus: 'Apple only allows installing from the Share menu, so follow these steps.',
    offT: 'No internet at the venue?', offB: 'Download one file, copy it to a laptop or USB stick and double-click it. It runs on Windows, Mac, Linux and ChromeOS with no internet.',
    offBtn: 'Download offline version (1.6 MB)',
    storeT: 'App stores', storeB: 'Haykal does not need a store. The same app can be packaged for Google Play or the Microsoft Store with PWABuilder. The Apple App Store needs a Mac and a paid Apple Developer account.',
    open: 'Open Haykal in the browser', foot: '© 2026 iimaster12. All rights reserved.',
    tabs: { ios: 'iPhone & iPad', android: 'Android', windows: 'Windows', mac: 'Mac', linux: 'Linux & ChromeOS' },
    ui: { share: 'Share', addHome: 'Add to Home Screen', copyL: 'Copy', bookmark: 'Add Bookmark', cancel: 'Cancel', add: 'Add',
      newTab: 'New tab', installApp: 'Install app', installQ: 'Install app?', installBtn: 'Install', file: 'File', newWin: 'New Window', addDock: 'Add to Dock…' },
    steps: {
      ios: [
        ['Open the app link in Safari', 'On iOS 16.4 or later, Chrome and Edge also have Add to Home Screen in their Share menu.', 'url'],
        ['Tap the Share button', 'The square with an arrow pointing up. It is at the bottom of the screen on iPhone and at the top on iPad.', 'iosShare'],
        ['Tap Add to Home Screen', 'Scroll down the list if you do not see it straight away.', 'iosSheet'],
        ['Tap Add', 'The name Haykal is already filled in.', 'iosAdd'],
        ['Open Haykal from your home screen', 'It opens full screen like any app and works offline after the first visit.', 'home'],
      ],
      android: [
        ['Open the app link in Chrome', 'Samsung Internet and Edge work the same way.', 'url'],
        ['Tap Install app', 'Use the amber Install app button at the top of Haykal, or Chrome\'s ⋮ menu → Install app (it may say Add to Home screen).', 'androidMenu'],
        ['Tap Install', 'Android adds Haykal to your apps like any other app.', 'androidDialog'],
        ['Open Haykal from your home screen or app drawer', 'It runs full screen and works offline.', 'home'],
      ],
      windows: [
        ['Open the app link in Microsoft Edge or Google Chrome', 'Both are built for installing web apps on Windows.', 'deskUrl'],
        ['Click the install icon in the address bar', 'Or click Install app at the top of Haykal. In Edge you can also use ⋯ → Apps → Install this site as an app.', 'deskInstall'],
        ['Click Install', 'Haykal opens in its own window straight away.', 'deskDialog'],
        ['Find Haykal in the Start menu', 'Right-click it to pin it to the taskbar or Start. It works offline.', 'taskbar'],
      ],
      mac: [
        ['Open the app link in Chrome, Edge or Safari', 'Safari needs macOS Sonoma (14) or later.', 'deskUrl'],
        ['Chrome or Edge: click the install icon in the address bar', 'Or click Install app at the top of Haykal, then Install.', 'deskInstall'],
        ['Safari: choose File → Add to Dock', 'Then click Add.', 'macFile'],
        ['Open Haykal from the Dock or Launchpad', 'It opens in its own window and works offline.', 'dock'],
      ],
      linux: [
        ['Open the app link in Chrome, Chromium or Edge', 'On a Chromebook, use the built-in Chrome.', 'deskUrl'],
        ['Click the install icon in the address bar', 'Or click Install app at the top of Haykal.', 'deskInstall'],
        ['Click Install', 'Haykal opens in its own window.', 'deskDialog'],
        ['Find Haykal in your app launcher', 'It works offline after the first visit.', 'taskbar'],
      ],
    },
  },
  ar: {
    brand: 'هيكل', lang: 'English', title: 'ثبّت «هيكل» على جهازك',
    lead: 'يُثبَّت «هيكل» مباشرة من المتصفح، دون متجر تطبيقات، بحجم 3 ميغابايت تقريبًا، ويعمل دون إنترنت بعد التثبيت. اختر جهازك لترى الخطوات.',
    you: 'جهازك', install: 'ثبّت «هيكل»', installed: '«هيكل» مثبّت على هذا الجهاز. افتحه من الشاشة الرئيسية أو قائمة التطبيقات.',
    copy: 'انسخ رابط التطبيق', copied: 'تم نسخ الرابط. افتح Safari والصقه في شريط العنوان.',
    noPrompt: 'إذا بقي زر التثبيت رماديًا فمتصفحك يخفي نافذة التثبيت هنا، والخطوات أدناه تعمل دائمًا.',
    iosStatus: 'تسمح Apple بالتثبيت من قائمة المشاركة فقط، لذلك اتبع هذه الخطوات.',
    offT: 'لا يوجد إنترنت في مكان المسابقة؟', offB: 'حمّل ملفًا واحدًا وانسخه إلى الحاسوب أو ذاكرة USB ثم افتحه بنقرتين. يعمل على ويندوز وماك ولينكس وكروم أو إس دون إنترنت.',
    offBtn: 'تحميل النسخة دون إنترنت (1.6 ميغابايت)',
    storeT: 'متاجر التطبيقات', storeB: 'لا يحتاج «هيكل» إلى متجر. يمكن تجهيز التطبيق نفسه لمتجر Google Play أو متجر Microsoft عبر PWABuilder. أما متجر Apple فيحتاج إلى جهاز ماك وحساب مطوّر مدفوع.',
    open: 'افتح «هيكل» في المتصفح', foot: '© 2026 iimaster12. جميع الحقوق محفوظة.',
    tabs: { ios: 'آيفون وآيباد', android: 'أندرويد', windows: 'ويندوز', mac: 'ماك', linux: 'لينكس وكروم أو إس' },
    ui: { share: 'مشاركة', addHome: 'إضافة إلى الشاشة الرئيسية', copyL: 'نسخ', bookmark: 'إضافة علامة', cancel: 'إلغاء', add: 'إضافة',
      newTab: 'علامة تبويب جديدة', installApp: 'تثبيت التطبيق', installQ: 'تثبيت التطبيق؟', installBtn: 'تثبيت', file: 'ملف', newWin: 'نافذة جديدة', addDock: 'إضافة إلى Dock…' },
    steps: {
      ios: [
        ['افتح رابط التطبيق في Safari', 'في iOS 16.4 أو أحدث يوجد خيار «إضافة إلى الشاشة الرئيسية» أيضًا في قائمة المشاركة في Chrome وEdge.', 'url'],
        ['اضغط زر المشاركة', 'المربع الذي يخرج منه سهم إلى الأعلى، أسفل الشاشة في آيفون وأعلاها في آيباد.', 'iosShare'],
        ['اضغط «إضافة إلى الشاشة الرئيسية»', 'مرّر القائمة إلى الأسفل إذا لم تجده مباشرة.', 'iosSheet'],
        ['اضغط «إضافة»', 'اسم التطبيق مكتوب مسبقًا.', 'iosAdd'],
        ['افتح «هيكل» من الشاشة الرئيسية', 'يفتح بملء الشاشة مثل أي تطبيق، ويعمل دون إنترنت بعد أول فتح.', 'home'],
      ],
      android: [
        ['افتح رابط التطبيق في Chrome', 'متصفح Samsung Internet وEdge يعملان بالطريقة نفسها.', 'url'],
        ['اضغط «تثبيت التطبيق»', 'استخدم الزر الكهرماني «تثبيت التطبيق» أعلى «هيكل»، أو قائمة ⋮ في Chrome ثم «تثبيت التطبيق» (وقد تظهر باسم «إضافة إلى الشاشة الرئيسية»).', 'androidMenu'],
        ['اضغط «تثبيت»', 'يضيف أندرويد «هيكل» إلى تطبيقاتك مثل أي تطبيق آخر.', 'androidDialog'],
        ['افتح «هيكل» من الشاشة الرئيسية أو درج التطبيقات', 'يعمل بملء الشاشة ودون إنترنت.', 'home'],
      ],
      windows: [
        ['افتح رابط التطبيق في Microsoft Edge أو Google Chrome', 'كلاهما يدعم تثبيت تطبيقات الويب على ويندوز.', 'deskUrl'],
        ['اضغط أيقونة التثبيت في شريط العنوان', 'أو اضغط «تثبيت التطبيق» أعلى «هيكل». وفي Edge يمكنك أيضًا استخدام ⋯ ← التطبيقات ← تثبيت هذا الموقع كتطبيق.', 'deskInstall'],
        ['اضغط «تثبيت»', 'يفتح «هيكل» فورًا في نافذة خاصة به.', 'deskDialog'],
        ['ابحث عن «هيكل» في قائمة ابدأ', 'انقر عليه بالزر الأيمن لتثبيته في شريط المهام. يعمل دون إنترنت.', 'taskbar'],
      ],
      mac: [
        ['افتح رابط التطبيق في Chrome أو Edge أو Safari', 'يحتاج Safari إلى macOS Sonoma (14) أو أحدث.', 'deskUrl'],
        ['في Chrome أو Edge: اضغط أيقونة التثبيت في شريط العنوان', 'أو اضغط «تثبيت التطبيق» أعلى «هيكل» ثم «تثبيت».', 'deskInstall'],
        ['في Safari: اختر ملف ← إضافة إلى Dock', 'ثم اضغط «إضافة».', 'macFile'],
        ['افتح «هيكل» من Dock أو Launchpad', 'يفتح في نافذة خاصة به ويعمل دون إنترنت.', 'dock'],
      ],
      linux: [
        ['افتح رابط التطبيق في Chrome أو Chromium أو Edge', 'في أجهزة Chromebook استخدم Chrome المدمج.', 'deskUrl'],
        ['اضغط أيقونة التثبيت في شريط العنوان', 'أو اضغط «تثبيت التطبيق» أعلى «هيكل».', 'deskInstall'],
        ['اضغط «تثبيت»', 'يفتح «هيكل» في نافذة خاصة به.', 'deskDialog'],
        ['ابحث عن «هيكل» في قائمة التطبيقات', 'يعمل دون إنترنت بعد أول فتح.', 'taskbar'],
      ],
    },
  },
};

const TAB_ICONS = {
  ios: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/></svg>',
  android: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 10a6 6 0 0 1 12 0v8H6z"/><path d="M8 5 6.5 3M16 5l1.5-2"/><circle cx="9.5" cy="10" r=".6" fill="currentColor"/><circle cx="14.5" cy="10" r=".6" fill="currentColor"/></svg>',
  windows: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.5 10.5 4.4v7.1H3zM11.5 4.3 21 3v8.5h-9.5zM3 12.5h7.5v7.1L3 18.5zM11.5 12.5H21V21l-9.5-1.3z"/></svg>',
  mac: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  linux: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="m7 9 2.5 2L7 13M12 13h4"/></svg>',
};
const DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>';
const COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>';
const OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';

// ---------- drawings ----------
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const icon = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 40})"><rect width="40" height="40" rx="9" fill="#192023"/><rect x="16" y="6" width="8" height="18" rx="1" fill="#e8ece9"/><rect x="7" y="24" width="26" height="7" rx="1" fill="#e8ece9"/><path d="M20 9v11M16.5 16.5 20 20.5l3.5-4" stroke="#f2a516" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
const lines = (x, y, w, n) => Array.from({ length: n }, (_, i) => `<rect class="dim" x="${x}" y="${y + i * 9}" width="${w - (i % 3) * 14}" height="4" rx="2"/>`).join('');
const phone = (inner) => `<svg class="pic" viewBox="0 0 220 150" aria-hidden="true"><rect class="frame" x="62" y="3" width="96" height="144" rx="16"/>${inner}</svg>`;
const desk = (inner, addr = true) => `<svg class="pic" viewBox="0 0 220 150" aria-hidden="true"><rect class="frame" x="6" y="8" width="208" height="134" rx="10"/><rect class="bar" x="7" y="9" width="206" height="18" rx="9"/>
  <circle class="dim" cx="18" cy="18" r="3"/><circle class="dim" cx="28" cy="18" r="3"/><circle class="dim" cx="38" cy="18" r="3"/>
  ${addr ? '<rect class="bar" x="16" y="32" width="188" height="16" rx="8"/><text x="28" y="44" font-size="9">iimaster12.github.io/haykal-app</text>' : ''}${inner}</svg>`;
const ring = (cx, cy, r) => `<circle class="hit" cx="${cx}" cy="${cy}" r="${r}"/>`;
const box = (x, y, w, h, rx = 6) => `<rect class="hit" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;

const PICS = {
  url: () => phone(`<rect class="bar" x="70" y="14" width="80" height="16" rx="8"/><text x="110" y="25.5" text-anchor="middle" font-size="7.5">github.io/haykal-app</text>${box(68, 12, 84, 20, 10)}
    ${icon(96, 44, 28)}${lines(76, 84, 68, 5)}`),
  iosShare: (u) => phone(`${lines(74, 18, 72, 9)}<rect class="bar" x="63" y="118" width="94" height="22"/>
    <path class="ln" d="M74 129h6M86 125l-3 4 3 4M134 125l3 4-3 4"/>
    <path class="ln" d="M105 128v7h10v-7M110 122v9M107 125l3-3 3 3"/>${ring(110, 128, 11)}
    <text x="110" y="113" text-anchor="middle" font-size="8">${esc(u.share)}</text>`),
  iosSheet: (u) => phone(`<rect class="dim" x="63" y="4" width="94" height="142" rx="15"/><rect class="bar" x="66" y="52" width="88" height="92" rx="10"/>
    <text x="74" y="72" font-size="8">${esc(u.copyL)}</text><text x="74" y="94" font-size="8">${esc(u.bookmark)}</text>
    <text x="74" y="117" font-size="7.4" font-weight="600">${esc(u.addHome)}</text><path class="ln" d="M141 108h8v8h-8zM145 110v4M143 112h4"/>
    ${box(68, 103, 84, 20)}`),
  iosAdd: (u) => phone(`<text x="72" y="22" font-size="8">${esc(u.cancel)}</text><text x="148" y="22" text-anchor="end" font-size="8.5" font-weight="700">${esc(u.add)}</text>
    ${box(126, 11, 28, 16)}${icon(74, 36, 26)}<text x="106" y="52" font-size="9" font-weight="600">Haykal</text><rect class="dim" x="74" y="72" width="72" height="4" rx="2"/>${lines(74, 86, 72, 5)}`),
  home: () => phone(`${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => (r === 2 && c === 1 ? '' : `<rect class="dim" x="${76 + c * 24}" y="${22 + r * 28}" width="18" height="18" rx="5"/>`)).join('')).join('')}
    ${icon(100, 78, 18)}${box(96, 74, 26, 34, 7)}<text x="109" y="104" text-anchor="middle" font-size="6.5">Haykal</text>`),
  androidMenu: (u) => phone(`<rect class="bar" x="68" y="12" width="68" height="16" rx="8"/><text x="72" y="23.5" font-size="7">github.io/haykal</text>
    <circle class="ink" cx="147" cy="16" r="1.3"/><circle class="ink" cx="147" cy="20" r="1.3"/><circle class="ink" cx="147" cy="24" r="1.3"/>${ring(147, 20, 7)}
    <rect class="bar" x="92" y="32" width="62" height="54" rx="6" stroke="var(--line)"/><text x="98" y="48" font-size="7.5">${esc(u.newTab)}</text>
    <text x="98" y="72" font-size="7.5" font-weight="700">${esc(u.installApp)}</text>${box(94, 61, 58, 17)}${lines(72, 96, 76, 5)}`),
  androidDialog: (u) => phone(`<rect class="dim" x="63" y="4" width="94" height="142" rx="15"/><rect class="bar" x="68" y="42" width="84" height="70" rx="10"/>
    ${icon(74, 50, 20)}<text x="98" y="58" font-size="7.5" font-weight="700">${esc(u.installQ)}</text><text x="98" y="68" font-size="7">Haykal</text>
    <text x="80" y="101" font-size="7.5">${esc(u.cancel)}</text><rect class="hitfill" x="112" y="90" width="34" height="16" rx="8"/><text x="129" y="101" text-anchor="middle" font-size="7.5" class="on">${esc(u.installBtn)}</text>${box(109, 87, 40, 22, 11)}`),
  deskUrl: () => desk(`${box(14, 30, 192, 20, 10)}${icon(26, 62, 26)}<text x="60" y="80" font-size="11" font-weight="600">Haykal Structure Lab</text>${lines(26, 100, 170, 4)}`),
  deskInstall: () => desk(`<path class="ln" d="M184 36h12v8h-12zM190 44v3M186 47h8M190 38v4M188 40l2 2 2-2"/>${ring(190, 41, 11)}
    <rect class="hitfill" x="150" y="58" width="54" height="16" rx="8"/><text x="177" y="69" text-anchor="middle" font-size="7.5" class="on">Install app</text>
    ${icon(18, 56, 20)}${lines(18, 86, 180, 5)}`),
  deskDialog: (u) => desk(`${lines(18, 60, 110, 6)}<rect class="bar" x="110" y="52" width="96" height="72" rx="8" stroke="var(--line)"/>
    <text x="118" y="68" font-size="8.5" font-weight="700">${esc(u.installQ)}</text>${icon(118, 76, 18)}<text x="141" y="88" font-size="8">Haykal</text>
    <rect class="hitfill" x="160" y="102" width="40" height="15" rx="7"/><text x="180" y="112.5" text-anchor="middle" font-size="7.5" class="on">${esc(u.installBtn)}</text>${box(157, 99, 46, 21, 9)}`),
  macFile: (u) => desk(`<text x="50" y="21" font-size="8" font-weight="700">Safari</text><text x="84" y="21" font-size="8" font-weight="700">${esc(u.file)}</text>
    <rect class="bar" x="80" y="28" width="92" height="58" rx="6" stroke="var(--line)"/><text x="88" y="44" font-size="8">${esc(u.newWin)}</text>
    <text x="88" y="70" font-size="8" font-weight="700">${esc(u.addDock)}</text>${box(82, 59, 88, 17)}${lines(18, 98, 180, 4)}`, false),
  taskbar: () => desk(`${lines(18, 56, 180, 5)}<rect class="bar" x="7" y="118" width="206" height="23" rx="0"/>
    ${[0, 1, 2, 4].map((i) => `<rect class="dim" x="${70 + i * 22}" y="122" width="15" height="15" rx="3"/>`).join('')}${icon(114, 122, 15)}${ring(121.5, 129.5, 12)}`, false),
  dock: () => desk(`${lines(18, 40, 180, 6)}<rect class="bar" x="52" y="116" width="116" height="22" rx="8" stroke="var(--line)"/>
    ${[0, 1, 3, 4].map((i) => `<rect class="dim" x="${60 + i * 21}" y="120" width="15" height="15" rx="4"/>`).join('')}${icon(102, 120, 15)}${ring(109.5, 127.5, 12)}`, false),
};

// ---------- state ----------
let lang = 'en';
try { lang = localStorage.getItem('haykal.lang') || ((navigator.language || '').startsWith('ar') ? 'ar' : 'en'); } catch { /* storage blocked */ }
try { const th = localStorage.getItem('haykal.theme'); if (th === 'dark' || th === 'light') document.documentElement.dataset.theme = th; } catch { /* ignore */ }
const ua = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const detected = isIOS ? 'ios' : /Android/.test(ua) ? 'android' : /Windows/.test(ua) ? 'windows' : /Mac/.test(ua) ? 'mac' : 'linux';
const fromHash = location.hash.slice(1);
let device = ['ios', 'android', 'windows', 'mac', 'linux'].includes(fromHash) ? fromHash : detected;
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let prompt = null, installed = standalone;

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('./sw.js').catch(() => {});
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); prompt = e; render(); });
addEventListener('appinstalled', () => { prompt = null; installed = true; render(); });

function render() {
  const t = T[lang];
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = lang === 'ar' ? 'ثبّت هيكل' : 'Get Haykal';
  $('[data-t="brand"]').textContent = t.brand;
  $('#lang').textContent = t.lang;
  $('#title').textContent = t.title; $('#lead').textContent = t.lead;
  $('#tabs').innerHTML = Object.keys(t.tabs).map((k) => `<button class="tab" role="tab" id="tab-${k}" aria-selected="${k === device}" data-k="${k}">${TAB_ICONS[k]}${esc(t.tabs[k])}${k === detected ? `<span class="you">${esc(t.you)}</span>` : ''}</button>`).join('');

  let cta = '', status = '', ok = false;
  if (installed && device === detected) { status = t.installed; ok = true; }
  else if (device === 'ios') {
    cta = `<button class="btn primary" id="copyBtn" type="button">${COPY}${esc(t.copy)}</button>`;
    status = t.iosStatus;
  } else {
    const can = !!prompt && device === detected;
    cta = `<button class="btn primary" id="installBtn" type="button" ${can ? '' : 'disabled'}>${DL}${esc(t.install)}</button>`;
    status = can ? '' : t.noPrompt;
  }
  $('#cta').innerHTML = cta + `<a class="btn" href="./index.html">${OPEN}${esc(t.open)}</a>`;
  const st = $('#status'); st.textContent = status; st.className = 'status' + (ok ? ' ok' : '');
  $('#steps').innerHTML = t.steps[device].map(([b, s, pic]) => `<li class="step"><div class="txt"><div><b>${esc(b)}</b><span>${esc(s)}</span></div></div>${PICS[pic](t.ui)}</li>`).join('');
  $('#offT').textContent = t.offT; $('#offB').textContent = t.offB; $('#offBtn').innerHTML = DL + esc(t.offBtn);
  $('#storeT').textContent = t.storeT; $('#storeB').textContent = t.storeB; $('#openBtn').innerHTML = OPEN + esc(t.open);
  $('#foot').textContent = t.foot;
}

document.addEventListener('click', async (e) => {
  const tab = e.target.closest('[data-k]');
  if (tab) { device = tab.dataset.k; history.replaceState(null, '', '#' + device); render(); $('#tab-' + device)?.focus(); return; }
  if (e.target.closest('#lang')) { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('haykal.lang', lang); } catch { /* ignore */ } render(); return; }
  if (e.target.closest('#installBtn') && prompt) { prompt.prompt(); try { await prompt.userChoice; } catch { /* dismissed */ } prompt = null; render(); return; }
  if (e.target.closest('#copyBtn')) {
    try { await navigator.clipboard.writeText(APP_URL); } catch { /* clipboard blocked: the link is shown in the steps */ }
    const st = $('#status'); st.textContent = T[lang].copied; st.className = 'status ok';
  }
});
addEventListener('hashchange', () => { const h = location.hash.slice(1); if (T.en.tabs[h]) { device = h; render(); } });
render();
