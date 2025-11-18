
import React, { useState } from 'react';
import type { ItineraryResultData, ItineraryDay, Activity, Accommodation } from '../types';

interface ActivityItemProps {
  activity: Activity;
}

// FIX: Explicitly typed the component as React.FC to correctly handle the 'key' prop provided during mapping.
const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => (
    <div className="flex items-start gap-4 group">
      <div className="flex flex-col items-center">
        <div className="w-24 text-right text-sm font-medium text-slate-400">{activity.time}</div>
        <div className="w-px h-full bg-slate-700 group-last:bg-transparent mt-1"></div>
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
            <div>
                <h4 className="font-semibold text-slate-100">{activity.name}</h4>
                <p className="text-sm text-slate-400">{activity.description}</p>
            </div>
            {activity.maps_link && (
                <a 
                    href={activity.maps_link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-sky-600 text-white px-3 py-1.5 rounded-full hover:bg-sky-500 transition-colors whitespace-nowrap opacity-0 group-hover:opacity-100"
                    aria-label={`View location for ${activity.name}`}
                >
                    Map
                </a>
            )}
        </div>
      </div>
    </div>
);

const DayCard: React.FC<{ dayData: ItineraryDay }> = ({ dayData }) => {
  const [isOpen, setIsOpen] = useState(true);

  const renderTimeline = (title: string, activities: Activity[]) => {
    if (!Array.isArray(activities) || activities.length === 0) return null;
    return (
        <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">{title}</h3>
            <div className="space-y-2">
                {activities.map((activity, index) => <ActivityItem key={index} activity={activity} />)}
            </div>
        </div>
    );
  };

  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-900/70 backdrop-blur-sm shadow-2xl shadow-slate-950/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full block group"
        aria-expanded={isOpen}
        aria-controls={`day-${dayData.day}-content`}
      >
        <div className="relative overflow-hidden h-56">
            {dayData.imageUrl === undefined && (
              <div className="w-full h-full bg-slate-800 animate-pulse flex items-center justify-center"><div className="text-slate-500 text-sm">Generating Image...</div></div>
            )}
            {dayData.imageUrl === '' && (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center"><p className="text-slate-400 text-sm">Image failed to load</p></div>
            )}
            {dayData.imageUrl && (
              <img src={dayData.imageUrl} alt={dayData.image_prompt} className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-2xl font-bold text-white text-shadow-lg">Day {dayData.day}: {dayData.title}</h3>
                <div className="flex justify-between items-center text-sm mt-1">
                    <div className="font-semibold">{dayData.weather.summary}</div>
                    <div className="font-mono"><span className="text-red-400">{dayData.weather.high_temp}°C</span> / <span className="text-sky-400">{dayData.weather.low_temp}°C</span></div>
                </div>
            </div>
        </div>
      </button>
      
      <div id={`day-${dayData.day}-content`} className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px]' : 'max-h-0'} overflow-hidden`}>
        <div className="p-6 space-y-6">
            <div className="space-y-6">
                {renderTimeline('🌅 Morning', dayData.morning)}
                {renderTimeline('☀️ Afternoon', dayData.afternoon)}
                {renderTimeline('🌙 Evening', dayData.evening)}
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
                {dayData.vibe_tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">{tag}</span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

export default function ItineraryResult({ data }: { data: ItineraryResultData }) {
  const [showJson, setShowJson] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState(data.summary);


  const formatTextExport = (): string => {
    let text = "Your AI-Generated Travel Itinerary\n===================================\n\n";
    text += `Trip Summary:\n${summaryText}\n\n-----------------------------------\n\n`;

    if (data.accommodations && data.accommodations.length > 0) {
        text += "Accommodation Options:\n";
        data.accommodations.forEach(acc => {
            text += `- ${acc.name} (${acc.type}): ${acc.description}\n`;
        });
        text += "\n-----------------------------------\n\n";
    }

    data.itinerary.forEach(day => {
        text += `Day ${day.day}: ${day.title}\n`;
        text += `Weather: ${day.weather.summary} (${day.weather.low_temp}°C / ${day.weather.high_temp}°C)\n\n`;
        
        const formatActivities = (period: string, activities: Activity[]) => {
            if (Array.isArray(activities) && activities.length > 0) {
                text += `${period}:\n`;
                activities.forEach(act => {
                    text += `- ${act.time} - ${act.name}: ${act.description}\n`;
                });
                text += "\n";
            }
        };

        formatActivities("Morning", day.morning);
        formatActivities("Afternoon", day.afternoon);
        formatActivities("Evening", day.evening);
        
        text += `Vibe: ${day.vibe_tags.join(' · ')}\n`;
        text += "-----------------------------------\n\n";
    });
    return text;
  }

  const handleDownload = () => {
    const text = formatTextExport();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'itinerary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mt-8 animate-fade-in space-y-6">
        <div className="flex justify-between items-center">
             <h2 className="text-3xl font-bold text-slate-100">Your Custom Itinerary</h2>
             <div className="flex gap-2">
                 <button onClick={() => setShowJson(!showJson)} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-md transition-colors">
                    {showJson ? 'Hide JSON' : 'View JSON'}
                </button>
                <button onClick={handleDownload} className="text-xs bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-md transition-colors">
                    Export Text
                </button>
             </div>
        </div>

        <div className="p-5 rounded-lg bg-slate-800/50 border border-slate-700 relative group">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Trip Summary</h3>
            {isEditingSummary ? (
                <textarea
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-600 rounded-md p-2 text-sm text-slate-300 focus:ring-2 focus:ring-cyan-500"
                    rows={4}
                    aria-label="Edit trip summary"
                />
            ) : (
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{summaryText}</p>
            )}
            <div className="mt-3 flex gap-2 items-center">
                {isEditingSummary ? (
                    <>
                        <button onClick={() => setIsEditingSummary(false)} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-md transition-colors">Save Changes</button>
                        <button onClick={() => { setSummaryText(data.summary); setIsEditingSummary(false); }} className="text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 px-3 py-1.5 rounded-md transition-colors">Cancel</button>
                    </>
                ) : (
                     <button onClick={() => setIsEditingSummary(true)} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-md transition-colors absolute top-4 right-4 opacity-0 group-hover:opacity-100 focus:opacity-100">
                        Edit Summary
                    </button>
                )}
            </div>
        </div>

        {data.accommodations && data.accommodations.length > 0 && (
            <div className="p-5 rounded-lg bg-slate-800/50 border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">🏨 Accommodation Options</h3>
                <div className="space-y-3">
                    {data.accommodations.map((acc, index) => (
                        <div key={index} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <p className="font-semibold text-slate-200">{acc.name}</p> 
                                    <span className="text-xs font-medium bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap">{acc.type}</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-1">{acc.description}</p>
                            </div>
                            {acc.maps_link && (
                                <a 
                                    href={acc.maps_link}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="mt-2 sm:mt-0 sm:ml-4 text-xs bg-sky-600 text-white px-3 py-1.5 rounded-full hover:bg-sky-500 transition-colors whitespace-nowrap"
                                    aria-label={`View location for ${acc.name}`}
                                >
                                    Map
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
      
        <div className="space-y-6">
            {data.itinerary.map((dayData) => <DayCard key={dayData.day} dayData={dayData} />)}
        </div>
        
        {showJson && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Itinerary JSON Data</h3>
                <pre className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 max-h-96 overflow-auto">
                    <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
            </div>
        )}
    </section>
  );
}
