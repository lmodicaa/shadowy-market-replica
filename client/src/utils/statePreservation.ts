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

// Guardar datos de formularios automáticamente (incluyendo inputs sueltos)
export const saveFormData = (formId?: string) => {
  try {
    // Guardar tanto formularios como inputs individuales
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    const data: Record<string, string> = {};
    
    inputs.forEach(input => {
      const element = input as HTMLInputElement;
      if (element.name && element.value && element.value.trim()) {
        // Evitar guardar contraseñas y campos sensibles
        if (element.type !== 'password' && !element.name.includes('password')) {
          data[element.name] = element.value;
        }
      }
    });

    if (Object.keys(data).length > 0) {
      const formKey = formId || 'app_form_data';
      sessionStorage.setItem(`form_${formKey}`, JSON.stringify(data));
    }
  } catch (error) {
    console.warn('Error saving form data:', error);
  }
};

// Restaurar datos de formularios
export const restoreFormData = (formId?: string) => {
  try {
    const formKey = formId || 'app_form_data';
    const savedData = sessionStorage.getItem(`form_${formKey}`);
    
    if (savedData) {
      const data = JSON.parse(savedData);
      Object.entries(data).forEach(([name, value]) => {
        const element = document.querySelector(`[name="${name}"]`) as HTMLInputElement;
        
        if (element && !element.value) {
          element.value = value;
          // Disparar múltiples eventos para asegurar que React detecte el cambio
          element.dispatchEvent(new Event('input', { bubbles: true }));
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

  // Intervalos para guardar periódicamente (más frecuente para formularios de edición)
  const saveInterval = setInterval(() => {
    saveFormData();
  }, 10000); // Cada 10 segundos

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