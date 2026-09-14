import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const pdfService = {
  extractText: async (filePath) => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('PDF file not found');
      }

      const dataBuffer = fs.readFileSync(filePath);
      if (dataBuffer.length === 0) {
        throw new Error('PDF file is empty');
      }

      const pdfData = await pdfParse(dataBuffer);
      const text = (pdfData.text || '').trim();

      if (!text) {
        console.warn(`⚠️  PDF file contains no extractable text: ${filePath}`);
      }

      return text;
    } catch (error) {
      console.error(`❌ PDF parsing error: ${error.message}`);
      throw error;
    }
  }
};

export default pdfService;
