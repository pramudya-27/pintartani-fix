import {useState} from "react";
import axios from "axios";
import {UserCircle, ArrowLeft, Eye, EyeOff} from "lucide-react";

function Akun({ quota, setQuota, loggedInUser, setLoggedInUser }) {
  // 'login', 'register', 'forgot'
  const [activeTab, setActiveTab] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setMessage("⚠️ Isi semua kolom.");
      return;
    }
    setLoading(true);
    setMessage("⏳ Memproses...");

    try {
      const res = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });
      setMessage(`✅ ${res.data.message}. Silakan login.`);
      setTimeout(() => setActiveTab("login"), 1500);
    } catch (err) {
      setMessage("⚠️ " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage("⚠️ Isi semua kolom.");
      return;
    }
    setLoading(true);
    setMessage("⏳ Memproses...");

    try {
      const res = await axios.post("/api/auth/login", {
        username_or_email: username,
        password,
      });

      localStorage.setItem("pt_token", res.data.access_token);
      localStorage.setItem("pt_user", res.data.username);
      localStorage.setItem("pt_quota", res.data.quota_left);

      setQuota(res.data.quota_left);
      setMessage("✅ Berhasil login!");
      setLoggedInUser(res.data.username);
    } catch (err) {
      setMessage("⚠️ " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("⚠️ Masukkan email Anda.");
      return;
    }
    setLoading(true);
    setMessage("⏳ Memproses...");

    try {
      const res = await axios.post("/api/auth/forgot-password", {
        email,
      });
      setMessage(`✅ ${res.data.message}`);
    } catch (err) {
      setMessage("⚠️ " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pt_token");
    localStorage.removeItem("pt_user");
    localStorage.removeItem("pt_quota");
    setLoggedInUser(null);
    setQuota(5);
  };

  return (
    <div className="p-7 animate-fade-in max-w-md mx-auto">
      <h2 className="font-playfair text-2xl font-bold text-brand-accent mb-1.5 text-center">
        Akun & Sesi
      </h2>
      <p className="text-xs text-brand-light/40 mb-6 leading-relaxed text-center">
        Anda perlu mendaftar dan masuk untuk menggunakan fitur AI kami. Setiap
        pengguna memiliki kuota maksimal 5 kali penggunaan (reset otomatis 5 jam
        kemudian).
      </p>

      {loggedInUser ? (
        <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-6 text-center">
          <UserCircle size={48} className="mx-auto text-brand-accent/50 mb-3" />
          <div className="text-lg font-medium text-brand-light mb-2">
            Halo, {loggedInUser}!
          </div>
          <div className="text-xs text-brand-light/40 mb-5">
            Sisa Kuota: {quota}/5
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-5">
          {activeTab === "forgot" ? (
             <div className="mb-4 flex items-center justify-between">
               <button 
                  onClick={() => { setActiveTab("login"); setMessage(""); setShowPassword(false); }}
                  className="text-xs text-brand-light/50 hover:text-brand-accent flex items-center gap-1 transition-colors"
               >
                 <ArrowLeft size={14} /> Kembali
               </button>
               <span className="text-xs font-semibold text-brand-light">Lupa Password</span>
             </div>
          ) : (
            <div className="flex gap-2 mb-4">
              <button
                className={`flex-1 text-xs py-2 rounded-md transition-colors ${activeTab === "login" ? "bg-brand-accent/15 text-brand-accent font-medium" : "text-brand-light/50 hover:bg-white/5"}`}
                onClick={() => {
                  setActiveTab("login");
                  setMessage("");
                  setShowPassword(false);
                }}
              >
                Login
              </button>
              <button
                className={`flex-1 text-xs py-2 rounded-md transition-colors ${activeTab === "register" ? "bg-brand-accent/15 text-brand-accent font-medium" : "text-brand-light/50 hover:bg-white/5"}`}
                onClick={() => {
                  setActiveTab("register");
                  setMessage("");
                  setShowPassword(false);
                }}
              >
                Daftar
              </button>
            </div>
          )}

          <form
            onSubmit={activeTab === "login" ? handleLogin : activeTab === "register" ? handleRegister : handleForgot}
            className="flex flex-col gap-2"
          >
            {activeTab !== "forgot" && (
              <input
                type="text"
                className="form-input"
                placeholder={activeTab === "login" ? "Username atau Email" : "Username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}
            
            {(activeTab === "register" || activeTab === "forgot") && (
              <input
                type="email"
                className="form-input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
            
            {activeTab !== "forgot" && (
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input w-full pr-10"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-light/50 hover:text-brand-accent transition-colors flex items-center justify-center cursor-pointer select-none"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </span>
                </div>
                {activeTab === "login" && (
                  <div className="mt-2 text-right">
                    <button 
                      type="button"
                      onClick={() => { setActiveTab("forgot"); setMessage(""); setShowPassword(false); }}
                      className="text-[10px] text-brand-light/50 hover:text-brand-accent transition-colors"
                    >
                      Lupa Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2.5 rounded-md transition-colors disabled:opacity-50"
            >
              {activeTab === "login" ? "Masuk" : activeTab === "register" ? "Daftar Akun" : "Kirim Link Reset"}
            </button>
          </form>
          {message && (
            <div className="mt-3 text-xs text-brand-accent text-center">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Akun;
