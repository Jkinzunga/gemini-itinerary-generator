
import { GoogleGenAI } from "@google/genai";
import type { ItineraryFormValues, ItineraryResultData } from '../types';

function buildPrompt(details: ItineraryFormValues): string {
  const {
    destination,
    startDate,
    endDate,
    tripType,
    interests,
    pace,
    accommodationType,
    dietaryPreference,
    accessibilityNeeds,
  } = details;

  const interestsList = interests.length > 0 ? interests.join(", ") : "general sightseeing";

  return `
You are a creative and expert travel planner AI. Your task is to generate a detailed, scannable, and visually appealing travel itinerary based on user preferences. You MUST use your search tool to find real-time information.

The final output must be a single, valid JSON object.

The JSON object must have three top-level keys:
1. "summary": A 2-3 sentence, engaging summary of the entire trip, highlighting the key experiences.
2. "accommodations": An array of 3-4 distinct accommodation objects.
3. "itinerary": An array of day objects.

**User Preferences:**
- **Destination:** ${destination}
- **Dates:** ${startDate} to ${endDate}
- **Trip Type:** ${tripType}
- **Interests:** ${interestsList}
- **Pace:** ${pace}
- **Preferred Accommodation:** ${accommodationType}
- **Dietary Needs:** ${dietaryPreference}
- **Accessibility Needs:** ${accessibilityNeeds}

**Content Guidelines for the 'accommodations' array:**
- Suggest 3-4 distinct, well-rated accommodation options that match the user's preference.
- Each object must include:
  - 'name': The specific name of the place (e.g., "The Modernist Hotel").
  - 'type': A descriptive type (e.g., 'Boutique Hotel', 'Luxury Resort', 'Cozy Airbnb').
  - 'description': A short, engaging sentence about the place.
  - 'maps_link': A valid Google Maps search URL.

**Content Guidelines for Each Day in the 'itinerary' array:**
1.  **title:** A short, catchy title (e.g., "Midtown Marvels & Market Bites").
2.  **weather:** Provide the real, accurate weather forecast for the given location and date using your search tool. You MUST provide valid numerical values for 'high_temp' and 'low_temp' in Celsius. Do not use placeholders. If you cannot find the exact forecast, use historical averages for the date and location.
3.  **image_prompt:** Create a descriptive, aesthetic prompt for an AI image generator that captures the main vibe of the day. Examples: "A vibrant, bustling city street market at dusk, cinematic lighting", "serene minimalist photo of a misty forest trail at sunrise".
4.  **morning, afternoon, evening:** Create a time-based schedule. For each period, list 1-2 activities.
    - For each 'time', suggest a specific time (e.g., "9:00 AM", "2:30 PM").
    - For each 'name', be specific (e.g., "Pike Place Market", not "a market").
    - For each 'description', keep it short and engaging (e.g., "Watch fish fly and grab a coffee at the original Starbucks.").
    - For 'maps_link', create a valid Google Maps search URL: \`https://www.google.com/maps/search/?api=1&query=...\` with the URL-encoded place name and city.
    - All suggestions must consider the user's dietary and accessibility needs.
5.  **vibe_tags:** Provide 3-5 short, emoji-prefixed tags that summarize the day's feel (e.g., "☕ Coffee", "🏙️ City Walk", "🎨 Art").

**CRITICAL RULES:**
- The entire output MUST be a single, valid JSON object.
- The JSON object must contain 'summary' (string), 'accommodations' (array), and 'itinerary' (array) keys.
- Do NOT add any text, explanations, or markdown formatting (like \`\`\`json) before or after the JSON object. Your response must start with \`{\` and end with \`}\`.
- All suggested places (attractions, restaurants) MUST be verified as currently operational. Explicitly AVOID any locations marked as 'Permanently closed' on Google Maps.
- Do not use long paragraphs. Every entry must be short and concise.
  `;
}

export async function generateItinerary(details: ItineraryFormValues): Promise<ItineraryResultData> {
  if (!process.env.API_KEY) {
    throw new Error("Missing API_KEY environment variable.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = buildPrompt(details);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        temperature: 0.7,
      }
    });
    
    let jsonText = response.text.trim();
    
    // Handle cases where the AI wraps the JSON in markdown code blocks
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7, -3).trim();
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3, -3).trim();
    }

    const itineraryData = JSON.parse(jsonText);
    return itineraryData as ItineraryResultData;

  } catch (error) {
    console.error("Error generating itinerary with Gemini:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to generate itinerary. The AI returned an invalid format. Please try again.");
    }
    if (error instanceof Error) {
        throw new Error(`Failed to generate itinerary. Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the itinerary.");
  }
}

export async function generateImage(prompt: string): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("Missing API_KEY environment variable.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A high-quality, aesthetic travel photograph, capturing the essence of: ${prompt}`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("Image generation failed to produce an image.");
    }
  } catch (error) {
    console.error("Error generating image with Imagen:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image. Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
}
