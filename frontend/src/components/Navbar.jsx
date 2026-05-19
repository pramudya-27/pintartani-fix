function Navbar({currentPage, setPage, loggedInUser}) {
  const tabs = [
    {id: "beranda", label: "Beranda"},
    {id: "fitur", label: "Fitur"},
    ...(loggedInUser ? [{id: "riwayat", label: "Riwayat"}] : []),
    {id: "arsitektur", label: "Arsitektur"},
    {id: "tentang", label: "Tentang"},
  ];

  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 border-b border-brand-border relative z-10 bg-brand-bg w-full">
      {/* Brand Logo & Mobile Account Button */}
      <div className="flex items-center justify-between w-full sm:w-auto">
        <div className="flex items-center gap-3">
          <img
            src="/logo-pintartani.png"
            alt="PintarTani Logo"
            className="w-14 h-14 object-contain shrink-0 rounded-full border border-brand-accent/45 p-1 shadow-[0_0_15px_rgba(181,204,106,0.25)] bg-white/85 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-brand-accent hover:shadow-[0_0_25px_rgba(181,204,106,0.5)] cursor-pointer"
          />
          <span className="font-playfair text-lg font-bold text-brand-accent whitespace-nowrap">
            PintarTani
          </span>
        </div>

        {/* Mobile Account Button */}
        <div className="sm:hidden">
          <button
            onClick={() => setPage("akun")}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all whitespace-nowrap
              ${
                currentPage === "akun"
                  ? "bg-brand-accent/20 border-brand-accent/40 text-brand-accent font-medium"
                  : "bg-white/5 border-white/5 text-brand-light/70 hover:bg-white/10 hover:text-brand-light"
              }`}
          >
            👤 {loggedInUser ? loggedInUser : "Akun"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs - Centered */}
      <div className="flex gap-1 overflow-x-auto max-w-full justify-center py-1.5 -my-1.5 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            className={`text-xs px-3 py-1.5 rounded-md transition-all whitespace-nowrap
              ${
                currentPage === tab.id
                  ? "text-brand-accent bg-brand-accent/10 font-medium"
                  : "text-brand-light/50 hover:text-brand-accent hover:bg-brand-accent/5"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop/Tablet Account Button & Version */}
      <div className="hidden sm:flex items-center gap-3">
        <button
          onClick={() => setPage("akun")}
          className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg border transition-all whitespace-nowrap
            ${
              currentPage === "akun"
                ? "bg-brand-accent/20 border-brand-accent/40 text-brand-accent font-medium"
                : "bg-white/5 border-white/5 text-brand-light/70 hover:bg-white/10 hover:text-brand-light"
            }`}
        >
          👤 {loggedInUser ? loggedInUser : "Akun"}
        </button>
        <span className="bg-brand-primary/10 border border-brand-primary/20 text-[#8dc868] text-[9px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
          v1.0
        </span>
      </div>
    </nav>
  );
}

export default Navbar;
