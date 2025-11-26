"use client"
import { useNavigate } from "react-router-dom"
import { Menu, X, Twitter, Instagram, Twitch, Youtube, Zap, Crosshair, ShieldAlert } from "lucide-react"
import { useState } from "react"
import gun from "./assets/gun.png"
import logo from "./assets/logo.png"
import side1 from "./assets/side1.png"
import side2 from "./assets/side2.png"
import skull from "./assets/skull.png"
import background from "./assets/background.png"

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="bg-[#050505] text-white min-h-screen font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* GLOBAL ATMOSPHERE: Noise & Grid Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,11,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,4px_100%]"></div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-transparent pt-4">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="group cursor-pointer">
            <div className="text-3xl text-white font-black italic tracking-tighter leading-none group-hover:text-amber-500 transition-colors duration-300">
              OUTLAND
              <br />
              <span className="text-amber-500 group-hover:text-white transition-colors duration-300">EFFECT</span> &
              CAUSE
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["THE GAME", "ECONOMY", "ROADMAP", "WHITEPAPER"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "")}`}
                className="text-xl font-bold italic tracking-widest hover:text-amber-400 transition group relative"
              >
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity rotate-45"></span>
                {item}
              </a>
            ))}
          </nav>

          {/* Login Button */}
          <div className="flex items-center gap-4">
            <button
              className="hidden md:block px-6 py-2 border border-amber-500 text-amber-500 font-black text-xl hover:bg-amber-500 hover:text-black transition skew-x-[-12deg] shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.6)]"
              onClick={() => navigate("/signup")}
            >
              CONNECT WALLET
            </button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden bg-black border-t border-amber-500/20 p-6 space-y-6">
            {["THE GAME", "ECONOMY", "ROADMAP", "WHITEPAPER"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "")}`}
                className="block text-xl font-black italic hover:text-amber-400 uppercase"
              >
                {item}
              </a>
            ))}
            <button
              className="w-full px-4 py-4 border-2 border-amber-400 text-amber-400 font-black hover:bg-amber-400 hover:text-black transition uppercase skew-x-[-6deg]"
              onClick={() => navigate("/signup")}
            >
              Connect Wallet
            </button>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
 {/* Background Image Layer - Brightened (Removed dark overlays) */}
        <div className="absolute inset-0 z-0">
          <img
            src={background || "/placeholder.svg"}
            alt="Hero Background"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/35"></div>
          {/* Only a subtle gradient at the very bottom to blend into the next section */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] to-transparent"></div>
        </div>

        {/* Glow behind skull - z-0 to sit behind content but above bg */}
        <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="relative z-20">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[2px] w-8 bg-amber-500"></div>
                <span className="text-amber-500 font-bold tracking-[0.3em] text-sm uppercase">Mainnet Beta Live</span>
              </div>

              <h1 className="text-7xl lg:text-8xl font-black italic leading-[0.95] mb-6 tracking-tighter drop-shadow-xl">
                WHERE
                <br />
                <span className="text-amber-500">VIOLENCE</span>
                <br />
                PAYS OFF
              </h1>

              <h2 className="text-lg lg:text-xl font-black italic tracking-wider uppercase mb-8 flex items-center gap-3">
                <span className="text-red-500 bg-red-500/20 px-3 py-1 border border-red-500/40 font-bold">
                  HIGH STAKES
                </span>
                <span className="text-white font-black">SOLANA FPS</span>
              </h2>

              <p className="text-gray-300 mb-10 text-base lg:text-lg leading-relaxed max-w-xl font-medium border-l-2 border-amber-500/60 pl-6">
                The first true Financial FPS. <span className="text-white font-bold">Wager SOL on your aim.</span> Kill
                your enemies, drain their wallets, and extract before the zone collapses.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="px-8 py-3 bg-amber-500 text-black font-black text-lg hover:bg-amber-400 transition skew-x-[-12deg] uppercase tracking-wider hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                  onClick={() => navigate("/signup")}
                >
                  Enter The Arena
                </button>
                <button className="px-8 py-3 border-2 border-gray-600 text-white font-black text-lg hover:border-white hover:bg-white hover:text-black transition skew-x-[-12deg] uppercase tracking-wider">
                  View Contracts
                </button>
              </div>
            </div>

            {/* Hero Image / Asset */}
            <div className="flex justify-center relative">
              {/* Tech Circle Background */}
              <div className="absolute inset-0 border border-amber-500/10 rounded-full scale-90 animate-pulse"></div>
              <div className="absolute inset-0 border border-white/5 rounded-full scale-75"></div>

              <div className="w-full max-w-[500px] aspect-[4/5] relative z-10 flex items-center justify-center">
                <img
                  src={skull || "/placeholder.svg"}
                  alt="Game Asset"
                  className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action / Hype Section */}
      <section className="relative py-32 px-6 bg-black overflow-hidden border-y border-zinc-800 group">
        {/* Background gun image */}
        <img
          src={gun || "/placeholder.svg"}
          alt="weapon"
          className="absolute right-[-200px] top-1/2 -translate-y-1/2 max-w-none w-[1200px] pointer-events-none z-0 group-hover:scale-105 transition duration-1000 ease-out"
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black italic mb-6 leading-[0.9] drop-shadow-lg">
            EXECUTE ON <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">CHAIN</span>
          </h2>

          <p className="text-gray-400 text-2xl md:text-3xl leading-tight mb-10 max-w-2xl font-bold">
            "We didn't just build a shooter. We built a liquid market for your skill."
            <br />
            <span className="text-amber-500 text-base font-normal mt-4 block tracking-widest uppercase">
              — Lead Dev, Indie.fun Hackathon
            </span>
          </p>

          <button className="group flex items-center gap-3 px-10 py-4 border border-amber-500 text-amber-500 font-black text-lg hover:bg-amber-500 hover:text-black transition skew-x-[-12deg]">
            <span>GET TOKENS</span>
            <Zap className="group-hover:fill-black w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-[#080808] relative" id="features">
        {/* Subtle Grid Pattern for this section */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-32 relative z-10">
          {/* --- FEATURE 1 --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
            <div className="relative">
              <div className="absolute -left-4 -top-8 text-8xl font-black text-white/5 select-none italic">-01</div>
              <div className="text-amber-500 font-bold mb-2 flex items-center gap-2 uppercase tracking-widest text-sm">
                <Crosshair size={16} /> Vertical Extraction
              </div>
              <h2 className="text-5xl md:text-6xl font-black italic mb-6 leading-none tracking-tight">
                ASCEND OR <br /> DIE TRYING
              </h2>
              <p className="text-gray-400 text-3xl leading-relaxed border-l-2 border-amber-500 pl-6">
                The map is vertical. The higher you climb, the higher the stakes. Secure the bag and extract at the
                summit, or get knocked back to the bottom—and your wallet balance hits zero.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end relative group">
              <div className="absolute inset-[-20px] bg-amber-500/10 skew-x-[-12deg] border border-amber-500/20 group-hover:bg-amber-500/20 transition duration-500"></div>
              <img
                src={side1 || "/placeholder.svg"}
                alt="Gameplay Screenshot 1"
                className="w-[550px] relative z-10 grayscale group-hover:grayscale-0 transition duration-500 shadow-2xl border border-white/10"
              />
            </div>
          </div>

          {/* --- FEATURE 2 --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
            {/* Image Left on Desktop */}
            <div className="flex justify-center lg:justify-start relative order-2 lg:order-1 group">
              <div className="absolute inset-[-20px] bg-white/5 skew-x-[-12deg] border border-white/10 group-hover:bg-white/10 transition duration-500"></div>
              <img
                src={side2 || "/placeholder.svg"}
                alt="Gameplay Screenshot 2"
                className="w-[550px] relative z-10 grayscale group-hover:grayscale-0 transition duration-500 shadow-2xl border border-white/10"
              />
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="absolute -right-4 -top-8 text-8xl font-black text-white/5 select-none italic">-02</div>
              <div className="text-white font-bold mb-2 flex items-center gap-2 uppercase tracking-widest text-sm">
                <ShieldAlert size={16} /> Proof of Kill
              </div>
              <h2 className="text-5xl md:text-6xl font-black italic mb-6 leading-none tracking-tight">
                TRUST CODE <br /> NOT DEVS
              </h2>
              <p className="text-gray-400 text-3xl leading-relaxed border-l-2 border-zinc-600 pl-6">
                All wagers are held in escrow via Solana smart contracts. Instant payouts upon match completion. No
                withdrawal limits. No centralized servers holding your money hostage.
              </p>
              <button className="mt-8 px-8 py-3 bg-white text-black font-bold hover:bg-amber-500 transition skew-x-[-12deg] w-fit uppercase hover:scale-105 active:scale-95">
                Read Whitepaper
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dev/Hackathon Section */}
      <section className="py-24 px-6 bg-black border-t border-zinc-800" id="hackathon">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-amber-900/30 border border-amber-500/30 text-amber-500 font-bold mb-6 text-sm tracking-widest uppercase skew-x-[-12deg]">
                Development Log // Solana
              </div>
              <h2 className="text-5xl md:text-6xl font-black italic mb-8 tracking-tighter">
                FORGED IN THE <br /> INDIE FIRE
              </h2>
              <p className="text-zinc-400 text-3xl leading-relaxed mb-8">
                Outland isn't corporate churn. It's a passion project born from the{" "}
                <span className="text-white font-bold border-b border-amber-500">Indie.fun Solana Hackathon</span>.
                Built for players who want real ownership and real consequences.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-4 border-l-2 border-amber-500 bg-zinc-900/30">
                  <h3 className="text-3xl font-black text-white italic">400ms</h3>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mt-1">Block Time</p>
                </div>
                <div className="p-4 border-l-2 border-amber-500 bg-zinc-900/30">
                  <h3 className="text-3xl font-black text-white italic">$0.001</h3>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mt-1">Avg Gas Fee</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative w-full max-w-md aspect-square border-2 border-amber-500/20 bg-black flex items-center justify-center p-12 shadow-[0_0_50px_rgba(251,191,36,0.05)]">
                {/* Logo Placeholder */}
                <img
                  src={logo || "/placeholder.svg"}
                  alt="Studio Logo"
                  className="w-[120%] h-[120%] object-contain scale-110 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                />

                {/* Tech Corners - The "Badass" UI details */}
                <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-l-4 border-t-4 border-amber-500"></div>
                <div className="absolute top-[-2px] right-[-2px] w-6 h-6 border-r-4 border-t-4 border-amber-500"></div>
                <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-l-4 border-b-4 border-amber-500"></div>
                <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-r-4 border-b-4 border-amber-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Updates */}
      <section className="py-24 px-6 bg-amber-500 text-black relative overflow-hidden">
        {/* Texture overlay on the yellow background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-multiply"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black italic mb-6 tracking-tight">SECURE YOUR WHITELIST</h2>
          <p className="text-xl font-bold mb-10 opacity-80 max-w-xl mx-auto">
            Sign up for the Genesis Drop. Limited spots for the first 10,000 players.
          </p>

          <div className="flex flex-col md:flex-row gap-0 justify-center max-w-lg mx-auto shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <input
              type="email"
              placeholder="WALLET OR EMAIL"
              className="w-full px-6 py-4 bg-black text-white placeholder:text-zinc-600 font-bold italic focus:outline-none border-none"
            />
            <button className="px-8 py-4 bg-white text-black font-black text-xl hover:bg-zinc-200 transition whitespace-nowrap">
              MINT ACCESS
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] pt-20 pb-10 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="text-3xl text-white font-black italic mb-6 tracking-tighter">
                OUTLAND
                <br />
                SOLANA
              </div>
              <p className="text-zinc-500 max-w-sm text-lg font-medium">
                A competitive vertical extraction shooter built on Solana.{" "}
                <span className="text-amber-500">Your skill, your assets.</span>
              </p>
            </div>

            <div>
              <h4 className="font-black text-white text-lg mb-6 italic tracking-wider">NAVIGATION</h4>
              <ul className="space-y-3 text-zinc-400 font-bold">
                <li>
                  <a href="#" className="hover:text-amber-400 hover:translate-x-1 transition-transform inline-block">
                    Leaderboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 hover:translate-x-1 transition-transform inline-block">
                    Smart Contracts
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 hover:translate-x-1 transition-transform inline-block">
                    Tokenomics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 hover:translate-x-1 transition-transform inline-block">
                    Press Kit
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-white text-lg mb-6 italic tracking-wider">CONNECT</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white bg-zinc-900 p-2 rounded hover:bg-amber-500 hover:text-black transition"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white bg-zinc-900 p-2 rounded hover:bg-amber-500 hover:text-black transition"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white bg-zinc-900 p-2 rounded hover:bg-amber-500 hover:text-black transition"
                >
                  <Twitch size={20} />
                </a>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white bg-zinc-900 p-2 rounded hover:bg-amber-500 hover:text-black transition"
                >
                  <Youtube size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-zinc-600 font-bold tracking-widest uppercase">
            <p>© 2025 KRITAGYA JHA. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-amber-500 transition">
                PRIVACY
              </a>
              <a href="#" className="hover:text-amber-500 transition">
                TERMS
              </a>
              <a href="#" className="hover:text-amber-500 transition">
                COOKIES
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
