import React from 'react';
import { Clock, User, MessageSquare, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const HistoryTimeline = ({ history = [] }) => {
    if (!history || history.length === 0) {
        return (
            <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                <Clock size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin registros de actividad</p>
            </div>
        );
    }

    // Sort history by timestamp descending (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="space-y-6 relative before:absolute before:left-[1.25rem] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
            {sortedHistory.map((item, idx) => (
                <div key={idx} className="relative pl-12 group">
                    {/* Circle Indicator */}
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all z-10 bg-white">
                        <Clock size={16} />
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-black text-sm text-slate-800 uppercase tracking-tight">{item.status}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <User size={10} /> {item.changedBy || 'Sistema'}
                                    </div>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {format(new Date(item.timestamp), "dd MMM yyyy HH:mm", { locale: es })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {item.comments && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex gap-3 items-start">
                                <MessageSquare size={14} className="text-slate-300 mt-0.5 shrink-0" />
                                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                                    "{item.comments}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HistoryTimeline;
