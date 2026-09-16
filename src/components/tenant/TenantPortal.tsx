import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Plus,
  Send,
  Lock,
  Globe2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  HeartHandshake,
  DollarSign,
  Phone,
  Mail,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  FileText,
  Search,
  Filter,
  ArrowRight,
  LogOut,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Copy,
  Calendar,
  Settings,
  Flame,
  Award,
  Sliders,
  Check,
  UserCheck,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Tenant, TenantClient, TenantBillingRecord, TenantMatchIntroduction, UserProfile } from '../../types';
import { AFRICAN_COUNTRIES } from '../../data/mockData';

export const TenantPortal: React.FC = () => {
  const {
    tenants,
    tenantClients,
    tenantBillingRecords,
    tenantIntroductions,
    tenantSession,
    loginTenant,
    logoutTenant,
    switchTenantWorkspace,
    createTenantClient,
    updateTenantClient,
    payTenantClientUploadFee,
    payAllPendingUploadFees,
    resendTenantClientInvite,
    createTenantIntroduction,
    updateTenant,
    updateTenantBillingStatus,
    showToast,
    setActiveSurface,
    setInAppTab,
    deckProfiles,
  } = useApp();

  // Active navigation tab within tenant portal
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'studio' | 'pool' | 'billing' | 'settings'>('overview');

  // Login form state (if logged out)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register new agency modal
  const [isRegisterAgencyOpen, setIsRegisterAgencyOpen] = useState(false);
  const [newAgencyForm, setNewAgencyForm] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '+27 11 ',
    currency: 'ZAR' as 'ZAR' | 'USD',
    feePerClient: 250,
    defaultClientPoolAccess: 'restricted' as 'restricted' | 'open',
    notes: '',
    logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  });

  // Client Enrollment Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    name: '',
    phone: '+27 82 ',
    email: '',
    gender: 'woman' as 'woman' | 'man' | 'non-binary',
    dob: '1995-06-12',
    city: 'Johannesburg',
    country: 'South Africa',
    bio: 'Executive professional seeking a meaningful, lasting connection with someone who shares similar values, culture, and ambition.',
    clientPoolAccess: 'restricted' as 'restricted' | 'open',
    vipTier: 'executive_vip' as 'standard_vip' | 'executive_vip' | 'presidential_vip',
    matchmakerNotes: 'High-profile client. Values privacy, mutual respect, family commitment, and cultural roots.',
    password: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  });
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Client Search and Filters
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientFilterGender, setClientFilterGender] = useState<'all' | 'woman' | 'man' | 'non-binary'>('all');
  const [clientFilterPool, setClientFilterPool] = useState<'all' | 'restricted' | 'open'>('all');
  const [clientFilterStatus, setClientFilterStatus] = useState<'all' | 'saved' | 'staged'>('all');

  // Matchmaking Studio State
  const [selectedClientAId, setSelectedClientAId] = useState<string>('');
  const [selectedCandidateBId, setSelectedCandidateBId] = useState<string>('');
  const [matchmakerCuratedNote, setMatchmakerCuratedNote] = useState<string>(
    'Personally curated by our agency matchmaker. You both value entrepreneurship, international travel, family values, and genuine cultural alignment.'
  );
  const [isDispatchingIntro, setIsDispatchingIntro] = useState(false);

  // Edit Matchmaker Notes Modal
  const [editingClientNotes, setEditingClientNotes] = useState<TenantClient | null>(null);
  const [tempNotesContent, setTempNotesContent] = useState('');

  // Settle Bill Modal
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  // Single Client Payment Modal
  const [clientToPayFee, setClientToPayFee] = useState<TenantClient | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('PayFast Instant EFT');
  const [isPayingUploadFee, setIsPayingUploadFee] = useState(false);

  // Enrollment payment choice
  const [enrollPayImmediately, setEnrollPayImmediately] = useState(true);
  const [enrollPaymentMethod, setEnrollPaymentMethod] = useState('PayFast Instant EFT');

  // Agency Settings Form
  const currentTenant = useMemo(() => {
    if (!tenantSession) return tenants[0] || null;
    return tenants.find((t) => t.id === tenantSession.tenantId) || tenants[0] || null;
  }, [tenantSession, tenants]);

  const [agencySettingsForm, setAgencySettingsForm] = useState({
    name: currentTenant?.name || '',
    contactName: currentTenant?.contactName || '',
    contactEmail: currentTenant?.contactEmail || '',
    contactPhone: currentTenant?.contactPhone || '',
    feePerClient: currentTenant?.feePerClient || 250,
    currency: currentTenant?.currency || 'ZAR',
    defaultClientPoolAccess: currentTenant?.defaultClientPoolAccess || 'restricted',
    notes: currentTenant?.notes || '',
    logoUrl: currentTenant?.logoUrl || '',
  });

  // Keep settings form in sync when tenant changes
  React.useEffect(() => {
    if (currentTenant) {
      setAgencySettingsForm({
        name: currentTenant.name,
        contactName: currentTenant.contactName,
        contactEmail: currentTenant.contactEmail,
        contactPhone: currentTenant.contactPhone,
        feePerClient: currentTenant.feePerClient,
        currency: currentTenant.currency,
        defaultClientPoolAccess: currentTenant.defaultClientPoolAccess,
        notes: currentTenant.notes || '',
        logoUrl: currentTenant.logoUrl || '',
      });
    }
  }, [currentTenant]);

  // Clients belonging to this active tenant
  const currentAgencyClients = useMemo(() => {
    if (!currentTenant) return [];
    return tenantClients.filter((c) => c.tenantId === currentTenant.id);
  }, [currentTenant, tenantClients]);

  // Filtered clients
  const filteredAgencyClients = useMemo(() => {
    return currentAgencyClients.filter((c) => {
      const matchesSearch =
        !clientSearchQuery ||
        c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
        c.phone.includes(clientSearchQuery) ||
        (c.city && c.city.toLowerCase().includes(clientSearchQuery.toLowerCase())) ||
        (c.matchmakerNotes && c.matchmakerNotes.toLowerCase().includes(clientSearchQuery.toLowerCase()));

      const matchesGender = clientFilterGender === 'all' || c.gender === clientFilterGender;
      const matchesPool = clientFilterPool === 'all' || c.clientPoolAccess === clientFilterPool;
      const matchesStatus =
        clientFilterStatus === 'all' ||
        (clientFilterStatus === 'saved' && c.isSavedFully) ||
        (clientFilterStatus === 'staged' && !c.isSavedFully);

      return matchesSearch && matchesGender && matchesPool && matchesStatus;
    });
  }, [currentAgencyClients, clientSearchQuery, clientFilterGender, clientFilterPool, clientFilterStatus]);

  // Billing records for this agency
  const currentAgencyInvoices = useMemo(() => {
    if (!currentTenant) return [];
    return tenantBillingRecords.filter((b) => b.tenantId === currentTenant.id);
  }, [currentTenant, tenantBillingRecords]);

  // Introductions made by this agency
  const currentAgencyIntroductions = useMemo(() => {
    if (!currentTenant) return [];
    return tenantIntroductions.filter((intro) => intro.tenantId === currentTenant.id);
  }, [currentTenant, tenantIntroductions]);

  // Financial calculations
  const totalBilled = currentAgencyInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = currentAgencyInvoices.filter((inv) => inv.status === 'paid').reduce((acc, inv) => acc + inv.amount, 0);
  const pendingBalance = totalBilled - totalPaid;

  // Selected client objects for matchmaker studio
  const selectedClientA = useMemo(() => {
    return currentAgencyClients.find((c) => c.userId === selectedClientAId || c.id === selectedClientAId);
  }, [currentAgencyClients, selectedClientAId]);

  // Eligible Candidate B options
  const candidateBOptions = useMemo(() => {
    if (!selectedClientA) return currentAgencyClients;
    // If client A has restricted pool, can only match with other agency clients
    if (selectedClientA.clientPoolAccess === 'restricted') {
      return currentAgencyClients.filter((c) => c.id !== selectedClientA.id && c.userId !== selectedClientA.userId);
    }
    // If open pool, can match with any agency client or other platform clients
    return currentAgencyClients.filter((c) => c.id !== selectedClientA.id && c.userId !== selectedClientA.userId);
  }, [selectedClientA, currentAgencyClients]);

  const selectedCandidateB = useMemo(() => {
    return currentAgencyClients.find((c) => c.userId === selectedCandidateBId || c.id === selectedCandidateBId);
  }, [currentAgencyClients, selectedCandidateBId]);

  // Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your agency email, phone, or slug.');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    const res = await loginTenant(loginIdentifier, loginPassword);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Failed to authenticate agency account.');
    }
  };

  const handleQuickDemoLogin = async (tenantId: string) => {
    setIsLoggingIn(true);
    setLoginError('');
    const target = tenants.find((t) => t.id === tenantId);
    if (target) {
      await loginTenant(target.contactEmail || target.slug || target.id);
    }
    setIsLoggingIn(false);
  };

  const handleEnrollClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;
    if (!enrollForm.name.trim()) {
      showToast('Validation Error', 'Client name is required', 'error');
      return;
    }
    setIsEnrolling(true);

    const clientPayload = {
      name: enrollForm.name.trim(),
      phone: enrollForm.phone.trim(),
      contactNumber: enrollForm.phone.trim(),
      email: enrollForm.email.trim() || undefined,
      gender: enrollForm.gender,
      dob: enrollForm.dob,
      city: enrollForm.city,
      country: enrollForm.country,
      bio: enrollForm.bio,
      photos: [enrollForm.photoUrl],
      clientPoolAccess: enrollForm.clientPoolAccess,
      vipTier: enrollForm.vipTier,
      matchmakerNotes: enrollForm.matchmakerNotes,
      password: enrollForm.password || undefined,
      payImmediately: enrollPayImmediately,
      paymentMethod: enrollPaymentMethod,
    };

    const res = await createTenantClient(currentTenant.id, clientPayload);
    setIsEnrolling(false);

    if (res.success) {
      setIsEnrollModalOpen(false);
      setEnrollForm({
        name: '',
        phone: '+27 82 ',
        email: '',
        gender: 'woman',
        dob: '1995-06-12',
        city: 'Johannesburg',
        country: 'South Africa',
        bio: 'Executive professional seeking meaningful dating.',
        clientPoolAccess: currentTenant.defaultClientPoolAccess || 'restricted',
        vipTier: 'executive_vip',
        matchmakerNotes: '',
        password: '',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      });

      if (enrollPayImmediately) {
        showToast(
          'Client Enrolled & Data Fully Saved! 🌟',
          `Upload fee of ${currentTenant.currency} ${currentTenant.feePerClient} settled. Profile saved to live database & SMS invitation sent.`,
          'match'
        );
      } else {
        showToast(
          'Client Staged Awaiting Payment ⏳',
          `Profile staged. Data will be fully saved to the live database once the upload fee (${currentTenant.currency} ${currentTenant.feePerClient}) is paid.`,
          'info'
        );
      }
    } else {
      showToast('Enrollment Failed', res.error || 'Could not enroll client', 'error');
    }
  };

  const handlePayClientUploadFee = async () => {
    if (!currentTenant || !clientToPayFee) return;
    setIsPayingUploadFee(true);
    const res = await payTenantClientUploadFee(
      currentTenant.id,
      clientToPayFee.id,
      selectedPaymentMethod
    );
    setIsPayingUploadFee(false);
    if (res.success) {
      setClientToPayFee(null);
    }
  };

  const handleDispatchIntroduction = async () => {
    if (!currentTenant || !selectedClientA || !selectedCandidateB) {
      showToast('Incomplete Pairing', 'Please select both candidates to curate an introduction.', 'error');
      return;
    }
    setIsDispatchingIntro(true);
    const res = await createTenantIntroduction(
      currentTenant.id,
      selectedClientA.userId || selectedClientA.id,
      selectedCandidateB.userId || selectedCandidateB.id,
      matchmakerCuratedNote
    );
    setIsDispatchingIntro(false);
    if (res.success) {
      showToast('Curated Introduction Sent! 💖', res.message || 'Both candidates have been notified and connected in chat.', 'match');
      setSelectedClientAId('');
      setSelectedCandidateBId('');
    } else {
      showToast('Error', res.error || 'Failed to dispatch introduction', 'error');
    }
  };

  const handleSaveNotes = async () => {
    if (!currentTenant || !editingClientNotes) return;
    const res = await updateTenantClient(currentTenant.id, editingClientNotes.id, {
      matchmakerNotes: tempNotesContent,
    });
    if (res.success) {
      showToast('Notes Updated', 'Matchmaker evaluation notes updated successfully.', 'success');
      setEditingClientNotes(null);
    } else {
      showToast('Error', res.error || 'Failed to update notes', 'error');
    }
  };

  const handleTogglePoolAccess = async (client: TenantClient) => {
    if (!currentTenant) return;
    const newAccess = client.clientPoolAccess === 'restricted' ? 'open' : 'restricted';
    const res = await updateTenantClient(currentTenant.id, client.id, {
      clientPoolAccess: newAccess,
    });
    if (res.success) {
      showToast(
        'Pool Access Toggled',
        `${client.name} is now set to ${newAccess === 'open' ? 'Full Fiffy Network' : 'Agency Pool Only'}.`,
        'info'
      );
    }
  };

  const handleSaveAgencySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;
    const res = await updateTenant(currentTenant.id, agencySettingsForm);
    if (res.success) {
      showToast('Settings Saved', 'Agency profile and billing preferences updated.', 'success');
    }
  };

  const handleSimulateSettleBalance = async () => {
    if (!currentTenant) return;
    setIsSettling(true);
    const res = await payAllPendingUploadFees(currentTenant.id, 'PayFast Instant EFT / Agency Remittance');
    setIsSettling(false);
    setIsSettleModalOpen(false);
    if (res.success) {
      showToast('Upload Fees Reconciled! 💰', res.message || 'All pending upload fee invoices settled and staged clients fully saved.', 'success');
    } else {
      showToast('Settlement Notice', res.error || 'Failed to settle all fees', 'info');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', `${label}: ${text}`, 'info');
  };

  // =========================================================================
  // VIEW: IF LOGGED OUT OF TENANT PORTAL
  // =========================================================================
  if (!tenantSession || !tenantSession.isAuthenticated || !currentTenant) {
    return (
      <div className="min-h-screen bg-[#080314] text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-pink-500 selection:text-white relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-900/60 to-pink-900/40 border border-pink-500/30 shadow-lg shadow-pink-500/20 mb-2">
              <Building2 className="w-7 h-7 text-pink-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-white">
              Agency Partner Portal
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/70 max-w-sm mx-auto">
              Dedicated CRM &amp; Matchmaking Studio for verified agencies and executive matchmakers on Fiffy&apos;s Network.
            </p>
          </div>

          {/* Quick 1-Click Demo Login for Testing */}
          <div className="bg-[#120724]/90 border border-purple-800/40 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant 1-Click Agency Logins</span>
              </span>
              <span className="text-[10px] text-purple-400 font-semibold">Demo Access</span>
            </div>

            <div className="space-y-2">
              {tenants.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(t.id)}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-pink-500/10 border border-white/10 hover:border-pink-500/40 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={t.logoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
                      alt={t.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover border border-purple-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors truncate">
                        {t.name}
                      </p>
                      <p className="text-[11px] text-purple-300/70 truncate">
                        {t.contactName} &bull; {t.currency} {t.feePerClient}/client
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-pink-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Direct Credential Login Card */}
          <div className="bg-[#120724]/90 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-pink-400" />
              <span>Sign In with Agency Credentials</span>
            </h2>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Agency Email, Phone Number, or Slug
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. agency@afroelegance.co.za or +27 82 890 1234"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs placeholder:text-purple-300/40 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Agency Matchmaker Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter agency password (or leave blank for demo)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs placeholder:text-purple-300/40 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Agency Access...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Agency Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Switch to Main Sparks Deck */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveSurface('web-app');
                setInAppTab('discover');
              }}
              className="text-xs text-purple-300/80 hover:text-white underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Return to Fiffy&apos;s Match Making Sparks Deck</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATED TENANT AGENCY PORTAL
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#07030e] text-slate-100 flex flex-col selection:bg-pink-500 selection:text-white">
      {/* TOP AGENCY HEADER & WORKSPACE BAR */}
      <header className="sticky top-0 z-30 bg-[#0d051c]/95 backdrop-blur-xl border-b border-white/10 shadow-lg px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Agency Identification */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentTenant.logoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
              alt={currentTenant.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover border-2 border-pink-500/50 shadow-md shadow-pink-500/20 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-black text-white truncate font-display">
                  {currentTenant.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Agency Partner</span>
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80 truncate flex items-center gap-2">
                <span>Lead Matchmaker: <strong className="text-white font-medium">{currentTenant.contactName}</strong></span>
                <span className="text-purple-400">&bull;</span>
                <span className="text-pink-300 font-semibold">{currentTenant.currency} {currentTenant.feePerClient} / Client Upload</span>
              </p>
            </div>
          </div>

          {/* Right Action Controls: Switch Agency, Enroll Client, Logout */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {/* Agency Switcher Dropdown */}
            {tenants.length > 1 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1a0c33] border border-white/10 text-xs">
                <Building2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <select
                  value={currentTenant.id}
                  onChange={(e) => switchTenantWorkspace(e.target.value)}
                  className="bg-transparent text-xs text-purple-200 font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#1a0c33] text-white">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Action: Enroll Client */}
            <button
              type="button"
              id="tenant-header-enroll-btn"
              onClick={() => setIsEnrollModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-md shadow-pink-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll VIP Single</span>
            </button>

            {/* Sign Out of Agency Console */}
            <button
              type="button"
              onClick={logoutTenant}
              title="Logout from Agency Console"
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-purple-300 hover:text-rose-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Agency Sub-Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Agency Dashboard', icon: Building2, badge: null },
            { id: 'clients', label: 'My VIP Singles', icon: Users, badge: currentAgencyClients.length },
            { id: 'studio', label: 'Matchmaking Studio', icon: HeartHandshake, badge: currentAgencyIntroductions.length },
            { id: 'pool', label: 'Candidate Discovery', icon: Flame, badge: null },
            { id: 'billing', label: 'Upload Ledger & Invoices', icon: CreditCard, badge: pendingBalance > 0 ? `${currentTenant.currency} ${pendingBalance}` : null },
            { id: 'settings', label: 'Agency Profile', icon: Settings, badge: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`tenant-nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'gradient-fiffy text-white shadow-md shadow-pink-500/25'
                    : 'text-purple-300/80 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.id === 'billing' && pendingBalance > 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-pink-500/20 text-pink-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* MAIN AGENCY WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-6">
        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#120724] border border-white/10 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span>VIP Singles Enrolled</span>
                  <Users className="w-4 h-4 text-pink-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{currentAgencyClients.length}</span>
                  <span className="text-[11px] text-emerald-400 font-semibold">Active Roster</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-purple-300/70 pt-1 border-t border-white/5">
                  <span>👩 {currentAgencyClients.filter((c) => c.gender === 'woman').length} Women</span>
                  <span>&bull;</span>
                  <span>👨 {currentAgencyClients.filter((c) => c.gender === 'man').length} Men</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#120724] border border-white/10 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span>Candidate Pool Policy</span>
                  <Lock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    {currentAgencyClients.filter((c) => c.clientPoolAccess === 'restricted').length}
                  </span>
                  <span className="text-[11px] text-purple-300 font-semibold">Agency Pool Only</span>
                </div>
                <div className="text-[10px] text-purple-300/70 pt-1 border-t border-white/5 truncate">
                  🌐 {currentAgencyClients.filter((c) => c.clientPoolAccess === 'open').length} clients with Full Network Access
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#120724] border border-white/10 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span>Curated Introductions</span>
                  <HeartHandshake className="w-4 h-4 text-pink-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{currentAgencyIntroductions.length}</span>
                  <span className="text-[11px] text-pink-300 font-semibold">Matched Pairs</span>
                </div>
                <div className="text-[10px] text-purple-300/70 pt-1 border-t border-white/5">
                  Direct matchmaker recommendations dispatched
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#120724] border border-white/10 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span>Upload Fees &amp; Balance</span>
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${pendingBalance > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                    {currentTenant.currency} {pendingBalance}
                  </span>
                  <span className="text-[11px] text-purple-300 font-semibold">
                    {pendingBalance > 0 ? 'Due' : 'All Settled'}
                  </span>
                </div>
                <div className="text-[10px] text-purple-300/70 pt-1 border-t border-white/5 flex items-center justify-between">
                  <span>Rate: {currentTenant.currency} {currentTenant.feePerClient}/upload</span>
                  {pendingBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsSettleModalOpen(true)}
                      className="text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                    >
                      Settle
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-900/30 to-[#120724] border border-pink-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Elevate Your Agency&apos;s Matchmaking Success</span>
                </h2>
                <p className="text-xs text-purple-200/70 max-w-2xl">
                  Enroll new VIP singles with instant SMS invitation dispatching, pair candidates using our bespoke Matchmaking Studio, and curate introductions directly into candidate chat feeds.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-md shadow-pink-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enroll Single</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('studio')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-pink-300" />
                  <span>Curate Match</span>
                </button>
              </div>
            </div>

            {/* Two-Column Overview Section: Recent Clients & Curated Introductions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recent VIP Singles Added */}
              <div className="lg:col-span-7 bg-[#120724] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-400" />
                    <span>Recent Client Enrolments ({currentAgencyClients.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('clients')}
                    className="text-xs text-pink-400 hover:text-pink-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {currentAgencyClients.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <Users className="w-8 h-8 text-purple-400/40 mx-auto" />
                    <p className="text-xs text-purple-300/70">No clients enrolled under this agency yet.</p>
                    <button
                      type="button"
                      onClick={() => setIsEnrollModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl gradient-fiffy text-white font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Enroll First Client</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {currentAgencyClients.slice(0, 4).map((client) => (
                      <div
                        key={client.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-950/60 border border-purple-500/30">
                              <img
                                src={client.user?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                alt={client.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span
                              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#120724] ${
                                client.clientPoolAccess === 'restricted' ? 'bg-amber-400' : 'bg-emerald-400'
                              }`}
                              title={client.clientPoolAccess === 'restricted' ? 'Restricted Agency Pool' : 'Full Network Pool'}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                              <span>{client.name}, {client.age}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-mono">
                                {client.vipTier?.replace('_', ' ').toUpperCase()}
                              </span>
                              {client.isSavedFully ? (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                  SAVED
                                </span>
                              ) : (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                  STAGED
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-purple-300/70 truncate">
                              📍 {client.city}, {client.country} &bull; {client.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!client.isSavedFully && (
                            <button
                              type="button"
                              onClick={() => setClientToPayFee(client)}
                              className="px-2.5 py-1 rounded-lg gradient-fiffy text-white text-[11px] font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Pay Fee</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClientAId(client.userId || client.id);
                              setActiveTab('studio');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Pair Match
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Curated Introductions Tracker */}
              <div className="lg:col-span-5 bg-[#120724] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-pink-400" />
                    <span>Curated Introductions ({currentAgencyIntroductions.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('studio')}
                    className="text-xs text-pink-400 hover:text-pink-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {currentAgencyIntroductions.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <HeartHandshake className="w-8 h-8 text-purple-400/40 mx-auto" />
                    <p className="text-xs text-purple-300/70">No introductions curated yet.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('studio')}
                      className="px-3 py-1.5 rounded-xl gradient-fiffy text-white font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <HeartHandshake className="w-3 h-3" />
                      <span>Open Matchmaking Studio</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentAgencyIntroductions.slice(0, 3).map((intro) => (
                      <div
                        key={intro.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{intro.clientAName}</span>
                            <span className="text-pink-400">&amp;</span>
                            <span>{intro.clientBName}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold">
                            {intro.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-200/80 italic line-clamp-2">
                          &ldquo;{intro.matchmakerNote}&rdquo;
                        </p>
                        <div className="text-[10px] text-purple-400 pt-1 border-t border-white/5 flex items-center justify-between">
                          <span>Introduced: {new Date(intro.introducedAt).toLocaleDateString()}</span>
                          <span className="text-emerald-400 font-medium">Chat Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: VIP SINGLES ROSTER (CLIENT CRM) */}
        {/* ================================================================= */}
        {activeTab === 'clients' && (
          <div className="space-y-5">
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-pink-400" />
                  <span>VIP Singles Client Roster</span>
                </h2>
                <p className="text-xs text-purple-300/80">
                  Manage candidates enrolled under {currentTenant.name}. Monitor candidate pool privacy, view temporary SMS passwords, and curate introductions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(true)}
                className="px-4 py-2.5 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-md shadow-pink-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll New VIP Single</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-3.5 rounded-2xl bg-[#120724] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  placeholder="Search clients by name, city, phone, or matchmaker notes..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs placeholder:text-purple-300/40 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Gender Filter */}
                <select
                  value={clientFilterGender}
                  onChange={(e) => setClientFilterGender(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-xs text-purple-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="all">All Genders</option>
                  <option value="woman">Women</option>
                  <option value="man">Men</option>
                  <option value="non-binary">Non-Binary</option>
                </select>

                {/* Pool Filter */}
                <select
                  value={clientFilterPool}
                  onChange={(e) => setClientFilterPool(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-xs text-purple-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="all">All Pool Access</option>
                  <option value="restricted">🔒 Agency Pool Only</option>
                  <option value="open">🌐 Full Fiffy Network</option>
                </select>

                {/* DB Persistence / Fee Status Filter */}
                <select
                  value={clientFilterStatus}
                  onChange={(e) => setClientFilterStatus(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-xs text-purple-200 focus:outline-none focus:border-pink-500"
                >
                  <option value="all">All Fee Status</option>
                  <option value="saved">✅ Fully Saved in Live DB</option>
                  <option value="staged">⏳ Staged (Pending Fee)</option>
                </select>
              </div>
            </div>

            {/* Client Cards List */}
            {filteredAgencyClients.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-[#120724] border border-white/10 space-y-3">
                <Users className="w-10 h-10 text-purple-400/40 mx-auto" />
                <p className="text-sm font-semibold text-white">No clients found matching your search.</p>
                <p className="text-xs text-purple-300/70 max-w-sm mx-auto">
                  Try adjusting your search query or enroll a new candidate into your agency pool.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(true)}
                  className="px-4 py-2 rounded-xl gradient-fiffy text-white font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll VIP Single</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgencyClients.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-2xl bg-[#120724] border border-white/10 p-4 shadow-xl space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Header with Avatar & Basic Info */}
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={client.user?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={client.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-500/40 shadow"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 px-1 py-0.2 rounded text-[9px] font-black uppercase text-white ${
                              client.clientPoolAccess === 'restricted' ? 'bg-amber-600' : 'bg-emerald-600'
                            }`}
                          >
                            {client.clientPoolAccess === 'restricted' ? 'Agency' : 'Open'}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-sm font-black text-white truncate">{client.name}, {client.age}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold uppercase shrink-0">
                              {client.vipTier?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-purple-300/80 truncate">
                            📍 {client.city}, {client.country}
                          </p>
                          <p className="text-[11px] text-purple-300/60 font-mono truncate">
                            📱 {client.phone}
                          </p>
                        </div>
                      </div>

                      {/* Data Persistence & Upload Fee Payment Status */}
                      {client.isSavedFully ? (
                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Data Fully Saved in Database</span>
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200 font-mono text-[9px] font-extrabold uppercase">
                              LIVE &bull; PAID
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-emerald-200/70 pt-0.5">
                            <span>Fee Settled: {client.currency || currentTenant.currency} {client.uploadFeeCharged ?? currentTenant.feePerClient}</span>
                            {client.paymentMethod && <span className="font-mono text-[9px]">via {client.paymentMethod}</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>Staged &bull; Awaiting Upload Fee</span>
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 font-mono text-[9px] font-extrabold uppercase">
                              PENDING FEE
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-200/80 leading-relaxed">
                            Upload Fee: <strong className="text-white font-bold">{client.currency || currentTenant.currency} {client.uploadFeeCharged ?? currentTenant.feePerClient}</strong> (calculated from Super Admin console). Profile is staged and will be fully saved to the persistent database once fee is settled.
                          </p>
                          <button
                            type="button"
                            onClick={() => setClientToPayFee(client)}
                            className="w-full py-1.5 rounded-lg gradient-fiffy text-white font-bold text-[11px] shadow-sm flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Upload Fee ({client.currency || currentTenant.currency} {client.uploadFeeCharged ?? currentTenant.feePerClient}) &amp; Fully Save</span>
                          </button>
                        </div>
                      )}

                      {/* Candidate Pool Access Toggle Badge */}
                      <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between text-xs">
                        <span className="text-purple-300 text-[11px] flex items-center gap-1.5">
                          {client.clientPoolAccess === 'restricted' ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Restricted to Agency Pool</span>
                            </>
                          ) : (
                            <>
                              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Full Network Visibility</span>
                            </>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTogglePoolAccess(client)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-white/10 transition-colors cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      {/* Credentials & First-Time Password Status */}
                      <div className="p-2.5 rounded-xl bg-[#190a33] border border-purple-800/40 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-purple-300 font-semibold flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-pink-400" />
                            <span>Temporary SMS Password</span>
                          </span>
                          {client.tempPassword ? (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(client.tempPassword!, 'Temporary Password')}
                              className="text-pink-400 hover:text-pink-300 font-mono text-[10px] font-bold flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                          ) : null}
                        </div>

                        <div className="font-mono text-xs text-white bg-black/30 px-2 py-1 rounded border border-white/5 truncate">
                          {client.isSavedFully
                            ? client.tempPassword || 'Personal password set'
                            : 'Will generate upon fee settlement'}
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <span className="text-purple-300/70">
                            {client.isSavedFully ? (
                              client.firstLoginCompleted ? (
                                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Personal Password Active</span>
                                </span>
                              ) : (
                                <span className="text-amber-300 flex items-center gap-1 font-semibold">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Pending 1st Login Password Change</span>
                                </span>
                              )
                            ) : (
                              <span className="text-amber-300 flex items-center gap-1 font-semibold">
                                <Clock className="w-3 h-3" />
                                <span>SMS invite sent after payment</span>
                              </span>
                            )}
                          </span>

                          {client.isSavedFully ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await resendTenantClientInvite(currentTenant.id, client.id);
                                if (res.success) {
                                  showToast('SMS Dispatched', res.message || 'Invitation SMS resent to client.', 'success');
                                }
                              }}
                              className="text-pink-400 hover:text-pink-300 font-bold underline"
                            >
                              Resend SMS
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setClientToPayFee(client)}
                              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                            >
                              Pay to Send
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Matchmaker Internal Notes */}
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                            Matchmaker Notes
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingClientNotes(client);
                              setTempNotesContent(client.matchmakerNotes || '');
                            }}
                            className="text-[10px] text-pink-400 hover:text-pink-300 font-semibold"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="text-[11px] text-purple-200/80 italic bg-white/[0.02] p-2 rounded-lg border border-white/5 line-clamp-2">
                          {client.matchmakerNotes || 'No notes added yet.'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Card Actions */}
                    <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                      {client.isSavedFully ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClientAId(client.userId || client.id);
                            setActiveTab('studio');
                          }}
                          className="flex-1 py-2 rounded-xl gradient-fiffy text-white font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Curate Match</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setClientToPayFee(client)}
                            className="flex-1 py-2 rounded-xl gradient-fiffy text-white font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Fee &amp; Fully Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClientAId(client.userId || client.id);
                              setActiveTab('studio');
                            }}
                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 font-bold text-xs border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
                            title="Preview Matchmaking Studio"
                          >
                            <HeartHandshake className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: MATCHMAKING STUDIO & INTRODUCTIONS */}
        {/* ================================================================= */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-pink-400" />
                <span>Matchmaking Studio &amp; Curated Introductions</span>
              </h2>
              <p className="text-xs text-purple-300/80">
                Pair two clients with a personalized recommendation from your agency. An introduction creates a mutual match immediately and opens a dedicated chat conversation.
              </p>
            </div>

            {/* Interactive Pairing Workspace */}
            <div className="p-5 rounded-2xl bg-[#120724] border border-pink-500/30 shadow-2xl space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Curate a New Match Pair</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Client A Selection */}
                <div className="p-4 rounded-xl bg-[#1a0c33] border border-white/10 space-y-3">
                  <label className="block text-xs font-bold text-purple-200">
                    Candidate A (Agency Client)
                  </label>
                  <select
                    value={selectedClientAId}
                    onChange={(e) => setSelectedClientAId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#120724] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                  >
                    <option value="">-- Choose Candidate A --</option>
                    {currentAgencyClients.map((c) => (
                      <option key={c.id} value={c.userId || c.id}>
                        {c.name}, {c.age} ({c.gender}) &bull; {c.city}
                      </option>
                    ))}
                  </select>

                  {selectedClientA && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <img
                        src={selectedClientA.user?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={selectedClientA.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-pink-500/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{selectedClientA.name}, {selectedClientA.age}</p>
                        <p className="text-[11px] text-purple-300/70 truncate">📍 {selectedClientA.city}, {selectedClientA.country}</p>
                        <p className="text-[10px] text-pink-300 font-semibold">{selectedClientA.vipTier?.toUpperCase()}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate B Selection */}
                <div className="p-4 rounded-xl bg-[#1a0c33] border border-white/10 space-y-3">
                  <label className="block text-xs font-bold text-purple-200">
                    Candidate B (Match Partner)
                  </label>
                  <select
                    value={selectedCandidateBId}
                    onChange={(e) => setSelectedCandidateBId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#120724] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                  >
                    <option value="">-- Choose Candidate B --</option>
                    {candidateBOptions.map((c) => (
                      <option key={c.id} value={c.userId || c.id}>
                        {c.name}, {c.age} ({c.gender}) &bull; {c.city}
                      </option>
                    ))}
                  </select>

                  {selectedCandidateB && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <img
                        src={selectedCandidateB.user?.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                        alt={selectedCandidateB.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-pink-500/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{selectedCandidateB.name}, {selectedCandidateB.age}</p>
                        <p className="text-[11px] text-purple-300/70 truncate">📍 {selectedCandidateB.city}, {selectedCandidateB.country}</p>
                        <p className="text-[10px] text-pink-300 font-semibold">{selectedCandidateB.vipTier?.toUpperCase()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Matchmaker Recommendation Note Editor */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-purple-200 flex items-center justify-between">
                  <span>Matchmaker Introduction Note (Sent to Both Candidates)</span>
                  <span className="text-[10px] text-purple-400 font-normal">Personalized rationale for the match</span>
                </label>
                <textarea
                  rows={3}
                  value={matchmakerCuratedNote}
                  onChange={(e) => setMatchmakerCuratedNote(e.target.value)}
                  placeholder="Explain to both singles why your agency paired them..."
                  className="w-full p-3 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs placeholder:text-purple-300/40 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {/* Action: Dispatch Introduction */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={!selectedClientA || !selectedCandidateB || isDispatchingIntro}
                  onClick={handleDispatchIntroduction}
                  className="px-6 py-2.5 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-lg shadow-pink-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDispatchingIntro ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting Candidates...</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="w-4 h-4" />
                      <span>Dispatch Curated Introduction</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* History of Curated Introductions */}
            <div className="bg-[#120724] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-pink-400" />
                <span>Agency Introduction Records ({currentAgencyIntroductions.length})</span>
              </h3>

              {currentAgencyIntroductions.length === 0 ? (
                <div className="py-12 text-center text-xs text-purple-300/60">
                  No curated introductions recorded for {currentTenant.name} yet. Use the pairing studio above to create your first connection.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {currentAgencyIntroductions.map((intro) => (
                    <div key={intro.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs">{intro.clientAName}</span>
                          <span className="text-pink-400 text-xs">&amp;</span>
                          <span className="font-bold text-white text-xs">{intro.clientBName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold uppercase">
                            {intro.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-purple-200/80 italic">&ldquo;{intro.matchmakerNote}&rdquo;</p>
                        <p className="text-[10px] text-purple-400">
                          Curated on {new Date(intro.introducedAt).toLocaleDateString()} &bull; Agency ID: {intro.tenantId}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mutual Connection Established</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: CANDIDATE TALENT POOL DISCOVERY */}
        {/* ================================================================= */}
        {activeTab === 'pool' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-pink-400" />
                <span>Agency Candidate Talent Pool</span>
              </h2>
              <p className="text-xs text-purple-300/80">
                Browse through candidate profiles to discover potential matches for your agency clients.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentAgencyClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-2xl bg-[#120724] border border-white/10 overflow-hidden shadow-lg flex flex-col justify-between group hover:border-pink-500/40 transition-all"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-purple-950">
                    <img
                      src={client.user?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                      alt={client.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-sm font-black truncate">{client.name}, {client.age}</p>
                      <p className="text-[11px] text-purple-200/90 truncate">📍 {client.city}, {client.country}</p>
                      <p className="text-[10px] text-pink-300 font-bold uppercase mt-0.5">{client.vipTier?.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <p className="text-[11px] text-purple-300/80 line-clamp-2 italic">
                      &ldquo;{client.matchmakerNotes || 'Verified agency client'}&rdquo;
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClientAId(client.userId || client.id);
                        setActiveTab('studio');
                      }}
                      className="w-full py-1.5 rounded-xl gradient-fiffy text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Select for Pairing</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: UPLOAD LEDGER & INVOICES */}
        {/* ================================================================= */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-pink-400" />
                <span>Upload Fee Ledger &amp; Invoices</span>
              </h2>
              <p className="text-xs text-purple-300/80">
                Under the Fiffy Agency Partner Agreement, your agency is billed {currentTenant.currency} {currentTenant.feePerClient} per VIP candidate enrolled on the network.
              </p>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#120724] border border-white/10 shadow-lg space-y-1.5">
                <span className="text-xs text-purple-300">Total Enrolled Clients</span>
                <p className="text-2xl font-black text-white">{currentAgencyClients.length}</p>
                <p className="text-[10px] text-purple-300/70">Rate: {currentTenant.currency} {currentTenant.feePerClient} / single</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#120724] border border-white/10 shadow-lg space-y-1.5">
                <span className="text-xs text-purple-300">Total Upload Fees Billed</span>
                <p className="text-2xl font-black text-white">{currentTenant.currency} {totalBilled}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">{currentTenant.currency} {totalPaid} Paid</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#120724] border border-pink-500/30 shadow-lg space-y-1.5">
                <span className="text-xs text-pink-300 font-bold">Outstanding Balance Owed</span>
                <p className={`text-2xl font-black ${pendingBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {currentTenant.currency} {pendingBalance}
                </p>
                {pendingBalance > 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsSettleModalOpen(true)}
                    className="mt-1 px-3 py-1 rounded-lg gradient-fiffy text-white font-bold text-[11px] inline-flex items-center gap-1 shadow cursor-pointer"
                  >
                    <DollarSign className="w-3 h-3" />
                    <span>Settle Invoices</span>
                  </button>
                ) : (
                  <p className="text-[10px] text-emerald-400 font-semibold">Account in good standing</p>
                )}
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-[#120724] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-pink-400" />
                    <span>Invoice Items &amp; Data Saving Status ({currentAgencyInvoices.length})</span>
                  </h3>
                  <p className="text-[11px] text-purple-300/70 mt-0.5">
                    Upload fee per client: {currentTenant.currency} {currentTenant.feePerClient} (set by Super Admin). Data is fully saved upon payment.
                  </p>
                </div>
                {pendingBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsSettleModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-md shadow-pink-500/25 flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pay All Pending &amp; Save All Staged ({currentTenant.currency} {pendingBalance})</span>
                  </button>
                )}
              </div>

              {currentAgencyInvoices.length === 0 ? (
                <div className="py-12 text-center text-xs text-purple-300/60">
                  No invoice records found for this agency.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[11px] font-bold text-purple-300 uppercase">
                        <th className="pb-3 pr-4">Invoice ID</th>
                        <th className="pb-3 px-4">Client Single</th>
                        <th className="pb-3 px-4">Upload Date</th>
                        <th className="pb-3 px-4">Fee Amount</th>
                        <th className="pb-3 px-4">Fee Status</th>
                        <th className="pb-3 pl-4 text-right">Data &amp; Activation Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-purple-200">
                      {currentAgencyInvoices.map((inv) => {
                        const matchingClient = currentAgencyClients.find(
                          (c) => c.id === inv.clientId || c.userId === inv.clientId
                        );
                        return (
                          <tr key={inv.id} className="hover:bg-white/[0.02]">
                            <td className="py-3 pr-4 font-mono text-[11px] text-purple-400">{inv.id}</td>
                            <td className="py-3 px-4 font-bold text-white">
                              <div>{inv.clientName}</div>
                              <div className="text-[10px] text-purple-400 font-mono">{inv.clientPhone}</div>
                            </td>
                            <td className="py-3 px-4 text-purple-300/80">
                              {new Date(inv.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-black text-white">
                              {inv.currency} {inv.amount}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  inv.status === 'paid'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {inv.status === 'paid' ? 'Paid & Settled' : 'Pending Fee'}
                              </span>
                            </td>
                            <td className="py-3 pl-4 text-right">
                              {inv.status === 'paid' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Fully Saved in Live DB</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (matchingClient) {
                                      setClientToPayFee(matchingClient);
                                    } else {
                                      setClientToPayFee({
                                        id: inv.clientId,
                                        tenantId: currentTenant.id,
                                        userId: inv.clientId,
                                        name: inv.clientName,
                                        phone: inv.clientPhone,
                                        age: 28,
                                        city: currentTenant.city,
                                        country: currentTenant.country,
                                        gender: 'female',
                                        interestedIn: 'men',
                                        vipTier: 'standard_vip',
                                        clientPoolAccess: 'restricted',
                                        enrollmentStatus: 'awaiting_payment',
                                        uploadFeeCharged: inv.amount,
                                        currency: inv.currency,
                                        isSavedFully: false,
                                        createdAt: inv.createdAt,
                                      });
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg gradient-fiffy text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>Pay Fee &amp; Fully Save</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: AGENCY SETTINGS & BRANDING */}
        {/* ================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-pink-400" />
                <span>Agency Profile &amp; Settings</span>
              </h2>
              <p className="text-xs text-purple-300/80">
                Update your agency details, lead matchmaker contact information, and default candidate pool policy.
              </p>
            </div>

            <form onSubmit={handleSaveAgencySettings} className="p-6 rounded-2xl bg-[#120724] border border-white/10 shadow-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">Agency Brand Name</label>
                  <input
                    type="text"
                    value={agencySettingsForm.name}
                    onChange={(e) => setAgencySettingsForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">Lead Matchmaker(s)</label>
                  <input
                    type="text"
                    value={agencySettingsForm.contactName}
                    onChange={(e) => setAgencySettingsForm((prev) => ({ ...prev, contactName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">Agency Email</label>
                  <input
                    type="email"
                    value={agencySettingsForm.contactEmail}
                    onChange={(e) => setAgencySettingsForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">Agency Contact Phone</label>
                  <input
                    type="text"
                    value={agencySettingsForm.contactPhone}
                    onChange={(e) => setAgencySettingsForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">Agency Logo URL</label>
                <input
                  type="url"
                  value={agencySettingsForm.logoUrl}
                  onChange={(e) => setAgencySettingsForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">Default Candidate Pool Access</label>
                <select
                  value={agencySettingsForm.defaultClientPoolAccess}
                  onChange={(e) => setAgencySettingsForm((prev) => ({ ...prev, defaultClientPoolAccess: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                >
                  <option value="restricted">🔒 Restricted (Candidates only see other agency candidates by default)</option>
                  <option value="open">🌐 Full Fiffy Network (Candidates can browse entire singles deck)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">Agency Description &amp; Specialty</label>
                <textarea
                  rows={3}
                  value={agencySettingsForm.notes}
                  onChange={(e) => setAgencySettingsForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-md shadow-pink-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Save Agency Profile
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* MODAL: ENROLL VIP CLIENT */}
      {/* ================================================================= */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#120724] border border-pink-500/40 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-bold text-white">
                  Enroll VIP Single &bull; {currentTenant.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-purple-300 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollClient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.name}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Nomvula Dlamini"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Phone Number (For SMS Invite)</label>
                  <input
                    type="text"
                    required
                    value={enrollForm.phone}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+27 82 000 0000"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Gender</label>
                  <select
                    value={enrollForm.gender}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="woman">Woman</option>
                    <option value="man">Man</option>
                    <option value="non-binary">Non-Binary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={enrollForm.dob}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, dob: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">City</label>
                  <input
                    type="text"
                    value={enrollForm.city}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Country</label>
                  <select
                    value={enrollForm.country}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  >
                    {AFRICAN_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Candidate Pool Visibility</label>
                  <select
                    value={enrollForm.clientPoolAccess}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, clientPoolAccess: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="restricted">🔒 Agency Pool Only (Exclusive)</option>
                    <option value="open">🌐 Full Fiffy Network (Can browse all)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-purple-200 mb-1">VIP Tier</label>
                  <select
                    value={enrollForm.vipTier}
                    onChange={(e) => setEnrollForm((prev) => ({ ...prev, vipTier: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="standard_vip">Standard VIP</option>
                    <option value="executive_vip">Executive VIP</option>
                    <option value="presidential_vip">Presidential VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Candidate Bio &amp; Background</label>
                <textarea
                  rows={2}
                  value={enrollForm.bio}
                  onChange={(e) => setEnrollForm((prev) => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Matchmaker Private Evaluation Notes</label>
                <textarea
                  rows={2}
                  value={enrollForm.matchmakerNotes}
                  onChange={(e) => setEnrollForm((prev) => ({ ...prev, matchmakerNotes: e.target.value }))}
                  placeholder="Preferences, dealbreakers, and personality observations..."
                  className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200/90 space-y-2.5">
                <div className="flex items-center justify-between font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-pink-400" />
                    <span>Upload Fee (Configured in DB by Super Admin):</span>
                  </span>
                  <span className="text-pink-300 font-black text-sm">
                    {currentTenant.currency} {currentTenant.feePerClient}
                  </span>
                </div>

                <p className="text-[11px] text-purple-300/80 leading-relaxed">
                  🛡️ <strong>Platform Data Policy:</strong> Client profile data is only fully saved to the live database and active matching network upon payment of the upload fee.
                </p>

                {/* Enrollment Payment Mode Selector */}
                <div className="pt-2 border-t border-purple-800/30 space-y-2">
                  <label className="block text-[11px] font-bold text-purple-200 uppercase tracking-wide">
                    Enrollment &amp; Payment Options:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEnrollPayImmediately(true)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        enrollPayImmediately
                          ? 'bg-pink-500/20 border-pink-500 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-purple-300/70 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>Pay Fee Now</span>
                        {enrollPayImmediately && <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />}
                      </div>
                      <p className="text-[10px] text-purple-300/80 mt-0.5">
                        Fully save data immediately &amp; dispatch SMS invite.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEnrollPayImmediately(false)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        !enrollPayImmediately
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-purple-300/70 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>Stage Data (Pay Later)</span>
                        {!enrollPayImmediately && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[10px] text-purple-300/80 mt-0.5">
                        Stage record. Fully saves upon upload fee payment.
                      </p>
                    </button>
                  </div>

                  {enrollPayImmediately && (
                    <div className="pt-1.5 space-y-1">
                      <label className="block text-[10px] font-semibold text-purple-300">
                        Select Payment Method:
                      </label>
                      <select
                        value={enrollPaymentMethod}
                        onChange={(e) => setEnrollPaymentMethod(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a0c33] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                      >
                        <option value="PayFast Instant EFT">⚡ PayFast Instant EFT (South Africa)</option>
                        <option value="Credit / Debit Card">💳 Visa / MasterCard (Online Payment)</option>
                        <option value="Agency Corporate Account">💼 Agency Corporate Prepaid Balance</option>
                        <option value="SnapScan / Zapper">📱 SnapScan / Zapper QR</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEnrolling}
                  className="flex-1 py-2.5 rounded-xl gradient-fiffy text-white font-bold shadow-md shadow-pink-500/25 flex items-center justify-center gap-1.5"
                >
                  {isEnrolling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{enrollPayImmediately ? 'Processing Fee & Saving...' : 'Staging Client...'}</span>
                    </>
                  ) : (
                    <>
                      {enrollPayImmediately ? (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay {currentTenant.currency} {currentTenant.feePerClient} &amp; Fully Save</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Stage Client Profile</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: PAY SINGLE CLIENT UPLOAD FEE */}
      {/* ================================================================= */}
      {clientToPayFee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-[#120724] border border-pink-500/40 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-bold text-white">
                  Pay Upload Fee &bull; {clientToPayFee.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setClientToPayFee(null)}
                className="text-purple-300 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-purple-200">
              {/* Candidate mini summary */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                <img
                  src={clientToPayFee.user?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={clientToPayFee.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-pink-500/30"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white text-sm truncate">{clientToPayFee.name}</p>
                  <p className="text-purple-300/80 text-[11px] truncate">
                    📍 {clientToPayFee.city}, {clientToPayFee.country} &bull; {clientToPayFee.phone}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                    Status: Staged &bull; Awaiting Payment
                  </span>
                </div>
              </div>

              {/* Fee Notice */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-pink-950/40 to-purple-900/30 border border-pink-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Upload Fee Due:</span>
                  <span className="text-base text-pink-300 font-black">
                    {clientToPayFee.currency || currentTenant.currency} {clientToPayFee.uploadFeeCharged ?? currentTenant.feePerClient}
                  </span>
                </div>
                <p className="text-[11px] text-purple-200/80 leading-relaxed">
                  Calculated according to the Super Admin platform rate saved in the database ({currentTenant.currency} {currentTenant.feePerClient} per client upload).
                </p>
              </div>

              {/* Data Persistence Promise */}
              <div className="p-3 rounded-xl bg-[#1a0c33] border border-purple-800/40 space-y-1.5 text-[11px]">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Permanent Database Persistence &amp; Activation:</span>
                </p>
                <ul className="space-y-1 text-purple-300/80 list-disc list-inside">
                  <li>Client profile will be fully saved to the persistent users database.</li>
                  <li>Activated in the matching pool for introductions.</li>
                  <li>SMS invitation dispatched with login credentials to {clientToPayFee.phone}.</li>
                </ul>
              </div>

              {/* Payment Gateway / Method */}
              <div>
                <label className="block font-semibold text-purple-200 mb-1.5">
                  Select Settlement Method:
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="PayFast Instant EFT">⚡ PayFast Instant EFT (South Africa)</option>
                  <option value="Credit / Debit Card">💳 Visa / MasterCard (Online Payment)</option>
                  <option value="Agency Corporate Account">💼 Agency Corporate Prepaid Balance</option>
                  <option value="SnapScan / Zapper">📱 SnapScan / Zapper QR</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setClientToPayFee(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPayingUploadFee}
                  onClick={handlePayClientUploadFee}
                  className="flex-1 py-2.5 rounded-xl gradient-fiffy text-white font-bold shadow-md shadow-pink-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPayingUploadFee ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Pay {clientToPayFee.currency || currentTenant.currency} {clientToPayFee.uploadFeeCharged ?? currentTenant.feePerClient} &amp; Fully Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: EDIT MATCHMAKER NOTES */}
      {/* ================================================================= */}
      {editingClientNotes && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#120724] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">
                Matchmaker Evaluation Notes &bull; {editingClientNotes.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingClientNotes(null)}
                className="text-purple-300 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-purple-200 font-semibold">
                Internal Agency Notes (Dating Goals, Dealbreakers, Match Criteria)
              </label>
              <textarea
                rows={5}
                value={tempNotesContent}
                onChange={(e) => setTempNotesContent(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingClientNotes(null)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="flex-1 py-2 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-md shadow-pink-500/25"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: SETTLE INVOICES REMITTANCE */}
      {/* ================================================================= */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#120724] border border-amber-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Settle Upload Invoices</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettleModalOpen(false)}
                className="text-purple-300 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-purple-200">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold">
                Total Outstanding Balance: {currentTenant.currency} {pendingBalance}
              </div>

              <p>
                As an agency partner, upload fees can be reconciled via Direct EFT remittance or PayFast instant settlement.
              </p>

              <div className="p-3 rounded-xl bg-[#1a0c33] border border-white/10 space-y-1 font-mono text-[11px]">
                <p className="text-white font-bold">EFT Settlement Details:</p>
                <p>Bank: First National Bank (FNB)</p>
                <p>Account: Fiffy Matchmaking Enterprise</p>
                <p>Reference: {currentTenant.slug.toUpperCase()}-FEES</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSettleModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSettling}
                onClick={handleSimulateSettleBalance}
                className="flex-1 py-2.5 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-md shadow-pink-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSettling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Reconciling...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Settlement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
