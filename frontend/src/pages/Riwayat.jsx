import {useState} from "react";
import {
  LineChart,
  CloudRain,
  FlaskConical,
  Bot,
  Trash2,
  Search,
  Sparkles,
} from "lucide-react";

function Riwayat({loggedInUser}) {
  const historyKey = loggedInUser ? `pt_history_${loggedInUser}` : "pt_history";

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(historyKey) || "[]");
    } catch (e) {
      console.error("Gagal memuat riwayat awal:", e);
      return [];
    }
  });

  const [prevHistoryKey, setPrevHistoryKey] = useState(historyKey);

  if (historyKey !== prevHistoryKey) {
    setPrevHistoryKey(historyKey);
    try {
      setHistory(JSON.parse(localStorage.getItem(historyKey) || "[]"));
    } catch (e) {
      console.error("Gagal menyinkronkan riwayat:", e);
      setHistory([]);
    }
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("Semua");
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleDeleteItem = (id) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  };

  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem(historyKey);
    setShowConfirmClear(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case "Harga Pasar":
        return <LineChart size={16} className="text-[#8dc868]" />;
      case "Cuaca & Risiko":
        return <CloudRain size={16} className="text-[#dcb45a]" />;
      case "Analisis Lahan":
        return <FlaskConical size={16} className="text-[#b5cc6a]" />;
      case "Prediksi Tanam":
        return <Bot size={16} className="text-[#6496dc]" />;
      default:
        return <Sparkles size={16} className="text-brand-accent" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "Harga Pasar":
        return "bg-[#4a8c32]/15 text-[#8dc868] border-[#4a8c32]/30";
      case "Cuaca & Risiko":
        return "bg-[#b4781e]/15 text-[#dcb45a] border-[#b4781e]/30";
      case "Analisis Lahan":
        return "bg-[#b5cc6a]/10 text-[#b5cc6a] border-[#b5cc6a]/20";
      case "Prediksi Tanam":
        return "bg-[#3264b4]/15 text-[#6496dc] border-[#3264b4]/30";
      default:
        return "bg-white/5 text-brand-accent border-brand-accent/20";
    }
  };

  // Filter & Search Logic
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === "Semua" || item.type === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-7 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-brand-accent mb-1.5">
            Riwayat Analisis AI
          </h2>
          <p className="text-xs text-brand-light/40 leading-relaxed">
            Daftar hasil analisis AI yang disimpan.
          </p>
        </div>

        {history.length > 0 && (
          <div className="relative">
            {!showConfirmClear ? (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 self-start sm:self-center"
              >
                <Trash2 size={13} /> Bersihkan Semua
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-black/40 border border-red-500/20 rounded-md p-1.5">
                <span className="text-[10px] text-red-400 px-1">
                  Yakin hapus?
                </span>
                <button
                  onClick={handleClearAll}
                  className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-2 py-1 rounded transition-all"
                >
                  Ya
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="bg-white/10 hover:bg-white/20 text-brand-light/70 text-[10px] px-2 py-1 rounded transition-all"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {history.length > 0 ? (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-light/30"
              />
              <input
                type="text"
                placeholder="Cari kata kunci riwayat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-9"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 py-1.5 -my-1.5 scrollbar-hide">
              {[
                "Semua",
                "Harga Pasar",
                "Cuaca & Risiko",
                "Analisis Lahan",
                "Prediksi Tanam",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`text-[11px] px-3 py-2 rounded-md border transition-all whitespace-nowrap ${
                    filterType === type
                      ? "bg-brand-accent/15 text-brand-accent border-brand-accent/30 font-medium"
                      : "bg-white/5 text-brand-light/50 border-white/5 hover:text-brand-light/80 hover:bg-white/10"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* History List */}
          <div className="flex flex-col gap-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="glass-card p-5 border border-[rgba(180,220,140,0.1)] rounded-xl relative group"
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border ${getBadgeColor(item.type)}`}
                      >
                        {getIcon(item.type)}
                      </div>
                      <span
                        className={`text-[11px] font-semibold border px-2 py-0.5 rounded-full ${getBadgeColor(item.type)}`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] text-brand-light/30">
                        {item.timestamp}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-brand-light/30 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-all sm:opacity-0 group-hover:opacity-100"
                      title="Hapus analisis ini"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Response */}
                  <div className="bg-black/20 rounded-lg p-4 border border-[rgba(180,220,140,0.05)]">
                    <div className="text-[10px] text-brand-light/40 uppercase tracking-wider mb-2 font-medium">
                      Hasil Analisis:
                    </div>
                    <div className="text-xs text-brand-light/85 whitespace-pre-wrap leading-relaxed">
                      {item.content.replace(/\*\*/g, "")}
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="mt-3 text-[10px] text-brand-light/20 flex justify-end gap-1">
                    <span>Generated by:</span>
                    <span className="text-brand-accent/50 font-medium">
                      {item.source}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/5 border border-dashed border-brand-border rounded-xl p-10 text-center">
                <Search
                  size={32}
                  className="mx-auto text-brand-light/20 mb-3"
                />
                <div className="text-sm font-medium text-brand-light/70 mb-1">
                  Pencarian Tidak Ditemukan
                </div>
                <div className="text-xs text-brand-light/35">
                  Coba gunakan kata kunci lain atau pilih filter yang berbeda.
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white/5 border border-dashed border-brand-border rounded-xl p-12 text-center max-w-lg mx-auto mt-6">
          <Sparkles
            size={40}
            className="mx-auto text-brand-accent/30 mb-4 animate-pulse"
          />
          <h3 className="text-base font-semibold text-brand-light mb-1.5">
            Belum Ada Riwayat Analisis
          </h3>
          <p className="text-xs text-brand-light/40 mb-6 leading-relaxed">
            Anda belum melakukan analisis harga, prediksi tanam, atau analisis
            kondisi lahan. Silakan coba salah satu fitur cerdas kami terlebih
            dahulu.
          </p>
        </div>
      )}
    </div>
  );
}

export default Riwayat;
