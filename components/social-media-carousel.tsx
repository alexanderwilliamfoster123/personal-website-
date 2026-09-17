"use client";
import { useRef, type ReactNode, type MouseEventHandler } from "react";
import { motion, useMotionValue, useTransform, animate, type MotionValue, type PanInfo } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import SnapCardCarousel from "@/components/snap-card-carousel";
import { useMediaQuery } from "@/lib/use-media-query";
export interface SocialCard { title: string; href: string; image?: string; icon?: ReactNode; }
interface Props { cards: SocialCard[]; onClose?: () => void; }
export default function SocialMediaCarousel({ cards }: Props) {
  const nativeScroll = useMediaQuery("(max-width: 767px), (pointer: coarse), (prefers-reduced-motion: reduce)", true);
  if (nativeScroll) return <main className="social-screen screen-centered">
    <h1 className="sr-only">Social media</h1>
    <SnapCardCarousel label="Social media" itemLabels={cards.map(card=>card.title)}>
      {cards.map(card=><a key={card.title} className="minimal-card social-card" href={card.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${card.title} (opens in a new tab)`}>
        <span className="card-icon">{card.icon}</span>
        <span className="card-caption"><span>{card.title}</span><FiArrowUpRight aria-hidden="true" /></span>
      </a>)}
    </SnapCardCarousel>
  </main>;
  return <DesktopSocialCarousel cards={cards} />;
}
function DesktopSocialCarousel({cards}:Props) {
  const progress = useMotionValue(0);
  const start = useRef(0);
  const dragged = useRef(false);
  const compact = useMediaQuery("(max-width: 1023px)");
  const moveTo = (index:number) => animate(progress,index,{type:"spring",stiffness:180,damping:26,mass:.8});
  const finishDrag = (_:MouseEvent|TouchEvent|PointerEvent,info:PanInfo) => {
    const shift = Math.max(-2,Math.min(2,Math.round(-info.offset.x/180-info.velocity.x/800)));
    moveTo(Math.round(start.current)+shift);
  };
  return <main className="social-screen screen-centered">
    <h1 className="sr-only">Social media</h1>
    <motion.div className="social-fan" onPointerDown={()=>{dragged.current=false;}}
      onPanStart={()=>{progress.stop();start.current=progress.get();dragged.current=true;}}
      onPan={(_,info)=>progress.set(progress.get()-info.delta.x/240)} onPanEnd={finishDrag}>
      {cards.map((card,index)=><FanCard key={card.title} card={card} index={index} total={cards.length} progress={progress} compact={compact}
        onFocus={()=>moveTo(index)} onClick={event=>{if(dragged.current)event.preventDefault();}} />)}
    </motion.div>
    <div className="social-fan-controls" aria-label="Social media navigation">
      <button type="button" aria-label="Previous social card" onClick={()=>moveTo(Math.round(progress.get())-1)}><FiArrowLeft aria-hidden="true" /></button>
      <button type="button" aria-label="Next social card" onClick={()=>moveTo(Math.round(progress.get())+1)}><FiArrowRight aria-hidden="true" /></button>
    </div>
  </main>;
}
function FanCard({card,index,total,progress,compact,onFocus,onClick}:{
  card:SocialCard;index:number;total:number;progress:MotionValue<number>;compact:boolean;
  onFocus:()=>void;onClick:MouseEventHandler<HTMLAnchorElement>;
}) {
  const offset=useTransform(progress,p=>{let diff=(index-p)%total;while(diff>total/2)diff-=total;while(diff< -total/2)diff+=total;return diff;});
  const x=useTransform(offset,o=>o*(compact?135:180));
  const rotate=useTransform(offset,o=>o*12);
  const y=useTransform(offset,o=>Math.abs(o)*40);
  const scale=useTransform(offset,o=>Math.max(.72,1-Math.abs(o)*.1));
  const opacity=useTransform(offset,[-total/2,-total/2+.5,0,total/2-.5,total/2],[0,1,1,1,0]);
  const zIndex=useTransform(offset,o=>Math.round(20-Math.abs(o)*3));
  const captionOpacity=useTransform(offset,[-.85,0,.85],[0,1,0]);
  return <motion.a className="minimal-card social-card social-fan-card" href={card.href} target="_blank" rel="noopener noreferrer"
    style={{x,y,rotate,scale,opacity,zIndex}} aria-label={`Visit ${card.title} (opens in a new tab)`} onFocus={onFocus} onClick={onClick} draggable={false}>
    <span className="card-icon">{card.icon}</span>
    <motion.span className="card-caption" style={{opacity:captionOpacity}}><span>{card.title}</span><FiArrowUpRight aria-hidden="true" /></motion.span>
  </motion.a>;
}
