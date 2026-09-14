
import attractionsDB from './attractions.js';

export const formatter = {
  cleanAndParseJSON: (rawText, trip) => {
    let cleaned = (rawText || '').trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      return formatter.normalizeItinerary(JSON.parse(cleaned), trip);
    } catch (e1) {
      try {
        const sanitized = cleaned.replace(/[\u0000-\u001F]+/g, (m) =>
          m === '\n' || m === '\r' || m === '\t' ? m : ''
        );
        return formatter.normalizeItinerary(JSON.parse(sanitized), trip);
      } catch (e2) {
        try {
          const repaired = formatter.repairTruncatedJSON(cleaned);
          if (repaired && typeof repaired === 'object') {
            return formatter.normalizeItinerary(repaired, trip);
          }
        } catch (e3) {
          // Fall through
        }
        // All parsing attempts failed - throw error instead of silently falling back
        const err = new Error(`Failed to parse AI response as JSON: ${e1.message}`);
        err.code = 'JSON_PARSE_FAILED';
        err.status = 422;
        throw err;
      }
    }
  },

  repairTruncatedJSON: (jsonStr) => {
    let str = (jsonStr || '').trim();
    if (!str) return null;

    let inString = false;
    let escaped = false;
    const stack = [];

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === '{' || char === '[') {
          stack.push(char === '{' ? '}' : ']');
        } else if (char === '}' || char === ']') {
          if (stack.length > 0 && stack[stack.length - 1] === char) {
            stack.pop();
          }
        }
      }
    }

    if (inString) str += '"';
    str = str.replace(/,\s*$/, '');
    str = str.replace(/:\s*$/, ': null');

    while (stack.length > 0) {
      str = str.replace(/,\s*$/, '') + stack.pop();
    }

    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  },

  /** Enhanced fallback with real attractions for known destinations */
  createFallbackItinerary: (trip) => {
    const totalDays = Math.max(1, Number(trip?.duration_days) || 6);
    const travelers = Math.max(1, Number(trip?.travelers_count) || 2);
    const destination = trip?.destination || 'Destination';

    // Get attractions for this destination, or use generic fallback
    const destData = attractionsDB[destination];

    if (!destData) {
      // Fallback for unknown destinations
      const dayWisePlan = [];
      for (let d = 1; d <= totalDays; d++) {
        dayWisePlan.push({
          day: d,
          title: `Day ${d}: Explore ${destination}`,
          theme: d === 1 ? 'Arrival' : d === totalDays ? 'Departure' : 'Explore',
          focusArea: destination,
          activities: [
            {
              time: '10:00 AM',
              title: `Day ${d} in ${destination}`,
              description: `Explore local attractions in ${destination}. Enable Gemini to get AI-generated detailed recommendations with real hotels and activities for ${travelers} traveler(s).`,
              location: destination,
              address: destination,
              area: destination,
              category: 'sightseeing',
              costEstimate: 'TBD',
              duration: '—',
              nearbyTip: 'Use Regenerate Itinerary with Gemini enabled for detailed recommendations.',
            },
          ],
        });
      }

      return formatter.normalizeItinerary(
        {
          tripSummary: {
            title: trip?.title || `${destination} Trip`,
            destination,
            totalDays,
            travelers,
            overview: `Local itinerary for ${destination}. Regenerate with Gemini to get AI-curated details, real addresses, and optimized routing for this destination.`,
            bestTimeToVisit: 'Research local climate and seasons',
            currency: 'Local currency',
            bestBaseArea: destination,
          },
          flights: [],
          hotels: [],
          nearbyHotels: [],
          transport: [],
          dayWisePlan,
          packingList: [
            'Passport & travel documents',
            'Comfortable walking shoes',
            'Universal travel adapter',
            'Portable power bank',
            'Local guidebook or offline maps',
          ],
          budget: {
            estimatedTotal: 'Generate with Gemini for accurate estimate',
            currency: 'Local',
            breakdown: [],
          },
          weather: {
            forecast: `Check current forecast for ${destination}`,
            avgTemp: 'Check weather services',
            recommendation: 'Pack for local climate and season.',
          },
          emergencyContacts: [{ service: 'Local Emergency', number: '112 / 911' }],
          tips: [
            `Regenerate this trip to get AI-powered recommendations for ${destination}.`,
            'Real addresses and hotels work best with Gemini enabled.',
          ],
        },
        trip
      );
    }

    // Build itinerary with real attractions
    const attractions = destData.attractions || [];
    const hotels = destData.hotels || [];
    const dayWisePlan = [];

    for (let d = 1; d <= totalDays; d++) {
      const activities = [];

      if (d === 1) {
        activities.push({
          time: '10:00 AM',
          title: 'Arrival and Hotel Check-in',
          description: `Arrive at ${destination} and check into your hotel. Settle in and explore the immediate neighborhood for ${travelers} traveler(s).`,
          location: hotels.length > 0 ? hotels[0].name : destination,
          address: hotels.length > 0 ? hotels[0].address : destination,
          area: hotels.length > 0 ? hotels[0].area : destination,
          category: 'hotel',
          costEstimate: `Hotel for ${travelers}`,
          duration: '2 hours',
          nearbyTip: `Ask hotel staff for restaurant and transportation recommendations.`,
        });
      }

      // Add attractions to day plan, distributed across days
      const startIdx = Math.floor((d - 1) * attractions.length / totalDays);
      const endIdx = Math.floor(d * attractions.length / totalDays);

      for (let i = startIdx; i < endIdx; i++) {
        if (i < attractions.length) {
          const attr = attractions[i];
          activities.push({
            time: `${10 + (activities.length - 1)}:00 AM`,
            title: attr.name,
            description: attr.description,
            location: attr.name,
            address: attr.address,
            area: attr.area,
            category: attr.category,
            costEstimate: attr.cost,
            duration: attr.duration,
            nearbyTip: `Check local transportation options. Wear comfortable shoes. Best time: morning or early afternoon.`,
          });
        }
      }

      if (d === totalDays) {
        activities.push({
          time: '02:00 PM',
          title: 'Departure',
          description: `Check out from hotel and depart from ${destination}. Allow time for travel to airport or station.`,
          location: destination,
          address: destination,
          area: destination,
          category: 'transport',
          costEstimate: 'Variable',
          duration: '2-3 hours',
          nearbyTip: 'Arrange transport to airport/station in advance.',
        });
      }

      dayWisePlan.push({
        day: d,
        title: `Day ${d}: ${destination} Highlights`,
        theme: d === 1 ? 'Arrival' : d === totalDays ? 'Departure' : 'Exploration',
        focusArea: destination,
        activities,
      });
    }

    // Map hotels to the format expected
    const mappedHotels = hotels.map(h => ({
      hotelName: h.name,
      address: h.address,
      area: h.area,
      checkIn: 'After 3:00 PM',
      checkOut: 'Before 11:00 AM',
      bookingReference: 'Pending',
      priceRange: 'Check with booking platform',
      whyRecommended: `Popular ${destination} hotel in excellent location for tourists`,
    }));

    const nearbyHotels = hotels.slice(1, 4).map(h => ({
      hotelName: h.name,
      address: h.address,
      area: h.area,
      distanceFromCenter: 'Walking distance',
      priceRange: 'Check with booking platform',
      ratingHint: h.rating,
      whyRecommended: `Alternative option in ${h.area}, well-reviewed for ${travelers} travelers`,
    }));

    return formatter.normalizeItinerary(
      {
        tripSummary: {
          title: trip?.title || `${destination} Trip`,
          destination,
          totalDays,
          travelers,
          overview: `${totalDays}-day itinerary for ${travelers} traveler(s) in ${destination}. Includes real attractions and hotel recommendations. Enable Gemini for AI-optimized daily routings and personalized suggestions.`,
          bestTimeToVisit: `Research seasonal weather for ${destination}`,
          currency: 'Local currency',
          bestBaseArea: hotels.length > 0 ? hotels[0].area : destination,
        },
        flights: [],
        hotels: mappedHotels.slice(0, 2),
        nearbyHotels: nearbyHotels,
        transport: [],
        dayWisePlan,
        packingList: [
          'Passport & travel documents',
          'Comfortable walking shoes',
          'Layers and weather-appropriate clothing',
          'Sunscreen and sunglasses',
          'Universal travel adapter',
          'Portable power bank',
          'Refillable water bottle',
          'Camera or smartphone for photography',
        ],
        budget: {
          estimatedTotal: `$${(attractions.length * 40 * travelers).toLocaleString()} (approximate)`,
          currency: 'USD (check local rates)',
          breakdown: [
            { category: 'Accommodation', amount: `$${(80 * totalDays * 0.6).toLocaleString()}` },
            { category: 'Attractions', amount: `$${(40 * attractions.length * travelers).toLocaleString()}` },
            { category: 'Dining', amount: `$${(50 * totalDays * travelers).toLocaleString()}` },
            { category: 'Transport/Misc', amount: `$${(30 * totalDays * travelers).toLocaleString()}` },
          ],
        },
        weather: {
          forecast: `Check weather.com for ${destination}`,
          avgTemp: 'Varies by season',
          recommendation: 'Pack layers and check seasonal conditions',
        },
        emergencyContacts: [
          { service: 'Emergency', number: '112 (EU) / 911 (US)' },
          { service: 'Embassy', number: 'Check your country\'s embassy website' },
        ],
        tips: [
          `Public transportation is efficient in ${destination} - consider a travel pass`,
          'Book popular attractions in advance to avoid long queues',
          'Stay hydrated and take breaks during busy sightseeing days',
          'Tip generously at restaurants (15-20% recommended)',
          `Enable Gemini to get personalized AI recommendations for ${destination}`,
        ],
      },
      trip
    );
  },

  normalizeItinerary: (itinerary, trip) => {
    if (!itinerary || typeof itinerary !== 'object') {
      const err = new Error('AI response is not a valid object');
      err.code = 'INVALID_RESPONSE_STRUCTURE';
      err.status = 422;
      throw err;
    }

    const totalDays = Math.max(
      1,
      Number(trip?.duration_days) || Number(itinerary.tripSummary?.totalDays) || 6
    );
    const travelers = Math.max(
      1,
      Number(trip?.travelers_count) || Number(itinerary.tripSummary?.travelers) || 2
    );
    const destination = trip?.destination || itinerary.tripSummary?.destination || 'Destination';

    // Validate required fields
    if (!itinerary.tripSummary) {
      const err = new Error('AI response missing tripSummary');
      err.code = 'MISSING_TRIP_SUMMARY';
      err.status = 422;
      throw err;
    }

    let dayWisePlan = Array.isArray(itinerary.dayWisePlan) ? [...itinerary.dayWisePlan] : [];

    if (dayWisePlan.length === 0) {
      const err = new Error(`AI response missing dayWisePlan (expected ${totalDays} days)`);
      err.code = 'MISSING_DAY_PLAN';
      err.status = 422;
      throw err;
    }

    if (dayWisePlan.length > totalDays) {
      console.warn(`[Formatter] AI returned ${dayWisePlan.length} days but trip duration is ${totalDays}, truncating`);
      dayWisePlan = dayWisePlan.slice(0, totalDays);
    }

    while (dayWisePlan.length < totalDays) {
      const d = dayWisePlan.length + 1;
      dayWisePlan.push({
        day: d,
        title: `Day ${d}: Explore ${destination}`,
        theme: 'City Exploration',
        focusArea: destination,
        activities: [
          {
            time: '10:00 AM',
            title: `Sightseeing in ${destination}`,
            description: `Continue exploring ${destination} with your group of ${travelers}.`,
            location: destination,
            address: destination,
            area: destination,
            category: 'sightseeing',
            costEstimate: `For ${travelers} travelers`,
            duration: '2 hrs',
            nearbyTip: `Stay near your hotel in ${destination}.`,
          },
        ],
      });
    }

    const summary = { ...(itinerary.tripSummary || {}) };
    summary.totalDays = totalDays;
    summary.travelers = travelers;
    if (trip?.title) summary.title = trip.title;
    if (trip?.destination) summary.destination = trip.destination;

    dayWisePlan = dayWisePlan.map((day, idx) => ({
      ...day,
      day: idx + 1,
      activities: (day.activities || []).map((act) => ({
        ...act,
        location: act.location || destination,
        address: act.address || act.location || destination,
        area: act.area || destination,
      })),
    }));

    // Keep Gemini hotels as-is (do not replace with hardcoded lists)
    const hotels = Array.isArray(itinerary.hotels) ? itinerary.hotels : [];
    const nearbyHotels = Array.isArray(itinerary.nearbyHotels) ? itinerary.nearbyHotels : [];

    return {
      ...itinerary,
      tripSummary: summary,
      dayWisePlan,
      hotels,
      nearbyHotels,
    };
  },
};

export default formatter;
