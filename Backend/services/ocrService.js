import Tesseract from 'tesseract.js';
import fs from 'fs';

export const ocrService = {
  extractText: async (filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('Image file not found');
      }

      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        throw new Error('Image file is empty');
      }

      const result = await Tesseract.recognize(filePath, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            if (progress % 20 === 0) {
              console.log(`   OCR Progress: ${progress}%`);
            }
          }
        },
      });

      const text = (result.data.text || '').trim();

      if (!text) {
        console.warn(`⚠️  Image contains no recognizable text: ${filePath}`);
      }

      return text;
    } catch (error) {
      console.error(`❌ OCR processing error: ${error.message}`);
      throw error;
    }
  }
};

export default ocrService;
