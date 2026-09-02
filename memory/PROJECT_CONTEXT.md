# Project context

## Purpose

Personal research portfolio for Zilin Chen / 陈子林, focused on robotics, control, motion planning, simulation, and intelligent machines.

## Repository and architecture

- Repository: `git@github.com:Zilin-Chen-22/MyWebsite.git`
- Framework: none. The site is intentionally plain HTML, CSS, and JavaScript.
- No Hugo, Jekyll templates, package manager, or build step.
- `.nojekyll` is included so GitHub Pages serves the static files directly.
- Shared styling is in `styles.css`; shared behavior is in `script.js`; translation behavior and Chinese copy are in `i18n.js`.

## Page map

- `index.html`: home
- `about.html`: profile and background
- `education.html`: incoming University of Hong Kong PhD, Tsinghua degree, and University of Toronto exchange
- `research.html`: project index
- `projects/*.html`: six project detail pages
- `skills.html`: technical skills and interests
- `performances.html`: orchestral, chamber, and solo performance collection with clickable detail covers and direct Bilibili links
- `performance.html` + `performance-detail.js`: reusable bilingual recording detail view with player, programme note, and ensemble credits
- `contact.html`: contact information
- `assets/images/`: portrait and project images
- `assets/media/`: original project evidence images and demonstration videos, grouped by project
- `assets/files/Zilin_Chen_CV.pdf`: downloadable CV
- `assets/files/Zilin_Chen_Graduation_Thesis_2026.pdf`: downloadable 2026 graduation thesis

## Accepted design decisions

- Warm ivory, forest green, and coral editorial visual system.
- Desktop navigation begins at the upper left; CV and display controls remain at the right.
- The `ZILIN CHEN` wordmark is the home link. A separate Home menu item was removed to avoid duplication.
- Independent pages are preferred over one long scrolling page.
- Education is a primary navigation page at the same level as About, Research, Skills, and Contact.
- Performances is a primary navigation page. Covers open detail pages containing Bilibili embeds plus direct source links; original videos are not downloaded into the repository.
- Performer names follow the active interface language: English uses given-name-first Romanized names (`Zilin Chen`, `Tiantian Wang`), while Chinese uses Chinese characters (`陈子林`, `王天天`). Preserve this convention when adding or correcting credits.
- Performance embeds retain the original `https://player.bilibili.com/player.html` desktop player with `page=1`, `high_quality=1`, `danmaku=0`, and `autoplay=0`. Only iOS/iPadOS uses the public `https://www.bilibili.com/blackboard/html5mobileplayer.html` endpoint confirmed by the user on iPhone Safari. The iOS variant uses `bvid`, `p=1`, and `danmaku=0`; do not add autoplay because even `autoplay=0` enables it on that endpoint. Both use a strict-origin-when-cross-origin referrer policy and a fixed 16:9 wrapper. Detect iPad desktop mode via a Mac user agent plus multitouch, not viewport width. Device selection is a compatibility heuristic, not guaranteed identity detection.
- Homepage portrait: `assets/images/zilin-chen-2026.jpg` (user-supplied white-shirt photo). Preserve the old `zilin-chen.jpg`; do not reuse either portrait as the favicon.
- Browser and Apple touch icons use the forest-green/ivory ZC monogram with a coral accent across all pages. PNG assets are committed; `scripts/generate-favicons.swift` is an optional macOS maintenance utility, not a build requirement.
- Research cards link to independent project detail pages.
- Responsive behavior is required for desktop and mobile.
- Light/dark preference and English/Chinese preference are stored in browser local storage.
- The language switch sits next to the light/dark control and shows the language available to switch to (`中` or `EN`).
- The home footer contains a deliberately understated hard-coded `Last modified` date. Update it whenever accepted site content or functionality changes.
- Current professional identity: Decision & Planning Algorithm Engineer at Beijing Keyi Technology Co., Ltd., July 2026-present, based in Beijing.
- Education: incoming full-time four-year PhD in Mechanical Engineering at the University of Hong Kong, 1 November 2026-31 October 2030 (expected), field of study Autonomous UAVs, supervisor Peng Lu / 鲁鹏; B.E. in Mechanical Engineering at Tsinghua University, August 2022-June 2026; exchange at the University of Toronto, September-December 2024.
- On the public Education timeline, show the HKU period once as `2026.11—2030.10`; do not repeat Registration or Expected completion as detail fields. Keep the exact offer dates in this maintenance record for future reference.
- Public email addresses: primary `chenzili22@outlook.com`; secondary `zilinchen79@gmail.com`. Do not restore the former Tsinghua student email to website pages.
- Original project media is part of the portfolio content and must not be dropped during redesigns or migrations.
- Project media should appear beside the relevant technical narrative, not as one detached gallery at the end of each page.
- Graduation-thesis projects should be distilled into readable project narratives, with selected source figures retained as evidence and the complete thesis available as an optional PDF download.
- Web video uses optimized H.264 MP4 files with `faststart`, poster images, and `preload="none"`; source-quality files remain under `assets/media/intelligent-car/originals/`.

## Maintenance workflow

1. Change the local source.
2. Validate all local links and both languages.
3. Preview desktop and mobile when layout is affected.
4. Commit with a descriptive message.
5. Push only after the requested review/approval flow.
6. Record the accepted change in this memory folder.

## Content editing guidance

The user does not need to edit HTML. They can provide replacement text, images, project details, or a new CV in natural language. Keep English source copy in the HTML and its Chinese equivalent in `i18n.js`.
