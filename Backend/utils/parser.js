import pdfService from '../services/pdfService.js';
import ocrService from '../services/ocrService.js';

export const parser = {
  extractTextFromFile: async (filePath, mimeType, originalName = '') => {
    let extractedText = '';
    let error = null;

    try {
      if (mimeType === 'application/pdf') {
        extractedText = await pdfService.extractText(filePath);
      } else if (mimeType.startsWith('image/')) {
        extractedText = await ocrService.extractText(filePath);
      }
    } catch (err) {
      error = err;
      console.error(`⚠️  Failed to extract text from ${mimeType}:`, err.message);
    }

    if (!extractedText || !extractedText.trim()) {
      if (error) {
        throw new Error(`Failed to extract text from document: ${error.message}`);
      }
      extractedText = `Document: ${originalName} (No extractable text found)`;
    }

    let docType = 'Other';
    const lowerName = originalName.toLowerCase();
    const lowerText = extractedText.toLowerCase();

    if (lowerName.includes('flight') || lowerText.includes('flight') || lowerText.includes('airline') || lowerText.includes('boarding pass')) {
      docType = 'Flight Ticket';
    } else if (lowerName.includes('hotel') || lowerText.includes('hotel') || lowerText.includes('check-in') || lowerText.includes('booking.com')) {
      docType = 'Hotel Booking';
    } else if (lowerName.includes('train') || lowerText.includes('amtrak') || lowerText.includes('rail')) {
      docType = 'Train Ticket';
    } else if (lowerName.includes('bus') || lowerText.includes('greyhound') || lowerText.includes('flixbus')) {
      docType = 'Bus Ticket';
    } else if (lowerName.includes('visa') || lowerText.includes('visa')) {
      docType = 'Visa';
    } else if (lowerName.includes('insurance') || lowerText.includes('policy')) {
      docType = 'Insurance';
    }

    return {
      extractedText,
      documentType: docType,
    };
  }
};

export default parser;
