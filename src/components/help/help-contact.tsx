export function HelpContact() {
  return (
    <div className="bg-black rounded-xl p-8 text-white sticky top-24 shadow-2xl shadow-black/10 overflow-hidden relative">
      {/* Abstract background circles */}
      <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 size-40 bg-white/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-2">Kun je niet vinden wat je zoekt?</h2>
        <p className="text-white/80 mb-8 text-sm">
          Ons supportteam helpt je graag om de perfecte creatieve ruimte te vinden.
        </p>

        <div className="space-y-4">
          <button className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#f6f6f8] transition-colors group">
            <span className="material-symbols-outlined">chat</span>
            Begin Live Chat
          </button>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="size-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-white/90">Reageert meestal binnen 5 minuten</span>
          </div>

          <div className="pt-6 border-t border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">mail</span>
              </div>
              <div>
                <p className="text-xs text-white/60">Mail ons op</p>
                <a href="mailto:support@lcntships.com" className="text-sm font-bold hover:underline">
                  support@lcntships.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white">call</span>
              </div>
              <div>
                <p className="text-xs text-white/60">Bel ons</p>
                <p className="text-sm font-bold">+1 (800) LCNT-HELP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
