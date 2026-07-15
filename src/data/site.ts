/**
 * All the page content that isn't a blog post lives here.
 * Edit this file to update the site — no need to touch the markup.
 */

export const site = {
  name: 'mannas',
  title: "hi, i'm mannas 👋",
  description:
    'curious engineer making things — software, half-baked research, words on the internet, and 3d prints.',
  email: 'mannas@lawsmos.com',
  twitter: 'https://twitter.com/mannaswtf',
  linkedin: 'https://www.linkedin.com/in/mannasnarang/',
  github: 'https://github.com/mannasdev',
};

export const projects = [
  {
    name: 'glim',
    href: 'https://github.com/mannasdev/glim',
    description:
      '— a drop-in ai guide for next.js apps: a glowing character that answers questions in-product and points at the exact ui element',
  },
  {
    name: 'vidura',
    href: 'https://github.com/mannasdev/vidura',
    description:
      '— a local counselor that reads your claude code sessions and tells you the truth about your friction',
  },
  {
    name: 'lerobot-lint',
    href: 'https://github.com/mannasdev/lerobot-lint',
    description:
      '— lints robot-training datasets for dead joints, frozen cameras, and encoder bugs before you burn gpu-hours on bad data',
  },
  {
    name: 'legal-bge-in',
    href: 'https://huggingface.co/Mannas/legal-bge-in',
    description:
      "— a bge embedding model fine-tuned on indian supreme court and delhi hc judgments, so a lawyer's question lands near the case that actually answers it",
  },
  {
    name: 'tetris-world-model',
    href: 'https://github.com/mannasdev/tetris-world-model',
    description:
      '— a tetris agent that learns to play entirely inside its own imagination: it builds a world model of the game, then trains by dreaming instead of touching the real one',
  },
];

export const work = [
  {
    company: 'wander',
    href: 'https://wander.com',
    role: 'product engineer ii',
    dates: 'dec 2024 — jul 2026',
    learnings:
      "full stack across wander's entire surface area — website, app, and wanderos. led a redesign sprint from first mock to production, drove performance work that made pages feel instant, architected pms integrations so properties sync themselves, and squashed a small graveyard of bugs along the way.",
  },
  {
    company: 'freelancing',
    role: "web apps, scripts, and odd jobs for anyone who'd pay",
    dates: 'before that',
    learnings:
      'learned: how to scope work, talk to clients like a human, and that shipped-and-imperfect beats perfect-and-pending every single time.',
  },
];

export const research = {
  heading: 'research (yes, just the one)',
  title: 'boli: a dataset for understanding stuttering experience and analyzing stuttered speech',
  href: 'https://arxiv.org/abs/2501.15877',
  venue: 'arxiv preprint · 2025',
  blurb:
    'a multi-lingual stuttered speech dataset built with and for people who stutter in india — read and spontaneous speech, five stutter types annotated, released open access. months of work with three great co-authors, and i\'m still weirdly proud of it.',
};

export const prints = {
  intro: 'my printer runs more hours than i do. a few survivors:',
  caption: 'flexi dragon (7 fails first) · spiral vase · desk gantry crane, fully articulated',
  photos: [
    { src: '/prints/print-1.jpg', alt: '3d printed flexi dragon' },
    { src: '/prints/print-2.jpg', alt: '3d printed spiral vase' },
    { src: '/prints/print-3.jpg', alt: '3d printed desk gantry crane' },
  ],
};

export const quotes = [
  {
    text: '“mannas is the rare engineer who ships fast and still sweats the details. hand him a fuzzy problem and he returns with a plan, a prototype, and a blog post about it.”',
    attribution: 'priya s. — engineering manager, acme labs',
  },
  {
    text: '“he fixed in one weekend what our team had postponed for a quarter.”',
    attribution: 'jordi m. — staff engineer, former teammate',
  },
];

export const resume = {
  // drop your resume at public/resume.pdf and these links will work
  viewHref: '/resume.pdf',
  downloadHref: '/resume.pdf',
  meta: 'one page · no fluff · updated jul 2026',
};

export const footer = {
  copyright: '© 2026 mannas · built with too much coffee',
  playlistText: 'you found the hidden playlist — late night build sessions ▶',
  // TODO: link your actual playlist
  playlistHref: '#',
};
