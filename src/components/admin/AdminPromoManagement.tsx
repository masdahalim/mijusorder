import React, { useState } from 'react';
import { PromoBanner, AddOnOption } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Percent,
  Layers,
} from 'lucide-react';
import {
  savePromo,
  deletePromo,
  togglePromoActive,
  saveAddOn,
  deleteAddOn,
} from '../../services/storeService';

interface AdminPromoManagementProps {
  promos: PromoBanner[];
  addOns: AddOnOption[];
}

export const AdminPromoManagement: React.FC<AdminPromoManagementProps> = ({
  promos,
  addOns,
}) => {
  const [activeTab, setActiveTab] = useState<'PROMOS' | 'ADDONS'>('PROMOS');
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Partial<PromoBanner> | null>(null);

  const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<Partial<AddOnOption> | null>(null);

  const handleOpenAddPromo = () => {
    setEditingPromo({
      id: `promo_${Date.now()}`,
      title: 'Promo Spesial MiJUS',
      subtitle: 'Diskon Sehat Hari Ini',
      code: 'SEHAT10',
      discountPercentage: 10,
      minSpend: 40000,
      badge: 'PROMO',
      color: 'bg-emerald-600',
      isActive: true,
      description: 'Dapatkan diskon untuk pesanan sehat kamu!',
    });
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPromo && editingPromo.title && editingPromo.code) {
      savePromo(editingPromo as PromoBanner);
      setIsPromoModalOpen(false);
      setEditingPromo(null);
    }
  };

  const handleOpenAddAddOn = () => {
    setEditingAddOn({
      id: `addon_${Date.now()}`,
      name: 'Topping Tambahan',
      price: 4000,
    });
    setIsAddOnModalOpen(true);
  };

  const handleSaveAddOn = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddOn && editingAddOn.name && editingAddOn.price !== undefined) {
      saveAddOn(editingAddOn as AddOnOption);
      setIsAddOnModalOpen(false);
      setEditingAddOn(null);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-zinc-900">
            Kelola Promo & Opsi Add-On
          </h2>
          <p className="text-xs text-zinc-500">
            Atur banner diskon dan variasi topping kustom
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-zinc-100 rounded-2xl flex text-xs">
            <button
              onClick={() => setActiveTab('PROMOS')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'PROMOS'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Promo & Diskon ({promos.length})
            </button>
            <button
              onClick={() => setActiveTab('ADDONS')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'ADDONS'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Katalog Add-On ({addOns.length})
            </button>
          </div>

          {activeTab === 'PROMOS' ? (
            <button
              onClick={handleOpenAddPromo}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Promo</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddAddOn}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Add-On</span>
            </button>
          )}
        </div>
      </div>

      {/* Promos Content */}
      {activeTab === 'PROMOS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promos.map((p) => (
            <div
              key={p.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                p.isActive
                  ? 'bg-white border-zinc-200 shadow-sm'
                  : 'bg-zinc-50 border-zinc-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    {p.badge}
                  </span>
                  <button
                    onClick={() => togglePromoActive(p.id)}
                    className="flex items-center gap-1 text-xs font-bold"
                  >
                    {p.isActive ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <ToggleRight className="w-5 h-5" /> Aktif
                      </span>
                    ) : (
                      <span className="text-zinc-400 flex items-center gap-1">
                        <ToggleLeft className="w-5 h-5" /> Nonaktif
                      </span>
                    )}
                  </button>
                </div>

                <h3 className="font-extrabold text-base text-zinc-900">{p.title}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{p.subtitle}</p>

                <div className="my-3 p-2.5 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                  <span className="font-mono font-black text-emerald-950">
                    Kode: {p.code}
                  </span>
                  <span className="font-extrabold text-emerald-800">
                    Diskon {p.discountPercentage}% (Min {formatRupiah(p.minSpend)})
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex justify-end gap-1">
                <button
                  onClick={() => {
                    setEditingPromo({ ...p });
                    setIsPromoModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePromo(p.id)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add-Ons Content */}
      {activeTab === 'ADDONS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {addOns.map((addOn) => (
            <div
              key={addOn.id}
              className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-extrabold text-xs text-zinc-900">{addOn.name}</div>
                <div className="text-xs font-black text-emerald-800 mt-0.5">
                  +{formatRupiah(addOn.price)}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingAddOn({ ...addOn });
                    setIsAddOnModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteAddOn(addOn.id)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Promo Edit Modal */}
      {isPromoModalOpen && editingPromo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl text-xs space-y-3">
            <h3 className="font-extrabold text-sm text-zinc-900">Pengaturan Promo</h3>
            <form onSubmit={handleSavePromo} className="space-y-2.5">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Judul Promo</label>
                <input
                  type="text"
                  value={editingPromo.title || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, title: e.target.value })}
                  className="w-full p-2 rounded-xl border border-zinc-300"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Sub Judul</label>
                <input
                  type="text"
                  value={editingPromo.subtitle || ''}
                  onChange={(e) => setEditingPromo({ ...editingPromo, subtitle: e.target.value })}
                  className="w-full p-2 rounded-xl border border-zinc-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Kode Promo</label>
                  <input
                    type="text"
                    value={editingPromo.code || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 rounded-xl border border-zinc-300 font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Diskon (%)</label>
                  <input
                    type="number"
                    value={editingPromo.discountPercentage || 0}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discountPercentage: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-zinc-300"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Minimal Belanja (Rp)</label>
                <input
                  type="number"
                  value={editingPromo.minSpend || 0}
                  onChange={(e) => setEditingPromo({ ...editingPromo, minSpend: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-zinc-300"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="w-1/2 py-2 bg-zinc-100 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add-On Edit Modal */}
      {isAddOnModalOpen && editingAddOn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl text-xs space-y-3">
            <h3 className="font-extrabold text-sm text-zinc-900">Pengaturan Add-On</h3>
            <form onSubmit={handleSaveAddOn} className="space-y-2.5">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Nama Topping / Add-On</label>
                <input
                  type="text"
                  value={editingAddOn.name || ''}
                  onChange={(e) => setEditingAddOn({ ...editingAddOn, name: e.target.value })}
                  className="w-full p-2 rounded-xl border border-zinc-300"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Harga Tambahan (Rp)</label>
                <input
                  type="number"
                  value={editingAddOn.price || 0}
                  onChange={(e) => setEditingAddOn({ ...editingAddOn, price: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl border border-zinc-300 font-mono"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOnModalOpen(false)}
                  className="w-1/2 py-2 bg-zinc-100 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
