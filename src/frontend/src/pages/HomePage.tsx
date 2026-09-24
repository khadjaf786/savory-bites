import { AboutSection } from "@/components/home/AboutSection";
import { FeaturedDishes } from "@/components/home/FeaturedDishes";
import { HeroSection } from "@/components/home/HeroSection";
import { VisitSection } from "@/components/home/VisitSection";

export function HomePage() {
  return (
    <div data-ocid="home.page">
      <HeroSection />
      <AboutSection />
      <FeaturedDishes />
      <VisitSection />
    </div>
  );
}
