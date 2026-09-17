"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useTheme } from "@/components/theme-provider";

export interface NewsletterItem {
  id: string;
  letter: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readingTime: string;
  image: string;
  subtitle: string;
  content: string[];
}

export const defaultNewsletters: NewsletterItem[] = [
  {
    id: "on-building-quietly",
    letter: "letter 1 · july 2026",
    title: "On building quietly",
    subtitle: "A quiet reflection on building companies, making decisions, and protecting focus in a noisy world.",
    excerpt:
      "The best work I have done never announced itself. It arrived slowly, in the margins of ordinary days, and by the time anyone noticed it was already load-bearing. I have come to...",
    date: "January 2026",
    category: "Founder Notes",
    readingTime: "4 min read",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    content: [
      "There is a certain kind of work that only happens in silence.",
      "Not the silence of doing nothing, but the silence that appears when the noise has finally been removed. No constant meetings. No performative urgency. No endless reaction to things that feel important only because they are loud.",
      "From my private office, the best decisions rarely arrive quickly. They usually come after sitting with an idea long enough to understand whether it has weight.",
      "I keep returning to one question:\n**What is worth building, even if no one applauds it at the beginning?**",
      "That question has shaped how I think about ventures, people, capital, and time. The strongest ideas are not always the loudest. Sometimes they begin as quiet observations, repeated frustrations, or small inefficiencies that most people have learned to ignore.",
      "The private office is not a symbol of distance. It is a place for clarity. A place to read, write, think, review, and decide. In a world where everyone is encouraged to broadcast constantly, **private thinking has become a competitive advantage.**",
      "**The future will not be built by people who are simply busy. It will be built by people who can separate signal from noise.**",
      "And that is the work I return to every day.",
    ],
  },
  {
    id: "simulation-as-a-way-of-seeing",
    letter: "letter 2 · may 2026",
    title: "Simulation as a way of seeing",
    subtitle: "Why modeling scenarios beats predicting the future, and how to operate under uncertainty.",
    excerpt:
      "If you want to know what a crowd will do, the worst method is to ask the crowd. People answer as the person they wish they were. The gap between the stated and the done is...",
    date: "May 2026",
    category: "Philosophy & Systems",
    readingTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80",
    content: [
      "If you want to know what a crowd will do, the worst method is to ask the crowd.",
      "People answer as the person they wish they were. The gap between the stated preference and revealed action is where entire industries collapse and new ones are built.",
      "When we simulate systems instead of predicting static outcomes, we begin to see feedback loops that intuition routinely misses.",
      "**Resilient systems are never built on prediction; they are built on rapid feedback and low cost of error.**",
      "By designing environments that tolerate small failures, you insulate yourself from catastrophic ones.",
    ],
  },
  {
    id: "interfaces-that-stay-out-of-the-way",
    letter: "letter 3 · february 2026",
    title: "Interfaces that stay out of the way",
    subtitle: "The craft of designing calm computing tools that respect human attention.",
    excerpt:
      "Every interface is a guest in someone's attention. Most software forgets this and behaves like a host, rearranging the furniture, announcing itself, asking for reviews. The software I...",
    date: "February 2026",
    category: "Design Engineering",
    readingTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80",
    content: [
      "Every interface is a guest in someone's attention.",
      "Most software forgets this and behaves like a host, rearranging the furniture, announcing itself, asking for reviews. The software I admire most operates with quiet confidence.",
      "Good design is not just what feels modern on first impression; it is what remains invisible after a thousand hours of daily utility.",
      "**When friction is eliminated deliberately, speed ceases to feel frantic and begins to feel effortless.**",
    ],
  },
  {
    id: "notes-to-a-younger-builder",
    letter: "letter 4 · november 2025",
    title: "Notes to a younger builder",
    subtitle: "Hard-won lessons on leverage, taste, and avoiding early career traps.",
    excerpt:
      "Nobody knows what they are doing at the level you imagine they do. The senior engineer is confident about a smaller set of things than you think, and the confidence came from being...",
    date: "November 2025",
    category: "Career & Craft",
    readingTime: "8 min read",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    content: [
      "Nobody knows what they are doing at the level you imagine they do.",
      "The senior engineer is confident about a smaller set of things than you think, and the confidence came from being burned by complexity and choosing simplicity instead.",
      "Taste is not innate; it is the residue of thousands of deliberate critiques against work you respect.",
      "**Build things that endure. Focus on depth over surface prestige.**",
    ],
  },
];

interface NewsletterListViewProps {
  onBack: () => void;
  onSelectArticle: (article: NewsletterItem) => void;
}

// Linear style stagger and blur fade-in variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

const linearItemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

export default function NewsletterListView({
  onBack,
  onSelectArticle,
}: NewsletterListViewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="relative flex min-h-dvh w-full flex-col overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 select-none transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Top Header */}

      {/* Main Content Container */}
      <div className="mx-auto w-full max-w-3xl pb-32 pt-32">
        {/* Title */}
        <motion.h1
          variants={linearItemVariants}
          className="mb-8 sm:mb-12 text-center text-[13px]  font-medium tracking-tight"
          style={{
            fontFamily: '"Neue Montreal", sans-serif',
            color: "var(--text-primary)",
          }}
        >
         Writing.
        </motion.h1>

        {/* Newsletter Article Rows */}
        <div className="flex flex-col gap-8 sm:gap-8">
          {defaultNewsletters.map((item) => (
            <motion.div
              key={item.id}
              variants={linearItemVariants}
              whileHover={{ y: -2 }}
              onClick={() => onSelectArticle(item)}
              className="
                group
                flex
                cursor-pointer
                flex-row
                items-center
                justify-between
                gap-4
                sm:gap-8
                rounded-2xl
                border
                border-transparent
                bg-transparent
                p-2
                sm:p-4
                transition-all
                duration-300
              "
            >
              {/* Left Column: Metadata, Title, Excerpt, Read Action */}
              <div className="flex flex-1 flex-col items-start pr-2 sm:pr-4">
                <span
                  className="text-[11px] sm:text-xs font-normal tracking-tight lowercase"
                  style={{
                    fontFamily: '"Neue Montreal", sans-serif',
                    color: "var(--text-tertiary)",
                  }}
                >
                  {item.letter}
                </span>

                <h2
                  className="mt-1 sm:mt-1.5 text-[13px] font-medium"
                  style={{
                    fontFamily: '"Neue Montreal", sans-serif',
                    color: "var(--text-primary)",
                  }}
                >
                  {item.title}
                </h2>

                <p
                  className="mt-1.5 sm:mt-2 text-[11px] leading-relaxed line-clamp-2 font-normal max-w-[190px] xs:max-w-[220px] sm:max-w-none"
                  style={{
                    fontFamily: '"Neue Montreal", sans-serif',
                    color: "var(--text-secondary)",
                  }}
                >
                  {item.excerpt}
                </p>

                <div
                  className="mt-2.5 sm:mt-3.5 flex items-center gap-1.5 text-[10px] font-medium group-hover:translate-x-1 transition-all"
                  style={{
                    fontFamily: '"Neue Montreal", sans-serif',
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>Read</span>
                  <FiArrowRight size={13} />
                </div>
              </div>

              {/* Right Column: Image (Square thumbnail on mobile, Landscape on desktop) */}
              <div className="h-[120px] w-[88px] xs:h-[100px] xs:w-[100px] sm:h-[135px] sm:w-[220px] md:w-[250px] shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 shadow-lg">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
