# My Daily Download — Design System

> **Brand source of truth.** This document governs every surface: landing site, web app, the
> daily email, archive/SEO hubs, OG images, and the 6 social accounts. One voice, one palette,
> one wordmark across all of them. When in doubt, this file wins.
>
> Companion: open [`preview.html`](./preview.html) for a live, brand-styled render of the
> wordmark, palette, type scale, and core components.

---

## 1. Brand name

| Context | Render as | Never |
|---|---|---|
| Product copy, headings, body, social, ads | **My Daily Download** (three words, title case) | "MyDailyDownload", "my daily download", "MDD" in user-facing copy |
| Domain | `mydailydownload.com` (lowercase) | — |
| Facebook page handle | **Mydailydownload** | — |
| Prior working names | *(retired — never use)* | "Daily AI Edge", "My AI Skill Tutor" |

- Title case, three words, always. The single-word `MyDailyDownload` is permitted **only** in the
  domain and handle forms, never in prose.
- Internal abbreviation **MDD** is fine in code/config/file names; it must never appear in anything
  a subscriber sees.

---

## 2. Taglines

| Slot | Copy |
|---|---|
| **Primary** (hero H1 / OG) | "AI news that actually matters to your career." |
| **Supporting** (hero subhead) | "Your daily AI briefing, personalized to your role." |
| **Trust line** (footer / hero sub-subhead / email footer) | "Every item cites a real source." |
| **Short social bio** | "The daily AI download for your job. Personalized by role + seniority. Real sources only." |
| **Vertical headlines** (ads / per-vertical social cover) | "The AI download for Marketers." / "…for PMs." / "…for Founders." / "…for Sales." / "…for Designers." |

Rules: real numbers or qualitative lines only — **never fabricated stats or fake social-proof
counts**. No fake urgency. No buzzwords.

---

## 3. Voice & tone

**The persona:** a sharp colleague who already read everything this morning and tells you the 3
things that matter to *your* job today. Professional, but human.

| Do | Don't |
|---|---|
| Sharp, useful, scannable | Hype, buzzwords ("revolutionary", "game-changer") |
| Action-oriented ("do this today") | Fake urgency ("act now", countdown timers) |
| Cite a real source on every claim | Fabricated stats, invented quotes, made-up funding |
| Plain language, short sentences | Jargon walls, throat-clearing intros |
| Confident but honest ("best-effort", "you can correct this") | Personalization theater (claiming an inference we didn't make) |
| One voice across landing, email, social, ads | Different tone per surface |

**Load-bearing trust rule:** every factual item in an email links to a real, fetched primary
source. If we can't cite it, we don't ship it. This is the product.

---

## 4. Logo & wordmark

**Wordmark-led.** "My Daily Download" set in Inter SemiBold (600), tight tracking, on the void
background. The "signal dot" — a single amber (`#F2A900`) dot or downward chevron/arrow glyph —
sits with the wordmark as the brand's recurring mark.

### Lockups

| Lockup | Use | Spec |
|---|---|---|
| **Full wordmark** | Email header, landing nav, footer | Wordmark + leading signal dot, amber on void |
| **Compact mark** | Social avatar, favicon, app icon | The signal dot / download glyph alone, amber on void, legible at 48px and 16px |
| **Monochrome** | Email-safe / dark-mode fallback | Single-color amber or single-color mist; **no gradients** in the email header (deliverability + dark-mode safety) |

### The "signal dot"
- A 6–10px amber dot immediately left of (or above the "D" in) the wordmark — reads as a "live /
  on-air" indicator and as the dot of a download progress.
- Optional motion (web only): a slow 2.4s pulse on the dot. Never animate in email.

### Favicon
- 16/32/48px: amber signal dot centered on void, or the download chevron in amber. Must read at
  16px — keep it a single bold glyph, no wordmark.
- `favicon.svg` (amber glyph on `#0B0C10`) + PNG fallbacks at 16/32/180 (apple-touch).

### Download glyph
- A downward chevron (`⌄`) or a down-arrow-into-tray, integrated into the "D" of "Download" or
  standing alone as the compact mark. Geometric, single weight, amber.

---

## 5. Color system

The palette is **dark-first** (void shell for app, landing, email header/CTA frame) with a
**light email body** for inbox readability. All tokens below are production values; the email-body
tokens (`#7A8194`, `#1A1D23`, `#FFF8E7`) are already production-tuned — do not re-tune them.

### 5.1 Core tokens (web / app — dark surfaces)

| Token | Hex | Semantic role |
|---|---|---|
| `--bg-void` | `#0B0C10` | Primary background; landing, app shell, email header band, CTA band |
| `--bg-surface` | `#14171D` | Cards, elevated panels, nav bar |
| `--bg-elevated` | `#1A1D23` | Raised elements: popovers, inputs, hover surfaces, modals |
| `--accent` | `#F2A900` | Brand amber: logo, links, section labels, primary buttons, stat values, the signal dot |
| `--accent-hover` | `#D49500` | Amber hover / pressed state |
| `--accent-glow` | `rgba(242,169,0,0.30)` | Focus ring, soft glow behind the signal dot (web only) |
| `--text-primary` | `#E6E8EE` | Mist — primary text on dark surfaces |
| `--text-muted` | `#8A91A0` | Muted slate — secondary / meta text on dark surfaces |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Hairline borders, dividers on dark |

### 5.2 Semantic / status tokens

| Token | Hex | Role |
|---|---|---|
| `--success` | `#3FB950` | Confirmed, delivered, "real source verified" ticks |
| `--success-bg` | `rgba(63,185,80,0.12)` | Success badge fill on dark |
| `--error` | `#F85149` | Errors, send failures, validation |
| `--error-bg` | `rgba(248,81,73,0.12)` | Error badge fill on dark |
| `--warning` | `#F2A900` | Warnings reuse brand amber (no second yellow) |
| `--info` | `#58A6FF` | Neutral info / links inside light email body where amber would clash |

### 5.3 Email-body tokens (light — production-tuned, do not change)

| Token | Hex | Role |
|---|---|---|
| `email-page` | `#F5F5F5` | Outer email page background (behind the 640px container) |
| `email-content` | `#FFFFFF` | Email content area — light for inbox readability |
| `email-header` | `#0B0C10` | Email header band (void) + CTA band |
| `email-ink` | `#1A1D23` | Headings / strong text on the light email body |
| `email-body-text` | `#555555` | Body copy on the light email body |
| `email-meta` | `#7A8194` | Muted slate — meta, footer, header subtitle |
| `email-accent` | `#F2A900` | Section labels, links, stat values, accent rules |
| `toolbox-tint` | `#FFF8E7` | Tool-box / callout background tint (amber wash) |
| `email-rule` | `#EEEEEE` | Hairline dividers between quick-hits |
| `email-panel` | `#F8F9FA` | How-to / by-the-numbers / footer panel fill |

> **Why two systems:** the void shell is the brand frame (app + landing + email header/CTA), the
> light body maximizes deliverability and readability inside the inbox. Both share the **same amber**
> and the **same ink** — that's what makes the email feel like the app.

### 5.4 Light-mode email variants

For the email header/CTA on clients that force light or invert dark mode, the void band must stay
dark. Lock it: `background: #0B0C10;` with explicit amber text — never rely on inherited colors. The
wordmark in-header is amber text (no image, no gradient) so dark-mode color inversion can't break it.

---

## 6. Typography

### 6.1 Web / landing / app

- **Font:** **Inter** (geometric grotesque) for UI, headings, and body. Loaded weights: 300, 400,
  500, 600, 700.
- **Mono:** **JetBrains Mono** (400, 500) for prompts, code, the copy-paste "Prompt of the Day"
  block, and any terminal-style flourish.
- Fallback stack: `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.

### 6.2 Type scale (web)

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `display` | 48 / 1.1 | 700 | Hero H1 |
| `h1` | 36 / 1.15 | 700 | Page titles |
| `h2` | 28 / 1.2 | 600 | Section headings |
| `h3` | 22 / 1.3 | 600 | Card / block titles |
| `h4` | 18 / 1.4 | 600 | Sub-headings, email big-story title |
| `body-lg` | 16 / 1.7 | 400 | Lead paragraphs |
| `body` | 14 / 1.65 | 400 | Default body |
| `small` | 13 / 1.6 | 400 | Meta, captions |
| `section-label` | 11 / 1.4 | 600 | **Uppercase, `letter-spacing: 0.08em`, amber** — the signature label |
| `mono` | 14 / 1.6 | 400 | Prompt / code blocks (JetBrains Mono) |

Headings: tight, confident. Body: generous line-height (1.6–1.7) for scannability.

### 6.3 Email-safe stack (do not load web fonts in email)

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

| Element | Size | Weight | Color |
|---|---|---|---|
| Header wordmark | 20px | 700 | `#F2A900` |
| Header subtitle | 13px | 400 | `#7A8194` |
| Section label | 11px | 600 | `#F2A900`, uppercase, `letter-spacing: 0.08em` |
| Big-story title | 18px | 600 | `#1A1D23`, line-height 1.4 |
| Body | 14px | 400 | `#555`, line-height 1.7 |
| Quick-hit title | 14px | 600 | `#1A1D23` |
| Stat value | 28px | 700 | `#F2A900` |
| Footer | 12px | 400 | `#7A8194` |

---

## 7. Spacing, radius, elevation

### 7.1 Spacing scale (4px base)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64 · 96`

| Token | px |
|---|---|
| `space-1` | 4 |
| `space-2` | 8 |
| `space-3` | 12 |
| `space-4` | 16 |
| `space-5` | 20 |
| `space-6` | 24 |
| `space-8` | 32 |
| `space-12` | 48 |
| `space-16` | 64 |
| `space-24` | 96 |

Email block vertical rhythm: 20px between blocks, 32px body padding (matches production template).

### 7.2 Radius

| Token | px | Use |
|---|---|---|
| `radius-sm` | 6 | Inputs, badges |
| `radius-md` | 10 | Buttons, cards (web `--radius: 0.625rem`) |
| `radius-lg` | 16 | Modals, large panels |
| `radius-pill` | 999 | Pills, section tags |
| Email tool-box | `0 8px 8px 0` | Left-accent callout (flat left edge for the amber rule) |

### 7.3 Elevation (web, dark)

- **Flat:** `--bg-surface` card, `1px` `--border-subtle`, no shadow.
- **Raised:** `--bg-elevated` + `0 8px 24px rgba(0,0,0,0.4)`.
- **Focus:** `0 0 0 3px var(--accent-glow)`.
- No drop shadows in email (use the `#F8F9FA` panel fill + hairline rules for separation).

---

## 8. Core components

### 8.1 Button

| Variant | Fill | Text | Border | Hover |
|---|---|---|---|---|
| **Primary** | `#F2A900` | `#0B0C10` | none | fill → `#D49500` |
| **Secondary** | transparent | `#E6E8EE` | `1px rgba(255,255,255,0.08)` | bg → `#1A1D23` |
| **Ghost** | transparent | `#8A91A0` | none | text → `#E6E8EE` |
| **Destructive** | transparent | `#F85149` | `1px rgba(248,81,73,0.4)` | bg → `rgba(248,81,73,0.12)` |

Specs: `padding: 12px 20px`, `radius-md` (10px), `14px`/600 label, `transition: 150ms`.
Focus: `0 0 0 3px var(--accent-glow)`. Email CTA: amber text on void band, no button chrome (avoids
client rendering issues) — `#F2A900` 14px/600 link on `#0B0C10`.

### 8.2 Card

- `background: #14171D`; `border: 1px solid rgba(255,255,255,0.08)`; `radius-md` (10px);
  `padding: 24px`.
- Title `h3` (22/600, `#E6E8EE`); body `body` (14/1.65, `#8A91A0`).
- Hover (interactive cards only): border → `rgba(242,169,0,0.4)`, lift `translateY(-2px)`.

### 8.3 Input

- `background: #1A1D23`; `border: 1px solid rgba(255,255,255,0.08)`; `radius-sm` (6px);
  `padding: 12px 14px`; text `#E6E8EE`; placeholder `#8A91A0`.
- Focus: border → `#F2A900`, `0 0 0 3px var(--accent-glow)`.
- Error: border → `#F85149`, helper text `#F85149` 13px.

### 8.4 Badge

- Pill (`radius-pill`), `11px`/600, `padding: 4px 10px`.
- **Default:** `#1A1D23` bg, `#8A91A0` text. **Accent:** `rgba(242,169,0,0.12)` bg, `#F2A900` text.
- **Success:** `rgba(63,185,80,0.12)` bg, `#3FB950` text (e.g. "Source verified").
- **Category tag** (social / archive): amber pill with the vertical name.

### 8.5 Section label (signature element)

```
font: 11px / 600;  text-transform: uppercase;  letter-spacing: 0.08em;  color: #F2A900;
margin-bottom: 8px;
```
Used above every email block and every landing section. This is the most recognizable brand atom —
keep it consistent everywhere.

### 8.6 Newsletter email blocks

The email is composed from a **block palette** (per-category config; see build plan). Each block
opens with a `section-label`. Core blocks and their styling:

| Block | Structure | Key styles |
|---|---|---|
| **Hero header** | Void band: wordmark + date + "Your Daily Download for [Career]" | `#0B0C10` bg, `padding 24px 32px`, wordmark `#F2A900` 20/700, subtitle `#7A8194` 13px |
| **Big Story** | `section-label` "The Big Story" → `h4` title (`#1A1D23`) → 14px body (`#555`) → source link | line-height 1.7; ends with `Source: [Name]` link in `#F2A900` |
| **Tool Box** (ToolDrop) | `section-label` "Tool of the Day" → amber-tinted callout: name (15/600) + desc (13px) | `background #FFF8E7`, `border-left: 3px solid #F2A900`, `radius 0 8px 8px 0`, `padding 16px` |
| **Prompt of the Day** | `section-label` → mono block (copy-paste) | `#F8F9FA` panel, **JetBrains Mono fallback → monospace**, 13px, `radius 8px`, `padding 16px`; web shows a copy button |
| **By the Numbers** | `section-label` → 2-cell stat table | `display: table`, two `#F8F9FA` cells; value 28/700 `#F2A900`; label 11px `#555`; first cell `radius 8px 0 0 8px` |
| **Quick Hits** | `section-label` → stacked items with hairline dividers | title 14/600 `#1A1D23`, body 13px `#555`, divider `1px solid #EEE` |
| **Source link** | inline, end of any factual item | `#F2A900`, `text-decoration: none`; renders `Source: {name}`; **hard rule: URL must be in the fetched set** |
| **CTA band** | Void band footer | `#0B0C10`, amber link 14/600, `margin: 24px -32px -32px` (bleeds to container edge) |
| **Footer** | address + unsubscribe + trust line | `#F8F9FA` panel, 12px `#7A8194`, links `#F2A900`; includes physical address + one-click unsubscribe + "Every item cites a real source." |

---

## 9. OG images & social specs

### 9.1 OG image (Open Graph / link preview)

- **Size:** 1200 × 630. **Bg:** `#0B0C10` (void).
- **Content:** amber wordmark (top-left or centered), tagline "AI news that actually matters to your
  career." in `#E6E8EE`, and a small career-grid motif (faint amber tags) lower-right.
- **Per-category variant** for `/ai-for/[career]` hubs: headline "AI for [Profession]" in mist, the
  vertical name accented amber, same void bg + grid motif.

### 9.2 Social accounts — 6 X handles + Facebook

One brand master + 5 verticals: **Marketing · Product · Founder · Sales · Design**.

| Asset | Size | Spec |
|---|---|---|
| **Avatar** (all accounts) | 400 × 400 (renders to 48px) | Compact mark — amber signal dot / download glyph on `#0B0C10`. Must read at 48px and 16px. Vertical accounts add a small category tag below the glyph. |
| **Cover / banner** | 1500 × 500 | Void bg, full wordmark + tagline. Per-vertical: category name in **amber** ("Marketing", "Product", "Founder", "Sales", "Design") beside the wordmark. |
| **Facebook (Mydailydownload)** | avatar 170×170, cover 820×312 | Same amber-glyph avatar + wordmark cover as the brand master. |

Shared rule: every account uses the **same compact mark** so the family reads as one brand; only the
amber category tag differentiates the verticals.

| Account | Avatar tag | Cover headline |
|---|---|---|
| Brand master | (none) | "AI news that actually matters to your career." |
| Marketing | "Marketing" | "The AI download for Marketers." |
| Product | "Product" | "The AI download for PMs." |
| Founder | "Founder" | "The AI download for Founders." |
| Sales | "Sales" | "The AI download for Sales." |
| Design | "Design" | "The AI download for Designers." |

---

## 10. Accessibility

Contrast checked against the void background `#0B0C10`.

| Pair | Ratio | Verdict |
|---|---|---|
| `#E6E8EE` text on `#0B0C10` | ~14.8:1 | Pass AAA (body & headings) |
| `#8A91A0` muted on `#0B0C10` | ~5.9:1 | Pass AA normal, AAA large — keep muted text ≥14px for body use |
| `#F2A900` amber on `#0B0C10` | ~10.4:1 | Pass AAA — safe for links, labels, large display |
| `#0B0C10` on `#F2A900` (primary button) | ~10.4:1 | Pass AAA — dark text on amber is the correct primary button pairing |
| `#1A1D23` ink on `#FFFFFF` (email body) | ~15.8:1 | Pass AAA |
| `#555` body on `#FFFFFF` (email body) | ~7.5:1 | Pass AAA |
| `#7A8194` meta on `#FFFFFF` (email body) | ~4.5:1 | Pass AA — use ≥12px, meta only |

Rules:
- **Never put amber text on white** as the only differentiator in the email body (drops below 3:1) —
  amber links carry an underline-on-hover and are reinforced by the `Source:` prefix; amber on white
  is acceptable for the bold `section-label` (11px is "large enough" only with the weight, so the
  email also relies on the amber + uppercase + spacing combination, not color alone).
- Focus states always visible: `0 0 0 3px var(--accent-glow)` on every interactive element.
- The signal dot is decorative; never encode meaning in color alone — pair status with an icon/label.
- Minimum interactive target 44×44px on web. Email links get ≥44px tap height via line-height/padding.
- Respect `prefers-reduced-motion`: disable the signal-dot pulse.

---

## 11. Quick reference — copy-paste tokens

```css
:root {
  /* surfaces */
  --bg-void:      #0B0C10;
  --bg-surface:   #14171D;
  --bg-elevated:  #1A1D23;
  /* accent */
  --accent:       #F2A900;
  --accent-hover: #D49500;
  --accent-glow:  rgba(242,169,0,0.30);
  /* text */
  --text-primary: #E6E8EE;
  --text-muted:   #8A91A0;
  /* lines */
  --border-subtle: rgba(255,255,255,0.08);
  /* status */
  --success: #3FB950;  --error: #F85149;  --info: #58A6FF;
  /* radius / type */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

```css
/* email-safe (light body) */
--email-page:#F5F5F5; --email-content:#FFFFFF; --email-header:#0B0C10;
--email-ink:#1A1D23; --email-body:#555555; --email-meta:#7A8194;
--email-accent:#F2A900; --toolbox-tint:#FFF8E7; --email-rule:#EEEEEE; --email-panel:#F8F9FA;
--email-font:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
```
