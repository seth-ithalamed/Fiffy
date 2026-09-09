import React, { useState, useEffect } from 'react';
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
  Menu,
  X,
  ChevronRight,
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on ESC key or surface change
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadMatchesCount = matches.reduce((acc, m) => acc + (m.unreadCount || 0), 0);

  const formatBoostTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const navSurfaces: { id: SurfaceType; label: string; shortLabel: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'marketing' as SurfaceType, label: 'About & Features', shortLabel: 'About', icon: Globe },
    { id: 'web-app' as SurfaceType, label: 'Match Making Deck', shortLabel: 'Sparks Deck', icon: Flame },
    { id: 'admin' as SurfaceType, label: 'Admin Portal', shortLabel: 'Admin', icon: ShieldCheck },
  ];

  const handleUpgradeClick = () => {
    if (subscriptionPlans.length > 0) {
      const popular = subscriptionPlans.find((p) => p.isPopular) || subscriptionPlans[0];
      openPayFastCheckout(popular);
    }
  };

  const handleSurfaceChange = (surfaceId: SurfaceType) => {
    setActiveSurface(surfaceId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-[#0c051a]/95 backdrop-blur-xl border-b border-white/[0.08] transition-all shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div
          id="brand-logo-btn"
          onClick={() => {
            if (authUser) {
              handleSurfaceChange('web-app');
              setInAppTab('discover');
            } else {
              handleSurfaceChange('marketing');
            }
          }}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform border border-pink-500/30 bg-[#0c051a] flex items-center justify-center flex-shrink-0">
            <img
              src="/assets/favicon.png"
              alt="Fiffy's Match Making"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display font-black text-base sm:text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-white leading-tight">
                Fiffy&apos;s
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-purple-300/70 font-medium tracking-wide leading-none">
              Match Making
            </p>
          </div>
        </div>

        {/* Desktop / Tablet Surface Switcher (Hidden on mobile < md) */}
        <nav className="hidden md:flex items-center bg-[#15092a]/80 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-inner flex-shrink-0">
          {navSurfaces.map((surface) => {
            const Icon = surface.icon;
            const isActive = activeSurface === surface.id;
            return (
              <button
                key={surface.id}
                id={`nav-surface-${surface.id}`}
                onClick={() => handleSurfaceChange(surface.id)}
                title={surface.label}
                className={`flex items-center gap-1.5 px-3 lg:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'gradient-fiffy text-white shadow-md shadow-pink-500/30'
                    : 'text-purple-200/80 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-pink-400'}`} />
                <span className="hidden lg:inline">{surface.label}</span>
                <span className="lg:hidden">{surface.shortLabel}</span>
                {surface.id === 'admin' && adminSession?.isAuthenticated && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Bar (Desktop / Tablet) */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          {/* Boost Button */}
          <button
            id="header-boost-button"
            onClick={activateBoost}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
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
            <span className="hidden md:inline">
              {isBoostActive
                ? `Boosted (${formatBoostTime(boostTimeRemaining)})`
                : (currentUser.boostsRemaining || 0) > 0
                ? `Boost (${currentUser.boostsRemaining})`
                : 'Boost'}
            </span>
          </button>

          {/* Quick Chat Shortcut */}
          {authUser && (
            <button
              id="header-chat-button"
              onClick={() => {
                handleSurfaceChange('web-app');
                setInAppTab('chat');
              }}
              className="relative p-2 rounded-full bg-purple-950/40 hover:bg-white/[0.08] border border-white/10 text-purple-200 hover:text-white transition-colors flex-shrink-0"
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
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold gradient-fiffy text-white shadow-sm hover:brightness-110 transition-all shadow-pink-500/20 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden lg:inline">Upgrade to VIP</span>
              <span className="lg:hidden">VIP</span>
            </button>
          ) : (
            <span className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 whitespace-nowrap">
              <Sparkles className="w-3 h-3 fill-amber-300" />
              <span>VIP Active</span>
            </span>
          )}

          {/* AUTH STATUS / BUTTONS */}
          {authUser ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
              <div
                id="header-user-avatar-btn"
                onClick={() => {
                  handleSurfaceChange('web-app');
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
                <span className="text-xs font-semibold text-gray-200 hidden xl:inline pr-1">
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
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
              <button
                id="header-signin-btn"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Sign In</span>
              </button>
              <button
                id="header-signup-btn"
                onClick={() => openAuthModal('signup')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-gray-900 hover:bg-pink-100 transition-colors shadow-sm whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5 text-pink-600" />
                <span>Join Free</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Action Elements (< sm / < md) */}
        <div className="flex sm:hidden md:hidden items-center gap-1.5 flex-shrink-0">
          {/* Mobile Quick VIP or Join Free button */}
          {!authUser ? (
            <button
              id="header-mobile-quick-join-btn"
              onClick={() => openAuthModal('signup')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-gray-900 shadow-sm"
            >
              <UserPlus className="w-3 h-3 text-pink-600" />
              <span>Join</span>
            </button>
          ) : (
            <button
              id="header-mobile-quick-avatar-btn"
              onClick={() => {
                handleSurfaceChange('web-app');
                setInAppTab('profile');
              }}
              className="p-0.5 rounded-full border border-pink-400 bg-white/5"
              title="My Profile"
            >
              <img
                src={currentUser.photos[0] || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover"
              />
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            id="header-mobile-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              mobileMenuOpen
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                : 'bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white border-white/10'
            }`}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            {unreadMatchesCount > 0 && !mobileMenuOpen && (
              <span className="w-2 h-2 rounded-full bg-pink-500 absolute top-1.5 right-1.5 animate-ping" />
            )}
          </button>
        </div>

        {/* Tablet Hamburger (Between sm and md where center pills are hidden to save space) */}
        <div className="hidden sm:flex md:hidden items-center gap-1.5 flex-shrink-0">
          <button
            id="header-tablet-menu-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              mobileMenuOpen
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                : 'bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white border-white/10'
            }`}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile / Tablet Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="header-mobile-drawer"
          className="md:hidden border-t border-white/10 bg-[#0d051c]/98 backdrop-blur-2xl px-4 py-4 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200"
        >
          {/* Surface Navigation Segment */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300/70 mb-2">
              Select Surface
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {navSurfaces.map((surface) => {
                const Icon = surface.icon;
                const isActive = activeSurface === surface.id;
                return (
                  <button
                    key={surface.id}
                    id={`mobile-nav-surface-${surface.id}`}
                    onClick={() => handleSurfaceChange(surface.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'gradient-fiffy text-white shadow-lg shadow-pink-500/25'
                        : 'bg-white/5 text-purple-200 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-pink-400'}`} />
                      <span>{surface.label}</span>
                      {surface.id === 'admin' && adminSession?.isAuthenticated && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Shortcuts & Perks */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
            {/* Boost Feature */}
            <button
              id="mobile-header-boost-btn"
              onClick={() => {
                activateBoost();
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                isBoostActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                  : (currentUser.boostsRemaining || 0) > 0
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-purple-950/30 text-pink-300 border-pink-500/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isBoostActive
                  ? `Boosted (${formatBoostTime(boostTimeRemaining)})`
                  : (currentUser.boostsRemaining || 0) > 0
                  ? `Boost (${currentUser.boostsRemaining})`
                  : 'Boost ⚡'}
              </span>
            </button>

            {/* VIP Upgrade Button */}
            {!currentUser.isPremium ? (
              <button
                id="mobile-header-upgrade-btn"
                onClick={() => {
                  handleUpgradeClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold gradient-fiffy text-white shadow-md shadow-pink-500/25"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Upgrade VIP</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 fill-amber-300" />
                <span>VIP Active</span>
              </div>
            )}
          </div>

          {/* Auth & User Profile Section */}
          <div className="pt-2 border-t border-white/10">
            {authUser ? (
              <div className="space-y-2">
                <div
                  id="mobile-header-profile-card"
                  onClick={() => {
                    handleSurfaceChange('web-app');
                    setInAppTab('profile');
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.photos[0] || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80'}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-pink-400"
                    />
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1">
                        <span>{currentUser.name}</span>
                        <span>{currentUser.countryFlag || '🇿🇦'}</span>
                      </p>
                      <p className="text-[11px] text-purple-300/70">{currentUser.datingGoal || 'Match Making'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="mobile-header-chat-btn"
                    onClick={() => {
                      handleSurfaceChange('web-app');
                      setInAppTab('chat');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-950/40 border border-white/10 text-xs font-semibold text-purple-200"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-pink-300" />
                    <span>Messages</span>
                    {unreadMatchesCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-pink-500 text-white text-[9px] font-bold">
                        {unreadMatchesCount}
                      </span>
                    )}
                  </button>

                  <button
                    id="mobile-header-logout-btn"
                    onClick={() => {
                      logoutUser();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="mobile-header-signin-btn"
                  onClick={() => {
                    openAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-purple-200 hover:text-white"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  id="mobile-header-signup-btn"
                  onClick={() => {
                    openAuthModal('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white text-gray-900 text-xs font-bold hover:bg-pink-100 shadow-md shadow-pink-500/20"
                >
                  <UserPlus className="w-3.5 h-3.5 text-pink-600" />
                  <span>Join Free</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
