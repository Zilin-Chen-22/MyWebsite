# Design exploration, 2026-10-24

The user finds the current colors and layout too obviously AI-generated and provided Jeremy Hsiao's research page, Raycast, and Linear as references. Requested a visual preview before a full redesign.

An isolated prototype lives in `design-preview/`: overview and research views, English/Chinese toggle, dark/light toggle, responsive layouts, and links to existing project detail pages. Default palette is graphite and neutral gray; typography is sans-serif; project imagery and thin separators replace decorative cards and outlined display text.

The user liked the direction and requested the remaining pages in the same style for confirmation. The preview now includes About, Education, Skills, Performances, performance details, Calendar, Contact, and all six research detail pages. All navigation stays within the preview; original media and existing translations/player logic are retained. `build-preview.cjs` mechanically creates preview copies from production sources and applies a shared neutral stylesheet. Preview language/theme preferences have independent storage keys.

The user subsequently approved the complete preview with “可以，替换吧”. The design is now accepted for production replacement. The original preview folder remains a local working artifact; production pages use independent URLs and shared production preference keys.

Reference access: all three URLs were requested. Raycast and Linear text was available through web browsing; Jeremy's HTML was accessible via curl but its client-rendered screen remained black in headless browser, and Linear's headless render displayed a loading error. Avoid claiming a pixel-faithful comparison.

Validation: visited 15 page views at 1440px and 390px in Chromium; no first-party missing resources, broken local link targets, JS exceptions, or horizontal overflow. Confirmed cross-page Chinese/light preference persistence and Chinese/English performance-title switching. Visually corrected inherited mobile menu column styling, confirmed remote Bilibili covers load, and reviewed education, skills, contact, performances and a mobile project detail. Existing platform-specific video embed logic is reused; this pass did not re-certify playback on a physical iPhone or submit a booking.
