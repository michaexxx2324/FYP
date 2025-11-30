const OCR_SPACE_API_KEY = 'k89557491788957'; // In a real app, use process.env.OCR_SPACE_API_KEY

export const scanImage = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('apikey', OCR_SPACE_API_KEY);
    formData.append('language', 'eng'); // You can make this dynamic if needed
    formData.append('isOverlayRequired', 'false');
    
    // Append the image file
    // React Native's FormData requires a name, type, and uri for files
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    });

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
};
