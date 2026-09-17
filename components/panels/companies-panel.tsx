"use client";

import React, { useEffect } from "react";
// import Image from "next/image";
import { motion } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CompanyCardScroll, { Company } from "@/components/circular-company-scroll";
import { useTheme } from "@/components/theme-provider";
import { UserSession } from "@/lib/auth";
import { TabId } from "@/components/bottom-navigation";

const foundedCompanies: Company[] = [
  {
    id: "vanquish",
    name: "Vanquish",
    logo: "/cards logo/first_card.svg",
    description: "A copy-trading ecosystem connecting traders, strategies, and investors.",
    darkImage: "/images/cards images dark/first_card.png",
    lightImage: "/images/cards images light mode/first_card.png",
  },
  {
    id: "vertus",
    name: "vertus",
    logo: "/cards logo/fourth_card.svg",
    description: "Brain-like cognitive AI for finance, research, and high-stakes decisions.",
    darkImage: "/images/cards images dark/fourth_card.png",
    lightImage: "/images/cards images light mode/fourth_card.png",
  },
  // {
  //   id: "omera",
  //   name: "omera",
  //   logo: "/cards logo/third_card.svg",
  //   description: "AI-driven intelligence and media access built to amplify ambitious companies.",
  //   darkImage: "/images/cards images dark/third_fifth_card.png",
  //   lightImage: "/images/cards images light mode/third_fifth_card.png",
  // },
  {
    id: "paktos",
    name: "Paktos",
    logo: "/cards logo/second_card.svg",
    description: "Next-generation institutional grade algorithmic execution and liquidity routing.",
    darkImage: "/images/cards images dark/second_card.png",
    lightImage: "/images/cards images light mode/second_card.png",
  },
  // {
  //   id: "tootski",
  //   name: "Tootski",
  //   logo: "/cards logo/fifth_card.svg",
  //   description: "High-frequency consumer engagement platform powered by real-time social dynamics.",
  //   darkImage: "/images/cards images dark/third_fifth_card.png",
  //   lightImage: "/images/cards images light mode/third_fifth_card.png",
  // },
];

const investedCompanies: Company[] = [

  {
    id: "omera-invested",
    name: "omera",
    logo: "/cards logo/third_card.svg",
    description: "Proprietary generative distribution networks tailored for high-growth tech firms.",
    darkImage: "/images/cards images dark/third_fifth_card.png",
    lightImage: "/images/cards images light mode/third_fifth_card.png",
  },

];

interface CompaniesPanelProps {
  session: UserSession | null;
  signOut: () => void;
  onNavigateTab?: (tab: TabId) => void;
}

export default function CompaniesPanel({ signOut }: CompaniesPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (

    <section
      className="w-full"
      style={{
        fontFamily: '"Neue Montreal", sans-serif',
      }}
    >
      {/* =========================
      FOUNDED
      ========================= */}
      <div className="relative h-[42vh] w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 3.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
      absolute
      left-1/2
      top-[85%]
      -translate-x-1/2
      -translate-y-1/2
      text-[13px]
      leading-[1.5]
      whitespace-nowrap
      font-medium
    "
          style={{
            fontFamily: '"Neue Montreal", sans-serif',
            color: "var(--text-primary)",
          }}
        >
          founded.
        </motion.div>
      </div>



      {/* =========================
      FOUNDED CARDS
      ========================= */}
      <CompanyCardScroll
        companies={foundedCompanies}
        className="!min-h-0"
        baseRadius={430}
        mobileRadius={210}
        scrollDuration={1600}
        visiblePercentage={42}
        startTrigger="top 35%"
      />

      {/* =========================
      INVESTED HEADING
      ========================= */}
      <div
        className="
      flex
      mt-90
      pb-6
      w-full
      flex-col
      items-center
      justify-center
      px-6
    "
      >
        <div
          className="text-[13px] leading-[1.5]"
          style={{
            color: "var(--text-primary)",
          }}
        >
          <p className="m-0 font-medium">
            invested.
          </p>
        </div>
      </div>

      {/* =========================
      INVESTED CARDS
      ========================= */}
      <CompanyCardScroll
        companies={investedCompanies}
        className="!min-h-0"
        baseRadius={430}
        mobileRadius={210}
        scrollDuration={800}
        visiblePercentage={42}
        startTrigger="top 35%"
      />

      {/* Bottom breathing space */}
     <div className="h-[30vh] md:hidden" />
    </section>
  );
}
