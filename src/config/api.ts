// Configuración de la API
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.80:3003/api/scan',
  TIMEOUT: 10000, // 10 segundos
  DEVICE_ID: 'mobile-app-001',
};

// Mensajes de error personalizados
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'No se pudo conectar con el servidor. Verifica tu conexión.',
  INVALID_QR: 'Código QR no válido o no existe.',
  ALREADY_SCANNED: 'Este QR ya fue escaneado en este modo.',
  ALREADY_ENTERED: 'Ya se registró la entrada para este participante.',
  NOT_ENTERED: 'El participante debe registrar entrada primero.',
  PASSPORT_NOT_DELIVERED: 'El pasaporte no ha sido entregado.',
  EXPIRED_QR: 'El código QR ha expirado.',
  INVALID_MODE: 'Modo de escaneo no válido.',
  SERVER_ERROR: 'Error interno del servidor. Intenta de nuevo.',
  UNAUTHORIZED: 'No autorizado.',
  UNKNOWN_ERROR: 'Ocurrió un error desconocido.',
};

// Función para obtener mensaje de error amigable
export const getErrorMessage = (errorCode?: string): string => {
  if (!errorCode) return ERROR_MESSAGES.UNKNOWN_ERROR;
  return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.UNKNOWN_ERROR;
};
