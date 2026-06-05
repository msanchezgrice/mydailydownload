import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal(
  options: {
    childSelector?: string;
    stagger?: number;
    duration?: number;
    y?: number;
    delay?: number;
    ease?: string;
    start?: string;
  } = {}
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      childSelector,
      stagger = 0.15,
      duration = 0.6,
      y = 30,
      delay = 0,
      ease = "cubic-bezier(0.16, 1, 0.3, 1)",
      start = "top 85%",
    } = options;

    const targets = childSelector
      ? el.querySelectorAll(childSelector)
      : [el];

    gsap.set(targets, { y, opacity: 0 });

    const animation = gsap.to(targets, {
      y: 0,
      opacity: 1,
      duration,
      delay,
      stagger: childSelector ? stagger : 0,
      ease,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: "play none none none",
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  return ref;
}
