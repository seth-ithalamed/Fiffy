import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Heart,
  Star,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Music,
  Wine,
  Cigarette,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Ban,
  Share2,
  Lock,
} from 'lucide-react';

export const ProfileDetailModal: React.FC = () => {
  const {
    inspectedProfile,
    setInspectedProfile,
    handleSwipe,
    reportUser,
    blockUser,
    showToast,
    currentUser,
  } = useApp();

  const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;

  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [showReportDialog, setShowReportDialog] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('Inappropriate Photos');
  const [reportDetails, setReportDetails] = useState<string>('');

  if (!inspectedProfile) return null;

  const handleNext = () => {
    setActivePhotoIdx((prev) => (prev + 1) % inspectedProfile.photos.length);
  };

  const handlePrev = () => {
    setActivePhotoIdx((prev) => (prev - 1 + inspectedProfile.photos.length) % inspectedProfile.photos.length);
  };

  const submitReport = () => {
    reportUser(inspectedProfile.id, reportReason, reportDetails);
    setShowReportDialog(false);
    setInspectedProfile(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e061a]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,42,133,0.15)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button Top Right */}
        <button
          onClick={() => setInspectedProfile(null)}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          {/* Photos Header Carousel */}
          <div className="relative w-full h-[380px] bg-black">
            <img
              src={inspectedProfile.photos[activePhotoIdx]}
              alt={inspectedProfile.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />

            {/* Photo Indicators */}
            <div className="absolute top-3 left-4 right-14 flex gap-1 z-20">
              {(inspectedProfile.photos || []).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i === activePhotoIdx ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Arrows */}
            {inspectedProfile.photos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e071a] via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Details Content */}
          <div className="p-6 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-3xl text-white">
                  {inspectedProfile.name}, {inspectedProfile.age}
                </h2>
                {inspectedProfile.countryFlag && (
                  <span className="text-2xl" title={inspectedProfile.country}>
                    {inspectedProfile.countryFlag}
                  </span>
                )}
                {inspectedProfile.verified && (
                  <span className="p-1 rounded-full bg-emerald-500 text-white" title="Verified African Identity">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-purple-300/80 mt-1.5 font-medium">
                <span className="flex items-center gap-1 text-pink-300 font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  {inspectedProfile.location || inspectedProfile.city}
                  {inspectedProfile.country && ` • ${inspectedProfile.country}`}
                </span>
                {inspectedProfile.job && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    {inspectedProfile.job}
                  </span>
                )}
                {inspectedProfile.education && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                    {inspectedProfile.education}
                  </span>
                )}
              </div>

              {inspectedProfile.preferredCountries && inspectedProfile.preferredCountries.length > 0 && (
                <div className="mt-2 text-[11px] text-purple-200/70 flex items-center gap-1.5">
                  <span className="font-semibold text-pink-400">Open to connections in:</span>
                  <span>{inspectedProfile.preferredCountries.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {inspectedProfile.bio && (
              <div className="p-4 rounded-2xl bg-[#16082a]/70 border border-white/10">
                <h4 className="text-xs uppercase tracking-wider font-bold text-pink-400 mb-1.5">
                  About Me
                </h4>
                <p className="text-sm text-purple-100 leading-relaxed">
                  {inspectedProfile.bio}
                </p>
              </div>
            )}

            {/* Icebreaker Prompts */}
            {(inspectedProfile.prompts || []).map((prompt) => (
              <div
                key={prompt.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-[#1b0d32] to-[#120722] border border-pink-500/25 shadow-md"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{prompt.question}</span>
                </div>
                <p className="text-sm font-display font-medium text-white leading-relaxed">
                  &ldquo;{prompt.answer}&rdquo;
                </p>
              </div>
            ))}

            {/* Lifestyle & Vibe Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {inspectedProfile.datingGoal && (
                <div className="p-3 rounded-xl bg-[#15082a]/70 border border-white/10">
                  <div className="text-[10px] text-purple-400 uppercase font-bold">Looking For</div>
                  <div className="text-purple-100 font-semibold mt-0.5">{inspectedProfile.datingGoal}</div>
                </div>
              )}
              {inspectedProfile.starSign && (
                <div className="p-3 rounded-xl bg-[#15082a]/70 border border-white/10">
                  <div className="text-[10px] text-purple-400 uppercase font-bold">Star Sign</div>
                  <div className="text-purple-100 font-semibold mt-0.5">{inspectedProfile.starSign}</div>
                </div>
              )}
              {inspectedProfile.drinking && (
                <div className="p-3 rounded-xl bg-[#15082a]/70 border border-white/10 flex items-center gap-2">
                  <Wine className="w-4 h-4 text-pink-400" />
                  <div>
                    <div className="text-[10px] text-purple-400 uppercase font-bold">Drinking</div>
                    <div className="text-purple-100 font-semibold">{inspectedProfile.drinking}</div>
                  </div>
                </div>
              )}
              {inspectedProfile.spotifyTopArtist && (
                <div className="p-3 rounded-xl bg-[#15082a]/70 border border-white/10 flex items-center gap-2">
                  <Music className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-purple-400 uppercase font-bold">Soundtrack</div>
                    <div className="text-purple-100 font-semibold truncate">{inspectedProfile.spotifyTopArtist}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Interests Chips */}
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-purple-400 mb-2">
                Passions &amp; Interests
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(inspectedProfile.interests || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1e0a38]/80 text-purple-200 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Safety Actions: Report / Block */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                onClick={() => setShowReportDialog(true)}
                className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Profile</span>
              </button>

              <button
                onClick={() => {
                  blockUser(inspectedProfile.id);
                  setInspectedProfile(null);
                }}
                className="text-purple-400 hover:text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Block User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Buttons */}
        <div className="p-4 bg-[#0a0414]/90 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              handleSwipe('pass', inspectedProfile);
              setInspectedProfile(null);
            }}
            className="flex-1 py-3 rounded-2xl bg-[#18082a]/80 border border-rose-500/30 text-rose-300 font-bold text-sm hover:bg-rose-950/40 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>Pass</span>
          </button>

          <button
            onClick={() => {
              handleSwipe('superlike', inspectedProfile);
              if (!isFreeTier) setInspectedProfile(null);
            }}
            className="relative px-5 py-3 rounded-2xl bg-[#18082a]/80 border border-sky-500/40 text-sky-300 font-bold text-sm hover:bg-sky-950/40 transition-all active:scale-95"
            title={isFreeTier ? 'Super Like (VIP Upgrade Required)' : 'Super Like'}
          >
            <Star className="w-5 h-5 fill-current" />
            {isFreeTier && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                <Lock className="w-2.5 h-2.5" />
              </span>
            )}
          </button>

          <button
            onClick={() => {
              handleSwipe('like', inspectedProfile);
              if (!isFreeTier) setInspectedProfile(null);
            }}
            className="flex-1 py-3 rounded-2xl gradient-fiffy-btn text-white font-bold text-sm shadow-lg shadow-pink-500/30 flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
          >
            {isFreeTier ? (
              <>
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Upgrade to Match</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-current" />
                <span>Match Spark</span>
              </>
            )}
          </button>
        </div>

        {/* Report Dialog Overlay */}
        {showReportDialog && (
          <div className="absolute inset-0 z-40 bg-[#100520]/95 backdrop-blur-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <span>Report {inspectedProfile.name}</span>
                </h3>
                <button onClick={() => setShowReportDialog(false)} className="text-purple-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-purple-300/80 my-4 leading-relaxed">
                We take member safety seriously. Reports are sent directly to our moderation queue and reviewed promptly.
              </p>

              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-2">
                Reason for report
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#16082a]/80 border border-white/10 text-purple-100 text-xs font-semibold mb-4 focus:outline-none focus:border-pink-500"
              >
                <option value="Inappropriate Photos">Inappropriate Photos</option>
                <option value="Harassment / Abusive Messages">Harassment / Abusive Messages</option>
                <option value="Spam or Bot">Spam or Bot</option>
                <option value="Impersonation">Impersonation / Fake Profile</option>
                <option value="Underage">Underage User</option>
                <option value="Other">Other Violation</option>
              </select>

              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                placeholder="Describe what occurred..."
                className="w-full p-2.5 rounded-xl bg-[#16082a]/80 border border-white/10 text-purple-100 text-xs placeholder:text-purple-400/50 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowReportDialog(false)}
                className="py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/15 text-purple-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg transition-colors"
              >
                Submit Report &amp; Block
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
