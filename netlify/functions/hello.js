// Función de ejemplo para Netlify Functions (opcional)
// Esta aplicación funciona completamente con Supabase como backend
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'Aplicación funcionando correctamente en Netlify!',
      timestamp: new Date().toISOString()
    }),
  };
};