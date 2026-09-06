import React from 'react';
import { useApp, SurfaceType } from '../../context/AppContext';
import {
  Flame,
  Globe,
  ShieldCheck,
  Zap,
  Sparkles,
  MessageCircle,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Heart,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeSurface,
    setActiveSurface,
    currentUser,
    authUser,
    openAuthModal,
    logoutUser,
    adminSession,
    setInAppTab,
    isBoostActive,
    boostTimeRemaining,
    activateBoost,
    matches,
    subscriptionPlans,
    openPayFastCheckout,
  } = useApp();

  const unreadMatchesCount = matches.reduce((acc, m) => acc + (m.unreadCount || 0), 0);

  const formatBoostTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const navSurfaces: { id: SurfaceType; label: string; icon: React.FC<{ className?: string }> }[] = [
    ...(!authUser ? [{ id: 'marketing' as SurfaceType, label: 'About & Features', icon: Globe }] : []),
    { id: 'web-app' as SurfaceType, label: 'Match Making Deck', icon: Flame },
    { id: 'admin' as SurfaceType, label: 'Admin Portal', icon: ShieldCheck },
  ];

  const handleUpgradeClick = () => {
    if (subscriptionPlans.length > 0) {
      // Default to the popular VIP plan
      const popular = subscriptionPlans.find((p) => p.isPopular) || subscriptionPlans[0];
      openPayFastCheckout(popular);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c051a]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-2.5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          id="brand-logo-btn"
          onClick={() => {
            if (authUser) {
              setActiveSurface('web-app');
              setInAppTab('discover');
            } else {
              setActiveSurface('marketing');
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform border border-pink-500/30 bg-[#0c051a] flex items-center justify-center">
            <img
              src="/assets/favicon.png"
              alt="Fiffy's Match Making"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-white">
                Fiffy&apos;s
              </span>
            </div>
            <p className="text-[10px] text-purple-300/70 font-medium tracking-wide">
              Match Making
            </p>
          </div>
        </div>

        {/* Surface Switcher */}
        <nav className="flex items-center bg-[#15092a]/80 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-inner">
          {navSurfaces.map((surface) => {
            const Icon = surface.icon;
            const isActive = activeSurface === surface.id;
            return (
              <button
                key={surface.id}
                id={`nav-surface-${surface.id}`}
                onClick={() => setActiveSurface(surface.id)}
                title={surface.label}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'gradient-fiffy text-white shadow-md shadow-pink-500/30'
                    : 'text-purple-200/80 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-pink-400'}`} />
                <span className="hidden md:inline">{surface.label}</span>
                {surface.id === 'admin' && adminSession?.isAuthenticated && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right action bar */}
        <div className="flex items-center gap-2">
          {/* Boost Button - Paid feature */}
          <button
            id="header-boost-button"
            onClick={activateBoost}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isBoostActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : (currentUser.boostsRemaining || 0) > 0
                ? 'bg-amber-500/20 text-amber-300 hover:text-white border border-amber-500/40 shadow-sm'
                : 'bg-purple-950/40 text-pink-300 hover:text-white border border-pink-500/30 hover:border-pink-500/60 shadow-sm'
            }`}
            title={
              isBoostActive
                ? 'Boost spotlight active!'
                : (currentUser.boostsRemaining || 0) > 0
                ? `${currentUser.boostsRemaining} Boost credit available`
                : 'Profile Boost (Paid Feature)'
            }
          >
            <Zap className={`w-3.5 h-3.5 ${isBoostActive ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">
              {isBoostActive
                ? `Boosted (${formatBoostTime(boostTimeRemaining)})`
                : (currentUser.boostsRemaining || 0) > 0
                ? `Boost (${currentUser.boostsRemaining})`
                : 'Boost ⚡'}
            </span>
          </button>

          {/* Quick Chat Shortcut - Only shown when logged in */}
          {authUser && (
            <button
              id="header-chat-button"
              onClick={() => {
                setActiveSurface('web-app');
                setInAppTab('chat');
              }}
              className="relative p-2 rounded-full bg-purple-950/40 hover:bg-white/[0.08] border border-white/10 text-purple-200 hover:text-white transition-colors"
              title="Messages"
            >
              <MessageCircle className="w-4 h-4 text-pink-300" />
              {unreadMatchesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {unreadMatchesCount}
                </span>
              )}
            </button>
          )}

          {/* VIP Upgrade Button */}
          {!currentUser.isPremium ? (
            <button
              id="header-upgrade-btn"
              onClick={handleUpgradeClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold gradient-fiffy text-white shadow-sm hover:brightness-110 transition-all shadow-pink-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Upgrade to VIP</span>
            </button>
          ) : (
            <span className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-3 h-3 fill-amber-300" />
              <span>VIP Active</span>
            </span>
          )}

          {/* AUTH STATUS / BUTTONS */}
          {authUser ? (
            <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
              <div
                id="header-user-avatar-btn"
                onClick={() => {
                  setActiveSurface('web-app');
                  setInAppTab('profile');
                }}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 p-1 rounded-full bg-white/5 border border-white/10"
                title={`${currentUser.name} (${currentUser.country || 'South Africa'})`}
              >
                <img
                  src={currentUser.photos[0] || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-pink-400"
                />
                <span className="text-xs font-semibold text-gray-200 hidden md:inline pr-1">
                  {currentUser.countryFlag || '🇿🇦'} {currentUser.name.split(' ')[0]}
                </span>
              </div>
              <button
                id="header-logout-btn"
                onClick={logoutUser}
                className="p-1.5 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
              <button
                id="header-signin-btn"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
              <button
                id="header-signup-btn"
                onClick={() => openAuthModal('signup')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-gray-900 hover:bg-pink-100 transition-colors shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5 text-pink-600" />
                <span>Join Free</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
