/**
 * The topic catalogue: every section the paper can run. Onboarding shows these
 * as cards, ingestion uses `feeds`, and the profile builder uses `keywords` to
 * map free text onto topics when no LLM is available.
 *
 * Feeds are public RSS endpoints. If one goes down, ingestion logs it and moves on.
 */
export interface TopicDef {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  keywords: string[];
  feeds: { name: string; url: string }[];
}

export const TOPICS: TopicDef[] = [
  {
    id: "world",
    label: "World",
    emoji: "🌍",
    blurb: "Geopolitics, conflicts, diplomacy",
    keywords: ["world", "international", "geopolitics", "war", "diplomacy", "global", "foreign", "un", "conflict"],
    feeds: [
      { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
      { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    ],
  },
  {
    id: "pakistan",
    label: "Pakistan",
    emoji: "🇵🇰",
    blurb: "National news and current affairs",
    keywords: ["pakistan", "karachi", "lahore", "islamabad", "punjab", "sindh", "psl", "pakistani"],
    feeds: [
      { name: "Dawn", url: "https://www.dawn.com/feeds/home" },
      { name: "Express Tribune", url: "https://tribune.com.pk/feed/home" },
    ],
  },
  {
    id: "business",
    label: "Business",
    emoji: "💼",
    blurb: "Companies, markets, the economy",
    keywords: ["business", "economy", "market", "markets", "stocks", "finance", "inflation", "trade", "investing", "money"],
    feeds: [
      { name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
      { name: "CNBC", url: "https://www.cnbc.com/id/100003114/device/rss/rss.html" },
    ],
  },
  {
    id: "technology",
    label: "Technology",
    emoji: "💻",
    blurb: "Gadgets, platforms, the internet",
    keywords: ["tech", "technology", "gadget", "software", "apple", "google", "microsoft", "smartphone", "internet", "cybersecurity"],
    feeds: [
      { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
      { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
      { name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    emoji: "🤖",
    blurb: "Models, research, policy",
    keywords: ["ai", "artificial intelligence", "machine learning", "llm", "chatgpt", "openai", "anthropic", "neural", "deep learning", "robotics"],
    feeds: [
      { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
      { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/" },
    ],
  },
  {
    id: "programming",
    label: "Programming",
    emoji: "⌨️",
    blurb: "Developers, open source, the craft",
    keywords: ["programming", "coding", "developer", "open source", "javascript", "python", "rust", "web dev", "github", "software engineering"],
    feeds: [{ name: "Hacker News", url: "https://hnrss.org/frontpage" }],
  },
  {
    id: "startups",
    label: "Startups",
    emoji: "🚀",
    blurb: "Founders, funding, products",
    keywords: ["startup", "startups", "founder", "venture", "vc", "funding", "entrepreneur", "saas"],
    feeds: [{ name: "TechCrunch", url: "https://techcrunch.com/feed/" }],
  },
  {
    id: "science",
    label: "Science",
    emoji: "🔬",
    blurb: "Discoveries and research",
    keywords: ["science", "physics", "biology", "chemistry", "scientists", "discovery", "genetics"],
    feeds: [
      { name: "ScienceDaily", url: "https://www.sciencedaily.com/rss/all.xml" },
      { name: "BBC Science", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml" },
    ],
  },
  {
    id: "space",
    label: "Space",
    emoji: "🪐",
    blurb: "Missions, astronomy, rockets",
    keywords: ["space", "nasa", "astronomy", "rocket", "spacex", "mars", "moon", "planet", "telescope"],
    feeds: [
      { name: "NASA", url: "https://www.nasa.gov/news-release/feed/" },
      { name: "Space.com", url: "https://www.space.com/feeds/all" },
    ],
  },
  {
    id: "health",
    label: "Health",
    emoji: "🩺",
    blurb: "Medicine, fitness, wellbeing",
    keywords: ["health", "medicine", "fitness", "nutrition", "mental health", "disease", "wellbeing", "diet", "doctor"],
    feeds: [{ name: "BBC Health", url: "https://feeds.bbci.co.uk/news/health/rss.xml" }],
  },
  {
    id: "climate",
    label: "Climate",
    emoji: "🌱",
    blurb: "Environment and energy",
    keywords: ["climate", "environment", "energy", "renewable", "solar", "emissions", "sustainability", "weather", "green"],
    feeds: [{ name: "The Guardian Environment", url: "https://www.theguardian.com/environment/rss" }],
  },
  {
    id: "sports",
    label: "Sports",
    emoji: "🏏",
    blurb: "Cricket, football and more",
    keywords: ["sport", "sports", "cricket", "football", "soccer", "tennis", "f1", "formula 1", "olympics", "match"],
    feeds: [
      { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml" },
      { name: "ESPNcricinfo", url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml" },
    ],
  },
  {
    id: "culture",
    label: "Culture",
    emoji: "🎭",
    blurb: "Film, music, books, art",
    keywords: ["culture", "film", "movies", "music", "books", "art", "tv", "celebrity", "entertainment"],
    feeds: [{ name: "The Guardian Culture", url: "https://www.theguardian.com/culture/rss" }],
  },
  {
    id: "gaming",
    label: "Gaming",
    emoji: "🎮",
    blurb: "Games and the industry",
    keywords: ["gaming", "games", "video games", "playstation", "xbox", "nintendo", "esports", "steam"],
    feeds: [{ name: "Polygon", url: "https://www.polygon.com/rss/index.xml" }],
  },
];

const BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

export const TOPIC_IDS = TOPICS.map((t) => t.id);

export function getTopic(id: string): TopicDef | undefined {
  return BY_ID.get(id);
}

/** Display label for a topic id, falling back to the id itself. */
export function topicLabel(id: string): string {
  return BY_ID.get(id)?.label ?? id;
}
