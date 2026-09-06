import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  Sparkles,
  ShieldCheck,
  Zap,
  MapPin,
  Check,
  Flame,
  ArrowRight,
  Globe,
  Lock,
  CreditCard,
  UserPlus,
} from 'lucide-react';
import { AFRICAN_COUNTRIES } from '../../data/mockData';

export const MarketingLanding: React.FC = () => {
  const {
    setActiveSurface,
    setInAppTab,
    deckProfiles,
    subscriptionPlans,
    openPayFastCheckout,
    openAuthModal,
    authUser,
    testimonials,
  } = useApp();

  // One cannot be on the marketing page unless logged out or landed there without logged in
  React.useEffect(() => {
    if (authUser) {
      setActiveSurface('web-app');
      setInAppTab('discover');
    }
  }, [authUser, setActiveSurface, setInAppTab]);

  const [activeCountry, setActiveCountry] = useState<string>('South Africa');

  return (
    <div className="min-h-screen bg-[#07030d] text-slate-100 overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-pink-900/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-8 pb-16 md:py-20 px-4 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Bold Tagline & Value Props */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-300 text-xs font-semibold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Global Matchmaking &bull; Connecting African Singles Everywhere in the World</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.08]">
                Real Chemistry. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-pink-500">
                  African Hearts Worldwide.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-purple-200/80 max-w-2xl font-normal leading-relaxed">
                Fiffy&apos;s brings together singles across Africa, the UK, North America, Europe, and the global diaspora. Whether you&apos;re in Johannesburg, London, Lagos, New York, Nairobi, Toronto, Accra, or Paris &mdash; find authentic connection, shared culture, and verified chemistry.
              </p>

              {/* Primary Call to Action buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="hero-launch-deck-btn"
                  onClick={() => {
                    setActiveSurface('web-app');
                    setInAppTab('discover');
                  }}
                  className="px-7 py-3.5 rounded-full text-base font-bold gradient-fiffy-btn text-white shadow-xl shadow-pink-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Flame className="w-5 h-5 fill-white text-white" />
                  <span>Start Matching Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {!authUser && (
                  <button
                    id="hero-signup-btn"
                    onClick={() => openAuthModal('signup')}
                    className="px-6 py-3.5 rounded-full text-base font-semibold bg-[#1a0f2b] hover:bg-[#25153e] text-purple-200 hover:text-white border border-purple-700/50 flex items-center gap-2 transition-all shadow-md"
                  >
                    <UserPlus className="w-5 h-5 text-pink-400" />
                    <span>Create Free Account</span>
                  </button>
                )}
              </div>

              {/* Countries quick banner */}
              <div className="pt-4 border-t border-purple-900/40">
                <p className="text-xs uppercase tracking-wider text-purple-400/80 font-semibold mb-3">
                  Singles Active Across 16+ Global Hubs &bull; Africa &amp; Diaspora
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {AFRICAN_COUNTRIES.slice(0, 10).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setActiveCountry(c.name);
                        setActiveSurface('web-app');
                        setInAppTab('discover');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#140b22] border border-purple-800/50 hover:border-pink-500/40 text-xs font-semibold text-purple-200 transition-colors"
                    >
                      <span className="text-base">{c.flag}</span>
                      <span>{c.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Profile Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-[#130726] border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(255,42,133,0.2)] p-2">
                <div className="relative h-[480px] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80"
                    alt="African Single"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d051c] via-[#0d051c]/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 shadow">
                      <span>🇿🇦</span>
                      <span>Johannesburg, SA</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1 shadow">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  </div>

                  {/* Bottom Bio */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-display font-extrabold text-2xl">Zola, 27</h3>
                    <p className="text-xs text-pink-300 font-medium mt-0.5">Fashion Curator &bull; Rosebank</p>
                    <p className="text-xs text-gray-200 mt-2 bg-black/40 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                      &ldquo;Looking for someone to explore Cape Town galleries with, share rooibos tea, and have deep conversations.&rdquo;
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setActiveSurface('web-app');
                          setInAppTab('discover');
                        }}
                        className="flex-1 py-2 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-lg"
                      >
                        Spark Match
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PILLARS SECTION */}
        <section className="py-16 px-4 max-w-7xl mx-auto border-t border-purple-900/30">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
              Why Fiffy&apos;s Match Making Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-2">
              Designed for Authentic African Connections Everywhere
            </h2>
            <p className="text-sm text-purple-200/75 mt-2">
              Every detail is engineered to foster genuine chemistry across continents without superficial swiping fatigue.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#120721] border border-purple-800/40">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Global African Passport</h3>
              <p className="text-xs text-purple-200/80 mt-2 leading-relaxed">
                Connect seamlessly with singles in your city or meet ambitious people across London, Atlanta, Johannesburg, Toronto, Lagos, Paris, Accra, and Nairobi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#120721] border border-purple-800/40">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">100% Anti-Catfish Safety</h3>
              <p className="text-xs text-purple-200/80 mt-2 leading-relaxed">
                Selfie verification with facial biometrics guarantees the person behind the screen matches their photos. Zero bots or fraudulent profiles.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#120721] border border-purple-800/40">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Seamless Global Payments</h3>
              <p className="text-xs text-purple-200/80 mt-2 leading-relaxed">
                Upgrade with ease using local and international payment methods: Debit/Credit Cards (Visa, Mastercard), Instant Bank Transfer, and digital mobile banking.
              </p>
            </div>
          </div>
        </section>

        {/* REAL STORIES / TESTIMONIALS - ONLY SHOWN WHEN TESTIMONIES/COMMENTS EXIST */}
        {(() => {
          const activeTestimonials = (testimonials || []).filter((item) => {
            if (!item) return false;
            if (item.status && item.status !== 'published') return false;
            const comment = (item.story || item.quote || item.storyDetails || '').trim();
            return comment.length > 0;
          });

          if (activeTestimonials.length === 0) {
            return null;
          }

          return (
            <section id="community-testimonials-section" className="py-16 px-4 max-w-7xl mx-auto border-t border-purple-900/30">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
                  True African Love Stories Worldwide
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-2">
                  Crossed Borders. Found Sparks.
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {activeTestimonials.slice(0, 3).map((item) => {
                  const storyText = item.story || item.quote || item.storyDetails || '';
                  const locationText = item.location || item.locations || item.country || 'Global Diaspora';
                  const mainPhoto = item.userPhoto || item.photoUrl || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80';
                  const partnerPhoto = item.partnerPhoto;
                  const dateText = item.weddingDate || item.metDate || 'Matched on Fiffy';

                  return (
                    <div key={item.id} className="p-6 rounded-2xl bg-[#120721] border border-purple-800/40 flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex -space-x-2 shrink-0">
                            <img
                              src={mainPhoto}
                              alt={item.coupleNames}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-full object-cover border-2 border-pink-500 shadow"
                            />
                            {partnerPhoto && (
                              <img
                                src={partnerPhoto}
                                alt={item.coupleNames}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shadow"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm font-display">{item.coupleNames}</h4>
                            <p className="text-xs text-pink-400 font-medium">{locationText}</p>
                          </div>
                        </div>
                        <p className="text-xs text-purple-200/85 italic leading-relaxed">
                          &ldquo;{storyText}&rdquo;
                        </p>
                      </div>
                      {item.status && (
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-purple-300/70">
                          <span>{dateText}</span>
                          <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30 capitalize">
                            {item.status}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* PRICING SECTION - SUBSCRIPTIONS SOURCED DIRECTLY FROM ADMIN PORTAL */}
        <section className="py-16 px-4 max-w-7xl mx-auto border-t border-purple-900/30">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
              Transparent Membership Tiers
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-2">
              Accelerate Your Matches with VIP
            </h2>
            <p className="text-sm text-purple-200/75 mt-2">
              Instant subscription activation with bank-grade security. Manage your plan anytime or cancel with one click.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Free Tier */}
            <div className="p-7 rounded-3xl bg-[#120721] border border-purple-800/50 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white font-display">Fiffy Free</h3>
                <p className="text-xs text-purple-300/80 mt-1">Core authentic dating experience</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-white font-display">R 0</span>
                  <span className="text-xs text-purple-300 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs text-purple-200/90">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>50 Swipes per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Unlimited chat with mutual matches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Selfie identity verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Emergency Date Share Safety</span>
                  </li>
                </ul>
              </div>
              <button
                id="pricing-free-btn"
                onClick={() => {
                  if (!authUser) openAuthModal('signup');
                  else {
                    setActiveSurface('web-app');
                    setInAppTab('discover');
                  }
                }}
                className="mt-8 w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
              >
                {authUser ? 'Already Active' : 'Start Free Today'}
              </button>
            </div>

            {/* Admin-Managed Plans rendered from backend */}
            {subscriptionPlans.filter((p) => p.id !== 'plan-boost' && p.billingCycle !== 'one-time').map((plan) => (
              <div
                key={plan.id}
                className={`p-7 rounded-3xl bg-[#120721] border flex flex-col justify-between relative ${
                  plan.isPopular ? 'border-pink-500 shadow-xl shadow-pink-500/15 ring-1 ring-pink-500' : 'border-purple-800/50'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold gradient-fiffy text-white shadow-lg tracking-wider uppercase">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white font-display">{plan.name}</h3>
                  <p className="text-xs text-purple-300/80 mt-1">
                    {plan.description ||
                      (plan.name.toLowerCase().includes('plus')
                        ? 'Essential upgrades for active singles seeking romance in their city'
                        : 'Cross-border passport matching across Africa and the diaspora')}
                  </p>
                  <div className="my-6">
                    <span className="text-4xl font-black text-white font-display">
                      ${plan.priceUsd ? Number(plan.priceUsd).toFixed(2) : Number(plan.price).toFixed(2)}
                    </span>
                    <span className="text-xs text-purple-300 ml-1">USD / {plan.billingCycle}</span>
                  </div>
                  <ul className="space-y-3 text-xs text-purple-200/90">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  id={`pricing-vip-plan-${plan.id}`}
                  onClick={() => openPayFastCheckout(plan)}
                  className="mt-8 w-full py-3 rounded-2xl gradient-fiffy text-white font-bold text-xs shadow-lg shadow-pink-500/25 hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Get Instant VIP Access</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 px-4 border-t border-purple-900/40 bg-[#050209] text-xs text-purple-300/70 text-center">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg gradient-fiffy flex items-center justify-center">
                <Heart className="w-3 h-3 text-white fill-white" />
              </div>
              <span className="font-bold text-white font-display">Fiffy&apos;s Match Making</span>
              <span className="text-[10px] text-pink-400 font-semibold">&bull; Africans Everywhere in the World</span>
            </div>

            <div>
              &copy; {new Date().getFullYear()} Fiffy&apos;s Inc. All rights reserved. Secure 256-Bit Encrypted Payments.
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => { setActiveSurface('web-app'); setInAppTab('discover'); }} className="hover:text-white underline">
                Discover Deck
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
