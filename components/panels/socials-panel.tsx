"use client";
import SocialMediaCarousel from "@/components/social-media-carousel";
import { FaXTwitter, FaInstagram, FaYoutube, FaLinkedinIn } from "react-icons/fa6";
const cards = [
  { title: "X", href: "https://x.com/alexwfostr", icon: <FaXTwitter aria-hidden="true" /> },
  { title: "Instagram", href: "https://www.instagram.com/alexwfost/", icon: <FaInstagram aria-hidden="true" /> },
  { title: "YouTube", href: "https://www.youtube.com/@alexwfoster", icon: <FaYoutube aria-hidden="true" /> },
  { title: "LinkedIn", href: "https://www.linkedin.com/in/alexander-w-foster/", icon: <FaLinkedinIn aria-hidden="true" /> },
];
export default function SocialsPanel() { return <SocialMediaCarousel cards={cards} />; }
