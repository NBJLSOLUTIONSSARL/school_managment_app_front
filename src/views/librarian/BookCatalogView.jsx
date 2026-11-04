import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Boxes,
} from 'lucide-react';
import { libraryService } from '../../services/libraryService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

export default function BookCatalogView() {
  const { hasRole } = useAuth();
  const canDelete = hasRole('ROLE_ADMIN');

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    category: '',
    description: '',
    totalCopies: 1,
    coverUrl: '',
  });

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await libraryService.getBooks({
        query: search || undefined,
        category: selectedCategory || undefined,
        page,
        size: 15,
      });
      setBooks(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Impossible de charger le catalogue de livres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBooks();
  };

  const handleOpenCreate = () => {
    setFormData({
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      publicationYear: new Date().getFullYear(),
      category: 'Littérature',
      description: '',
      totalCopies: 1,
      coverUrl: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (book) => {
    setBookToEdit(book);
    setFormData({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || new Date().getFullYear(),
      category: book.category || '',
      description: book.description || '',
      totalCopies: book.totalCopies,
      coverUrl: book.coverUrl || '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await libraryService.createBook({
        ...formData,
        totalCopies: Number(formData.totalCopies),
        publicationYear: Number(formData.publicationYear),
      });
      setIsCreateModalOpen(false);
      fetchBooks();
    } catch (err) {
      alert(err.message || 'Impossible d\'ajouter ce livre.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!bookToEdit) return;
    setActionLoading(true);
    try {
      await libraryService.updateBook(bookToEdit.id, {
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher,
        publicationYear: Number(formData.publicationYear),
        category: formData.category,
        description: formData.description,
        totalCopies: Number(formData.totalCopies),
        coverUrl: formData.coverUrl,
      });
      setIsEditModalOpen(false);
      setBookToEdit(null);
      fetchBooks();
    } catch (err) {
      alert(err.message || 'Impossible de mettre à jour ce livre.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!bookToDelete) return;
    setActionLoading(true);
    try {
      await libraryService.deleteBook(bookToDelete.id);
      setBookToDelete(null);
      fetchBooks();
    } catch (err) {
      alert(err.message || 'Impossible de supprimer ce livre.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-title font-bold text-[#16222F]">
              Catalogue des livres
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              Gestion de la collection d'ouvrages, des références et des disponibilités.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBooks}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un livre</span>
          </button>
        </div>
      </div>

      <div className="academy-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, auteur, ISBN..."
            className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl pl-9 pr-4 py-2 text-xs text-[#16222F] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#78716C] shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-medium text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          >
            <option value="">Toutes les catégories</option>
            <option value="Littérature">Littérature</option>
            <option value="Sciences">Sciences</option>
            <option value="Histoire">Histoire</option>
            <option value="Informatique">Informatique</option>
            <option value="Jeunesse & Philosophie">Jeunesse & Philosophie</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des ouvrages...</span>
          </div>
        ) : books.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716C]">
            Aucun livre trouvé dans le catalogue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#EFECE6] text-[#78716C] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Livre</th>
                  <th className="py-3.5 px-4">Auteur & Éditeur</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">ISBN</th>
                  <th className="py-3.5 px-4 text-center">Exemplaires</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]">
                {books.map((book) => {
                  const isAvailable = book.availableCopies > 0;
                  return (
                    <tr key={book.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100"}
                          alt={book.title}
                          className="w-9 h-12 rounded object-cover border border-[#EFECE6] shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100";
                          }}
                        />
                        <div>
                          <span className="font-semibold text-[#16222F] block">
                            {book.title}
                          </span>
                          <span className="text-[10px] text-[#78716C]">
                            Publié en {book.publicationYear || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#16222F] block">{book.author}</span>
                        <span className="text-[10px] text-[#78716C]">{book.publisher || '—'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-slate-200">
                          {book.category || 'Général'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#78716C]">
                        {book.isbn}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <Boxes className="w-3 h-3" />
                          <span>{book.availableCopies} / {book.totalCopies} dispo</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(book)}
                            title="Modifier les informations"
                            className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#78716C] hover:text-[#16222F] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => setBookToDelete(book)}
                              title="Supprimer (Super Admin)"
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#EFECE6] flex items-center justify-between text-xs text-[#78716C]">
            <span>Page {page + 1} sur {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#EFECE6] disabled:opacity-40 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Précédent
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#EFECE6] disabled:opacity-40 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Ajouter un livre au catalogue"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">ISBN :</label>
              <input
                type="text"
                required
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="Ex: 978-2070360024"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Titre de l'ouvrage :</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre complet..."
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Auteur :</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Nom de l'auteur..."
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Éditeur :</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="Ex: Gallimard, Dunod..."
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Année :</label>
              <input
                type="number"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Catégorie :</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Littérature, Sciences..."
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Exemplaires :</label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#16222F] font-semibold mb-1">URL de la couverture :</label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-[#16222F] font-semibold mb-1">Résumé / Description :</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Courte description de l'ouvrage..."
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Ajout...' : 'Ajouter au catalogue'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Modifier ${bookToEdit?.title}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#16222F] font-semibold mb-1">Titre de l'ouvrage :</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Auteur :</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Éditeur :</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Année :</label>
              <input
                type="number"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Catégorie :</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Total copies :</label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#16222F] font-semibold mb-1">URL de la couverture :</label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-[#16222F] font-semibold mb-1">Description :</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Mise à jour...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(bookToDelete)}
        onClose={() => setBookToDelete(null)}
        title="Supprimer un livre (Super Admin)"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-[#78716C]">
            Êtes-vous certain de vouloir supprimer l'ouvrage{' '}
            <strong className="text-[#16222F]">{bookToDelete?.title}</strong> ?
            Cette action supprimera également la fiche du fonds documentaire.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setBookToDelete(null)}
              className="px-4 py-2 rounded-xl border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              disabled={actionLoading}
              onClick={handleDeleteSubmit}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Suppression...' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
