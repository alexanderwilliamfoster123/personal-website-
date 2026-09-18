"use client";
import { FiArrowUpRight } from "react-icons/fi";
import type { NewsletterItem } from "./newsletter-list-view";

interface Props {
  article: NewsletterItem;
  onBack: () => void;
  cta?: { label: string; href: string };
}

export default function NewsletterInternalView({ article, cta }: Props) {
  return (
    <article className="company-article">
      <div className="company-brief">
        <h1>{article.title}</h1>
        <div className="company-brief-copy">
          {article.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        {cta && (
          <a className="company-brief-link" href={cta.href} target="_blank" rel="noopener noreferrer">
            {cta.label}
            <FiArrowUpRight size={12} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}
