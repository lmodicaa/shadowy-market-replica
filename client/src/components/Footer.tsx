import { Facebook, Twitter, Instagram } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center">
          {/* Informações de Contato ou Logo */}
          <div className="flex-shrink-0">
            {/* Substitua pelo seu logo ou informações de contato */}
            <p className="text-lg font-semibold text-white">MateCloud</p>
          </div>

          {/* Links de Navegação */}
          <div className="mt-6 md:mt-0">
            <ul className="flex space-x-6">
              <li><a href="#" className="hover:text-white text-sm">Sobre</a></li>
              <li><a href="#planos" className="hover:text-white text-sm">Planos</a></li>
              <li><a href="#tutorials" className="hover:text-white text-sm">Tutoriais</a></li>
              <li><a href="#" className="hover:text-white text-sm">Contato</a></li>
            </ul>
          </div>

          {/* Ícones de Redes Sociais */}
          <div className="flex space-x-6 mt-6 md:mt-0">
            <a href="#" className="hover:text-white"><Facebook size={24} /></a>
            <a href="#" className="hover:text-white"><Twitter size={24} /></a>
            <a href="#" className="hover:text-white"><Instagram size={24} /></a>
            <a href="https://discord.gg/Tfj9zMuwry" className="hover:text-white"><FontAwesomeIcon icon={faDiscord} size="lg" /></a>
          </div>
        </div>

        {/* Direitos Autorais */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2023 MateCloud. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;