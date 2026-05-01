import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Card with built-in 3D tilt on pointer move.
 * - Tracks mouse position to apply rotateX / rotateY in real time
 * - Adds a subtle parallax glow that follows the cursor
 * - Falls back gracefully on touch devices (no tilt, just lift)
 * - Respects prefers-reduced-motion
 */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onMouseMove, onMouseLeave, onMouseEnter, style, children, ...props }, ref) => {
    const innerRef = React.useRef<HTMLDivElement | null>(null);
    const rafRef = React.useRef<number | null>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

    const handleMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const el = innerRef.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (window.matchMedia("(hover: none)").matches) return;

        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = x / rect.width;
        const py = y / rect.height;
        // max ~7deg tilt, inverted on Y for natural feel
        const rx = (0.5 - py) * 7;
        const ry = (px - 0.5) * 7;

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          el.style.setProperty("--card-rx", `${rx}deg`);
          el.style.setProperty("--card-ry", `${ry}deg`);
          el.style.setProperty("--card-mx", `${px * 100}%`);
          el.style.setProperty("--card-my", `${py * 100}%`);
        });

        onMouseMove?.(e);
      },
      [onMouseMove],
    );

    const handleEnter = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const el = innerRef.current;
        if (el) el.style.setProperty("--card-lift", "1");
        onMouseEnter?.(e);
      },
      [onMouseEnter],
    );

    const handleLeave = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const el = innerRef.current;
        if (el) {
          el.style.setProperty("--card-rx", "0deg");
          el.style.setProperty("--card-ry", "0deg");
          el.style.setProperty("--card-lift", "0");
        }
        onMouseLeave?.(e);
      },
      [onMouseLeave],
    );

    return (
      <div
        ref={innerRef}
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={cn("card-3d-base group/card3d", className)}
        style={style}
        {...props}
      >
        <div className="card-3d-glare" aria-hidden="true" />
        <div className="card-3d-content">{children}</div>
      </div>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
