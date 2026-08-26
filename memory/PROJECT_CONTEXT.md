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
- `education.html`: Tsinghua degree and University of Toronto exchange
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
- Performance embeds use the public `https://www.bilibili.com/blackboard/html5mobileplayer.html` endpoint, confirmed by the user on iPhone Safari. Use `bvid`, `p=1`, and `danmaku=0`, a strict-origin-when-cross-origin referrer policy, and a fixed 16:9 wrapper. Do not add an autoplay parameter: this endpoint treats even `autoplay=0` as enabled.
- Research cards link to independent project detail pages.
- Responsive behavior is required for desktop and mobile.
- Light/dark preference and English/Chinese preference are stored in browser local storage.
- The language switch sits next to the light/dark control and shows the language available to switch to (`中` or `EN`).
- The home footer contains a deliberately understated hard-coded `Last modified` date. Update it whenever accepted site content or functionality changes.
- Current professional identity: Decision & Planning Algorithm Engineer at Beijing Keyi Technology Co., Ltd., July 2026-present, based in Beijing.
- Education: B.E. in Mechanical Engineering at Tsinghua University, August 2022-June 2026; exchange at the University of Toronto, September-December 2024.
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
