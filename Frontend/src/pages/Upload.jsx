import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, FileText, CheckCircle2, ArrowRight, Search, Plus, Loader2, Cloud } from 'lucide-react';
import { useAuth } from '../context/Authcontext';
import tripAPI from '../api/tripApi';
import uploadAPI from '../api/uploadApi';
import UploadCard from '../components/Uploadcard';
import LoadingSpinner from '../components/Loadingspinner';

export const Upload = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlTripId = searchParams.get('tripId') || '';
  const urlTab = searchParams.get('tab') || 'wizard';

  const [activeTab, setActiveTab] = useState(urlTab);
  const [wizardStep, setWizardStep] = useState(urlTripId ? 2 : 1);
  const [selectedTripId, setSelectedTripId] = useState(urlTripId);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [destination, setDestination] = useState('');
  const [tripName, setTripName] = useState('');
  const [durationDays, setDurationDays] = useState(6);
  const [travelersCount, setTravelersCount] = useState(2);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        if (urlTripId) {
          const tripDetails = await tripAPI.getTripById(token, urlTripId);
          const trip = tripDetails.trip;
          setDestination(trip.destination || '');
          setTripName(trip.title || '');
          setDurationDays(trip.duration_days || 6);
          setTravelersCount(trip.travelers_count || 2);
          setDocuments(tripDetails.documents || []);
        }
      } catch (err) {
        console.error('Failed to init upload page:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) init();
    else setIsLoading(false);
  }, [token, urlTripId]);

  useEffect(() => {
    if (!selectedTripId || !token) return;
    tripAPI.getTripById(token, selectedTripId).then((res) => {
      setDocuments(res.documents || []);
      if (res.documents?.length) setSelectedDoc(res.documents[0]);
    }).catch(console.error);
  }, [selectedTripId, token]);

  useEffect(() => {
    if (documents.length > 0 && wizardStep < 3) setWizardStep(3);
    if (documents.length > 0) {
      setProcessingProgress(80);
    }
  }, [documents.length, wizardStep]);

  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      setError('Trip name is required');
      return null;
    }
    setIsCreatingTrip(true);
    setError('');
    try {
      const res = await tripAPI.createTrip(token, {
        title: tripName,
        destination: destination || 'TBD',
        trip_type: 'Leisure',
        duration_days: durationDays,
        travelers_count: travelersCount,
      });
      setSelectedTripId(res.trip.id);
      setWizardStep(2);
      return res.trip.id;
    } catch (err) {
      setError(err.message || 'Failed to create trip');
      return null;
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const handleFileUpload = async (file) => {
    let tripIdToUse = selectedTripId;

    if (!tripIdToUse) {
      tripIdToUse = await handleCreateTrip();
      if (!tripIdToUse) {
        if (!tripName.trim()) return;
        try {
          const res = await tripAPI.createTrip(token, {
            title: tripName || 'New Trip',
            destination: destination || 'TBD',
            duration_days: durationDays,
            travelers_count: travelersCount,
          });
          tripIdToUse = res.trip.id;
          setSelectedTripId(tripIdToUse);
        } catch (e) {
          setError('Failed to create trip workspace');
          return;
        }
      }
    }

    setIsUploading(true);
    setError('');
    setWizardStep(3);
    setProcessingProgress(30);

    try {
      const res = await uploadAPI.uploadDocument(token, tripIdToUse, file);
      setDocuments((prev) => [res.document, ...prev]);
      setSelectedDoc(res.document);
      setProcessingProgress(80);
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await uploadAPI.deleteDocument(token, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) setSelectedDoc(null);
    } catch (err) {
      alert(err.message || 'Failed to delete document');
    }
  };

  const handleGenerateItinerary = async () => {
    if (!selectedTripId) return;
    setIsGenerating(true);
    setProcessingProgress(100);
    setError('');
    try {
      await tripAPI.generateAIItinerary(token, selectedTripId);
      navigate(`/ai-result?tripId=${selectedTripId}`);
    } catch (err) {
      setError(err.message || 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Preparing upload portal..." />;

  if (activeTab === 'documents') {
    const filteredDocs = documents.filter((d) =>
      !searchTerm || d.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-slate-900">Travel Documents</h1>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="input-field !rounded-full pl-9 w-48 sm:w-64"
              />
            </div>
            <button onClick={() => setActiveTab('wizard')} className="btn-primary">
              <Plus className="w-4 h-4" />
              Upload Documents
            </button>
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="card rounded-3xl p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500">No documents uploaded yet.</p>
            <button onClick={() => setActiveTab('wizard')} className="btn-primary mx-auto">
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 space-y-3">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedDoc?.id === doc.id ? 'bg-indigo-50/50 border-indigo-200' : 'card hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-slate-100 rounded-xl text-indigo-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{doc.file_name}</h4>
                      <span className="text-[10px] font-bold text-emerald-600">{doc.document_type || 'Document'}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-1">
                        ✓ Extracted
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-7 card rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900">{selectedDoc?.document_type || 'Document Details'}</h3>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full">✓ Extracted</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Flight Number', selectedDoc?.flight_number || '—'],
                  ['From', selectedDoc?.departure_city || '—'],
                  ['To', selectedDoc?.arrival_city || '—'],
                  ['Hotel', selectedDoc?.hotel_name || '—'],
                  ['Departure', selectedDoc?.departure_time || '—'],
                  ['Arrival', selectedDoc?.arrival_time || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              {selectedDoc?.raw_text && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Extracted Text</p>
                  <p className="text-xs text-slate-600 whitespace-pre-wrap max-h-40 overflow-y-auto">{selectedDoc.raw_text.slice(0, 500)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Create New Trip</h1>
        <button onClick={() => setActiveTab('documents')} className="text-xs font-bold text-indigo-600 hover:underline">
          View All Documents →
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-3 rounded-xl">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Step 1 */}
        <div className={`card rounded-3xl p-6 flex flex-col justify-between space-y-4 ${wizardStep === 1 ? 'ring-2 ring-indigo-200' : ''}`}>
          <div className="space-y-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Step 1 — Create Your Trip</span>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1 text-sm">Where are you going?</label>
                <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Dubai, UAE" className="input-field" />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1 text-sm">Trip Name</label>
                <input type="text" value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="Dubai Adventure" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 text-sm">Number of Days</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1 text-sm">Number of Travellers</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={travelersCount}
                    onChange={(e) => setTravelersCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
          <button onClick={handleCreateTrip} disabled={isCreatingTrip || wizardStep > 1} className="btn-primary w-full justify-center py-3">
            {isCreatingTrip ? 'Creating...' : wizardStep > 1 ? '✓ Trip Created' : 'Continue'}
            {wizardStep <= 1 && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Step 2 */}
        <div className={`card rounded-3xl p-6 space-y-4 ${wizardStep === 2 ? 'ring-2 ring-indigo-200' : wizardStep < 2 ? 'opacity-60' : ''}`}>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Step 2 — Upload Documents</span>
          <div className="text-center py-2">
            <Cloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900">Drag & Drop files here</p>
            <p className="text-xs text-slate-400 mt-1">PDF • JPG • PNG</p>
          </div>
          <UploadCard onFileUpload={handleFileUpload} isUploading={isUploading} documents={documents} onDeleteDocument={handleDeleteDocument} />
          <div className="space-y-1 text-xs text-slate-600">
            {['Flight tickets', 'Hotel bookings', 'Train / Bus tickets', 'Other travel documents'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Step 3 */}
        <div className={`card rounded-3xl p-6 flex flex-col justify-between space-y-4 ${wizardStep >= 3 ? 'ring-2 ring-indigo-200' : 'opacity-60'}`}>
          <div className="space-y-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Step 3 — Processing</span>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center space-x-1">
                  Processing Your Trip
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                </span>
                <span>{processingProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${processingProgress}%` }} />
              </div>
              {documents[0] && <p className="text-[11px] text-slate-400">{documents[0].file_name}</p>}
            </div>
            <div className="space-y-2 text-xs font-semibold">
              {[
                { label: 'Document uploaded', done: documents.length > 0 },
                { label: 'Text extracted', done: documents.length > 0 },
                { label: 'Understanding booking details', done: processingProgress >= 80, active: isUploading },
                { label: 'Generating itinerary', done: isGenerating, active: isGenerating },
              ].map(({ label, done, active }) => (
                <div key={label} className={`flex items-center space-x-2 ${done ? 'text-emerald-600' : active ? 'text-amber-600' : 'text-slate-400'}`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerateItinerary}
            disabled={isGenerating || isUploading || documents.length === 0}
            className="btn-primary w-full justify-center py-3"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate Itinerary'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
