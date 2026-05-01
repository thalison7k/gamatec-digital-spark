/**
 * Smoothly scrolls to a section by id, accounting for the fixed navbar height.
 * Also forces any `scroll-reveal*` children inside the target to add the
 * `.visible` class as a fallback, in case the IntersectionObserver doesn't
 * fire fast enough (e.g. when the user jumps several screens at once).
 *
 * Returns true if the section was found, false otherwise.
 */
export function scrollToSection(
  id: string,
  options: { behavior?: ScrollBehavior; offset?: number } = {}
): boolean {
  const { behavior = "smooth", offset = 72 } = options;
  const target = document.getElementById(id);
  if (!target) return false;

  const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.scrollTo({
    top,
    behavior: reduceMotion ? "auto" : behavior,
  });

  // Update the URL hash without triggering another scroll jump
  if (history.replaceState) {
    history.replaceState(null, "", `#${id}`);
  }

  // Reveal-fallback: force-trigger reveals inside the target after the scroll
  // settles. The IntersectionObserver will usually have fired already, but
  // this guarantees the 3D animations play on long jumps.
  const triggerReveals = () => {
    const revealSelectors = [
      ".scroll-reveal",
      ".scroll-reveal-left",
      ".scroll-reveal-right",
      ".scroll-reveal-scale",
      ".reveal-3d-flip",
      ".stagger-children",
    ];
    target
      .querySelectorAll<HTMLElement>(revealSelectors.join(","))
      .forEach((el) => el.classList.add("visible"));
  };

  // Run twice: once right after the smooth-scroll likely finishes,
  // and once again as a safety net in case the page is heavy.
  window.setTimeout(triggerReveals, reduceMotion ? 0 : 600);
  window.setTimeout(triggerReveals, reduceMotion ? 50 : 1100);

  return true;
}

/**
 * Navigates to a section. If we're not on the landing page, navigate there
 * first and resolve the hash after route change.
 */
export function navigateToSection(
  id: string,
  navigate: (path: string) => void,
  currentPath: string,
  landingPath = "/site"
) {
  if (currentPath !== landingPath) {
    navigate(`${landingPath}#${id}`);
    // Wait for route mount, then scroll
    window.setTimeout(() => scrollToSection(id), 250);
    return;
  }
  scrollToSection(id);
}
