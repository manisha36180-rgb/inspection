'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FilePlus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Paperclip,
  FileSpreadsheet
} from 'lucide-react';
import { readExcelToJson, mapExcelToReports } from '@/lib/readexcel';
import api from '@/services/api';
import { mockReports, mockVessels } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      // Fallback to mock data if API fails during dev
      setReports(mockReports);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromExcel = async () => {
    setIsLoadingExcel(true);
    try {
      const data = await readExcelToJson('/data/SEPERATE.xlsx');
      const mappedReports = mapExcelToReports(data);
      setReports(prev => [...mappedReports.slice(0, 51), ...prev]);
      alert(`Successfully imported ${Math.min(data.length, 51)} reports from SEPERATE.xlsx`);
    } catch (error) {
      console.error(error);
      alert('Failed to load Excel data');
    } finally {
      setIsLoadingExcel(false);
    }
  };

  const filteredReports = activeTab === 'ALL' 
    ? reports 
    : reports.filter(r => r.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspection Reports</h1>
          <p className="text-slate-500 mt-1">Review and manage all vessel inspection logs.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all shadow-lg shadow-accent/20">
          <FilePlus className="w-4 h-4" />
          Create New Report
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-tight">Approved</p>
              <p className="text-xl font-bold text-emerald-700">24 Reports</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-tight">Pending</p>
              <p className="text-xl font-bold text-orange-700">08 Reports</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-tight">Rejected</p>
              <p className="text-xl font-bold text-red-700">03 Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2 rounded-2xl">
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-full lg:w-auto">
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                activeTab === tab 
                  ? "bg-white dark:bg-accent text-accent dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by vessel..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-3">
          <button 
            onClick={loadFromExcel}
            disabled={isLoadingExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-500" />
            {isLoadingExcel ? 'Importing...' : 'Import Excel Data'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
            <Download className="w-4 h-4 text-slate-500" />
            Export Data
          </button>
      </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <th className="px-6 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">ID / Vessel</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Inspector</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Attachments</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredReports.map((report) => (
                <tr key={report.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-lg">
                        <FileText className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">#{report.id.toString().slice(-4)}</p>
                        <p className="text-xs text-slate-500 font-medium">{report.vessel?.vesselName || report.vesselName || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold">
                        {(report.creator?.name || report.inspectorName || 'U').charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{report.creator?.name || report.inspectorName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(report.inspectionDate || report.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      report.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" :
                      report.status === 'PENDING' ? "bg-orange-500/10 text-orange-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        report.status === 'APPROVED' ? "bg-emerald-500" :
                        report.status === 'PENDING' ? "bg-orange-500" : "bg-red-500"
                      )} />
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-xs font-bold">{(report.attachments || []).length} Files</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/reports/${report.id}`}
                        className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all text-slate-400 hover:text-accent" 
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all text-slate-400 hover:text-blue-500" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all text-slate-400 hover:text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
