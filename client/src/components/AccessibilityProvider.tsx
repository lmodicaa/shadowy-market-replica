import { useEffect, ReactNode } from 'react';

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider = ({ children }: AccessibilityProviderProps) => {
  useEffect(() => {
    // Enhanced keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to main content with Alt + M
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const main = document.querySelector('[role="main"]') as HTMLElement;
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Skip to navigation with Alt + N
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        const nav = document.querySelector('nav') as HTMLElement;
        if (nav) {
          nav.focus();
          nav.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Add screen reader announcements
    const announcePageChanges = () => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.id = 'page-announcements';
      document.body.appendChild(announcement);
    };

    announcePageChanges();

    // Ensure all interactive elements have proper ARIA labels
    const enhanceAccessibility = () => {
      // Add alt text to images missing it
      const images = document.querySelectorAll('img:not([alt])');
      images.forEach((img) => {
        (img as HTMLImageElement).alt = 'Decorative image';
      });

      // Add proper roles to buttons without them
      const buttons = document.querySelectorAll('button:not([role])');
      buttons.forEach((button) => {
        button.setAttribute('role', 'button');
      });

      // Ensure links have descriptive text
      const links = document.querySelectorAll('a[href]:not([aria-label]):not([aria-labelledby])');
      links.forEach((link) => {
        const text = link.textContent?.trim();
        if (!text || text.length < 3) {
          link.setAttribute('aria-label', 'Link to ' + (link.getAttribute('href') || 'page'));
        }
      });
    };

    // Run accessibility enhancements after page load
    setTimeout(enhanceAccessibility, 1000);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <>{children}</>;
};