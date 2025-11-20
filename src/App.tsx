import { useState, useEffect } from "react";
import ItineraryForm from "./components/ItineraryForm";
import ItineraryResult from "./components/ItineraryResult";
import SavedItineraries from "./components/SavedItineraries";
import type { ItineraryFormValues, ItineraryResultData, SavedItinerary } from './types';
import { generateItinerary, generateImage, addMoreActivities } from './services/geminiService';

type ActiveTab = 'generator' | 'saved';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [loading, setLoading] = useState<boolean>(false);
  const [itineraryResult, setItineraryResult] = useState<ItineraryResultData | null>(null);
  const [currentFormValues, setCurrentFormValues] = useState<ItineraryFormValues | null>(null);
  const [error, setError] = useState<string>("");
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);

  // Load saved itineraries from localStorage on mount
  useEffect(() => {
      const saved = localStorage.getItem('saved_itineraries');
      if (saved) {
          try {
              setSavedItineraries(JSON.parse(saved));
          } catch (e) {
              console.error("Failed to parse saved itineraries", e);
          }
      }
  }, []);

  // Persist saved itineraries
  useEffect(() => {
      localStorage.setItem('saved_itineraries', JSON.stringify(savedItineraries));
  }, [savedItineraries]);

  async function handleGenerate(formValues: ItineraryFormValues) {
    if (!formValues.destination || !formValues.startDate || !formValues.endDate) {
        setError("Please fill out the destination and dates before generating.");
        return;
    }

    setLoading(true);
    setError("");
    setItineraryResult(null);
    setCurrentFormValues(formValues);

    try {
      const result = await generateItinerary(formValues);
      
      // Safety check
      if(!result || !result.itinerary || result.itinerary.length === 0) {
          throw new Error("The AI generated an empty itinerary. Please try again.");
      }

      // Initialize empty strings for images to prevent 'undefined' rendering issues
      const itineraryWithPlaceholders = result.itinerary.map(day => ({ ...day, imageUrl: undefined }));
      
      setItineraryResult({ ...result, itinerary: itineraryWithPlaceholders });
      setLoading(false);

      // Generate images in background
      const itineraryWithImages = await Promise.all(
        itineraryWithPlaceholders.map(async (day) => {
          try {
            const imageUrl = await generateImage(day.image_prompt);
            return { ...day, imageUrl };
          } catch (imgError) {
            console.error(`Failed to generate image for Day ${day.day}:`, imgError);
            return { ...day, imageUrl: '' };
          }
        })
      );
      
      setItineraryResult(prev => {
        if (!prev) return null;
        return { ...prev, itinerary: itineraryWithImages };
      });

    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  }

  const handleSaveItinerary = () => {
      if (!itineraryResult || !currentFormValues) return;
      
      const newSave: SavedItinerary = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          formValues: currentFormValues,
          resultData: itineraryResult
      };
      
      setSavedItineraries(prev => [newSave, ...prev]);
      alert("Trip saved successfully!");
  };

  const handleDeleteItinerary = (id: string) => {
      setSavedItineraries(prev => prev.filter(i => i.id !== id));
  };

  const handleViewSaved = (item: SavedItinerary) => {
      setItineraryResult(item.resultData);
      setCurrentFormValues(item.formValues);
      setActiveTab('generator');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddMoreToDay = async (dayNum: number) => {
      if (!itineraryResult || !currentFormValues) return;
      
      const dayIndex = itineraryResult.itinerary.findIndex(d => d.day === dayNum);
      if (dayIndex === -1) return;

      const dayData = itineraryResult.itinerary[dayIndex];
      
      try {
        const newActivities = await addMoreActivities(dayData, currentFormValues.interests);
        
        if (newActivities.length === 0) return;

        setItineraryResult(prev => {
            if (!prev) return null;
            const newItinerary = [...prev.itinerary];
            const updatedDay = { ...newItinerary[dayIndex] };

            newActivities.forEach(item => {
                if (item.period === 'morning') updatedDay.morning = [...updatedDay.morning, item.activity];
                else if (item.period === 'afternoon') updatedDay.afternoon = [...updatedDay.afternoon, item.activity];
                else updatedDay.evening = [...updatedDay.evening, item.activity];
            });

            newItinerary[dayIndex] = updatedDay;
            return { ...prev, itinerary: newItinerary };
        });

      } catch (e) {
          console.error("Failed to add activities", e);
          alert("Could not fetch more activities at this time.");
      }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center px-4 py-10 sm:py-16">
      <style>{`
        body { 
          background-color: #0F172A;
          background-image: radial-gradient(circle at 1px 1px, #1E293B 1px, transparent 0);
          background-size: 20px 20px;
          font-family: 'Inter', sans-serif;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .text-shadow-lg { text-shadow: 0 2px 5px rgba(0,0,0,0.6); }
      `}</style>
      
      <div className="w-full max-w-4xl">
        <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                VoyageAI
            </h1>
            <p className="text-slate-400 text-lg mb-6">
                Your personal AI trip planner.
            </p>
            
            <div className="inline-flex p-1 bg-slate-800 rounded-lg border border-slate-700">
                <button 
                    onClick={() => setActiveTab('generator')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'generator' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Plan New Trip
                </button>
                <button 
                    onClick={() => setActiveTab('saved')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'saved' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Saved Trips ({savedItineraries.length})
                </button>
            </div>
        </header>

        {activeTab === 'generator' ? (
            <>
                <ItineraryForm onGenerate={handleGenerate} loading={loading} hasResult={!!itineraryResult} />

                {error && (
                <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300 animate-fade-in">
                    <strong className="font-semibold">Error:</strong> {error}
                </div>
                )}
                
                {loading && !itineraryResult && (
                    <div className="mt-8 text-center text-slate-400 p-8 border border-slate-700/50 rounded-xl bg-slate-900/70 backdrop-blur-sm animate-fade-in">
                        <p className="text-xl font-semibold text-slate-200">Crafting your adventure...</p>
                        <p className="text-slate-400 mt-1">Our AI is exploring real-time weather, hidden gems, and the best spots for you.</p>
                    </div>
                )}

                {itineraryResult && (
                    <ItineraryResult 
                        data={itineraryResult} 
                        onSave={handleSaveItinerary}
                        onAddMore={handleAddMoreToDay}
                    />
                )}
            </>
        ) : (
            <SavedItineraries 
                savedList={savedItineraries} 
                onView={handleViewSaved} 
                onDelete={handleDeleteItinerary} 
            />
        )}

         <footer className="text-center mt-16 text-sm text-slate-500">
            <p>Powered by Google Gemini & Imagen. Bon Voyage!</p>
        </footer>
      </div>
    </main>
  );
}
