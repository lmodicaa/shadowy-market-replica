import { useEffect } from 'react';

// Hook para prevenir recargas cuando hay contenido sin guardar
export const usePreventReload = () => {
  useEffect(() => {
    // Prevenir navegación cuando hay cambios sin guardar
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isEditing = sessionStorage.getItem('editing') === 'true';
      if (isEditing) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        return e.returnValue;
      }
    };

    // Detectar cambios en campos de entrada
    const handleInputChange = () => {
      sessionStorage.setItem('editing', 'true');
    };

    // Detectar cuando se guarda
    const handleSave = () => {
      sessionStorage.removeItem('editing');
    };

    // Agregar listeners a elementos existentes
    const addListeners = () => {
      // Inputs, textareas y selects
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (!input.hasAttribute('data-edit-listener')) {
          input.addEventListener('input', handleInputChange);
          input.addEventListener('change', handleInputChange);
          input.setAttribute('data-edit-listener', 'true');
        }
      });

      // Formularios
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        if (!form.hasAttribute('data-save-listener')) {
          form.addEventListener('submit', handleSave);
          form.setAttribute('data-save-listener', 'true');
        }
      });

      // Botones de envío
      const submitButtons = document.querySelectorAll('button[type="submit"]');
      submitButtons.forEach(button => {
        if (!button.hasAttribute('data-save-listener')) {
          button.addEventListener('click', handleSave);
          button.setAttribute('data-save-listener', 'true');
        }
      });
    };

    // Observer para nuevos elementos
    const observer = new MutationObserver(() => {
      addListeners();
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    // Configuración inicial
    addListeners();
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Limpiar al desmontar
    return () => {
      observer.disconnect();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Funciones auxiliares
  const markAsEditing = () => {
    sessionStorage.setItem('editing', 'true');
  };

  const markAsSaved = () => {
    sessionStorage.removeItem('editing');
  };

  return { markAsEditing, markAsSaved };
};