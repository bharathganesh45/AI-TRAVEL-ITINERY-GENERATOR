const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const tripAPI = {
  createTrip: async (token, tripData) => {
    const res = await fetch(`${API_URL}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tripData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create trip');
    return data;
  },

  getTrips: async (token, search = '', page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    const url = `${API_URL}/api/trips?${params.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch trips');
    return data;
  },

  getTripById: async (token, id) => {
    const res = await fetch(`${API_URL}/api/trips/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch trip details');
    return data;
  },

  getTripBookings: async (token, id) => {
    const res = await fetch(`${API_URL}/api/trips/${id}/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch trip bookings');
    return data;
  },

  updateTrip: async (token, id, tripData) => {
    const res = await fetch(`${API_URL}/api/trips/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tripData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update trip');
    return data;
  },

  deleteTrip: async (token, id) => {
    const res = await fetch(`${API_URL}/api/trips/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete trip');
    return data;
  },

  generateAIItinerary: async (token, tripId, customNotes = '') => {
    const res = await fetch(`${API_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tripId, customNotes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate AI itinerary');
    return data;
  },

  getAIItinerary: async (token, tripId) => {
    const res = await fetch(`${API_URL}/api/ai/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch AI itinerary');
    return data;
  },

  regenerateAIItinerary: async (token, tripId, customNotes = '') => {
    const res = await fetch(`${API_URL}/api/ai/${tripId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ customNotes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to regenerate AI itinerary');
    return data;
  },

  createShareLink: async (token, tripId) => {
    const res = await fetch(`${API_URL}/api/share/${tripId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create share link');
    return data;
  },

  getSharedTrip: async (shareToken) => {
    const res = await fetch(`${API_URL}/api/share/${shareToken}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch shared trip');
    return data;
  },

  listShareLinks: async (token, tripId) => {
    const res = await fetch(`${API_URL}/api/share/list/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to list share links');
    return data;
  },

  deactivateShareLink: async (token, shareToken) => {
    const res = await fetch(`${API_URL}/api/share/${shareToken}/deactivate`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to deactivate share link');
    return data;
  },

  refreshShareLink: async (token, shareToken) => {
    const res = await fetch(`${API_URL}/api/share/${shareToken}/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to refresh share link');
    return data;
  },
};

export default tripAPI;
