import { Bot, BrainCircuit, Images, MessageSquareText, PenTool, Workflow } from "lucide-react";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "");

export const categories = ["Marketing", "Research", "Design", "Operations", "Automation", "Writing"];
export const tools = ["ChatGPT", "Gemini", "Claude", "Midjourney", "DALL-E", "Copilot"];
export const difficulties = ["Beginner", "Intermediate", "Pro"];

export const trendingTags = [
  "launch",
  "automation",
  "research",
  "image prompts",
  "newsletter",
  "workflow",
  "creator tools"
];

export const benefitCards = [
  {
    icon: BrainCircuit,
    title: "Curated prompt intelligence",
    text: "Find battle-tested prompt patterns by category, tool, difficulty, rating, and copy behavior."
  },
  {
    icon: Workflow,
    title: "Creator-first workflow",
    text: "Creators get moderation status, analytics, prompt growth charts, and a premium publishing path."
  },
  {
    icon: MessageSquareText,
    title: "Community signal",
    text: "Reviews, reports, bookmarks, and trend scoring keep the marketplace useful and trustworthy."
  }
];

export const extraSections = [
  {
    icon: Bot,
    title: "Live prompt testing",
    text: "Test prompts against OpenAI or Gemini from the detail page before you bookmark, fork, or ship them."
  },
  {
    icon: Images,
    title: "Visual prompt gallery",
    text: "Every prompt can carry a thumbnail, making image, branding, and product workflows easier to scan."
  },
  {
    icon: PenTool,
    title: "Markdown-native authoring",
    text: "Write rich, reusable prompts with headings, lists, variables, and formatted instructions."
  }
];
