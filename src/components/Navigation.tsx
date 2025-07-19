import { Cloud, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-card/20 backdrop-blur-sm border border-border/30">
            <Cloud className="w-6 h-6 text-cloud-blue" />
          </div>
          <span className="text-xl font-bold text-foreground">DarkCloud</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#inicio" className="text-foreground/90 hover:text-cloud-blue transition-colors">
            Início
          </a>
          <a href="#assinatura" className="text-foreground/90 hover:text-cloud-blue transition-colors">
            Assinatura
          </a>
          <a 
            href="#discord" 
            className="flex items-center gap-1 text-foreground/90 hover:text-cloud-blue transition-colors"
          >
            Discord
            <ExternalLink className="w-3 h-3" />
          </a>
          <a href="#faq" className="text-foreground/90 hover:text-cloud-blue transition-colors">
            FAQ
          </a>
        </div>

        {/* Login Button */}
        <Button 
          variant="hero" 
          className="shadow-lg"
        >
          Login
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;