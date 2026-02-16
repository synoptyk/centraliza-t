import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Loader2, Calendar as CalendarIcon, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import InterviewCard, { INTERVIEW_STATUS_COLORS } from './InterviewCard';
import InterviewActionModal from './InterviewActionModal';

// Configure localizer for Spanish
const locales = { es };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
});

// Custom styles for calendar events based on status
const eventStyleGetter = (event) => {
    const statusConfig = INTERVIEW_STATUS_COLORS[event.status] || INTERVIEW_STATUS_COLORS['Pendiente Agendar'];

    return {
        style: {
            backgroundColor: statusConfig.bg.replace('bg-', '').replace('-100', ''),
            borderLeft: `4px solid ${statusConfig.border.replace('border-', '').replace('-300', '')}`,
            color: statusConfig.text.replace('text-', '').replace('-700', ''),
            borderRadius: '8px',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '700',
            border: 'none'
        }
    };
};

const InterviewCalendar = ({ onRefresh }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dayEvents, setDayEvents] = useState([]);
    const [actionModal, setActionModal] = useState({ show: false, action: null });

    useEffect(() => {
        fetchCalendarEvents();
    }, []);

    const fetchCalendarEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applicants/interviews/calendar');
            const formattedEvents = res.data.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end)
            }));
            setEvents(formattedEvents);
        } catch (error) {
            toast.error('Error al cargar eventos del calendario');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
    };

    const handleSelectSlot = ({ start }) => {
        // Filter events for selected day
        const dayStart = new Date(start);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(start);
        dayEnd.setHours(23, 59, 59, 999);

        const filtered = events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate >= dayStart && eventDate <= dayEnd;
        });

        setSelectedDate(start);
        setDayEvents(filtered);
    };

    const handleAction = (action) => {
        setActionModal({ show: true, action });
    };

    const handleActionSuccess = () => {
        setActionModal({ show: false, action: null });
        setSelectedEvent(null);
        setSelectedDate(null);
        setDayEvents([]);
        fetchCalendarEvents();
        onRefresh();
    };

    const messages = {
        allDay: 'Todo el día',
        previous: 'Anterior',
        next: 'Siguiente',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
        date: 'Fecha',
        time: 'Hora',
        event: 'Entrevista',
        noEventsInRange: 'No hay entrevistas programadas en este rango',
        showMore: (total) => `+ Ver más (${total})`
    };

    return (
        <div className="space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-indigo-500" size={48} />
                    </div>
                ) : (
                    <div style={{ height: '700px' }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            culture="es"
                            messages={messages}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            selectable
                            eventPropGetter={eventStyleGetter}
                            views={['month', 'week', 'day', 'agenda']}
                            defaultView="month"
                            popup
                            style={{ height: '100%' }}
                        />
                    </div>
                )}
            </div>

            {/* Daily Agenda Panel */}
            {selectedDate && dayEvents.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-500 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <CalendarIcon size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                    Agenda del Día
                                </h3>
                                <p className="text-sm text-slate-600 font-semibold">
                                    {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedDate(null);
                                setDayEvents([]);
                            }}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold text-sm"
                        >
                            Cerrar
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayEvents.map(event => (
                            <InterviewCard
                                key={event.id}
                                applicant={event.applicant}
                                onClick={() => handleSelectEvent(event)}
                                compact
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Selected Event Detail */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center justify-center text-white font-bold"
                            >
                                ✕
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-3xl">
                                    {selectedEvent.applicant.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                                        {selectedEvent.applicant.fullName}
                                    </h2>
                                    <p className="text-white/90 text-lg font-semibold mt-1">
                                        {selectedEvent.applicant.position}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Interview Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Detalles de la Entrevista</h3>

                                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                        <CalendarIcon size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fecha y Hora</p>
                                            <p className="text-sm text-slate-900 font-black mt-1">
                                                {format(selectedEvent.start, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                            </p>
                                            <p className="text-sm text-slate-700 font-semibold">
                                                {format(selectedEvent.start, 'HH:mm', { locale: es })}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedEvent.location && (
                                        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                            <MapPin size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ubicación</p>
                                                <p className="text-sm text-slate-900 font-black mt-1">{selectedEvent.location}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                        <div className={`w-3 h-3 rounded-full ${INTERVIEW_STATUS_COLORS[selectedEvent.status]?.bg} border-2 ${INTERVIEW_STATUS_COLORS[selectedEvent.status]?.border} flex-shrink-0 mt-1.5`} />
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estado</p>
                                            <p className="text-sm text-slate-900 font-black mt-1">{selectedEvent.status}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Información del Candidato</h3>

                                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">RUT</p>
                                            <p className="text-sm text-slate-900 font-black mt-1">{selectedEvent.applicant.rut}</p>
                                        </div>
                                        {selectedEvent.applicant.email && (
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email</p>
                                                <p className="text-sm text-slate-900 font-semibold mt-1">{selectedEvent.applicant.email}</p>
                                            </div>
                                        )}
                                        {selectedEvent.applicant.phone && (
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Teléfono</p>
                                                <p className="text-sm text-slate-900 font-semibold mt-1">{selectedEvent.applicant.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Acciones Rápidas</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {selectedEvent.status !== 'Confirmada' &&
                                        selectedEvent.status !== 'Realizada' &&
                                        selectedEvent.status !== 'Cancelada' &&
                                        selectedEvent.status !== 'Suspendida' && (
                                            <button
                                                onClick={() => handleAction('confirm')}
                                                className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
                                            >
                                                Confirmar
                                            </button>
                                        )}
                                    {selectedEvent.status !== 'Cancelada' &&
                                        selectedEvent.status !== 'Suspendida' &&
                                        selectedEvent.status !== 'Realizada' && (
                                            <button
                                                onClick={() => handleAction('reschedule')}
                                                className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
                                            >
                                                Reprogramar
                                            </button>
                                        )}
                                    {selectedEvent.status !== 'Cancelada' &&
                                        selectedEvent.status !== 'Realizada' && (
                                            <>
                                                <button
                                                    onClick={() => handleAction('cancel')}
                                                    className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => handleAction('suspend')}
                                                    className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-bold text-sm"
                                                >
                                                    Suspender
                                                </button>
                                            </>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {actionModal.show && selectedEvent && (
                <InterviewActionModal
                    applicant={selectedEvent.applicant}
                    action={actionModal.action}
                    onClose={() => setActionModal({ show: false, action: null })}
                    onSuccess={handleActionSuccess}
                />
            )}
        </div>
    );
};

export default InterviewCalendar;
