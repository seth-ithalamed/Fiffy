import React, { useState } from 'react';
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
  Trash2,
  Edit2,
  Eye,
  HeartHandshake,
  DollarSign,
  Phone,
  Mail,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  FileText,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Tenant, TenantClient, TenantBillingRecord } from '../../types';
import { AFRICAN_COUNTRIES } from '../../data/mockData';

export const MatchmakingTenantsManager: React.FC = () => {
  const {
    tenants,
    tenantClients,
    tenantBillingRecords,
    tenantBillingSummary,
    tenantIntroductions,
    selectedTenantId,
    setSelectedTenantId,
    createTenant,
    updateTenant,
    deleteTenant,
    createTenantClient,
    updateTenantClient,
    resendTenantClientInvite,
    createTenantIntroduction,
    updateTenantBillingStatus,
    showToast,
    setActiveSurface,
    switchTenantWorkspace,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'agencies' | 'clients' | 'introductions' | 'billing'>('agencies');

  // Agency Modal State
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Tenant | null>(null);
  const [agencyForm, setAgencyForm] = useState({
    name: '',
    slug: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '+27 11 ',
    feePerClient: 250,
    currency: 'ZAR',
    defaultClientPoolAccess: 'restricted' as 'restricted' | 'full_network',
    notes: '',
    logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  });

  // Client Modal State (Enroll VIP Single)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    tenantId: selectedTenantId || (tenants[0]?.id ?? 'tenant-1'),
    name: '',
    phone: '+27 82 ',
    email: '',
    gender: 'Woman',
    dob: '1996-05-18',
    city: 'Johannesburg',
    country: 'South Africa',
    bio: '',
    clientPoolAccess: 'restricted' as 'restricted' | 'full_network',
    vipTier: 'executive_vip',
    matchmakerNotes: '',
    password: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  });

  // Introduction Modal State
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const [introForm, setIntroForm] = useState({
    tenantId: selectedTenantId || (tenants[0]?.id ?? 'tenant-1'),
    clientAId: '',
    clientBId: '',
    matchmakerNote: 'Personally introduced by our agency matchmaker for aligned values and relationship goals.',
  });

  const [filterTenant, setFilterTenant] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active tenants calculation
  const totalClientsCount = tenantClients.length;
  const filteredClients = filterTenant === 'all'
    ? tenantClients
    : tenantClients.filter((c) => c.tenantId === filterTenant);

  // Handle Create / Edit Tenant Agency
  const handleSaveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyForm.name.trim()) {
      showToast('Validation Error', 'Agency name is required.');
      return;
    }

    setIsSubmitting(true);
    if (editingAgency) {
      await updateTenant(editingAgency.id, agencyForm);
    } else {
      await createTenant(agencyForm);
    }
    setIsSubmitting(false);
    setIsAgencyModalOpen(false);
    setEditingAgency(null);
  };

  // Handle Enroll Single Under Tenant Agency
  const handleEnrollClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim() || !clientForm.phone.trim()) {
      showToast('Validation Error', 'Client full name and mobile phone are required for SMS invitation.');
      return;
    }

    setIsSubmitting(true);
    const resolvedTenantId = clientForm.tenantId || selectedTenantId || tenants[0]?.id || 'tenant-1';
    const res = await createTenantClient(resolvedTenantId, {
      ...clientForm,
      photos: [clientForm.photoUrl],
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsClientModalOpen(false);
      setClientForm({
        tenantId: resolvedTenantId,
        name: '',
        phone: '+27 82 ',
        email: '',
        gender: 'Woman',
        dob: '1996-05-18',
        city: 'Johannesburg',
        country: 'South Africa',
        bio: '',
        clientPoolAccess: 'restricted',
        vipTier: 'executive_vip',
        matchmakerNotes: '',
        password: '',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      });
    }
  };

  // Handle Curated Introduction
  const handleCreateIntroduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!introForm.clientAId || !introForm.clientBId) {
      showToast('Validation Error', 'Please select two distinct clients for an introduction.');
      return;
    }

    setIsSubmitting(true);
    const res = await createTenantIntroduction(
      introForm.tenantId,
      introForm.clientAId,
      introForm.clientBId,
      introForm.matchmakerNote
    );
    setIsSubmitting(false);
    if (res.success) {
      setIsIntroModalOpen(false);
    }
  };

  return (
    <div id="matchmaking-tenants-manager" className="space-y-6">
      {/* Top Banner & KPI Summary for Platform Owner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#180933] via-[#210c44] to-[#14062a] border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Platform Owner Super Admin
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/20 text-pink-300">
                Multi-Tenant B2B Model
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1.5 font-display flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Matchmaking Agencies &amp; VIP Tenant Network</span>
            </h2>
            <p className="text-xs text-purple-200/80 mt-1 max-w-3xl leading-relaxed">
              Matchmakers upload VIP singles onto the platform and pay an upload fee per client. You control pool
              visibility (restricting clients to agency candidates or opening full platform discovery) and automatically
              dispatch SMS invitations with temporary passwords.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="enroll-vip-single-btn"
              onClick={() => setIsClientModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl gradient-fiffy text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:brightness-110 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Enroll VIP Single</span>
            </button>
            <button
              id="register-agency-btn"
              onClick={() => {
                setEditingAgency(null);
                setAgencyForm({
                  name: '',
                  slug: '',
                  contactName: '',
                  contactEmail: '',
                  contactPhone: '+27 11 ',
                  feePerClient: 250,
                  currency: 'ZAR',
                  defaultClientPoolAccess: 'restricted',
                  notes: '',
                  logoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
                });
                setIsAgencyModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Register Agency</span>
            </button>
          </div>
        </div>

        {/* 4 Super-Admin Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
          <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
            <div className="text-[11px] text-purple-300 font-medium">Tenant Agencies</div>
            <div className="text-xl font-black text-white mt-0.5">{tenants.length} Enrolled</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Active Partners</div>
          </div>
          <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
            <div className="text-[11px] text-purple-300 font-medium">VIP Singles Uploaded</div>
            <div className="text-xl font-black text-white mt-0.5">{totalClientsCount} Clients</div>
            <div className="text-[10px] text-pink-400 mt-0.5">SMS Invited &amp; Enrolled</div>
          </div>
          <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
            <div className="text-[11px] text-purple-300 font-medium">Pending Upload Fees</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              R {tenantBillingSummary.totalPending.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">Receivable from Agencies</div>
          </div>
          <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
            <div className="text-[11px] text-purple-300 font-medium">Collected B2B Fees</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              R {tenantBillingSummary.totalCollected.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">Paid into Platform</div>
          </div>
        </div>
      </div>

      {/* Internal Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'agencies', label: 'Matchmaking Agencies', count: tenants.length, icon: Building2 },
            { id: 'clients', label: 'VIP Singles Roster', count: tenantClients.length, icon: Users },
            { id: 'introductions', label: 'Curated Introductions', count: tenantIntroductions.length, icon: HeartHandshake },
            { id: 'billing', label: 'Upload Invoices & Ledger', count: tenantBillingRecords.length, icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tenant-subtab-${tab.id}`}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                    : 'text-purple-300/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-white font-extrabold">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Agency Filter if viewing clients */}
        {activeSubTab === 'clients' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-300">Filter by Agency:</span>
            <select
              id="filter-agency-select"
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Agencies ({tenantClients.length})</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({tenantClients.filter((c) => c.tenantId === t.id).length})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 1: MATCHMAKING AGENCIES LIST */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'agencies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => {
            const agencyClients = tenantClients.filter((c) => c.tenantId === tenant.id);
            return (
              <div
                key={tenant.id}
                id={`tenant-card-${tenant.id}`}
                className="p-5 rounded-2xl bg-[#130726] border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={tenant.logoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
                        alt={tenant.name}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 shadow"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm leading-tight">{tenant.name}</h4>
                        <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                          {tenant.contactName}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active Tenant
                    </span>
                  </div>

                  <p className="text-xs text-purple-200/80 line-clamp-2">{tenant.notes}</p>

                  <div className="space-y-1.5 text-xs text-purple-300/80 bg-white/5 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Fee per client upload:
                      </span>
                      <strong className="text-white font-bold">
                        {tenant.currency} {tenant.feePerClient}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-pink-400" /> Singles Uploaded:
                      </span>
                      <strong className="text-white font-bold">{agencyClients.length} clients</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-purple-400" /> Default Pool Access:
                      </span>
                      <strong className="text-amber-300 font-semibold capitalize">
                        {tenant.defaultClientPoolAccess === 'restricted' ? 'Agency Roster Only' : 'Full Network'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-stone-400">Balance Owed:</span>
                      <span className="text-amber-400 font-black">
                        {tenant.currency} {(tenant.balanceOwed || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      switchTenantWorkspace(tenant.id);
                      setActiveSurface('tenant-portal');
                    }}
                    className="flex-1 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 hover:text-white border border-pink-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Launch dedicated partner portal for this agency"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Agency Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      setClientForm((prev) => ({ ...prev, tenantId: tenant.id }));
                      setIsClientModalOpen(true);
                    }}
                    className="py-2 px-3 rounded-xl gradient-fiffy text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow hover:brightness-110 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Enroll</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingAgency(tenant);
                      setAgencyForm({
                        name: tenant.name,
                        slug: tenant.slug,
                        contactName: tenant.contactName,
                        contactEmail: tenant.contactEmail,
                        contactPhone: tenant.contactPhone,
                        feePerClient: tenant.feePerClient,
                        currency: tenant.currency,
                        defaultClientPoolAccess: tenant.defaultClientPoolAccess,
                        notes: tenant.notes,
                        logoUrl: tenant.logoUrl,
                      });
                      setIsAgencyModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white transition-all cursor-pointer"
                    title="Edit Agency Settings"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete matchmaking agency "${tenant.name}"?`)) {
                        deleteTenant(tenant.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-all cursor-pointer"
                    title="Delete Agency"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 2: VIP SINGLES ROSTER (TENANT CLIENTS) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-400" />
                <span>Enrolled Singles ({filteredClients.length})</span>
              </h3>
              <p className="text-xs text-purple-300/80">
                Singles receive SMS invitations with login instructions and temporary passwords, enforced to change on
                first login.
              </p>
            </div>
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-fiffy text-white text-xs font-bold shadow hover:brightness-110"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll New Client</span>
            </button>
          </div>

          <div className="bg-[#130726] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-[11px] font-bold uppercase text-purple-300 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Client Profile</th>
                    <th className="py-3 px-4">Agency Tenant</th>
                    <th className="py-3 px-4">Pool Visibility</th>
                    <th className="py-3 px-4">SMS Invitation</th>
                    <th className="py-3 px-4">First-Time Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClients.map((client) => {
                    const isRestricted = client.clientPoolAccess === 'restricted';
                    return (
                      <tr key={client.id} id={`tenant-client-row-${client.id}`} className="hover:bg-white/[0.02]">
                        {/* Profile Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center font-bold text-white overflow-hidden">
                              {client.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{client.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                                  {client.vipTier === 'executive_vip' ? 'Executive VIP' : 'Elite'}
                                </span>
                              </div>
                              <div className="text-[11px] text-purple-300/80">
                                {client.age} yrs • {client.city}, {client.country}
                              </div>
                              <div className="text-[10px] text-stone-400 font-mono mt-0.5">{client.phone}</div>
                            </div>
                          </div>
                        </td>

                        {/* Agency */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-amber-300">{client.tenantName}</span>
                          <div className="text-[10px] text-purple-400">
                            Upload Fee: {client.currency || 'ZAR'} {client.uploadFeeCharged}
                          </div>
                          {client.isSavedFully ? (
                            <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>LIVE &bull; SAVED IN DB</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                              <Clock className="w-2.5 h-2.5" />
                              <span>STAGED &bull; AWAITING FEE</span>
                            </span>
                          )}
                        </td>

                        {/* Pool Access Switch */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              const newAccess = isRestricted ? 'full_network' : 'restricted';
                              updateTenantClient(client.tenantId, client.id, { clientPoolAccess: newAccess });
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              isRestricted
                                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                                : 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30'
                            }`}
                            title="Click to toggle pool visibility"
                          >
                            {isRestricted ? <Lock className="w-3 h-3 text-purple-400" /> : <Globe2 className="w-3 h-3 text-emerald-400" />}
                            <span>{isRestricted ? 'Agency Pool Only' : 'Full Fiffy Network'}</span>
                          </button>
                        </td>

                        {/* SMS Invitation Status */}
                        <td className="py-3 px-4">
                          {client.smsInviteSent ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> SMS Dispatched
                              </span>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                Sent to {client.phone}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Not Sent
                            </span>
                          )}
                        </td>

                        {/* First-Time Login / Password Change */}
                        <td className="py-3 px-4">
                          {client.firstLoginCompleted ? (
                            <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Password Changed
                            </span>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 text-amber-300 font-semibold text-[11px]">
                                <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Temp Password Active
                              </span>
                              <div className="text-[10px] text-stone-400 mt-0.5">
                                Must change on first login
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <button
                            id={`resend-sms-${client.id}`}
                            onClick={() => resendTenantClientInvite(client.tenantId, client.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-[11px] font-bold border border-pink-500/30 cursor-pointer"
                            title="Resend SMS Invite with Access Info & Temp Password"
                          >
                            <Send className="w-3 h-3" />
                            <span>Resend SMS</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 3: CURATED INTRODUCTIONS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'introductions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-pink-400" />
                <span>Curated Matchmaker Introductions ({tenantIntroductions.length})</span>
              </h3>
              <p className="text-xs text-purple-300/80">
                Matchmakers connect high-value clients directly. Once introduced, a conversation thread is established
                between them.
              </p>
            </div>
            <button
              onClick={() => setIsIntroModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-fiffy text-white text-xs font-bold shadow hover:brightness-110"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Curated Introduction</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tenantIntroductions.map((intro) => (
              <div
                key={intro.id}
                className="p-4 rounded-2xl bg-[#130726] border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {intro.tenantName}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(intro.introducedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center font-bold text-white mx-auto mb-1">
                      {intro.clientAName.charAt(0)}
                    </div>
                    <div className="font-bold text-white text-xs">{intro.clientAName}</div>
                  </div>

                  <div className="px-3 text-pink-400">
                    <HeartHandshake className="w-5 h-5 animate-pulse" />
                  </div>

                  <div className="text-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-white mx-auto mb-1">
                      {intro.clientBName.charAt(0)}
                    </div>
                    <div className="font-bold text-white text-xs">{intro.clientBName}</div>
                  </div>
                </div>

                <p className="text-xs text-purple-200/90 italic bg-black/20 p-2.5 rounded-xl border border-white/5">
                  &quot;{intro.matchmakerNote}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB 4: UPLOAD INVOICES & REVENUE LEDGER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'billing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Tenant Upload Invoices &amp; Ledger ({tenantBillingRecords.length})</span>
              </h3>
              <p className="text-xs text-purple-300/80">
                Real-time accounting ledger. Each time a matchmaker uploads a VIP single, a fee is billed to the agency.
              </p>
            </div>
          </div>

          <div className="bg-[#130726] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-[11px] font-bold uppercase text-purple-300 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Invoice ID</th>
                    <th className="py-3 px-4">Matchmaking Agency</th>
                    <th className="py-3 px-4">Uploaded Client</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tenantBillingRecords.map((record) => {
                    const isPaid = record.status === 'paid';
                    return (
                      <tr key={record.id} id={`billing-row-${record.id}`} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-mono text-[11px] text-purple-400">{record.id}</td>
                        <td className="py-3 px-4 font-bold text-white">{record.tenantName}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{record.clientName}</div>
                          <div className="text-[10px] text-stone-400">{record.clientPhone}</div>
                        </td>
                        <td className="py-3 px-4 font-black text-amber-400">
                          {record.currency} {record.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isPaid
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{record.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isPaid ? (
                            <button
                              id={`mark-paid-btn-${record.id}`}
                              onClick={() => updateTenantBillingStatus(record.id, 'paid')}
                              className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <span className="text-[11px] text-stone-400">Paid on {new Date(record.paidAt || '').toLocaleDateString()}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: REGISTER / EDIT TENANT AGENCY */}
      {/* ------------------------------------------------------------- */}
      {isAgencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-[#130726] border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{editingAgency ? 'Edit Matchmaking Agency' : 'Register Matchmaking Agency'}</span>
              </h3>
              <button
                onClick={() => setIsAgencyModalOpen(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAgency} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-purple-200 mb-1">Agency Name</label>
                <input
                  type="text"
                  required
                  value={agencyForm.name}
                  onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                  placeholder="e.g. Afrobeats Executive Matchmaking"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Lead Matchmaker</label>
                  <input
                    type="text"
                    required
                    value={agencyForm.contactName}
                    onChange={(e) => setAgencyForm({ ...agencyForm, contactName: e.target.value })}
                    placeholder="e.g. Tendai Moyo"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={agencyForm.contactPhone}
                    onChange={(e) => setAgencyForm({ ...agencyForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={agencyForm.contactEmail}
                  onChange={(e) => setAgencyForm({ ...agencyForm, contactEmail: e.target.value })}
                  placeholder="matchmaker@agency.com"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Fee Per Client Upload</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={agencyForm.feePerClient}
                    onChange={(e) => setAgencyForm({ ...agencyForm, feePerClient: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Currency</label>
                  <select
                    value={agencyForm.currency}
                    onChange={(e) => setAgencyForm({ ...agencyForm, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ZAR">ZAR (R)</option>
                    <option value="USD">USD ($)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="KES">KES (KSh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Default Client Pool Access</label>
                <select
                  value={agencyForm.defaultClientPoolAccess}
                  onChange={(e) => setAgencyForm({ ...agencyForm, defaultClientPoolAccess: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="restricted">🔒 Restricted: Client only sees candidates within this agency</option>
                  <option value="full_network">🌐 Full Network: Client can browse all Fiffy singles</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAgencyModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold shadow"
                >
                  {isSubmitting ? 'Saving...' : editingAgency ? 'Update Agency' : 'Register Agency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ENROLL VIP SINGLE UNDER TENANT AGENCY (SMS DISPATCH) */}
      {/* ------------------------------------------------------------- */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#130726] border border-pink-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Enroll VIP Single Under Agency</span>
                </h3>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  An invitation SMS with access instructions and default temporary password will be sent automatically.
                </p>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollClient} className="space-y-3 text-xs">
              {/* Select Tenant Agency */}
              <div>
                <label className="block font-semibold text-purple-200 mb-1">Select Matchmaking Agency</label>
                <select
                  required
                  value={clientForm.tenantId}
                  onChange={(e) => setClientForm({ ...clientForm, tenantId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-amber-500/40 text-white focus:outline-none focus:border-pink-500 font-bold"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Upload Fee: {t.currency} {t.feePerClient})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Client Full Name</label>
                  <input
                    type="text"
                    required
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="e.g. Zola Dlamini"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">
                    Mobile Phone (For SMS Invitation)
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="+27 82 123 4567"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={clientForm.dob}
                    onChange={(e) => setClientForm({ ...clientForm, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Gender</label>
                  <select
                    value={clientForm.gender}
                    onChange={(e) => setClientForm({ ...clientForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="Woman">Woman</option>
                    <option value="Man">Man</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">City</label>
                  <input
                    type="text"
                    value={clientForm.city}
                    onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                    placeholder="Johannesburg"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">Country</label>
                  <select
                    value={clientForm.country}
                    onChange={(e) => setClientForm({ ...clientForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  >
                    {AFRICAN_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pool Visibility */}
              <div>
                <label className="block font-semibold text-purple-200 mb-1">Candidate Pool Visibility</label>
                <select
                  value={clientForm.clientPoolAccess}
                  onChange={(e) => setClientForm({ ...clientForm, clientPoolAccess: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="restricted">
                    🔒 Restricted Pool: Candidate only sees other clients uploaded by this agency
                  </option>
                  <option value="full_network">
                    🌐 Full Network Pool: Candidate can see the full Fiffy platform single deck
                  </option>
                </select>
              </div>

              {/* Matchmaker Notes */}
              <div>
                <label className="block font-semibold text-purple-200 mb-1">Matchmaker Notes</label>
                <textarea
                  rows={2}
                  value={clientForm.matchmakerNotes}
                  onChange={(e) => setClientForm({ ...clientForm, matchmakerNotes: e.target.value })}
                  placeholder="Preferences, high-priority partner qualities, background verified..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500 text-xs"
                />
              </div>

              {/* SMS Notice Card */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-200/90 leading-relaxed">
                  <strong>SMS Invitation Automated:</strong> When submitted, an SMS will be dispatched immediately to{' '}
                  <strong className="text-white">{clientForm.phone || 'their phone'}</strong> with temporary credentials
                  and platform access link. On first login, they will be required to choose a personal password.
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="submit-enroll-client-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl gradient-fiffy text-white font-bold shadow-lg shadow-pink-500/25 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Enrolling &amp; Dispatching SMS...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enroll Single &amp; Send SMS</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: CREATE CURATED INTRODUCTION */}
      {/* ------------------------------------------------------------- */}
      {isIntroModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-[#130726] border border-pink-500/30 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-pink-400" />
                <span>Create Curated Introduction</span>
              </h3>
              <button
                onClick={() => setIsIntroModalOpen(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIntroduction} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-purple-200 mb-1">First Client</label>
                <select
                  required
                  value={introForm.clientAId}
                  onChange={(e) => setIntroForm({ ...introForm, clientAId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">Select Candidate A...</option>
                  {tenantClients.map((c) => (
                    <option key={c.id} value={c.userId}>
                      {c.name} ({c.city}, {c.tenantName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Second Client</label>
                <select
                  required
                  value={introForm.clientBId}
                  onChange={(e) => setIntroForm({ ...introForm, clientBId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">Select Candidate B...</option>
                  {tenantClients
                    .filter((c) => c.userId !== introForm.clientAId)
                    .map((c) => (
                      <option key={c.id} value={c.userId}>
                        {c.name} ({c.city}, {c.tenantName})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">Matchmaker Introduction Note</label>
                <textarea
                  rows={3}
                  required
                  value={introForm.matchmakerNote}
                  onChange={(e) => setIntroForm({ ...introForm, matchmakerNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsIntroModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl gradient-fiffy text-white font-bold shadow"
                >
                  {isSubmitting ? 'Introducing...' : 'Introduce Candidates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
