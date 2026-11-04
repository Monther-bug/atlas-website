# 04 Asset plan: photo crops and web sizes

Analysis only. Originals untouched. Scripts and scratch: `.work/assets/`. Data: `asset-crops.json`. Visual check: `asset-crops-preview.jpg`.

## Method
- Watermark model (verified by crop inspection on 6359, 6371, 6374, 6380, 6385, 6397): centred on x = w/2, y = h - 265·(w/4240), radius 135·(w/4240). **IMG_6371 is an exception** (centre 1416, 2618, radius 110). All crops keep at least 30 px (scaled) clearance; a script checks every rectangle (0 hits).
- Because the watermark sits at about 86% of frame height, every full-width crop is **anchored to the top** (bottom edge at about 84%). Two mobile crops (6393, 6392) are left-side crops clear of the logo.
- Rectangles are source pixels {left, top, width, height}.

## Crop table
| Photo | Class | Focal (x,y) | Desktop 16:9 (l,t w×h) | Mobile 4:5 | Mobile 9:16 | Clean export |
|---|---|---|---|---|---|---|
| 6359 | hero+fleet RT700E | 2332,1416 | 0,0 4240x2385 | 1160,0 1921x2401 | 1445,0 1351x2401 | No |
| 6360 | fleet RT700E | 2332,1133 | 0,0 4240x2385 | 1372,0 1921x2401 | - | Optional |
| 6363 | fleet RT700E | 1908,1274 | 0,0 4240x2385 | 948,0 1921x2401 | - | No |
| 6364 | fleet RT700E | 2120,1133 | 0,0 4240x2385 | 1160,0 1921x2401 | - | Optional |
| 6367 | fleet Kobelco (branding check) | 1908,1133 | 0,0 4240x2385 | 948,0 1921x2401 | - | No |
| 6370 | fleet Kobelco (branding check) | 2332,1416 | 0,0 4240x2385 | 1372,0 1921x2401 | - | No |
| 6371 | fleet Kobelco (branding check) | 1558,1133 | 0,0 2832x1593 | 421,0 1990x2487 | - | No |
| 6374 | hero+fleet AC200 | 2084,1114 | 0,0 4168x2344 | 1140,0 1889x2361 | 1420,0 1328x2360 | **Yes** |
| 6375 | fleet AC200 | 2120,1558 | 0,0 4240x2385 | 948,0 1921x2401 | - | Optional |
| 6376 | detail/fleet AC200 | 2120,1416 | 0,0 4240x2385 | 1160,0 1921x2401 | - | No |
| 6379 | detail/fleet AC200 | 2120,1416 | 0,0 4240x2385 | 1160,0 1921x2401 | - | No |
| 6380 | hero+fleet QUY250 | 2196,1411 | 0,0 4224x2376 | 1239,0 1914x2392 | 1524,0 1345x2391 | **Yes** |
| 6382 | detail/fleet QUY250 | 2120,1416 | 0,0 4240x2385 | 1160,0 1921x2401 | - | No |
| 6385 | fleet QUY250 | 2098,1402 | 0,0 4196x2360 | 1148,0 1901x2376 | - | Optional |
| 6388 | fleet GMK6350 | 2332,1274 | 0,0 4240x2385 | 1584,0 1921x2401 | - | No |
| 6389 | hero+fleet GMK6350 | 2756,1274 | 0,0 4240x2385 | 2008,0 1921x2401 | 2293,0 1351x2401 | **Yes** |
| 6392 | fleet GMK6350 | 1696,1416 | 0,0 4240x2385 | 0,388 1955x2443 | - | No |
| 6393 | detail/fleet GMK6350 | 1272,1699 | 0,0 4240x2385 | 0,388 1955x2443 | - | No |
| 6395 | fleet Faun | 2120,1416 | 0,0 4240x2385 | 1160,0 1921x2401 | - | Optional |
| 6396 | fleet Faun/site | 2120,1558 | 0,0 4240x2385 | 1160,0 1921x2401 | - | No |
| 6397 | fleet Faun | 1884,1398 | 0,0 4186x2354 | 935,0 1897x2371 | - | Optional |
| 6398 | hero | 2120,1416 | 0,0 4240x2385 | 1160,0 1921x2401 | 1445,0 1351x2401 | **Yes** |

All 66 crops are watermark-free. No crop is marked NOT POSSIBLE, but several lose the lower part of the machine (wheels, tracks) because it overlaps the logo band; these are listed below.

## Photos needing clean exports (no watermark) from the photographer
**Needed:** 6398 (hero, wheels and ground lost), 6389 (hero, wheels lost in every crop; 9:16 weak), 6374 (hero, counterweight base lost, 9:16 tight), 6380 (hero, track bottoms lost).
**Optional (nice to have):** 6395, 6397 (tyres and outriggers), 6364, 6385, 6360, 6375 (minor bottom loss).
6367, 6370 and 6371 (Kobelco) also need the ownership and second-company-logo check from the audit before use.

## File-size tests (sharp; AVIF q50 effort 4; WebP q72)
| Image | Width | AVIF KB | WebP KB | Target |
|---|---|---|---|---|
| 6398 desktop | 1920 | 76.6 | 109.0 | AVIF <= 220: pass |
| 6398 desktop | 1280 | 44.5 | 62.6 | - |
| 6359 desktop | 1920 | 70.6 | 97.0 | pass |
| 6359 desktop | 1280 | 42.3 | 58.2 | - |
| 6374 desktop | 1920 | 64.3 | 87.7 | pass |
| 6374 desktop | 1280 | 33.9 | 48.5 | - |
| Fleet card 6392 (16:9) | 800 | 23.8 | 36.8 | <= 80: pass |
| Fleet card 6393 (16:9) | 800 | 13.0 | 17.8 | pass |
| Mobile 6398 4:5 | 1080 | 68.5 | 100.4 | - |

All far under target, so quality can be raised (AVIF q60 to 65) for hero images if the sky banding is visible.

## Recommended hero
- **Desktop: IMG_6398**, crop {0,0,4240,2385}. Two cranes on the coast, large sky for headline text, strongest story (fleet plus site). Caveat: the wheels are cropped; request the clean export for a full-frame version. Fallback: **6359** {0,0,4240,2385} (yellow RT, empty sky left, no loss of key parts; cab base cut only).
- **Mobile: IMG_6359 9:16** {1445,0,1351,2401} (cab, boom and counterweight in one vertical frame, no watermark risk) or **6398 4:5** {1160,0,1921,2401} for the two-crane scene. 6374 9:16 {1420,0,1328,2360} is a good pinned-vertical option (boom plus TEREX lettering), pending the clean export.
