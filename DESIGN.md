# Design Brief

## Direction

Bistro Ember — a modern wood-fired bistro at dusk: dark warm charcoal canvas, terracotta fire, amber-gold price accents, editorial serif typography.

## Tone

Warm editorial luxury — a candle-lit dining room rather than a bright takeaway app; executed with conviction, not a timid blend.

## Differentiation

Prices and dish names are set in a high-contrast serif with amber-gold numerals, so the menu reads like a printed bistro carte while staying fully shoppable.

## Color Palette

| Token      | OKLCH           | Role                                              |
| ---------- | --------------- | ------------------------------------------------- |
| background | `0.17 0.016 48` | Dark warm charcoal canvas (dark mode primary)     |
| foreground | `0.94 0.012 72` | Cream text                                        |
| card       | `0.215 0.019 46`| Elevated dish/cart surfaces                       |
| primary    | `0.63 0.16 40`  | Terracotta — CTAs, active tabs, links             |
| accent     | `0.79 0.14 72`  | Amber-gold — prices, highlights, badges           |
| muted      | `0.26 0.02 46`  | Secondary surfaces, inactive chips                |

Light mode (`:root`) mirrors this on warm cream `0.965 0.012 78` with deep espresso text `0.22 0.028 45`; primary darkens to `0.53 0.155 38` for AA+ on cream.

## Typography

- Display: Fraunces — hero headline, section headings, dish names, wordmark
- Body: General Sans — paragraphs, UI labels, forms, buttons, nav
- Mono: JetBrains Mono — order reference numbers only
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-xs font-semibold uppercase tracking-[0.22em] text-primary`, body `text-base md:text-lg`

## Elevation & Depth

Layered warm surfaces: page → `bg-card` → `bg-popover`, separated by warm-tinted shadows (`shadow-warm`, `shadow-warm-lg`) never pure black; a subtle ember radial glow sits behind the hero.

## Structural Zones

| Zone    | Background            | Border     | Notes                                                        |
| ------- | --------------------- | ---------- | ------------------------------------------------------------ |
| Header  | `bg-card/90` + blur   | `border-b` | Sticky; serif wordmark left, nav + cart badge right          |
| Hero    | `bg-ember` gradient   | —          | Ember glow, eyebrow label, dual CTA, food image right        |
| Content | `bg-background`       | —          | Alternate `bg-muted/30` band per section; `texture-grain`    |
| Cards   | `bg-card`             | `border`   | Rounded-2xl, `shadow-warm`, image top, amber price footer    |
| Footer  | `bg-card`             | `border-t` | Hours, address, contact; muted text                          |

## Spacing & Rhythm

Sections separated by `py-16 md:py-24`; content grouped in `gap-6 md:gap-8` grids; micro-spacing `gap-2` for label→heading→body; generous whitespace around dish cards.

## Component Patterns

- Buttons: pill (`rounded-full`), terracotta `gradient-primary` primary with warm shadow; ghost/outline secondary; hover lifts `-translate-y-0.5`
- Cards: `rounded-2xl`, `bg-card`, `border-border`, `shadow-warm`, hover `shadow-warm-lg` + image `scale-105`
- Badges: pill, `bg-accent/15 text-accent`, used for price, category, cart count
- Inputs: `rounded-xl`, `bg-input/40`, terracotta focus ring

## Motion

- Entrance: `animate-fade-up` staggered 80ms per card; hero `animate-fade-in`
- Hover: `transition-smooth` (300ms) lift + shadow deepen; cart badge `animate-cart-pop`
- Decorative: `animate-ember-pulse` on the hero glow orb; no bouncy or looping UI motion

## Constraints

- Mobile-first; dish grid 1 → 2 → 3 columns; sticky cart summary on desktop checkout
- Tokens only — no hex/rgb literals or arbitrary color classes in components
- Dark mode is the primary experience; light mode must remain fully legible
- No live card processing, no accounts, no order history surfaces

## Signature Detail

Typographic: every price renders in Fraunces with amber-gold `text-accent` and tabular alignment, making the menu feel like a printed carte — category: typographic treatment.
