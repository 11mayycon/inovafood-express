import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Partner {
  name: string;
  logo: React.ReactNode;
  color: string;
  bgColor: string;
}

const defaultPartners: Partner[] = [
  {
    name: "iFood",
    color: "#EA1D2C",
    bgColor: "rgba(234, 29, 44, 0.1)",
    logo: (
      <svg viewBox="0 0 100 40" className="w-full h-full">
        <text x="50" y="28" textAnchor="middle" fill="#EA1D2C" fontWeight="bold" fontSize="24" fontFamily="Arial, sans-serif">iFood</text>
      </svg>
    ),
  },
  {
    name: "Rappi",
    color: "#FF441F",
    bgColor: "rgba(255, 68, 31, 0.1)",
    logo: (
      <svg viewBox="0 0 100 40" className="w-full h-full">
        <text x="50" y="28" textAnchor="middle" fill="#FF441F" fontWeight="bold" fontSize="22" fontFamily="Arial, sans-serif">Rappi</text>
      </svg>
    ),
  },
  {
    name: "Uber Eats",
    color: "#06C167",
    bgColor: "rgba(6, 193, 103, 0.1)",
    logo: (
      <svg viewBox="0 0 120 40" className="w-full h-full">
        <text x="60" y="28" textAnchor="middle" fill="#06C167" fontWeight="bold" fontSize="18" fontFamily="Arial, sans-serif">Uber Eats</text>
      </svg>
    ),
  },
  {
    name: "99Food",
    color: "#FFDD00",
    bgColor: "rgba(255, 221, 0, 0.15)",
    logo: (
      <svg viewBox="0 0 100 40" className="w-full h-full">
        <text x="50" y="28" textAnchor="middle" fill="#FFB800" fontWeight="bold" fontSize="20" fontFamily="Arial, sans-serif">99Food</text>
      </svg>
    ),
  },
  {
    name: "Aiqfome",
    color: "#7B2CBF",
    bgColor: "rgba(123, 44, 191, 0.1)",
    logo: (
      <svg viewBox="0 0 100 40" className="w-full h-full">
        <text x="50" y="28" textAnchor="middle" fill="#7B2CBF" fontWeight="bold" fontSize="18" fontFamily="Arial, sans-serif">aiqfome</text>
      </svg>
    ),
  },
];

interface PartnersCarouselProps {
  partners?: Partner[];
}

export default function PartnersCarousel({ partners = defaultPartners }: PartnersCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const allPartners = [...partners, ...partners, ...partners];

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 200;
      const newPosition = direction === "left" 
        ? containerRef.current.scrollLeft - scrollAmount
        : containerRef.current.scrollLeft + scrollAmount;
      containerRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-sidebar-background via-transparent to-sidebar-background z-10 pointer-events-none" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute h-full w-32 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine"
          style={{ left: "-10%" }}
        />
      </div>

      <div className="container relative z-20">
        <h3 className="text-center text-sidebar-foreground/60 mb-10 text-sm uppercase tracking-[0.2em] font-semibold">
          Integrado com as principais plataformas
        </h3>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-sidebar-background/80 backdrop-blur-sm border border-sidebar-border/50 text-sidebar-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110 shadow-xl"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-sidebar-background/80 backdrop-blur-sm border border-sidebar-border/50 text-sidebar-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110 shadow-xl"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        {/* Carousel Track */}
        <div 
          ref={containerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-8 py-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div 
            className={`flex gap-6 ${isPaused ? "" : "animate-scroll-partners"}`}
            style={{ animationPlayState: isPaused ? "paused" : "running" }}
          >
            {allPartners.map((partner, i) => (
              <a
                key={`${partner.name}-${i}`}
                href="#"
                className="group/card flex-shrink-0 relative"
              >
                <div 
                  className="w-40 h-20 md:w-48 md:h-24 rounded-2xl border border-sidebar-border/30 flex items-center justify-center px-6 transition-all duration-500 hover:scale-110 hover:shadow-2xl cursor-pointer relative overflow-hidden"
                  style={{ 
                    backgroundColor: partner.bgColor,
                    boxShadow: `0 4px 20px ${partner.color}20`
                  }}
                >
                  {/* Glow effect on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                    style={{ 
                      background: `radial-gradient(circle at center, ${partner.color}30 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Logo */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {partner.logo}
                  </div>
                  
                  {/* Border glow on hover */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                    style={{ 
                      boxShadow: `inset 0 0 20px ${partner.color}40, 0 0 30px ${partner.color}30`
                    }}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-sidebar-background to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-sidebar-background to-transparent z-20 pointer-events-none" />
    </section>
  );
}
