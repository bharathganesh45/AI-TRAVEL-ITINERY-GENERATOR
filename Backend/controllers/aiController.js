import tripModel from '../models/tripModel.js';
import documentModel from '../models/documentModel.js';
import itineraryModel from '../models/itineraryModel.js';
import aiService from '../services/aiService.js';

export async function generateItinerary(req, res) {
  try {
    const userId = req.user.id;
    const { tripId, customNotes } = req.body;

    if (!tripId || typeof tripId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid tripId is required',
        code: 'INVALID_TRIP_ID',
      });
    }

    if (customNotes && typeof customNotes !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Custom notes must be a string',
        code: 'INVALID_NOTES',
      });
    }

    const trip = await tripModel.findById(tripId, userId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or unauthorized',
        code: 'TRIP_NOT_FOUND',
      });
    }

    const documents = await documentModel.findDocumentsByTrip(tripId);

    console.log(`[TripAI] Generating itinerary for trip: ${tripId}, documents: ${documents.length}`);

    const itineraryData = await aiService.generateItinerary({
      trip,
      documents,
      customNotes: customNotes || '',
    });

    console.log('[TripAI] AI generation succeeded, saving to database');

    const savedItinerary = await itineraryModel.create({
      trip_id: tripId,
      user_id: userId,
      summary: itineraryData.tripSummary?.overview || '',
      ai_response: JSON.stringify(itineraryData),
      itinerary_json: JSON.stringify(itineraryData),
    });

    await tripModel.update(tripId, userId, { status: 'Itinerary Ready' });

    console.log('[TripAI] Itinerary saved successfully');

    return res.status(201).json({
      success: true,
      itinerary: itineraryData,
      source: 'gemini',
      message: 'Itinerary generated successfully',
    });
  } catch (error) {
    const errorCode = error.code || 'GENERATION_FAILED';
    const errorStatus = error.status || 500;
    const errorMessage = error.message || 'Failed to generate itinerary';

    console.error(` [TripAI] Error (${errorCode}): ${errorMessage}`);

    return res.status(errorStatus).json({
      success: false,
      error: errorMessage,
      code: errorCode,
    });
  }
}

export async function getItineraryByTrip(req, res) {
  try {
    const { tripId } = req.params;

    if (!tripId || typeof tripId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid tripId is required',
        code: 'INVALID_TRIP_ID',
      });
    }

    const itineraryRecord = await itineraryModel.findByTripId(tripId);

    if (!itineraryRecord) {
      return res.status(404).json({
        success: false,
        error: 'No itinerary found for this trip',
        code: 'ITINERARY_NOT_FOUND',
      });
    }

    return res.json({
      success: true,
      itinerary: itineraryRecord.itinerary_data,
    });
  } catch (error) {
    console.error(' [TripAI] Get itinerary failed:', error?.message || error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch itinerary',
      code: 'FETCH_FAILED',
    });
  }
}

export async function regenerateItinerary(req, res) {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;
    const { customNotes } = req.body;

    if (!tripId || typeof tripId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Valid tripId is required',
        code: 'INVALID_TRIP_ID',
      });
    }

    const trip = await tripModel.findById(tripId, userId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found or unauthorized',
        code: 'TRIP_NOT_FOUND',
      });
    }

    console.log(`[TripAI] Regenerating itinerary for trip: ${tripId}`);

    const documents = await documentModel.findDocumentsByTrip(tripId);

    const itineraryData = await aiService.generateItinerary({
      trip,
      documents,
      customNotes: customNotes || '',
    });

    console.log('[TripAI] Regeneration succeeded, updating database');

    const savedItinerary = await itineraryModel.create({
      trip_id: tripId,
      user_id: userId,
      summary: itineraryData.tripSummary?.overview || '',
      ai_response: JSON.stringify(itineraryData),
      itinerary_json: JSON.stringify(itineraryData),
    });

    console.log('[TripAI] Itinerary regenerated successfully');

    return res.json({
      success: true,
      itinerary: itineraryData,
      source: 'gemini',
      message: 'Itinerary regenerated successfully',
    });
  } catch (error) {
    const errorCode = error.code || 'REGENERATION_FAILED';
    const errorStatus = error.status || 500;
    const errorMessage = error.message || 'Failed to regenerate itinerary';

    console.error(` [TripAI] Error (${errorCode}): ${errorMessage}`);

    return res.status(errorStatus).json({
      success: false,
      error: errorMessage,
      code: errorCode,
    });
  }
}

export default { generateItinerary, getItineraryByTrip, regenerateItinerary };
