import React, { useState } from 'react';
import { Product, ProductCategory, AttachedFile } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Database,
  Link,
} from 'lucide-react';
import {
  saveProduct,
  deleteProduct,
  toggleProductOutOfStock,
} from '../../services/storeService';
import { CATEGORIES } from '../../data/mockData';
import { InsForgeFileUploader } from '../common/InsForgeFileUploader';

interface AdminMenuManagementProps {
  products: Product[];
}

export const AdminMenuManagement: React.FC<AdminMenuManagementProps> = ({ products }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const categories: ProductCategory[] = CATEGORIES;

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'Semua' && p.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingProduct({
      id: `prod_${Date.now()}`,
      name: '',
      category: 'Pure Juice',
      description: '',
      price: 15000,
      hasSizes: true,
      priceMed: 15000,
      priceUp: 20000,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      isBestSeller: false,
      isNew: true,
      isOutOfStock: false,
      tags: ['Fresh', '100% Buah'],
      addOnIds: ['add_chia', 'add_honey'],
    });
    setIsEditingModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditingModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct.name && editingProduct.price) {
      saveProduct(editingProduct as Product);
      setIsEditingModalOpen(false);
      setEditingProduct(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus produk "${name}"?`)) {
      deleteProduct(id);
    }
  };

  const handleToggleStock = (id: string) => {
    toggleProductOutOfStock(id);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-zinc-900">Kelola Menu & Katalog</h2>
            <p className="text-xs text-zinc-500">
              Total {products.length} menu terdaftar ({products.filter((p) => p.isOutOfStock).length} menu habis)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu Baru</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama menu atau deskripsi..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-zinc-200"
            />
          </div>

          <div className="flex items-center gap-1 flex-wrap py-0.5">
            <button
              onClick={() => setSelectedCategory('Semua')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'Semua'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === c
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-3xl p-4 border transition-all flex flex-col justify-between shadow-xs ${
              p.isOutOfStock
                ? 'border-rose-200 bg-rose-50/20'
                : 'border-zinc-200 hover:border-emerald-300'
            }`}
          >
            {/* Top item info */}
            <div>
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  {p.isOutOfStock && (
                    <div className="absolute inset-0 bg-rose-950/70 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-[10px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full uppercase">
                        Habis
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-md">
                      {p.category}
                    </span>
                    {p.isBestSeller && (
                      <span className="text-[10px] font-black text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded-md">
                        Best Seller
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-zinc-900 line-clamp-1">{p.name}</h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">{p.description}</p>
                </div>
              </div>

              {/* Price details */}
              <div className="mt-3 p-2.5 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between text-xs">
                {p.hasSizes ? (
                  <div className="flex items-center gap-2">
                    <span>
                      MED: <strong className="text-zinc-900">{formatRupiah(p.priceMed || p.price)}</strong>
                    </span>
                    <span className="text-zinc-300">•</span>
                    <span>
                      UP: <strong className="text-emerald-800">{formatRupiah(p.priceUp || p.price)}</strong>
                    </span>
                  </div>
                ) : (
                  <div>
                    Harga: <strong className="text-emerald-800">{formatRupiah(p.price)}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
              {/* Out of stock toggle button */}
              <button
                onClick={() => handleToggleStock(p.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  p.isOutOfStock
                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
                title="Klik untuk ubah status ketersediaan"
              >
                {p.isOutOfStock ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-rose-600" />
                    <span>Status: HABIS</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-emerald-600" />
                    <span>Status: TERSEDIA</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(p)}
                  className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                  title="Edit Menu"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                  title="Hapus Menu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Product Modal */}
      {isEditingModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-black text-base text-zinc-900">
                {editingProduct.id?.startsWith('prod_') && !products.some((p) => p.id === editingProduct.id)
                  ? 'Tambah Menu Baru'
                  : 'Edit Data Menu'}
              </h3>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Nama Menu</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Contoh: Dragon Glow Smoothie"
                  className="w-full p-2.5 rounded-xl border border-zinc-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Kategori</label>
                  <select
                    value={editingProduct.category || 'Pure Juice'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Punya Pilihan Ukuran?</label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={editingProduct.hasSizes === true}
                        onChange={() => setEditingProduct({ ...editingProduct, hasSizes: true })}
                      />
                      <span>Ya (MED & UP)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={editingProduct.hasSizes === false}
                        onChange={() => setEditingProduct({ ...editingProduct, hasSizes: false })}
                      />
                      <span>Single Size</span>
                    </label>
                  </div>
                </div>
              </div>

              {editingProduct.hasSizes ? (
                <div className="grid grid-cols-2 gap-3 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Harga Medium (MED)</label>
                    <input
                      type="number"
                      value={editingProduct.priceMed || 0}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          priceMed: Number(e.target.value),
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 rounded-xl border border-zinc-300 bg-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">Harga Up Size (UP)</label>
                    <input
                      type="number"
                      value={editingProduct.priceUp || 0}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          priceUp: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 rounded-xl border border-zinc-300 bg-white font-mono"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-zinc-300 font-mono"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Deskripsi & Manfaat</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  placeholder="Komposisi buah, manfaat kesehatan..."
                  className="w-full p-2.5 rounded-xl border border-zinc-300"
                />
              </div>

              {/* InsForge Storage Image Uploader */}
              <div className="space-y-2">
                <InsForgeFileUploader
                  category="PRODUCT_IMAGE"
                  recordId={editingProduct.id}
                  currentFile={
                    editingProduct.image
                      ? {
                          key: editingProduct.imageKey || `products/${editingProduct.id || 'new'}`,
                          url: editingProduct.image,
                          name: editingProduct.name || 'foto-produk',
                          size: 0,
                          uploadedAt: new Date().toISOString(),
                          category: 'PRODUCT_IMAGE',
                        }
                      : null
                  }
                  onFileUploaded={(file) =>
                    setEditingProduct({
                      ...editingProduct,
                      image: file.url,
                      imageKey: file.key,
                      attachment: file,
                    })
                  }
                  onFileRemoved={() =>
                    setEditingProduct({
                      ...editingProduct,
                      image: '',
                      imageKey: undefined,
                      attachment: undefined,
                    })
                  }
                  label="Foto Produk Menu (InsForge Storage)"
                  description="Unggah foto menu jus/makanan (PNG, JPG, WEBP)"
                />

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-1">
                  <span className="text-zinc-400 font-mono">Atau URL:</span>
                  <input
                    type="url"
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-2.5 py-1 rounded-lg border border-zinc-200 text-[11px] font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isBestSeller || false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="font-bold text-zinc-800">Tandai Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isOutOfStock || false}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isOutOfStock: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="font-bold text-rose-700">Tandai Stok Habis</span>
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="w-1/2 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
