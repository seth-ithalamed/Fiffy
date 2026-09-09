import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { MarketingLanding } from './components/marketing/MarketingLanding';
import { DiscoveryView } from './components/app/DiscoveryView';
import { ChatView } from './components/app/ChatView';
import { ProfileEditor } from './components/app/ProfileEditor';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProfileDetailModal } from './components/app/ProfileDetailModal';
import { MatchCelebrationModal } from './components/app/MatchCelebrationModal';
import { SafetyPanicModal } from './components/app/SafetyPanicModal';
import { MonetizationModal } from './components/app/MonetizationModal';
import { AuthModal } from './components/auth/AuthModal';
import { PaymentModal } from './components/app/PaymentModal';
import { VerificationModal } from './components/app/VerificationModal';
import {
  Flame,
  MessageCircle,
  User,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeSurface,
    inAppTab,
    setInAppTab,
    matches,
    toasts,
    dismissToast,
    currentUser,
    authUser,
  } = useApp();

  const totalUnreadMessages = matches.reduce((acc, m) => acc + (m.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_50%,#1a0b2e_0%,#050208_100%)] text-slate-100 flex flex-col font-sans selection:bg-pink-600 selection:text-white">
      {/* Top Universal Surface Navigation */}
      <Header />

      {/* Surface Render Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeSurface === 'marketing' && <MarketingLanding />}

        {activeSurface === 'admin' && <AdminDashboard />}

        {activeSurface === 'web-app' && (
          <div className="flex-1 flex flex-col h-[calc(100vh-60px)]">
            {/* In-App Surface Secondary Tab Switcher */}
            <div className="bg-[#0e061d]/85 backdrop-blur-xl border-b border-white/[0.08] px-2.5 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4 z-20 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Sparks / Discover Tab */}
                <button
                  id="tab-discover"
                  onClick={() => setInAppTab('discover')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    inAppTab === 'discover'
                      ? 'gradient-fiffy text-white shadow-lg shadow-pink-500/25'
                      : 'text-purple-300/80 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sparks Deck</span>
                  <span className="sm:hidden">Sparks</span>
                </button>

                {/* Messages & Sparks Tab - Only shown when logged in */}
                {authUser && (
                  <button
                    id="tab-chat"
                    onClick={() => setInAppTab('chat')}
                    className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      inAppTab === 'chat'
                        ? 'gradient-fiffy text-white shadow-lg shadow-pink-500/25'
                        : 'text-purple-300/80 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Chat &amp; Matches</span>
                    <span className="sm:hidden">Chat</span>
                    {totalUnreadMessages > 0 && (
                      <span className="w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                        {totalUnreadMessages}
                      </span>
                    )}
                  </button>
                )}

                {/* Profile Editor Tab */}
                <button
                  id="tab-profile"
                  onClick={() => setInAppTab('profile')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    inAppTab === 'profile'
                      ? 'gradient-fiffy text-white shadow-lg shadow-pink-500/25'
                      : 'text-purple-300/80 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">My Profile</span>
                  <span className="sm:hidden">Profile</span>
                </button>
              </div>

              {/* User Avatar Mini Status */}
              <div
                id="app-user-mini-status"
                onClick={() => setInAppTab('profile')}
                className="hidden sm:flex items-center gap-2 cursor-pointer group flex-shrink-0"
              >
                <img
                  src={currentUser.photos[0] || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-pink-500/70 group-hover:scale-105 transition-transform"
                />
                <span className="text-xs font-semibold text-purple-200 group-hover:text-pink-300 transition-colors">
                  {currentUser.countryFlag || '🇿🇦'} {currentUser.name}
                </span>
              </div>
            </div>

            {/* Active In-App View */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {inAppTab === 'discover' && <DiscoveryView />}
              {inAppTab === 'chat' && <ChatView />}
              {inAppTab === 'profile' && <ProfileEditor />}
            </div>
          </div>
        )}
      </main>

      {/* GLOBAL MODALS */}
      <ProfileDetailModal />
      <MatchCelebrationModal />
      <SafetyPanicModal />
      <MonetizationModal />
      <AuthModal />
      <PaymentModal />
      <VerificationModal />

      {/* TOAST NOTIFICATIONS STACK */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {(toasts || []).map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-3.5 rounded-2xl bg-[#160a2c]/90 backdrop-blur-xl border border-white/15 text-slate-100 shadow-2xl shadow-black/80 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />}

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white">{toast.title}</h4>
              <p className="text-[11px] text-purple-200/80 mt-0.5">{toast.description}</p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-purple-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
