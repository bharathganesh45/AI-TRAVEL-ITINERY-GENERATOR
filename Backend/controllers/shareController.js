import shareService from '../services/shareService.js';
import tripModel from '../models/tripModel.js';
import itineraryModel from '../models/itineraryModel.js';
import crypto from 'crypto';

function getFrontendBase(req) {
  const configured = process.env.FRONTEND_URL || process.env.PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production') {
    const host = req.get('host') || 'localhost:8000';
    const protocol = req.protocol || 'http';
    return `${protocol}://${host}`;
  }

  return 'http://localhost:3000';
}

function validateToken(token) {
  if (!token || typeof token !== 'string' || token.length === 0) {
    throw new Error('Invalid share token');
  }
  return token;
}

export async function createShareLink(req, res) {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    if (!tripId || typeof tripId !== 'string') {
      return res.status(400).json({ error: 'Valid trip ID is required.' });
    }

    const trip = await tripModel.findById(tripId, userId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized.' });
    }

    const frontendBase = getFrontendBase(req);
    const shareData = await shareService.createShareLink(tripId, frontendBase);

    return res.json(shareData);
  } catch (error) {
    console.error(' [TripAI] Create share link failed:', error?.message || error);
    return res.status(500).json({ error: 'Failed to generate share link.' });
  }
}

export async function getSharedTrip(req, res) {
  try {
    const { token } = req.params;
    validateToken(token);

    const frontendBase = getFrontendBase(req);
    const sharedData = await shareService.getSharedTripData(token, frontendBase);
    return res.json(sharedData);
  } catch (error) {
    console.error(' [TripAI] Get shared trip failed:', error?.message || error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ error: error.message || 'Shared itinerary not found.' });
  }
}

export async function listShareLinks(req, res) {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    if (!tripId || typeof tripId !== 'string') {
      return res.status(400).json({ error: 'Valid trip ID is required.' });
    }

    const trip = await tripModel.findById(tripId, userId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or unauthorized.' });
    }

    const shareLinks = await itineraryModel.findShareLinksByTrip(tripId);
    return res.json({ shareLinks });
  } catch (error) {
    console.error(' List share links failed:', error?.message || error);
    return res.status(500).json({ error: 'Failed to retrieve share links.' });
  }
}

export async function deactivateShareLink(req, res) {
  try {
    const userId = req.user.id;
    const { token } = req.params;

    validateToken(token);

    const shareLink = await itineraryModel.findShareByToken(token);
    if (!shareLink) {
      return res.status(404).json({ error: 'Share link not found.' });
    }

    const trip = await tripModel.findById(shareLink.trip_id, userId);
    if (!trip) {
      return res.status(403).json({ error: 'Unauthorized to deactivate this share link.' });
    }

    await itineraryModel.deactivateShareLink(token);
    return res.json({ message: 'Share link deactivated successfully.' });
  } catch (error) {
    console.error(' Deactivate share link failed:', error?.message || error);
    return res.status(500).json({ error: 'Failed to deactivate share link.' });
  }
}

export async function refreshShareLink(req, res) {
  try {
    const userId = req.user.id;
    const { token } = req.params;

    validateToken(token);

    const shareLink = await itineraryModel.findShareByToken(token);
    if (!shareLink) {
      return res.status(404).json({ error: 'Share link not found.' });
    }

    const trip = await tripModel.findById(shareLink.trip_id, userId);
    if (!trip) {
      return res.status(403).json({ error: 'Unauthorized to refresh this share link.' });
    }

    const newToken = crypto.randomBytes(16).toString('hex');
    await itineraryModel.updateShareToken(token, newToken);

    const frontendBase = getFrontendBase(req);
    const shareUrl = `${frontendBase}/share/${newToken}`;

    return res.json({
      message: 'Share link refreshed successfully.',
      shareToken: newToken,
      shareUrl,
    });
  } catch (error) {
    console.error(' Refresh share link failed:', error?.message || error);
    return res.status(500).json({ error: 'Failed to refresh share link.' });
  }
}

export default { createShareLink, getSharedTrip, listShareLinks, deactivateShareLink, refreshShareLink };
