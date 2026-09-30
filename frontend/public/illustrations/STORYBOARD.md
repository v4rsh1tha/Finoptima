# Finoptima Illustration Storyboard v2

> Phase 1 analysis document. Audit of 41 SVGs, 11 components, 4 reference PDFs.
> Updated 2026-03-30.

---

## 1. Illustration Audit

### Style Families Present

| Style | Files | Primary Color | Detail Level | Consistency |
|-------|-------|--------------|--------------|-------------|
| **unDraw** | 34 files | #6c63ff (purple) | Flat, minimal | All match |
| **Storyset** | 7 files | Varies by sub-style | Rich, detailed | 4 sub-styles clash |

Storyset sub-styles present:
- **bro** (Finance, Business competition, Payment Information) — #263238 dark + #92E3A9 green
- **rafiki** (Credit card) — #407BFF blue
- **amico** (Credit card, Tax) — #BA68C8 purple
- **cuate** (Revenue) — #263238 dark + #FFC727 gold

**Decision: Use unDraw only.**
Mixing styles signals amateur design. unDraw's consistent flat style
recolors cleanly to our brand palette and won't compete with survey UI.
Storyset files are visually heavier (32–148KB) and fight for attention
on pages that need the user focused on tasks.

---

### Full Audit Table

| # | Filename | Depicts | Size | Accent Color | Suitability |
|---|----------|---------|------|-------------|-------------|
| 1 | undraw_choose-card_es1o.svg | Person choosing between credit cards | 6KB | **Recolored** | **HERO** |
| 2 | undraw_credit-card-payments_y0vn.svg | Hand holding card with confirmation | 15KB | **Recolored** | **Section** |
| 3 | undraw_make-it-rain_vyg9.svg | Two people celebrating with money | 8KB | **Recolored** | **Section** |
| 4 | undraw_business-analytics_y8m6.svg | Person analyzing data dashboards | 8KB | **Recolored** | **Section** |
| 5 | undraw_personal-information_h7kf.svg | Person next to profile form | 6KB | **Recolored** | **Section** |
| 6 | undraw_questions_52ic.svg | Person thinking with question marks | 12KB | **Recolored** | **Card** |
| 7 | undraw_server-error_syuz.svg | Server rack with error state | 2KB | **Recolored** | **Error** |
| 8 | undraw_page-not-found_6wni.svg | Person looking at 404 screen | 24KB | **Recolored** | **Error** |
| 9 | undraw_mobile-payments_uate.svg | Phone with payment interface | 11KB | #6c63ff | Reserve |
| 10 | undraw_credit-card-payment_3zqz.svg | Person tapping card on terminal | 15KB | #6c63ff | Reserve |
| 11 | undraw_pay-online_806n.svg | Woman at computer making payment | 10KB | #6c63ff | Reserve |
| 12 | undraw_calculator_os9t.svg | Calculator scene | 9KB | #6c63ff | Skip — tool, no personality |
| 13 | undraw_payments_nbqu.svg | Person with mobile + card | 11KB | #6c63ff | Skip — too generic |
| 14 | undraw_personal-finance_xpqg.svg | Person managing finances | 12KB | #6c63ff | Skip — tall ratio |
| 15 | undraw_inflation_ht0o.svg | Upward chart, anxious tone | 12KB | #6c63ff | Skip — negative mood |
| 16 | undraw_questions_52ic (1).svg | Duplicate of #6 | 12KB | #6c63ff | Skip — duplicate |
| 17 | undraw_pay-with-credit-card_77g6.svg | Card payment action | 7KB | #6c63ff | Skip — extreme landscape |
| 18 | undraw_credit-card_t6qm.svg | Standalone card | 6KB | #6c63ff | Skip — no human |
| 19 | undraw_opinion_bp12.svg | Person giving feedback | 10KB | #6c63ff | Skip — wrong context |
| 20 | undraw_navigator_2ntl.svg | Person with map | 10KB | #6c63ff | Skip — wayfinding |
| 21 | undraw_shopping-app_b80f.svg | Shopping app with cart | 15KB | #6c63ff | Skip — ecommerce |
| 22 | undraw_online-wishes_cb5x.svg | Person shopping online | 5KB | #6c63ff | Skip — generic |
| 23 | undraw_web-shopping_xd5k.svg | Web shopping interface | 11KB | #6c63ff | Skip — redundant |
| 24 | undraw_online-groceries_n03y.svg | Online grocery shopping | 7KB | #6c63ff | Skip — category-specific |
| 25 | undraw_connected-world_anke.svg | Global network diagram | 35KB | #6c63ff | Skip — too abstract |
| 26 | undraw_beach-day_cnsv.svg | People at beach | 7KB | #6c63ff | Skip — lifestyle |
| 27 | undraw_eating-together_mr7m.svg | People dining together | 15KB | #6c63ff | Skip — off-brand |
| 28 | undraw_aircraft_usu4.svg | Airplane | 5KB | blue/gray | Skip — no card context |
| 29 | undraw_electric-car_vlgq.svg | EV with person | 39KB | #6c63ff | Skip — transportation |
| 30 | undraw_city-driver_kgk7.svg | Driver in city | 16KB | #6c63ff | Skip — transportation |
| 31 | undraw_luggage_k1gn.svg | Travel luggage | 6KB | #6c63ff | Skip — props only |
| 32 | undraw_on-the-way_zwi3.svg | Person traveling | 10KB | #6c63ff | Skip — extreme landscape |
| 33 | undraw_at-the-airport_z3b9.svg | People at airport | 26KB | #6c63ff | Skip — no card |
| 34 | undraw_golf_wmi1.svg | Person golfing | 31KB | #6c63ff | Skip — sports |
| 35 | Credit card-rafiki.svg | Card interaction (Storyset) | 26KB | #407BFF | Skip — style mismatch |
| 36 | Finance-bro.svg | Finance figure (Storyset) | 148KB | #263238 | Skip — style mismatch |
| 37 | Credit card-amico.svg | Card scene (Storyset) | 32KB | #BA68C8 | Skip — style mismatch |
| 38 | Revenue-cuate.svg | Revenue chart (Storyset) | 80KB | #263238 | Skip — style mismatch |
| 39 | Business competition-bro.svg | Competition (Storyset) | 43KB | #263238 | Skip — style mismatch |
| 40 | Payment Information-bro.svg | Payment form (Storyset) | 44KB | #263238 | Skip — style mismatch |
| 41 | Tax-amico.svg | Tax calculation (Storyset) | 143KB | #BA68C8 | Skip — style mismatch |

**Recoloring status:** 8 primary SVGs already recolored to brand (#6c63ff → #1C5BC0, #3f3d56 → #1A1A2E). 26 unrecolored unDraw files remain as reserves.

---

## 2. Product Story Arc

The user journey is 8 pages with distinct emotional beats:

| Page | Component | Emotional Beat | Illustration? | Why |
|------|-----------|---------------|--------------|-----|
| 1. Landing | LandingPage.jsx | "You're overpaying. Better card exists." | **YES — hero + steps + CTA** | First impression. Must inspire. |
| 2. Login | Login.jsx | "Join us. Safe." | **NO** | Floating card silhouettes are complete |
| 3. Golden Question | GoldenQuestion.jsx | "What's your goal?" | **NO** | Binary choice must stay focused |
| 4. Welcome | WelcomeAnimation.jsx | "3 minutes. Let's go." | **NO** | Animation IS the visual |
| 5. Layer 1 | Layer1.jsx | "Who are you?" | **NO** | Form is the focus |
| 6. Layer 2 | Layer2.jsx | "How do you spend?" | **NO** | Interaction is the focus |
| 7. Layer 3 | Layer3.jsx | "How do you live?" | **NO** | Last step — momentum |
| 8. Results | Results.jsx | "Your perfect card." | **YES — celebration + states** | Emotional payoff |
| 9. 404 | NotFound.jsx | "Wrong turn." | **YES — personality** | Polish in edge cases |

---

## 3. Storyboard — Illustration Placements

### PLACEMENT 1 — Landing Page Hero

```
PAGE:             Landing
SECTION:          Hero (above the fold, right side)
ILLUSTRATION:     undraw_choose-card_es1o.svg
WHY:              Person actively choosing between cards — mirrors
                  "find the one built for you." User is the protagonist.
SIZE:             Large (480px width)
POSITION:         Right side, text left. Scale-in from 0.95.
COLOR TREATMENT:  Already recolored — #1C5BC0 primary, natural skin tones
SKIP IF:          viewport < 768px (text-only hero on mobile)
```

**Why this over others:**
- `credit-card-payment_3zqz.svg` shows paying, not choosing — wrong verb
- `make-it-rain_vyg9.svg` shows celebration — too early in the story
- `mobile-payments_uate.svg` shows a phone — product is web-first
- `choose-card` answers: "What will I do here?" → "Choose the right card."

---

### PLACEMENT 2 — Landing "How It Works" Step 1

```
PAGE:             Landing
SECTION:          How It Works — "Tell Us About You"
ILLUSTRATION:     undraw_personal-information_h7kf.svg
WHY:              Person next to profile form — matches survey entry.
SIZE:             Small (160px)
POSITION:         Center, above step title
COLOR TREATMENT:  Already recolored
SKIP IF:          Never
```

### PLACEMENT 3 — Landing "How It Works" Step 2

```
PAGE:             Landing
SECTION:          How It Works — "We Analyze Everything"
ILLUSTRATION:     undraw_business-analytics_y8m6.svg
WHY:              Person with charts — shows the engine working.
SIZE:             Small (160px)
POSITION:         Center, above step title
COLOR TREATMENT:  Already recolored
SKIP IF:          Never
```

### PLACEMENT 4 — Landing "How It Works" Step 3

```
PAGE:             Landing
SECTION:          How It Works — "Get Your Perfect Card"
ILLUSTRATION:     undraw_credit-card-payments_y0vn.svg
WHY:              Card + confirmation — the payoff moment.
SIZE:             Small (160px)
POSITION:         Center, above step title
COLOR TREATMENT:  Already recolored
SKIP IF:          Never
```

### PLACEMENT 5 — Landing CTA Banner

```
PAGE:             Landing
SECTION:          CTA section (pre-footer)
ILLUSTRATION:     undraw_make-it-rain_vyg9.svg
WHY:              Celebration imagery next to "Ready to optimize?"
                  Reinforces the reward of taking action.
SIZE:             Medium (280px)
POSITION:         Right side of CTA banner
COLOR TREATMENT:  Already recolored
SKIP IF:          viewport < 768px (text-only CTA on mobile)
```

---

### PLACEMENT 6 — Results Page Success Header

```
PAGE:             Results
SECTION:          Above recommendations heading
ILLUSTRATION:     undraw_make-it-rain_vyg9.svg
WHY:              Celebration — "we found your cards!" Emotional payoff
                  after 3 minutes of survey work.
SIZE:             Medium (240px)
POSITION:         Center, fade-in + scale from 0.8
COLOR TREATMENT:  Already recolored
SKIP IF:          API error or no data (show alternate states)
```

### PLACEMENT 7 — Results Empty State

```
PAGE:             Results
SECTION:          Empty state (no data)
ILLUSTRATION:     undraw_questions_52ic.svg
WHY:              Thinking person — "complete the survey first."
SIZE:             Medium (260px)
POSITION:         Center
COLOR TREATMENT:  Already recolored
SKIP IF:          Never — this IS the empty visual
```

### PLACEMENT 8 — Results Error State

```
PAGE:             Results
SECTION:          Error state (API failure)
ILLUSTRATION:     undraw_server-error_syuz.svg
WHY:              Honest about what happened. Better than text-only error.
SIZE:             Medium (240px)
POSITION:         Center
COLOR TREATMENT:  Already recolored
SKIP IF:          Never — this IS the error visual
```

### PLACEMENT 9 — 404 Page

```
PAGE:             404 / Not Found
SECTION:          Full page center
ILLUSTRATION:     undraw_page-not-found_6wni.svg
WHY:              Shows polish even at edge cases.
SIZE:             Large (380px)
POSITION:         Center, above "Go Home" CTA
COLOR TREATMENT:  Already recolored
SKIP IF:          Never
```

---

## 4. Landing Page Hero Design

### Headline Approach

```
Stop getting sold.              ← 48-56px, Plus Jakarta Sans 800, #1A1A2E
Find your perfect card.         ← Same size, "perfect card" in #1C5BC0
```

First line = HOOK (confrontational, relatable)
Second line = PROMISE (positive, personal)

Pattern from Finology Select: "Don't be a Sales Target" → product promise.

### Background Treatment

- Animated radial gradient (`heroGlow`): subtle blue shifting from 30% → 70% at 8% opacity, 8s cycle
- Gold layer: #E09E42 at 5% opacity drifting from bottom-left, 12s cycle
- 3 floating abstract circles behind illustration:
  - 300px at 6% #1C5BC0 opacity (top-right, floats 7s)
  - 200px at 7% #E09E42 opacity (bottom-right, floats 9s)
  - 150px at 4% #1C5BC0 opacity (mid-right, floats 6s)
- All circles hidden on mobile

### Entry Animations

- Headline line 1: fade-up 0.7s, delay 160ms
- Headline line 2: fade-up 0.7s, delay 280ms
- Subtext: fade-up 0.7s, delay 400ms
- Buttons: fade-up 0.7s, delay 480ms
- Trust bar: fade-up 0.7s, delay 560ms
- Illustration: scale 0.95 → 1.0, fade-in 0.9s, delay 350ms

---

## 5. Reference PDF Insights

### From Finology Select (3 PDFs analyzed)

**Card comparison layout pattern:**
- Horizontal cards: logo left, name + badges center, CTA right
- 4 stat columns per card (reward rate, fee, annual value, match)
- Feature/benefit pills with active (green ✓) and inactive (gray ✗) states
- "Full Details" expandable section per card
- Category badges: "Premium" / "Cashback" / "Co-Branded" in colored pills
- Trust metrics displayed prominently (pageviews, user count)

**Visual patterns to adopt:**
- Colored category grids (privilege cards page: 3x3 with icons)
- Income brackets as friendly circles, not intimidating forms
- Bold confrontational headline + illustration (hero)
- Dark navy footer contrasting with white content
- Generous whitespace — premium breathing room

**What Finoptima should evolve beyond:**
- Select uses generic stock icons → our unDraw illustrations add personality
- Select's pages are flat grids → our survey flow is interactive
- Select doesn't show a journey → our 8-page arc tells a story
- Select is an aggregator → Finoptima is a recommendation engine with opinion

---

## 6. Illustration Style Guide

### Selected (8 files, all recolored)

| # | File | Used On | Role |
|---|------|---------|------|
| 1 | undraw_choose-card_es1o.svg | Landing hero | Primary hero |
| 2 | undraw_personal-information_h7kf.svg | Landing Step 1 | Step icon |
| 3 | undraw_business-analytics_y8m6.svg | Landing Step 2 | Step icon |
| 4 | undraw_credit-card-payments_y0vn.svg | Landing Step 3 | Step icon |
| 5 | undraw_make-it-rain_vyg9.svg | Landing CTA + Results success | Celebration |
| 6 | undraw_questions_52ic.svg | Results empty | Empty state |
| 7 | undraw_server-error_syuz.svg | Results error | Error state |
| 8 | undraw_page-not-found_6wni.svg | 404 page | Not found |

### Reserve (3 files, not yet recolored)

| # | File | Potential Use |
|---|------|---------------|
| 9 | undraw_mobile-payments_uate.svg | If mobile section added |
| 10 | undraw_credit-card-payment_3zqz.svg | Alternative for Step 3 |
| 11 | undraw_pay-online_806n.svg | Alternative results header |

### Skipped (30 files)

**Style mismatch (7):** All Storyset files. Different visual language, heavy SVGs.
**Off-brand lifestyle (9):** beach, dining, aircraft, electric-car, city-driver, luggage, on-the-way, airport, golf.
**Redundant (8):** payments, personal-finance, pay-with-credit-card, online-wishes, web-shopping, online-groceries, shopping-app, credit-card-standalone.
**Wrong mood (3):** inflation, calculator, connected-world.
**Duplicate (1):** questions_52ic (1).svg.
**Not needed (2):** navigator, opinion.

### Color Treatment

All 8 selected SVGs have been recolored via direct hex replacement:

```
Original            → Brand           Elements
#6c63ff             → #1C5BC0         Primary shapes, clothing, UI elements
#3f3d56 / #2f2e41   → #1A1A2E         Dark elements (hair, devices, shadows)
#ff6884             → #E09E42         Accent highlights (where present)
Skin tones          → KEPT AS-IS      All skin-colored fills
#e6e6e6/#d3d3d3     → KEPT AS-IS      Neutral grays
#f2f2f2/#f5f5f5     → KEPT AS-IS      Light fills
```

### Size Scale

| Role | Width | Where |
|------|-------|-------|
| Large | 400-500px | Landing hero, 404 page |
| Medium | 240-320px | Results states, CTA banner |
| Small | 140-180px | How It Works step cards |

### Spacing Rules

- Hero illustration: 48px gap from text column
- Step icons: 20px margin-bottom to step title
- State illustrations: 24px margin-bottom to text below
- CTA illustration: right-aligned, no padding against section edge
- All illustrations: never touch viewport edge, minimum 24px breathing room

### What NOT To Do

1. **Do not mix unDraw and Storyset.** One visual language.
2. **Do not add illustrations to survey pages.** Forms need focus.
3. **Do not use illustrations to fill empty space.** Fix the layout.
4. **Do not resize below 120px.** Use emoji/icon instead.
5. **Do not use illustrations as backgrounds.** They are foreground.
6. **Do not animate illustration content.** Only animate entrance (fade/scale).
7. **Do not add drop shadows.** They are flat-style.
8. **Do not crop.** They have intentional negative space.
9. **Do not use more than one illustration per viewport** (except How It Works steps).

---

## Summary

```
Total illustrations available:   41
Selected for use:                 8  (all recolored to brand)
Held in reserve:                  3
Skipped:                         30

Pages that get illustrations:
  - Landing Page (hero + 3 step icons + CTA illustration)
  - Results Page (success + empty state + error state)
  - 404 Page

Pages that stay clean:
  - Login
  - Golden Question
  - Welcome Animation
  - Layer 1 Survey
  - Layer 2 Survey
  - Layer 3 Survey
  - ExistingCard
  - CardComparison
```

---

*Storyboard v2 — 2026-03-30*
