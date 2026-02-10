import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useSounds } from "@/components/SoundProvider";

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  delay?: number;
}

export const PricingCard = ({ 
  title, 
  description, 
  price, 
  features, 
  highlighted = false,
  delay = 0 
}: PricingCardProps) => {
  const { play } = useSounds();

  return (
    <Card 
      className={`relative p-8 hover-lift ${
        highlighted 
          ? 'border-primary glow-border bg-gradient-to-br from-card via-secondary to-card' 
          : 'border-border bg-card'
      }`}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => play("hover")}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
          Mais Popular
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-2xl font-orbitron font-bold text-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="text-4xl font-orbitron font-black text-primary">
            {price}
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-foreground/90 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button 
          className={`w-full ${
            highlighted 
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground glow-border' 
              : 'bg-secondary hover:bg-secondary/80 text-foreground'
          }`}
          size="lg"
          onClick={() => { play("success"); window.open('https://wa.me/5511961442363?text=Olá! Tenho interesse no plano ' + title, '_blank'); }}
        >
          Escolher Plano
        </Button>
      </div>
    </Card>
  );
};
