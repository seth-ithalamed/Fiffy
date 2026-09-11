import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Upload,
  Lock,
  Sparkles,
  HeartHandshake,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

export const VerificationModal: React.FC = () => {
  const {
    isVerificationModalOpen,
    setIsVerificationModalOpen,
    currentUser,
    updateCurrentUser,
    showToast,
  } = useApp();

  const [step, setStep] = useState<'intro' | 'selfie' | 'pledge' | 'success'>('intro');
  const [selfieCaptured, setSelfieCaptured] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [idType, setIdType] = useState<string>('National ID / Driver’s License');
  const [pledgeChecked, setPledgeChecked] = useState<boolean>(false);
  const [selectedPose, setSelectedPose] = useState<number>(0);
  const [matchScore, setMatchScore] = useState<number>(97.4);

  const POSES = [
    {
      id: 'peace',
      name: 'Peace Sign ✌️',
      instruction: 'Hold up 2 fingers (peace sign) next to your cheek',
      badge: 'Pose 1 of 3',
    },
    {
      id: 'thumbs_up',
      name: 'Thumbs-Up Smile 👍',
      instruction: 'Give a thumbs-up while smiling at the front camera',
      badge: 'Pose 2 of 3',
    },
    {
      id: 'head_tilt',
      name: '45° Head Angle 🔄',
      instruction: 'Turn your head slightly to the left to confirm 3D depth',
      badge: 'Pose 3 of 3',
    },
  ];

  if (!isVerificationModalOpen) return null;

  const handleSimulateSelfie = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Use user's first photo or sample selfie as captured verification
      const sample = currentUser.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
      setSelfieCaptured(sample);
      setMatchScore(+(95 + Math.random() * 4).toFixed(1));
      setIsProcessing(false);
      setStep('pledge');
    }, 1200);
  };

  const handleCustomSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelfieCaptured(reader.result);
        setMatchScore(+(94 + Math.random() * 5).toFixed(1));
        setStep('pledge');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCompleteVerification = () => {
    setIsProcessing(true);
    setTimeout(() => {
      updateCurrentUser({ verified: true });
      setIsProcessing(false);
      setStep('success');
      showToast('Profile Verified! 🛡️', 'You have been awarded the official Verified Member badge.', 'match');
    }, 1500);
  };

  const handleClose = () => {
    setIsVerificationModalOpen(false);
    setStep('intro');
    setSelfieCaptured(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e061a]/95 backdrop-blur-2xl rounded-3xl border border-pink-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(255,42,133,0.2)] overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-1.5">
                <span>Identity &amp; Serious Dating Verification</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Official
                </span>
              </h3>
              <p className="text-[11px] text-purple-300/70">
                100% genuine members. Cheating-free &amp; authentic connections.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-purple-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content by Step */}
        <div className="p-6 space-y-6">
          {step === 'intro' && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500/20 to-purple-600/30 border border-pink-500/30 mx-auto flex items-center justify-center text-pink-400 shadow-lg shadow-pink-500/10">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h4 className="font-display font-black text-xl text-white">
                  Why Apply for Verification?
                </h4>
                <p className="text-xs text-purple-200/80 max-w-sm mx-auto leading-relaxed">
                  Fiffy is built exclusively for singles serious about real relationships. Verification protects you and confirms you are who you say you are.
                </p>
              </div>

              {/* 3 Value Props */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#16082b]/80 border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Blue Verified Badge on Profile</h5>
                    <p className="text-[11px] text-purple-300/70">Stand out on the Sparks Deck with an official trust badge.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#16082b]/80 border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">3.2x More Serious Matches</h5>
                    <p className="text-[11px] text-purple-300/70">Verified members get prioritized discovery rankings.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#16082b]/80 border border-white/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Anti-Cheating Guarantee</h5>
                    <p className="text-[11px] text-purple-300/70">Ensures one person per verified account with zero duplicate profiles.</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setStep('selfie')}
                className="w-full py-3.5 rounded-2xl gradient-fiffy-btn text-white font-bold text-sm shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Start Selfie Verification (Takes 60s)</span>
              </button>
            </div>
          )}

          {step === 'selfie' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="font-display font-bold text-lg text-white">
                  Pose for Live Anti-Catfishing Verification
                </h4>
                <p className="text-xs text-purple-200/80">
                  To ensure uploaded photos are truly yours and eliminate catfishing, mirror the requested real-time gesture:
                </p>
              </div>

              {/* Dynamic Pose Challenge Selector */}
              <div className="p-3 rounded-2xl bg-[#140826] border border-pink-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Required Liveness Pose</span>
                  </span>
                  <span className="text-[10px] bg-pink-500/20 text-pink-300 font-bold px-2 py-0.5 rounded-full border border-pink-500/30">
                    {POSES[selectedPose].badge}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {POSES.map((pose, idx) => (
                    <button
                      key={pose.id}
                      type="button"
                      onClick={() => setSelectedPose(idx)}
                      className={`p-2 rounded-xl text-left transition-all ${
                        selectedPose === idx
                          ? 'gradient-fiffy text-white shadow-md'
                          : 'bg-white/5 text-purple-200 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="font-bold text-xs">{pose.name}</div>
                      <div className="text-[10px] opacity-80 truncate">{pose.id}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-purple-200 bg-white/5 p-2 rounded-xl border border-white/5 flex items-center gap-2">
                  <span className="text-base">📸</span>
                  <span>{POSES[selectedPose].instruction}</span>
                </div>
              </div>

              {/* Camera Frame Preview */}
              <div className="relative aspect-square max-w-[220px] mx-auto rounded-3xl overflow-hidden border-2 border-dashed border-pink-500/50 bg-[#120622] flex flex-col items-center justify-center p-3 shadow-inner">
                {selfieCaptured ? (
                  <img
                    src={selfieCaptured}
                    alt="Captured selfie"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : isProcessing ? (
                  <div className="text-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-pink-400 animate-spin mx-auto" />
                    <span className="text-xs font-semibold text-purple-200 block">
                      Analyzing facial geometry &amp; pose...
                    </span>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-purple-300/80 block max-w-[160px]">
                      {POSES[selectedPose].instruction}
                    </span>
                  </div>
                )}
              </div>

              {/* ID Document Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-300 block">
                  Verification Document Type (Optional Backup)
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#16082b]/80 border border-white/10 text-purple-100 text-xs font-semibold focus:outline-none focus:border-pink-500"
                >
                  <option value="National ID / Driver’s License">National ID / Driver’s License</option>
                  <option value="Passport">International Passport</option>
                  <option value="Voter ID / Resident Card">Voter ID / Resident Permit</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  disabled={isProcessing}
                  onClick={handleSimulateSelfie}
                  className="w-full py-3 rounded-2xl gradient-fiffy-btn text-white font-bold text-xs shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>Verify Pose with Live Selfie</span>
                </button>

                <label className="w-full py-2 rounded-2xl bg-white/[0.06] hover:bg-white/10 text-purple-200 font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-pink-400" />
                  <span>Or Upload Live Pose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCustomSelfieUpload}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 'pledge' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-lg text-white">
                  Biometrics &amp; Liveness Confirmed!
                </h4>
                <p className="text-xs text-purple-200/80">
                  Facial mesh matched your uploaded photos with {matchScore}% accuracy.
                </p>
              </div>

              {/* Biometric Analysis Card */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#140826] border border-emerald-500/30 text-center">
                <div>
                  <div className="text-[10px] text-purple-300 font-semibold uppercase">Face Match</div>
                  <div className="text-xs font-bold text-emerald-400">{matchScore}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-purple-300 font-semibold uppercase">Pose Liveness</div>
                  <div className="text-xs font-bold text-emerald-400">Confirmed ✌️</div>
                </div>
                <div>
                  <div className="text-[10px] text-purple-300 font-semibold uppercase">Anti-Catfish</div>
                  <div className="text-xs font-bold text-emerald-400">Passed ✅</div>
                </div>
              </div>

              {/* Serious Dating Pledge Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1b0a33] to-[#110521] border border-pink-500/30 space-y-2.5">
                <h5 className="text-xs font-bold text-pink-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4" />
                  <span>The Fiffy Serious Member Pledge</span>
                </h5>
                <ul className="text-xs text-purple-200/90 space-y-1.5 list-disc pl-4">
                  <li>I am genuinely single and legally eligible to seek a serious relationship.</li>
                  <li>My uploaded photos are 100% authentic, current, and represent me.</li>
                  <li>I will not deceive, play emotional games, or maintain duplicate accounts.</li>
                  <li>I understand violations result in immediate permanent account termination.</li>
                </ul>
              </div>

              <label className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pledgeChecked}
                  onChange={(e) => setPledgeChecked(e.target.checked)}
                  className="mt-0.5 rounded border-purple-500 text-pink-600 focus:ring-pink-500 h-4 w-4 bg-[#140626]"
                />
                <span className="text-xs text-purple-200 font-medium leading-relaxed">
                  I solemnly pledge to honor the Fiffy Serious Dating Code of Conduct and confirm all submitted photos and details are authentic.
                </span>
              </label>

              <button
                disabled={!pledgeChecked || isProcessing}
                onClick={handleCompleteVerification}
                className="w-full py-3.5 rounded-2xl gradient-fiffy-btn text-white font-bold text-sm shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Issuing Verification Badge...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit &amp; Claim Verified Badge</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
                <ShieldCheck className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="font-display font-black text-2xl text-white">
                  You Are Officially Verified!
                </h4>
                <p className="text-xs text-purple-200/80 max-w-xs mx-auto leading-relaxed">
                  Your profile now displays the prestigious blue shield badge. Serious singles can match with you with complete trust and confidence.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verified Status Active &bull; Profile Trust 100%</span>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3.5 rounded-2xl gradient-fiffy-btn text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Return to My Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
