import { dbAll, dbGet, dbRun } from '../config/db.js';
import crypto from 'crypto';

export const documentModel = {
  createDocument: async ({ trip_id, file_name, file_path, file_size, mime_type, document_type = 'Flight Ticket', processing_status = 'Pending' }) => {
    const id = crypto.randomUUID();
    await dbRun(
      `INSERT INTO documents (id, trip_id, file_name, file_path, file_size, mime_type, document_type, processing_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, trip_id, file_name, file_path, file_size, mime_type, document_type, processing_status]
    );
    return documentModel.findDocumentById(id);
  },

  findDocumentById: async (id) => {
    return await dbGet(`SELECT * FROM documents WHERE id = ?`, [id]);
  },

  findDocumentsByTrip: async (trip_id) => {
    return await dbAll(`
      SELECT d.*, b.booking_type, b.airline, b.flight_number, b.hotel_name, b.booking_reference, b.raw_text
      FROM documents d
      LEFT JOIN booking_information b ON d.id = b.document_id
      WHERE d.trip_id = ?
      ORDER BY d.created_at DESC`,
      [trip_id]
    );
  },

  findBookingsByDocument: async (document_id) => {
    return await dbAll(`SELECT * FROM booking_information WHERE document_id = ?`, [document_id]);
  },

  deleteDocument: async (id) => {
    return await dbRun(`DELETE FROM documents WHERE id = ?`, [id]);
  },

  createBookingInformation: async ({
    document_id,
    booking_type = 'Flight Ticket',
    airline = '',
    flight_number = '',
    train_number = '',
    bus_operator = '',
    hotel_name = '',
    departure_city = '',
    arrival_city = '',
    departure_time = '',
    arrival_time = '',
    check_in = '',
    check_out = '',
    booking_reference = '',
    passenger_name = '',
    raw_text = '',
    confidence_score = 0.95,
  }) => {
    const id = crypto.randomUUID();
    await dbRun(
      `INSERT INTO booking_information (
        id, document_id, booking_type, airline, flight_number, train_number, bus_operator,
        hotel_name, departure_city, arrival_city, departure_time, arrival_time,
        check_in, check_out, booking_reference, passenger_name, raw_text, confidence_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        document_id,
        booking_type,
        airline,
        flight_number,
        train_number,
        bus_operator,
        hotel_name,
        departure_city,
        arrival_city,
        departure_time,
        arrival_time,
        check_in,
        check_out,
        booking_reference,
        passenger_name,
        raw_text,
        confidence_score,
      ]
    );
    return await dbGet(`SELECT * FROM booking_information WHERE id = ?`, [id]);
  },

  updateProcessingStatus: async (document_id, status) => {
    return await dbRun(`UPDATE documents SET processing_status = ? WHERE id = ?`, [status, document_id]);
  }
};

export default documentModel;
