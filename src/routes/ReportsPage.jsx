import React from 'react';
import { BarChart3 } from 'lucide-react';
import { DocTypePageHead } from '@/components/ui/DocTypePageHead';
import { ReportsAnalyticsView } from '@/features/reports/components/ReportsAnalyticsView';

export default function ReportsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 select-none bg-[#F9FAFB] dark:bg-gray-900 min-h-screen">
      <DocTypePageHead
        icon={BarChart3}
        title="Rapports & Statistiques"
        countLabel="modules"
      />
      <ReportsAnalyticsView />
    </div>
  );
}
