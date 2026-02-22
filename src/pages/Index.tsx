import { Hero } from "@/components/Hero";
import { DevelopmentPackages } from "@/components/DevelopmentPackages";
import { MaintenancePlans } from "@/components/MaintenancePlans";
import { Portfolio } from "@/components/Portfolio";
import { Differentials } from "@/components/Differentials";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Hero />
      <DevelopmentPackages />
      <MaintenancePlans />
      <Portfolio />
      <Differentials />
      <Footer />
    </div>
  );
};

export default Index;
