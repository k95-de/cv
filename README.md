# The Flow · November edition

Khaled Abdelhadi's interactive CV, rebuilt from the live site (k95-de.github.io/cv).
Same story ("The Flow": coolant running through a cooling circuit = his career), same
navy and electric-blue identity with the full thermal heat-map spectrum, new engine.

## How to open it

1. Double-click **START-HERE.bat** in this folder.
2. A black window opens (that is the tiny local server) and your browser opens
   http://localhost:5560/ by itself.
3. Close the black window when you are done.

Needs Python (already installed). Opening index.html directly by double-click also mostly
works, but the server is the safe way.

## What changed (compared with the live site)

| Before (live /cv) | Now |
|---|---|
| One fixed 3D pipe ride, text cards floating over it | A real page with chapters: Hero, Profile, The Circuit, Toolkit, Education, Contact |
| Three.js scene (670 KB library) | Own **WebGL fluid simulation** (no library, ~15 KB): the cursor (or finger) adds heat, warm fluid rises, cools down, and is drawn with your thermal colour map and isotherm lines, like your CV cover |
| Small name, cards | Huge kinetic type: name rises letter by letter, "Abdelhadi" in the thermal gradient |
| Station cards one at a time | **Pinned horizontal scroll** through all 14 stations on a glowing pipe that fills with coolant and heats up from blue to red; big year counter, station counter, image reveals with parallax |
| Static intro | Profile statement that lights up word by word as you read, count-up numbers |
| No skills/certificate view | Toolkit cards with cursor spotlight, certificate list, education with thesis note, language bars |
| Simple links | Big "Let's talk flow" finale with a magnetic Download-CV button, the heat field gets brighter again at the end |
| — | Loader that counts 20 °C → 95 °C, custom cursor, magnetic buttons, full-screen menu, scroll thermometer, header that hides on scroll, velocity-reactive marquee, thermal wipe when switching EN/DE, optional soft sound (M key) |

Phones (under 760 px) get a vertical version of the circuit with the pipe on the left and
readable text plates. "Reduce motion" users get everything static (no smooth scroll, no
pinning, a still heat image).

The old 3D pipe still exists as **classic.html** (linked in the footer).

## Honesty fixes

- TRATON bullet "covered hydrogen fuel-cell cooling" was **removed** (live site had it; on
  23 Oct 2026 you said you did not work on fuel-cell cooling yourself). Also removed in classic.html.
- MAN cooling bullet now says "calibrated against 3D CFD data and physical tests" (you used
  colleagues' CFD data, you did not run CFD cases).
- Master's: only "thesis graded 1.2" is shown, never as the final grade.
- German stays "Professional (B2)". No Habmann training, no ITIL anywhere (the live site had neither).
- New facts added only from APPLY/bot/profile.md: ~5 years simulation at MAN/TRATON, design-change
  recommendations (venting, restrictors, pipe diameters), variant sub-models, certificates
  (Coursera piping, Siemens CFD, Michigan AI, IBM Python, Claude Code 101, SimOps), thesis topic,
  available now / open to relocation and remote.

**Still to fix by you:** the downloadable PDF (assets/Khaled-Abdelhadi-CV.pdf, same file as the live
site) still says "hydrogen fuel cell" in three places. Rebuild it in APPLY/cv if you want it to match.

## References and techniques

References studied: landonorris.com (huge type, marquee strips, dark base with one loud accent,
hover-driven tiles, "vertical drive" feel), Codrops case studies on GSAP + Lenis + WebGL portfolios
(Trionn, Arnaud Rocca, "From Shader Uniforms to Clip-Path Wipes"), Awwwards elements for
WebGL fluid simulation and text fluid effects, Pavel Dobryakov's WebGL fluid (MIT) as the
technical basis for the stable-fluids solver.

Techniques used:
1. Smooth inertial scroll (Lenis) synced to GSAP ScrollTrigger
2. Real-time GPU fluid (stable fluids, vorticity, **buoyancy** so heat rises) reacting to cursor, touch and scroll speed
3. Thermal colour-map shader with isotherm contour lines, vignette and film grain
4. Pinned horizontal chapter with a container-animation timeline
5. Split-text reveals (letters and words rising out of masks)
6. Scroll-scrubbed word-by-word statement highlight
7. Magnetic buttons and a custom cursor with labels
8. Clip-path wipes (loader exit, menu circle reveal, language switch)
9. Velocity-reactive marquee with skew
10. Count-up numbers, cursor spotlight cards, parallax images
11. Hide-on-scroll header, scroll thermometer, live section HUD
12. Accessibility: skip link, focus rings, inert page behind the menu, reduced-motion mode, no-JS fallback

## Files

- index.html · the page
- css/style.css · all styling
- js/content.js · **every word on the site, EN + DE** (edit text here)
- js/fluid.js · the heat-field simulation
- js/main.js · motion, scroll, menu, language, cursor, sound
- lib/ · vendored GSAP 3.12.5, ScrollTrigger 3.12.5, Lenis 1.0.42 (three.js only for classic.html)
- assets/ · portrait, job images, CV PDF
- classic.html + src/ · the previous 3D pipe version

## Publishing (only if you want this to replace the live site)

Nothing was uploaded or pushed. To publish yourself:

1. Copy everything in this folder **except** README.md, START-HERE.bat and the .claude folder into
   `Desktop\_Archive\Interactive-CV-open` (overwrite; it already has the .git folder).
2. Open a terminal in that folder and run:
   ```
   git add -A
   git commit -m "November edition"
   git push
   ```
3. Wait 1-2 minutes, then open https://k95-de.github.io/cv/ (hard refresh with Ctrl+F5).

If you would rather keep the old live site, you can push this to a new repo instead.
