"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SocialMediaCarousel from "@/components/social-media-carousel";
import WritingsView from "@/components/writings-view";
import NewsletterListView, {
  NewsletterItem,
  defaultNewsletters,
} from "@/components/newsletter-list-view";
import NewsletterInternalView from "@/components/newsletter-internal-view";
import FramesGalleryView from "@/components/frames-gallery-view";
import {
  FaXTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaPenNib,
  FaRegNoteSticky,
  FaCamera,
} from "react-icons/fa6";
import InstagramIcon from "@/components/svg/instagram";
import LinkinInIcon from "@/components/svg/linkedIn";
import TwitterIcon from "@/components/svg/twitter";
import YoutubeIcon from "@/components/svg/youtube";
import FacebookIcon from "../svg/facebook";
import SocialFolder from "@/components/social-folder";
import BlurCarousel, { BlurCarouselItem } from "@/components/blur-carousel";
import { UserSession } from "@/lib/auth";
import { TabId } from "@/components/bottom-navigation";

type SocialsView =
  | "folders"
  | "social-media"
  | "writings"
  | "newsletter-list"
  | "newsletter-internal"
  | "frames";

interface SocialsPanelProps {
  session: UserSession | null;
  signOut: () => void;
  onNavigateTab?: (tab: TabId) => void;
  registerBackAction?: (action: (() => void) | null) => void;
}

export default function SocialsPanel({ signOut, registerBackAction }: SocialsPanelProps) {
  const [socialMediaOpen, setSocialMediaOpen] = useState(false);
  const [socialsView, setSocialsView] = useState<SocialsView>("folders");
  const [selectedNewsletter, setSelectedNewsletter] = useState<NewsletterItem | null>(
    defaultNewsletters[0]
  );

  // Centralized Back Button handler registration
  useEffect(() => {
    if (registerBackAction) {
      if (socialMediaOpen) {
        registerBackAction(() => navigateToSocialMedia(false));
      } else if (socialsView === "newsletter-internal") {
        registerBackAction(() => navigateToView("newsletter-list"));
      } else if (socialsView === "newsletter-list") {
        registerBackAction(() => navigateToView("writings"));
      } else if (socialsView === "writings" || socialsView === "frames") {
        registerBackAction(() => navigateToView("folders"));
      } else {
        registerBackAction(null);
      }
    }
  }, [socialsView, socialMediaOpen, registerBackAction]);

  // Sync internal view transitions with window browser history
  useEffect(() => {
    // Ensure initial state exists with socialsView
    if (typeof window !== "undefined") {
      if (
        !window.history.state ||
        window.history.state.spaTab !== "socials" ||
        !window.history.state.socialsView
      ) {
        window.history.replaceState(
          {
            spaTab: "socials",
            socialsView: "folders",
            socialMediaOpen: false,
          },
          ""
        );
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.spaTab === "socials") {
        setSocialsView(state.socialsView || "folders");
        setSocialMediaOpen(Boolean(state.socialMediaOpen));
        if (state.articleId) {
          const found = defaultNewsletters.find((n) => n.id === state.articleId);
          if (found) setSelectedNewsletter(found);
        }
      } else {
        setSocialsView("folders");
        setSocialMediaOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateToView = (view: SocialsView, article?: NewsletterItem) => {
    if (article) {
      setSelectedNewsletter(article);
    }
    setSocialsView(view);
    setSocialMediaOpen(false);
    if (typeof window !== "undefined") {
      if (view === "folders") {
        window.history.replaceState(
          {
            spaTab: "socials",
            socialsView: "folders",
            socialMediaOpen: false,
          },
          ""
        );
      } else {
        window.history.pushState(
          {
            spaTab: "socials",
            socialsView: view,
            socialMediaOpen: false,
            articleId: article ? article.id : selectedNewsletter?.id,
          },
          ""
        );
      }
    }
  };

  const navigateToSocialMedia = (open: boolean) => {
    setSocialMediaOpen(open);
    if (typeof window !== "undefined") {
      if (open) {
        window.history.pushState(
          {
            spaTab: "socials",
            socialsView,
            socialMediaOpen: true,
            articleId: selectedNewsletter?.id,
          },
          ""
        );
      } else {
        window.history.replaceState(
          {
            spaTab: "socials",
            socialsView,
            socialMediaOpen: false,
            articleId: selectedNewsletter?.id,
          },
          ""
        );
      }
    }
  };

  const handleBackNavigation = () => {
    if (socialMediaOpen) {
      navigateToSocialMedia(false);
    } else if (socialsView === "newsletter-internal") {
      navigateToView("newsletter-list");
    } else if (socialsView === "newsletter-list") {
      navigateToView("writings");
    } else if (socialsView === "writings" || socialsView === "frames") {
      navigateToView("folders");
    }
  };

  const socialMediaCards = [
    {
      title: "LinkedIn",
      username: "alexander-w-foster",
      href: "https://www.linkedin.com/in/alexander-w-foster/",
      icon: <FaLinkedin size={15} />,
    },
    {
      title: "Instagram",
      username: "@alexwfost",
      href: "https://www.instagram.com/alexwfost/",
      icon: <FaInstagram size={15} />,
    },
    {
      title: "X",
      username: "@alexwfostr",
      href: "https://x.com/alexwfostr",
      icon: <FaXTwitter size={15} />,
    },
    {
      title: "YouTube",
      username: "@alexwfoster",
      href: "https://www.youtube.com/@alexwfoster",
      icon: <FaYoutube size={15} />,
    },
    {
      title: "Facebook",
      username: "@alexwfoster",
      href: "https://www.facebook.com/",
      icon: <FacebookIcon className="h-5 w-5" />,
    },
  ];

  const writingCards = [
    {
      title: "newsletter",
      username: "letters",
      href: "#",
      icon: <FaPenNib size={14} />,
      onClick: () => navigateToView("writings"),
    },
    {
      title: "forbes column",
      username: "forbes",
      href: "https://forbes.com",
      icon: <FaRegNoteSticky size={14} />,
    },
  ];

  const framesCards = [
    {
      title: "Moments",
      username: "gallery",
      href: "#",
      icon: <FaCamera size={14} />,
      onClick: () => navigateToView("frames"),
    },
  ];

  const mobileCarouselItems: BlurCarouselItem[] = [
    {
      id: "social-media",
      content: (isActive) => (
        <SocialFolder
          title="Social media"
          cards={socialMediaCards}
          isOpen={isActive}
          onFrontClick={() => navigateToSocialMedia(true)}
        />
      ),
    },
    {
      id: "writing",
      content: (isActive) => (
        <SocialFolder
          title="Writing"
          cards={writingCards}
          isOpen={isActive}
          onFrontClick={() => navigateToView("writings")}
        />
      ),
    },
    {
      id: "frames",
      content: (isActive) => (
        <SocialFolder
          title="Frames"
          cards={framesCards}
          isOpen={isActive}
          onFrontClick={() => navigateToView("frames")}
        />
      ),
    },
  ];

  return (
    <main
      className="relative min-h-dvh w-full overflow-x-hidden select-none transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Main View Router */}
      <AnimatePresence mode="wait">
        {socialsView === "folders" && (
          <motion.div
            key="folders-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative flex min-h-dvh w-full flex-col justify-between px-6 py-8 sm:px-10 sm:py-10"
          >
            {/* ================= HEADER ================= */}

            {/* ================= FOLDERS & HEADING ================= */}
            <div className="my-auto flex flex-1 flex-col items-center justify-center gap-10 sm:gap-14 py-6 sm:py-12">
              {/* Text above social folders */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-[13px] leading-[1.5] font-medium text-foreground whitespace-nowrap select-none"
                style={{
                  fontFamily: '"Neue Montreal", sans-serif',
                }}
              >
                digital real estate.
              </motion.div>

              {/* Mobile (< 640px): Blur Carousel */}
              <div className="w-full sm:hidden flex items-center justify-center">
                <BlurCarousel items={mobileCarouselItems} initialIndex={0} />
              </div>

              {/* Desktop (>= 640px): Horizontal Row */}
              <div className="hidden sm:flex flex-row items-center justify-center ">
                {/* SOCIAL MEDIA FOLDER */}
                <SocialFolder
                  title="Social Media"
                  cards={socialMediaCards}
                  onFrontClick={() => navigateToSocialMedia(true)}
                />

                {/* WRITING FOLDER */}
                <SocialFolder
                  title="Writing"
                  cards={writingCards}
                  onFrontClick={() => navigateToView("writings")}
                />

                {/* FRAMES FOLDER */}
                <SocialFolder
                  title="Frames"
                  cards={framesCards}
                  onFrontClick={() => navigateToView("frames")}
                />
              </div>
            </div>
          </motion.div>
        )}

        {socialsView === "writings" && (
          <WritingsView
            key="writings-view"
            cards={writingCards}
            onBack={handleBackNavigation}
            onOpenNewsletter={() => navigateToView("newsletter-list")}
            onOpenForbes={() => {
              window.open("https://forbes.com", "_blank");
            }}
          />
        )}

        {socialsView === "newsletter-list" && (
          <NewsletterListView
            key="newsletter-list-view"
            onBack={handleBackNavigation}
            onSelectArticle={(article) => {
              navigateToView("newsletter-internal", article);
            }}
          />
        )}

        {socialsView === "newsletter-internal" && (
          <NewsletterInternalView
            key="newsletter-internal-view"
            article={selectedNewsletter || defaultNewsletters[0]}
            onBack={handleBackNavigation}
          />
        )}

        {socialsView === "frames" && (
          <FramesGalleryView
            key="frames-gallery-view"
            onBack={handleBackNavigation}
          />
        )}
      </AnimatePresence>

      {/* ================= SOCIAL MEDIA CAROUSEL ================= */}
      {socialMediaOpen && (
        <SocialMediaCarousel
          key="social-media-modal-view"
          cards={[
            {
              title: "LinkedIn",
              username: "alexander-w-foster",
              href: "https://www.linkedin.com/in/alexander-w-foster/",
              icon: <LinkinInIcon className="h-5 w-5" />,
            },
            {
              title: "Instagram",
              username: "@alexwfost",
              href: "https://www.instagram.com/alexwfost/",
              icon: <InstagramIcon className="h-5 w-5" />,
            },
            {
              title: "X",
              username: "@alexwfostr",
              href: "https://x.com/alexwfostr",
              icon: <TwitterIcon className="h-5 w-5" />,
            },
            {
              title: "YouTube",
              username: "@alexwfoster",
              href: "https://www.youtube.com/@alexwfoster",
              icon: <YoutubeIcon className="h-5 w-5" />,
            },
             {
              title: "Facebook",
              username: "@alexwfoster",
              href: "https://www.facebook.com/",
              icon: <FacebookIcon className="h-5 w-5" />,
            },
          ]}
          onClose={() => navigateToSocialMedia(false)}
        />
      )}
    </main>
  );
}
