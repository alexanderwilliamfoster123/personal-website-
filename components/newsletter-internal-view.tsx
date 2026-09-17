"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { useTheme } from "@/components/theme-provider";
import { NewsletterItem } from "./newsletter-list-view";

interface NewsletterInternalViewProps {
  article: NewsletterItem;
  onBack: () => void;
}

// Linear signature blur + translateY + opacity staggered animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
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

export default function NewsletterInternalView({
  article,
  onBack,
}: NewsletterInternalViewProps) {
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

      {/* Main Article Container */}
      <div className="mx-auto w-full max-w-2xl pb-36 pt-6">
        {/* Top 3-Column Metadata Header */}
        <motion.div
          variants={linearItemVariants}
          className="grid grid-cols-3 gap-4  "
        >
          <div>
            <span className="block text-[10px] font-normal " 
            style={{      
            color:"var(--text-primary)" 
            }}>
              Date
            </span>
            <span
              className="mt-4 block text-xs font-medium"
              style={{
                fontFamily: '"Neue Montreal", sans-serif',
                color:"var(--text-primary)"
              }}
            >
              {article.date}
            </span>
          </div>

          <div>
            <span className="block text-[10px] font-normal"  style={{      
            color:"var(--text-primary)" 
            }}>
              Category
            </span>
            <span
              className="mt-4 block text-xs  font-medium text-[#F2F2F2]"
              style={{
                fontFamily: '"Neue Montreal", sans-serif',
                 color:"var(--text-primary)"
              }}
            >
              {article.category}
            </span>
          </div>

          <div>
            <span className="block text-[10px] font-normal"
              style={{      
            color:"var(--text-primary)" 
            }}>
              Reading Time
            </span>
            <span
              className="mt-4 block text-xs  font-medium text-[#F2F2F2]"
              style={{
                fontFamily: '"Neue Montreal", sans-serif',
                 color:"var(--text-primary)"
              }}
            >
              {article.readingTime}
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={linearItemVariants}
          className="mt-10 text-sm font-normal"
          style={{
            fontFamily: '"Neue Montreal", sans-serif',
            color:"var(--text-primary)"
          }}
        >
          {article.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={linearItemVariants}
          className="mt-3 text-xs  text-text-secondary  font-normal"
          style={{
            fontFamily: '"Neue Montreal", sans-serif',
          }}
        >
          {article.subtitle}
        </motion.p>

        {/* Featured Image */}
        <motion.div
          variants={linearItemVariants}
          className="my-8 h-[220px] sm:h-[300px] md:h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
        >
          <img
            src={article.image}
            alt={article.title}
            className="h-full w-full object-cover grayscale"
          />
        </motion.div>

        {/* Article Body Content with Staggered Linear Fade */}
        <div
          className="space-y-6 text-[13px] leading-relaxed text-text-secondary font-normal"
          style={{
            fontFamily: '"Neue Montreal", sans-serif',
          }}
        >
          {article.content.map((paragraph, index) => {
            // if (paragraph.includes("**")) {
            //   const parts = paragraph.split("**");
            //   return (
            //     <motion.p variants={linearItemVariants} key={index}>
            //       {parts.map((part, i) =>
            //         i % 2 === 1 ? (
            //           <strong key={i} className="font-semibold text-white">
            //             {part}
            //           </strong>
            //         ) : (
            //           part
            //         )
            //       )}
            //     </motion.p>
            //   );
            // }
            return (
              <motion.p variants={linearItemVariants} key={index}>
                {paragraph}
              </motion.p>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
