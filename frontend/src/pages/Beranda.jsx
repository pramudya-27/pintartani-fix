import {Bot, LineChart, CloudRain, FlaskConical} from "lucide-react";

function Beranda({setPage, setOpenCard}) {
  const openFeature = (cardId) => {
    setPage("fitur");
    setTimeout(() => setOpenCard(cardId), 60);
  };

  return (
    <div className="relative z-10 animate-fade-in max-w-4xl mx-auto">
      <div className="px-6 pt-12 pb-8 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 px-3 py-1 rounded-full mb-6 text-[11px] text-brand-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse-dot"></span>
          AI Agent Smart Farm
        </div>
        <h1 className="font-playfair text-4xl sm:text-5xl font-black leading-tight text-brand-light mb-4 tracking-tight">
          Asisten Tani
          <br />
          <em className="text-brand-accent not-italic">Berbasis AI</em>
          <br />
          untuk Petani
        </h1>
        <p className="text-sm leading-relaxed text-brand-light/60 mb-7 font-light">
          PintarTani adalah ekosistem asisten pertanian yang terintegrasi secara
          langsung dengan kecerdasan LLM untuk menyajikan data pasar dan cuaca
          secara pintar ke petani via Web Dashboard.
        </p>
        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={() => setPage("fitur")}
            className="bg-brand-primary hover:bg-brand-primary-hover text-brand-light px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Bot size={16} /> Coba Demo Fitur
          </button>
          <button
            onClick={() => setPage("arsitektur")}
            className="bg-transparent border border-brand-light/20 text-brand-light/70 hover:border-brand-accent/40 hover:text-brand-accent px-5 py-2.5 rounded-lg text-sm transition-all"
          >
            Lihat Arsitektur →
          </button>
        </div>
      </div>

      <div className="flex gap-6 px-6 py-4 border-y border-[#b4dc8c]/10 flex-wrap bg-brand-bg relative z-10">
        <div>
          <div className="text-xl font-medium text-brand-accent font-playfair">
            34+
          </div>
          <div className="text-[10px] text-brand-light/40 uppercase tracking-wide">
            Kota dipantau
          </div>
        </div>
        <div>
          <div className="text-xl font-medium text-brand-accent font-playfair">
            3
          </div>
          <div className="text-[10px] text-brand-light/40 uppercase tracking-wide">
            Model AI
          </div>
        </div>
        <div>
          <div className="text-xl font-medium text-brand-accent font-playfair">
            AI
          </div>
          <div className="text-[10px] text-brand-light/40 uppercase tracking-wide">
            Pakar Cuaca
          </div>
        </div>
        <div>
          <div className="text-xl font-medium text-brand-accent font-playfair">
            AI
          </div>
          <div className="text-[10px] text-brand-light/40 uppercase tracking-wide">
            Pakar Harga
          </div>
        </div>
      </div>

      <div className="text-[10px] text-brand-light/30 uppercase tracking-wide px-6 mt-4 mb-2.5">
        Akses cepat fitur
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-6 pb-6">
        <div
          onClick={() => openFeature("c-harga")}
          className="bg-white/5 border border-[#b4dc8c]/10 rounded-xl p-3.5 cursor-pointer transition-all hover:bg-white/10 hover:border-brand-accent/30 active:scale-95"
        >
          <div className="text-xl mb-2">
            <LineChart className="text-[#8dc868]" size={20} />
          </div>
          <div className="text-xs font-medium text-brand-light mb-1">
            Cek Harga Pasar
          </div>
          <div className="text-[10px] text-brand-light/40">
            Estimasi Pakar AI →
          </div>
        </div>
        <div
          onClick={() => openFeature("c-cuaca")}
          className="bg-white/5 border border-[#b4dc8c]/10 rounded-xl p-3.5 cursor-pointer transition-all hover:bg-white/10 hover:border-brand-accent/30 active:scale-95"
        >
          <div className="text-xl mb-2">
            <CloudRain className="text-[#8dc868]" size={20} />
          </div>
          <div className="text-xs font-medium text-brand-light mb-1">
            Cuaca & Risiko
          </div>
          <div className="text-[10px] text-brand-light/40">
            Analisis Risiko AI →
          </div>
        </div>
        <div
          onClick={() => openFeature("c-tanah")}
          className="bg-white/5 border border-[#b4dc8c]/10 rounded-xl p-3.5 cursor-pointer transition-all hover:bg-white/10 hover:border-brand-accent/30 active:scale-95"
        >
          <div className="text-xl mb-2">
            <FlaskConical className="text-[#8dc868]" size={20} />
          </div>
          <div className="text-xs font-medium text-brand-light mb-1">
            Analisis Lahan
          </div>
          <div className="text-[10px] text-brand-light/40">
            Rekomendasi pupuk AI →
          </div>
        </div>
        <div
          onClick={() => openFeature("c-prediksi")}
          className="bg-white/5 border border-[#b4dc8c]/10 rounded-xl p-3.5 cursor-pointer transition-all hover:bg-white/10 hover:border-brand-accent/30 active:scale-95"
        >
          <div className="text-xl mb-2">
            <Bot className="text-[#8dc868]" size={20} />
          </div>
          <div className="text-xs font-medium text-brand-light mb-1">
            Prediksi & Saran Tanam
          </div>
          <div className="text-[10px] text-brand-light/40">
            Decision Engine AI →
          </div>
        </div>
      </div>
    </div>
  );
}

export default Beranda;
