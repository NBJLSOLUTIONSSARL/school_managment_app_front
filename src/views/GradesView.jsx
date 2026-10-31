import React, { useState } from 'react';
import { Download } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import { INITIAL_STUDENTS } from '../data/mockData';

export default function GradesView() {
  const [level, setLevel] = useState('1ère Année');
  const [selectedClass, setSelectedClass] = useState('1ère A');
  const [trimester, setTrimester] = useState('Trimestre 1');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Évaluation & Résultats
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Gestion des Notes
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Consultez et gérez les notes des élèves
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto justify-end">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-white border border-[#EFECE6] rounded-full px-4 py-2 text-xs font-semibold text-[#16222F] shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="1ère Année">1ère Année</option>
            <option value="2ème Année">2ème Année</option>
            <option value="3ème Année">3ème Année</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border border-[#EFECE6] rounded-full px-4 py-2 text-xs font-semibold text-[#16222F] shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="1ère A">1ère A</option>
            <option value="1ère B">1ère B</option>
            <option value="2ème A">2ème A</option>
          </select>

          <select
            value={trimester}
            onChange={(e) => setTrimester(e.target.value)}
            className="bg-white border border-[#EFECE6] rounded-full px-4 py-2 text-xs font-semibold text-[#16222F] shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="Trimestre 1">Trimestre 1</option>
            <option value="Trimestre 2">Trimestre 2</option>
            <option value="Trimestre 3">Trimestre 3</option>
          </select>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Génération...' : 'Exporter PDF'}</span>
          </button>
        </div>
      </div>

      <div className="academy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                <th className="py-4 px-6">Élève</th>
                <th className="py-4 px-6 text-center">Mathématiques</th>
                <th className="py-4 px-6 text-center">Physique</th>
                <th className="py-4 px-6 text-center">Français</th>
                <th className="py-4 px-6 text-center">Moyenne</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EDE2] text-sm">
              {INITIAL_STUDENTS.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-[#FAF7F2]/60 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-[#EFECE6]"
                      />
                      <div>
                        <div className="font-semibold text-[#16222F]">
                          {student.fullName}
                        </div>
                        <div className="text-xs text-[#A8A29E]">
                          {student.studentNumber} • {student.class}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-[#16222F]">
                    {student.grades.math.toFixed(1)}
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-[#16222F]">
                    {student.grades.physics.toFixed(1)}
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-[#16222F]">
                    {student.grades.french.toFixed(1)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <StatusBadge status={student.grades.average.toFixed(1)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
