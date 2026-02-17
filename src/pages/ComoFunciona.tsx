import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSounds } from "@/components/SoundProvider";
import {
  Server, Brain, Code2, GitBranch, Smartphone, Users,
  ArrowLeft, Cog, CheckCircle2, BarChart3, GraduationCap,
  Cpu, Layers, Palette, ClipboardCheck, Lightbulb, BookOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/gamatec-hero-academic.jpeg";

const GearSVG = () => (
  <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
    <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin-slow_20s_linear_infinite]" style={{ filter: "drop-shadow(0 0 20px hsl(195 100% 50% / 0.4))" }}>
      <defs>
        <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(195, 100%, 50%)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(280, 100%, 60%)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d="M100 20 L108 38 L126 30 L122 50 L142 50 L132 66 L148 76 L132 82 L140 100 L122 96 L120 116 L104 106 L100 124 L96 106 L80 116 L78 96 L60 100 L68 82 L52 76 L68 66 L58 50 L78 50 L74 30 L92 38 Z"
        fill="none"
        stroke="url(#gearGrad)"
        strokeWidth="2"
      />
      <circle cx="100" cy="72" r="28" fill="none" stroke="url(#gearGrad)" strokeWidth="2" />
      <circle cx="100" cy="72" r="12" fill="hsl(195, 100%, 50%)" fillOpacity="0.15" stroke="url(#gearGrad)" strokeWidth="1.5" />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <Cog className="w-12 h-12 text-primary/60 animate-[spin-slow_10s_linear_infinite_reverse]" />
    </div>
  </div>
);

interface SectionBlockProps {
  icon: React.ReactNode;
  number: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}

const SectionBlock = ({ icon, number, title, children, delay = 0 }: SectionBlockProps) => {
  const { ref, isVisible } = useScrollReveal();
  const { play } = useSounds();

  return (
    <div ref={ref} className={`scroll-reveal ${isVisible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        className="relative p-6 md:p-8 border-border bg-card hover:border-primary/50 transition-all duration-500 card-3d shimmer"
        onMouseEnter={() => play("hover")}
      >
        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-orbitron text-xs font-bold shadow-lg">
          {number}
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-secondary border border-border flex-shrink-0">
            {icon}
          </div>
          <div className="space-y-3 flex-1">
            <h3 className="text-xl font-orbitron font-bold text-foreground">{title}</h3>
            <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
              {children}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const techConcepts = [
  { icon: <Code2 className="w-5 h-5 text-primary" />, title: "Engenharia de Software", desc: "Aplicação de métodos sistemáticos para desenvolvimento, operação e manutenção de software." },
  { icon: <Brain className="w-5 h-5 text-primary" />, title: "IA Aplicada ao Desenvolvimento", desc: "Uso de modelos de linguagem para geração e otimização de código-fonte." },
  { icon: <Layers className="w-5 h-5 text-primary" />, title: "Low-code / No-code", desc: "Plataformas que reduzem a necessidade de codificação manual no desenvolvimento." },
  { icon: <GitBranch className="w-5 h-5 text-primary" />, title: "Versionamento", desc: "Controle de versão para rastreabilidade e colaboração no código-fonte." },
  { icon: <Smartphone className="w-5 h-5 text-primary" />, title: "Design Responsivo", desc: "Adaptação automática da interface para diferentes tamanhos de tela e dispositivos." },
  { icon: <Palette className="w-5 h-5 text-primary" />, title: "UX — Experiência do Usuário", desc: "Projeto de interação centrado nas necessidades e expectativas do usuário final." },
];

const flowSteps = [
  "Levantamento de requisitos",
  "Definição visual",
  "Engenharia de prompt",
  "Geração de código",
  "Validação humana",
  "Ajustes finais",
];

const ComoFunciona = () => {
  const navigate = useNavigate();
  const { play } = useSounds();
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal();
  const { ref: gearRef, isVisible: gearVisible } = useScrollReveal();
  const { ref: techRef, isVisible: techVisible } = useScrollReveal();
  const { ref: tableRef, isVisible: tableVisible } = useScrollReveal();
  const { ref: resultRef, isVisible: resultVisible } = useScrollReveal();
  const { ref: contextRef, isVisible: contextVisible } = useScrollReveal();

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { play("click"); navigate("/"); }}
          className="border-border/50 text-muted-foreground hover:text-foreground hover:border-primary bg-card/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[128px] opacity-10 animate-float-gentle" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-[128px] opacity-10 animate-float-gentle" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container relative z-10 px-4">
          <div ref={heroRef} className={`max-w-4xl mx-auto text-center space-y-6 scroll-reveal ${heroVisible ? 'visible' : ''}`}>
            {/* Image */}
            <div className="flex justify-center mb-6">
              <img
                src={heroImage}
                alt="GamaTec.IA"
                className="w-full max-w-lg rounded-xl border border-border shadow-lg"
                style={{ boxShadow: "0 0 40px hsl(195 100% 50% / 0.15)" }}
              />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-xs font-orbitron text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              Documentação Técnica — Plataforma Experimental
            </div>

            <h1 className="text-4xl md:text-6xl font-orbitron font-black leading-tight">
              <span className="text-foreground">Como a </span>
              <span className="gradient-text">GamaTec.IA</span>
              <span className="text-foreground"> Funciona</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A GamaTec.IA é uma plataforma experimental desenvolvida em Engenharia de Computação com o objetivo de estudar o desenvolvimento de software assistido por Inteligência Artificial, analisando produtividade, metodologia e interação humano-máquina.
            </p>
          </div>
        </div>
      </section>

      {/* Gear Section */}
      <section className="py-16 relative">
        <div className="container px-4">
          <div ref={gearRef} className={`scroll-reveal-scale ${gearVisible ? 'visible' : ''}`}>
            <GearSVG />
            <p className="text-center text-sm text-muted-foreground mt-4 font-orbitron">
              Ciclo de funcionamento da plataforma
            </p>
          </div>
        </div>
      </section>

      {/* Blocks Section */}
      <section className="py-8 relative">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* 1 — Arquitetura */}
            <SectionBlock icon={<Server className="w-6 h-6 text-primary" />} number="1" title="Arquitetura da Plataforma" delay={0}>
              <p>A plataforma opera em um modelo <strong className="text-foreground">cliente-servidor</strong>: o usuário acessa via navegador web, enquanto a lógica de processamento e geração de conteúdo é executada no ambiente servidor da plataforma.</p>
              <p>O processamento é <strong className="text-foreground">assistido por Inteligência Artificial</strong>, permitindo geração automatizada de código e conteúdo. O usuário interage pela interface web enquanto a lógica de geração ocorre no ambiente de processamento da plataforma.</p>
            </SectionBlock>

            {/* 2 — Fluxo */}
            <SectionBlock icon={<ClipboardCheck className="w-6 h-6 text-primary" />} number="2" title="Fluxo de Desenvolvimento (Engenharia de Prompt)" delay={100}>
              <p>O ciclo de desenvolvimento segue as etapas abaixo. O desenvolvedor continua participando do processo, atuando como <strong className="text-foreground">supervisor e validador técnico</strong>.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {flowSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs text-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </SectionBlock>

            {/* 3 — Tecnologias */}
            <SectionBlock icon={<Cpu className="w-6 h-6 text-primary" />} number="3" title="Tecnologias e Conceitos Aplicados" delay={200}>
              <div ref={techRef} className={`grid sm:grid-cols-2 gap-3 mt-2 stagger-children ${techVisible ? 'visible' : ''}`}>
                {techConcepts.map((tech, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition-all duration-300">
                    <div className="p-1.5 rounded bg-secondary border border-border flex-shrink-0">{tech.icon}</div>
                    <div>
                      <div className="text-xs font-semibold text-foreground font-orbitron">{tech.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{tech.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionBlock>

            {/* 4 — Tabela */}
            <SectionBlock icon={<BarChart3 className="w-6 h-6 text-primary" />} number="4" title="Avaliação Experimental de Produtividade" delay={300}>
              <div ref={tableRef} className={`scroll-reveal ${tableVisible ? 'visible' : ''}`}>
                <div className="rounded-lg border border-border overflow-hidden mt-3">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="font-orbitron text-xs text-foreground">Método</TableHead>
                        <TableHead className="font-orbitron text-xs text-foreground">Tempo Médio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-sm">Desenvolvimento manual (HTML/CSS)</TableCell>
                        <TableCell className="text-sm font-semibold text-muted-foreground">5 horas</TableCell>
                      </TableRow>
                      <TableRow className="bg-primary/5">
                        <TableCell className="text-sm">Utilizando GamaTec.IA</TableCell>
                        <TableCell className="text-sm font-semibold text-primary">40 minutos</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  Foi realizado um experimento de implementação de uma página institucional contendo múltiplas seções. O tempo foi medido desde o início do desenvolvimento até a publicação funcional.
                </p>
              </div>
            </SectionBlock>

            {/* 5 — Interpretação */}
            <SectionBlock icon={<Lightbulb className="w-6 h-6 text-primary" />} number="5" title="Interpretação dos Resultados" delay={400}>
              <p>O uso de desenvolvimento assistido por IA <strong className="text-foreground">reduziu significativamente o tempo de implementação</strong>, mantendo responsividade e funcionalidade, indicando ganho de produtividade no processo de engenharia de software.</p>
              <p>Os resultados sugerem que a combinação de engenharia de prompt com validação humana pode otimizar ciclos de desenvolvimento sem comprometer a qualidade técnica do produto final.</p>
            </SectionBlock>

            {/* 6 — Contexto Acadêmico */}
            <div ref={contextRef} className={`scroll-reveal ${contextVisible ? 'visible' : ''}`}>
              <Card className="relative p-8 md:p-10 border-primary/30 bg-gradient-to-br from-card via-secondary/30 to-card glow-border">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-orbitron text-xs font-bold shadow-lg">
                  6
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-secondary border border-primary/20 flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-orbitron font-bold text-foreground">Contexto Acadêmico</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      A plataforma GamaTec.IA foi desenvolvida como parte de um <strong className="text-foreground">Trabalho de Conclusão de Curso em Engenharia de Computação</strong>. O projeto investiga o impacto da Inteligência Artificial e de abordagens low-code/no-code no desenvolvimento de software, avaliando produtividade, usabilidade e viabilidade técnica.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-xs text-muted-foreground">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Área de estudo: Engenharia de Software e Inteligência Artificial aplicada
                    </div>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container px-4 text-center">
          <p className="text-xs text-muted-foreground font-orbitron">
            GamaTec.IA — Plataforma Experimental Acadêmica
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Trabalho de Conclusão de Curso • Engenharia de Computação
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ComoFunciona;
