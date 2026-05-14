'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Bell, Menu, User as UserIcon, Sun, Moon, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccessibility } from '@/components/AccessibilityProvider';

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const { darkMode, setSettings } = useAccessibility();

  const toggleTheme = () => {
    setSettings({ darkMode: !darkMode });
  };

  return (
    <header className="h-20 border-b border-border/40 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-[40]">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar}
          className="p-3 hover:bg-accent/10 rounded-2xl transition-all text-foreground group"
        >
          <Menu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-3 hover:bg-accent/10 rounded-2xl transition-all text-foreground"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
          </button>
          
          <button className="p-3 hover:bg-accent/10 rounded-2xl transition-all relative text-foreground">
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-accent rounded-full border-2 border-background animate-pulse" />
          </button>
        </div>

        <div className="h-10 w-[1px] bg-border/60 mx-2" />

        <div className="flex items-center gap-4 pl-2">
          <div className="text-right hidden xl:block">
            <p className="text-sm font-black tracking-tight text-foreground uppercase italic leading-none">{user?.name || 'Authorized Personnel'}</p>
            <p className="text-[10px] text-accent mt-1.5 font-black uppercase tracking-[0.2em] leading-none">{user?.role || 'Operator'}</p>
          </div>
          
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-black text-xl border border-white/10 shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity" />
            {user?.name?.charAt(0) || <UserIcon className="w-6 h-6" />}
          </div>

          <button 
            onClick={logout}
            className="flex items-center justify-center w-12 h-12 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all group border border-rose-500/20"
            title="Secure Sign Out"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>
    </header>
  );
}
