import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { DevelopmentPackages } from "@/components/DevelopmentPackages";
import { MaintenancePlans } from "@/components/MaintenancePlans";
import { Portfolio } from "@/components/Portfolio";
import { Differentials } from "@/components/Differentials";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main id="main-content" role="main" aria-label="Conteúdo principal">
        <Hero />
        <DevelopmentPackages />
        <MaintenancePlans />
        <Portfolio />
        <Differentials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
