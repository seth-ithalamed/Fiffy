import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, Send, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const MatchCelebrationModal: React.FC = () => {
  const {
    activeMatchCelebration,
    closeMatchCelebration,
    currentUser,
    sendMessage,
    matches,
    setActiveChatMatchId,
    setInAppTab,
  } = useApp();

  const [messageText, setMessageText] = useState<string>('');

  if (!activeMatchCelebration) return null;

  const matchedUser = activeMatchCelebration.user;
  const targetMatch = matches.find((m) => m.userId === matchedUser.id);

  // Suggested icebreaker based on their profile
  const suggestedIcebreakers = [
    `Hey ${matchedUser.name}! Loved your answer about ${matchedUser.prompts[0]?.question.toLowerCase() || 'your hobbies'} 😊`,
    `Hi ${matchedUser.name}! We both love ${matchedUser.interests[0] || 'good coffee'}! What’s your favorite spot in town?`,
    `Hey! Your profile gave me an instant spark. How is your week going? ✨`,
  ];

  const handleSendAndOpenChat = (text: string) => {
    const content = text || messageText;
    if (targetMatch && content.trim()) {
      sendMessage(targetMatch.id, content.trim());
      setActiveChatMatchId(targetMatch.id);
      setInAppTab('chat');
    }
    closeMatchCelebration();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative w-full max-w-md bg-[#120625]/95 backdrop-blur-2xl rounded-3xl border border-pink-500/40 p-6 sm:p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_50px_rgba(255,42,133,0.25)] my-auto"
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/15 via-transparent to-purple-900/20 rounded-3xl pointer-events-none" />

        {/* Celebration Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mutual Spark Connected!</span>
        </div>

        {/* Big Bold Headline */}
        <h2 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-white to-purple-300">
          It&apos;s a Match!
        </h2>

        <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-xs mx-auto">
          You and <span className="text-white font-bold">{matchedUser.name}</span> have liked each other.
        </p>

        {/* Dual Avatars with Heart Badge */}
        <div className="flex items-center justify-center gap-3 my-7">
          <div className="relative">
            <img
              src={currentUser.photos[0]}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-purple-500 shadow-xl"
            />
          </div>

          <div className="w-10 h-10 rounded-full gradient-fiffy flex items-center justify-center shadow-lg shadow-pink-500/50 z-10 animate-bounce">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>

          <div className="relative">
            <img
              src={matchedUser.photos[0]}
              alt={matchedUser.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-pink-500 shadow-xl"
            />
          </div>
        </div>

        {/* Instant Conversation Starters */}
        <div className="space-y-2 mb-4 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80">
            Quick Conversation Starters
          </p>
          {(suggestedIcebreakers || []).slice(0, 2).map((starter, idx) => (
            <button
              key={idx}
              onClick={() => handleSendAndOpenChat(starter)}
              className="w-full text-left p-2.5 rounded-xl bg-[#180830]/80 hover:bg-[#250d48] border border-white/10 text-xs text-purple-200 hover:text-white transition-colors"
            >
              &ldquo;{starter}&rdquo;
            </button>
          ))}
        </div>

        {/* Custom Message input */}
        <div className="flex items-center gap-2 bg-[#15092a]/80 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl mb-4 focus-within:border-pink-500/50 transition-colors">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendAndOpenChat(messageText)}
            placeholder={`Message ${matchedUser.name}...`}
            className="flex-1 bg-transparent px-3 text-xs text-white placeholder:text-purple-400/50 focus:outline-none"
          />
          <button
            onClick={() => handleSendAndOpenChat(messageText)}
            className="p-2 rounded-xl gradient-fiffy text-white shadow hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Keep Swiping Button */}
        <button
          onClick={closeMatchCelebration}
          className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-purple-300 hover:text-white text-xs font-bold border border-white/10 transition-colors"
        >
          Keep Swiping
        </button>
      </motion.div>
    </div>
  );
};
