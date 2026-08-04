import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// A slow, eased scroll used across the site for route changes and in-page
// anchors. The native `behavior: smooth` snaps in ~300ms; this glides over
// ~900ms with a soft ease-out so navigation reads as deliberate, not abrupt.
const DURATION = 900;
const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

let activeAnim = null;

function slowScrollTo(targetY) {
  if (activeAnim) cancelAnimationFrame(activeAnim);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    window.scrollTo(0, targetY);
    return;
  }
  const start = window.scrollY;
  const dist = targetY - start;
  if (dist === 0) return;
  const startTs = performance.now();
  const step = (ts) => {
    const p = Math.min((ts - startTs) / DURATION, 1);
    window.scrollTo(0, start + dist * ease(p));
    if (p < 1) activeAnim = requestAnimationFrame(step);
    else activeAnim = null;
  };
  activeAnim = requestAnimationFrame(step);
}

const getHashId = (hash) => {
  const rawId = hash.slice(1);
  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  // Slow smooth scroll on route changes and to anchors.
  useEffect(() => {
    if (navigationType === "POP") return;

    if (hash) {
      const id = getHashId(hash);
      const timer = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY;
          slowScrollTo(y);
        }
      }, 60);
      return () => window.clearTimeout(timer);
    }

    slowScrollTo(0);
  }, [pathname, hash, navigationType]);

  // Intercept in-page anchor (`#id`) clicks anywhere on the page so they too
  // glide slowly instead of jumping.
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const id = getHashId(href);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY;
      slowScrollTo(y);
      if (history.replaceState) history.replaceState(null, "", href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}