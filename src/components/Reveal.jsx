import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// IntersectionObserver reveal wrapper. Falls back to visible when reduced motion or no IO.
// Props: as (default 'div'), to (renders a router Link), href (renders an anchor), or plain.
export default function Reveal({ children, className = '', as, to, href, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = `nlw-rv${shown ? ' in' : ''}${className ? ` ${className}` : ''}`;

  if (to) {
    return <Link ref={ref} to={to} className={cls} {...rest}>{children}</Link>;
  }
  if (href) {
    return <a ref={ref} href={href} className={cls} {...rest}>{children}</a>;
  }
  const Tag = as || 'div';
  return <Tag ref={ref} className={cls} {...rest}>{children}</Tag>;
}