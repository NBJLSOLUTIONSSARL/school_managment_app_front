import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { meetingsAndTemplatesService } from '../api/meetingsAndTemplatesService'
import { useToast } from '@/hooks/useToast'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Users,
} from 'lucide-react'

export function ParentTeacherMeetingsView({
  teacherId = 1,
  guardianId = 1,
  studentId = 1,
  isTeacher = false,
}) {
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)

  const [slotForm, setSlotForm] = useState({
    startTime: '',
    endTime: '',
    roomOrLink: 'Salle des professeurs',
    maxBookings: 1,
  })

  const [bookingForm, setBookingForm] = useState({
    reason: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    const [slotsRes, bookingsRes] = await Promise.all([
      meetingsAndTemplatesService.getTeacherSlots(teacherId, false),
      meetingsAndTemplatesService.getGuardianBookings(guardianId),
    ])

    if (slotsRes.success) setSlots(slotsRes.data)
    if (bookingsRes.success) setBookings(bookingsRes.data)
    setLoading(false)
  }, [teacherId, guardianId])

  useEffect(() => {
    const task = Promise.resolve().then(() => loadData())
    return () => {
      void task
    }
  }, [loadData])

  const handleCreateSlot = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await meetingsAndTemplatesService.createSlot({
      teacherId,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      roomOrLink: slotForm.roomOrLink,
      maxBookings: Number(slotForm.maxBookings),
    })

    if (res.success) {
      toast?.success?.('Créneau de disponibilité créé')
      setIsSlotModalOpen(false)
      loadData()
    } else {
      toast?.error?.(res.error?.message || 'Erreur lors de la création')
    }
    setSubmitting(false)
  }

  const handleBookSlot = async (e) => {
    e.preventDefault()
    if (!selectedSlot) return

    setSubmitting(true)
    const res = await meetingsAndTemplatesService.bookMeeting({
      meetingSlotId: selectedSlot.id,
      guardianId,
      studentId,
      reason: bookingForm.reason,
    })

    if (res.success) {
      toast?.success?.('Rendez-vous réservé avec succès')
      setIsBookingModalOpen(false)
      setSelectedSlot(null)
      loadData()
    } else {
      toast?.error?.(res.error?.message || 'Ce créneau est indisponible')
    }
    setSubmitting(false)
  }

  const handleStatusChange = async (bookingId, status) => {
    const res = await meetingsAndTemplatesService.updateBookingStatus(bookingId, {
      status,
      notes: status === 'CONFIRMED' ? 'Rendez-vous confirmé.' : 'Rendez-vous annulé.',
    })

    if (res.success) {
      toast?.success?.(`Rendez-vous ${status === 'CONFIRMED' ? 'confirmé' : 'mis à jour'}`)
      loadData()
    } else {
      toast?.error?.(res.error?.message || 'Erreur lors de la mise à jour')
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            Rendez-vous Parents – Professeurs
          </h2>
          <p className="text-2xs text-neutral-500 mt-0.5">
            Planification des entretiens individuels pédagogiques et suivi des réservations.
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Ouvrir un créneau
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        {/* Available slots */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            Créneaux proposés par l'enseignant
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Chargement des créneaux...
            </div>
          ) : slots.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded">
              Aucun créneau de rendez-vous disponible actuellement.
            </div>
          ) : (
            <div className="space-y-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 rounded border border-neutral-200 dark:border-neutral-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{slot.startTime?.replace('T', ' ')}</span>
                      <span className="text-neutral-400">→</span>
                      <span>{slot.endTime?.split('T')[1]}</span>
                    </div>
                    {slot.roomOrLink && (
                      <p className="text-2xs text-neutral-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        {slot.roomOrLink}
                      </p>
                    )}
                  </div>

                  <div>
                    {slot.available ? (
                      !isTeacher && (
                        <button
                          onClick={() => {
                            setSelectedSlot(slot)
                            setIsBookingModalOpen(true)
                          }}
                          className="px-2.5 py-1 rounded text-2xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 transition"
                        >
                          Réserver
                        </button>
                      )
                    ) : (
                      <span className="text-2xs font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                        Complet
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookings */}
        <div>
          <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" />
            Mes rendez-vous planifiés
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Chargement des rendez-vous...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded">
              Aucun rendez-vous réservé.
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {b.teacherName || 'Enseignant'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-2xs font-medium ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : b.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {b.status === 'CONFIRMED'
                        ? 'Confirmé'
                        : b.status === 'CANCELLED'
                        ? 'Annulé'
                        : 'En attente'}
                    </span>
                  </div>

                  <p className="text-2xs text-neutral-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    {b.slotStartTime?.replace('T', ' ')} • {b.roomOrLink || 'Sur place'}
                  </p>

                  {b.reason && (
                    <p className="text-2xs text-neutral-600 dark:text-neutral-400 mt-1 italic">
                      Motif : "{b.reason}"
                    </p>
                  )}

                  {isTeacher && b.status === 'PENDING' && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                        className="px-2 py-0.5 rounded text-2xs font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                        className="px-2 py-0.5 rounded text-2xs font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Slot */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-sm w-full p-4 shadow-lg text-xs">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Nouveau créneau de disponibilité
            </h4>
            <form onSubmit={handleCreateSlot} className="space-y-2.5">
              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Début *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Fin *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Salle ou Lien visio
                </label>
                <input
                  type="text"
                  placeholder="ex: Bureau B12 ou lien Google Meet"
                  value={slotForm.roomOrLink}
                  onChange={(e) => setSlotForm({ ...slotForm, roomOrLink: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 text-2xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-2xs font-medium"
                >
                  {submitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Book Slot */}
      {isBookingModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-sm w-full p-4 shadow-lg text-xs">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Confirmer la réservation
            </h4>
            <p className="text-2xs text-neutral-500 mb-3">
              Créneau du {selectedSlot.startTime?.replace('T', ' ')} avec l'enseignant.
            </p>
            <form onSubmit={handleBookSlot} className="space-y-2.5">
              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Motif de l'échange *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Bilan pédagogique, questions sur les devoirs..."
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsBookingModalOpen(false)
                    setSelectedSlot(null)
                  }}
                  className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 text-2xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-2xs font-medium"
                >
                  {submitting ? 'Réservation...' : 'Confirmer le rendez-vous'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

ParentTeacherMeetingsView.propTypes = {
  teacherId: PropTypes.number,
  guardianId: PropTypes.number,
  studentId: PropTypes.number,
  isTeacher: PropTypes.bool,
}
