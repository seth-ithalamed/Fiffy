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
  Images,
  Baby,
  ShieldAlert,
} from 'lucide-react';
import { maskContactInfo } from '../../lib/privacy';
import { CHILDREN_STATUS_CONFIG } from '../../types';

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
  const [reportReason, setReportReason] = useState<string>('Cheating / Multiple Dating / Playing Games');
  const [reportDetails, setReportDetails] = useState<string>('');

  if (!inspectedProfile) return null;

  const totalPhotos = inspectedProfile.photos?.length || 1;

  const handleNext = () => {
    setActivePhotoIdx((prev) => (prev + 1) % totalPhotos);
  };

  const handlePrev = () => {
    setActivePhotoIdx((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  const submitReport = () => {
    reportUser(inspectedProfile.id, reportReason, reportDetails);
    showToast('Report Submitted', `Thank you. Our safety team will review ${inspectedProfile.name} promptly.`, 'info');
    setShowReportDialog(false);
    setInspectedProfile(null);
  };

  const childrenInfo = inspectedProfile.childrenStatus
    ? CHILDREN_STATUS_CONFIG[inspectedProfile.childrenStatus]
    : CHILDREN_STATUS_CONFIG['prefer_not_to_say'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e061a]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,42,133,0.15)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button Top Right */}
        <button
          onClick={() => setInspectedProfile(null)}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white transition-colors border border-white/10 shadow-lg"
          title="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          {/* Main Photo Hero */}
          <div className="relative w-full h-[380px] bg-black group">
            <img
              src={inspectedProfile.photos[activePhotoIdx]}
              alt={`${inspectedProfile.name} photo ${activePhotoIdx + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Photo Counter Badge */}
            <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-semibold">
              <Images className="w-3.5 h-3.5 text-pink-400" />
              <span>Photo {activePhotoIdx + 1} of {totalPhotos}</span>
              <span className="text-purple-300/60 font-normal">(Max 5)</span>
            </div>

            {/* Photo Progress Indicators */}
            <div className="absolute top-11 left-4 right-14 flex gap-1.5 z-20">
              {(inspectedProfile.photos || []).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhotoIdx(i)}
                  className={`h-1.5 flex-1 rounded-full transition-all cursor-pointer ${
                    i === activePhotoIdx ? 'bg-pink-500 shadow-sm shadow-pink-500/50' : 'bg-white/30 hover:bg-white/60'
                  }`}
                  title={`View photo ${i + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            {totalPhotos > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/85 transition-all border border-white/10 shadow-lg active:scale-95"
                  title="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/85 transition-all border border-white/10 shadow-lg active:scale-95"
                  title="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e071a] via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Clickable Photo Thumbnail Strip */}
          {totalPhotos > 1 && (
            <div className="p-3 bg-[#090314] border-b border-white/[0.08] flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 shrink-0 px-1 flex items-center gap-1">
                <Images className="w-3 h-3 text-pink-400" />
                All Photos:
              </span>
              <div className="flex gap-2">
                {inspectedProfile.photos.map((photoUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-12 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-pink-500 scale-105 shadow-md shadow-pink-500/30'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 px-1 rounded-tl bg-black/70 text-[9px] text-white font-mono">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                  <span className="p-1 rounded-full bg-emerald-500 text-white" title="Verified Genuine Identity">
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
                  {maskContactInfo(inspectedProfile.bio)}
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
                  &ldquo;{maskContactInfo(prompt.answer)}&rdquo;
                </p>
              </div>
            ))}

            {/* Safe Privacy Guarantee */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#17092c] to-[#120624] border border-purple-500/30 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Privacy Guard &amp; Anti-Cheating Active</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-purple-200/80 mt-0.5">
                  Contact numbers and emails are 100% hidden. Fiffy enforces single active chats to prevent game playing.
                </p>
              </div>
            </div>

            {/* Lifestyle & Vibe Grid (including Children Status) */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {/* Children Status Card */}
              <div className="p-3.5 rounded-xl bg-[#18092f]/80 border border-pink-500/25 col-span-2 sm:col-span-1 shadow-sm">
                <div className="flex items-center justify-between text-[10px] text-pink-400 uppercase font-bold">
                  <span className="flex items-center gap-1">
                    <Baby className="w-3.5 h-3.5 text-pink-400" />
                    Children / Family
                  </span>
                  <span className="text-[9px] text-purple-300 font-normal">Intentions</span>
                </div>
                <div className="text-purple-100 font-bold mt-1 text-sm flex items-center gap-1.5">
                  <span>{childrenInfo.icon}</span>
                  <span>{childrenInfo.label}</span>
                </div>
                <p className="text-[10px] text-purple-300/70 mt-0.5">{childrenInfo.description}</p>
              </div>

              {inspectedProfile.datingGoal && (
                <div className="p-3.5 rounded-xl bg-[#15082a]/70 border border-white/10 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-purple-400 uppercase font-bold">Looking For</div>
                  <div className="text-purple-100 font-bold mt-1 text-sm">{inspectedProfile.datingGoal}</div>
                  <p className="text-[10px] text-purple-300/70 mt-0.5">Serious dating intentions</p>
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
                  <Wine className="w-4 h-4 text-pink-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-purple-400 uppercase font-bold">Drinking</div>
                    <div className="text-purple-100 font-semibold">{inspectedProfile.drinking}</div>
                  </div>
                </div>
              )}
              {inspectedProfile.spotifyTopArtist && (
                <div className="p-3 rounded-xl bg-[#15082a]/70 border border-white/10 flex items-center gap-2 col-span-2">
                  <Music className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] text-purple-400 uppercase font-bold">Soundtrack</div>
                    <div className="text-purple-100 font-semibold truncate">{inspectedProfile.spotifyTopArtist}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Photo Gallery Section ("View All Photos") */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider font-bold text-white flex items-center gap-2">
                  <Images className="w-4 h-4 text-pink-400" />
                  <span>All Profile Photos ({totalPhotos}/5)</span>
                </h4>
                <span className="text-[10px] text-purple-300/70">
                  Tap any photo to expand
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {inspectedProfile.photos.map((photoUrl, pIdx) => (
                  <div
                    key={pIdx}
                    onClick={() => {
                      setActivePhotoIdx(pIdx);
                      // Scroll to top to see enlarged hero photo smoothly
                      const modalBody = document.querySelector('.overflow-y-auto');
                      modalBody?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`group relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/60 border cursor-pointer transition-all ${
                      activePhotoIdx === pIdx
                        ? 'border-pink-500 ring-2 ring-pink-500/50 scale-[1.02]'
                        : 'border-white/10 hover:border-pink-400/50'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`${inspectedProfile.name} ${pIdx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white">
                      Photo {pIdx + 1}
                    </span>
                    {pIdx === 0 && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-pink-600 text-white text-[9px] font-extrabold uppercase">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
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
                className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 transition-colors p-2 rounded-xl hover:bg-rose-500/10"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Profile</span>
              </button>

              <button
                onClick={() => {
                  blockUser(inspectedProfile.id);
                  showToast('User Blocked', `${inspectedProfile.name} has been blocked and removed from your matches.`, 'info');
                  setInspectedProfile(null);
                }}
                className="text-purple-400 hover:text-white font-semibold flex items-center gap-1.5 transition-colors p-2 rounded-xl hover:bg-white/10"
              >
                <Ban className="w-4 h-4" />
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
                Fiffy is a dedicated platform for genuine, serious relationships. We enforce zero tolerance for cheating, playing games, or misrepresentation.
              </p>

              <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-2">
                Reason for report
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#16082a]/80 border border-white/10 text-purple-100 text-xs font-semibold mb-4 focus:outline-none focus:border-pink-500"
              >
                <option value="Cheating / Multiple Dating / Playing Games">Cheating / Playing with feelings / Not serious</option>
                <option value="Inappropriate Photos">Inappropriate or fake photos</option>
                <option value="Harassment / Abusive Messages">Harassment or rude messages</option>
                <option value="Spam or Bot">Spam, commercial solicitations, or bot</option>
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
