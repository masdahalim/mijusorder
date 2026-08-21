import React, { useState, useEffect } from 'react';
import { CrewContact, OrderGroupContact } from '../../types';
import {
  getCrewContacts,
  saveCrewContacts,
  addCrewContact,
  updateCrewContact,
  deleteCrewContact,
  toggleCrewActiveStatus,
  getOrderGroups,
  addOrderGroup,
  updateOrderGroup,
  deleteOrderGroup,
  setDefaultOrderGroup,
  subscribeToStore,
} from '../../services/storeService';
import {
  Users,
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
  UserCheck,
  UserX,
  ChefHat,
  Coffee,
  Truck,
  Store,
  Copy,
  Link,
  Star,
  AlertCircle,
  Clock,
  ArrowUpDown,
  Send,
} from 'lucide-react';

const PRESET_ROLES = [
  { name: 'Barista / Minuman', icon: Coffee, color: '#059669' },
  { name: 'Dapur / Makanan', icon: ChefHat, color: '#d97706' },
  { name: 'Operasional Onsite', icon: Store, color: '#2563eb' },
  { name: 'Kasir / Frontliner', icon: Users, color: '#0891b2' },
  { name: 'Kurir / Delivery Internal', icon: Truck, color: '#7c3aed' },
  { name: 'Supervisor / Manager', icon: ShieldCheck, color: '#be123c' },
];

const PRESET_COLORS = [
  '#059669', // Emerald
  '#d97706', // Amber
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#0891b2', // Cyan
  '#be123c', // Rose
  '#475569', // Slate
];

export const AdminCrewManagement: React.FC = () => {
  const [subTab, setSubTab] = useState<'CREW' | 'GROUPS'>('CREW');
  const [crews, setCrews] = useState<CrewContact[]>([]);
  const [groups, setGroups] = useState<OrderGroupContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('Semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal States
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewContact | null>(null);
  const [crewForm, setCrewForm] = useState({
    name: '',
    role: 'Barista / Minuman',
    phone: '',
    notes: '',
    isActive: true,
    avatarColor: '#059669',
  });

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OrderGroupContact | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    phone: '',
    inviteLink: '',
    description: '',
    isDefault: false,
    isActive: true,
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'CREW' | 'GROUP';
    id: string;
    name: string;
  } | null>(null);

  const loadData = () => {
    setCrews(getCrewContacts());
    setGroups(getOrderGroups());
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return () => unsub();
  }, []);

  // Format phone display e.g. 6281234567890 -> +62 812-3456-7890
  const formatPhoneDisplay = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean) return phone;
    if (clean.startsWith('62')) {
      const rest = clean.slice(2);
      if (rest.length > 7) {
        return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
      }
      return `+62 ${rest}`;
    }
    return clean;
  };

  const handleCopyPhone = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Crew Handlers ---
  const handleOpenAddCrew = () => {
    setEditingCrew(null);
    setCrewForm({
      name: '',
      role: 'Barista / Minuman',
      phone: '',
      notes: '',
      isActive: true,
      avatarColor: '#059669',
    });
    setIsCrewModalOpen(true);
  };

  const handleOpenEditCrew = (crew: CrewContact) => {
    setEditingCrew(crew);
    setCrewForm({
      name: crew.name,
      role: crew.role,
      phone: crew.phone,
      notes: crew.notes || '',
      isActive: crew.isActive !== false,
      avatarColor: crew.avatarColor || '#059669',
    });
    setIsCrewModalOpen(true);
  };

  const handleSaveCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crewForm.name.trim() || !crewForm.phone.trim()) return;

    if (editingCrew) {
      updateCrewContact({
        id: editingCrew.id,
        name: crewForm.name.trim(),
        role: crewForm.role.trim(),
        phone: crewForm.phone.trim(),
        notes: crewForm.notes.trim(),
        isActive: crewForm.isActive,
        avatarColor: crewForm.avatarColor,
      });
    } else {
      addCrewContact({
        name: crewForm.name.trim(),
        role: crewForm.role.trim(),
        phone: crewForm.phone.trim(),
        notes: crewForm.notes.trim(),
        isActive: crewForm.isActive,
        avatarColor: crewForm.avatarColor,
      });
    }

    setIsCrewModalOpen(false);
  };

  // --- Group Handlers ---
  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      phone: '',
      inviteLink: '',
      description: '',
      isDefault: groups.length === 0,
      isActive: true,
    });
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: OrderGroupContact) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      phone: group.phone,
      inviteLink: group.inviteLink || '',
      description: group.description || '',
      isDefault: Boolean(group.isDefault),
      isActive: group.isActive !== false,
    });
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name.trim() || !groupForm.phone.trim()) return;

    if (editingGroup) {
      updateOrderGroup({
        id: editingGroup.id,
        name: groupForm.name.trim(),
        phone: groupForm.phone.trim(),
        inviteLink: groupForm.inviteLink.trim() || undefined,
        description: groupForm.description.trim() || undefined,
        isDefault: groupForm.isDefault,
        isActive: groupForm.isActive,
      });
    } else {
      addOrderGroup({
        name: groupForm.name.trim(),
        phone: groupForm.phone.trim(),
        inviteLink: groupForm.inviteLink.trim() || undefined,
        description: groupForm.description.trim() || undefined,
        isDefault: groupForm.isDefault,
        isActive: groupForm.isActive,
      });
    }

    setIsGroupModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'CREW') {
      deleteCrewContact(deleteConfirm.id);
    } else {
      deleteOrderGroup(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  // Filtered Crew List
  const filteredCrews = crews.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchRole =
      selectedRoleFilter === 'Semua' ||
      c.role.toLowerCase().includes(selectedRoleFilter.toLowerCase());

    return matchSearch && matchRole;
  });

  // Filtered Groups
  const filteredGroups = groups.filter((g) => {
    return (
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const activeCrewsCount = crews.filter((c) => c.isActive !== false).length;
  const activeGroupsCount = groups.filter((g) => g.isActive !== false).length;

  return (
    <div className="space-y-6 pb-12 text-zinc-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                ADMIN WHATSAPP MANAGER
              </span>
              <span className="text-xs text-emerald-300 font-bold">• Forward Order Ticket</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              WhatsApp Crew Onsite & Grup Order
            </h2>
            <p className="text-xs text-emerald-200 mt-1 max-w-xl leading-relaxed">
              Kelola nomor WhatsApp staf bertugas (Barista, Kitchen, Onsite) serta Grup Order WhatsApp untuk penerusan tiket pesanan dapur secara otomatis.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {subTab === 'CREW' ? (
              <button
                id="btn-add-crew"
                onClick={handleOpenAddCrew}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-amber-950 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Anggota Crew</span>
              </button>
            ) : (
              <button
                id="btn-add-group"
                onClick={handleOpenAddGroup}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-amber-950 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Grup WhatsApp</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-emerald-800/80 text-xs">
          <div className="bg-emerald-900/60 backdrop-blur-xs rounded-2xl p-3 border border-emerald-700/40">
            <div className="text-emerald-300 font-semibold text-[11px]">Total Crew Onsite</div>
            <div className="text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
              <span>{crews.length} Orang</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-800/80 px-1.5 py-0.2 rounded-md">
                {activeCrewsCount} Aktif
              </span>
            </div>
          </div>

          <div className="bg-emerald-900/60 backdrop-blur-xs rounded-2xl p-3 border border-emerald-700/40">
            <div className="text-emerald-300 font-semibold text-[11px]">Grup Order WhatsApp</div>
            <div className="text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
              <span>{groups.length} Grup</span>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded-md">
                1 Default
              </span>
            </div>
          </div>

          <div className="bg-emerald-900/60 backdrop-blur-xs rounded-2xl p-3 border border-emerald-700/40">
            <div className="text-emerald-300 font-semibold text-[11px]">Status Forward Tiket</div>
            <div className="text-xs font-black text-emerald-300 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Realtime WA Gateway Ready</span>
            </div>
          </div>

          <div className="bg-emerald-900/60 backdrop-blur-xs rounded-2xl p-3 border border-emerald-700/40">
            <div className="text-emerald-300 font-semibold text-[11px]">Format Standar</div>
            <div className="text-xs font-mono font-bold text-amber-300 mt-1">
              628xxxxxxxxxx (Auto)
            </div>
          </div>
        </div>
      </div>

      {/* Main Controls & Sub-Tab Switcher */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          {/* Sub Tabs */}
          <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-2xl">
            <button
              id="tab-crew-onsite"
              onClick={() => setSubTab('CREW')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                subTab === 'CREW'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Daftar Crew Onsite ({crews.length})</span>
            </button>

            <button
              id="tab-order-groups"
              onClick={() => setSubTab('GROUPS')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                subTab === 'GROUPS'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Grup WhatsApp Order ({groups.length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={subTab === 'CREW' ? 'Cari nama crew, role, HP...' : 'Cari nama grup...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
            />
          </div>
        </div>

        {/* Role Pills Filter (Only for Crew tab) */}
        {subTab === 'CREW' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-zinc-400 mr-1 shrink-0">Filter:</span>
            {['Semua', 'Barista', 'Kitchen', 'Operasional', 'Kasir', 'Kurir'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedRoleFilter === role
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-transparent'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. CREW ONSITE LIST VIEW */}
      {/* ======================================================== */}
      {subTab === 'CREW' && (
        <div className="space-y-4">
          {filteredCrews.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-zinc-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-2xl">
                👥
              </div>
              <h3 className="font-extrabold text-base text-zinc-800">
                Belum Ada Crew Ditemukan
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Tidak ada data crew yang sesuai dengan kata kunci pencarian Anda.'
                  : 'Tambahkan nomor WhatsApp anggota staf barista, dapur, atau operasional onsite.'}
              </p>
              <button
                onClick={handleOpenAddCrew}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Crew Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCrews.map((crew) => {
                const isOnline = crew.isActive !== false;
                const formattedPhone = formatPhoneDisplay(crew.phone);
                const roleIcon =
                  PRESET_ROLES.find((r) => r.name.toLowerCase() === crew.role.toLowerCase())
                    ?.icon || Users;
                const IconComponent = roleIcon;

                return (
                  <div
                    key={crew.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all relative overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between gap-4 ${
                      isOnline
                        ? 'border-zinc-200/90'
                        : 'border-zinc-200 bg-zinc-50/70 opacity-75'
                    }`}
                  >
                    {/* Top Status & Avatar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm relative font-black text-lg"
                          style={{
                            backgroundColor: crew.avatarColor || '#059669',
                          }}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
                            }`}
                            title={isOnline ? 'Bertugas / Aktif' : 'Libur / Nonaktif'}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-sm text-zinc-900">
                              {crew.name}
                            </h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                              {crew.role}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => handleCopyPhone(crew.id, crew.phone)}
                              className="text-xs font-mono font-bold text-zinc-700 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                              title="Klik untuk salin nomor"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{formattedPhone}</span>
                              {copiedId === crew.id ? (
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              ) : (
                                <Copy className="w-3 h-3 text-zinc-400" />
                              )}
                            </button>
                          </div>

                          {crew.notes && (
                            <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span>{crew.notes}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* On-Duty Switch */}
                      <button
                        onClick={() => toggleCrewActiveStatus(crew.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all flex items-center gap-1 ${
                          isOnline
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-zinc-200 text-zinc-600 border border-zinc-300'
                        }`}
                        title="Klik untuk ubah status shift"
                      >
                        {isOnline ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>On-Duty (Aktif)</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            <span>Off-Duty</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/${crew.phone}?text=${encodeURIComponent(
                          `Halo ${crew.name}, ini pesan test koordinasi dari Admin MiJUS Go Healthy.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Test WhatsApp</span>
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditCrew(crew)}
                          className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          title="Edit Data Crew"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">Edit</span>
                        </button>

                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'CREW',
                              id: crew.id,
                              name: crew.name,
                            })
                          }
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          title="Hapus Crew"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ORDER GROUPS LIST VIEW */}
      {/* ======================================================== */}
      {subTab === 'GROUPS' && (
        <div className="space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-zinc-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center text-2xl">
                💬
              </div>
              <h3 className="font-extrabold text-base text-zinc-800">
                Belum Ada Grup WhatsApp Didaftarkan
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Tambahkan grup WhatsApp kitchen/outlet agar tiket pesanan dapat diforward langsung ke ruang obrolan tim.
              </p>
              <button
                onClick={handleOpenAddGroup}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Grup WhatsApp</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredGroups.map((group) => {
                const isDefault = Boolean(group.isDefault);
                const isActive = group.isActive !== false;
                const formattedPhone = formatPhoneDisplay(group.phone);

                return (
                  <div
                    key={group.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all relative overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between gap-4 ${
                      isDefault
                        ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md font-black">
                            <MessageCircle className="w-6 h-6" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-sm text-zinc-900">
                                {group.name}
                              </h4>
                              {isDefault && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-amber-950" />
                                  <span>GRUP DEFAULT</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => handleCopyPhone(group.id, group.phone)}
                                className="text-xs font-mono font-bold text-zinc-700 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{formattedPhone}</span>
                                {copiedId === group.id ? (
                                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                ) : (
                                  <Copy className="w-3 h-3 text-zinc-400" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Default Button */}
                        {!isDefault && (
                          <button
                            onClick={() => setDefaultOrderGroup(group.id)}
                            className="px-2 py-1 bg-zinc-100 hover:bg-emerald-50 text-zinc-600 hover:text-emerald-800 rounded-lg text-[10px] font-bold transition-all"
                            title="Jadikan grup default forward tiket"
                          >
                            Set Default
                          </button>
                        )}
                      </div>

                      {/* Description */}
                      {group.description && (
                        <p className="text-xs text-zinc-600 mt-3 leading-relaxed bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                          {group.description}
                        </p>
                      )}

                      {/* Invite Link preview */}
                      {group.inviteLink && (
                        <div className="mt-2.5 flex items-center gap-2 text-xs">
                          <a
                            href={group.inviteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold truncate"
                          >
                            <Link className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{group.inviteLink}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <a
                        href={`https://wa.me/${group.phone}?text=${encodeURIComponent(
                          `Halo Tim ${group.name}, ini pesan test gateway tiket pesanan dari Admin MiJUS.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Test Kirim WA</span>
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditGroup(group)}
                          className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          title="Edit Grup"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">Edit</span>
                        </button>

                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'GROUP',
                              id: group.id,
                              name: group.name,
                            })
                          }
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          title="Hapus Grup"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / EDIT CREW ONSITE */}
      {/* ======================================================== */}
      {isCrewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 overflow-hidden text-zinc-800 animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700/80 flex items-center justify-center text-white font-black">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {editingCrew ? 'Edit Data Crew' : 'Tambah Crew Onsite Baru'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Nomor WhatsApp tujuan forward tiket order
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCrewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCrew} className="p-4 sm:p-5 space-y-3.5 text-xs">
              {/* Nama Crew */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  Nama Anggota Crew *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Barista (Budi), Siti Kitchen, dsb."
                  value={crewForm.name}
                  onChange={(e) => setCrewForm({ ...crewForm, name: e.target.value })}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Role / Jabatan */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  Role / Posisi Jabatan *
                </label>
                <select
                  value={crewForm.role}
                  onChange={(e) => {
                    const found = PRESET_ROLES.find((r) => r.name === e.target.value);
                    setCrewForm({
                      ...crewForm,
                      role: e.target.value,
                      avatarColor: found ? found.color : crewForm.avatarColor,
                    });
                  }}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white focus:outline-hidden focus:border-emerald-600 mb-1.5"
                >
                  {PRESET_ROLES.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                  <option value="Lainnya">Lainnya (Tulis Manual)</option>
                </select>

                {crewForm.role === 'Lainnya' && (
                  <input
                    type="text"
                    placeholder="Tulis posisi jabatan custom..."
                    value={crewForm.role === 'Lainnya' ? '' : crewForm.role}
                    onChange={(e) => setCrewForm({ ...crewForm, role: e.target.value })}
                    className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-emerald-600"
                  />
                )}
              </div>

              {/* WhatsApp Phone */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  Nomor WhatsApp Crew * (Format: 08xxx atau 62xxx)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567801 atau 6281234567801"
                    value={crewForm.phone}
                    onChange={(e) => setCrewForm({ ...crewForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-zinc-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Sistem otomatis mengubah awalan 08 menjadi 628 untuk integrasi WhatsApp API.
                </p>
              </div>

              {/* Shift Notes */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  Catatan Shift / Spesialisasi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Shift Pagi (08:00-15:00) • Barista Minuman Fresh"
                  value={crewForm.notes}
                  onChange={(e) => setCrewForm({ ...crewForm, notes: e.target.value })}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1.5">
                  Warna Ikon Avatar
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCrewForm({ ...crewForm, avatarColor: c })}
                      className={`w-7 h-7 rounded-xl transition-all ${
                        crewForm.avatarColor === c
                          ? 'ring-2 ring-emerald-600 ring-offset-2 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-zinc-900">
                    Status Bertugas (On-Duty)
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Tampilkan di pilihan forward tiket saat admin menerima pesanan
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={crewForm.isActive}
                  onChange={(e) => setCrewForm({ ...crewForm, isActive: e.target.checked })}
                  className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCrewModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingCrew ? 'Simpan Perubahan' : 'Tambah Crew'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / EDIT GRUP WHATSAPP */}
      {/* ======================================================== */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 overflow-hidden text-zinc-800 animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700/80 flex items-center justify-center text-white font-black">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {editingGroup ? 'Edit Grup WhatsApp' : 'Tambah Grup WhatsApp Baru'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Grup koordinasi tiket pesanan outlet
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="w-8 h-8 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-4 sm:p-5 space-y-3.5 text-xs">
              {/* Nama Grup */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  Nama Grup WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Grup Order MiJUS Outlet, Grup Dapur, dsb."
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Nomor HP WhatsApp / Admin Grup */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  Nomor Kontak Admin / Bot WhatsApp Grup *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567899 atau 6281234567899"
                    value={groupForm.phone}
                    onChange={(e) => setGroupForm({ ...groupForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-zinc-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Invite Link */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  Link Undangan Grup WhatsApp (Opsional)
                </label>
                <div className="relative">
                  <Link className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://chat.whatsapp.com/..."
                    value={groupForm.inviteLink}
                    onChange={(e) => setGroupForm({ ...groupForm, inviteLink: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium rounded-xl border border-zinc-300 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-zinc-800 mb-1">
                  Deskripsi / Fungsi Grup (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Grup utama forward tiket antrian racik juice & masak makanan kitchen."
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Is Default Checkbox */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-zinc-900">
                    Jadikan Grup WhatsApp Utama (Default)
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Otomatis dipilih pertama saat admin memilih opsi "Grup Order Outlet"
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={groupForm.isDefault}
                  onChange={(e) => setGroupForm({ ...groupForm, isDefault: e.target.checked })}
                  className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingGroup ? 'Simpan Perubahan' : 'Tambah Grup'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL KONFIRMASI HAPUS */}
      {/* ======================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-zinc-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-xl mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-zinc-900">
              Hapus {deleteConfirm.type === 'CREW' ? 'Crew' : 'Grup'}?
            </h3>
            <p className="text-xs text-zinc-500 mt-1 mb-4">
              Apakah Anda yakin ingin menghapus <strong>"{deleteConfirm.name}"</strong>?
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
