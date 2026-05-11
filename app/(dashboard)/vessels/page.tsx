'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockVessels } from '@/lib/mock-data';
import api from '@/services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Ship, 
  Anchor, 
  Globe, 
  Settings,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function VesselsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [vessels, setVessels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = async () => {
    try {
      const response = await api.get('/vessels');
      setVessels(response.data);
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
      setVessels(mockVessels);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVessels = vessels.filter(vessel => 
    (vessel.vesselName || vessel.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (vessel.imoNumber || '').includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vessel Management</h1>
          <p className="text-slate-500 mt-1">Manage and track your sellamsoft fleet.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-all shadow-lg shadow-accent/20">
          <Plus className="w-4 h-4" />
          Add New Vessel
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or IMO number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-accent outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 text-slate-400" />
            Filter
          </button>
          <select 
            className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-accent outline-none cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option>All Types</option>
            <option>Oil Tanker</option>
            <option>Container Ship</option>
            <option>Bulk Carrier</option>
            <option>LNG Carrier</option>
          </select>
        </div>
      </div>

      {/* Vessel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredVessels.map((vessel, i) => (
            <motion.div
              key={vessel.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-accent/5 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Anchor className="w-6 h-6 text-accent" />
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    vessel.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"
                  )}>
                    {vessel.status}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold group-hover:text-accent transition-colors">{vessel.name}</h3>
                  <p className="text-slate-500 text-sm mt-1">IMO: {vessel.imoNumber}</p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-white/10 rounded-lg">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Flag</p>
                      <p className="text-xs font-semibold">{vessel.flag}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 dark:bg-white/10 rounded-lg">
                      <Ship className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Type</p>
                      <p className="text-xs font-semibold">{vessel.type}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <Link 
                    href={`/vessels/${vessel.id}`}
                    className="text-sm font-semibold text-accent flex items-center gap-1 hover:underline"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-400">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-400">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredVessels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
          <Ship className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-600 dark:text-slate-400">No Vessels Found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
          <button className="mt-6 px-6 py-2 bg-accent text-white rounded-xl font-medium" onClick={() => setSearchQuery('')}>
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
