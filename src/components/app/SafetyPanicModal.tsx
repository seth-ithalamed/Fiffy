import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  X,
  Share2,
  MapPin,
  Clock,
  User,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SafetyPanicModal: React.FC = () => {
  const { isSafetyModalOpen, setSafetyModalOpen, activeChatMatch, showToast } = useApp();

  const [trustedContactName, setTrustedContactName] = useState<string>('Jordan Brooks (Best Friend)');
  const [trustedContactPhone, setTrustedContactPhone] = useState<string>('+1 (555) 892-4411');
  const [dateLocation, setDateLocation] = useState<string>('Stumptown Coffee Roasters, Greenwich Village');
  const [dateTime, setDateTime] = useState<string>('Saturday 7:30 PM');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isSafetyModalOpen) return null;

  const matchName = activeChatMatch ? activeChatMatch.user.name : 'My Date';

  const shareText = `Hey! I am going on a date with ${matchName} from Fiffy's Match Making.
📍 Location: ${dateLocation}
⏰ Time: ${dateTime}
I will check in with you by 10:00 PM!`;

  const handleCopyDateDetails = () => {
    navigator.clipboard?.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
    showToast('Details Copied', `Date summary ready to text to ${trustedContactName}`);
  };

  const handleTriggerPanicAlert = () => {
    showToast('Emergency SOS Dispatched', `Simulated safety alert sent to ${trustedContactPhone} with live GPS coordinates!`, 'info');
    setSafetyModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#120625]/95 backdrop-blur-2xl rounded-3xl border border-emerald-500/30 p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.15)] my-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Date Safety &amp; Check-In</h3>
              <p className="text-[11px] text-purple-300">Keep someone in the loop on your plans</p>
            </div>
          </div>
          <button
            onClick={() => setSafetyModalOpen(false)}
            className="p-1 rounded-full text-purple-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form to configure details */}
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold uppercase tracking-wider text-purple-300 block mb-1">
              Trusted Friend Name
            </label>
            <input
              type="text"
              value={trustedContactName}
              onChange={(e) => setTrustedContactName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#16082a]/80 border border-white/10 text-purple-100 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-purple-300 block mb-1">
              Friend Phone Number
            </label>
            <input
              type="text"
              value={trustedContactPhone}
              onChange={(e) => setTrustedContactPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#16082a]/80 border border-white/10 text-purple-100 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-purple-300 block mb-1">
              Meeting Location / Venue
            </label>
            <div className="relative">
              <input
                type="text"
                value={dateLocation}
                onChange={(e) => setDateLocation(e.target.value)}
                className="w-full p-2.5 pl-8 rounded-xl bg-[#16082a]/80 border border-white/10 text-purple-100 focus:outline-none focus:border-emerald-400"
              />
              <MapPin className="w-4 h-4 text-pink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="font-bold uppercase tracking-wider text-purple-300 block mb-1">
              Date Time
            </label>
            <div className="relative">
              <input
                type="text"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full p-2.5 pl-8 rounded-xl bg-[#16082a]/80 border border-white/10 text-purple-100 focus:outline-none focus:border-emerald-400"
              />
              <Clock className="w-4 h-4 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Date share summary card */}
        <div className="p-3.5 rounded-2xl bg-[#0e051c]/80 border border-white/10 text-xs text-purple-200/90 whitespace-pre-wrap font-mono">
          {shareText}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleCopyDateDetails}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-colors"
          >
            {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{isCopied ? 'Copied to Clipboard!' : 'Copy & Share Date Details'}</span>
          </button>

          {/* Emergency Panic SOS Button */}
          <button
            onClick={handleTriggerPanicAlert}
            className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/50 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Simulate Panic SOS Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
