import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  ShieldAlert,
  UserX,
  Ban,
  Check,
  CheckCheck,
  Sparkles,
  MapPin,
  Calendar,
  X,
  Camera,
  Lock,
  ShieldCheck,
  AlertTriangle,
  HeartHandshake,
  Archive,
} from 'lucide-react';
import { hasContactInfo, maskContactInfo } from '../../lib/privacy';

export const ChatView: React.FC = () => {
  const {
    matches,
    activeChatMatchId,
    setActiveChatMatchId,
    activeChatMatch,
    messages,
    sendMessage,
    isPartnerTyping,
    unmatchUser,
    blockUser,
    reportUser,
    setSafetyModalOpen,
    currentUser,
    setInspectedProfile,
    setMonetizationOpen,
    showToast,
    pendingChatSwitch,
    requestOpenChat,
    confirmChatSwitch,
    cancelChatSwitch,
  } = useApp();

  const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;

  const [inputText, setInputText] = useState<string>('');
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = activeChatMatchId ? messages[activeChatMatchId] || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isPartnerTyping]);

  const handleSend = () => {
    if (!activeChatMatchId || !inputText.trim()) return;
    if (isFreeTier) {
      setMonetizationOpen(true);
      showToast('Subscription Required', 'You must be on an active paid plan to send messages.', 'info');
      return;
    }
    if (activeChatMatch?.chatStatus === 'closed') {
      showToast('Chat Ended', 'This previous conversation has ended. Start a new match chat to connect.', 'info');
      return;
    }
    sendMessage(activeChatMatchId, inputText.trim());
    setInputText('');
  };

  const conversationStarters = [
    'What is your all-time favorite Sunday morning routine?',
    'If we had 24 hours in any city in the world, where are we landing?',
    'What song have you had on repeat for the last 48 hours?',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[radial-gradient(circle_at_60%_50%,#190a2e_0%,#050208_100%)] text-slate-100 overflow-hidden">
      {/* Free Tier Chat Restriction Notice */}
      {isFreeTier && (
        <div className="bg-gradient-to-r from-pink-950/90 via-purple-950/95 to-pink-950/90 border-b border-pink-500/30 px-4 py-2 flex items-center justify-between z-30 shadow-md">
          <div className="flex items-center gap-2 text-xs text-pink-200">
            <Lock className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <strong className="text-white">Free Plan Restricted:</strong> Messaging and dating calls require VIP membership. Free users can only view profiles.
            </span>
          </div>
          <button
            onClick={() => setMonetizationOpen(true)}
            className="px-3 py-1 rounded-full gradient-fiffy text-white font-bold text-[11px] shadow hover:brightness-110 shrink-0 ml-2"
          >
            Upgrade to Chat
          </button>
        </div>
      )}

      <div className="flex-1 flex h-full overflow-hidden">
        {/* LEFT SIDEBAR: Match Stories & Conversations List */}
      <div
        className={`w-full md:w-80 lg:w-88 border-r border-white/[0.08] flex flex-col bg-[#0e061d]/85 backdrop-blur-xl ${
          activeChatMatchId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08]">
          <h2 className="font-display font-bold text-xl text-white">Sparks &amp; Messages</h2>
          <p className="text-xs text-purple-300/70 mt-0.5">
            {matches.length} active connections
          </p>
        </div>

        {/* New Matches Avatar Strip (Horizontal Scroll) */}
        <div className="p-3 border-b border-white/[0.08]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 block mb-2 px-1">
            New Matches
          </span>
          <div className="flex items-center gap-3 overflow-x-auto pb-1 px-1">
            {(matches || []).map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveChatMatchId(m.id)}
                className="flex flex-col items-center gap-1 cursor-pointer group flex-shrink-0"
              >
                <div className="relative">
                  <img
                    src={m.user.photos[0]}
                    alt={m.user.name}
                    referrerPolicy="no-referrer"
                    className="w-13 h-13 rounded-full object-cover p-0.5 border-2 border-pink-500 group-hover:scale-105 transition-transform"
                  />
                  {m.user.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0e071a]" />
                  )}
                </div>
                <span className="text-[11px] font-medium text-purple-200 max-w-[56px] truncate">
                  {m.user.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.06]">
          {(matches || []).map((match) => {
            const isSelected = match.id === activeChatMatchId;
            const isClosed = match.chatStatus === 'closed';
            const isActiveChat = match.chatStatus === 'active';
            return (
              <div
                key={match.id}
                onClick={() => requestOpenChat(match.id)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500/15 via-purple-900/30 to-transparent border-l-4 border-pink-500'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={match.user.photos[0]}
                    alt={match.user.name}
                    referrerPolicy="no-referrer"
                    className={`w-12 h-12 rounded-full object-cover border ${
                      isClosed ? 'border-zinc-600 opacity-60' : 'border-purple-700/50'
                    }`}
                  />
                  {match.user.online && !isClosed && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0e071a]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <h4 className="font-display font-bold text-sm text-white truncate">
                        {match.user.name}
                      </h4>
                      {isClosed && (
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[9px] font-mono font-semibold">
                          Ended
                        </span>
                      )}
                      {isActiveChat && (
                        <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 text-[9px] font-semibold border border-pink-500/30">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-purple-400/80">
                      {match.lastMessageTime || match.matchedAt}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${isClosed ? 'text-zinc-500 italic' : 'text-purple-200/70'}`}>
                    {match.lastMessage || 'Connected! Say hello ✨'}
                  </p>
                </div>

                {match.unreadCount > 0 && !isClosed && (
                  <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {match.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANE: Active Chat Conversation */}
      {activeChatMatch ? (
        <div
          className={`flex-1 flex flex-col h-full bg-[#080210]/90 backdrop-blur-xl ${
            !activeChatMatchId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-white/[0.08] bg-[#0e061d]/85 backdrop-blur-xl flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              {/* Mobile Back button */}
              <button
                onClick={() => setActiveChatMatchId(null)}
                className="md:hidden p-1.5 rounded-full text-purple-300 hover:text-white"
              >
                ✕
              </button>

              <div
                onClick={() => setInspectedProfile(activeChatMatch.user)}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={activeChatMatch.user.photos[0]}
                    alt={activeChatMatch.user.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-pink-500/80 group-hover:scale-105 transition-transform"
                  />
                  {activeChatMatch.user.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
                  )}
                </div>

                <div>
                  <h3 className="font-display font-bold text-sm text-white group-hover:text-pink-300 transition-colors flex items-center gap-1">
                    <span>{activeChatMatch.user.name}, {activeChatMatch.user.age}</span>
                  </h3>
                  <span className="text-[11px] text-purple-300/80">
                    {isPartnerTyping ? (
                      <span className="text-pink-400 font-semibold animate-pulse">typing...</span>
                    ) : activeChatMatch.user.online ? (
                      'Active now'
                    ) : (
                      activeChatMatch.user.lastActive
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Action Icons: Date Check-in, Menu */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSafetyModalOpen(true)}
                className="p-2 rounded-full bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 transition-colors"
                title="Share Date Safety Check-in"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>

              {/* Options Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-2 rounded-full text-purple-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showOptionsMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#140828]/95 backdrop-blur-2xl border border-white/15 shadow-2xl p-1.5 z-50 text-xs">
                    <button
                      onClick={() => {
                        setInspectedProfile(activeChatMatch.user);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-purple-200 hover:bg-white/[0.08] flex items-center gap-2"
                    >
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setSafetyModalOpen(true);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-emerald-300 hover:bg-emerald-950/40 flex items-center gap-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Date Safety Details</span>
                    </button>
                    <button
                      onClick={() => {
                        unmatchUser(activeChatMatch.id);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-purple-300 hover:bg-white/[0.08] flex items-center gap-2"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Unmatch</span>
                    </button>
                    <button
                      onClick={() => {
                        blockUser(activeChatMatch.user.id);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Block / Report</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Privacy Banner */}
          <div className="px-4 py-2 bg-[#120625]/90 border-b border-purple-500/20 flex items-center justify-center gap-2 text-xs text-purple-200">
            <Lock className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span>
              <strong className="text-white">Safety Guarantee:</strong> Contact numbers and emails are strictly hidden from everyone.
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {/* Icebreaker Prompt Banner at top of chat */}
            <div className="text-center my-3">
              <div className="inline-block p-3 rounded-2xl bg-[#140828]/80 backdrop-blur-md border border-white/10 text-xs text-purple-200 max-w-md shadow-sm">
                <span className="text-pink-400 font-bold block mb-1">
                  You matched with {activeChatMatch.user.name}!
                </span>
                &ldquo;{maskContactInfo(activeChatMatch.user.prompts[0]?.answer || activeChatMatch.user.bio)}&rdquo;
              </div>
            </div>

            {(currentMessages || []).map((msg) => {
              const isMe = msg.senderId === 'me';
              const displayText = maskContactInfo(msg.text);
              const isMasked = displayText.includes('[Contact number hidden for privacy]') || displayText.includes('[Email hidden for privacy]');

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'gradient-fiffy text-white rounded-br-none shadow-[0_4px_15px_rgba(255,42,133,0.25)]'
                        : 'bg-[#1a0e30]/85 backdrop-blur-md text-purple-100 border border-white/10 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div>{displayText}</div>
                    {isMasked && (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-200 bg-black/30 px-2 py-0.5 rounded-md border border-amber-500/30">
                        <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Contact info hidden from everyone for safety</span>
                      </div>
                    )}
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="attachment"
                        referrerPolicy="no-referrer"
                        className="rounded-xl mt-2 max-h-48 object-cover"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-purple-400/70 mt-1 px-1">
                    <span>{msg.timestamp}</span>
                    {isMe && currentUser.readReceipts && (
                      <span>
                        {msg.isRead ? (
                          <CheckCheck className="w-3 h-3 text-sky-400 inline" />
                        ) : (
                          <Check className="w-3 h-3 text-purple-400 inline" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Simulated Partner Typing Bubble */}
            {isPartnerTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl rounded-bl-none bg-[#1a0e30]/85 border border-white/10 max-w-[70px] shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce delay-300" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* If free tier: show VIP locked prompt. Otherwise: conversation starters & input bar */}
          {isFreeTier ? (
            <div className="p-4 sm:p-5 bg-[#0e061d]/95 backdrop-blur-xl border-t border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300 shrink-0">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                    Chatting is Locked on Free Plan
                  </h4>
                  <p className="text-xs text-purple-300/80 mt-0.5 max-w-md">
                    Free accounts can view profiles, but chatting and matching require a VIP membership. Upgrade to send messages to {activeChatMatch.user.name}!
                  </p>
                </div>
              </div>
              <button
                id="unlock-chat-dock-btn"
                onClick={() => setMonetizationOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                Upgrade to Chat
              </button>
            </div>
          ) : (
            <>
              {/* Quick Icebreaker Suggestions (chips) */}
              <div className="px-4 py-2 overflow-x-auto flex gap-2 border-t border-white/[0.08] bg-[#0e061d]/85">
                {(conversationStarters || []).map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(starter)}
                    className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] bg-[#160a2d]/80 hover:bg-[#220e42] text-pink-300/90 border border-white/10 hover:border-pink-500/40 transition-colors"
                  >
                    &ldquo;{starter.slice(0, 32)}...&rdquo;
                  </button>
                ))}
              </div>

              {/* Message Input Bar */}
              <div className="p-3 sm:p-4 bg-[#0e061d]/85 backdrop-blur-xl border-t border-white/[0.08]">
              {activeChatMatch.chatStatus === 'closed' ? (
                <div className="p-4 bg-[#130626]/90 border border-purple-500/20 rounded-2xl flex items-center justify-center gap-3 text-center">
                  <Archive className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">This conversation has concluded</p>
                    <p className="text-[11px] text-purple-300/80">
                      Per the Fiffy Serious &amp; Cheating-Free Dating Policy, each member can only hold one active conversation at a time.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {hasContactInfo(inputText) && (
                    <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 animate-fadeIn">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        <strong>Privacy Guard:</strong> Phone numbers and email addresses are automatically hidden from everyone upon sending.
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-[#15092a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 focus-within:border-pink-500/50 transition-colors">
                    <button
                      onClick={() =>
                        sendMessage(
                          activeChatMatch.id,
                          'Check out this stunning African art piece from the gallery!',
                          'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=400&q=80'
                        )
                      }
                      className="p-2 rounded-xl text-purple-400 hover:text-pink-400 hover:bg-white/[0.08] transition-colors"
                      title="Send Photo"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={
                        isFreeTier
                          ? 'Messaging requires VIP upgrade (Click to upgrade)...'
                          : `Type a spark message to ${activeChatMatch.user.name}...`
                      }
                      className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-white placeholder:text-purple-400/50 focus:outline-none"
                    />

                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim()}
                      className={`p-2.5 rounded-xl gradient-fiffy text-white shadow-md transition-all ${
                        inputText.trim()
                          ? 'hover:scale-105 active:scale-95 opacity-100 shadow-pink-500/25'
                          : 'opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    ) : (
        /* Empty selection state on desktop */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center text-purple-300/80">
          <div className="w-16 h-16 rounded-full bg-[#160a2d]/80 border border-white/10 flex items-center justify-center mb-4 shadow-lg shadow-pink-950/40">
            {isFreeTier ? <Lock className="w-8 h-8 text-amber-400" /> : <Sparkles className="w-8 h-8 text-pink-400" />}
          </div>
          <h3 className="font-display font-bold text-lg text-white">
            {isFreeTier ? 'Messaging Requires VIP Upgrade' : 'Select a Conversation'}
          </h3>
          <p className="text-xs text-purple-400/80 max-w-xs mt-1">
            {isFreeTier
              ? 'Free accounts can only view profiles. Upgrade to Fiffy VIP to start matching and exchanging direct messages!'
              : 'Choose a match from the sidebar to start a real-time encrypted chat.'}
          </p>
          {isFreeTier && (
            <button
              onClick={() => setMonetizationOpen(true)}
              className="mt-4 px-5 py-2.5 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-transform"
            >
              Upgrade to Unlock Chat
            </button>
          )}
        </div>
      )}
      </div>

      {/* SINGLE ACTIVE CHAT SWITCH WARNING MODAL (Cheating-Free Guarantee) */}
      {pendingChatSwitch && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#120625]/95 backdrop-blur-2xl rounded-3xl border border-pink-500/40 p-6 flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,42,133,0.2)]">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="font-display font-bold text-lg text-white text-center">
              Start New Chat with {pendingChatSwitch.targetMatch.user.name}?
            </h3>

            <div className="mt-3 p-3.5 rounded-2xl bg-[#1b0833]/80 border border-white/10 text-xs text-purple-200/90 leading-relaxed space-y-2">
              <p className="font-semibold text-pink-300 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                <span>Cheating-Free &amp; Serious Dating Rule</span>
              </p>
              <p>
                To protect emotional well-being and keep our platform serious and honest, members cannot maintain multiple active chats simultaneously.
              </p>
              <p className="text-amber-300 font-medium">
                Opening this chat will automatically archive and end your active conversation with <span className="underline font-bold">{pendingChatSwitch.previousMatch.user.name}</span>.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={confirmChatSwitch}
                className="w-full py-3.5 rounded-2xl gradient-fiffy-btn text-white font-bold text-xs shadow-lg shadow-pink-500/25 hover:scale-[1.01] active:scale-95 transition-all"
              >
                End Chat with {pendingChatSwitch.previousMatch.user.name} &amp; Start with {pendingChatSwitch.targetMatch.user.name}
              </button>
              <button
                onClick={cancelChatSwitch}
                className="w-full py-3 rounded-2xl bg-white/[0.06] hover:bg-white/10 text-purple-300 hover:text-white font-semibold text-xs border border-white/10 transition-colors"
              >
                Stay with {pendingChatSwitch.previousMatch.user.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
