import { useEffect } from 'react';

export function useStylesheet(href) {
  useEffect(() => {
    // Remove existing app/landing stylesheets
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const isDynamicMonifyStyle = link.dataset.monifyDynamicStylesheet === 'true';
      const isKnownPageStyle =
        link.href.includes('style.css') ||
        link.href.includes('styles.css') ||
        link.href.includes('team.css');

      if (isDynamicMonifyStyle || isKnownPageStyle) {
        link.remove();
      }
    });

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.monifyDynamicStylesheet = 'true';
    const separator = href.includes('?') ? '&' : '?';
    link.href = `${href}${separator}v=ui-parity-20260531-bottomtabs`;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [href]);
}

export function useReveal() {
  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);
}
