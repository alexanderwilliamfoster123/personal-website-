"use client";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import { useMediaQuery } from "@/lib/use-media-query";
import type { NewsletterItem } from "./newsletter-list-view";
interface Props {article:NewsletterItem;onBack:()=>void;cta?:{label:string;href:string};}
const containerVariants={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.08,delayChildren:.06}}};
const itemVariants={hidden:{opacity:0,y:20,filter:"blur(10px)"},visible:{opacity:1,y:0,filter:"blur(0px)",transition:{duration:.65,ease:[.16,1,.3,1] as const}}};
export default function NewsletterInternalView({article,cta}:Props) {
  const reduced=useMediaQuery("(prefers-reduced-motion: reduce)");
  const variants=reduced?undefined:itemVariants;
  return <motion.article variants={containerVariants} initial={reduced?false:"hidden"} animate="visible" className="company-article relative flex min-h-dvh w-full flex-col px-8 sm:px-10" style={{backgroundColor:"var(--background)",color:"var(--foreground)"}}>
    <div className="mx-auto w-full max-w-xl">
      <motion.div variants={variants} className="grid grid-cols-3 gap-4">
        {[["Date",article.date],["Category",article.category],["Reading Time",article.readingTime]].map(([label,value])=><div key={label}>
          <span className="block text-[12px] md:text-[10px]">{label}</span>
          <span className="mt-3 md:mt-4 block text-[13px] md:text-xs font-medium">{value}</span>
        </div>)}
      </motion.div>
      <motion.h1 variants={variants} className="mt-8 text-[17px] md:text-sm font-normal">{article.title}</motion.h1>
      <motion.p variants={variants} className="mt-3 text-[15px] leading-relaxed md:text-xs text-text-secondary">{article.subtitle}</motion.p>
      <motion.div variants={variants} className="my-7 aspect-[1.75] md:aspect-auto md:h-[300px] w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl">
        <img src={article.image} alt={article.title} decoding="async" className="h-full w-full object-cover grayscale" />
      </motion.div>
      <div className="space-y-6 text-[16px] leading-[1.75] md:text-[14px] text-text-secondary">
        {article.content.map((paragraph,index)=><motion.p variants={variants} key={index}>{paragraph}</motion.p>)}
      </div>
      {cta&&<motion.div variants={variants} className="mt-10 border-t pt-6" style={{borderColor:"var(--stroke-1)"}}>
        <a href={cta.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-3 rounded-lg border px-5 py-3 text-[14px] transition-opacity hover:opacity-70" style={{borderColor:"var(--stroke-1)"}}>
          {cta.label}<FiArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span>
        </a>
      </motion.div>}
    </div>
  </motion.article>;
}
