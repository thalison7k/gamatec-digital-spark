import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Servicos } from "@/components/Servicos";
import { DevelopmentPackages } from "@/components/DevelopmentPackages";
import { MaintenancePlans } from "@/components/MaintenancePlans";
import { Portfolio } from "@/components/Portfolio";
import { Differentials } from "@/components/Differentials";
import { FAQ } from "@/components/FAQ";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
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
        <FAQ />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
