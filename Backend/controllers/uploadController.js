import documentModel from '../models/documentModel.js';
import tripModel from '../models/tripModel.js';
import parser from '../utils/parser.js';
import fs from 'fs';

function validateFileUpload(file) {
  if (!file) {
    throw new Error('No file uploaded');
  }

  const maxSize = 15 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size exceeds 15MB limit');
  }

  const allowedMimetypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedMimetypes.includes(file.mimetype)) {
    throw new Error('Unsupported file format. Please upload PDF, JPG, PNG, or WEBP documents.');
  }

  if (!file.originalname || file.originalname.length > 255) {
    throw new Error('Invalid file name');
  }

  return true;
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
}

export async function uploadDocument(req, res) {
  try {
    const userId = req.user.id;
    const { trip_id, tripId } = req.body;
    const targetTripId = trip_id || tripId;
    const file = req.file;

    if (!targetTripId || typeof targetTripId !== 'string') {
      return res.status(400).json({ error: 'Valid trip ID is required for uploading documents.' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No document file was uploaded.' });
    }

    validateFileUpload(file);

    const trip = await tripModel.findById(targetTripId, userId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized.' });
    }

    const { extractedText, documentType } = await parser.extractTextFromFile(
      file.path,
      file.mimetype,
      file.originalname
    );

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Failed to extract text from document. Ensure it is a valid PDF or image.' });
    }

    const documentRecord = await documentModel.createDocument({
      trip_id: targetTripId,
      file_name: sanitizeFileName(file.originalname),
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype,
      document_type: documentType,
      processing_status: 'Processed',
    });

    const bookingInfo = await documentModel.createBookingInformation({
      document_id: documentRecord.id,
      booking_type: documentType,
      raw_text: extractedText,
      confidence_score: 0.98,
    });

    await tripModel.update(targetTripId, userId, { status: 'Documents Uploaded' });

    return res.status(201).json({
      document: {
        ...documentRecord,
        bookingInfo,
        extracted_text: extractedText.substring(0, 500),
      },
    });
  } catch (error) {
    console.error(' Upload document controller error:', error.message);
    const statusCode = error.message.includes('File size') || error.message.includes('format') ? 400 : 500;
    return res.status(statusCode).json({ error: error.message || 'Failed to upload and extract document.' });
  }
}

export async function getDocument(req, res) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Valid document ID is required.' });
    }

    const document = await documentModel.findDocumentById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    return res.json({ document });
  } catch (error) {
    console.error(' Get document controller error:', error);
    return res.status(500).json({ error: 'Failed to fetch document.' });
  }
}

export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Valid document ID is required.' });
    }

    const document = await documentModel.findDocumentById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (fs.existsSync(document.file_path)) {
      try {
        fs.unlinkSync(document.file_path);
      } catch (err) {
        console.error('  Failed to remove document file:', err.message);
      }
    }

    await documentModel.deleteDocument(id);
    return res.json({ message: 'Document removed successfully.' });
  } catch (error) {
    console.error(' Delete document controller error:', error);
    return res.status(500).json({ error: 'Failed to delete document.' });
  }
}

export default { uploadDocument, getDocument, deleteDocument };
