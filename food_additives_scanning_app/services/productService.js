import { API_URL } from '@env';

export const getScanQuota = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/GetScanQuota?userId=${userId}`);
    return await response.json();
  } catch (err) {
    console.error("Error fetching quota:", err);
    return null;
  }
};

export const useScanQuota = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/UseScanQuota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return await response.json();
  } catch (err) {
    console.error("Error using quota:", err);
    return null;
  }
};

export const getProductByBarcode = async (barcode, userId = "anonymous") => {
  try {

    const response = await fetch(`${API_URL}/GetProduct?barcode=${barcode}&userId=${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Product not found
      }
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};
