import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { homeworkWave7Service } from '../api/homeworkWave7Service'
import { useToast } from '@/hooks/useToast'
import {
  BookOpen,
  Layers,
  FileText,
  Video,
  Link as LinkIcon,
  Plus,
  Share2,
  Clock,
  Download,
} from 'lucide-react'

export function CourseSpaceView({ courseId, isTeacher = true }) {
  const [course, setCourse] = useState(null)
  const [outlines, setOutlines] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('syllabus') // 'syllabus' | 'resources'
  const [isOutlineModalOpen, setIsOutlineModalOpen] = useState(false)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  const [outlineForm, setOutlineForm] = useState({
    chapterNumber: 1,
    title: '',
    objectives: '',
    estimatedHours: 4,
  })
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    resourceType: 'PDF',
    fileUrl: '',
    sharedWithTeachers: true,
  })
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const loadData = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    const [cRes, oRes, rRes] = await Promise.all([
      homeworkWave7Service.getCourseById(courseId),
      homeworkWave7Service.getCourseOutlines(courseId),
      homeworkWave7Service.getResourcesByLevelAndSubject(1, 1),
    ])

    if (cRes.success) setCourse(cRes.data)
    if (oRes.success) setOutlines(oRes.data)
    if (rRes.success) setResources(rRes.data)
    setLoading(false)
  }, [courseId])

  useEffect(() => {
    const task = Promise.resolve().then(() => loadData())
    return () => {
      void task
    }
  }, [loadData])

  const handleAddOutline = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await homeworkWave7Service.addCourseOutline(courseId, {
      ...outlineForm,
      chapterNumber: Number(outlineForm.chapterNumber),
      estimatedHours: Number(outlineForm.estimatedHours),
    })
    if (res.success) {
      toast?.success?.('Chapitre ajouté au syllabus')
      setIsOutlineModalOpen(false)
      setOutlineForm({
        chapterNumber: outlines.length + 2,
        title: '',
        objectives: '',
        estimatedHours: 4,
      })
      const oRes = await homeworkWave7Service.getCourseOutlines(courseId)
      if (oRes.success) setOutlines(oRes.data)
    } else {
      toast?.error?.(res.error?.message || "Erreur lors de l'ajout")
    }
    setSaving(false)
  }

  const handleAddResource = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await homeworkWave7Service.addCourseResource({
      courseId,
      title: resourceForm.title,
      description: resourceForm.description,
      resourceType: resourceForm.resourceType,
      fileUrl: resourceForm.fileUrl,
      gradeLevelId: course?.gradeLevelId || 1,
      subjectId: course?.subjectId || 1,
      uploadedByTeacherId: course?.teacherId || 1,
      sharedWithTeachers: resourceForm.sharedWithTeachers,
    })
    if (res.success) {
      toast?.success?.('Ressource pédagogique ajoutée')
      setIsResourceModalOpen(false)
      setResourceForm({
        title: '',
        description: '',
        resourceType: 'PDF',
        fileUrl: '',
        sharedWithTeachers: true,
      })
      const rRes = await homeworkWave7Service.getResourcesByLevelAndSubject(
        course?.gradeLevelId || 1,
        course?.subjectId || 1
      )
      if (rRes.success) setResources(rRes.data)
    } else {
      toast?.error?.(res.error?.message || "Erreur lors de l'ajout")
    }
    setSaving(false)
  }

  const getResourceIcon = (type) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-4 h-4 text-rose-500" />
      case 'LINK':
        return <LinkIcon className="w-4 h-4 text-blue-500" />
      case 'PDF':
      case 'DOCUMENT':
      default:
        return <FileText className="w-4 h-4 text-amber-500" />
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
      {/* Course Header */}
      <div className="flex items-start justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {course?.title || 'Espace Cours & Syllabus'}
            </h2>
            {course?.code && (
              <span className="text-2xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {course.code}
              </span>
            )}
          </div>
          {course?.description && (
            <p className="text-2xs text-neutral-500 mt-1 max-w-xl">
              {course.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-2xs text-neutral-400">
            <span>Niveau : {course?.gradeLevelName || 'Niveau'}</span>
            <span>•</span>
            <span>Matière : {course?.subjectName || 'Matière'}</span>
            <span>•</span>
            <span>Enseignant : {course?.teacherName || 'Enseignant'}</span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded text-2xs">
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`px-3 py-1 rounded font-medium transition ${
              activeTab === 'syllabus'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Syllabus ({outlines.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3 py-1 rounded font-medium transition ${
              activeTab === 'resources'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Ressources ({resources.length})
          </button>
        </div>
      </div>

      {/* Tab: Syllabus Outlines */}
      {activeTab === 'syllabus' && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              Progression Pédagogique & Chapitres
            </h3>
            {isTeacher && (
              <button
                onClick={() => setIsOutlineModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-2xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
              >
                <Plus className="w-3 h-3" /> Nouveau chapitre
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Chargement du syllabus...
            </div>
          ) : outlines.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Aucun chapitre défini pour ce cours.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {outlines.map((chapter) => (
                <div key={chapter.id || chapter.chapterNumber} className="py-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-2xs text-neutral-700 dark:text-neutral-300">
                        {chapter.chapterNumber}
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {chapter.title}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-2xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/60 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {chapter.estimatedHours}h estimées
                    </span>
                  </div>
                  {chapter.objectives && (
                    <p className="text-2xs text-neutral-600 dark:text-neutral-400 mt-1 pl-7">
                      Objectifs : {chapter.objectives}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Resources Library */}
      {activeTab === 'resources' && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              Documents & Fiches Pédagogiques
            </h3>
            {isTeacher && (
              <button
                onClick={() => setIsResourceModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-2xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
              >
                <Plus className="w-3 h-3" /> Déposer une ressource
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Chargement des ressources...
            </div>
          ) : resources.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Aucune ressource disponible pour cette matière.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resources.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition text-xs flex items-start gap-3"
                >
                  <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-800 shrink-0">
                    {getResourceIcon(item.resourceType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.title}
                      </span>
                      {item.sharedWithTeachers && (
                        <span
                          title="Partagé avec l'équipe pédagogique"
                          className="shrink-0 p-0.5 text-emerald-600 dark:text-emerald-400"
                        >
                          <Share2 className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-2xs text-neutral-500 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 text-2xs text-neutral-400">
                      <span>{item.uploadedByTeacherName || 'Enseignant'}</span>
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300 hover:underline"
                      >
                        <Download className="w-2.5 h-2.5" /> Ouvrir
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: New Chapter */}
      {isOutlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-sm w-full p-4 shadow-lg text-xs">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Ajouter un Chapitre au Syllabus
            </h4>
            <form onSubmit={handleAddOutline} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                    Numéro *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={outlineForm.chapterNumber}
                    onChange={(e) => setOutlineForm({ ...outlineForm, chapterNumber: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                    Heures estimées *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={outlineForm.estimatedHours}
                    onChange={(e) => setOutlineForm({ ...outlineForm, estimatedHours: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Titre du chapitre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Trigonométrie dans le triangle rectangle"
                  value={outlineForm.title}
                  onChange={(e) => setOutlineForm({ ...outlineForm, title: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                />
              </div>
              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Objectifs pédagogiques
                </label>
                <textarea
                  rows={2}
                  placeholder="Notions abordées, compétences requises..."
                  value={outlineForm.objectives}
                  onChange={(e) => setOutlineForm({ ...outlineForm, objectives: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsOutlineModalOpen(false)}
                  className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 text-2xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-2xs font-medium"
                >
                  {saving ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Resource */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-sm w-full p-4 shadow-lg text-xs">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Déposer une Ressource Pédagogique
            </h4>
            <form onSubmit={handleAddResource} className="space-y-2.5">
              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Titre de la ressource *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Fiche d'exercices corrigés"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                    Type *
                  </label>
                  <select
                    value={resourceForm.resourceType}
                    onChange={(e) => setResourceForm({ ...resourceForm, resourceType: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  >
                    <option value="PDF">Document PDF</option>
                    <option value="DOCUMENT">Document Texte</option>
                    <option value="VIDEO">Vidéo / Animation</option>
                    <option value="LINK">Lien Web</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                    URL ou Fichier *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/files/... ou https://..."
                    value={resourceForm.fileUrl}
                    onChange={(e) => setResourceForm({ ...resourceForm, fileUrl: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-2xs text-neutral-600 dark:text-neutral-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Instructions d'utilisation pour les élèves..."
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  className="w-full px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={resourceForm.sharedWithTeachers}
                  onChange={(e) => setResourceForm({ ...resourceForm, sharedWithTeachers: e.target.checked })}
                  className="rounded border-neutral-300"
                />
                <span className="text-2xs text-neutral-600 dark:text-neutral-400">
                  Partager dans la bibliothèque d'équipe
                </span>
              </label>
              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsResourceModalOpen(false)}
                  className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-700 text-2xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-2xs font-medium"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

CourseSpaceView.propTypes = {
  courseId: PropTypes.number,
  isTeacher: PropTypes.bool,
}
