interface GamaTecBadgeProps {
  variant?: 'footer' | 'fixed' | 'inline';
}

const GamaTecBadge = ({ variant = 'footer' }: GamaTecBadgeProps) => {
  // Estilo footer - para usar no rodapé dos projetos dos clientes
  if (variant === 'footer') {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-full h-px bg-border/50" />
        <a
          href="https://gamatec-digital-spark.lovable.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 rounded-full hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25 hover:scale-105 animate-glow-pulse"
        >
          <span className="text-sm font-medium text-primary-foreground">
            Desenvolvido por <span className="font-bold">GamaTec.</span>
          </span>
        </a>
      </div>
    );
  }

  // Estilo fixed - flutuante no canto
  if (variant === 'fixed') {
    return (
      <a
        href="https://gamatec-digital-spark.lovable.app"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/80 rounded-full hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-primary/25 hover:scale-105"
      >
        <span className="text-xs font-medium text-primary-foreground">
          Desenvolvido por <span className="font-bold">GamaTec.</span>
        </span>
      </a>
    );
  }

  // Estilo inline - para usar em qualquer lugar
  return (
    <a
      href="https://gamatec-digital-spark.lovable.app"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/80 rounded-full hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
    >
      <span className="text-xs font-medium text-primary-foreground">
        Desenvolvido por <span className="font-bold">GamaTec.</span>
      </span>
    </a>
  );
};

export default GamaTecBadge;
