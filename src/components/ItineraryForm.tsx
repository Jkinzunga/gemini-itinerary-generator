
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from 'react';
import { INTEREST_OPTIONS, TRIP_TYPE_OPTIONS, PACE_OPTIONS, DIETARY_PREFERENCE_OPTIONS, ACCOMMODATION_OPTIONS, ACCESSIBILITY_OPTIONS } from './constants';
import type { ItineraryFormValues, TripType, BudgetLevel, Pace, DietaryPreference, AccommodationType, AccessibilityNeeds } from '../types';
import { getDestinationSuggestions } from '../services/geminiService';


interface ItineraryFormProps {
  onGenerate: (values: ItineraryFormValues) => void;
  loading: boolean;
  hasResult: boolean;
}

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
}

const FormField = ({ id, label, children }: FormFieldProps) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium mb-2 text-slate-300">{label}</label>
        {children}
    </div>
);

export default function ItineraryForm({ onGenerate, loading, hasResult }: ItineraryFormProps) {
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState<TripType>("romantic");
  const [budgetLevel, _setBudgetLevel] = useState<BudgetLevel>("medium");
  const [pace, setPace] = useState<Pace>("balanced");
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>("none");
  const [accommodationType, setAccommodationType] = useState<AccommodationType>('hotel');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<AccessibilityNeeds>('none');

  const [allInterests, setAllInterests] = useState<string[]>(INTEREST_OPTIONS);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState<string>("");

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
        if (destination.length > 2) {
            const results = await getDestinationSuggestions(destination);
            setSuggestions(results);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [destination]);

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  function handleAddInterest() {
    const formattedInterest = customInterest.trim();
    if (formattedInterest && !allInterests.includes(formattedInterest)) {
        setAllInterests(prev => [...prev, formattedInterest]);
        setSelectedInterests(prev => [...prev, formattedInterest]);
    }
    setCustomInterest("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onGenerate({
      destination,
      startDate,
      endDate,
      tripType,
      budgetLevel,
      pace,
      interests: selectedInterests,
      dietaryPreference,
      accommodationType,
      accessibilityNeeds,
    });
  }

  const inputStyles = "w-full rounded-lg bg-slate-800/80 border-slate-700 px-3 py-2 text-sm placeholder-slate-400 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition";

  const selectedTripTypeDescription = TRIP_TYPE_OPTIONS.find(option => option.value === tripType)?.description;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 space-y-6 shadow-2xl shadow-slate-950/50"
    >
        <div className="space-y-4">
             <FormField id="destination" label="Where are you headed?">
                 <div className="relative" ref={wrapperRef}>
                    <input 
                        id="destination" 
                        className={inputStyles} 
                        placeholder="e.g., Kyoto, Japan" 
                        value={destination} 
                        onChange={(e) => setDestination(e.target.value)} 
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        autoComplete="off"
                        required 
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto">
                            {suggestions.map((s, idx) => (
                                <li 
                                    key={idx}
                                    onClick={() => {
                                        setDestination(s);
                                        setShowSuggestions(false);
                                    }}
                                    className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-sm text-slate-200"
                                >
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                 </div>
             </FormField>
            <div className="grid sm:grid-cols-2 gap-4">
                <FormField id="startDate" label="Start Date">
                    <input id="startDate" type="date" className={inputStyles} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </FormField>
                <FormField id="endDate" label="End Date">
                    <input id="endDate" type="date" className={inputStyles} value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} required />
                </FormField>
            </div>
        </div>

        <fieldset className="border-t border-slate-700 pt-6">
            <legend className="text-base font-semibold text-slate-200 mb-4">Tell us about your trip</legend>
            <div className="grid sm:grid-cols-2 gap-4">
                 <FormField id="tripType" label="Trip Type">
                    <select id="tripType" className={inputStyles} value={tripType} onChange={(e) => setTripType(e.target.value as TripType)}>
                        {TRIP_TYPE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    {selectedTripTypeDescription && (
                        <p className="mt-2 text-xs text-slate-400">{selectedTripTypeDescription}</p>
                    )}
                 </FormField>
                 <FormField id="pace" label="Pace">
                    <select id="pace" className={inputStyles} value={pace} onChange={(e) => setPace(e.target.value as Pace)}>
                        {PACE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </FormField>
                 <FormField id="accommodationType" label="Accommodation">
                    <select id="accommodationType" className={inputStyles} value={accommodationType} onChange={(e) => setAccommodationType(e.target.value as AccommodationType)}>
                        {ACCOMMODATION_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </FormField>
                <FormField id="dietaryPreference" label="Dietary Needs">
                    <select id="dietaryPreference" className={inputStyles} value={dietaryPreference} onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}>
                        {DIETARY_PREFERENCE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </FormField>
                 <FormField id="accessibilityNeeds" label="Accessibility">
                    <select id="accessibilityNeeds" className={inputStyles} value={accessibilityNeeds} onChange={(e) => setAccessibilityNeeds(e.target.value as AccessibilityNeeds)}>
                        {ACCESSIBILITY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </FormField>
            </div>
        </fieldset>

        <fieldset className="border-t border-slate-700 pt-6">
            <legend className="text-base font-semibold text-slate-200 mb-4">What are your interests?</legend>
            <div className="flex flex-wrap gap-2">
            {allInterests.map((interest) => {
                const selected = selectedInterests.includes(interest);
                return (
                <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`text-xs sm:text-sm px-3.5 py-2 rounded-full border-2 transition-all duration-200 ${
                    selected
                        ? "bg-cyan-500 border-cyan-400 text-white font-semibold shadow-md shadow-cyan-500/20"
                        : "bg-slate-800 border-slate-600 hover:bg-slate-700 hover:border-slate-500 text-slate-300"
                    }`}
                >
                    {interest}
                </button>
                );
            })}
            </div>
            <div className="mt-4">
                <div className="flex gap-2">
                    <input
                      id="custom-interest"
                      className={inputStyles}
                      placeholder="Add a custom interest..."
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-50"
                      disabled={!customInterest}
                    >
                        + Add
                    </button>
                </div>
            </div>
        </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 flex items-center justify-center rounded-lg px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:from-sky-800/50 disabled:to-cyan-800/50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
      >
        {loading ? (
            <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Your Adventure...
            </>
        ) : (
          hasResult ? "✨ Regenerate Itinerary" : "🚀 Generate Itinerary"
        )}
      </button>
    </form>
  );
}
