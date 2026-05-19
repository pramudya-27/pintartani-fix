import {TrendingUp, TrendingDown, Sparkles, AlertCircle} from "lucide-react";

const ResultCard = ({result, currentPrice}) => {
  if (!result) return null;

  const isUp = result.predicted_price >= currentPrice;
  const changePercent = Math.abs(
    ((result.predicted_price - currentPrice) / currentPrice) * 100,
  ).toFixed(1);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mt-6 md:mt-0 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white text-center">
        <h3 className="text-sm font-medium text-emerald-100 uppercase tracking-wider mb-1">
          Prediksi Harga
        </h3>
        <p className="text-4xl font-bold tracking-tight">
          Rp {result.predicted_price.toLocaleString("id-ID")}
        </p>
        <div className="mt-3 flex justify-center items-center space-x-2">
          <span
            className={`flex items-center text-sm font-semibold px-3 py-1 rounded-full ${isUp ? "bg-emerald-800/40 text-emerald-100" : "bg-red-500/80 text-rose-100"}`}
          >
            {isUp ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {changePercent}% dari sekarang
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Weather Context */}
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg mt-0.5">
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Konteks Cuaca
            </h4>
            <p className="text-sm text-blue-700">{result.weather_context}</p>
          </div>
        </div>

        {/* Action Recommendation */}
        <div
          className={`p-5 rounded-xl border ${result.is_gemini_fallback ? "bg-indigo-50 border-indigo-200" : "bg-green-50 border-green-200"}`}
        >
          <div className="flex items-center space-x-2 mb-3">
            {result.is_gemini_fallback ? (
              <>
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h4 className="font-bold text-indigo-900">Saran Pakar AI</h4>
              </>
            ) : (
              <h4 className="font-bold text-green-900">Rekomendasi Tindakan</h4>
            )}
          </div>
          <p
            className={`text-base leading-relaxed ${result.is_gemini_fallback ? "text-indigo-800" : "text-green-800"}`}
          >
            {result.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
