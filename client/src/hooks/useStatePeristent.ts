import { useState, useEffect, useCallback } from 'react';

// Hook para persistir estado en sessionStorage
export function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading ${key} from sessionStorage:`, error);
      return defaultValue;
    }
  });

  const setPersistedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newState = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
      try {
        sessionStorage.setItem(key, JSON.stringify(newState));
      } catch (error) {
        console.warn(`Error saving ${key} to sessionStorage:`, error);
      }
      return newState;
    });
  }, [key]);

  return [state, setPersistedState] as const;
}

// Hook para prevenir pérdida de datos en formularios
export function useFormPersistence(formId: string) {
  useEffect(() => {
    const saveFormData = () => {
      const formElement = document.getElementById(formId) as HTMLFormElement;
      if (!formElement) return;

      const formData = new FormData(formElement);
      const data: Record<string, string> = {};
      
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });

      if (Object.keys(data).length > 0) {
        sessionStorage.setItem(`form_${formId}`, JSON.stringify(data));
      }
    };

    const restoreFormData = () => {
      const savedData = sessionStorage.getItem(`form_${formId}`);
      if (!savedData) return;

      try {
        const data = JSON.parse(savedData);
        Object.entries(data).forEach(([name, value]) => {
          const element = document.querySelector(`#${formId} [name="${name}"]`) as HTMLInputElement;
          if (element && element.value === '') {
            element.value = value;
          }
        });
      } catch (error) {
        console.warn('Error restoring form data:', error);
      }
    };

    // Guardar datos en intervalos regulares
    const interval = setInterval(saveFormData, 2000);
    
    // Restaurar datos al montar
    setTimeout(restoreFormData, 100);

    // Guardar al salir de la página
    window.addEventListener('beforeunload', saveFormData);
    window.addEventListener('pagehide', saveFormData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', saveFormData);
      window.removeEventListener('pagehide', saveFormData);
    };
  }, [formId]);

  const clearPersistedData = useCallback(() => {
    sessionStorage.removeItem(`form_${formId}`);
  }, [formId]);

  return { clearPersistedData };
}