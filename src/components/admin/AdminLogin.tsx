import React, { useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig';
import { ShieldCheck, Lock, Phone, KeyRound, Sparkles, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToCustomer: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToCustomer,
}) => {
  const [phone, setPhone] = useState(APP_CONFIG.mockAdmin.phone);
  const [password, setPassword] = useState(APP_CONFIG.mockAdmin.password);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      phone === APP_CONFIG.mockAdmin.phone &&
      (password === APP_CONFIG.mockAdmin.password || password === 'admin123')
    ) {
      onLoginSuccess();
    } else {
      setError('Nomor WhatsApp atau Password admin salah.');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-white flex items-center justify-center p-4">
      <div className="bg-white text-zinc-900 rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-800 animate-in zoom-in-95 duration-200">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-white p-1.5 mx-auto flex items-center justify-center shadow-lg border-2 border-emerald-200 mb-3 overflow-hidden">
            <img
              src={APP_CONFIG.appLogo}
              alt={APP_CONFIG.brandName}
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerText = '💼';
                }
              }}
            />
          </div>
          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
            Admin Management Portal
          </span>
          <h1 className="text-2xl font-black text-emerald-950 mt-1">
            {APP_CONFIG.brandName}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Kelola pesanan, menu, reservasi, dan loyalty customer
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Nomor WhatsApp Admin
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">
              Password Admin
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Masuk ke Dashboard Admin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-100 text-center">
          <button
            onClick={onBackToCustomer}
            className="text-xs text-zinc-500 hover:text-emerald-700 font-semibold"
          >
            ← Kembali ke Tampilan Customer
          </button>
        </div>
      </div>
    </div>
  );
};
