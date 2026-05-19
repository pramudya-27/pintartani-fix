import {useState} from "react";
import {Leaf, Droplets, Thermometer, DollarSign} from "lucide-react";

const PredictForm = ({onPredict, loading}) => {
  const [formData, setFormData] = useState({
    komoditas: "Bawang Merah",
    suhu_celsius: 27,
    curah_hujan_mm: 5,
    harga_sekarang: 25000,
  });

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: name === "komoditas" ? value : Number(value),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex flex-col space-y-5 transition-all duration-300 hover:shadow-2xl"
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className="bg-green-100 p-2 rounded-full">
          <Leaf className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">
          Kondisi Pertanian
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
            <span>Komoditas</span>
          </label>
          <select
            name="komoditas"
            value={formData.komoditas}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
          >
            <option value="Bawang Merah">Bawang Merah</option>
            <option value="Cabai Rawit">Cabai Rawit</option>
            <option value="Tomat">Tomat</option>
          </select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Harga Sekarang (Rp/kg)</span>
          </label>
          <input
            type="number"
            name="harga_sekarang"
            value={formData.harga_sekarang}
            onChange={handleChange}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
            required
            min="0"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <span>Suhu (°C)</span>
          </label>
          <input
            type="number"
            name="suhu_celsius"
            value={formData.suhu_celsius}
            onChange={handleChange}
            step="0.1"
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span>Curah Hujan (mm)</span>
          </label>
          <input
            type="number"
            name="curah_hujan_mm"
            value={formData.curah_hujan_mm}
            onChange={handleChange}
            step="0.1"
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
            required
            min="0"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
      >
        {loading ? (
          <span className="flex items-center space-x-2">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Menganalisis Data...
          </span>
        ) : (
          "Dapatkan Analisis AI"
        )}
      </button>
    </form>
  );
};

export default PredictForm;
