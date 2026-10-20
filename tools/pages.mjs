#!/usr/bin/env node
// Builds the app pages, the user-manual pages, sitemap.xml and robots.txt for anonacondacodelab.com.
// The site itself has no build step: run this after changing a page's content or a manual, then commit the output.
//   node tools/pages.mjs <path to still-point/docs/MANUAL.md> <path to lead-one-ecg/docs/MANUAL.md>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { md } from './md.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://anonacondacodelab.com';
const [spManual, loManual] = process.argv.slice(2);
if (!spManual || !loManual) { console.error('usage: node tools/pages.mjs <still-point MANUAL.md> <lead-one MANUAL.md>'); process.exit(1); }
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const out = (p, s) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), s); };

const CSS = `@font-face{font-family:"Instrument Sans";font-style:normal;font-display:swap;font-weight:400 700;font-stretch:75% 100%;
  src:url(/fonts/InstrumentSans-latin-variable.woff2) format("woff2-variations")}
:root{--paper:#ECEFE7;--ink:#22362B;--line:#6E7F3A;--muted:#5E6B61;--rule:#CBD2C4;--head:#8FA048;--card:#F6F8F3;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--paper:#141A16;--ink:#E3E8DE;--line:#A9B865;--muted:#94A096;--rule:#2C362F;--head:#B9C97A;--card:#1A221D}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:400 17px/1.6 "Instrument Sans",system-ui,sans-serif}
a{color:inherit}
a:focus-visible,summary:focus-visible{outline:2px solid var(--line);outline-offset:3px;border-radius:4px}
.wrap{max-width:760px;margin:0 auto;padding-left:max(20px,env(safe-area-inset-left,0px));padding-right:max(20px,env(safe-area-inset-right,0px))}
.crumbs{display:flex;align-items:center;gap:10px;padding-top:28px;font-size:15px;color:var(--muted)}
.crumbs a{display:flex;align-items:center;gap:10px;font-weight:600;text-decoration:none}
.crumbs img{width:30px;height:30px}
header.hero{padding:40px 0 8px}
.hero .icon{width:64px;height:64px;display:block}
h1{font-size:clamp(44px,10vw,80px);line-height:.95;font-stretch:75%;font-weight:650;letter-spacing:-.01em;margin:18px 0 0;text-wrap:balance}
.lede{font-size:clamp(19px,2.6vw,22px);line-height:1.45;max-width:32em;margin:18px 0 0}
.needs{font-size:15px;color:var(--muted);max-width:40em;margin:10px 0 0}
.links{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;margin-top:20px}
.open{display:inline-block;background:var(--ink);color:var(--paper);text-decoration:none;font-weight:600;padding:11px 20px;border-radius:999px}
.open:hover{background:var(--line);color:#fff}
.links a:not(.open){font-weight:500;text-underline-offset:3px}
.soon{font-size:15px;margin-top:12px}
.soon span{display:inline-block;font-size:11.5px;font-weight:650;letter-spacing:.06em;text-transform:uppercase;background:var(--line);color:var(--paper);padding:2px 9px;border-radius:999px;margin-right:9px;vertical-align:1px}
.shots{display:flex;gap:14px;overflow-x:auto;padding:28px 2px 18px;margin:20px 0 0;scroll-snap-type:x mandatory}
.shots figure{margin:0;flex:none;width:210px;scroll-snap-align:start}
.shots img{width:100%;height:auto;display:block;border-radius:18px;border:1px solid var(--rule);background:var(--card)}
.shots.wide figure{width:280px}
.shots figcaption{font-size:13.5px;color:var(--muted);margin-top:8px;line-height:1.35}
h2{font-size:30px;font-stretch:85%;font-weight:600;line-height:1.1;margin:44px 0 6px;text-wrap:balance}
h3{font-size:18.5px;font-weight:600;margin:0}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px 28px;margin-top:18px}
.features p{margin:4px 0 0;font-size:16px}
.needlist{margin:10px 0 0;padding-left:20px}
.needlist li{margin:4px 0}
details{border-top:1px solid var(--rule);padding:14px 0}
details:last-of-type{border-bottom:1px solid var(--rule)}
summary{cursor:pointer;font-weight:600;font-size:17.5px}
details p{margin:8px 0 0;max-width:40em}
.note{font-size:15px;color:var(--muted);margin-top:26px;max-width:40em}
.manual{max-width:42em}
.manual h2{font-size:26px;margin-top:36px}
.manual h3{margin-top:22px;font-size:18px}
.manual ul,.manual ol{padding-left:22px}
.manual li{margin:4px 0}
.manual code{font-size:14px;background:var(--card);border:1px solid var(--rule);border-radius:5px;padding:0 4px;overflow-wrap:anywhere}
.manual .callout{border:2px solid var(--head);border-radius:14px;padding:4px 18px;margin:18px 0;background:var(--card)}
.manual hr{border:0;border-top:1px solid var(--rule);margin:28px 0}
footer{border-top:1px solid var(--rule);margin-top:48px;padding:26px 0 48px;font-size:15px;color:var(--muted)}
footer nav{display:flex;flex-wrap:wrap;gap:8px 22px;margin-bottom:14px}
footer nav a{color:var(--ink);font-weight:500;text-underline-offset:3px}
footer p{margin:6px 0;max-width:40em}`;

function head({ title, desc, path, image, jsonld }) {
  const url = SITE + path;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Anonaconda Code Lab">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#22362B">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : ''}<style>
${CSS}
</style>
</head>
<body>
<div class="wrap">
  <div class="crumbs"><a href="/"><img src="/logo.svg" alt="">Anonaconda Code Lab</a></div>`;
}
const FOOT = `
  <footer>
    <nav aria-label="Studio links">
      <a href="/">All apps</a>
      <a href="https://ko-fi.com/anonacondacodelab">Support on Ko-fi</a>
      <a href="https://github.com/Anonaconda-CodeLab">GitHub</a>
      <a href="https://mastodon.social/@anonacondacodelab" rel="me">Mastodon</a>
    </nav>
    <p>No cookies, no analytics, no tracking, on this page or in the apps.</p>
    <p>© 2026 Anonaconda Code Lab. Apps are free software under the GNU GPL v3. Polar and H10 are trademarks of Polar Electro Oy; these apps are independent and not affiliated with Polar.</p>
  </footer>
</div>
</body>
</html>
`;
const appLd = a => ({
  '@context': 'https://schema.org', '@type': 'WebApplication', name: a.name, url: a.appUrl, description: a.desc,
  applicationCategory: 'HealthApplication', operatingSystem: 'Android (Chrome or Chromium), Windows, macOS, ChromeOS, Linux',
  browserRequirements: 'Requires Web Bluetooth (Google Chrome or Chromium) and a Polar H10 chest strap',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, isAccessibleForFree: true, license: 'https://www.gnu.org/licenses/gpl-3.0.html',
  image: SITE + a.image, author: { '@type': 'Organization', name: 'Anonaconda Code Lab', url: SITE + '/' }
});

function appPage(a) {
  return head({ title: a.title, desc: a.desc, path: a.path, image: a.image, jsonld: appLd(a) }) + `
  <header class="hero">
    <img class="icon" src="${a.icon}" alt="">
    <h1>${esc(a.name)}</h1>
    <p class="lede">${a.lede}</p>
    <p class="needs">${a.needs}</p>
    ${a.soon ? `<p class="soon"><span>Coming soon</span>${a.soon}</p>` : ''}
    <div class="links"><a class="open" href="${a.appUrl}">Open ${esc(a.name)}</a><a href="${a.path}manual/">User manual</a></div>
  </header>
  <main>
    <div class="shots${a.wide ? ' wide' : ''}" role="list" aria-label="Screenshots">
      ${a.shots.map(([src, cap, w, h]) => `<figure role="listitem"><img src="${src}" alt="${esc(cap)}" width="${w}" height="${h}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>`).join('\n      ')}
    </div>
    <h2>What it does</h2>
    <div class="features">
      ${a.features.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${p}</p></div>`).join('\n      ')}
    </div>
    <h2>What you need</h2>
    <ul class="needlist">${a.need.map(x => `<li>${x}</li>`).join('')}</ul>
    <h2>Questions</h2>
    ${a.faq.map(([q, ans]) => `<details><summary>${esc(q)}</summary><p>${ans}</p></details>`).join('\n    ')}
    <p class="note">${a.disclaimer}</p>
  </main>` + FOOT;
}
function manualPage(a, mdText) {
  const body = md(mdText.replace(/^# .*\n/, ''));
  return head({ title: `${a.name} user manual`, desc: `How to use ${a.name}: ${a.manualDesc}`, path: a.path + 'manual/', image: a.image }) + `
  <header class="hero">
    <img class="icon" src="${a.icon}" alt="">
    <h1>${esc(a.name)} user manual</h1>
    <div class="links"><a class="open" href="${a.appUrl}">Open ${esc(a.name)}</a><a href="${a.path}">About ${esc(a.name)}</a></div>
  </header>
  <main><article class="manual">
${body}
  </article></main>` + FOOT;
}

const SP = {
  name: 'Still Point', path: '/still-point/', appUrl: 'https://stillpoint.anonacondacodelab.com', icon: '/icons/still-point.svg', image: '/social/og-still-point.jpg',
  title: 'Still Point: free HRV and breathing app for the Polar H10',
  desc: 'A free, private morning HRV reading, standing test and calm breathing guide for the Polar H10. Compares you with your own baseline. No account; your data stays on your phone.',
  manualDesc: 'morning HRV readings, the standing test, breathing, trends and importing from Elite HRV.',
  lede: 'A calm morning check-in with your Polar H10. Take a two-minute heart rate variability reading, see how it compares with your own usual range, and breathe slowly with a soothing guide.',
  needs: 'Free. Runs in Google Chrome or Chromium on Android, or Chrome and Edge on a computer. No account, nothing uploaded. For general wellness only; not a medical device.',
  shots: [
    ['/screens/still-point/1-home.webp', 'Choose a morning reading, a standing test, a spot check or breathing', 780, 1688],
    ['/screens/still-point/2-reading.webp', 'Live heart rate during a reading: each breath shows as a wave', 780, 1688],
    ['/screens/still-point/3-result.webp', 'Your score against your own usual range, with training guidance', 780, 1688],
    ['/screens/still-point/4-beat-by-beat.webp', 'The whole reading beat by beat, the standing test and the beat-to-beat pattern', 780, 1688],
    ['/screens/still-point/5-breathe.webp', 'A soothing breathing guide, here at 5.5 breaths a minute', 780, 1688],
    ['/screens/still-point/6-trends.webp', 'Trends in plain language, your week, and what affects your HRV', 780, 1688]
  ],
  features: [
    ['Morning HRV reading', '1 to 5 minutes, lying, sitting or standing, from the strap’s beat-to-beat intervals. You get lnRMSSD, RMSSD, resting heart rate, breathing rate and a 0–100 score, with glitches and skipped beats left out.'],
    ['Compared with you, not with others', 'After 7 mornings, your 7-day average is compared with your own 60-day usual range: lower than usual, in your usual range or higher than usual, explained in plain words. HRV varies too much between healthy people for population grades to mean much.'],
    ['Standing test', 'An optional orthostatic test after the morning reading: your heart-rate jump on standing, where it settles, and the 30:15 ratio, tracked over time.'],
    ['Breathing guide', 'A calm, glowing pacer from 3 to 7 breaths a minute in half steps, box breathing, 4-7-8 or your own timings, with soft chimes. With the strap on, watch your heart rate rise and fall with each breath.'],
    ['Resonance pace test', 'Guides you through five paces for two minutes each and finds the pace at which your heart rate swings most with your breath.'],
    ['Open sessions', 'Meditate with no guide at all while your heart rate and HRV are tracked quietly, with a start-versus-end summary.'],
    ['Trends that talk', 'Charts of your score, usual range and resting heart rate, a weekly summary, and comments such as “lower than usual for 5 days” or “heart rate up, HRV down”.'],
    ['What affects you', 'Optional tags (alcohol, poor sleep, hard training, stress…), sleep score and hours slept. After a few weeks the app shows how each relates to your HRV.'],
    ['Training guidance', 'A daily suggestion based on published HRV-guided training research: go as planned, keep it easy, or rest.'],
    ['Import from Elite HRV', 'Bring your Elite HRV history across from its export. Every reading is recalculated with Still Point’s own method, so your baseline is ready on day one.'],
    ['Private by design', 'No account, no server, no analytics. Everything stays in your browser on your phone; export a backup or a spreadsheet whenever you like.'],
    ['Try it without a strap', 'A simulated strap lets you explore every screen before you buy an H10.']
  ],
  need: ['A <b>Polar H10</b> chest strap (a Polar H9 also works).', '<b>Google Chrome or Chromium on Android</b>, or Chrome or Edge on Windows, macOS, ChromeOS or Linux.', 'iPhone and iPad aren’t supported: Apple doesn’t allow websites to use Bluetooth.'],
  faq: [
    ['Is Still Point really free?', 'Yes. There is no subscription, no account and no ads. If you find it useful, you can support it on <a href="https://ko-fi.com/anonacondacodelab">Ko-fi</a>.'],
    ['Where is my data stored?', 'Only in your browser on your own device. Nothing is uploaded anywhere. Use <i>Save all to file</i> to keep a backup or move to another phone.'],
    ['How is the HRV score calculated?', 'It is lnRMSSD, the standard measure for short readings, on a 0–100 scale (lnRMSSD × 100 / 6.5). On clean readings it matches the HRV number in Elite HRV.'],
    ['Can I move from Elite HRV?', 'Yes. Request your data export in Elite HRV, then choose the downloaded .zip in Still Point’s settings. Your readings are recalculated and your baseline is ready immediately.'],
    ['Does it work on iPhone?', 'Not at the moment. Safari and every other iPhone browser block Bluetooth for websites.'],
    ['Can I install it like an app?', 'Yes. In Chrome on Android, tap <i>Install</i> in the app or use Chrome’s menu. It gets its own icon, opens full screen and works offline.'],
    ['Is it a medical device?', 'No. Still Point is for general wellness, relaxation and training. It cannot diagnose or rule out any condition. If you feel unwell, see a doctor.']
  ],
  disclaimer: 'Still Point is for general wellness only and is not a medical device. Slow breathing can make some people light-headed; stop and breathe normally if it does.'
};
const LO = {
  name: 'Lead One ECG', path: '/lead-one/', appUrl: 'https://leadone.anonacondacodelab.com', icon: '/icons/lead-one.svg', image: '/social/og-lead-one.jpg', wide: true,
  title: 'Lead One ECG: free ECG and HRV reports from a Polar H10',
  desc: 'Record a single-lead ECG with a Polar H10 chest strap and get a clear, graded A4 report with rhythm, HRV, breathing and recovery. Free, no account, runs in your browser.',
  manualDesc: 'recording an ECG, training tests, reading your report and keeping your data safe.',
  lede: 'Turn a Polar H10 chest strap into a single-lead ECG recorder. Record for a few minutes or all night, then get a clear, multi-page report you can save as a PDF.',
  needs: 'Free. Runs in Google Chrome or Chromium on Android, or Chrome and Edge on a computer. No account, nothing uploaded. For wellness and education only; not a medical device.',
  soon: 'An Android app that keeps recording with the screen off.',
  shots: [
    ['/screens/lead-one/app-home.webp', 'Set the context and position, then start recording', 780, 1688],
    ['/screens/lead-one/app-recording.webp', 'Live ECG, heart rate, signal quality and breathing while recording', 780, 1688],
    ['/screens/lead-one/report-summary.webp', 'The report’s summary page, graded against norms for your age and sex', 909, 1287],
    ['/screens/lead-one/report-plain-language.webp', 'What this means for you, in plain language', 909, 1287],
    ['/screens/lead-one/report-strips.webp', 'ECG strips on standard 25 mm/s paper', 909, 1287]
  ],
  features: [
    ['Record from your strap', 'ECG at 130 Hz, the strap’s beat-to-beat intervals and its accelerometer, all at once. Auto-stop from 1 minute to 8 hours, pause and resume, automatic reconnection and crash-safe storage.'],
    ['A report people can read', 'A printable A4 report with a plain-language page, four-level grading against age-, sex- and position-specific norms, detail pages for clinicians and ECG strips on standard paper.'],
    ['Many measurements', 'Heart rate and rhythm, ectopic beats and pauses, RMSSD, SDNN, pNN50, SD1/SD2, LF/HF, breathing rate from chest movement, QRS width, QT/QTc, T-wave shape and heart-rate recovery.'],
    ['Context-aware', 'Tag each recording as a morning baseline, training, evening, meditation, sleep or rest, with a body position and notes; reference ranges and interpretation adapt.'],
    ['Training tests', 'Maximum heart rate from your own data, a Max HR ramp test and an LTHR test with step cues, training zones, and heart-rate recovery after exercise.'],
    ['Your own baseline', 'After five readings of the same kind, each new one is compared with your usual range, with trend charts and commentary.'],
    ['Private by design', 'No account, no server, no analytics. Recordings live in your browser; export them for backups or to move to another device.'],
    ['Sample reports', 'Open synthetic sample reports to see exactly what you’ll get before you record.']
  ],
  need: ['A <b>Polar H10</b> chest strap.', '<b>Google Chrome or Chromium on Android</b>, or Chrome or Edge on Windows, macOS, ChromeOS or Linux.', 'iPhone and iPad aren’t supported: Apple doesn’t allow websites to use Bluetooth.'],
  faq: [
    ['Is Lead One ECG free?', 'Yes. No subscription, no account and no ads. If you find it useful, you can support it on <a href="https://ko-fi.com/anonacondacodelab">Ko-fi</a>.'],
    ['How long can I record?', 'From one minute up to 8 hours, so overnight recordings work. Keep the phone on charge with the page open.'],
    ['Can I save the report as a PDF?', 'Yes. Tap <i>Save as PDF</i> and choose “Save as PDF” as the printer.'],
    ['Where are my recordings stored?', 'Only in your browser on your own device. Nothing is uploaded. Export your history to keep a backup.'],
    ['Does it work on iPhone?', 'Not at the moment. Safari and every other iPhone browser block Bluetooth for websites.'],
    ['Is it a medical device?', 'No. Lead One ECG is for general wellness, training and education. A chest strap records one ECG lead and cannot diagnose or rule out heart conditions. If you feel unwell, call your local emergency number.']
  ],
  disclaimer: 'Lead One ECG is for general wellness and education only and is not a medical device. It cannot diagnose or rule out any condition. If you have chest pain, fainting, severe breathlessness or a racing or very irregular heartbeat, seek medical care immediately.'
};

out('still-point/index.html', appPage(SP));
out('lead-one/index.html', appPage(LO));
out('still-point/manual/index.html', manualPage(SP, readFileSync(spManual, 'utf8')));
out('lead-one/manual/index.html', manualPage(LO, readFileSync(loManual, 'utf8')));
const urls = ['/', '/still-point/', '/still-point/manual/', '/lead-one/', '/lead-one/manual/'];
const today = new Date().toISOString().slice(0, 10);
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
out('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('wrote', urls.length, 'pages, sitemap.xml and robots.txt');
