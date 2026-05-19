import {useState} from "react";
import {LineChart, CloudRain, FlaskConical, Bot, Sparkles} from "lucide-react";
import TypewriterEffect from "../components/TypewriterEffect";

function Fitur({openCard, setOpenCard, setQuota, loggedInUser}) {
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState(null);

  // States for Harga
  const [komoditas, setKomoditas] = useState("");
  const [kotaHarga, setKotaHarga] = useState("");
  const [resHarga, setResHarga] = useState(null);

  // States for Cuaca
  const [kotaCuaca, setKotaCuaca] = useState("");
  const [resCuaca, setResCuaca] = useState(null);

  // States for Tanah
  const [ph, setPh] = useState("");
  const [tekstur, setTekstur] = useState("");
  const [lokasiTanah, setLokasiTanah] = useState("");
  const [resTanah, setResTanah] = useState(null);

  // States for Prediksi
  const [komoditasPred, setKomoditasPred] = useState("");
  const [bulanPred, setBulanPred] = useState("");
  const [wilayahPred, setWilayahPred] = useState("");
  const [resPrediksi, setResPrediksi] = useState(null);

  const toggleCard = (id) => {
    setOpenCard(openCard === id ? null : id);
  };

  const parseAIResponse = (text) => {
    if (!text) return "";
    // Menghapus ** (bold markdown) agar tampilan lebih bersih
    return text.replace(/\*\*/g, "");
  };

  const callAI = async (prompt, setResState) => {
    const token = localStorage.getItem("pt_token");
    if (!token) {
      setResState({error: "Anda harus login terlebih dahulu di menu Akun."});
      return;
    }

    setLoading(true);
    setResState(null);
    setActiveForm(openCard);

    let accumulatedContent = "";
    let source = "";
    let quota_left = 0;

    const BASE_URL = "https://daimyo27-pintartani-backend.hf.space";
    try {
      const response = await fetch(`${BASE_URL}/api/ask/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({prompt}),
      });

      if (!response.ok) {
        let errorMsg = `Kesalahan Server (${response.status})`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch {
          errorMsg = `Error ${response.status}: ${response.statusText || "Terjadi kesalahan koneksi"}`;
        }
        throw new Error(errorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream: true});
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Simpan sisa baris yang belum lengkap

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

          const dataStr = trimmedLine.slice(6).trim();
          if (dataStr === "[DONE]") break;

          try {
            const data = JSON.parse(dataStr);
            if (data.quota_left !== undefined) {
              quota_left = data.quota_left;
              localStorage.setItem("pt_quota", quota_left);
              setQuota(quota_left);
            }
            if (data.source) {
              source = data.source;
            }
            if (data.content) {
              accumulatedContent += data.content;
              const cleanContent = parseAIResponse(accumulatedContent);
              setResState({
                content: cleanContent,
                source: source,
                quota_left: quota_left,
              });
            }
          } catch (e) {
            console.error("Error parsing stream chunk:", e);
          }
        }
      }

      // Simpan ke Riwayat setelah selesai streaming
      const finalCleanContent = parseAIResponse(accumulatedContent);
      try {
        const historyItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          type:
            openCard === "c-harga"
              ? "Harga Pasar"
              : openCard === "c-cuaca"
                ? "Cuaca & Risiko"
                : openCard === "c-tanah"
                  ? "Analisis Lahan"
                  : openCard === "c-prediksi"
                    ? "Prediksi Tanam"
                    : "Analisis AI",
          prompt: prompt,
          content: finalCleanContent,
          source: source,
        };
        const username = loggedInUser || localStorage.getItem("pt_user");
        const historyKey = username ? `pt_history_${username}` : "pt_history";
        const existingHistory = JSON.parse(
          localStorage.getItem(historyKey) || "[]",
        );
        localStorage.setItem(
          historyKey,
          JSON.stringify([historyItem, ...existingHistory]),
        );
      } catch (historyErr) {
        console.error("Gagal menyimpan riwayat:", historyErr);
      }
    } catch (err) {
      if (err.message === "Unauthorized" || err.status === 401) {
        localStorage.removeItem("pt_token");
        setResState({error: "Sesi berakhir, silakan login kembali."});
      } else {
        setResState({
          error: err.message || "Terjadi kesalahan server.",
        });
      }
    } finally {
      setLoading(false);
      setActiveForm(null);
    }
  };

  const aiHarga = () => {
    if (!komoditas || !kotaHarga) {
      setResHarga({error: "Pilih komoditas dan kota terlebih dahulu."});
      return;
    }
    const prompt = `Berikan analisis harga ${komoditas} di ${kotaHarga} saat ini. Sertakan:
1. 📊 Estimasi harga saat ini (Rp/kg) berdasarkan data pasar riil
2. 📈 Tren harga 7 hari terakhir (naik/turun/stabil dan persentase)
3. 🏙️ Perbandingan harga di 3 kota besar lainnya
4. 💡 Rekomendasi: apakah ini waktu yang baik untuk menjual?
5. ⚠️ Faktor yang mempengaruhi harga saat ini`;
    callAI(prompt, setResHarga);
  };

  const aiCuaca = () => {
    if (!kotaCuaca) {
      setResCuaca({error: "Pilih kota terlebih dahulu."});
      return;
    }
    const prompt = `Berikan analisis cuaca dan dampak pertanian untuk ${kotaCuaca}:
1. 🌡️ Kondisi cuaca saat ini (suhu, kelembapan, curah hujan)
2. 🌧️ Prakiraan 3 hari ke depan
3. 🌾 Dampak ke tanaman: apa yang harus diwaspadai?
4. ⚠️ Tingkat risiko pertanian: rendah/sedang/tinggi dan alasannya
5. ✅ Rekomendasi tindakan petani hari ini
6. 🚚 Kondisi distribusi hasil panen ke pasar`;
    callAI(prompt, setResCuaca);
  };

  const aiTanah = () => {
    if (!ph || !tekstur || !lokasiTanah) {
      setResTanah({error: "Isi semua data lahan terlebih dahulu."});
      return;
    }
    const prompt = `Analisis lahan pertanian dengan data berikut:
- pH Tanah: ${ph}
- Tekstur: ${tekstur}  
- Lokasi: ${lokasiTanah}

Berikan:
1. 🧪 Diagnosis kondisi tanah (asam/netral/basa dan artinya)
2. 💊 Amendemen tanah yang diperlukan (kapur/belerang/dll + dosis per hektar)
3. 🌿 Rekomendasi pupuk utama (NPK + pupuk organik + dosis)
4. 🌱 Komoditas yang paling cocok (3-5 tanaman terbaik)
5. ⚡ Komoditas yang harus dihindari
6. 📅 Waktu persiapan lahan yang disarankan`;
    callAI(prompt, setResTanah);
  };

  const aiPrediksi = () => {
    if (!komoditasPred || !bulanPred || !wilayahPred) {
      setResPrediksi({error: "Isi semua data prediksi terlebih dahulu."});
      return;
    }
    const prompt = `Buat prediksi dan saran tanam untuk petani dengan rencana:
- Komoditas: ${komoditasPred}
- Bulan tanam: ${bulanPred}
- Wilayah: ${wilayahPred}

Analisis dan berikan:
1. 📅 Kalender tanam: bulan tanam → panen → jual terbaik
2. 🌧️ Kesesuaian dengan pola curah hujan dan musim di wilayah tersebut
3. 📈 Prediksi harga saat panen (berdasarkan tren dan musim)
4. ⚠️ Risiko utama dan cara mitigasinya
5. 💰 Estimasi keuntungan per hektar (kasar)
6. 🏆 Rekomendasi akhir: lanjutkan atau pertimbangkan alternatif?`;
    callAI(prompt, setResPrediksi);
  };

  const renderResult = (res) => {
    if (!res) return null;
    if (res.error) {
      return (
        <div className="mt-2.5 bg-black/30 border border-brand-accent/20 rounded-lg p-3 text-xs text-red-400">
          ⚠️ {res.error}
        </div>
      );
    }
    return (
      <div className="mt-2.5 bg-black/30 border border-brand-accent/20 rounded-lg p-3 text-xs text-brand-light/80 whitespace-pre-wrap leading-relaxed shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)]">
        <TypewriterEffect text={res.content} />
        <div className="mt-2.5 text-[10px] text-brand-accent/50 border-t border-brand-accent/10 pt-2 flex justify-between">
          <span>Model: {res.source}</span>
          <span>Sisa Kuota: {res.quota_left}/5</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-7 animate-fade-in max-w-5xl mx-auto">
      <div className="text-[10px] text-brand-light/30 uppercase tracking-wide mb-4 text-center md:text-left">
        Pilih salah satu fitur di bawah ini untuk memulai analisis
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* Left Side: 4 Compact Cards */}
        <div className="md:col-span-2 flex flex-col gap-3">
          {/* Harga Card */}
          <div
            className={`glass-card p-4 cursor-pointer transition-all hover:bg-white/10 ${
              openCard === "c-harga"
                ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20"
                : "border-brand-border/10"
            }`}
            onClick={() => toggleCard("c-harga")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4a8c32]/20 flex items-center justify-center shrink-0">
                <LineChart size={18} className="text-[#8dc868]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-brand-light truncate">
                  Harga Pasar Real-Time
                </div>
                <p className="text-[10px] text-brand-light/40 truncate">
                  Analisis harga & estimasi
                </p>
              </div>
            </div>
          </div>

          {/* Cuaca Card */}
          <div
            className={`glass-card p-4 cursor-pointer transition-all hover:bg-white/10 ${
              openCard === "c-cuaca"
                ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20"
                : "border-brand-border/10"
            }`}
            onClick={() => toggleCard("c-cuaca")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#b4781e]/20 flex items-center justify-center shrink-0">
                <CloudRain size={18} className="text-[#dcb45a]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-brand-light truncate">
                  Cuaca & Risiko Tani
                </div>
                <p className="text-[10px] text-brand-light/40 truncate">
                  Prakiraan cuaca & risiko bertani
                </p>
              </div>
            </div>
          </div>

          {/* Tanah Card */}
          <div
            className={`glass-card p-4 cursor-pointer transition-all hover:bg-white/10 ${
              openCard === "c-tanah"
                ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20"
                : "border-brand-border/10"
            }`}
            onClick={() => toggleCard("c-tanah")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#b5cc6a]/15 flex items-center justify-center shrink-0">
                <FlaskConical size={18} className="text-[#b5cc6a]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-brand-light truncate">
                  Analisis Lahan & Pupuk
                </div>
                <p className="text-[10px] text-brand-light/40 truncate">
                  Rekomendasi pupuk & kecocokan lahan
                </p>
              </div>
            </div>
          </div>

          {/* Prediksi Card */}
          <div
            className={`glass-card p-4 cursor-pointer transition-all hover:bg-white/10 ${
              openCard === "c-prediksi"
                ? "border-brand-accent bg-brand-accent/5 ring-1 ring-brand-accent/20"
                : "border-brand-border/10"
            }`}
            onClick={() => toggleCard("c-prediksi")}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3264b4]/20 flex items-center justify-center shrink-0">
                <Bot size={18} className="text-[#6496dc]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-brand-light truncate">
                  Prediksi & Saran Tanam
                </div>
                <p className="text-[10px] text-brand-light/40 truncate">
                  Sistem AI penggabungan tren & musim
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic Workspace Panel */}
        <div className="md:col-span-3">
          {openCard ? (
            <div className="glass-card p-6 border border-[rgba(180,220,140,0.1)] rounded-xl bg-brand-bg/40">
              {openCard === "c-harga" && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-[#4a8c32]/20 flex items-center justify-center">
                      <LineChart size={14} className="text-[#8dc868]" />
                    </div>
                    <h3 className="text-sm font-semibold text-brand-light">
                      Formulir Harga Pasar Real-Time
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Komoditas
                      </label>
                      <select
                        className="form-input w-full"
                        value={komoditas}
                        onChange={(e) => setKomoditas(e.target.value)}
                      >
                        <option value="">— Pilih komoditas —</option>
                        <option>Padi</option>
                        <option>Jagung</option>
                        <option>Kedelai</option>
                        <option>Cabai Merah</option>
                        <option>Cabai Rawit</option>
                        <option>Bawang Merah</option>
                        <option>Bawang Putih</option>
                        <option>Tomat</option>
                        <option>Kentang</option>
                        <option>Wortel</option>
                        <option>Kubis</option>
                        <option>Sawi</option>
                        <option>Bayam</option>
                        <option>Kangkung</option>
                        <option>Kacang Panjang</option>
                        <option>Mentimun</option>
                        <option>Terong</option>
                        <option>Kelapa Sawit</option>
                        <option>Karet</option>
                        <option>Kopi</option>
                        <option>Kakao</option>
                        <option>Teh</option>
                        <option>Tebu</option>
                        <option>Tembakau</option>
                        <option>Cengkeh</option>
                        <option>Lada</option>
                        <option>Pala</option>
                        <option>Kayu Manis</option>
                        <option>Kelapa</option>
                        <option>Jeruk</option>
                        <option>Mangga</option>
                        <option>Pisang</option>
                        <option>Nanas</option>
                        <option>Pepaya</option>
                        <option>Durian</option>
                        <option>Rambutan</option>
                        <option>Manggis</option>
                        <option>Alpukat</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Kota / Wilayah
                      </label>
                      <select
                        className="form-input w-full"
                        value={kotaHarga}
                        onChange={(e) => setKotaHarga(e.target.value)}
                      >
                        <option value="">— Pilih kota —</option>
                        <option>Banda Aceh</option>
                        <option>Medan</option>
                        <option>Padang</option>
                        <option>Pekanbaru</option>
                        <option>Tanjung Pinang</option>
                        <option>Jambi</option>
                        <option>Palembang</option>
                        <option>Pangkal Pinang</option>
                        <option>Bengkulu</option>
                        <option>Bandar Lampung</option>
                        <option>Jakarta</option>
                        <option>Bandung</option>
                        <option>Serang</option>
                        <option>Semarang</option>
                        <option>Yogyakarta</option>
                        <option>Surabaya</option>
                        <option>Denpasar</option>
                        <option>Mataram</option>
                        <option>Kupang</option>
                        <option>Pontianak</option>
                        <option>Palangkaraya</option>
                        <option>Banjarmasin</option>
                        <option>Samarinda</option>
                        <option>Tanjung Selor</option>
                        <option>Manado</option>
                        <option>Gorontalo</option>
                        <option>Palu</option>
                        <option>Mamuju</option>
                        <option>Makassar</option>
                        <option>Kendari</option>
                        <option>Ambon</option>
                        <option>Sofifi</option>
                        <option>Jayapura</option>
                        <option>Manokwari</option>
                        <option>Merauke</option>
                        <option>Nabire</option>
                        <option>Wamena</option>
                        <option>Sorong</option>
                      </select>
                    </div>

                    <button
                      disabled={loading && activeForm === "c-harga"}
                      onClick={aiHarga}
                      className="mt-2 bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                    >
                      <LineChart size={14} /> Analisis Harga
                    </button>
                  </div>
                  {loading && activeForm === "c-harga" && (
                    <div className="mt-4 ai-loading text-xs">
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span> Memulai
                      menganalisis harga...
                    </div>
                  )}
                  {renderResult(resHarga)}
                </div>
              )}

              {openCard === "c-cuaca" && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-[#b4781e]/20 flex items-center justify-center">
                      <CloudRain size={14} className="text-[#dcb45a]" />
                    </div>
                    <h3 className="text-sm font-semibold text-brand-light">
                      Formulir Risiko & Prakiraan Cuaca
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Kota / Provinsi
                      </label>
                      <select
                        className="form-input w-full"
                        value={kotaCuaca}
                        onChange={(e) => setKotaCuaca(e.target.value)}
                      >
                        <option value="">— Pilih kota/provinsi —</option>
                        <option>Banda Aceh</option>
                        <option>Medan</option>
                        <option>Padang</option>
                        <option>Pekanbaru</option>
                        <option>Tanjung Pinang</option>
                        <option>Jambi</option>
                        <option>Palembang</option>
                        <option>Pangkal Pinang</option>
                        <option>Bengkulu</option>
                        <option>Bandar Lampung</option>
                        <option>Jakarta</option>
                        <option>Bandung</option>
                        <option>Serang</option>
                        <option>Semarang</option>
                        <option>Yogyakarta</option>
                        <option>Surabaya</option>
                        <option>Denpasar</option>
                        <option>Mataram</option>
                        <option>Kupang</option>
                        <option>Pontianak</option>
                        <option>Palangkaraya</option>
                        <option>Banjarmasin</option>
                        <option>Samarinda</option>
                        <option>Tanjung Selor</option>
                        <option>Manado</option>
                        <option>Gorontalo</option>
                        <option>Palu</option>
                        <option>Mamuju</option>
                        <option>Makassar</option>
                        <option>Kendari</option>
                        <option>Ambon</option>
                        <option>Sofifi</option>
                        <option>Jayapura</option>
                        <option>Manokwari</option>
                        <option>Merauke</option>
                        <option>Nabire</option>
                        <option>Wamena</option>
                        <option>Sorong</option>
                      </select>
                    </div>

                    <button
                      disabled={loading && activeForm === "c-cuaca"}
                      onClick={aiCuaca}
                      className="mt-2 bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                    >
                      <CloudRain size={14} /> Cek Cuaca & Risiko
                    </button>
                  </div>
                  {loading && activeForm === "c-cuaca" && (
                    <div className="mt-4 ai-loading text-xs">
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span> Memulai
                      menganalisis cuaca...
                    </div>
                  )}
                  {renderResult(resCuaca)}
                </div>
              )}

              {openCard === "c-tanah" && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-[#b5cc6a]/15 flex items-center justify-center">
                      <FlaskConical size={14} className="text-[#b5cc6a]" />
                    </div>
                    <h3 className="text-sm font-semibold text-brand-light">
                      Formulir Analisis Kondisi Lahan
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        pH Tanah
                      </label>
                      <input
                        type="number"
                        className="form-input w-full"
                        placeholder="pH tanah (contoh: 6.5)"
                        value={ph}
                        onChange={(e) => setPh(e.target.value)}
                        min="3.5"
                        max="9"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Tekstur Tanah
                      </label>
                      <select
                        className="form-input w-full"
                        value={tekstur}
                        onChange={(e) => setTekstur(e.target.value)}
                      >
                        <option value="">— Tekstur tanah —</option>
                        <option>Lempung (Loam)</option>
                        <option>Berpasir (Sandy Loam)</option>
                        <option>Berliat (Clay)</option>
                        <option>Gambut (Peat)</option>
                        <option>Pasir (Sandy)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Lokasi Lahan
                      </label>
                      <select
                        className="form-input w-full"
                        value={lokasiTanah}
                        onChange={(e) => setLokasiTanah(e.target.value)}
                      >
                        <option value="">— Lokasi lahan —</option>
                        <option>Jawa</option>
                        <option>Sumatera</option>
                        <option>Kalimantan</option>
                        <option>Sulawesi</option>
                        <option>Bali & Nusa Tenggara</option>
                        <option>Papua</option>
                      </select>
                    </div>

                    <button
                      disabled={loading && activeForm === "c-tanah"}
                      onClick={aiTanah}
                      className="mt-2 bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                    >
                      <FlaskConical size={14} /> Analisis Lahan
                    </button>
                  </div>
                  {loading && activeForm === "c-tanah" && (
                    <div className="mt-4 ai-loading text-xs">
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span> Memulai
                      menganalisis kondisi lahan...
                    </div>
                  )}
                  {renderResult(resTanah)}
                </div>
              )}

              {openCard === "c-prediksi" && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-[#3264b4]/20 flex items-center justify-center">
                      <Bot size={14} className="text-[#6496dc]" />
                    </div>
                    <h3 className="text-sm font-semibold text-brand-light">
                      Formulir Prediksi & Saran Tanam
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Komoditas
                      </label>
                      <select
                        className="form-input w-full"
                        value={komoditasPred}
                        onChange={(e) => setKomoditasPred(e.target.value)}
                      >
                        <option value="">— Komoditas —</option>
                        <option>Padi</option>
                        <option>Jagung</option>
                        <option>Kedelai</option>
                        <option>Cabai Merah</option>
                        <option>Cabai Rawit</option>
                        <option>Bawang Merah</option>
                        <option>Bawang Putih</option>
                        <option>Tomat</option>
                        <option>Kentang</option>
                        <option>Wortel</option>
                        <option>Kubis</option>
                        <option>Sawi</option>
                        <option>Bayam</option>
                        <option>Kangkung</option>
                        <option>Kacang Panjang</option>
                        <option>Mentimun</option>
                        <option>Terong</option>
                        <option>Kelapa Sawit</option>
                        <option>Karet</option>
                        <option>Kopi</option>
                        <option>Kakao</option>
                        <option>Teh</option>
                        <option>Tebu</option>
                        <option>Tembakau</option>
                        <option>Cengkeh</option>
                        <option>Lada</option>
                        <option>Pala</option>
                        <option>Kayu Manis</option>
                        <option>Kelapa</option>
                        <option>Jeruk</option>
                        <option>Mangga</option>
                        <option>Pisang</option>
                        <option>Nanas</option>
                        <option>Pepaya</option>
                        <option>Durian</option>
                        <option>Rambutan</option>
                        <option>Manggis</option>
                        <option>Alpukat</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Bulan Tanam
                      </label>
                      <select
                        className="form-input w-full"
                        value={bulanPred}
                        onChange={(e) => setBulanPred(e.target.value)}
                      >
                        <option value="">— Bulan tanam —</option>
                        <option>Januari</option>
                        <option>Februari</option>
                        <option>Maret</option>
                        <option>April</option>
                        <option>Mei</option>
                        <option>Juni</option>
                        <option>Juli</option>
                        <option>Agustus</option>
                        <option>September</option>
                        <option>Oktober</option>
                        <option>November</option>
                        <option>Desember</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-brand-light/40 font-medium uppercase tracking-wider mb-1 block">
                        Wilayah
                      </label>
                      <select
                        className="form-input w-full"
                        value={wilayahPred}
                        onChange={(e) => setWilayahPred(e.target.value)}
                      >
                        <option value="">— Wilayah —</option>
                        <option>Aceh</option>
                        <option>Sumatera Utara</option>
                        <option>Sumatera Barat</option>
                        <option>Riau</option>
                        <option>Kepulauan Riau</option>
                        <option>Jambi</option>
                        <option>Sumatera Selatan</option>
                        <option>Bangka Belitung</option>
                        <option>Bengkulu</option>
                        <option>Lampung</option>
                        <option>DKI Jakarta</option>
                        <option>Jawa Barat</option>
                        <option>Banten</option>
                        <option>Jawa Tengah</option>
                        <option>DI Yogyakarta</option>
                        <option>Jawa Timur</option>
                        <option>Bali</option>
                        <option>NTB</option>
                        <option>NTT</option>
                        <option>Kalimantan Barat</option>
                        <option>Kalimantan Tengah</option>
                        <option>Kalimantan Selatan</option>
                        <option>Kalimantan Timur</option>
                        <option>Kalimantan Utara</option>
                        <option>Sulawesi Utara</option>
                        <option>Gorontalo</option>
                        <option>Sulawesi Tengah</option>
                        <option>Sulawesi Barat</option>
                        <option>Sulawesi Selatan</option>
                        <option>Sulawesi Tenggara</option>
                        <option>Maluku</option>
                        <option>Maluku Utara</option>
                        <option>Papua Tengah</option>
                        <option>Papua Selatan</option>
                        <option>Papua Pegunungan</option>
                        <option>Papua Barat Daya</option>
                        <option>Papua Barat</option>
                        <option>Papua</option>
                      </select>
                    </div>

                    <button
                      disabled={loading && activeForm === "c-prediksi"}
                      onClick={aiPrediksi}
                      className="mt-2 bg-[#4a8c32]/20 hover:bg-[#4a8c32]/30 border border-[#4a8c32]/40 text-[#8dc868] text-xs py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
                    >
                      <Bot size={14} /> Dapatkan Prediksi
                    </button>
                  </div>
                  {loading && activeForm === "c-prediksi" && (
                    <div className="mt-4 ai-loading text-xs">
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span>
                      <span className="ai-loading-dot"></span> Memulai
                      menganalisis rekomendasi...
                    </div>
                  )}
                  {renderResult(resPrediksi)}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] border border-brand-border/10 rounded-xl bg-brand-bg/40 animate-fade-in">
              <Sparkles
                size={36}
                className="text-brand-accent/30 mb-3 animate-pulse"
              />
              <h3 className="text-sm font-semibold text-brand-light mb-1">
                Mulai Analisis
              </h3>
              <p className="text-[11px] text-brand-light/40 max-w-[240px] leading-relaxed">
                Pilih salah satu fitur di sebelah kiri untuk membuka form input
                dan memulai analisis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Fitur;
