# Frontend design

How the CMU Research frontend looks and behaves, and why. Read this before adding a page, a component or a colour.

- **Code:** `apps/web` (React, Vite, Tailwind)
- **Tokens:** `apps/web/src/index.css` (`:root`) and `apps/web/tailwind.config.js`
- **Shared components:** `apps/web/src/components/ui/`

**Keep this doc current. Any design changes should be updated here!**

## Colour

Tokens are RGB channels on `:root` in `index.css` (for example `--canvas: 247 246 244;`). Tailwind exposes them as `rgb(var(--x) / <alpha-value>)`, so opacity modifiers like `bg-accent/35` work. Use the token classes, never raw hex values.

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#F7F6F4` | Page background |
| `surface` | `#FFFFFF` | Nav, cards, panels, inputs |
| `surface-muted` | `#F1F0ED` | Hover rows, chips, segmented-control track |
| `hairline` | `#E7E5E1` | 1px borders and dividers |
| `hairline-strong` | `#D6D3CE` | Input borders, hovered card borders |
| `ink` | `#18181B` | Headings and primary text |
| `ink-secondary` | `#52525B` | Body text and descriptions |
| `ink-muted` | `#6B6B73` | Metadata, labels, placeholders, icons |
| `accent` | `#62849E` | Focus rings, link underlines |
| `accent-strong` | `#486B84` | Primary buttons, accent text, active nav text |
| `accent-muted` | `#A4BACC` | Scrollbar thumb |
| `accent-bg` | `#ECF3F9` | Active nav pill, accent badges, icon-button hover |
| `positive` / `positive-bg` | `#15803D` / `#ECFDF3` | "Paid" badge |
| `warning` / `warning-bg` | `#B45309` / `#FFF7ED` | Reserved; not used yet |
| `danger` / `danger-bg` | `#B91C1C` / `#FEF2F2` | Errors and destructive buttons |

**Contrast.** AA needs 4.5:1 for text and 3:1 for focus indicators.

| Pairing | Ratio |
|---|---|
| `ink-secondary` on `canvas` / `surface` | 7.2 / 7.7 |
| `ink-muted` on `canvas` / `surface` / `surface-muted` | 4.9 / 5.3 / 4.6 |
| White on `accent-strong` (primary button) | 5.7 |
| `accent-strong` on `canvas` / `accent-bg` | 5.2 / 5.1 |
| `accent` on `canvas` (focus ring) | 3.7 |
| `positive` on `positive-bg` | 4.8 |

`accent` itself is too light for text (3.7:1). Use `accent-strong` for any accent-coloured text or filled button.

## Typography

Geist 400/500/600 and Geist Mono 400/500, loaded from Google Fonts with preconnected `<link>` tags in `index.html`. The root font size is 14px.

| Class | Size / line height | Tracking | Weight | Use |
|---|---|---|---|---|
| `text-display` | 36/40 (28/32 below `sm`) | −0.03em | 600 | Opportunity page title |
| `text-title` | 28/32 | −0.025em | 600 | Every page's h1 |
| `text-heading` | 18/24 | −0.015em | 600 | Panel, empty-state and modal headings |
| `text-card-title` | 16/22 | −0.01em | 600 | Card titles |
| `text-lead` | 15/22 | 0 | 400 | Reading paragraphs, page subtitles |
| `text-body` | 14/20 | 0 | 400 | UI text (the `body` default) |
| `text-small` | 13/18 | 0 | 400 | Controls, tags, table cells |
| `text-meta` | 12/16 | 0 | 400/500 | Mono data (400) and labels (500) |

- **Tracking** tightens as size grows. Mono is never tracked.
- **Mono word spacing** is pulled in (`word-spacing: -0.3em`) so phrases like "Spring 2027" read as one unit.
- **No fake styles.** `font-synthesis: none`. Geist ships no italic, so nothing is italic.
- **No OpenType features.** The Google subset has no tabular figures or stylistic sets. Leave `frac` off, or dates turn into fractions.
- **Wrapping.** Headings use `text-wrap: balance`. Paragraphs, list items and `dd` use `text-wrap: pretty`.
- **Measure.** Reading text is capped at `max-w-measure` (40em, about 85 characters). Use `em`, not `ch`, because Geist's zero is wide.
- **Links in running text** use `linkUnderline` or `linkHoverUnderline` from `ui/linkClass.ts`: a 1px rule 0.22em below the baseline.

## Spacing, shape, depth and motion

**Spacing.** `theme.spacing` is redefined in pixels on a 4px grid with 2px half-steps: `p-4` is 16px, `p-0.5` is 2px, `p-2.5` is 10px. Tailwind's default rem steps would land on fractions (10.5px, 17.5px) with the 14px root. Use 1–3px values only for hairline offsets and optical nudges.

- **Page tops:** the first ink on every page sits 32px below the nav.
- **Cards:** `pt-4 px-5 pb-5`. The title's line height adds space above its capitals, so this reads as even padding.
- **Section labels** sit about 15px above the first ink of their content: `mb-2` before boxed content, `mb-0.5` before plain text.
- **Chips** (tags, filter chips, the add-interest input) are 24px tall.

**Radii.** `rounded-surface` 14px for cards, panels and modals. `rounded-control` 10px for inputs, buttons and the nav pill. `rounded-chip` 6px for tags and badges.

**Shadows.** Surfaces are flat with a hairline border.

| Class | Use |
|---|---|
| `shadow-card-hover` | Hovered interactive cards (a soft blue-tinted lift) |
| `shadow-popover` | Menus and popovers |
| `shadow-accent` | Primary buttons (a faint 1px lift) |

**Motion.**
- Transitions are 150–200ms with `ease-out` (`--ease-out`). Use `ease-in-out` for movement on screen and `ease-drawer` for drawers.
- `animate-dropIn` for menus and popovers; `animate-fadeIn` for overlays.
- **Pressed states.** Text controls (buttons, nav links, the segmented control) darken their fill when pressed. They never scale, because scaling moves text onto a different pixel grid and the label visibly jumps. Icon-only buttons and the avatar may scale slightly (`active:scale-[0.94]`).
- Respect `prefers-reduced-motion`: `motion-reduce:transition-none` on transitions, and the sign-in animation stops.

**Focus.** `focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-canvas`, shown for keyboard focus only.

**Nav height.** `--nav-h: 56px`, available as the spacing value `nav` (`h-nav`, `top-nav`, `pt-nav`). `html` has `scroll-padding-top` of the nav height plus 16px, so focused elements scrolled into view stop below the nav.

## Icons

- **Beside text,** use the cropped icons exported from `ui/icons.tsx`, for example `<CalendarIcon size={12} />`. Each is a MUI icon cropped to its visible ink, so gaps and padding measure from the shape you see. `size` is the ink height. Add new icons there with `cropped()` and the glyph's ink box from its path data.
- **Alone** (icon buttons, avatars), plain MUI icons are fine.
- **New icons** come from MUI, preferring the `*Outlined` variants. `react-icons` remains only in `NotFoundPage`.
- **Colour:** `ink-muted` by default; `ink` or `accent-strong` when active.

**Spacing rules for icon + text.** These are measured ink to ink, so they may use any whole pixel.
- **Gap:** `gap-[5px]` at 13–14px text, `gap-1` at 12px.
- **Size:** glyph icons are about 1.3× the cap height, so wide glyphs (book, mail, school) come out shorter. Arrows, chevrons and plus signs are about 1× the cap height.
- **Padding on the icon side** of a chip or button is about 0.85× the text side: `ps-[11px]` on small buttons and nav pills, `ps-[14px]` on medium buttons, `ps-[7px]` on badges.

## Components

Every component takes `className`, merged with `cx()` from `ui/cx.ts`, which joins truthy strings.

| Component | Props | Use for |
|---|---|---|
| `Button` | `variant`: `primary` · `secondary` (default) · `ghost` · `danger`; `size`: `sm` 32px · `md` 40px; `icon`, `iconRight` | Every action. Renders `<button>`. |
| `ButtonLink` | Same styling props, plus router `Link` props | Navigation that looks like a button. Never put a button inside a link. |
| `IconButton` | `aria-label` (required), `pressed` | Icon-only actions: bookmark, edit, close |
| `Input` | `icon`, `trailing`, `inputSize`: `sm` · `md`. `fieldClass` styles textareas and selects to match. | Text fields. 16px text below `sm`, so iOS doesn't zoom on focus. |
| `Surface` | `as`: `div` · `section` · `aside` · `article`; `interactive` | Cards and panels. `interactive` adds the hover border and lift. |
| `Badge` | `tone`: `neutral` · `accent` · `positive`; `icon` | Status labels, such as Paid (`positive`) |
| `Meta`, `MetaRow` | `Meta`: `icon`. `MetaRow` separates its children with `·`. | Mono metadata: dates, semesters, IDs, counts |
| `SectionLabel` | `as`: `h2` · `h3` · `p`; `collapsed`, `onToggle`, `action` | Section and filter-group headings. Holds a label and a count only, never buttons. |
| `DetailsTable` | `rows: { label, value, icon? }[]` | Key–value facts with row dividers |
| `Avatar` | `name`, `src`, `size`: `sm` 28px · `md` 40px; `decorative` | Photo, or initials on `surface-muted` |
| `EmptyState` | `title`, `titleAs`: `p` · `h1`; `icon`, `message`, `action` | No results, load errors, 404. Use `titleAs="h1"` when it's the whole page. |
| `Modal` | `title`, `footer`, `onClose`, `size`: `sm` · `lg` | Dialogs. A native `<dialog>` opened with `showModal()`: Escape calls `onClose`, the page behind is inert, and focus returns to the opener. |
| `SegmentedControl` | `value`, `onChange`, `options: { value, label }[]` | Two- or three-way choices (sort, compensation) |
| `Alert` | — | Inline errors, announced to screen readers |
| `Spinner` | `label` (default "Loading") | Loading states. Has `role="status"`. |
| `Kbd` | — | Keyboard hints, such as the search field's `/` |

`Tag` lives at `components/Tag.tsx`. It takes `keyword` (college names are shown abbreviated) and an optional `onRemove`, and renders a `<span>`, so it can sit inside a link.

**Hooks and helpers**
- `useSlashToFocus(ref)`: pressing `/` focuses the search field, unless you're typing in another text field. Shift is allowed, since some keyboard layouts need it to type `/`.
- `useBookmark(opportunityId)` in `lib/`: saved state for a listing, shared by cards and the opportunity page. A failed save rolls back.
- `useEffectiveSession()` in `lib/`: the signed-in session, or the mock session in mock mode.

## Layout and pages

**App shell.** Signed-out visitors see the sign-in page at any URL. Signed-in pages share `MainLayout`: a fixed nav, the page, then a footer (hidden on search).

**Nav.** It stays fixed at the top; it doesn't hide on scroll.
- **Left:** the logo, linking to `/`.
- **Centre:** Search, plus Dashboard for professors. The active tab is an `accent-bg` pill with `accent-strong` text. On phones the tabs are icon-only, with their labels kept for screen readers.
- **Right:** the avatar menu with name, email, then "View public profile" (professors) or "Manage account" (students), and "Sign out".

**Search (`/`).**
- **Filter sidebar:** 296px wide, with College, Department, Education, Semester and Compensation groups. Each group header collapses its group and shows a Reset action when the group is active. "Reset all filters" is at the bottom.
- **Narrow screens:** below `lg`, the sidebar starts closed and opens over the results with a scrim that closes it on tap. When the sidebar is hidden, a "Show filters" button with an active-filter count sits before the search field.
- **Results column:** capped at 80rem with 32px gutters (48px from `xl`). It holds the title with a result count, the sort control, the search field with its `/` hint, active-filter chips (with "Clear all" when two or more are active), then the cards. The header scrolls with the results.
- **Cards:** the title is a stretched link covering the whole card, so the bookmark button isn't nested inside a link.
- **States:** a spinner while loading, "No opportunities match" when filters exclude everything, and "Couldn’t load opportunities" on a load error.

**Opportunity (`/info/:id`).**
- **Header:** Back, the title, a byline (contacts linked to their profiles · department · college), keyword tags, then Apply now and Save.
- **Body on wide screens:** a reading column (About, Prerequisites, Relevant links) beside a 340px side column (Details, Contact).
- **Body on phones:** Details comes first, then the reading sections, then Contact.
- **Related opportunities:** up to three listings that share a department or keyword, most overlap first. The section is hidden when nothing matches.

**Student profile (`/profile`, `/dashboard`).**
- **Content:** a profile header with avatar, name and a Details table (major, class, college, email), then bio, interests and skills, and experiences.
- **Editing:** all fields save through `POST /users/:id`. A failed save rolls back and shows an `Alert`, and so does a failed load.
- **Completion:** counts saved fields only (major, bio, interests, experiences).
- **Professors** visiting these routes are redirected to their public profile.

**Professor public profile (`/professor/:andrewId`).**
- **Content:** the profile header, bio and research areas, then the professor's real listings.
- **Your own profile:** shows a "Public profile" breadcrumb and a "Manage listings" action.
- **Read-only:** bio and photo, because the API has no professor save endpoint.

**Professor dashboard (`/professor-dashboard`).**
- **Purpose:** the professor's workspace for listings.
- **Actions:** "Add opportunity" and "View public profile" sit under the header. Primary actions come first and line up with the avatar.
- **Adding:** opens the "New opportunity" form, which submits with "Post opportunity". Discarding a filled-in form asks "Keep editing" or "Discard".
- **Deleting:** a listing asks for confirmation. A failed delete keeps the listing and says so.

**Sign-in.**
- **Layout:** a centred card on a slowly drifting colour mesh (lapis, pale wisteria and indigo white on `#EAF4FC`, from the "Saudade" palette).
- **How the mesh works:** only transforms animate, so it runs without repainting. A 2.5% grain hides colour banding. It stops under reduced motion. The styles are `.signin-backdrop` and `.signin-mesh` in `index.css`.

**404.** An `EmptyState` with a "Back to search" button.

## Working on the frontend

**Adding a colour:**
1. Add the RGB channels to `:root` in `index.css`.
2. Map the token in `tailwind.config.js` under `colors`.
3. Check its contrast against the surfaces it will sit on, and add it to §2.

**Adding a shared component:** put it in `components/ui/`, accept `className` and merge it with `cx()`, and add it to §6. Build from tokens, not raw values.

**Before opening a PR:** run `npm run build` and `npm run lint`. Check the change in mock mode as both a student and a professor, at phone and desktop widths, and using only the keyboard.
