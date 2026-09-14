const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const uploadAPI = {
  uploadDocument: async (token, tripId, file) => {
    const formData = new FormData();
    formData.append('trip_id', tripId);
    formData.append('file', file);

    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload document');
    return data;
  },

  deleteDocument: async (token, documentId) => {
    const res = await fetch(`${API_URL}/api/upload/${documentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete document');
    return data;
  },
};

export default uploadAPI;
