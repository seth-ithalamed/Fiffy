import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  Check,
  CreditCard,
  Zap,
} from 'lucide-react';

export const MonetizationModal: React.FC = () => {
  const {
    isMonetizationOpen,
    setMonetizationOpen,
    subscriptionPlans,
    openPayFastCheckout,
    currentUser,
    activateBoost,
  } = useApp();

  if (!isMonetizationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#120625]/95 backdrop-blur-2xl rounded-3xl border border-pink-500/40 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(255,42,133,0.2)] my-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={() => setMonetizationOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.08] hover:bg-white/15 text-purple-200 hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2 border border-pink-500/30">
            <img src="/assets/favicon.png" alt="Fiffy" className="w-3.5 h-3.5 rounded-full object-cover" />
            <span>Fiffy VIP Subscriptions</span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white">
            Worldwide VIP Access
          </h2>
          <p className="text-xs text-purple-300/80 mt-1">
            Unlimited cross-border matching, see who liked you, and 10x profile visibility with bank-grade security.
          </p>
        </div>

        {/* Plan Cards Grid (Sourced directly from Admin Portal) */}
        <div className="grid sm:grid-cols-2 gap-4">
          {subscriptionPlans.slice(0, 2).map((plan) => (
            <div
              key={plan.id}
              className={`p-5 rounded-2xl bg-[#15092c]/85 backdrop-blur-md border flex flex-col justify-between hover:border-pink-500 transition-all shadow-lg relative ${
                plan.isPopular ? 'border-pink-500 shadow-pink-500/20' : 'border-pink-500/30'
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold gradient-fiffy text-white shadow">
                  RECOMMENDED
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-white">{plan.name}</h3>
                </div>
                {plan.description && (
                  <p className="text-xs text-purple-300/80 mt-1">{plan.description}</p>
                )}
                <div className="my-3">
                  <span className="text-3xl font-black text-white font-display">
                    ${plan.priceUsd ? plan.priceUsd.toFixed(2) : (plan.price ? Number(plan.price).toFixed(2) : '14.99')}
                  </span>
                  <span className="text-xs text-purple-300 ml-1">/ {plan.billingCycle} (USD)</span>
                </div>
                <ul className="space-y-2 text-xs text-purple-200">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-pink-400" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setMonetizationOpen(false);
                  openPayFastCheckout(plan);
                }}
                className="mt-6 w-full py-2.5 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Instant VIP Checkout</span>
              </button>
            </div>
          ))}
        </div>

        {/* Ala Carte Boost Option - Paid Feature */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-900/20 to-pink-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Instant City Spotlight Boost</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  $2.99 USD
                </span>
              </div>
              <div className="text-[11px] text-purple-200/70">
                Put your profile in front of singles in your city for 30 minutes with 10x visibility.
              </div>
            </div>
          </div>

          {(currentUser.boostsRemaining || 0) > 0 ? (
            <button
              onClick={() => {
                setMonetizationOpen(false);
                activateBoost();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs whitespace-nowrap shadow-md transition-colors"
            >
              Activate Boost ({currentUser.boostsRemaining} Left)
            </button>
          ) : (
            <button
              onClick={() => {
                setMonetizationOpen(false);
                const boostPlan = subscriptionPlans.find((p) => p.id === 'plan-boost') || {
                  id: 'plan-boost',
                  name: 'Instant Spotlight Boost',
                  priceUsd: 2.99,
                  priceZar: 49,
                  billingCycle: 'one-time',
                  description: '10x profile visibility in your city for 30 minutes. Be seen first by active matches.',
                  features: ['10x card placement', '30 minutes spotlight', 'Direct gateway checkout'],
                  isActive: true,
                };
                openPayFastCheckout(boostPlan);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs whitespace-nowrap shadow-md transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-gray-950" />
              <span>Buy Boost ($2.99)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
