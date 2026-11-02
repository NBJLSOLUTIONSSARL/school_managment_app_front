import React, { useState, useEffect } from 'react';
import { School, Building2, Users, AlertCircle, Loader2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { departmentService } from '../services/departmentService';
import { teacherService } from '../services/teacherService';

export default function ClassesView() {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [deptsRes, teachersRes] = await Promise.all([
          departmentService.getDepartments(),
          teacherService.getTeachers()
        ]);
        const dList = Array.isArray(deptsRes) ? deptsRes : (deptsRes?.data || []);
        const tList = Array.isArray(teachersRes) ? teachersRes : (teachersRes?.data || []);
        setDepartments(dList);
        setTeachers(tList);
      } catch (err) {
        setError(err.message || 'Impossible de charger la structure pédagogique.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Structure Académique
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Structure & Pôles Pédagogiques
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Organisation des départements et des enseignants rattachés
          </p>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
            alt="Campus"
            className="w-full h-full object-cover rounded-l-full"
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Note d'intégration Backend :</span>
          <span>
            Le backend Spring Boot actuel regroupe les enseignants par <strong>Départements académiques</strong> (table MySQL <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">departments</code>).
            La table des classes scolaires (ex: 1ère A) n'est pas encore implémentée dans le schéma de la base de données. Aucune statistique fictive de classe n'est affichée ici afin de respecter l'intégrité absolue des données MySQL.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Building2}
          title="Départements réels"
          value={departments.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Pôles enregistrés"
        />
        <StatCard
          icon={Users}
          title="Enseignants affectés"
          value={teachers.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Effectif professoral"
        />
        <StatCard
          icon={School}
          title="Classes (salles)"
          value="Non configuré"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Entité absente du backend"
        />
        <StatCard
          icon={AlertCircle}
          title="Taux d'occupation"
          value="N/A"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Donnée non disponible"
        />
      </div>

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des départements depuis MySQL...</span>
          </div>
        ) : departments.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716C]">
            Aucun département académique trouvé dans la base de données.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2] font-bold text-[#78716C] uppercase">
                  <th className="py-4 px-6">Identifiant</th>
                  <th className="py-4 px-6">Nom du département académique</th>
                  <th className="py-4 px-6">Enseignants rattachés</th>
                  <th className="py-4 px-6 text-right">Statut MySQL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2]">
                {departments.map((dept) => {
                  const assignedTeachers = teachers.filter((t) => t.department?.id === dept.id);
                  return (
                    <tr key={dept.id} className="hover:bg-[#FAF7F2]/60">
                      <td className="py-4 px-6 font-mono text-[#78716C]">#{dept.id}</td>
                      <td className="py-4 px-6 font-bold text-[#16222F] text-sm">{dept.name}</td>
                      <td className="py-4 px-6 text-[#16222F]">
                        {assignedTeachers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedTeachers.map((t) => (
                              <span key={t.id} className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFECE6] text-[11px]">
                                {t.user?.firstName} {t.user?.lastName} ({t.specialization})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#A8A29E] italic">Aucun enseignant rattaché</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Actif
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
