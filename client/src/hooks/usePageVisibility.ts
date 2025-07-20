import { useState, useEffect } from 'react';

export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};

// Hook simplificado para preservar estado sin causar problemas
export const usePreventAutoReload = () => {
  useEffect(() => {
    // Importar utilidades dinámicamente para evitar problemas
    import('@/utils/statePreservation').then(({ setupStatePreservation }) => {
      const cleanup = setupStatePreservation();
      
      // Restaurar estado inicial una vez
      setTimeout(() => {
        import('@/utils/statePreservation').then(({ restoreAppState, restoreFormData }) => {
          restoreAppState();
          restoreFormData();
        });
      }, 1000);

      // Limpiar al desmontar
      return cleanup;
    });
  }, []); // Solo ejecutar una vez al montar
};