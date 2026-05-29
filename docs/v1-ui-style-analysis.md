# v1 UI Style Analysis

Generated: 2026-05-29

Source project: `/Users/panupong.ma/Documents/Codex/2026-05-27/animal-crossing-new-horizons-facebook-group`

Target project: current v2 workspace

## Safety Scope

- No v2 UI files were modified in this step.
- No v1 or v2 files were deleted.
- No v1 project files were overwritten.
- No assets were copied yet.
- This report is a migration plan only; v2 backend, auth, admin, CRUD, content builder, media upload, seed data, and public APIs must remain the source of truth.

## Summary Of v1 Structure

v1 is a frontend-only React/Vite project. It uses React 19, TypeScript, Vite 6, Tailwind CSS 4, and static data files. It has no backend integration, no auth, no admin system, no database, and no media upload workflow.

Important folders and files:

- `src/App.tsx` - custom client-side routing with header, footer, and mobile bottom nav.
- `src/index.css` - main visual system: Google fonts, Tailwind theme tokens, card styles, article styles, tone colors, bottom nav, and soft backgrounds.
- `src/pages/HomePage.tsx` - strongest public landing/browsing design.
- `src/pages/CategoryPage.tsx` - category hero and horizontal guide list.
- `src/pages/DetailPage.tsx` - article-like detail page with cover image, tags, source excerpt, extra gallery, related links, and Facebook source panel.
- `src/pages/SearchPage.tsx` - search page with friendlier empty state.
- `src/components/Cards.tsx` - quick category cards, content cards, guide cards.
- `src/components/UI.tsx` - section heading, tag pill, internal link, Facebook button, count badge.
- `src/components/Header.tsx` and `src/components/BottomNav.tsx` - cohesive public navigation.
- `src/components/ArticleContent.tsx` - article block rendering patterns.
- `src/data/*` - static guide/category/monthly content and image metadata.
- `public/content-images/curated-post-images` - 307 public guide images across 27 folders, around 94 MB.

## Framework And Dependencies

v1 dependencies are intentionally simple: React, React DOM, TypeScript, Vite, Tailwind CSS, and the Tailwind Vite plugin. v2 uses React/Vite/TypeScript too, but its UI stack is Material UI with React Router and Axios. Because of that, v1 should be treated as design reference and asset source, not as code to paste wholesale.

## Fonts

v1 imports:

- `Mali` weights 500, 600, 700 for display/headings.
- `Noto Sans Thai` weights 400, 500, 600, 700 for body/UI text.

This is one of the best migration candidates. v2 currently uses Inter/Avenir/Helvetica-like fonts, which are clean but less Thai/cozy. Migrating this font pairing into the MUI theme should improve the public website immediately.

## Color Palette

v1 palette:

- cream `#fbf7ed`
- cream deep `#f1e5c9`
- ink `#3e493e`
- muted `#687468`
- leaf `#92bd91`
- leaf deep `#517b58`
- leaf pale `#e2efde`
- sky pale `#deeff0`
- peach pale `#fae7d5`
- butter pale `#fbf0ca`
- rose pale `#f8e4de`

v2 already uses cream, green, blue, and brown, but v1's palette is more cohesive and less generic. The leaf-deep and ink values make text/buttons feel more Animal Crossing notebook than corporate dashboard.

## What v1 Does Better Than v2

- Home page feels like a Thai community guidebook instead of a starter app/dashboard.
- Typography has personality and Thai readability through Mali + Noto Sans Thai.
- Hero section has better copy, search suggestions, stat chips, and a note-like featured image panel.
- Public navigation is consistent across pages, with sticky header, footer, and mobile bottom nav.
- Category cards use icons, tone colors, counts, and softer spacing.
- Guide cards support thumbnail images and image-count badges.
- Detail pages feel like readable articles, not only API content cards.
- Empty states and source-link panels feel more friendly and contextual.
- Public image assets are already organized by guide slug and can support richer post cards/detail pages.

## v2 Strengths To Preserve

- Working backend APIs with PostgreSQL, Echo, GORM, JWT auth, admin CRUD, content builder, media upload, seed data, and Docker Compose.
- Material UI theme and component foundation.
- React Router route architecture.
- Public pages backed by real published post/category/search APIs.
- Admin pages and protected write workflows.

## Comparison With v2

Home page:

- v1 has stronger Thai-first hero, clear search suggestions, category quick cards, stats, and a cozy note card.
- v2 has live data and API status, but visually still feels closer to a setup/dashboard screen.

Category page:

- v1 has a colored category hero with icon, tags, guide/image counts, and horizontal guide cards.
- v2 is functional and API-backed, but can borrow v1 category hero/card rhythm.

Post/detail page:

- v1 has better article paper, cover image, source excerpt, related guides, extra image gallery, and friendly source link panel.
- v2 has real content blocks and backend data, so the migration should improve styling around existing blocks, not replace the renderer.

Navigation/header/footer:

- v1 has shared public chrome and mobile bottom nav.
- v2 currently routes pages independently and does not have the same public site shell.

Cards/buttons/typography/backgrounds:

- v1 buttons and cards are softer, with bigger radius, subdued borders, gentle hover movement, and pastel tone classes.
- v2 cards are clean but more generic MUI. Migrate the tokens and patterns, not Tailwind code.

## Useful Files And Assets

Use as design references:

- `src/index.css`
- `src/pages/HomePage.tsx`
- `src/pages/CategoryPage.tsx`
- `src/pages/DetailPage.tsx`
- `src/pages/SearchPage.tsx`
- `src/components/Cards.tsx`
- `src/components/UI.tsx`
- `src/components/Header.tsx`
- `src/components/BottomNav.tsx`
- `src/components/ArticleContent.tsx`

Useful assets:

- `public/content-images/curated-post-images` - 307 JPEG/PNG guide images, around 94 MB.
- Monthly folders such as `monthly-guide-january`, `monthly-guide-april`, etc. are unique to v1 and may become valuable after monthly content import.
- Curated guide folders such as `beginner-walkthrough-main`, `blue-rose-guide`, `meteonook-weather`, `celeste-guide`, and `brewster-guide` match the current import candidate direction.

## Files That Should Not Be Reused Directly

- `node_modules/`, `dist/`, `.git/`, logs, and build output.
- v1 `src/App.tsx` routing implementation, because v2 already uses React Router.
- v1 static `src/data/content.ts`, `curatedContent.ts`, `monthlyImportedContent.ts`, and related generated data as runtime source of truth. They can be reference material only.
- v1 Tailwind utility classes as direct CSS in v2. v2 is MUI-based, so translate patterns into MUI theme/component sx.
- v1 scripts and raw import artifacts unless a separate content import task explicitly reviews them.

## Suggested Components And Layout Patterns To Migrate

- PublicLayout with sticky cream header, compact brand lockup, footer, and mobile bottom nav.
- Home CozyHero with Thai headline, search suggestions, stat chips, and note-style image panel.
- SectionHeading with eyebrow, title, description, optional action.
- CozyCategoryCard and QuickCategoryCard pattern with icon/tone/count.
- GuideCard/PostCard with thumbnail, tag pills, image count, updated date, and compact source metadata.
- Category hero with icon, tone background, tags, and count chips.
- Article detail shell with cover image, detail paper, source excerpt panel, related guide cards, and extra image gallery.
- Content block visual treatments for note/highlight/checklist-like sections.
- Empty state treatment with dashed border, pale background, and friendly Thai text.

## Assets To Copy Later

Copying should happen in a separate implementation step after deciding whether images live in frontend public assets or are imported through the v2 media upload/storage flow.

Recommended copy set:

- `public/content-images/curated-post-images` to `frontend/public/content-images/curated-post-images` if using frontend public assets.
- Alternatively, import approved folders into `backend/uploads/imported-v1` or v2 media storage if images should be managed by the backend.

Do not copy the full v1 project.

## Risks And Compatibility Notes

- v1 is Tailwind; v2 is MUI. Directly copying components would create styling and dependency drift.
- v1 uses static content and custom navigation; v2 must keep backend/API data as source of truth.
- v1 image folder is about 94 MB. Copying all assets increases repo size; consider selective copy or backend media storage.
- Some v1 assets are sourced from Facebook posts. They should be reviewed for relevance and rights before public publishing.
- Google Fonts import requires network in production unless self-hosted; consider font loading strategy.
- Bigger card radii from v1 are cozy but should be applied carefully to admin pages so they stay efficient.
- v1 emoji icons add charm, but v2 may prefer Material Icons in admin. Public pages can use emoji/icon mapping without changing database schema.

## Recommended Migration Steps

1. Add v1 font pair to v2 and update MUI typography.
2. Translate v1 palette into `frontend/src/theme/appTheme.ts` and verify contrast.
3. Add PublicLayout for public pages only.
4. Rework Home page using v1 hero/search/category/latest guide patterns with v2 APIs.
5. Rework public cards and category pages with tone/icon/count patterns.
6. Improve PostDetailPage and ContentBlockRenderer using v1 article paper/gallery/source panel ideas.
7. Decide asset strategy: frontend public copy vs backend media import. Copy only approved assets.
8. Run frontend build and route checks after each phase.

## Recommended Next Prompt

`Apply the v1 visual style to v2 public pages only. Start with fonts, theme tokens, PublicLayout, Home page, PostCard, Category page, Search page, and Post detail styling. Do not change backend or admin CRUD behavior. Copy only the selected public content image folders listed in data/v1-style-migration-candidates.json if needed. Run frontend build and verify major public/admin routes.`
