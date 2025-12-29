import gamatecLogo from '@/assets/gamatec-logo.png';

interface GamaTecBadgeProps {
  position?: 'bottom-left' | 'bottom-right' | 'bottom-center';
  variant?: 'fixed' | 'inline';
}

const GamaTecBadge = ({ position = 'bottom-right', variant = 'fixed' }: GamaTecBadgeProps) => {
  const positionClasses = {
    'bottom-left': 'left-4',
    'bottom-right': 'right-4',
    'bottom-center': 'left-1/2 -translate-x-1/2',
  };

  if (variant === 'inline') {
    return (
      <a
        href="https://gamatec-digital-spark.lovable.app"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm border border-primary/30 rounded-full hover:border-primary/60 transition-all duration-300 group"
      >
        <img 
          src={gamatecLogo} 
          alt="GamaTec" 
          className="w-5 h-5 object-contain"
        />
        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
          Desenvolvido por <span className="text-primary font-bold">GamaTec</span>
        </span>
      </a>
    );
  }

  return (
    <a
      href="https://gamatec-digital-spark.lovable.app"
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-4 ${positionClasses[position]} z-50 flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm border border-primary/30 rounded-full hover:border-primary/60 hover:scale-105 transition-all duration-300 group shadow-lg`}
    >
      <img 
        src={gamatecLogo} 
        alt="GamaTec" 
        className="w-6 h-6 object-contain"
      />
      <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
        Desenvolvido por <span className="text-primary font-bold">GamaTec</span>
      </span>
    </a>
  );
};

export default GamaTecBadge;
