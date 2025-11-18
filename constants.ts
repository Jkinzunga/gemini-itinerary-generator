
import type { TripType, Pace, DietaryPreference, AccommodationType, AccessibilityNeeds } from './types';

export const INTEREST_OPTIONS: string[] = [
  "Food",
  "Nightlife",
  "Museums",
  "Outdoors",
  "Shopping",
  "History",
  "Art & Culture",
  "Adventure",
  "Coffee",
  "Beaches",
  "Photography",
  "Fitness",
];

export const TRIP_TYPE_OPTIONS: { value: TripType; label: string; description: string }[] = [
  { value: 'romantic', label: 'Romantic', description: 'Getaways for couples, focusing on intimate and scenic experiences.' },
  { value: 'solo', label: 'Solo', description: 'Adventures for the independent traveler, prioritizing safety and self-discovery.' },
  { value: 'friends', label: 'Friends', description: 'Group trips with a mix of social activities, nightlife, and fun.' },
  { value: 'family', label: 'Family', description: 'Kid-friendly activities and attractions suitable for all ages.' },
  { value: 'adventure', label: 'Adventure', description: 'Action-packed trips with hiking, sports, and thrilling experiences.' },
  { value: 'budget', label: 'Budget', description: 'Affordable travel with a focus on free activities and cost-effective options.' },
  { value: 'luxury', label: 'Luxury', description: 'Indulgent experiences with high-end hotels, fine dining, and exclusive access.' },
  { value: 'foodie', label: 'Foodie', description: 'A culinary journey exploring local markets, cooking classes, and top-rated restaurants.' },
  { value: 'relaxation', label: 'Relaxation', description: 'A slow-paced escape with spas, beaches, and tranquil environments.' },
  { value: 'nightlife', label: 'Nightlife', description: 'Explore the best bars, clubs, and evening entertainment the city has to offer.' },
  { value: 'nature', label: 'Nature', description: 'Get outdoors with a focus on national parks, wildlife, and scenic landscapes.' },
  { value: 'photography', label: 'Photography', description: 'Capture stunning visuals with a focus on photogenic spots and golden hour opportunities.' },
  { value: 'cultural', label: 'Cultural', description: 'Deep dive into the local heritage with museums, historical sites, and traditional events.' },
  { value: 'anniversary', label: 'Anniversary', description: 'Celebrate a special milestone with memorable dining and unique activities.' },
  { value: 'birthday', label: 'Birthday', description: 'A fun-filled trip to celebrate a birthday with exciting and festive plans.' },
  { value: 'honeymoon', label: 'Honeymoon', description: 'Unforgettable romantic trip for newlyweds with a mix of luxury and unique experiences.' },
  { value: 'retirement', label: 'Retirement', description: 'A relaxed trip to celebrate a new chapter, focusing on comfort and leisure.' },
];

export const PACE_OPTIONS: { value: Pace; label: string }[] = [
    { value: 'chill', label: 'Chill' },
    { value: 'balanced', label: 'Balanced' },
    { value: 'packed', label: 'Packed' },
];

export const DIETARY_PREFERENCE_OPTIONS: { value: DietaryPreference; label: string }[] = [
    { value: 'none', label: 'No specific preference' },
    { value: 'vegan-friendly', label: 'Vegan-friendly' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'gluten-free', label: 'Gluten-Free' },
];

export const ACCOMMODATION_OPTIONS: { value: AccommodationType; label: string }[] = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'airbnb', label: 'Airbnb / Rental' },
    { value: 'boutique', label: 'Boutique Hotel' },
    { value: 'luxury', label: 'Luxury Resort' },
];

export const ACCESSIBILITY_OPTIONS: { value: AccessibilityNeeds; label: string }[] = [
    { value: 'none', label: 'No specific needs' },
    { value: 'wheelchair-accessible', label: 'Wheelchair Accessible' },
    { value: 'limited-walking', label: 'Limited Walking' },
];
