// Every word on the site lives here. Facts come from the owner's public repos;
// nothing (clients, reviews, numbers) is invented. Owner-approved public info:
// name, email, GitHub, LinkedIn. Not shown: age, location, family business.

export const person = {
  name: "Muhammad Ahsan",
  wordmark: "Muhammad Ahsan",
  email: "ahsanraj2748@gmail.com",
  github: "https://github.com/Ahsuu27488",
  linkedin: "https://www.linkedin.com/in/muhammad-ahsan-653298289/",
};

export const hero = {
  lines: ["Software", "that ships."] as const,
  sentence:
    "I’m Muhammad Ahsan. I build websites, AI chatbots and automations for small businesses — and I ship products of my own.",
  action: "Start a project",
  typeLabel: "Write a word in particles",
  typePlaceholder: "Type a name, it rewrites itself",
};

export type ShapeId = "name" | "taskvane" | "chronos" | "foreman" | "editRecreator";

export type Product = {
  id: string;
  shape: ShapeId;
  name: string;
  what: string;
  facts: string[];
  media:
    | {
        kind: "image";
        src: string;
        alt: string;
        width: number;
        height: number;
        second?: { src: string; alt: string };
      }
    | { kind: "video"; src: string; poster: string; alt: string; width: number; height: number; credit: string }
    | { kind: "code"; caption: string; lines: string[] };
  links: { label: string; href: string }[];
};

export const products: Product[] = [
  {
    id: "taskvane",
    shape: "taskvane",
    name: "Taskvane",
    what: "A better Task Manager for Windows 11: temperatures, power draw in watts and battery health, in one free app.",
    facts: [
      "Reads 100+ hardware sensors in a crash-isolated helper process.",
      "Uses about 0.4% CPU while it runs.",
      "Ships as an installer and a portable zip, built by GitHub Actions, with its own website.",
    ],
    media: {
      kind: "image",
      src: "/work/taskvane-overview.webp",
      second: {
        src: "/work/taskvane-performance.webp",
        alt: "Taskvane performance page with a CPU graph and per-core load",
      },
      alt: "Taskvane overview: CPU, memory, GPU and power tiles with an activity chart and temperatures",
      width: 1600,
      height: 936,
    },
    links: [
      { label: "Website", href: "https://taskvane.ahsandev.site" },
      { label: "Code", href: "https://github.com/Ahsuu27488/taskvane" },
    ],
  },
  {
    id: "chronos",
    shape: "chronos",
    name: "Chronos",
    what: "An AI assistant that runs your to-do list. Type or talk to it, in English or Urdu.",
    facts: [
      "A main agent hands off to planning and query agents (OpenAI Agents SDK).",
      "Seven MCP tools I wrote, each acting only on the signed-in user’s tasks.",
      "Voice through Whisper, semantic search in Qdrant, deployed with Kubernetes and Helm.",
    ],
    media: {
      kind: "image",
      src: "/work/chronos.webp",
      alt: "Chronos home page: The Evolution of Todo Management, with AI assistant, voice commands and smart search",
      width: 1440,
      height: 900,
    },
    links: [
      { label: "Live app", href: "https://evolution-of-todo-tau.vercel.app" },
      { label: "Code", href: "https://github.com/Ahsuu27488/evolution-of-todo" },
    ],
  },
  {
    id: "foreman",
    shape: "foreman",
    name: "Foreman",
    what: "A Claude Code plugin that makes your best AI model the lead engineer and lets cheaper coding agents do the typing.",
    facts: [
      "The lead writes a brief, a worker CLI (Codex, Cursor, Gemini CLI and others) writes the code.",
      "Every result is tested and reviewed line by line before it lands.",
      "Open source (MIT), with CI and versioned releases.",
    ],
    media: {
      kind: "code",
      caption: "Install it in Claude Code, then just ask for work as usual.",
      lines: [
        "claude plugin marketplace add Ahsuu27488/foreman",
        "claude plugin install foreman@foreman",
        "",
        "> run foreman doctor and init",
        "> Write unit tests for every public function in src/utils/dates.py.",
        "  Save my Claude limit on this one.",
      ],
    },
    links: [{ label: "Code", href: "https://github.com/Ahsuu27488/foreman" }],
  },
  {
    id: "edit-recreator",
    shape: "editRecreator",
    name: "edit-recreator",
    what: "Give it a TikTok or Reels edit and your own clips; it rebuilds the same edit in code, frame by frame.",
    facts: [
      "Measures every cut, flash, speed ramp and camera move of the reference.",
      "Renders in Remotion (React) and checks itself side by side until they match.",
      "No After Effects, no paid plugins.",
    ],
    media: {
      kind: "video",
      src: "/work/edit-recreator.mp4",
      poster: "/work/edit-recreator-poster.webp",
      alt: "Side by side: the original edit on the left, the Remotion recreation on the right",
      width: 1280,
      height: 400,
      credit: "Left: original edit by Rehan Shaikh (Rs Tech 07), shown with credit.",
    },
    links: [{ label: "Code", href: "https://github.com/Ahsuu27488/edit-recreator" }],
  },
];

export const live = {
  heading: "What would I build for you?",
  placeholder: "Bright Dental",
  examples: ["Bright Dental", "Luna Hair Studio", "Harbor Cleaning"],
  note: "Type your business. This is the first screen and the chat greeting I’d start from.",
};

export const services = {
  heading: "What it costs to start",
  sentence:
    "Fixed starting prices, the same as my Fiverr gigs. Every project includes the code, and it’s yours.",
  plans: [
    {
      name: "Website",
      price: "from $80",
      rows: [
        "1-page site, up to 6 sections, mobile first",
        "3 days",
        "2 rounds",
        "Contact form, WhatsApp, Maps, SEO basics, live on your domain",
      ],
    },
    {
      name: "AI chatbot",
      price: "from $50",
      rows: [
        "Answers from up to 10 pages or 1 FAQ doc",
        "3 days",
        "1 round",
        "Your logo and colours, setup guide and handover video",
      ],
      recommended: true,
    },
    {
      name: "Automation",
      price: "from $40",
      rows: [
        "One automation linking 2 apps. Discord bots from $15",
        "3 days (Discord bot 2 days)",
        "1 round",
        "Runs on its own, source code and a setup guide",
      ],
    },
  ],
  rowLabels: ["What you get", "Delivery", "Revisions", "Included"],
  proof: [
    {
      src: "/work/taskvane-site.webp",
      alt: "The Taskvane website: A better Task Manager for Windows 11, with a download button and an app screenshot",
      caption: "A product site I built and shipped: taskvane.ahsandev.site",
      href: "https://taskvane.ahsandev.site",
      width: 1440,
      height: 900,
    },
    {
      src: "/work/chronos.webp",
      alt: "Chronos home page: an AI assistant for tasks, with voice commands and smart search in English and Urdu",
      caption: "An AI assistant I built and run: Chronos, live on Vercel",
      href: "https://evolution-of-todo-tau.vercel.app",
      width: 1440,
      height: 900,
    },
    {
      src: "/work/scraper.webp",
      alt: "Scraped data delivered as a clean spreadsheet: 60 rows, 25 categories, deduplicated and typed",
      caption: "Scraper output: website data to a clean Excel file",
      href: "https://github.com/Ahsuu27488/scraper-demo",
      width: 1600,
      height: 961,
    },
  ],
  action: "Ask about your project",
};

export type IndexItem = { name: string; kind: "AI" | "Web" | "Tools" | "Games"; href: string };

export const index: { heading: string; note: string; items: IndexItem[] } = {
  heading: "Everything shipped",
  note: "Every project links to its code or its live page.",
  items: [
    { name: "Taskvane", kind: "Tools", href: "https://github.com/Ahsuu27488/taskvane" },
    { name: "Chronos", kind: "AI", href: "https://github.com/Ahsuu27488/evolution-of-todo" },
    { name: "Foreman", kind: "AI", href: "https://github.com/Ahsuu27488/foreman" },
    { name: "edit-recreator", kind: "AI", href: "https://github.com/Ahsuu27488/edit-recreator" },
    { name: "Physical AI textbook", kind: "AI", href: "https://github.com/Ahsuu27488/physical-ai-textbook" },
    { name: "PCAO-F study pack", kind: "Web", href: "https://github.com/Ahsuu27488/pcao-f-study-pack" },
    { name: "Scraper demo", kind: "Tools", href: "https://github.com/Ahsuu27488/scraper-demo" },
    { name: "Discord bot demo", kind: "Tools", href: "https://github.com/Ahsuu27488/discord-bot-demo" },
    { name: "Keymap copier", kind: "Games", href: "https://github.com/Ahsuu27488/pubgm-flash-keymapping-gameloop" },
    { name: "WASD speed fix", kind: "Games", href: "https://github.com/Ahsuu27488/gameloop-pubgm-wasd-speed-fix" },
    { name: "Scoop bucket", kind: "Tools", href: "https://github.com/Ahsuu27488/scoop-bucket" },
    { name: "Furniro store", kind: "Web", href: "http://furniro-hackathon.netlify.app/" },
    { name: "BlogsTerra", kind: "Web", href: "http://blogsterra.netlify.app/" },
    { name: "Lead lifecycle", kind: "Web", href: "https://lead-lifecycle-overview000.netlify.app/" },
    { name: "Resume builder", kind: "Web", href: "https://github.com/Ahsuu27488/resume-builder" },
    { name: "SecureIT", kind: "Web", href: "https://github.com/Ahsuu27488/SecureIT_Password-Strength-Meter" },
    { name: "Unico converter", kind: "Web", href: "https://github.com/Ahsuu27488/unico-unit-converter" },
  ],
};

export const toolbox = {
  heading: "What I build with",
  groups: [
    {
      name: "AI",
      rows: [
        ["OpenAI Agents SDK", "Chronos"],
        ["Model Context Protocol", "Chronos"],
        ["RAG with Qdrant", "Physical AI"],
        ["Whisper", "Chronos"],
        ["Claude Code plugins", "Foreman"],
      ],
    },
    {
      name: "Web",
      rows: [
        ["Next.js and React", "this site"],
        ["Tailwind CSS", "this site"],
        ["Astro", "taskvane.ahsandev.site"],
        ["three.js", "this site"],
      ],
    },
    {
      name: "Backend and data",
      rows: [
        ["Python and FastAPI", "Chronos"],
        ["PostgreSQL (Neon)", "Chronos"],
        ["Scraping (httpx, Playwright)", "Scraper demo"],
      ],
    },
    {
      name: "Ship",
      rows: [
        ["Docker, Kubernetes, Helm", "Chronos"],
        ["GitHub Actions releases", "Taskvane"],
        ["Vercel, Railway", "most projects"],
      ],
    },
  ] as { name: string; rows: [string, string][] }[],
};

// About: set large, two columns. Marked phrases get a highlighter background.
export const about: { text: string; mark?: "mint" | "night" | "grey" }[][] = [
  [
    { text: "Muhammad Ahsan", mark: undefined },
    { text: " is a developer who likes the last ten percent: the installer, the docs, the release notes, the part where software stops being a demo. He built " },
    { text: "Taskvane", mark: "mint" },
    { text: " because Windows wouldn’t tell him how hot his PC was, and " },
    { text: "Chronos", mark: "mint" },
    { text: " so a to-do list could be spoken to in " },
    { text: "Urdu", mark: "grey" },
    { text: " as easily as in English. He studies agentic AI with " },
    { text: "Panaversity", mark: "grey" },
    { text: " and builds every day with " },
    { text: "Claude Code", mark: "mint" },
    { text: ", publishing the plugins he makes along the way. For clients he keeps it simple: a clear price, a preview link early, updates every couple of days, and " },
    { text: "code you own", mark: "grey" },
    { text: ". He works remotely and replies within a day. " },
  ],
];
export const aboutClose = "Tell him what you need.";

export const contact = {
  lines: ["Tell me what you need.", "I reply within a day."],
  placeholder: "A booking site for my salon…",
  next: {
    web3forms: "It goes straight to Ahsan’s inbox.",
    mailto: "This opens an email to Ahsan with your message in it.",
  },
  sent: "Thanks, it’s sent. Ahsan will reply within a day.",
  failed: "That didn’t go through. Try again, or",
  // Fill when the profiles are public; empty = hidden.
  hire: { fiverr: "", upwork: "" },
  rows: [
    { label: "Email", value: "ahsanraj2748@gmail.com", href: "mailto:ahsanraj2748@gmail.com" },
    { label: "GitHub", value: "github.com/Ahsuu27488", href: "https://github.com/Ahsuu27488" },
    { label: "LinkedIn", value: "Muhammad Ahsan", href: "https://www.linkedin.com/in/muhammad-ahsan-653298289/" },
  ],
};

export function mailto(subject: string, body: string) {
  return `mailto:${person.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
