import { CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  { key: "awaiting_info", label: "Briefing Recebido", percent: 10 },
  { key: "in_development", label: "Em Desenvolvimento", percent: 40 },
  { key: "in_review", label: "Em Revisão", percent: 65 },
  { key: "awaiting_approval", label: "Aguardando Aprovação", percent: 85 },
  { key: "published", label: "Entregue", percent: 100 },
];

const ProjectProgressSteps = ({ status }: { status: string }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="space-y-3">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-3">
            <div className="shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : isCurrent ? (
                <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                </div>
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-sm ${
                  isCompleted
                    ? "text-green-400 line-through"
                    : isCurrent
                    ? "text-primary font-semibold"
                    : "text-muted-foreground/50"
                }`}
              >
                {step.label}
              </p>
            </div>
            <span
              className={`text-xs font-mono ${
                isCompleted
                  ? "text-green-400"
                  : isCurrent
                  ? "text-primary"
                  : "text-muted-foreground/30"
              }`}
            >
              {step.percent}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectProgressSteps;
