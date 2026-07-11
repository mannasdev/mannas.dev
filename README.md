# mannas.dev

Personal portfolio, built with [Astro](https://astro.build) from the Pencil design
("Portfolio V2 — Simple").

```bash
npm install     # once
npm run dev     # local dev at http://localhost:4321
npm run build   # static output in dist/
```

## Where to edit things

| What | Where |
|---|---|
| Colors, fonts, sizes, spacing | `src/styles/global.css` — design tokens at the top, mirrors the Pencil variables |
| Projects, work history, research, prints, quotes, resume, footer | `src/data/site.ts` — one object per section |
| About paragraphs / intro | `src/pages/index.astro` (prose lives in the markup) |
| Blog posts | `src/content/writing/*.md` — one markdown file per post; the homepage list and post pages generate from these |
| Print photos | `public/prints/` — swap the jpgs, keep the names (or update paths in `src/data/site.ts`) |
| Fonts / favicon / `<head>` | `src/layouts/Base.astro` |

## TODOs left for you

- `src/data/site.ts`: set the research paper link, the hidden **playlist** link, and
  replace the placeholder **work history** and **kind words** with real ones.
- Drop your resume at `public/resume.pdf`.
- Replace the placeholder bodies in `src/content/writing/*.md`.

## Adding a blog post

Create `src/content/writing/my-post.md`:

```markdown
---
title: my post title
date: 2026-08-01
---

post body in markdown.
```

It appears on the homepage automatically (sorted by date, newest first) at
`/writing/my-post/`. Add `draft: true` to the frontmatter to hide it from the list.

## Easter eggs

- Click the "psst" line in the intro — a paper plane flies down to the footer.
- The hidden playlist fades in at the bottom-right of the footer when you scroll to it.

## Photo credits

Placeholder print photos from Unsplash: [Margarida Afonso](https://unsplash.com/@mrafonso1976),
[Vertex Designs](https://unsplash.com/@vertex_800), [Tom Claes](https://unsplash.com/@tomspentys).
Replace them with photos of your actual prints.
