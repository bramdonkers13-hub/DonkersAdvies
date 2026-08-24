# Donkers Advies — website

Static marketing and knowledge-base site for **Donkers Advies**, a Dutch spatial-planning
consultancy (ruimtelijke ordening / Omgevingswet). Built with **Astro 7**, no UI framework,
no Tailwind — plain `.astro` components and one hand-written stylesheet. Deployed as a fully
static site on Vercel.

All visitor-facing copy is **Dutch** and addresses the reader with the formal *u*-vorm.
Code identifiers are English; inline comments are a mix of Dutch and English (match the file
you are editing).

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies (Node >= 22.12.0) |
| `npm run dev` | Dev server on `localhost:4321` |
| `npm run build` | Static build to `./dist/` (currently 31 pages) |
| `npm run preview` | Preview the production build |
| `npm run check:content` | Content integrity checks the build does not perform (see below) |

When starting the dev server as an agent, use background mode:

```
npx astro dev --background
```

Manage it with `npx astro dev stop`, `npx astro dev status`, and `npx astro dev logs`.

`npm run build` is the real check for this repo — it type-checks `.astro` frontmatter, validates
every blog post against the content-collection schema, and fails on broken image imports. Run it
before committing. (`astro check` is not wired up; `@astrojs/check` is not a dependency.)

`npm run check:content` (`scripts/check-content.mjs`) covers the relationships the Zod schema
cannot see, because they span files:

- every post's `category` has a matching chip in the `categories` array in `blog/index.astro`;
- `relatedSlugs` holds exactly 3 slugs, each pointing at a post that exists, never at itself;
- every `toc` anchor has a matching `<h2 id="…">` in that post's body;
- every literal internal link in `src/` ends in a slash and resolves to a route the site builds.

It is dependency-free and runs in well under a second. Both commands run on every pull request
via `.github/workflows/ci.yml`.

## Project structure

```
src/
├── pages/            # File-based routes (one .astro file per URL)
│   ├── index.astro                              # Homepage: hero, diensten, werkwijze, about, faq, contact
│   ├── principeverzoek.astro                    # Service page
│   ├── omgevingsplanactiviteit.astro            # Service page (OPA)
│   ├── buitenplanse-omgevingsplanactiviteit.astro  # Service page (BOPA)
│   ├── wijziging-omgevingsplan.astro            # Service page (WOP)
│   ├── blog/index.astro                         # Blog overview + client-side filter/search
│   ├── blog/[slug].astro                        # Blog detail, generated from the content collection
│   ├── privacy.astro, cookies.astro             # Legal pages
│   └── 404.astro, bedankt.astro                 # noindex pages
├── layouts/BaseLayout.astro   # <html> shell: meta, OG/Twitter, canonical, JSON-LD, Header/Footer
├── components/                # Presentational .astro components (see catalogue below)
├── content/blog/*.md          # Blog posts (content collection, one file per post)
├── content.config.ts          # Zod schema for the blog collection — the contract for every post
├── data/                      # Single sources of truth: business.ts, services.ts, navigation.ts
├── lib/schema.ts              # JSON-LD (schema.org) builders
├── utils/                     # seo.ts (absoluteUrl, defaultOgImage), formatDate.ts (nl-NL)
├── assets/images/             # Images processed by Astro (imported, optimised to webp)
└── styles/global.css          # The entire stylesheet (~980 lines), imported once by BaseLayout
public/                        # Copied verbatim: favicons, brand_assets/, robots.txt, og image
astro.config.mjs               # site URL, trailingSlash: 'always', sitemap integration
vercel.json                    # 301 redirects from the previous .html-based site
```

## Routing and URLs

- `trailingSlash: 'always'` — **every internal link must end in a slash**: `/principeverzoek/`,
  `/blog/wat-is-een-bopa/`. Anchors are the exception (`/#contact`, `/#diensten`).
- `site` is `https://www.donkersadvies.nl`; canonical, OG and JSON-LD URLs are derived from it.
- `@astrojs/sitemap` generates `sitemap-index.xml`; the filter in `astro.config.mjs` excludes
  `/bedankt/`. Any new noindex page must be added to that filter as well.
- `vercel.json` holds permanent redirects from the old `.html` URLs. Add a redirect there when a
  page or blog slug is renamed, so existing inbound links and rankings survive.

## Blog content collection

Posts live in `src/content/blog/<slug>.md`; the filename is the slug and the URL is
`/blog/<slug>/`. `src/content.config.ts` defines a strict Zod schema — a missing or misspelled
field fails the build. Required frontmatter:

| Field | Purpose |
| :--- | :--- |
| `metaTitle` | `<title>` tag — short, keyword first |
| `title` | Editorial title: h1, og:title, cards, JSON-LD headline |
| `description` | Meta description + OG + Twitter |
| `cardExcerpt` | Short line on the blog card |
| `lead` | Intro paragraph rendered above the table of contents |
| `toc` | `[{ label, anchor }]` — each `anchor` must match an `<h2 id="…">` in the body |
| `category` / `categoryLabel` | Filter id (must exist in the `categories` array in `blog/index.astro`) and its visible label |
| `searchTags` | Keywords for the client-side search on the blog overview |
| `image` / `imageAlt` | Relative path into `src/assets/images/blog/` (validated by `image()`) + alt text |
| `publishedDate` / `updatedDate` | Dates; the "laatst bijgewerkt" line only shows when they differ |
| `readingTimeMinutes` / `wordCount` | Feed the meta row and the `BlogPosting` JSON-LD |
| `relatedSlugs` | Exactly the slugs of 3 related posts, in display order |
| `faq` | `[{ question, answer }]` — rendered as `FAQPage` JSON-LD; mirror these as `### ` headings in the body |
| `breadcrumbLabel` | Label in the visible breadcrumb and in `BreadcrumbList` |
| `ctaTitle`, `ctaDescription`, `ctaButtonLabel`, `ctaButtonHref` | The CTA block below the article |
| `ctaExtra` | Optional HTML paragraph after the CTA button |

### Body conventions

The markdown body is rendered inside `.post-content` and follows a fixed house style:

- Sections that appear in the `toc` use **raw HTML headings with ids**: `<h2 id="wanneer-nodig">…</h2>`.
  Sub-sections use ordinary markdown `### `.
- Tables are raw HTML wrapped in `<div class="table-wrap">` (gives the horizontal scroll container).
- Every post ends with an `<h2 id="bronnen">Bronnen</h2>` list of sources, followed by
  `<p class="post-disclaimer">Wettelijke stand gecontroleerd op …</p>`.
- Internal links use absolute, trailing-slash paths (`/blog/opa-aanvragen/`, `/principeverzoek/`).
- House style: no em-dashes, no bold in running prose, formal *u*-vorm, legal references stated
  precisely (article + regulation), and a "Wettelijke stand" date near the top.

Adding a post: drop the image in `src/assets/images/blog/`, create the `.md` file with complete
frontmatter, make sure `category` exists in the `categories` array in `src/pages/blog/index.astro`,
add the slug to the `relatedSlugs` of related posts where it fits, and run `npm run build`.

## SEO layer

Every page renders through `BaseLayout` and passes its own metadata:

```astro
<BaseLayout
  title="…"            // <title>
  description="…"
  path="/principeverzoek/"   // site-relative, used for canonical/OG/JSON-LD
  ogType="website"           // 'article' for blog posts
  ogImage="/…"               // optional, falls back to the 192px favicon
  jsonLd={[serviceSchema({ … })]}
  noindex                    // sets robots noindex,nofollow
>
```

`jsonLd` is an array of plain objects built by the helpers in `src/lib/schema.ts`
(`organizationSchema`, `websiteSchema`, `breadcrumbSchema`, `faqSchema`, `serviceSchema`,
`blogSchema`, `blogPostingSchema`). `organizationSchema` covers both the `Organization` and
`ProfessionalService` aspects of the business as one node (`@type: ['ProfessionalService',
'Organization']`) under the stable id `ORGANIZATION_ID` exported from that module; `serviceSchema`,
`blogSchema` and `blogPostingSchema` reference that same id on their `provider`/`publisher`/`author`
field so every page describes the same organisation entity. BaseLayout serialises the array into a
single `<script type="application/ld+json">`, wrapped as `{ "@context": ..., "@graph": [...] }`
whenever a page passes more than one schema. Never hand-write JSON-LD in a page — add or extend
a builder so business details stay sourced from `data/business.ts`.

Two components emit their own JSON-LD from the props they receive: `FAQ.astro` renders
`FAQPage`, and `Breadcrumbs.astro` (used inside `PageHero`) renders `BreadcrumbList`. A page
using those components must therefore **not** also pass `faqSchema(...)` or `breadcrumbSchema(...)`
via `jsonLd` — that would duplicate the markup.

## Data layer

Edit these instead of hard-coding values in pages:

- **`src/data/business.ts`** — name, URL, email, phone (display/href/intl), KvK number, area served,
  Formspree endpoint. Used by the layout, footer, contact form and every JSON-LD builder.
- **`src/data/services.ts`** — the four services as typed objects (`slug`, `path`, `navLabel`,
  `navBadge`, `title`, `cardDescription`, `tags`, inline SVG `icon`, `duration`, `checklist`,
  `ctaQuestion`). Drives the nav dropdown, the homepage service tabs and the OfferCatalog schema.
  Adding a service here also requires a matching page in `src/pages/`.
- **`src/data/navigation.ts`** — `primaryNav`, `navCta`, `footerNav`, `footerLegalNav`. The
  "Diensten" dropdown is generated from `services.ts`, not listed here.

## Component catalogue

| Component | Use |
| :--- | :--- |
| `Header` / `Navigation` / `Footer` | Site chrome, rendered by `BaseLayout` |
| `Hero` | Homepage hero only |
| `PageHero` | Hero for every other page: breadcrumbs + label + h1 + subtitle + slot |
| `Breadcrumbs` | Visible breadcrumb trail (used inside `PageHero`) |
| `ServiceTabs` | Homepage "Diensten" tabs, generated from `services.ts` |
| `ServicesGrid` / `ServiceCard` | Card grid variant of the services — currently unused by any page |
| `StepList` | Numbered process steps; `variant="horizontal"` (homepage) or `"vertical"` (service pages), `dark` for forest backgrounds |
| `FeatureGrid`, `CompareGrid`, `InfoBox` | Content blocks on service pages; items carry rich HTML |
| `FAQ` | Accordion + `FAQPage` JSON-LD; each item needs `answerHtml` (visible) and `answerText` (schema) |
| `CTA` | Call-to-action band with optional slot below the button |
| `PostGrid` / `PostCard` | Blog cards; `filter` props power the overview's search and category chips |
| `ContactForm` | Formspree submit via fetch, redirects to `/bedankt/` |

Components take typed props via an `interface Props`; rich text is passed as `…Html` strings and
rendered with `set:html` (authored content, trusted). Keep that pattern rather than introducing
markdown-in-props.

## Styling

- One stylesheet: `src/styles/global.css`, imported once in `BaseLayout`. No Tailwind, no CSS
  modules, no scoped `<style>` blocks in components. Add new rules to the matching
  `/* ─── Section ─── */` block in `global.css`.
- Design tokens are CSS custom properties on `:root`: `--forest`, `--forest2`, `--sage`,
  `--sage-lt`, `--sage-xl`, `--sand`, `--sand-lt`, `--paper`, `--white`, `--text`, `--text-md`,
  `--text-lt`, plus `--radius`, `--gap`, `--section`. Use the tokens, never raw hex.
- Layout helpers: `.container`, `.section`, `.sp-section` (+ `.bg-white` / `.bg-paper` /
  `.bg-sand` / `.bg-forest`), `.grid-2`, `.grid-3`, `.grid-4`, `.label`, `.btn` + `.btn-primary` /
  `.btn-outline` / `.btn-forest`.
- `data-fade` on an element opts it into the shared IntersectionObserver scroll-in animation
  (the observer lives in `BaseLayout`; the animation is disabled under `prefers-reduced-motion`).
- Fonts: Inter from Google Fonts, preconnected in the layout head.
- Small one-off tweaks are done with inline `style` attributes; that is the existing convention.

## Images

- Content images go in `src/assets/images/` and are **imported**, so Astro optimises and hashes
  them (`<Image>` from `astro:assets`, or `getImage()` when a URL string is needed for OG tags).
- Only truly static files (favicons, `brand_assets/`, `robots.txt`, the blog OG image) live in
  `public/` and are referenced by absolute path.

## Code style

- Tabs for indentation in `.astro` and `.ts`; two spaces in `global.css`.
- TypeScript is `astro/tsconfigs/strict`. Type page/component props explicitly; use
  `CollectionEntry<'blog'>` for posts.
- Client-side JS is small, dependency-free `<script>` blocks at the bottom of the page or
  component that needs it (nav toggle, ToC scroll-spy, blog filter, contact form).
- Dates are formatted through `formatDateNL` (`nl-NL`), never inline `toLocaleDateString`.
- Commit messages are written in Dutch, matching the existing history.

## Deployment

Static output deployed on Vercel; `@vercel/analytics` and `@vercel/speed-insights` are injected by
`BaseLayout`. `vercel.json` only carries redirects — there is no adapter and no SSR, so avoid
server-only APIs and keep every route pre-renderable.

## Astro documentation

Full documentation: https://docs.astro.build

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Images and assets](https://docs.astro.build/en/guides/images/)
- [Adding styles](https://docs.astro.build/en/guides/styling/)
