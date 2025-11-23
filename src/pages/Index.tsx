import { Hero } from "@/components/Hero";
import { DevelopmentPackages } from "@/components/DevelopmentPackages";
import { MaintenancePlans } from "@/components/MaintenancePlans";
import { Differentials } from "@/components/Differentials";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <DevelopmentPackages />
      <MaintenancePlans />
      <Differentials />
      <Footer />
    </div>
  );
};

export default Index;
