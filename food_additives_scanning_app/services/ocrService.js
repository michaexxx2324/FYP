import { POE_API_KEY, POE_BOT_NAME } from '@env';

export const scanImage = async (base64Image) => {
  try {
    const response = await fetch('https://api.poe.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: POE_BOT_NAME,
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: `Role: You are a strict data extraction and translation system for food scanning apps.
Task: Extract food ingredients, nutrition, and product details from the image.
Language: Translate ALL content to English.

Constraints:
1. IGNORE any "Thinking", "Rationale", or internal monologue.
2. IGNORE QR codes, barcodes, and marketing URLs.
3. If a specific section (e.g., Distributor) is not found on the label, strictly OMIT that section. Do not write "Not found".
4. START your final response with the delimiter string: "###DATA_START###".
5. Follow the format below EXACTLY.

Required Format:

###DATA_START###
*Product Name:*
[Insert Name]

*Ingredients:*
[Insert Ingredients List]

*Nutrition Information:*
(Per [Insert Unit, e.g. 100ml])
[Insert Nutrition Facts list using bullets]

*Origin:*
[Insert Country of Origin]

*Storage Instructions:*
[Insert Instructions]

*Best Before Date:*
[Insert Date]

*Distributor Information:*
[Insert Name, Address, Tel]

*Net Volume:*
[Insert Volume]

*Cross-contamination Risk Statement:*
[Insert "Produced in a factory..." or allergen warnings]`
              },
              { 
                type: 'image_url', 
                image_url: { url: `data:image/jpeg;base64,${base64Image}` } 
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
       throw new Error(data.error.message || 'Unknown API Error');
    }

    if (data.choices && data.choices.length > 0) {
      let content = data.choices[0].message.content;
      
 
      const delimiter = "###DATA_START###";
      if (content.includes(delimiter)) {
        content = content.split(delimiter)[1];
      } else {
    
        content = content.replace(/^Thinking\.\.\.\s*/i, '');
        content = content.replace(/^>.*$/gm, '');
      }

      content = content.replace(/!\[.*?\]\(.*?\)/g, '');
      content = content.replace(/https?:\/\/\S+/g, '');

      content = content.replace(/\n{3,}/g, '\n\n');
      content = content.trim();

      return content;
    } else {
      return null;
    }
  } catch (error) {
    console.error('AI Error:', error);
    throw error;
  }
};
