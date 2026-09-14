import tripModel from '../models/tripModel.js';
import documentModel from '../models/documentModel.js';
import itineraryModel from '../models/itineraryModel.js';

export async function createTrip(req, res) {
  try {
    const { trip_name, title, destination, trip_type, start_date, end_date, duration_days, days, travelers_count, people } = req.body;
    const userId = req.user.id;

    const actualTitle = (title || trip_name || '').trim();
    if (!actualTitle || actualTitle.length === 0 || actualTitle.length > 255) {
      return res.status(400).json({ error: 'Trip title must be between 1 and 255 characters.' });
    }

    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ error: 'Start date must be before or equal to end date.' });
    }

    const finalDays = Math.max(1, Math.min(365, Number(duration_days || days) || 6));
    const finalPeople = Math.max(1, Math.min(1000, Number(travelers_count || people) || 2));

    if (finalPeople < 1) {
      return res.status(400).json({ error: 'Travelers count must be at least 1.' });
    }

    const destStr = (destination || '').trim().substring(0, 255) || 'TBD Destination';

    const newTrip = await tripModel.create({
      user_id: userId,
      title: actualTitle,
      destination: destStr,
      trip_type: (trip_type || 'Leisure').substring(0, 50),
      start_date: start_date || null,
      end_date: end_date || null,
      duration_days: finalDays,
      travelers_count: finalPeople,
      status: 'Draft',
    });

    return res.status(201).json({ trip: newTrip });
  } catch (error) {
    console.error(' Create trip controller error:', error);
    return res.status(500).json({ error: 'Failed to create trip.' });
  }
}

export async function getTrips(req, res) {
  try {
    const userId = req.user.id;
    const search = req.query.search || '';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const allTrips = await tripModel.findAllByUser(userId, search);
    const total = allTrips.length;
    const trips = allTrips.slice((page - 1) * limit, page * limit);
    const stats = await tripModel.getStatsByUser(userId);

    return res.json({
      trips,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get trips controller error:', error);
    return res.status(500).json({ error: 'Failed to retrieve trips.' });
  }
}

export async function getTripById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const trip = await tripModel.findById(id, userId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const documents = await documentModel.findDocumentsByTrip(id);
    const itinerary = await itineraryModel.findByTripId(id);

    return res.json({
      trip,
      documents,
      itinerary: itinerary ? itinerary.itinerary_data : null,
      rawItinerary: itinerary,
    });
  } catch (error) {
    console.error('Get trip by ID controller error:', error);
    return res.status(500).json({ error: 'Failed to fetch trip details.' });
  }
}

export async function updateTrip(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await tripModel.findById(id, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (req.body.start_date && req.body.end_date && new Date(req.body.start_date) > new Date(req.body.end_date)) {
      return res.status(400).json({ error: 'Start date must be before or equal to end date.' });
    }

    if (req.body.travelers_count && req.body.travelers_count < 1) {
      return res.status(400).json({ error: 'Travelers count must be at least 1.' });
    }

    const updated = await tripModel.update(id, userId, req.body);
    return res.json({ trip: updated });
  } catch (error) {
    console.error('Update trip controller error:', error);
    return res.status(500).json({ error: 'Failed to update trip.' });
  }
}

export async function deleteTrip(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await tripModel.findById(id, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Trip not found or unauthorized.' });
    }

    await tripModel.delete(id, userId);
    return res.json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    console.error('Delete trip controller error:', error);
    return res.status(500).json({ error: 'Failed to delete trip.' });
  }
}

export async function getTripBookings(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const trip = await tripModel.findById(id, userId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const documents = await documentModel.findDocumentsByTrip(id);
    const bookings = (await Promise.all(
      documents.map(doc => documentModel.findBookingsByDocument(doc.id))
    )).flat();

    return res.json({ bookings, count: bookings.length });
  } catch (error) {
    console.error('Get trip bookings controller error:', error);
    return res.status(500).json({ error: 'Failed to fetch trip bookings.' });
  }
}

export default { createTrip, getTrips, getTripById, getTripBookings, updateTrip, deleteTrip };
