import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  FileText,
  Download,
  BarChart2,
  ChevronDown
} from 'lucide-react';
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
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2 pb-4 overflow-hidden">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-0.5 bg-[#C5A880] rounded-full inline-block" />
            <h1 className="text-3xl sm:text-4xl font-serif-title font-bold text-[#16222F] tracking-tight">
              Rapports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] mt-2">
            Consultez et téléchargez vos rapports en quelques clics
          </p>
        </div>

        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-36 w-96 pointer-events-none">
          <img
            src="/assets/reports-illustration.png"
            alt=""
            className="w-full h-full object-contain object-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#F0E5D3] flex items-center justify-center text-[#16222F] shrink-0">
              <Users className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs text-[#526071] font-medium">Total Élèves</p>
              <p className="text-3xl font-serif-title font-bold text-[#16222F] mt-0.5">
                1 248
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-[#059669] shrink-0">
            ↑ +5%
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-8 bg-gradient-to-t from-[#F8F3EA]/60 to-transparent pointer-events-none rounded-tl-full" />
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#F0E5D3] flex items-center justify-center text-[#16222F] shrink-0">
              <GraduationCap className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs text-[#526071] font-medium">Taux de Réussite</p>
              <p className="text-3xl font-serif-title font-bold text-[#16222F] mt-0.5">
                92%
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-[#059669] shrink-0">
            ↑ +2%
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-8 bg-gradient-to-t from-[#F8F3EA]/60 to-transparent pointer-events-none rounded-tl-full" />
        </div>

        <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#F0E5D3] flex items-center justify-center text-[#16222F] shrink-0">
              <FileText className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-xs text-[#526071] font-medium">Rapports Disponibles</p>
              <p className="text-3xl font-serif-title font-bold text-[#16222F] mt-0.5">
                12
              </p>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-8 bg-gradient-to-t from-[#F8F3EA]/60 to-transparent pointer-events-none rounded-tl-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-5 h-5 text-[#C5A880]" />
              <h2 className="text-base sm:text-lg font-bold font-serif-title text-[#16222F]">
                Aperçu des performances
              </h2>
            </div>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none bg-white border border-[#E5DFD5] rounded-full pl-4 pr-8 py-1.5 text-xs font-medium text-[#16222F] shadow-2xs focus:outline-none cursor-pointer"
              >
                <option value="Cette année">Cette année</option>
                <option value="Trimestre 1">Trimestre 1</option>
                <option value="Année précédente">Année précédente</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#16222F] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2">
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

        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <Download className="w-5 h-5 text-[#C5A880]" />
              <h2 className="text-base sm:text-lg font-bold font-serif-title text-[#16222F]">
                Action rapide
              </h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#FAF5EB] border border-[#EADBCA] hover:bg-[#F3ECE0] transition-colors cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-[#C93B2B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  PDF
                </div>
                <div className="flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#16222F] block">
                    {isDownloadingPdf ? 'Téléchargement...' : 'Télécharger un rapport PDF'}
                  </span>
                </div>
              </button>

              <button
                onClick={handleExportExcel}
                disabled={isExportingExcel}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#FAF5EB] border border-[#EADBCA] hover:bg-[#F3ECE0] transition-colors cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1E7145] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  X
                </div>
                <div className="flex-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#16222F] block">
                    {isExportingExcel ? 'Exportation...' : 'Exporter vers Excel'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
