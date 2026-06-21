import { gsap, ScrollTrigger, EASE, DUR } from "./gsap";
import {
  fadeUp,
  staggerReveal,
  splitLinesReveal,
  charsReveal,
  revealExistingChars,
  clipImageReveal,
  drawLine,
} from "./animations";

const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) =>
  Array.from(root.querySelectorAll<T>(sel));
const one = <T extends Element = HTMLElement>(root: ParentNode, sel: string) =>
  root.querySelector<T>(sel);

// Shared across every page (the footer is on all three routes).
export function buildCommonChoreography(shell: HTMLElement): void {
  const footer = one(shell, ".site-footer");
  if (footer) {
    const marks = $(footer, "[data-anim='footer-item']");
    if (marks.length) staggerReveal(marks, { trigger: footer });
  }
}

// Home route choreography.
export function buildHomeChoreography(shell: HTMLElement): void {
  void shell;
}

// By Day / By Night route choreography (identical structure).
export function buildDayNightChoreography(shell: HTMLElement): void {
  void shell;
}

// Re-exported so callers need a single import surface.
export {
  gsap,
  ScrollTrigger,
  EASE,
  DUR,
  fadeUp,
  staggerReveal,
  splitLinesReveal,
  charsReveal,
  revealExistingChars,
  clipImageReveal,
  drawLine,
};
