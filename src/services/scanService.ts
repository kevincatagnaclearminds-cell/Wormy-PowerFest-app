import { API_CONFIG } from '../config/api';

const API_URL = `${API_CONFIG.BASE_URL}/api/scan`;

export interface ValidationResponse {
  success: boolean;
  data?: {
    participant_id: string;
    name: string;
    email: string;
    registration_date: string;
    status: {
      entrada: boolean;
      entrega: boolean;
      completo: boolean;
      sorteo: boolean;
    };
    can_scan: boolean;
    eligible_for_sorteo?: boolean;
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ScanResponse {
  success: boolean;
  data?: {
    scan_id: string;
    participant_id: string;
    name: string;
    mode: string;
    timestamp: string;
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface HistoryResponse {
  success: boolean;
  data?: {
    total: number;
    scans: Array<{
      scan_id: string;
      participant_id: string;
      name: string;
      mode: string;
      timestamp: string;
      status: string;
    }>;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface StatsResponse {
  success: boolean;
  data?: {
    date: string;
    total_scans: number;
    by_mode: {
      entrada: number;
      entrega: number;
      completo: number;
      sorteo: number;
    };
    valid_scans: number;
    invalid_scans: number;
    sorteo_participants?: number;
    last_updated: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// 1. Validar QR antes de escanear
export const validateQR = async (
  qrCode: string,
  mode: 'entrega' | 'completo' | 'sorteo'
): Promise<ValidationResponse> => {
  try {
    const response = await fetch(`${API_URL}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qr_code: qrCode,
        mode: mode,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error validating QR:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor',
      },
    };
  }
};

// 2. Registrar entrega de pasaporte (incluye entrada automáticamente)
export const registrarEntrega = async (qrCode: string): Promise<ScanResponse> => {
  try {
    const response = await fetch(`${API_URL}/entrega`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qr_code: qrCode,
        scanned_at: new Date().toISOString(),
        device_id: API_CONFIG.DEVICE_ID,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering entrega:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor',
      },
    };
  }
};

// 3. Registrar pasaporte completo
export const registrarCompleto = async (qrCode: string): Promise<ScanResponse> => {
  try {
    const response = await fetch(`${API_URL}/completo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qr_code: qrCode,
        scanned_at: new Date().toISOString(),
        device_id: API_CONFIG.DEVICE_ID,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering completo:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor',
      },
    };
  }
};

// 4. Obtener historial
export const getHistory = async (
  mode?: string,
  limit: number = 50
): Promise<HistoryResponse> => {
  try {
    const params = new URLSearchParams();
    if (mode) params.append('mode', mode);
    params.append('limit', limit.toString());

    const response = await fetch(`${API_URL}/history?${params.toString()}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching history:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor',
      },
    };
  }
};

// 5. Obtener estadísticas
export const getStats = async (): Promise<StatsResponse> => {
  try {
    const response = await fetch(`${API_URL}/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor',
      },
    };
  }
};

// 6. Registrar participación en sorteo
export const registrarSorteo = async (qrCode: string): Promise<ScanResponse> => {
  try {
    const response = await fetch(`${API_URL}/sorteo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        qr_code: qrCode,
        scanned_at: new Date().toISOString(),
        device_id: API_CONFIG.DEVICE_ID,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering sorteo:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor',
      },
    };
  }
};
