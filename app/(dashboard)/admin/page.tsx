'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  ShieldAlert, 
  Settings, 
  UserPlus, 
  Lock, 
  Trash2, 
  CheckCircle,
  FileX
} from 'lucide-react';
import { mockUsers, mockReports } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const { user, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hasRole(['ADMIN'])) {
      router.push('/dashboard');
    }
  }, [hasRole, router]);

  if (!hasRole(['ADMIN'])) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Control Panel</h1>
        <p className="text-slate-500 mt-1">Global system management and user permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-accent" />
                <h3 className="font-bold">System Users</h3>
              </div>
              <button className="text-xs font-bold bg-accent text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors">
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name / Email</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {mockUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                          u.role === 'ADMIN' ? "bg-red-500/10 text-red-500" :
                          u.role === 'SUPERINTENDENT' ? "bg-purple-500/10 text-purple-500" :
                          "bg-blue-500/10 text-blue-500"
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Active</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md text-slate-400 hover:text-accent">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-md text-slate-400 hover:text-red-500">
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

          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold">Pending Approvals Queue</h3>
            </div>
            <div className="space-y-4">
              {mockReports.filter(r => r.status === 'PENDING').map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                      <ShieldAlert className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{r.vesselName} - Inspection</p>
                      <p className="text-xs text-slate-500">Submitted by {r.inspectorName} on {r.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> APPROVE
                    </button>
                    <button className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1">
                      <FileX className="w-3.5 h-3.5" /> REJECT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Settings Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Security Policies</h3>
            <div className="space-y-4">
              {[
                { label: 'Two-Factor Authentication', status: true },
                { label: 'IP Access Restriction', status: false },
                { label: 'Automatic Report Archiving', status: true },
                { label: 'Inspector Role Validation', status: true }
              ].map((policy) => (
                <div key={policy.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{policy.label}</span>
                  <div className={cn(
                    "w-10 h-5 rounded-full relative cursor-pointer transition-all",
                    policy.status ? "bg-accent" : "bg-slate-300 dark:bg-slate-700"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      policy.status ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Lock className="w-24 h-24" />
            </div>
            <h3 className="font-bold relative z-10">System Logs</h3>
            <p className="text-xs text-slate-400 mt-1 relative z-10">Monitor all administrative actions.</p>
            <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10 relative z-10">
              View Audit Trail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
