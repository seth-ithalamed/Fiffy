import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import {
  Heart,
  X,
  Star,
  RotateCcw,
  Zap,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  ShieldCheck,
  Info,
  Grid,
  Layers,
  Sparkles,
  Globe,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { ALL_INTEREST_TAGS, AFRICAN_COUNTRIES } from '../../data/mockData';
import { maskContactInfo } from '../../lib/privacy';

export const DiscoveryView: React.FC = () => {
  const {
    activeCard,
    currentCardIndex,
    filteredProfiles,
    handleSwipe,
    undoLastSwipe,
    canUndo,
    filters,
    updateFilters,
    viewMode,
    setViewMode,
    setInspectedProfile,
    currentUser,
    subscriptionPlans,
    openPayFastCheckout,
    setMonetizationOpen,
  } = useApp();

  const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;

  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);
  const [photoIndex, setPhotoIndex] = useState<number>(0);

  // Motion drag values for swipe gesture
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  const onDragEnd = (_: any, info: any) => {
    if (info.offset.x > 120) {
      handleSwipe('like', activeCard || undefined);
    } else if (info.offset.x < -120) {
      handleSwipe('pass', activeCard || undefined);
    } else if (info.offset.y < -120) {
      handleSwipe('superlike', activeCard || undefined);
    }
  };

  const nextPhoto = (e: React.MouseEvent, max: number) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % max);
  };

  const prevPhoto = (e: React.MouseEvent, max: number) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + max) % max);
  };

  const handleCountryFilterClick = (countryName: string) => {
    updateFilters({ targetCountry: countryName });
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[radial-gradient(circle_at_50%_35%,#1a0b2e_0%,#050208_100%)] text-slate-100 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between z-20 bg-[#0e061d]/85 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {/* View mode toggle: Swipe vs Grid */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#160a2d]/80 border border-white/10">
            <button
              id="view-mode-swipe"
              onClick={() => setViewMode('swipe')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'swipe'
                  ? 'gradient-fiffy text-white shadow-md shadow-pink-500/30'
                  : 'text-purple-300 hover:text-white'
              }`}
              title="Card Swipe Mode"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              id="view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'gradient-fiffy text-white shadow-md shadow-pink-500/30'
                  : 'text-purple-300 hover:text-white'
              }`}
              title="Grid Browse Mode"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Browse</span>
            </button>
          </div>

          <span className="text-xs text-purple-300/80 font-medium">
            {filteredProfiles.length} Singles in {filters.targetCountry === 'all' ? 'All Countries' : filters.targetCountry}
          </span>
        </div>

        {/* Filter Trigger */}
        <div className="flex items-center gap-2">
          <button
            id="open-filters-drawer-btn"
            onClick={() => setShowFiltersDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#160a2d]/80 hover:bg-[#200e3d] text-purple-200 hover:text-white text-xs font-semibold border border-white/10 hover:border-pink-500/40 transition-colors shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
            <span>Preferences</span>
            {filters.targetCountry !== 'all' && (
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* QUICK COUNTRY PREFERENCE BAR */}
      <div className="px-4 py-2 bg-[#120626]/70 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-10">
        <span className="text-[11px] font-bold text-purple-300/70 shrink-0 uppercase tracking-wider flex items-center gap-1 pr-1">
          <Globe className="w-3 h-3 text-pink-400" />
          <span>Country:</span>
        </span>

        <button
          id="country-pill-all"
          type="button"
          onClick={() => handleCountryFilterClick('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filters.targetCountry === 'all'
              ? 'gradient-fiffy text-white shadow-sm shadow-pink-500/30'
              : 'bg-white/5 text-purple-200/80 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          🌍 All African Nations
        </button>

        {AFRICAN_COUNTRIES.map((c) => {
          const isSelected = filters.targetCountry.toLowerCase() === c.name.toLowerCase();
          return (
            <button
              key={c.code}
              id={`country-pill-${c.code.toLowerCase()}`}
              type="button"
              onClick={() => handleCountryFilterClick(c.name)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                isSelected
                  ? 'gradient-fiffy text-white shadow-sm shadow-pink-500/30'
                  : 'bg-white/5 text-purple-200/80 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-3 md:p-6">
        {/* Free Tier Notice Banner to prompt upgrade */}
        {isFreeTier && (
          <div className="w-full max-w-sm sm:max-w-md mb-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/15 to-pink-500/10 border border-pink-500/30 text-pink-200 text-xs flex items-center justify-between shadow-sm z-20">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-[11px]">Free Plan: Profile View Only</span>
            </div>
            <button
              onClick={() => setMonetizationOpen(true)}
              className="px-2.5 py-0.5 rounded-full gradient-fiffy text-white font-bold text-[10px] shadow hover:brightness-110"
            >
              Upgrade to Match
            </button>
          </div>
        )}

        {viewMode === 'swipe' ? (
          /* SWIPE CARDS CONTAINER */
          <div className="relative w-full max-w-sm sm:max-w-md h-[560px] flex items-center justify-center">
            {activeCard ? (
              <AnimatePresence>
                <motion.div
                  key={activeCard.id}
                  style={{ x, rotate }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={onDragEnd}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,42,133,0.15)] bg-[#140827]/90 border border-white/15 select-none flex flex-col justify-between"
                >
                  {/* Photo with Carousel tap zones */}
                  <div className="relative w-full h-full">
                    <img
                      src={activeCard.photos[photoIndex % activeCard.photos.length]}
                      alt={activeCard.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover pointer-events-none"
                    />

                    {/* Top Photo indicator pills */}
                    <div className="absolute top-3 left-4 right-4 flex gap-1 z-30 pointer-events-none">
                      {(activeCard.photos || []).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            idx === photoIndex % (activeCard.photos?.length || 1) ? 'bg-white' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Tap left/right to change photo */}
                    <div
                      onClick={(e) => prevPhoto(e, activeCard.photos.length)}
                      className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
                      title="Previous photo"
                    />
                    <div
                      onClick={(e) => nextPhoto(e, activeCard.photos.length)}
                      className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer"
                      title="Next photo"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090412] via-[#090412]/30 to-transparent pointer-events-none z-10" />

                    {/* LIKE STAMP */}
                    <motion.div
                      style={{ opacity: likeOpacity }}
                      className={`absolute top-8 left-6 z-30 border-4 ${
                        isFreeTier
                          ? 'border-amber-400 text-amber-300'
                          : 'border-emerald-400 text-emerald-400'
                      } px-4 py-1 rounded-2xl font-black text-xl sm:text-2xl rotate-[-16deg] uppercase tracking-wider pointer-events-none`}
                    >
                      {isFreeTier ? 'UPGRADE TO LIKE 🔒' : 'LIKE 💖'}
                    </motion.div>

                    {/* NOPE STAMP */}
                    <motion.div
                      style={{ opacity: nopeOpacity }}
                      className="absolute top-8 right-6 z-30 border-4 border-rose-500 text-rose-500 px-4 py-1 rounded-2xl font-black text-2xl rotate-[16deg] uppercase tracking-wider pointer-events-none"
                    >
                      PASS ✕
                    </motion.div>

                    {/* Top Badges: Country Flag & Verification */}
                    <div className="absolute top-7 left-4 z-20 flex items-center gap-1.5 pointer-events-none">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow-lg">
                        <span className="text-base">{activeCard.countryFlag || '🌍'}</span>
                        <span>{activeCard.country || 'South Africa'}</span>
                      </div>

                      {activeCard.verified && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-[11px] font-bold shadow">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Profile Information Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                              {activeCard.name}, {activeCard.age}
                            </h2>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-purple-200/90 font-medium mt-1">
                            <span className="flex items-center gap-1 text-pink-300">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{activeCard.location || activeCard.city}</span>
                            </span>
                            {activeCard.job && (
                              <span className="flex items-center gap-1 text-gray-300">
                                • <Briefcase className="w-3 h-3 text-purple-400" />
                                {activeCard.job}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info Button to Open Full Modal */}
                        <button
                          id="open-inspected-profile-btn"
                          onClick={() => setInspectedProfile(activeCard)}
                          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-colors"
                          title="View Full Profile"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Bio or Prompt Answer Preview */}
                      <p className="text-xs text-slate-200/90 mt-2.5 line-clamp-2 leading-relaxed bg-black/50 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                        &ldquo;{maskContactInfo(activeCard.prompts[0]?.answer || activeCard.bio)}&rdquo;
                      </p>

                      {/* Interests Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {(activeCard.interests || []).slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                        {activeCard.interests && activeCard.interests.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-purple-200">
                            +{activeCard.interests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              /* EMPTY DECK STATE */
              <div
                id="empty-deck-card"
                className="w-full max-w-sm p-8 rounded-3xl bg-[#140827]/90 border border-white/10 text-center shadow-2xl flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-4">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-display text-white">No More Singles in {filters.targetCountry === 'all' ? 'this filter' : filters.targetCountry}</h3>
                <p className="text-xs text-purple-200/70 mt-2 max-w-xs">
                  Expand your horizons by viewing singles across all African countries, or adjust your age and dating preferences.
                </p>

                <div className="flex flex-col w-full gap-2 mt-6">
                  <button
                    id="show-all-countries-btn"
                    onClick={() => updateFilters({ targetCountry: 'all' })}
                    className="w-full py-2.5 rounded-2xl gradient-fiffy text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:brightness-110"
                  >
                    🌍 Explore All African Countries
                  </button>

                  <button
                    id="upgrade-crossborder-btn"
                    onClick={() => {
                      const gold = subscriptionPlans.find((p) => p.isPopular) || subscriptionPlans[0];
                      if (gold) openPayFastCheckout(gold);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-purple-200"
                  >
                    ✨ Unlock VIP Global African Passport
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* GRID VIEW MODE */
          <div className="w-full max-w-5xl h-full overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 pb-24">
              {(filteredProfiles || []).map((profile) => (
                <div
                  key={profile.id}
                  id={`profile-grid-item-${profile.id}`}
                  onClick={() => setInspectedProfile(profile)}
                  className="group relative rounded-2xl overflow-hidden bg-[#130726] border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer aspect-[3/4] shadow-lg"
                >
                  <img
                    src={profile.photos[0]}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Flag Tag */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                    {profile.countryFlag || '🇿🇦'} {profile.city || profile.location.split(',')[0]}
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-white">
                        {profile.name}, {profile.age}
                      </span>
                      {profile.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-purple-200/80 truncate mt-0.5">
                      {maskContactInfo(profile.job || profile.bio)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SWIPE CONTROLS ACTION DOCK (Visible in swipe mode) */}
        {viewMode === 'swipe' && activeCard && (
          <div className="mt-4 flex items-center justify-center gap-4 z-20">
            {/* Rewind / Undo */}
            <button
              id="swipe-undo-btn"
              onClick={undoLastSwipe}
              disabled={!canUndo}
              className="w-11 h-11 rounded-full bg-[#160a2d]/80 hover:bg-white/10 border border-white/10 text-amber-400 flex items-center justify-center shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Rewind last swipe"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Pass (Nope) */}
            <button
              id="swipe-pass-btn"
              onClick={() => handleSwipe('pass', activeCard)}
              className="w-14 h-14 rounded-full bg-[#1e0a24]/90 hover:bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:text-rose-300 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
              title="Pass"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Super Like */}
            <button
              id="swipe-superlike-btn"
              onClick={() => handleSwipe('superlike', activeCard)}
              className="relative w-12 h-12 rounded-full bg-[#0a182d]/90 hover:bg-sky-500/20 border border-sky-500/40 text-sky-400 hover:text-sky-300 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
              title={isFreeTier ? 'Super Like (VIP Upgrade Required)' : 'Super Like'}
            >
              <Star className="w-5 h-5 fill-sky-400" />
              {isFreeTier && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                  <Lock className="w-2.5 h-2.5" />
                </span>
              )}
            </button>

            {/* Like */}
            <button
              id="swipe-like-btn"
              onClick={() => handleSwipe('like', activeCard)}
              className="relative w-14 h-14 rounded-full gradient-fiffy text-white flex items-center justify-center shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all"
              title={isFreeTier ? 'Like & Match (VIP Upgrade Required)' : 'Like'}
            >
              <Heart className="w-7 h-7 fill-white" />
              {isFreeTier && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                  <Lock className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* PREFERENCES / FILTERS DRAWER */}
      {showFiltersDrawer && (
        <div
          id="filters-drawer-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div
            id="filters-drawer-content"
            className="w-full max-w-md bg-[#130726] border border-white/15 rounded-3xl p-6 shadow-2xl text-white max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-pink-400" />
                <h3 className="font-bold text-base text-white">Discovery Preferences</h3>
              </div>
              <button
                id="close-filters-drawer-btn"
                onClick={() => setShowFiltersDrawer(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 pt-4">
              {/* Target Country */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-2">
                  Match Country Preference
                </label>
                <select
                  id="filter-country-select"
                  value={filters.targetCountry}
                  onChange={(e) => updateFilters({ targetCountry: e.target.value })}
                  className="w-full bg-[#1e1338] border border-white/10 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="all">🌍 All Countries (Global African Passport)</option>
                  {AFRICAN_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender Preference */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-2">
                  Show Me
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['everyone', 'women', 'men'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateFilters({ genderPreference: g })}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                        filters.genderPreference === g
                          ? 'gradient-fiffy text-white'
                          : 'bg-white/5 text-purple-200 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-purple-200 mb-2">
                  <span>Age Range</span>
                  <span className="text-pink-300 font-bold">
                    {filters.ageRange[0]} - {filters.ageRange[1]} years
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    min="18"
                    max="65"
                    value={filters.ageRange[1]}
                    onChange={(e) => updateFilters({ ageRange: [filters.ageRange[0], Number(e.target.value)] })}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>

              {/* Verified Only Switch */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-gray-200">Verified Profiles Only</span>
                </div>
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => updateFilters({ verifiedOnly: e.target.checked })}
                  className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
              </div>

              <button
                id="apply-filters-btn"
                type="button"
                onClick={() => setShowFiltersDrawer(false)}
                className="w-full py-3 rounded-2xl gradient-fiffy text-white font-bold text-xs shadow-lg shadow-pink-500/25"
              >
                Apply Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
