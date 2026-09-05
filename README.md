# Krist — Shopping Ecommerce (Angular)

Angular implementation of the **Krist – Shopping E-Commerce Web UI Kit** Figma file.
No backend: products, reviews, addresses and orders come from typed mock data, and the
cart / wishlist / addresses live in signals persisted to `localStorage`.

## Running

```bash
npm install
npm start          # http://localhost:4200
npm test           # Vitest unit tests
npm run build      # production bundle into dist/krist
```

Angular 22, standalone components, zoneless change detection, signals, the built-in
control flow (`@if` / `@for` / `@switch`), and plain SCSS — no UI library.

Every component keeps its template and its styles in files of their own next to the class —
`foo.ts`, `foo.html`, `foo.scss` — so markup and styles are reachable by the tools that
understand them rather than living inside template literals.

## Screens

| Route | Screen |
| --- | --- |
| `/` | Home — hero, categories rail, bestsellers, deals countdown, testimonials, Instagram |
| `/shop` | Catalogue — category / price / colour / size facets, sorting, grid–list toggle, pagination |
| `/product/:slug` | Product — gallery, colour & size pickers, Descriptions / Additional Information / Reviews tabs, related products |
| `/cart` | Cart table with quantity steppers and the order summary |
| `/checkout/address` | Shipping address — saved addresses plus the "add a new address" form |
| `/checkout/payment` | Payment method — card form, Google Pay, Paypal, Cash on Delivery |
| `/checkout/review` | Review order, then the "Your order is confirmed" dialog |
| `/profile/*` | Personal Information, My Orders (search + status filter), My Wishlists, Manage Addresses, Saved Cards, Notifications feed, Settings (working theme + language) |
| `/login`, `/signup`, `/forgot-password`, `/otp`, `/password-changed` | Auth split-screens |
| `/our-story` | Story — lead, hero, mission, values, stats, CTA |
| `/blog` | Blog — post grid with tag, date and read time |
| `/contact` | Contact — details plus a validated message form |

## Structure

```
src/styles/            design tokens (_tokens.scss) and breakpoint mixins
src/app/core/          models, mock data, signal stores (cart, wishlist, account, catalog)
public/svg/            one SVG file per icon, loaded by name through IconRegistry
src/app/shared/ui/     icon + registry, select, product card, star rating, qty stepper,
                       modal, order summary, checkout steps, address form, pagination…
src/app/shared/t.pipe.ts   the `| t` translate pipe
src/app/layout/        header with mega menu, footer, shell
src/app/features/      one folder per screen
```

## Swapping in the real assets

Four things are stand-ins for artwork we could not export from Figma:

- **Photography** — `src/app/core/data/products.ts` and `content.ts` point at
  `picsum.photos` seeds. Replace the `img()` helper and the seed URLs with your own
  paths (e.g. `/assets/products/…`) once the exports are available.
- **Typography** — the kit uses *Causten*, which is not a free web font. The app loads
  **Jost** from Google Fonts as the closest geometric match. To switch, change the
  `<link>` in `src/index.html` and `--font` in `src/styles/_tokens.scss`.
- **Logo** — `src/app/shared/ui/logo.ts` draws a geometric approximation of the Krist
  mark; drop the real SVG export in to make it exact.
- **Payment marks** — `shared/ui/payment-mark.ts` (footer: Visa, Mastercard, Google Pay,
  Amex, PayPal) and `shared/ui/card-brand.ts` (saved cards: Visa, Mastercard) draw
  recognisable shapes in the right brand colours, not the official artwork. Each mark is an
  inline SVG on its own white plate, because those colours are fixed and would not survive
  the dark theme unbacked. Replace both with the licensed files before this goes anywhere
  real.

## Markup validation

Every `<img>` carries `width` and `height` matching the source's intrinsic size, so the
browser reserves the box from the ratio before the file lands. Most of them sit in a
container that already pins both axes, but the attributes cost nothing and cover the cases
that don't.

All 22 screens were run through the W3C Nu Html Checker — the rendered DOM of a production
build, not the shell `index.html`, since everything here is client-rendered. Every finding
in our own markup is fixed: `<base>` ordering, a heading nested inside a button, four
heading-level skips, a `role="tab"` with no `role="tabpanel"`, a page with no `h1`, and
several headingless `article`/`section` elements. Filter groups now follow the accordion
pattern — `<h2><button aria-expanded>` — which keeps them in the outline without putting
flow content inside a button, and the catalogue carries a visually hidden `h1` because the
kit gives it no visible title.

What the checker still reports is not ours to fix:

| Count | Cause |
| --- | --- |
| 4745 | `_ngcontent-*` / `_nghost-*` — Angular's style-scoping attributes, present in production too |
| 915 | `routerlink`, `routerlinkactive` — directive selectors written as attributes |
| 99 | Nu's CSS parser does not yet know `@container`, `container-type` or `cqi` units |
| 28 | `formcontrolname`, `formgroup` — same as routerLink |

The directive attributes disappear if every one is rewritten as a property binding
(`[routerLink]="'/shop'"`), but the 4745 scoping attributes do not, so the pages would still
not validate clean. No Angular app with emulated view encapsulation does.

## Sessions

`core/auth-store.ts` records who is signed in, persisted like the cart so a reload keeps
the session. There is no backend, so it only records *that* someone signed in — any
well-formed credentials are accepted. Swap the body of `signIn` for the real call and every
reader of `isAuthenticated` keeps working.

`/profile` and its children sit behind `core/auth-guard.ts`. Guarding the parent covers all
seven screens, since they are only reachable through it. A guest is sent to the login form
with the attempted URL in `returnUrl`, and the form navigates there afterwards — asking a
visitor to sign in should not also cost them the page they were going to.

What changes with a session:

| | Guest | Signed in |
| --- | --- | --- |
| Header | Sign In button | wishlist tool + profile tool |
| `/profile/*` | redirected to `/login?returnUrl=…` | reachable |
| Cart | open | open |

The cart deliberately stays open to guests: filling one before signing in is normal, and
checkout is where an account would be asked for. The wishlist is the other way round — it
is a profile screen, so its header shortcut only appears with a session. Signing out lives
at the bottom of the profile rail and returns to the home page.

## Theme and language

Both are driven from **Profile → Settings** and persist per browser.

**Appearance** (`core/theme-store.ts`) stamps `data-theme` on `<html>`:

| Choice | Attribute | Palette |
| --- | --- | --- |
| Light | `data-theme="light"` | light tokens |
| Dark | `data-theme="dark"` | dark tokens |
| System | none | follows `prefers-color-scheme`, live |

The kit ships no dark frames, so the dark palette is derived: neutrals invert around the
same steps, and the primary action flips to a light chip on a dark ground so buttons keep
their contrast. Both palettes live in `src/styles/_tokens.scss` — nothing else hard-codes
a colour.

**Language** (`core/i18n/`) is a runtime dictionary lookup rather than Angular's
build-time i18n, because the mockup switches locale from a dropdown, not a URL.

- `en.ts` is the source of truth. `uk.ts` is typed `Record<TranslationKey, string>`, so a
  missing translation fails the build.
- In a template use the `t` pipe — `{{ 'nav.home' | t }}`, or with placeholders,
  `{{ 'cart.remove' | t: { name } }}`. In a class, inject `I18n` and call `translate()`.
- The pipe is pure. Switching language rebuilds the view tree from `App` (the router
  outlet is keyed on the language), which drops the cached values along with the pipe
  instances.
- Adding a locale is one dictionary file plus one line in `LANGUAGES`. Only locales with a
  complete dictionary are listed, so the dropdown never offers a dead option.

Catalogue content — product names, brands, the marketing lorem — deliberately stays in
`data/` in one language: in a real store that comes from the backend per locale, not from
the UI bundle. Facet labels, section copy and every piece of chrome are translated. Prices
stay formatted as USD in `en-US`.

## Form controls

Every dropdown is `shared/ui/select.ts`, not a native `<select>`: the browser paints the
native option list with the OS palette, which is unreadable against the dark theme. The
component renders the list in-page from our own tokens and comes in three variants —
`field` (bordered, matches `.control`), `soft` (grey pill, settings rows) and `plain`
(bare text and caret, shop toolbar).

It implements `ControlValueAccessor`, so it works both standalone via `[(value)]` and
inside reactive forms via `formControlName`. Keyboard support: arrows to move, Enter or
Space to choose, Home/End to jump, Escape to close, and it closes on an outside click.
The panel is capped at `min(20rem, 100vw - 2.5rem)` so it can never grow past the viewport
gutters, and long labels wrap inside that cap instead of widening it.

## Carousels

The category and testimonial rails on the home page are Swiper (`swiper/element`), wrapped
in `shared/ui/carousel.ts` so both share one config path and `register()` runs once. The
wrapper exposes `prev()` / `next()` for the arrow buttons the design puts in the section
header, and takes `perView` plus a `breakpoints` map — categories go 1.2 → 2 → 3 → 4 across
the breakpoints, testimonials 1.1 → 2 → 3. Dragging, keyboard and the a11y module are on.

## Header and mobile menu

Below 1024px the nav collapses into a drawer: the burger sits on the right of the tool row,
the sign-in action moves out of the bar and into the bottom of the drawer (capped at
250px), and `Shop` expands into an accordion where one category group is open at a time.
On a device that can hover, the desktop mega menu opens on hover with a short grace period
so the pointer can travel from the trigger to the panel; click still works everywhere.

The drawer is a right-hand panel, `min(100%, 25rem)` wide, that slides in from the edge.
It is absolutely positioned, so `.header` keeps the height of its bar alone and `top: 100%`
lands on the bar's bottom edge; `height: calc(100dvh - 100%)` then resolves the percentage
against that same height, so the panel runs to the bottom of the viewport whatever the bar
happens to measure — no gap underneath, and no page shift when it opens.

It stays mounted rather than being created on open, so the slide-out animates as well as
the slide-in: `transform` carries the motion and `visibility` does the hiding, delayed by
the length of the slide. `inert` keeps the shut panel out of the tab order and the
accessibility tree. Parked off the right edge it would widen the page, so `.header` takes
`overflow-x: clip` — `clip` rather than `hidden` because it does not create a scroll
container, which leaves `overflow-y: visible` intact for the mega menu and the search
field below.

The panel scrolls on its own with `overscroll-behavior: contain`, opening it puts
`is-locked` on `<body>` so the page behind cannot scroll, and a backdrop fades in over the
rest of the page — click it, press Escape, or hit the burger (now a close button) to
dismiss. The search field is absolute for the same no-page-shift reason, and the two are
mutually exclusive.

Collapsible sections animate their height with `grid-template-rows: 0fr -> 1fr`, the one way
to transition to a height nobody has measured. The content stays mounted so closing animates
too, and `visibility` keeps it out of the tab order while it is shut.

## Icons

The set is a folder of files, not a switch statement: one SVG per glyph under `public/svg/`,
registered by name in `shared/ui/icon-registry.ts` and rendered by `<app-icon name="…" />`.
Adding a glyph is a file plus a line in `ICONS`; nothing else changes.

`ICONS` is declared `as const`, so `IconName` is derived from it — a typo in a template
fails the build rather than rendering a blank box. An entry can override the filename
(`file`) or add a cache-buster (`version`) for a glyph that gets redrawn.

`IconRegistry.get(name)` returns a signal that starts null and fills in when the file
lands. It is created once per name and shared by every instance that asks, so a page with
sixty-eight icons across twenty-one distinct glyphs makes twenty-one requests, not
sixty-eight. On a server there is nothing to fetch and the signal simply stays empty.

Two consequences worth knowing. The markup arrives through `innerHTML`, which carries no
style-scope attribute, so `Icon` turns encapsulation off and prefixes every selector with
`.app-icon` — a scoped `svg { … }` rule would never have matched. And the host reserves
`--icon-size` in both axes up front, so a glyph still in flight holds its place instead of
shifting the row when it arrives.

Trusting the fetched markup (`bypassSecurityTrustHtml`) is safe here because only bundled
assets are ever registered; nothing user-supplied reaches it.

### Scale

`app-icon` takes `size` in px and emits it as rem. Two tiers:

| Tier | Size | Where |
| --- | --- | --- |
| Icon | 24 | everything that carries meaning — icon-only buttons and links, block icons, and icons sharing a line with a label |
| State caret | 20 | chevrons reporting open/closed — select, accordions, filter panels, breadcrumb separator |

Every control holding one is at least 48×48, so the boxes are sized for the hit area rather
than the glyph: pagination, quantity steppers, the cart's remove button and the footer's
submit are all `3rem`. Star ratings are the exception — they are typographic, so they track
the text they sit next to (14–24) rather than the icon scale.

The header's icon controls answer both hover and focus with the same cue: a round plate
scales up behind the glyph while the glyph itself lifts slightly, so a keyboard user gets
the control lighting up and not just a ring drawn around it.

## Product cards

Each card is a **subgrid** spanning four rows of its parent grid, so the brand, name and
price lines land on the same baseline across a row however long an individual title runs.
The parent only needs its columns and a row gap; the card overrides the inherited row gap
so its own four tracks stay tight.

Actions adapt to the input device rather than assuming a mouse:

- `(hover: hover) and (pointer: fine)` — the kit's behaviour: tools and the cart button
  fade in over the image on hover.
- `(hover: none), (pointer: coarse)` — the tools are always visible and the cart button is
  a real full-width button under the image. On touch a tap on the card navigates, so a
  hover-only control would be unreachable.

## Responsive strategy

Component breakpoints are **container queries**, not viewport queries. `.container` (the
page gutter) declares `container-name: page`, and the profile content column declares
`container-name: panel`, so a grid reacts to the width it actually has — the same card
behaves correctly inside a full-width page and inside the narrower profile panel.

The profile shell uses that context for a layout change, not just a resize, and works the
way `mat-sidenav-container` does. Above 56rem the rail is simply the first grid column of
`.profile`, sticky under the header. Below it the rail switches to *over* mode: it parks off
the left edge, slides across the content on `transform`, and sits on a backdrop. Neither the
drawer nor the backdrop is in the flow, so opening the rail never moves the page, and the
trigger sits above the container so the drawer cannot cover it. It closes on a link, the
backdrop, an outside click or Escape.

One departure from the Material original: the drawer is pinned to the **viewport**, not to
the container. The profile section starts a few hundred pixels down a scrolling page, so a
container-anchored panel pushed the tail of the section list below the fold — and with the
page scroll locked, out of reach. Pinned to the screen it always has the full height, and
scrolls inside itself if it ever runs out.

That works because `container-type: inline-size` on the page gutter does **not** make it the
containing block for fixed descendants. Style and layout containment would; inline-size
containment alone does not. Worth knowing, because if it did, this drawer would silently
resolve against the gutter instead of the screen.

Page scroll is locked while the drawer is open. Two overlays can hold that lock — the site
drawer and this one — so `core/scroll-lock.ts` counts holders rather than toggling a class,
and the lock only lifts once the last one lets go.

Three things stay viewport media queries on purpose:

- the header and footer, which are page chrome rather than components in a column;
- the auth split screen, which is defined against the viewport itself;
- capability queries — `hover`, `pointer`, `prefers-reduced-motion` — which are not about
  width at all.

## Units

All CSS lengths are in `rem` (16px base), including media-query breakpoints, so the whole
layout scales with the reader's browser font size. `app-icon` takes its `size` input in px
for readability and emits it as rem.

## Persisted state

Stores write through `persistentSignal(key, initial, version)`, which wraps the value in a
`{ v, d }` envelope. Bump the version whenever a stored shape changes: mismatched and
pre-envelope payloads are discarded rather than read back into a shape the app no longer
understands. Saved cards sit on v2 for exactly that reason.

## Tests

Specs live next to the code they cover:

- `cart-store.spec.ts` — cart merging, quantity edits, delivery charge, discount codes and their cap
- `catalog.spec.ts` — facets, sorting, paging and related-product selection
- `storage.spec.ts` — the versioned localStorage envelope, including discarding stale shapes
- `i18n/i18n.spec.ts` — lookup, placeholders, unknown keys, and that the locales stay in sync
- `theme-store.spec.ts` — the three appearance modes and live OS following
- `shared/ui/select.spec.ts` — the dropdown: mouse, keyboard, ARIA state and form binding

Layout is verified by eye against the Figma frames, not by snapshot tests.
