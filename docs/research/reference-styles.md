# Reference site visual systems (measured)

Method: puppeteer-core + installed Chrome (headless), desktop 1440x900 and mobile 390x844 (DPR 2, mobile emulation), desktop Chrome UA, measured 4 s after `load`. Nothing accepted or clicked; cookie banners were present on most pages and are visible in the screenshots (maxim, q-industrial, sarens, ainscough, mammoet has a cookie icon only). Raw data: `.work/refs/results.json`, `refined.json`. Screenshots and `board.jpg` are in `docs/research/refs/`.

**Load notes:** all six loaded. maximcrane.com/fleet redirected to `/load-charts/` (so the measured page is Load Charts, same template/hero). q-industrial.com redirected to `/en-de`. Sarens has no `<h1>` in the DOM; the hero headline is a `div`. Ainscough has a second `h1` lower on the page; the hero title is a `div.hero-title`. Cominvi/Q hero text is split into spans (sizes taken from the span). Mobile H1 sizes below come from automatic detection and are approximate (cominvi mobile not captured reliably).

## 1. Typography (desktop, hero H1 / section H2 / body / nav / button label)

| Site | Font (heading / body) | H1 size / weight / line-height / tracking / case | H2 (section) size / weight | Body p size / line-height | Nav link | Button label |
|---|---|---|---|---|---|---|
| maximcrane | Open Sans / Open Sans | 50px / 800 / 50px (1.0) / normal / UPPER | 15px label 800 UPPER red (section title) | 16px / 24px (1.5) (14px/24 in banner) | 12px / 700-900 UPPER | 14px / 800 UPPER |
| cominvi | Helvetica Now Display / same; PP Supply Mono for labels | 56px / 700 / 61.6px (1.1) / normal / none | 48px / 700 / -0.47px tracking (0.98%) | 16px base; mono labels 10.8-12px UPPER | 14px / 500 | 10.8px mono UPPER (card tags) |
| q-industrial | Q-L (light grotesk) / Q-R | 80.64px / 300 / 72.6px (0.9) / -4.03px (-5%) / none | 84.96px / 300 / -1.7px | 12.2px / 14.7px (1.2), 45% opacity grey | 10.8px / 300 (outlined pill buttons) | 11.8px / 400 |
| mammoet | NeueHelvetica 95 Black / 55 Roman | 46px / 400(black face) / 39px (0.85) / -1.84px (-4%) / UPPER | 36px / 35px / -1.44px / UPPER | 20px / 32px (1.6) | 18px / 400 | 18px / 400 |
| sarens | GothamLight (hero), GothamBold (h2) / Roboto 200 | 32px / 200 / 48px (1.5) / 0.3px (hero tagline, UPPER in source) | 42px / 500 / 50.4px (GothamBold) | 18px / 27px (1.5), weight 200, grey #666 | 15px / 200 | image buttons (RENT/BUY); no text button |
| ainscough | Montserrat Bold / Helvetica, Arial | 50px / 400 (Bold face) / 60px (1.2) / normal / UPPER | 34px / 44px / UPPER | 16px / 24px (1.5) | 16px / 400 UPPER | 14px / 400 UPPER |

## 2. Type scale ratios

| Site | H1 : body | H1 : H2 | Notes |
|---|---|---|---|
| maximcrane | 3.13 (50/16) | 3.3 vs 15px label | single large headline, tiny label H2s |
| cominvi | 3.5 (56/16) | 1.17 (56/48) | H1 and statement text almost same size |
| q-industrial | 5.6 (80.64/14.4) | 0.95 (H2 84.96 larger than H1) | sizes scale with vw (H1 = 5.6vw); very tight leading 0.9 and -5% tracking |
| mammoet | 2.3 (46/20) | 1.28 (46/36) | large 20px body, -4% heading tracking |
| sarens | 1.78 (32/18) | 0.76 (32/42) | weakest hierarchy; headline lighter than H2 |
| ainscough | 3.13 (50/16) | 1.47 (50/34) | hero title 50 vs section 34 |

Average H1:body about 3.3 (range 1.8-5.6). Hero H1 range 32-81px, median about 50px. Heading line-height 0.85-1.2 on the display sites vs 1.5 on Sarens. Body text 16px on 3 of 6 sites, 18-20px on Mammoet/Sarens, 12-14px on Q.

## 3. Colour, buttons, radius

| Site | Page bg | Text colour | Main accent(s) | Primary button bg / text | Button radius | Button padding |
|---|---|---|---|---|---|---|
| maximcrane | #FFFFFF (hero image overlay red/black) | #212121 body, white on hero | Red `rgb(218,33,40)` #DA2128 | #DA2128 / white (Get a Quote, nav-height block) | 0 (cookie buttons 2px) | 30px 12px |
| cominvi | #151515 | white; sections #151515 on light | Orange `rgb(244,121,32)` #F47920, dark orange #B55109 | white label tags over image; "menu" circular outline button | 8px (cards), circle menu | 0 32px |
| q-industrial | #010101 | #E6E6E6 | Red `rgb(202,0,0)` #CA0000 | #CA0000 / #E6E6E6 (Explore Catalog) | 4px (nav/cookie pills 4px) | 12px 72px (cookie 16px) |
| mammoet | #282E3E (navy) | white | Red `rgb(228,33,54)` #E42136; yellow accents | #E42136 / white (Get In Touch, nav block) | 0 | 0 30px (full-height) |
| sarens | #F3F3F3 | #666 body, white on hero | Blue `rgb(42,94,151)` #2A5E97 / #004A85; yellow `rgb(255,227,0)` #FFE300 | yellow block RENT / blue BUY image tiles; cookie "Allow all" #004A85 | 0 | 15px (cookie) |
| ainscough | #FFFFFF | #212529 | Yellow `rgb(242,197,65)` #F2C541; navy logo | #F2C541 / black (Get a Quote) | 0 | 15px 15px 15px 45px (icon left) |

Radius summary: 4 of 6 sites are square (0px), Q-Industrial 4px, Cominvi 8px (plus circles). Single warm/hazard accent per site except Sarens (blue plus yellow). Dark-theme sites: cominvi, q-industrial, mammoet (navy).

## 4. Animation and scroll libraries (detected on `window`, DOM and script URLs; bundled/minified libs not exposing globals would be missed)

| Site | GSAP | ScrollTrigger | Lenis | Locomotive | Framer/motion | three.js | Canvas | Lottie | Other |
|---|---|---|---|---|---|---|---|---|---|
| maximcrane | no | no | no | no | no | no | 0 | no | jQuery only |
| cominvi | not exposed | not exposed | **yes** | no | no | no | 2 | no | Webflow, jQuery, 2 videos |
| q-industrial | **yes** | **yes** | **yes** | no | no | no | 0 | no | Webflow, jQuery, 2 videos (the 3D ring appears to be video) |
| mammoet | **yes** | **yes** | no | no | no | no | 0 | no | jQuery |
| sarens | no | no | no | no | no | no | 0 | no | Swiper carousel, jQuery, Cookiebot, 2 videos |
| ainscough | no | no | no | no | no | no | 0 | no | AOS (animate on scroll), jQuery |

## 5. Performance (desktop, cold cache, 4 s idle after load)

| Site | Transferred | Requests | First paint / FCP | DOMContentLoaded | Load event |
|---|---|---|---|---|---|
| maximcrane | 2.9 MB | 132 | 1284 ms | 1612 ms | 1847 ms |
| cominvi | 19.5 MB | 163 | 300 ms | 470 ms | 1812 ms |
| q-industrial | 9.5 MB | 355 | 616 ms | 782 ms | 2780 ms |
| mammoet | 2.6 MB | 99 | 732 ms | 958 ms | 3103 ms |
| sarens | 11.7 MB | 111 | 1448 ms | 1444 ms | 2394 ms |
| ainscough | 4.7 MB | 123 | 1112 ms | 1109 ms | 2105 ms |

Mobile transfer (first 4 s, mobile emulation, lazy loading differs): maxim 62 KB/124 req, cominvi 5.4 MB/158, q 408 KB/50, mammoet 48 KB/85, sarens 5.1 MB/112, ainscough 337 KB/116 (some of these under-count because heavy media is deferred or the banner blocks it).

Mobile H1 (auto-detected, approximate): maxim 30px/30, q-industrial 38.6px/34.7, mammoet 29px/39, ainscough 26px/36 (non-hero h1), sarens 35px (non-hero heading), cominvi not captured.

## 6. First-screen layout (one sentence each)

- **maximcrane:** Black utility bar over a white logo/phone/nav strip with a full-height red "Get a Quote" block at far right, then a centred white all-caps headline and one-line subtitle over a red-tinted crane photo band (cookie banner covers the bottom 190px).
- **cominvi:** Full-bleed dark video hero with a minimal logo (left) and "Menu" circle (right), a left-aligned two-line bold headline at mid-left, a small mono stat label mid-right, and two image link cards pinned bottom-right.
- **q-industrial:** Black screen with outlined pill nav buttons across the top, a huge split light-weight headline ("Industrial ... Coatings") flanking a central red 3D ring inside a rounded outline, with tagline, small grey copy and a red "Explore Catalog" button plus arrow square bottom-left (cookie card bottom-right).
- **mammoet:** Navy page with a nav row ending in a red full-height "Get In Touch" block, a left-aligned four-line heavy uppercase headline with a short paragraph and scroll cue, and a right-hand collage of four overlapping photos with red colour blocks.
- **sarens:** Short (about 480px) full-width photo slider with white nav over the image, a light tagline and two square RENT (yellow) / BUY (blue) tiles at left, arrows at the sides, then a grey intro paragraph with a drop cap (Cookiebot banner covers the lower third).
- **ainscough:** White header with round logo left, phone and yellow "Get a Quote" button top-right and a spaced uppercase nav beneath, then a 480px photo band with a centred white uppercase title and "scroll down" cue (cookie bar at the bottom).

## 7. Files

Screenshots: `docs/research/refs/<site>-desktop.jpg` and `-mobile.jpg` (JPEG q70), `docs/research/refs/board.jpg`. Scripts: `.work/refs/measure.js`, `refine.js`, `extra.js`, `e2.js`, `board.js`.
