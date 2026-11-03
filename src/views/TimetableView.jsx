import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { communicationService } from '../services/communicationService';

export default function TimetableView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await communicationService.getEvents({ page: 0, size: 20 });
        const list = res.content || (Array.isArray(res) ? res : []);
        setEvents(list);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Planning & Calendrier
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Emploi du Temps & Échéances
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Consultez les événements officiels et créneaux académiques
          </p>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
            alt="Emploi du temps"
            className="w-full h-full object-cover rounded-l-full"
          />
        </div>
      </div>

      <div className="academy-card p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F4EDE2]">
          <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
            Événements et créneaux planifiés dans MySQL
          </h2>
          <span className="text-xs font-semibold text-[#78716C] bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#EFECE6]">
            {events.length} créneaux
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des événements...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716C]">
            Aucun événement ou cours planifié dans la base de données.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] flex flex-col justify-between space-y-3 hover:border-[#C5A880] transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#16222F]">{evt.title}</h3>
                    <span className="text-[10px] font-bold uppercase bg-[#16222F] text-white px-2.5 py-0.5 rounded-full shrink-0">
                      Événement
                    </span>
                  </div>
                  {evt.description && (
                    <p className="text-xs text-[#64748B] mt-2 leading-relaxed">{evt.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between text-xs text-[#78716C]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>
                      {evt.startAt ? new Date(evt.startAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Horaire à confirmer'}
                    </span>
                  </div>
                  {evt.location && (
                    <div className="flex items-center gap-1.5 font-medium text-[#16222F]">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{evt.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
