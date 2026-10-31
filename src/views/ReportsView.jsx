import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  FileText,
  Download,
  BarChart2
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import LineChart from '../components/common/LineChart';
import { PERFORMANCE_DATA } from '../data/mockData';

export default function ReportsView() {
  const [period, setPeriod] = useState('Cette année');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    setTimeout(() => {
      setIsDownloadingPdf(false);
      window.print();
    }, 600);
  };

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    setTimeout(() => {
      setIsExportingExcel(false);
      alert('Export Excel généré avec succès : rapport_academie_lumiere_2026.xlsx');
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Statistiques & Analyses
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Rapports
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Consultez et téléchargez vos rapports en quelques clics
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-[#F4EDE2] flex items-center justify-center text-[#C5A880] shrink-0 hidden sm:flex">
          <BarChart2 className="w-8 h-8 stroke-[1.5]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          icon={Users}
          title="Total Élèves"
          value="1 248"
          badgeText="↑ +5%"
          badgeType="positive"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={GraduationCap}
          title="Taux de Réussite"
          value="92%"
          badgeText="↑ +2%"
          badgeType="positive"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={FileText}
          title="Rapports Disponibles"
          value="12"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 academy-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-5 h-5 text-[#C5A880]" />
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Aperçu des performances
              </h2>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-[#EFECE6] rounded-full px-4 py-1.5 text-xs font-semibold text-[#16222F] shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="Cette année">Cette année</option>
              <option value="Trimestre 1">Trimestre 1</option>
              <option value="Année précédente">Année précédente</option>
            </select>
          </div>

          <div className="pt-4">
            <LineChart
              data={PERFORMANCE_DATA}
              dataKey="rate"
              labelKey="month"
              minY={0}
              maxY={100}
              ySuffix="%"
              lineColor="#C5A880"
              height={230}
            />
          </div>
        </div>

        <div className="academy-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-[#F4EDE2]">
              <Download className="w-4 h-4 text-[#C5A880]" />
              <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
                Action rapide
              </h2>
            </div>

            <div className="mt-5 space-y-3.5">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] hover:bg-[#F4EDE2] transition-all cursor-pointer group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  PDF
                </div>
                <div>
                  <span className="text-sm font-bold text-[#16222F] block">
                    {isDownloadingPdf ? 'Téléchargement...' : 'Télécharger un rapport PDF'}
                  </span>
                  <span className="text-xs text-[#78716C]">
                    Bilan complet officiel
                  </span>
                </div>
              </button>

              <button
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] hover:bg-[#F4EDE2] transition-all cursor-pointer group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  XLS
                </div>
                <div>
                  <span className="text-sm font-bold text-[#16222F] block">
                    {isExportingExcel ? 'Exportation...' : 'Exporter vers Excel'}
                  </span>
                  <span className="text-xs text-[#78716C]">
                    Données brutes tabulaires
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F4EDE2] text-center">
            <p className="text-[11px] text-[#A8A29E]">
              Dernière mise à jour des statistiques : il y a 30 min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
