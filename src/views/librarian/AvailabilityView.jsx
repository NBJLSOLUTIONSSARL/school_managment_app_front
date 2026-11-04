import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { libraryService } from '../../services/libraryService';

export default function AvailabilityView() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState('ALL');

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await libraryService.getBooks({ page: 0, size: 100 });
      setBooks(res.content || []);
    } catch (err) {
      setError(err.message || 'Impossible de vérifier la disponibilité des exemplaires.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase();
    const matchQuery =
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q);

    if (!matchQuery) return false;

    if (filterStock === 'AVAILABLE') return b.availableCopies > 0;
    if (filterStock === 'UNAVAILABLE') return b.availableCopies <= 0;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-title font-bold text-[#16222F]">
              Disponibilité des exemplaires
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              État instantané des stocks, des volumes en rayon et des tirages épuisés.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAvailability}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualiser</span>
        </button>
      </div>

      <div className="academy-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, auteur ou ISBN..."
            className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl pl-9 pr-4 py-2 text-xs text-[#16222F] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStock('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterStock === 'ALL'
                ? 'bg-[#16222F] text-[#DFC2A0]'
                : 'border border-[#EFECE6] text-[#78716C] hover:bg-[#FAF7F2]'
            }`}
          >
            Tous ({books.length})
          </button>
          <button
            onClick={() => setFilterStock('AVAILABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterStock === 'AVAILABLE'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'border border-[#EFECE6] text-[#78716C] hover:bg-[#FAF7F2]'
            }`}
          >
            En rayon ({books.filter(b => b.availableCopies > 0).length})
          </button>
          <button
            onClick={() => setFilterStock('UNAVAILABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterStock === 'UNAVAILABLE'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'border border-[#EFECE6] text-[#78716C] hover:bg-[#FAF7F2]'
            }`}
          >
            Épuisés ({books.filter(b => b.availableCopies <= 0).length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
          <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
          <span className="text-sm font-medium">Vérification des stocks...</span>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="academy-card py-16 text-center text-xs text-[#78716C]">
          Aucun titre ne correspond à ces critères.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            const pctAvailable = Math.round((book.availableCopies / (book.totalCopies || 1)) * 100);

            return (
              <div key={book.id} className="academy-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100"}
                      alt={book.title}
                      className="w-12 h-16 rounded object-cover border border-[#EFECE6] shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-sm text-[#16222F] block truncate">
                        {book.title}
                      </span>
                      <span className="text-xs text-[#78716C] block truncate">{book.author}</span>
                      <span className="text-[10px] text-[#A8A29E] font-mono block mt-1">
                        ISBN: {book.isbn}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EFECE6] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#78716C]">
                      <span>Exemplaires en rayon :</span>
                      <span className="font-bold text-[#16222F]">
                        {book.availableCopies} sur {book.totalCopies}
                      </span>
                    </div>

                    <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pctAvailable > 50
                            ? 'bg-emerald-500'
                            : pctAvailable > 0
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${pctAvailable}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Disponible au prêt</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Tous prêtés</span>
                      </>
                    )}
                  </span>

                  <span className="text-[10px] text-[#78716C]">
                    Prêtés : {Math.max(0, book.totalCopies - book.availableCopies)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
