import { Facebook, Twitter, Instagram } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';


const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-gray-300 py-12 mt-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center">
          {/* Logo com gradiente */}
          <div className="flex-shrink-0 group">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent 
                         hover:from-blue-300 hover:via-purple-300 hover:to-blue-300 transition-all duration-300 
                         cursor-pointer transform group-hover:scale-105">
              MateCloud
            </p>
            <div className="h-1 w-0 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full mt-1"></div>
          </div>

          {/* Links com hover aprimorado */}
          <div className="mt-8 md:mt-0">
            <ul className="flex flex-wrap gap-8 justify-center md:justify-end">
              <li>
                <a href="#" className="text-sm font-medium relative group transition-all duration-300 hover:text-blue-300">
                  Sobre
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#planos" className="text-sm font-medium relative group transition-all duration-300 hover:text-blue-300">
                  Planos
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#tutorials" className="text-sm font-medium relative group transition-all duration-300 hover:text-blue-300">
                  Tutoriais
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-sm font-medium relative group transition-all duration-300 hover:text-blue-300">
                  Contato
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </div>

          {/* Ícones com hover effects aprimorados */}
          <div className="flex space-x-4 mt-8 md:mt-0">
            <a href="https://facebook.com/matecloud" 
               target="_blank" 
               rel="noopener noreferrer"
               className="group p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
                          hover:bg-blue-600/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-110 hover:rotate-3"
               title="Seguir no Facebook">
              <Facebook size={20} className="text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
            </a>
            <a href="https://twitter.com/matecloud" 
               target="_blank" 
               rel="noopener noreferrer"
               className="group p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
                          hover:bg-sky-600/20 hover:border-sky-500/50 transition-all duration-300 hover:scale-110 hover:-rotate-3"
               title="Seguir no Twitter">
              <Twitter size={20} className="text-gray-400 group-hover:text-sky-400 transition-colors duration-300" />
            </a>
            <a href="https://instagram.com/matecloud" 
               target="_blank" 
               rel="noopener noreferrer"
               className="group p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
                          hover:bg-pink-600/20 hover:border-pink-500/50 transition-all duration-300 hover:scale-110 hover:rotate-3"
               title="Seguir no Instagram">
              <Instagram size={20} className="text-gray-400 group-hover:text-pink-400 transition-colors duration-300" />
            </a>
            <a href="https://discord.gg/Tfj9zMuwry" 
               target="_blank" 
               rel="noopener noreferrer"
               className="group p-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 
                          hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all duration-300 hover:scale-110 hover:-rotate-3"
               title="Entrar no Discord">
              <FontAwesomeIcon icon={faDiscord} className="text-gray-400 group-hover:text-indigo-400 transition-colors duration-300 w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Linha separadora com gradiente */}
        <div className="mt-12 pt-8 text-center text-sm border-t border-gradient-to-r from-transparent via-gray-600/50 to-transparent relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"></div>
          <p className="text-gray-500 hover:text-gray-300 transition-colors duration-300 cursor-default">
            &copy; 2025 MateCloud. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;