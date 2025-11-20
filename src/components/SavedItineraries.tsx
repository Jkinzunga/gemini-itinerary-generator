
import type { SavedItinerary } from '../types';

interface SavedItinerariesProps {
    savedList: SavedItinerary[];
    onView: (item: SavedItinerary) => void;
    onDelete: (id: string) => void;
}

export default function SavedItineraries({ savedList, onView, onDelete }: SavedItinerariesProps) {
    if (savedList.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-900/70 rounded-xl border border-slate-700/50">
                <p className="text-slate-400 text-lg">You haven't saved any itineraries yet.</p>
                <p className="text-slate-500 text-sm mt-2">Generate a trip and click "Save Itinerary" to see it here.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 animate-fade-in">
            {savedList.map((item) => (
                <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col sm:flex-row justify-between gap-4 hover:border-slate-600 transition-all">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-100">{item.formValues.destination}</h3>
                            <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded-md border border-cyan-800">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-3">{item.resultData.summary}</p>
                        <div className="flex flex-wrap gap-2">
                             <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{item.formValues.tripType}</span>
                             <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{item.formValues.pace}</span>
                        </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 justify-end sm:justify-center min-w-[120px]">
                        <button 
                            onClick={() => onView(item)}
                            className="flex-1 text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            View Trip
                        </button>
                        <button 
                            onClick={() => onDelete(item.id)}
                            className="flex-1 text-sm font-medium bg-slate-700 hover:bg-red-900/50 hover:text-red-300 text-slate-300 py-2 px-4 rounded-lg transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
