
import React, { useState } from "react";
import ItineraryForm from "./components/ItineraryForm";
import ItineraryResult from "./components/ItineraryResult";
import type { ItineraryFormValues, ItineraryResultData } from './types';
import { generateItinerary, generateImage } from './services/geminiService';

export default function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [itineraryResult, setItineraryResult] = useState<ItineraryResultData | null>(null);
  const [error, setError] = useState<string>("");

  async function handleGenerate(formValues: ItineraryFormValues) {
    if (!formValues.destination || !formValues.startDate || !formValues.endDate) {
        setError("Please fill out the destination and dates before generating.");
        return;
    }

    setLoading(true);
    setError("");
    setItineraryResult(null);

    try {
      const result = await generateItinerary(formValues);
      setItineraryResult(result);
      setLoading(false);

      const itineraryWithImages = await Promise.all(
        result.itinerary.map(async (day) => {
          try {
            const imageUrl = await generateImage(day.image_prompt);
            return { ...day, imageUrl };
          } catch (imgError) {
            console.error(`Failed to generate image for Day ${day.day}:`, imgError);
            return { ...day, imageUrl: '' }; // Use empty string to signify failure
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
            <p className="text-slate-400 text-lg">
                Your personal AI trip planner.
            </p>
        </header>

        <ItineraryForm onGenerate={handleGenerate} loading={loading} hasResult={!!itineraryResult} />

        {error && (
          <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300 animate-fade-in">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}
        
        {loading && !itineraryResult && (
             <div className="mt-8 text-center text-slate-400 p-8 border border-slate-700/50 rounded-xl bg-slate-900/70 backdrop-blur-sm animate-fade-in">
                 <p className="text-xl font-semibold text-slate-200">Crafting your adventure...</p>
                 <p className="text-slate-400 mt-1">Our AI is exploring real-time weather, hidden gems, and the best spots for you. This might take a moment.</p>
             </div>
        )}

        {itineraryResult && <ItineraryResult data={itineraryResult} />}

         <footer className="text-center mt-16 text-sm text-slate-500">
            <p>Powered by Google Gemini & Imagen. Bon Voyage!</p>
        </footer>
      </div>
    </main>
  );
}