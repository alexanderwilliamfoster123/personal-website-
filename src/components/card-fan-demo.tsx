import SocialCards from "@/components/ui/card-fan-carousel";

const DEMO_CARDS = [
  { imgUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", alt: "Mountain landscape" },
  { imgUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80", alt: "City night" },
  { imgUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", alt: "Foggy forest" },
  { imgUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80", alt: "Sunlit woods" },
  { imgUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", alt: "Tropical beach" },
  { imgUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80", alt: "Starry mountain" },
  { imgUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80", alt: "Golden sunset" },
  { imgUrl: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80", alt: "Lake reflection" },
  { imgUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80", alt: "Green valley" },
  { imgUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80", alt: "Sunbeam nature" },
];

export default function CardFanDemo() {
  return (
    <div className="min-h-screen flex items-center">
      <SocialCards cards={DEMO_CARDS} />
    </div>
  );
}
