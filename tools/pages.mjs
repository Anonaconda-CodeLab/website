#!/usr/bin/env node
// Builds the app pages, the user-manual pages, sitemap.xml and robots.txt for anonacondacodelab.com.
// The site itself has no build step: run this after changing a page's content or a manual, then commit the output.
//   node tools/pages.mjs [still-point/docs/MANUAL.md] [lead-one-ecg/docs/MANUAL.md] [rounds/docs/MANUAL.md]
// Each manual path defaults to the app's repository cloned next to this one (../still-point, ../lead-one-ecg, ../rounds).
// A manual that can't be found is skipped and its existing page is left as it is.
// A default (sibling) manual is only used if that folder is a git clone that is up to date with GitHub, so an old
// copy can't quietly overwrite a newer live manual. Pass a path explicitly to use a file as it is.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { md } from './md.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://anonacondacodelab.com';
const arg = process.argv.slice(2), sib = r => join(root, '..', r, 'docs', 'MANUAL.md');
const git = (dir, ...a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
// returns why a sibling manual can't be trusted, or '' if it's current
function stale(f) {
  const repo = join(dirname(f), '..');
  if (!existsSync(f)) return '';
  try { git(repo, 'rev-parse', '--git-dir'); } catch { return 'not a git clone'; }
  try { git(repo, 'fetch', '-q', 'origin'); } catch { return 'could not check GitHub for a newer version'; }
  let behind; try { behind = +git(repo, 'rev-list', '--count', 'HEAD..@{upstream}'); } catch { return 'branch has no upstream'; }
  return behind ? `${behind} commit(s) behind GitHub; pull first` : '';
}
const pick = (i, name) => { if (arg[i]) return arg[i]; const f = sib(name), why = stale(f); if (why) { console.warn(`skipped ${name} manual: ../${name} is ${why}`); return ''; } return f; };
const spManual = pick(0, 'still-point'), loManual = pick(1, 'lead-one-ecg'), rdManual = pick(2, 'rounds');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const out = (p, s) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), s); };

const CSS = `@font-face{font-family:"Instrument Sans";font-style:normal;font-display:swap;font-weight:400 700;font-stretch:75% 100%;
  src:url(/fonts/InstrumentSans-latin-variable.woff2) format("woff2-variations")}
:root{--paper:#ECEFE7; --new:#B31F39; --new-ink:#FFFFFF;--ink:#22362B;--line:#6E7F3A;--muted:#5E6B61;--rule:#CBD2C4;--head:#8FA048;--card:#F6F8F3;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--paper:#141A16; --new:#F07A8D; --new-ink:#141A16;--ink:#E3E8DE;--line:#A9B865;--muted:#94A096;--rule:#2C362F;--head:#B9C97A;--card:#1A221D}}
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
.soon.new{margin-top:14px;padding:11px 14px;border-left:4px solid var(--new);border-radius:10px;background:color-mix(in srgb,var(--new) 9%,transparent);font-weight:550}
.soon.new span{background:var(--new);color:var(--new-ink);font-size:13px;padding:3px 11px}
.soon.new a{color:var(--new);font-weight:700}
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
<link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : ''}<style>
${CSS}
</style>
</head>
<body>
<div class="wrap">
  <div class="crumbs"><a href="/"><img src="/favicon-192.png" alt="">Anonaconda Code Lab</a></div>`;
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
    <p>© 2026 Anonaconda Code Lab. Apps are free software under the GNU GPL v3. Polar and H10 are trademarks of Polar Electro Oy; Garmin, HRM-Dual and HRM-Pro of Garmin Ltd.; Wahoo and TICKR of Wahoo Fitness; Coospo, Magene and Decathlon of their respective owners. These apps are independent and not affiliated with any of them.</p>
  </footer>
</div>
</body>
</html>
`;
const appLd = a => ({
  '@context': 'https://schema.org', '@type': 'WebApplication', name: a.name, url: a.appUrl, description: a.desc,
  applicationCategory: a.category || 'HealthApplication', operatingSystem: a.os || 'Android (Chrome or Chromium), Windows, macOS, ChromeOS, Linux',
  browserRequirements: a.browserReq || 'Requires Web Bluetooth (Google Chrome or Chromium) and a Polar H10 chest strap',
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
    ${a.isNew ? `<p class="soon new"><span>New</span>${a.isNew}</p>` : ''}
    ${a.soon ? `<p class="soon"><span>Coming soon</span>${a.soon}</p>` : ''}
    <div class="links"><a class="open" href="${a.appUrl}">Open ${esc(a.name)}</a>${(a.links || [[a.path + 'manual/', 'User manual']]).map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join('')}</div>
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
  os: 'Android app; Android (Chrome or Chromium), Windows, macOS, ChromeOS, Linux',
  browserReq: 'Requires Web Bluetooth (Google Chrome or Chromium) and a Polar H10 or standard Bluetooth chest strap',
  title: 'Still Point: free HRV and breathing app for the Polar H10 and other chest straps',
  desc: 'A free, private morning HRV reading, standing test and calm breathing guide for the Polar H10 or any standard Bluetooth chest strap. Compares you with your own baseline. No account; your data stays on your phone.',
  manualDesc: 'morning HRV readings, the standing test, breathing, trends and importing from Elite HRV.',
  lede: 'A calm morning check-in with your Polar H10 or any standard Bluetooth chest strap. Take a two-minute heart rate variability reading, see how it compares with your own usual range, and breathe slowly with a soothing guide.',
  needs: 'Free. Runs in Google Chrome or Chromium on Android, or Chrome and Edge on a computer. No account, nothing uploaded. For general wellness only; not a medical device.',
  isNew: 'The <a href="https://stillpoint.anonacondacodelab.com/android.html">Android app</a>: readings, breathing sessions and chimes keep going with the screen off, and it has no internet access at all.',
  links: [['https://stillpoint.anonacondacodelab.com/android.html', 'Android app'], ['/still-point/manual/', 'User manual'], ['https://github.com/Anonaconda-CodeLab/still-point', 'Source code']],
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
    ['Works with most chest straps', 'A Polar H10 or any strap that sends the standard Bluetooth heart-rate signal with beat-to-beat intervals. Each reading notes the strap, and Trends tells you if your baseline mixes straps.'],
    ['Try it without a strap', 'A simulated strap lets you explore every screen before you buy a strap.']
  ],
  need: ['A <b>Polar H10</b> or <b>any standard Bluetooth chest strap</b> that sends beat-to-beat intervals, such as a Garmin HRM-Dual or HRM-Pro, Wahoo TICKR, Coospo, Magene or Decathlon strap (a Polar H9 also works).', '<b>Google Chrome or Chromium on Android</b>, or Chrome or Edge on Windows, macOS, ChromeOS or Linux.', 'Or the <a href="https://stillpoint.anonacondacodelab.com/android.html"><b>Android app</b></a>, which needs no browser at all.', 'iPhone and iPad aren’t supported: Apple doesn’t allow websites to use Bluetooth.'],
  faq: [
    ['Which heart-rate straps work?', 'The Polar H10, and any chest strap that sends the standard Bluetooth heart-rate signal with beat-to-beat intervals: for example Garmin HRM-Dual and HRM-Pro, Wahoo TICKR, and straps from Coospo, Magene and Decathlon. Many watches that broadcast heart rate send heart rate only, without the beat-to-beat data HRV needs; Still Point tells you if a device can’t be used for readings.'],
    ['Is Still Point really free?', 'Yes. There is no subscription, no account and no ads. If you find it useful, you can support it on <a href="https://ko-fi.com/anonacondacodelab">Ko-fi</a>.'],
    ['Where is my data stored?', 'Only in your browser on your own device. Nothing is uploaded anywhere. Use <i>Save all to file</i> to keep a backup or move to another phone.'],
    ['How is the HRV score calculated?', 'It is lnRMSSD, the standard measure for short readings, on a 0–100 scale (lnRMSSD × 100 / 6.5). On clean readings it matches the HRV number in Elite HRV.'],
    ['Can I move from Elite HRV?', 'Yes. Request your data export in Elite HRV, then choose the downloaded .zip in Still Point’s settings. Your readings are recalculated and your baseline is ready immediately.'],
    ['Does it work on iPhone?', 'Not at the moment. Safari and every other iPhone browser block Bluetooth for websites.'],
    ['Can I install it like an app?', 'Yes: install the <a href="https://stillpoint.anonacondacodelab.com/android.html">Android app</a>, which keeps going with the screen off, or in Chrome on Android tap <i>Install</i> in the web app. Either way it gets its own icon and works offline.'],
['Why isn’t the Android app on Google Play?', 'Publishing there means registering with Google and handing over government ID, and Google is extending that check to apps installed from elsewhere. We think you should be able to install software you choose on a phone you own, so we support <a href="https://keepandroidopen.org">Keep Android Open</a> and offer the app directly. The <a href="https://stillpoint.anonacondacodelab.com/android.html">Android page</a> explains how to install it and check it’s the official build.'],
    ['Is the code open?', 'Still Point is free software under the GNU GPL v3. The <a href="https://github.com/Anonaconda-CodeLab/still-point">source code is on GitHub</a>, and every Android release is built from it automatically, with a checksum to verify the download.'],
    ['Is it a medical device?', 'No. Still Point is for general wellness, relaxation and training. It cannot diagnose or rule out any condition. If you feel unwell, see a doctor.']
  ],
  disclaimer: 'Still Point is for general wellness only and is not a medical device. Slow breathing can make some people light-headed; stop and breathe normally if it does.'
};
const RD = {
  name: 'Rounds', path: '/rounds/', appUrl: 'https://rounds.anonacondacodelab.com', icon: '/icons/rounds.svg', image: '/social/og-rounds.jpg',
  category: 'SportsApplication', os: 'Android app; any modern browser on Android, iPhone, iPad, Windows, macOS, ChromeOS, Linux',
  browserReq: 'Any modern browser. Optional heart rate needs Web Bluetooth (Chrome or Chromium, or Bluefy on iPhone)',
  title: 'Rounds: a free, loud interval timer for HIIT, Tabata and boxing',
  desc: 'A loud, clear interval timer with 16 presets (Tabata, EMOM, 4 × 4, boxing rounds and more) or your own timers. Free, no account, no ads, works offline.',
  manualDesc: 'presets, building your own timers, the beeps, spoken cues, heart rate and backing up your timers.',
  lede: 'A loud, clear interval timer. Pick one of 16 presets or build your own, press play, and follow the beeps. The whole screen changes colour with each round, so you can read it from across the room.',
  needs: 'Free. Works in any modern browser on a phone, tablet or computer, and offline once added to your home screen. No account, no ads, no tracking.',
  isNew: 'The <a href="https://rounds.anonacondacodelab.com/android.html">Android app</a>: beeps and voice cues keep going with the screen off, and it has no internet access at all.',
  links: [['https://rounds.anonacondacodelab.com/android.html', 'Android app'], ['/rounds/manual/', 'User manual'], ['https://github.com/Anonaconda-CodeLab/rounds', 'Source code']],
  shots: [
    ['/screens/rounds/1-home.webp', 'Favourites, your own timers and 16 presets, sorted by goal or hardest first', 780, 1688],
    ['/screens/rounds/2-about.webp', 'Every preset explains what it is, how to do it, why it works and where it comes from', 780, 1688],
    ['/screens/rounds/3-work.webp', 'Work: the whole screen turns orange, with the exercise name, round and set', 780, 1688],
    ['/screens/rounds/4-rest.webp', 'Rest: green, with what comes next', 780, 1688],
    ['/screens/rounds/5-editor.webp', 'Build your own: work, rest, rounds, sets, warm-up, cool-down and exercise names', 780, 1688],
    ['/screens/rounds/6-finish.webp', 'Done: work rounds and total time, with your heart rate if a strap was connected', 780, 1688]
  ],
  features: [
    ['Beeps you can’t miss', 'Three short beeps count you into and out of every work round, then a long high beep for go and a long low beep for stop. They are scheduled on the audio clock, so they stay on time.'],
    ['16 presets', 'Tabata, the One-Minute Workout, Gibala intervals, the Little method, 10-20-30, 4 × 4 Norwegian, tempo intervals, a pyramid, fartlek, 30 / 30, EMOM, AMRAP, HIIT 40 / 20, boxing rounds and a core circuit.'],
    ['Sorted for you', 'Filter the presets by goal: short on time, heart and endurance, fitness and VO₂max, speed and power, or circuits and strength. Or sort them from hardest to easiest.'],
    ['Explained, with sources', 'Each preset says what it is, how to do it and why it works, with the research it comes from.'],
    ['Build your own', 'Work, rest, rounds, sets with a longer break between them, warm-up and cool-down. Custom steps handle patterns like 10-20-30 or a pyramid, and exercise names are shown in each work round.'],
    ['Readable from across the room', 'Big numbers, a ring that empties as the time runs down, and a full-screen colour for each phase: work, rest, set break, warm-up and cool-down.'],
    ['Spoken cues and vibration', 'Optional voice cues (“Work”, “Rest”, “Round 3 of 8” and exercise names), a buzz at each change, and a halfway beep in long work rounds.'],
    ['Heart rate (optional)', 'Connect any standard Bluetooth heart-rate strap or watch: Polar, Garmin, Wahoo, Coospo and most others. See your heart rate live, then your average and peak in the work rounds. Shown only, never saved or sent.'],
    ['Favourites and backup', 'Star the timers you use most to keep them at the top. Save all your timers to a file and import them on another phone or browser.'],
    ['Private and offline', 'No account, no server, no analytics. Your timers stay on your device, and it works without a connection once added to your home screen.']
  ],
  need: ['Any modern browser on a phone, tablet or computer, or the <a href="https://rounds.anonacondacodelab.com/android.html"><b>Android app</b></a>.', 'For heart rate (optional): a Bluetooth heart-rate strap or watch, and <b>Chrome or Chromium on Android</b> or a computer, or the free <b>Bluefy</b> browser on iPhone and iPad.'],
  faq: [
    ['Is Rounds really free?', 'Yes. No subscription, no account and no ads. If you find it useful, you can support it on <a href="https://ko-fi.com/anonacondacodelab">Ko-fi</a>.'],
    ['Why can’t I hear the beeps?', 'Turn up the phone’s <i>media</i> volume (not the ringer), and check the phone isn’t muting media. <i>Test the beeps</i> in Settings plays them all.'],
    ['Does it keep going when the screen is off?', 'In a browser, keep the screen on: Rounds does this for you while a timer runs, because browsers pause pages in the background. The <a href="https://rounds.anonacondacodelab.com/android.html">Android app</a> keeps the beeps and voice cues going with the screen off.'],
    ['Where are my timers stored?', 'Only in your browser on your own device. Use <i>Save timers to file</i> in Settings to keep a backup or move them to another phone.'],
    ['Does it work on iPhone?', 'Yes, the timer works in Safari and any other browser. For heart rate, use the free Bluefy browser, because Safari can’t use Bluetooth.'],
    ['Can I install it like an app?', 'Yes: install the <a href="https://rounds.anonacondacodelab.com/android.html">Android app</a>, or use <i>Add to home screen</i> or <i>Install app</i> in your browser’s menu. It gets its own icon, opens full screen and works offline.'],
    ['Why isn’t the Android app on Google Play?', 'Publishing there means registering with Google and handing over government ID, and Google is extending that check to apps installed from elsewhere. We think you should be able to install software you choose on a phone you own, so we support <a href="https://keepandroidopen.org">Keep Android Open</a> and offer the app directly. The <a href="https://rounds.anonacondacodelab.com/android.html">Android page</a> explains how to install it and check it’s the official build.'],
    ['Is the code open?', 'Rounds is free software under the GNU GPL v3. The <a href="https://github.com/Anonaconda-CodeLab/rounds">source code is on GitHub</a>, and every Android release is built from it automatically, with a checksum to verify the download.']
  ],
  disclaimer: 'High-intensity intervals are very demanding. If you are new to hard exercise or have a heart condition, check with a doctor first, and build up gradually. Stop if you feel unwell.'
};
const LO = {
  name: 'Lead One ECG', path: '/lead-one/', appUrl: 'https://leadone.anonacondacodelab.com', icon: '/icons/lead-one.svg', image: '/social/og-lead-one.jpg', wide: true,
  title: 'Lead One ECG: free ECG and HRV reports from a Polar H10',
  desc: 'Record a single-lead ECG with a Polar H10 chest strap and get a clear, graded A4 report with rhythm, HRV, breathing and recovery. Free, no account, runs in your browser.',
  manualDesc: 'recording an ECG, training tests, reading your report and keeping your data safe.',
  lede: 'Turn a Polar H10 chest strap into a single-lead ECG recorder. Record for a few minutes or all night, then get a clear, multi-page report you can save as a PDF.',
  needs: 'Free. Runs in Google Chrome or Chromium on Android, Chrome and Edge on a computer, or Bluefy on iPhone and iPad. No account, nothing uploaded. For wellness and education only; not a medical device.',
  isNew: 'The <a href="https://leadone.anonacondacodelab.com/android.html">Android app</a>: keeps recording with the screen off, and has no internet access at all.',
  links: [['https://leadone.anonacondacodelab.com/android.html', 'Android app'], ['/lead-one/manual/', 'User manual'], ['https://github.com/Anonaconda-CodeLab/lead-one-ecg', 'Source code']],
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
  need: ['A <b>Polar H10</b> chest strap.', '<b>Google Chrome or Chromium on Android</b>, or Chrome or Edge on Windows, macOS, ChromeOS or Linux.', 'On <b>iPhone and iPad</b>, the free <b>Bluefy</b> browser from the App Store (Safari can’t use Bluetooth).', 'Or the <a href="https://leadone.anonacondacodelab.com/android.html"><b>Android app</b></a>, which needs no browser at all.'],
  faq: [
    ['Is Lead One ECG free?', 'Yes. No subscription, no account and no ads. If you find it useful, you can support it on <a href="https://ko-fi.com/anonacondacodelab">Ko-fi</a>.'],
    ['How long can I record?', 'From one minute up to 8 hours, so overnight recordings work. Keep the phone on charge with the page open.'],
    ['Can I save the report as a PDF?', 'Yes. Tap <i>Save as PDF</i> and choose “Save as PDF” as the printer.'],
    ['Where are my recordings stored?', 'Only in your browser on your own device. Nothing is uploaded. Export your history to keep a backup.'],
    ['Does it work on iPhone?', 'Yes, in the free Bluefy browser from the App Store. Safari and the other iPhone browsers block Bluetooth for websites, so they can’t connect to the strap.'],
    ['Why isn’t the Android app on Google Play?', 'Publishing there means registering with Google and handing over government ID, and Google is extending that check to apps installed from elsewhere. We think you should be able to install software you choose on a phone you own, so we support <a href="https://keepandroidopen.org">Keep Android Open</a> and offer the app directly. The <a href="https://leadone.anonacondacodelab.com/android.html">Android page</a> explains how to install it and check it’s the official build.'],
    ['Is the code open?', 'Yes. Lead One ECG is free software under the GNU GPL v3. The <a href="https://github.com/Anonaconda-CodeLab/lead-one-ecg">source code is on GitHub</a>, and every Android release is built from it automatically, with a checksum to verify the download.'],
    ['Is it a medical device?', 'No. Lead One ECG is for general wellness, training and education. A chest strap records one ECG lead and cannot diagnose or rule out heart conditions. If you feel unwell, call your local emergency number.']
  ],
  disclaimer: 'Lead One ECG is for general wellness and education only and is not a medical device. It cannot diagnose or rule out any condition. If you have chest pain, fainting, severe breathlessness or a racing or very irregular heartbeat, seek medical care immediately.'
};

out('rounds/index.html', appPage(RD));
out('still-point/index.html', appPage(SP));
out('lead-one/index.html', appPage(LO));
for (const [a, f, dir] of [[RD, rdManual, 'rounds'], [SP, spManual, 'still-point'], [LO, loManual, 'lead-one']]) {
  if (f && existsSync(f)) out(dir + '/manual/index.html', manualPage(a, readFileSync(f, 'utf8')));
  else if (f) console.warn(`skipped ${dir}/manual: ${f} not found`);
}
const urls = ['/', '/rounds/', '/rounds/manual/', '/still-point/', '/still-point/manual/', '/lead-one/', '/lead-one/manual/'];
const today = new Date().toISOString().slice(0, 10);
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
out('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('wrote', urls.length, 'pages, sitemap.xml and robots.txt');
