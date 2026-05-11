'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Ship, 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  MoreVertical,
  Download
} from 'lucide-react';
import { mockStats, mockReports, mockVessels } from '@/lib/mock-data';
import api from '@/services/api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reportsRes, vesselsRes] = await Promise.all([
        api.get('/reports'),
        api.get('/vessels')
      ]);
      setReports(reportsRes.data);
      setVessels(vesselsRes.data);
    } catch (error) {
      console.error('Dashboard fetch failed:', error);
      setReports(mockReports);
      setVessels(mockVessels);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: 'Total Vessels', value: vessels.length || mockStats.totalVessels, icon: Ship, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Reports', value: reports.length || mockStats.totalReports, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Pending Approvals', value: reports.filter(r => r.status === 'PENDING').length || mockStats.pendingApprovals, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Approved Reports', value: reports.filter(r => r.status === 'APPROVED').length || mockStats.approvedReports, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Inspections',
        data: [12, 19, 13, 25, 22, 30],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Activity',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Overview</h1>
          <p className="text-slate-500 mt-1">Real-time inspection metrics and vessel activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-shadow shadow-lg shadow-accent/20">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Inspection Trends</h3>
            <MoreVertical className="w-5 h-5 text-slate-400 cursor-pointer" />
          </div>
          <div className="h-[300px]">
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
          <h3 className="font-bold text-lg mb-8">System Activity</h3>
          <div className="h-[300px]">
            <Line 
              data={lineData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { display: false }, display: false },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Recent Inspection Reports</h3>
          <button className="text-accent text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="pb-4 font-semibold text-slate-500 text-sm">Vessel Name</th>
                <th className="pb-4 font-semibold text-slate-500 text-sm">Inspector</th>
                <th className="pb-4 font-semibold text-slate-500 text-sm">Date</th>
                <th className="pb-4 font-semibold text-slate-500 text-sm">Status</th>
                <th className="pb-4 font-semibold text-slate-500 text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {reports.slice(0, 5).map((report) => (
                <tr key={report.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 font-medium">{report.vessel?.vesselName || report.vesselName || 'Unknown Vessel'}</td>
                  <td className="py-4 text-slate-500 text-sm">{report.creator?.name || report.inspectorName || 'N/A'}</td>
                  <td className="py-4 text-slate-500 text-sm">{new Date(report.inspectionDate || report.date).toLocaleDateString()}</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      report.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" :
                      report.status === 'PENDING' ? "bg-orange-500/10 text-orange-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all text-slate-400 hover:text-accent">
                      <FileText className="w-4 h-4" />
                    </button>
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
