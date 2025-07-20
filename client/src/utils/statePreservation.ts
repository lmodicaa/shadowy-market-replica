// Utilidades para preservar estado sin causar problemas con hooks de React

// Guardar estado general de la aplicación
export const saveAppState = () => {
  try {
    const state = {
      timestamp: Date.now(),
      url: window.location.href,
      scrollPosition: window.scrollY,
    };
    sessionStorage.setItem('appState', JSON.stringify(state));
  } catch (error) {
    console.warn('Error saving app state:', error);
  }
};

// Restaurar estado general de la aplicación
export const restoreAppState = () => {
  try {
    const savedState = sessionStorage.getItem('appState');
    if (savedState) {
      const state = JSON.parse(savedState);
      // Solo restaurar si fue guardado hace menos de 10 minutos
      if (Date.now() - state.timestamp < 10 * 60 * 1000) {
        setTimeout(() => {
          window.scrollTo({ 
            top: state.scrollPosition || 0, 
            behavior: 'smooth' 
          });
        }, 300);
      }
    }
  } catch (error) {
    console.warn('Error restoring app state:', error);
  }
};

// Guardar datos de formularios automáticamente
export const saveFormData = (formId?: string) => {
  try {
    const forms = formId 
      ? [document.getElementById(formId)] 
      : Array.from(document.querySelectorAll('form'));

    forms.forEach(form => {
      if (!form) return;
      
      const formData = new FormData(form as HTMLFormElement);
      const data: Record<string, string> = {};
      
      formData.forEach((value, key) => {
        if (value.toString().trim()) {
          data[key] = value.toString();
        }
      });

      if (Object.keys(data).length > 0) {
        const formKey = formId || form.id || 'general_form';
        sessionStorage.setItem(`form_${formKey}`, JSON.stringify(data));
      }
    });
  } catch (error) {
    console.warn('Error saving form data:', error);
  }
};

// Restaurar datos de formularios
export const restoreFormData = (formId?: string) => {
  try {
    const formKey = formId || 'general_form';
    const savedData = sessionStorage.getItem(`form_${formKey}`);
    
    if (savedData) {
      const data = JSON.parse(savedData);
      Object.entries(data).forEach(([name, value]) => {
        const selector = formId 
          ? `#${formId} [name="${name}"]` 
          : `[name="${name}"]`;
        const element = document.querySelector(selector) as HTMLInputElement;
        
        if (element && !element.value) {
          element.value = value;
          // Disparar evento change para que React detecte el cambio
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
  } catch (error) {
    console.warn('Error restoring form data:', error);
  }
};

// Configurar preservación automática de estado
export const setupStatePreservation = () => {
  // Guardar estado cuando se pierde el foco de la ventana
  const handleVisibilityChange = () => {
    if (document.hidden) {
      saveAppState();
      saveFormData();
    } else {
      // Esperar un poco antes de restaurar para asegurar que el DOM esté listo
      setTimeout(() => {
        restoreAppState();
        restoreFormData();
      }, 500);
    }
  };

  const handleBeforeUnload = () => {
    saveAppState();
    saveFormData();
  };

  // Intervalos para guardar periódicamente
  const saveInterval = setInterval(() => {
    saveFormData();
  }, 30000); // Cada 30 segundos

  // Event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('pagehide', handleBeforeUnload);

  // Limpieza
  return () => {
    clearInterval(saveInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('pagehide', handleBeforeUnload);
  };
};

// Limpiar datos guardados
export const clearSavedState = () => {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('form_') || key === 'appState') {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Error clearing saved state:', error);
  }
};