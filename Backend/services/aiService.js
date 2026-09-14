import { GoogleGenAI } from '@google/genai';
import { prompts } from '../utils/prompts.js';
import { formatter } from '../utils/formatter.js';

const MODEL_CANDIDATES = [...new Set([
  process.env.GEMINI_MODEL,
  'gemini-3.6-flash',
  'gemini-2.0-flash',
].filter(Boolean))];

const AI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 60000;
const QUOTA_COOLDOWN_MS = Number(process.env.GEMINI_COOLDOWN_MS) || 10 * 60 * 1000;

let geminiCircuit = {
  openUntil: 0,
  reason: '',
};

let aiClient = null;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) return null;

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function openCircuit(reason) {
  geminiCircuit = {
    openUntil: Date.now() + QUOTA_COOLDOWN_MS,
    reason,
  };
}

function isCircuitOpen() {
  return Date.now() < geminiCircuit.openUntil;
}

function getCircuitStatus() {
  if (!isCircuitOpen()) {
    return { open: false, reason: '', retryAfterSec: 0 };
  }
  return {
    open: true,
    reason: geminiCircuit.reason,
    retryAfterSec: Math.ceil((geminiCircuit.openUntil - Date.now()) / 1000),
  };
}

function getErrorMessage(error) {
  if (!error) return 'Unknown AI error';
  if (error.message) return error.message.split('\n')[0];
  return String(error);
}

function withMeta(itinerary, source, note = '') {
  return {
    ...itinerary,
    _meta: {
      source,
      note,
      generatedAt: new Date().toISOString(),
      gemini: getCircuitStatus(),
    },
  };
}

function localItinerary(trip, documents, note) {
  return withMeta(formatter.createFallbackItinerary(trip, documents), 'fallback', note);
}

async function callGemini(model, promptText) {
  const client = getAiClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const generationConfig = {
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  };

  const request = client.models.generateContent({
    model,
    contents: promptText,
    config: generationConfig,
  });

  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`Gemini timed out after ${AI_TIMEOUT_MS}ms`);
      err.status = 408;
      reject(err);
    }, AI_TIMEOUT_MS);
  });

  try {
    const response = await Promise.race([request, timeout]);
    return response.text || '{}';
  } catch (error) {
    // Extract error details from Google API response
    if (error.error) {
      const apiError = error.error;
      const err = new Error(apiError.message || 'API Error');
      err.status = apiError.code || 500;
      err.code = apiError.status || 'API_ERROR';
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const aiService = {
  getStatus: () => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    const circuit = getCircuitStatus();
    return {
      configured: hasKey,
      circuitOpen: circuit.open,
      reason: circuit.reason,
      retryAfterSec: circuit.retryAfterSec,
      forceLocal: process.env.USE_LOCAL_ITINERARY === 'true',
    };
  },

  generateItinerary: async ({ trip, documents, customNotes = '' }) => {
    // Explicit local mode (useful for development/testing without Gemini)
    if (process.env.USE_LOCAL_ITINERARY === 'true') {
      console.log('[TripAI] USE_LOCAL_ITINERARY=true, returning local fallback');
      return localItinerary(trip, documents, 'Local mode enabled');
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      const error = new Error('GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in environment variables.');
      error.code = 'CONFIG_ERROR';
      error.status = 503;
      throw error;
    }

    if (isCircuitOpen()) {
      const { retryAfterSec, reason } = getCircuitStatus();
      const error = new Error(`Gemini service temporarily unavailable: ${reason}. Retry in approximately ${retryAfterSec}s.`);
      error.code = 'CIRCUIT_OPEN';
      error.status = 503;
      error.retryAfterSec = retryAfterSec;
      throw error;
    }

    const promptText = prompts.buildItineraryPrompt(trip, documents, customNotes);
    let lastError = null;
    const OVERLOAD_RETRY_DELAYS_MS = [1000, 2000];

    for (const model of MODEL_CANDIDATES) {
      let attempt = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const rawJson = await callGemini(model, promptText);
          console.log(`[TripAI] Itinerary generated with ${model}`);
          return withMeta(formatter.cleanAndParseJSON(rawJson, trip), 'gemini', model);
        } catch (error) {
          const status = error.status || error.code || 500;
          const message = getErrorMessage(error);
          lastError = error;

          console.error(`[TripAI] ${model} error (${status}): ${message}`);

          if (status === 429) {
            openCircuit('quota_exceeded');
            console.error('[TripAI] Gemini quota exceeded (429)');
            const err = new Error('Gemini API quota exceeded. Please try again later.');
            err.code = 'QUOTA_EXCEEDED';
            err.status = 429;
            throw err;
          }
          if (status === 401 || status === 403) {
            openCircuit('auth_error');
            console.error('[TripAI] Gemini authentication failed');
            const err = new Error('Gemini API authentication failed. Please verify your GEMINI_API_KEY.');
            err.code = 'AUTH_ERROR';
            err.status = 503;
            throw err;
          }
          if (status === 503 && attempt < OVERLOAD_RETRY_DELAYS_MS.length) {
            const delay = OVERLOAD_RETRY_DELAYS_MS[attempt];
            console.warn(`[TripAI] ${model} overloaded (503), retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            attempt += 1;
            continue;
          }
          if (status === 404 || message.includes('is not found') || message.includes('not supported')) {
            console.warn(`[TripAI] Model ${model} unavailable (404), trying next...`);
            break;
          }
          if (status === 408) {
            console.warn(`[TripAI] Model ${model} timed out (408), trying next...`);
            break;
          }
          console.warn(`[TripAI] ${model} failed, trying next model...`);
          break;
        }
      }
    }

    // All models failed
    if (lastError) {
      const err = new Error(`Failed to generate itinerary: ${getErrorMessage(lastError)}`);
      err.code = 'GENERATION_FAILED';
      err.status = 500;
      throw err;
    }

    const err = new Error('No available Gemini models. Check GEMINI_MODEL configuration.');
    err.code = 'NO_MODEL';
    err.status = 503;
    throw err;
  },
};

export default aiService;
