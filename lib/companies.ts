import type { Company } from "@/components/circular-company-scroll";
import type { NewsletterItem } from "@/components/newsletter-list-view";

export interface CompanyProfile extends Company {
  id: string;
  number: string;
  website: string;
  article: NewsletterItem;
}

const date = "September 2026";
const readingTime = "1 min read";

// Briefs checked against the official company websites on 17 September 2026.
export const foundedCompanies: CompanyProfile[] = [
  {
    id: "vertus",
    number: "01",
    name: "Vertus",
    logo: "/cards logo/fourth_card.svg",
    website: "https://www.vertus.ai/",
    description: "Cognitive AI for finance, research, and complex decisions.",
    article: {
      id: "vertus", letter: "", excerpt: "Cognitive AI for finance, research, and complex decisions.",
      date, readingTime, category: "Founded", title: "Vertus",
      subtitle: "Artificial intelligence for finance, science, and complex decisions.",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1000&auto=format&fit=crop&q=85",
      content: [
        "Vertus develops AI for decisions in finance, science, and other complex environments. Its roots are in capital markets, where automated systems have to interpret changing information and respond to real conditions.",
        "The company brings together market automation, access through chat and APIs, and the financial and computing infrastructure that supports these applications.",
        "Its research explores cognitive architectures inspired by biological neural networks, with applications extending from investing to scientific problem-solving."
      ],
    },
  },
  {
    id: "vanquish",
    number: "02",
    name: "Vanquish",
    logo: "/cards logo/first_card.svg",
    website: "https://www.vanquish.so/",
    description: "Infrastructure for launching and operating an investment fund.",
    article: {
      id: "vanquish", letter: "", excerpt: "Infrastructure for launching and operating an investment fund.",
      date, readingTime, category: "Founded", title: "Vanquish",
      subtitle: "The infrastructure behind an investment business.",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=85",
      content: [
        "Vanquish helps entrepreneurs and managers launch an investment business under their own brand. Its services cover fund setup, strategy implementation, investor onboarding, and the technology needed to run the business.",
        "A branded website, investor dashboard, and mobile application bring those services together. Managers can access trading strategies and performance information alongside the tools their investors use.",
        "The aim is to bring the practical parts of launching and operating a fund into one coordinated service."
      ],
    },
  },
  {
    id: "alexander-william",
    number: "03",
    name: "Alexander William",
    logo: "",
    website: "https://www.alexander-william.com/",
    description: "A private family office and co-founder of Vertus and Vanquish.",
    article: {
      id: "alexander-william", letter: "", excerpt: "A private family office and co-founder of Vertus and Vanquish.",
      date, readingTime, category: "Founded", title: "Alexander William",
      subtitle: "A private family office.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=85",
      content: [
        "Alexander William is a private family office with founding roles in Vertus and Vanquish.",
        "The two businesses connect its activities in artificial intelligence and financial technology: Vertus develops cognitive AI systems, while Vanquish provides the tools and services used to launch investment funds."
      ],
    },
  },
];

export const investedCompanies: CompanyProfile[] = [
  {
    id: "omera",
    number: "01",
    name: "Omera",
    logo: "/cards logo/third_card.svg",
    website: "https://omera.ai/",
    description: "Media intelligence, narrative development, and public relations.",
    article: {
      id: "omera", letter: "", excerpt: "Media intelligence, narrative development, and public relations.",
      date, readingTime, category: "Invested", title: "Omera",
      subtitle: "Helping good companies find their audience.",
      image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1000&auto=format&fit=crop&q=85",
      content: [
        "Omera combines media intelligence with public relations to help companies reach the audiences that matter to them. The focus is on finding a clear narrative and choosing the right moment to put it in front of the market.",
        "Its services span story development, monitoring emerging trends, and arranging press coverage through editorial relationships.",
        "By connecting research, timing, and distribution, Omera helps businesses translate what they are building into a story people can understand."
      ],
    },
  },
];

export const companyProfiles = [...foundedCompanies, ...investedCompanies];
