import {Smartphone, ShieldCheck, Brain, Zap} from "lucide-react";

function Arsitektur() {
  return (
    <div className="p-7 animate-fade-in max-w-3xl mx-auto">
      <h2 className="font-playfair text-2xl font-bold text-brand-accent mb-1.5">
        Arsitektur Sistem PintarTani
      </h2>
      <p className="text-xs text-brand-light/40 mb-6 leading-relaxed">
        Struktur teknologi di balik PintarTani yang dirancang agar ringan, aman,
        dan bekerja secara instan tanpa memperberat perangkat Anda.
      </p>

      {/* Layer 1 */}
      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-5 mb-4 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#8dc868]/20 flex items-center justify-center shrink-0">
            <Smartphone size={18} className="text-[#8dc868]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-brand-accent/50 font-semibold">
              Layer 1 — Tampilan Pengguna (Web Dashboard)
            </div>
            <h3 className="text-[14px] font-semibold text-brand-light">
              Teknologi: React, Vite, & Tailwind CSS
            </h3>
          </div>
        </div>
        <p className="text-[12px] text-brand-light/60 leading-relaxed">
          Ini adalah halaman web interaktif yang Anda buka di HP atau komputer.
          Fungsinya sebagai tempat bagi petani untuk memasukkan data (seperti
          lokasi lahan, pH tanah, atau jenis tanaman) dan melihat hasil analisis
          AI dalam bentuk tampilan yang bersih dan mudah dibaca.
        </p>
      </div>

      {/* Layer 2 */}
      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-5 mb-4 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#dcb45a]/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-[#dcb45a]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-brand-accent/50 font-semibold">
              Layer 2 — Penghubung & Keamanan (Core API & Auth)
            </div>
            <h3 className="text-[14px] font-semibold text-brand-light">
              Teknologi: FastAPI Backend & JWT Security
            </h3>
          </div>
        </div>
        <p className="text-[12px] text-brand-light/60 leading-relaxed">
          Berfungsi sebagai jembatan yang menghubungkan halaman web Anda dengan
          otak AI di server. Bagian ini bertugas memastikan akun Anda aman
          (autentikasi), membatasi kuota harian agar sistem tidak kelebihan
          beban, dan mengarahkan data Anda ke proses berikutnya secara tertib.
        </p>
      </div>

      {/* Layer 3 */}
      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-5 mb-4 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#b5cc6a]/20 flex items-center justify-center shrink-0">
            <Brain size={18} className="text-[#b5cc6a]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-brand-accent/50 font-semibold">
              Layer 3 — Otak Keputusan (Large Language Models)
            </div>
            <h3 className="text-[14px] font-semibold text-brand-light">
              Teknologi: Integrasi Model Bahasa Besar
            </h3>
          </div>
        </div>
        <p className="text-[12px] text-brand-light/60 leading-relaxed">
          PintarTani menggunakan arsitektur LLM yang memanfaatkan kecerdasan
          Model Bahasa Besar global (seperti DeepSeek, Gemini, dan Qwen) melalui
          API. Kami menerapkan sistem pengalihan otomatis (fallback routing)
          agar jika salah satu layanan LLM mengalami gangguan, sistem langsung
          beralih ke LLM cadangan secara instan.
        </p>
      </div>

      {/* Layer 4 */}
      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-5 mb-4 hover:bg-white/10 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#6496dc]/20 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-[#6496dc]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-brand-accent/50 font-semibold">
              Layer 4 — Pengolahan Data Langsung
            </div>
            <h3 className="text-[14px] font-semibold text-brand-light">
              Teknologi: Real-Time Stream Synthesis
            </h3>
          </div>
        </div>
        <p className="text-[12px] text-brand-light/60 leading-relaxed">
          Sistem kami tidak menyimpan database harga pasar atau cuaca lama yang
          kaku. Setiap kali Anda memencet tombol cek harga atau cuaca, AI akan
          langsung melakukan pencarian dan analisis saat detik itu juga, lalu
          mengirimkan jawabannya ke layar Anda.
        </p>
      </div>
    </div>
  );
}

export default Arsitektur;
