
export type TripType =
  | 'romantic' | 'solo' | 'friends' | 'family' | 'adventure' | 'budget'
  | 'luxury' | 'foodie' | 'relaxation' | 'nightlife' | 'nature'
  | 'photography' | 'cultural' | 'anniversary' | 'birthday' | 'honeymoon' | 'retirement';

export type BudgetLevel = 'low' | 'medium' | 'high';
export type Pace = 'chill' | 'balanced' | 'packed';
export type DietaryPreference = 'vegan-friendly' | 'vegetarian' | 'halal' | 'kosher' | 'gluten-free' | 'none';
export type AccommodationType = 'hotel' | 'hostel' | 'airbnb' | 'boutique' | 'luxury';
export type AccessibilityNeeds = 'wheelchair-accessible' | 'limited-walking' | 'none';

export interface ItineraryFormValues {
  destination: string;
  startDate: string;
  endDate: string;
  tripType: TripType;
  budgetLevel: BudgetLevel;
  pace: Pace;
  interests: string[];
  dietaryPreference: DietaryPreference;
  accommodationType: AccommodationType;
  accessibilityNeeds: AccessibilityNeeds;
}

export interface Weather {
  high_temp: number;
  low_temp: number;
  summary: string;
}

export interface Activity {
  time: string;
  name: string;
  description: string;
  maps_link?: string;
}

export interface Accommodation {
    name: string;
    type: string;
    description: string;
    maps_link?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  weather: Weather;
  image_prompt: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
  vibe_tags: string[];
  imageUrl?: string;
}

export type ItineraryData = ItineraryDay[];

export interface ItineraryResultData {
  summary: string;
  accommodations: Accommodation[];
  itinerary: ItineraryData;
}
