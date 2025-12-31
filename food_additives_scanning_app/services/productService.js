
// need to deploy Azure 
// 'azure-functions'

// Example: 'https://my-food-app.azurewebsites.net/api/GetProduct'
// For local testing with Expo Go, use your computer's IP: 'http://192.168.1.100:7071/api/GetProduct'
const API_URL = 'http://192.168.50.124:3000/api/GetProduct'; 

export const getProductByBarcode = async (barcode) => {
  try {
    console.log(`Fetching product for barcode: ${barcode}`);
    const response = await fetch(`${API_URL}?barcode=${barcode}`);
    
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
