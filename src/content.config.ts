import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Each markdown file in src/content/writing/ becomes a post.
// Add a new post: create a .md file with `title` and `date` frontmatter.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { writing };
