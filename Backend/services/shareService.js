import QRCode from 'qrcode';
import itineraryModel from '../models/itineraryModel.js';
import tripModel from '../models/tripModel.js';
import documentModel from '../models/documentModel.js';

function buildShareUrl(frontendBase, shareToken) {
  const base = String(frontendBase || 'http://localhost:3000').replace(/\/$/, '');
  // frontendBase may already be a full origin, or legacy host-only usage
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return `${base}/share/${shareToken}`;
  }
  return `http://${base}/share/${shareToken}`;
}

export const shareService = {
  createShareLink: async (tripId, frontendBase) => {
    const shareRecord = await itineraryModel.createShareLink(tripId);
    const shareUrl = buildShareUrl(frontendBase, shareRecord.share_token);
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, { margin: 2, width: 280 });

    return {
      shareToken: shareRecord.share_token,
      shareUrl,
      qrCodeDataUrl,
      viewsCount: shareRecord.views_count || 0,
      createdAt: shareRecord.created_at,
    };
  },

  getSharedTripData: async (shareToken, frontendBase) => {
    const shareRecord = await itineraryModel.findShareByToken(shareToken);
    if (!shareRecord) {
      throw new Error('Shared itinerary link not found or expired');
    }

    await itineraryModel.incrementShareViews(shareRecord.id);

    const trip = await tripModel.findById(shareRecord.trip_id);
    if (!trip) {
      throw new Error('Associated trip not found');
    }

    const itinerary = await itineraryModel.findByTripId(trip.id);
    const documents = await documentModel.findDocumentsByTrip(trip.id);
    const shareUrl = buildShareUrl(frontendBase, shareToken);
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, { margin: 2, width: 280 });

    return {
      trip,
      itinerary: itinerary ? itinerary.itinerary_data : null,
      documents,
      viewsCount: (shareRecord.views_count || 0) + 1,
      qrCodeDataUrl,
      shareUrl,
    };
  },
};

export default shareService;
