import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Compass,
  Briefcase,
  GraduationCap,
  Heart,
  Sliders,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { ALL_INTEREST_TAGS, PROMPT_QUESTIONS_CATALOG, AFRICAN_COUNTRIES } from '../../data/mockData';
import { Gender, SexualOrientation } from '../../types';

export const ProfileEditor: React.FC = () => {
  const { currentUser, updateCurrentUser, verifySelfie, showToast, logoutUser, authUser } = useApp();

  const [isSelfieVerifying, setIsSelfieVerifying] = useState<boolean>(false);
  const [selfieCountdown, setSelfieCountdown] = useState<number>(3);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number>(0);

  // Calculate completeness
  const calculateCompleteness = () => {
    let score = 0;
    if (currentUser.name) score += 10;
    if (currentUser.photos.length >= 1) score += 20;
    if (currentUser.photos.length >= 3) score += 15;
    if (currentUser.bio && currentUser.bio.length > 20) score += 15;
    if (currentUser.prompts.length >= 2) score += 15;
    if (currentUser.interests.length >= 4) score += 15;
    if (currentUser.verified) score += 10;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  const handleStartVerification = () => {
    setIsSelfieVerifying(true);
    setSelfieCountdown(3);
    const interval = setInterval(() => {
      setSelfieCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSelfieVerifying(false);
          verifySelfie();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAddSamplePhoto = () => {
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    ];
    const available = sampleAvatars.filter((url) => !currentUser.photos.includes(url));
    if (available.length > 0) {
      updateCurrentUser({ photos: [...currentUser.photos, available[0]] });
    } else {
      showToast('Maximum Photos', 'You have already added multiple high-resolution profile photos.');
    }
  };

  const handleRemovePhoto = (idx: number) => {
    if (currentUser.photos.length <= 1) {
      showToast('Photo Required', 'Profiles require at least 1 verified photo.');
      return;
    }
    const updated = currentUser.photos.filter((_, i) => i !== idx);
    updateCurrentUser({ photos: updated });
  };

  const handlePromptChange = (idx: number, question: string, answer: string) => {
    const updated = [...currentUser.prompts];
    if (updated[idx]) {
      updated[idx] = { ...updated[idx], question, answer };
      updateCurrentUser({ prompts: updated });
    }
  };

  return (
    <div className="flex-1 h-full bg-[radial-gradient(circle_at_50%_20%,#190a2e_0%,#050208_100%)] text-slate-100 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Edit Your Profile
            </h1>
            <p className="text-xs text-purple-300/80 mt-1">
              Curate your photos, prompts, inclusive identity, and privacy controls.
            </p>
          </div>

          {/* Selfie verification trigger */}
          {currentUser.verified ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>Identity Verified</span>
            </div>
          ) : (
            <button
              id="start-selfie-verification-btn"
              onClick={handleStartVerification}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-fiffy-btn text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 transition-transform"
            >
              <Camera className="w-4 h-4" />
              <span>Verify Selfie (Get Blue Badge)</span>
            </button>
          )}
        </div>

        {/* PROFILE COMPLETENESS METER */}
        <div className="p-5 rounded-3xl bg-[#0e061d]/85 backdrop-blur-xl border border-white/10 space-y-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="font-display font-bold text-sm text-white">
                Profile Completeness: {completeness}%
              </span>
            </div>
            <span className="text-xs font-semibold text-pink-400">
              {completeness === 100 ? 'All Set for Matches!' : 'Add Prompts for 2.4x More Sparks'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-[#16092d] overflow-hidden border border-white/10">
            <div
              className="h-full gradient-fiffy transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>

          {completeness < 100 && (
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-purple-300/80">
              {!currentUser.verified && <span>&bull; Complete selfie verification (+10%)</span>}
              {currentUser.photos.length < 3 && <span>&bull; Add 3+ photos (+15%)</span>}
              {currentUser.interests.length < 4 && <span>&bull; Pick 4+ interest tags (+15%)</span>}
            </div>
          )}
        </div>

        {/* 1. PHOTO GRID (6 Slots) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">
              Photos ({currentUser.photos.length}/6)
            </h3>
            <span className="text-xs text-purple-300/70">
              First photo is your main discovery card
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {(currentUser.photos || []).map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#140828]/80 border border-white/10 group shadow-md"
              >
                <img
                  src={url}
                  alt={`Photo ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-pink-600 text-white text-[9px] font-extrabold uppercase">
                    Main
                  </span>
                )}
                <button
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {currentUser.photos.length < 6 && (
              <button
                onClick={handleAddSamplePhoto}
                className="aspect-[3/4] rounded-2xl border-2 border-dashed border-purple-500/40 hover:border-pink-500 bg-[#140828]/40 hover:bg-[#1f0a38] flex flex-col items-center justify-center text-purple-300 hover:text-white transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-950/80 group-hover:bg-pink-600/30 flex items-center justify-center mb-1 transition-colors">
                  <Plus className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-xs font-semibold">Add Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. INCLUSIVE IDENTITY & ORIENTATION */}
        <div className="p-6 rounded-3xl bg-[#0e061d]/85 backdrop-blur-xl border border-white/10 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span>Inclusive Gender &amp; Preferences</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
                My Gender Identity
              </label>
              <select
                value={currentUser.gender}
                onChange={(e) => updateCurrentUser({ gender: e.target.value as Gender })}
                className="w-full p-3 rounded-xl bg-[#16092d]/80 border border-white/10 text-purple-100 text-xs font-semibold focus:outline-none focus:border-pink-500"
              >
                <option value="woman">Woman</option>
                <option value="man">Man</option>
                <option value="non-binary">Non-Binary</option>
                <option value="genderfluid">Genderfluid</option>
                <option value="agender">Agender</option>
                <option value="transgender">Transgender</option>
                <option value="other">Other / Self-Described</option>
              </select>
            </div>

            {/* Sexual Orientation */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
                Sexual Orientation
              </label>
              <select
                value={currentUser.orientation}
                onChange={(e) => updateCurrentUser({ orientation: e.target.value as SexualOrientation })}
                className="w-full p-3 rounded-xl bg-[#16092d]/80 border border-white/10 text-purple-100 text-xs font-semibold focus:outline-none focus:border-pink-500"
              >
                <option value="straight">Straight</option>
                <option value="gay">Gay</option>
                <option value="lesbian">Lesbian</option>
                <option value="bisexual">Bisexual</option>
                <option value="pansexual">Pansexual</option>
                <option value="queer">Queer</option>
                <option value="asexual">Asexual</option>
                <option value="questioning">Questioning</option>
              </select>
            </div>
          </div>

          {/* Show Me Preference */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
              Show Me in Discovery
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['everyone', 'women', 'men', 'non-binary'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateCurrentUser({ showMe: opt })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    currentUser.showMe === opt
                      ? 'bg-pink-600/30 border-pink-500 text-white'
                      : 'bg-[#16092d]/60 border-white/10 text-purple-300 hover:border-purple-500/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2.5 LOCATION & GLOBAL MATCH PREFERENCES */}
        <div className="p-6 rounded-3xl bg-[#0e061d]/85 backdrop-blur-xl border border-white/10 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-pink-400" />
            <span>Global African Location &amp; Match Preferences</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
                My Country
              </label>
              <select
                value={currentUser.country || 'South Africa'}
                onChange={(e) => {
                  const countryName = e.target.value;
                  const countryItem = AFRICAN_COUNTRIES.find((c) => c.name === countryName);
                  updateCurrentUser({
                    country: countryName,
                    countryFlag: countryItem?.flag || '🌍',
                    location: `${currentUser.city || 'Cape Town'}, ${countryName}`,
                  });
                }}
                className="w-full p-3 rounded-xl bg-[#16092d]/80 border border-white/10 text-purple-100 text-xs font-semibold focus:outline-none focus:border-pink-500"
              >
                {AFRICAN_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
                City / Region
              </label>
              <input
                type="text"
                value={currentUser.city || 'Johannesburg'}
                onChange={(e) => {
                  const city = e.target.value;
                  updateCurrentUser({
                    city,
                    location: `${city}, ${currentUser.country || 'South Africa'}`,
                  });
                }}
                placeholder="e.g. Sandton, Lagos, Nairobi, Accra"
                className="w-full p-2.5 rounded-xl bg-[#16092d]/80 border border-white/10 text-purple-100 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
              Preferred Matches From Other African Countries
            </label>
            <p className="text-[11px] text-purple-200/70 mb-2">
              Select nations you are eager to connect with, whether for cross-border dating, travel companionship, or diaspora connections:
            </p>
            <div className="flex flex-wrap gap-2">
              {AFRICAN_COUNTRIES.map((c) => {
                const isSelected = (currentUser.preferredCountries || []).includes(c.name);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      const current = currentUser.preferredCountries || [];
                      const updated = isSelected
                        ? current.filter((item) => item !== c.name)
                        : [...current, c.name];
                      updateCurrentUser({ preferredCountries: updated });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      isSelected
                        ? 'gradient-fiffy text-white border-pink-500 shadow-md shadow-pink-500/20'
                        : 'bg-[#16092d]/60 text-purple-300 border-white/10 hover:border-pink-500/30'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. BIO & LIFESTYLE */}
        <div className="p-6 rounded-3xl bg-[#0e061d]/85 backdrop-blur-xl border border-white/10 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="font-display font-bold text-base text-white">
            Bio &amp; Lifestyle Details
          </h3>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
              About You
            </label>
            <textarea
              rows={3}
              value={currentUser.bio}
              onChange={(e) => updateCurrentUser({ bio: e.target.value })}
              placeholder="Tell others what you love doing, quirky habits, or what you're looking for..."
              className="w-full p-3 rounded-xl bg-[#16092d]/80 border border-white/10 text-purple-100 text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
                Profession / Job
              </label>
              <input
                type="text"
                value={currentUser.job}
                onChange={(e) => updateCurrentUser({ job: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#16092d]/80 border border-white/10 text-purple-100 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
                Company / Studio
              </label>
              <input
                type="text"
                value={currentUser.company || ''}
                onChange={(e) => updateCurrentUser({ company: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#16092d]/80 border border-white/10 text-purple-100 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
                Education
              </label>
              <input
                type="text"
                value={currentUser.education}
                onChange={(e) => updateCurrentUser({ education: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#16092d]/80 border border-white/10 text-purple-100 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* 4. ICEBREAKER PROMPTS */}
        <div className="p-6 rounded-3xl bg-[#0e061d]/85 backdrop-blur-xl border border-white/10 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Icebreaker Prompts</span>
            </h3>
            <span className="text-xs text-pink-300 font-semibold">Great conversation starters</span>
          </div>

          <div className="space-y-4">
            {(currentUser.prompts || []).map((p, idx) => (
              <div key={p.id || idx} className="p-4 rounded-2xl bg-[#15082a]/70 border border-white/10 space-y-2">
                <select
                  value={p.question}
                  onChange={(e) => handlePromptChange(idx, e.target.value, p.answer)}
                  className="w-full p-2 rounded-xl bg-[#200c3a] border border-white/10 text-xs font-bold text-pink-300 focus:outline-none focus:border-pink-500"
                >
                  {PROMPT_QUESTIONS_CATALOG.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>

                <textarea
                  rows={2}
                  value={p.answer}
                  onChange={(e) => handlePromptChange(idx, p.question, e.target.value)}
                  placeholder="Your witty or honest answer..."
                  className="w-full p-2.5 rounded-xl bg-[#120625] border border-white/10 text-xs text-purple-100 placeholder:text-purple-400/40 focus:outline-none focus:border-pink-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 5. PASSIONS & INTERESTS */}
        <div className="p-6 rounded-3xl bg-[#0e061d]/85 backdrop-blur-xl border border-white/10 space-y-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="font-display font-bold text-base text-white">
            Interests &amp; Tags ({currentUser.interests.length} selected)
          </h3>
          <p className="text-xs text-purple-300/80">Select at least 4 passions to match with like-minded sparks.</p>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
            {ALL_INTEREST_TAGS.map((tag) => {
              const isSelected = currentUser.interests.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const updated = isSelected
                      ? currentUser.interests.filter((t) => t !== tag)
                      : [...currentUser.interests, tag];
                    updateCurrentUser({ interests: updated });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-pink-600 text-white border-pink-400 shadow-sm shadow-pink-500/30'
                      : 'bg-[#16092d]/70 text-purple-300 border-white/10 hover:border-purple-500/40'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. PRIVACY & SAFETY CONTROLS */}
        <div className="p-6 rounded-3xl bg-[#0e061d]/85 backdrop-blur-xl border border-white/10 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-pink-400" />
            <span>Privacy &amp; Visibility Controls</span>
          </h3>

          <div className="space-y-3">
            {/* Incognito */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#15082a]/70 border border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Incognito Browsing</div>
                <div className="text-[11px] text-purple-300">Only people you have liked will be able to see your profile</div>
              </div>
              <input
                type="checkbox"
                checked={currentUser.incognito}
                onChange={(e) => updateCurrentUser({ incognito: e.target.checked })}
                className="w-4 h-4 accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Hide Age */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#15082a]/70 border border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Hide Age</div>
                <div className="text-[11px] text-purple-300">Don&apos;t display your numerical age on your discovery card</div>
              </div>
              <input
                type="checkbox"
                checked={currentUser.hideAge}
                onChange={(e) => updateCurrentUser({ hideAge: e.target.checked })}
                className="w-4 h-4 accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Read Receipts */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#15082a]/70 border border-white/10">
              <div>
                <div className="text-xs font-bold text-white">Send Read Receipts</div>
                <div className="text-[11px] text-purple-300">Let matches know when you have seen their chat messages</div>
              </div>
              <input
                type="checkbox"
                checked={currentUser.readReceipts}
                onChange={(e) => updateCurrentUser({ readReceipts: e.target.checked })}
                className="w-4 h-4 accent-pink-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Account & Session Sign Out */}
        <div className="p-6 rounded-3xl bg-[#0e061d]/85 backdrop-blur-xl border border-white/10 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-pink-400" />
            <span>Account &amp; Security</span>
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#15082a]/70 border border-white/10">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Active Account Session</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Secured
                </span>
              </div>
              <div className="text-[11px] text-purple-200 mt-0.5">
                Signed in as <strong className="text-white">{currentUser.name}</strong>
              </div>
              <div className="text-[11px] text-pink-300/90 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3 text-pink-400 shrink-0" />
                <span>Contact number and email are 100% confidential and hidden from everyone.</span>
              </div>
            </div>
            <button
              id="profile-logout-btn"
              type="button"
              onClick={logoutUser}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* SELFIE VERIFICATION OVERLAY MODAL */}
      {isSelfieVerifying && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-[#120625]/95 backdrop-blur-2xl rounded-3xl border border-pink-500/40 p-6 text-center space-y-4 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,42,133,0.2)]">
            <div className="w-20 h-20 rounded-full bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center mx-auto text-3xl font-black text-white animate-pulse">
              {selfieCountdown}
            </div>
            <h3 className="font-display font-bold text-xl text-white">
              Selfie Match Verification
            </h3>
            <p className="text-xs text-purple-300 leading-relaxed">
              Align your face with the camera frame. Generating biometric proof for your verified blue badge...
            </p>
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-pink-500/80 mx-auto relative shadow-2xl">
              <img
                src={currentUser.photos[0]}
                alt="Selfie"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale"
              />
              <div className="absolute inset-0 border-4 border-dashed border-sky-400 animate-spin" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
