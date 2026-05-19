import { useState } from "react";
import axios from "axios";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

function ResetPassword({ token, setPage }) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setMessage("⚠️ Masukkan password baru.");
      return;
    }
    setLoading(true);
    setMessage("⏳ Memproses...");

    try {
      await axios.post("/api/auth/reset-password", {
        token: token,
        new_password: newPassword,
      });
      setMessage("");
      setSuccess(true);
    } catch (err) {
      setMessage("⚠️ " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-7 animate-fade-in max-w-md mx-auto mt-10">
      <h2 className="font-playfair text-2xl font-bold text-brand-accent mb-1.5 text-center">
        Reset Password
      </h2>
      <p className="text-xs text-brand-light/40 mb-6 leading-relaxed text-center">
        Silakan masukkan password baru Anda. Pastikan password kuat dan mudah diingat.
      </p>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-6">
        {success ? (
          <div className="text-center">
            <CheckCircle2 size={48} className="mx-auto text-brand-accent/70 mb-3" />
            <div className="text-sm font-medium text-brand-light mb-4">
              Password Berhasil Diubah!
            </div>
            <button
              onClick={() => {
                // Return to Akun page by clearing token from URL
                window.history.replaceState({}, document.title, "/");
                setPage("akun");
              }}
              className="w-full bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2 rounded-md transition-colors"
            >
              Pergi ke Halaman Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input w-full pr-10"
                placeholder="Password Baru (min. 6 karakter)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-light/50 hover:text-brand-accent transition-colors flex items-center justify-center cursor-pointer select-none"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2.5 rounded-md transition-colors disabled:opacity-50"
            >
              Simpan Password Baru
            </button>
            {message && (
              <div className="mt-2 text-xs text-brand-accent text-center">
                {message}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
