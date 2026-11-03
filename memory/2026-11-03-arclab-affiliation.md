# Current affiliation correction — 2026-11-03

- User confirmed they have left Beijing Keyi Technology and are now solely an HKU ArcLab student.
- Current identity: full-time Mechanical Engineering PhD student, University of Hong Kong, ArcLab; supervisor Peng Lu; enrolled November 2026. No coursework or research accomplishments at HKU should be invented.
- Official lab site: https://arclab.hku.hk/ (Adaptive Robotic Controls Lab).
- Updated Home (static and dynamic), About, Education, Contact location, bilingual strings and search metadata. Added lab links; refreshed script/CV cache versions across pages.
- Website English CV and its generation script now describe Keyi as former employment. July 2026 start retained; end date is unknown and deliberately not guessed.
- The separate Chinese resume previously generated outside this repository was not changed.

## Follow-up full audit

- Live `/MyWebsite/about.html` returned HTTP 200 with the updated HKU/ArcLab identity. Root-domain `/about.html` returned the older Hugo site's HTTP 404. These are distinct deployments; do not overwrite the root-site repository without agreeing on consolidation.
- Removed four obsolete current-affiliation descriptions from the translation dictionary (Tsinghua student/researcher and Beijing engineer).
- About now distinguishes previous project experience from current interests and explicitly says the PhD has just started; no HKU accomplishments are claimed.
- Added a regression check across every tracked HTML/JS production source, not just Home/About.
- English CV correctly marks Keyi as former employment, but its inherited UTAT entry still says Sep 2024–present. End date is not confirmed; ask the user before assigning one.
