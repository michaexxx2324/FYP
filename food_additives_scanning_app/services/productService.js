import { API_URL } from '@env';

export const getProductByBarcode = async (barcode) => {
  try {

    const response = await fetch(`${API_URL}/GetProduct?barcode=${barcode}`);
    
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
