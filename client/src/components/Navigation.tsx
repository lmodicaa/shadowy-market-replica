import {
  ExternalLink,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { OptimizedPicture } from './OptimizedPicture';
import logoWebp from "@assets/logo.webp";
import logoAvif from "@assets/logo.avif";
import { Button } from "@/components/ui/button";  
import { throttle } from "@/utils/performance";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useIsAdmin } from "@/hooks/useAdmin";

const Navigation = ({ session }: { session: any }) => {
  const [, navigate] = useLocation();
  const { data: isAdmin } = useIsAdmin(session?.user?.id);

  const handleLogin = async () => {
    try {
      // Use the current window location origin, which will be the Replit URL
      const redirectUrl = window.location.origin;

      console.log("Attempting login with redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      // Se não houver erro, Supabase redirecionará o usuário para o provedor OAuth
    } catch (error) {
      console.error("Erro ao fazer login com Discord:", error);
      // Aqui você poderia mostrar uma mensagem de erro ao usuário
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("Usuário fez logout com sucesso");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <OptimizedPicture 
            src={logoWebp} 
            webpSrc={logoWebp}
            avifSrc={logoAvif}
            alt="MateCloud Logo - Plataforma de Cloud Gaming" 
            className="w-12 h-12"
            width={48}
            height={48}
            priority={true}
          />
          <span className="text-2xl font-bold text-foreground">MateCloud</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#inicio"
            className="text-foreground/90 hover:text-cloud-blue transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Início
          </a>
          <a
            href="#planos"
            className="text-foreground/90 hover:text-cloud-blue transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("planos")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            Planos
          </a>
          <a
            href="https://discord.com/invite/Tfj9zMuwry"
            className="flex items-center gap-1 text-foreground/90 hover:text-cloud-blue transition-colors"
          >
            Discord
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="#faq"
            className="text-foreground/90 hover:text-cloud-blue transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const faqElement =
                document.querySelector("#faq") ||
                document.querySelector('[id*="features"]');
              faqElement?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            FAQ
          </a>
        </div>

        {/* User Menu / Login Button */}
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-auto p-2 hover:bg-card/20 border border-border/30 backdrop-blur-sm"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user?.user_metadata?.avatar_url}
                    alt={session.user?.user_metadata?.full_name || "Usuário"}
                  />
                  <AvatarFallback className="bg-cloud-blue/20 text-cloud-blue">
                    {session.user?.user_metadata?.full_name?.charAt(0) ||
                      session.user?.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">
                    {session.user?.user_metadata?.full_name || "Usuário"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {session.user?.email}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-background/95 backdrop-blur-sm border border-border/30"
            >
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer hover:bg-card/20"
                onClick={() => navigate("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-card/20"
                onClick={() => navigate("/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer hover:bg-card/20 text-orange-600 dark:text-orange-400"
                    onClick={() => navigate("/admin")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Painel Admin</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer hover:bg-card/20 text-red-600 dark:text-red-400"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="hero" className="shadow-lg" onClick={handleLogin}>
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
