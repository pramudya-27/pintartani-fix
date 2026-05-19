function Tentang() {
  return (
    <div className="p-7 animate-fade-in max-w-3xl mx-auto">
      <h2 className="font-playfair text-2xl font-bold text-brand-accent mb-1.5">
        Tentang PintarTani
      </h2>
      <p className="text-xs text-brand-light/40 mb-6 max-w-xl leading-relaxed">
        Platform asisten kecerdasan buatan revolusioner untuk memajukan
        pertanian Indonesia.
      </p>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-4 mb-3">
        <h3 className="text-[13px] font-medium text-brand-accent font-mono mb-1.5">
          Visi Kami
        </h3>
        <p className="text-[11px] text-brand-light/40 leading-relaxed">
          Memberikan akses kepada setiap petani di Indonesia menuju wawasan
          pasar dan prediksi cuaca tingkat lanjut hanya melalui ujung jari
          mereka.
        </p>
      </div>

      <div className="bg-white/5 border border-[rgba(180,220,140,0.1)] rounded-xl p-4 mb-3">
        <h3 className="text-[13px] font-medium text-brand-accent font-mono mb-1.5">
          Misi PintarTani
        </h3>
        <p className="text-[11px] text-brand-light/40 leading-relaxed">
          Meniadakan kesenjangan informasi menggunakan arsitektur LLM. Kami
          percaya bahwa teknologi AI memiliki kapasitas untuk memberikan saran
          ahli tanah dan rekomendasi masa tanam.
        </p>
      </div>
    </div>
  );
}

export default Tentang;
