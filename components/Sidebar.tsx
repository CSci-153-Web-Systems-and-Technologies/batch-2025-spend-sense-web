"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SpendSenseLogo from "./SpendSenseLogo";
import LogoutButton from "./LogoutButton";

type SidebarProps = {
  username: string;
  avatarUrl: string | null;
};

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Reports",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/budget-goals",
    label: "Budget Goals",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

const bottomItems = [
  {
    href: "/profile",
    label: "Settings",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({ username, avatarUrl }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved collapse state
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("spendsense_sidebar_collapsed");
    if (saved) setIsCollapsed(JSON.parse(saved));
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("spendsense_sidebar_collapsed", JSON.stringify(newState));
  };

  if (!mounted) return null;

  return (
    <aside 
      className={`hidden md:flex flex-col bg-white/80 backdrop-blur-xl border-r border-gray-200/50 h-[100dvh] sticky top-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[80px]" : "w-[260px]"
      }`}
    >
      {/* Header / Logo */}
      <div className={`px-4 py-5 flex items-center justify-between`}>
        {!isCollapsed ? (
          <SpendSenseLogo size="md" linkTo="/dashboard" />
        ) : (
          <Link href="/dashboard" className="mx-auto flex items-center justify-center">
             <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #A29BFE 0%, #6C5CE7 100%)" }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="6" width="20" height="14" rx="3" fill="white" fillOpacity="0.9" />
                  <circle cx="17" cy="13" r="2.5" fill="#6C5CE7" fillOpacity="0.6" />
                  <circle cx="17" cy="13" r="1.2" fill="white" fillOpacity="0.8" />
                </svg>
              </div>
          </Link>
        )}
        
        {/* Toggle Button */}
        <button 
          onClick={toggleCollapse}
          className={`text-gray-400 hover:text-violet-600 transition-colors p-1.5 rounded-lg hover:bg-violet-50 flex-shrink-0 ${isCollapsed ? 'mx-auto mt-4 absolute top-[60px] left-[22px]' : ''}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2' : 'px-3'} py-4 custom-scrollbar`}>
        {!isCollapsed && <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-widest transition-opacity duration-200">Menu</p>}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isCollapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md shadow-violet-500/20"
                    : "text-gray-500 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <span className={isActive ? "text-white/90" : "text-gray-400"}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-200">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {!isCollapsed && <p className="px-3 mt-8 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-widest transition-opacity duration-200">General</p>}
        <div className={`space-y-1 ${isCollapsed ? 'mt-8' : ''}`}>
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isCollapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md shadow-violet-500/20"
                    : "text-gray-500 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <span className={isActive ? "text-white/90" : "text-gray-400"}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-200">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className={`p-3 border-t border-gray-200/50 mt-auto`}>
        <div className={`flex items-center gap-3 py-2 rounded-xl bg-gray-50/80 transition-all ${isCollapsed ? 'px-1 justify-center flex-col' : 'px-3'}`}>
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-violet-200 hover:ring-violet-400 transition"
            title="Profile Settings"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Profile" width={36} height={36} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{username.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{username}</p>
              <p className="text-xs text-gray-400">Member</p>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
