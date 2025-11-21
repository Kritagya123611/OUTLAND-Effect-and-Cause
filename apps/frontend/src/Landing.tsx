"use client"
import { Navigate,useNavigate } from "react-router-dom"
import { Menu, X, Twitter, Instagram, Twitch, Youtube, Globe, Zap } from "lucide-react"
import { useState } from "react"

// Keep these imports, but remember to swap the actual image files in your assets folder later
import gun from "./assets/gun.png"
import logo from "./assets/logo.png"
import side1 from "./assets/side1.png"
import side2 from "./assets/side2.png"
import skull from "./assets/skull.png"

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate();
  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-amber-500 selection:text-black">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl text-amber-400 font-black italic tracking-tighter leading-none">
            PARALLEL
            <br />
            WORLDS
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#arena" className="text-lg font-bold italic hover:text-amber-400 transition tracking-wide">
              THE ARENA
            </a>
            <a href="#features" className="text-lg font-bold italic hover:text-amber-400 transition tracking-wide">
              MECHANICS
            </a>
            <a href="#roadmap" className="text-lg font-bold italic hover:text-amber-400 transition tracking-wide">
              ROADMAP
            </a>
            <a href="#hackathon" className="text-lg font-bold italic hover:text-amber-400 transition tracking-wide">
              ORIGINS
            </a>
          </nav>

          {/* Login Button */}
          <div className="flex items-center gap-4">
            <button className="hidden md:block px-8 py-3 border-2 border-amber-400 text-amber-400 font-black text-lg hover:bg-amber-400 hover:text-black transition skew-x-[-12deg] hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              onClick={() => navigate('/signup')}>
              ENTER THE RIFT
            </button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden bg-black border-t border-amber-500/20 p-6 space-y-6">
            <a href="#arena" className="block text-xl font-bold italic hover:text-amber-400">
              THE ARENA
            </a>
            <a href="#features" className="block text-xl font-bold italic hover:text-amber-400">
              MECHANICS
            </a>
            <a href="#roadmap" className="block text-xl font-bold italic hover:text-amber-400">
              ROADMAP
            </a>
            <a href="#hackathon" className="block text-xl font-bold italic hover:text-amber-400">
              ORIGINS
            </a>
            <button className="w-full px-4 py-4 border-2 border-amber-400 text-amber-400 font-black hover:bg-amber-400 hover:text-black transition uppercase"
              onClick={() => navigate('/signup')}>
              Enter The Rift
            </button>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black opacity-60"></div>
        
        {/* Grid overlay effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-6xl md:text-8xl font-black italic leading-[0.85] mb-2 tracking-tighter">
                WHERE
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">REALITY</span>
                <br />
                FRACTURES
              </h1>

              {/* UPDATED H2 SECTION */}
              <h2 className="text-2xl md:text-3xl font-black italic tracking-wide uppercase mb-6">
                <span className="text-red-600">VERTICAL</span> <span className="text-white">EXTRACTION SHOOTER</span>
              </h2>
              
              <p className="text-gray-400 mb-10 text-lg md:text-xl leading-relaxed max-w-lg font-medium">
                The multiverse is collapsing. You are the anomaly. 
                Parallel Worlds Arena is a high-octane combat experience where physics obey no master and every match is a glitch in the system.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-10 py-4 bg-amber-400 text-black font-black text-xl hover:bg-white transition skew-x-[-12deg] uppercase tracking-wider" onClick={() => navigate('/signup')}  >
                  Play The Alpha
                </button>
                <button className="px-10 py-4 border-2 border-white text-white font-black text-xl hover:bg-white hover:text-black transition skew-x-[-12deg] uppercase tracking-wider">
                  Watch Trailer
                </button>
              </div>
            </div>
            
            {/* Hero Image Container */}
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full mix-blend-screen"></div>
              <div className="w-full max-w-[500px] aspect-[4/5] relative z-10 flex items-center justify-center">
                {/* Replace 'skull' with your main character or game logo */}
                <img
                  src={skull}
                  alt="Game Asset"
                  className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action / Hype Section */}
      <section className="relative py-32 px-6 bg-black overflow-hidden border-y border-white/10">
        {/* Background gun image - Replace with a weapon from your game */}
        <img
          src={gun}
          alt="weapon"
          className="absolute right-[-290px] top-1/2 -translate-y-1/2 max-w-none w-[1350px] pointer-events-none z-0"
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black italic mb-8 leading-[0.9]">
            BUILT FOR THE <br /> 
            <span className="text-stroke-amber text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">CHAOS</span>
          </h2>

          <p className="text-gray-400 text-2xl md:text-3xl leading-tight mb-12 max-w-2xl font-bold">
            "We didn't just build a game. We built a collider."
            <br/>
            <span className="text-amber-500 text-xl font-normal mt-4 block">— Lead Developer, Indie.fun Hackathon</span>
          </p>

          <button className="group flex items-center gap-3 px-12 py-5 border-2 border-amber-400 text-amber-400 font-black text-xl hover:bg-amber-400 hover:text-black transition skew-x-[-12deg]">
            <span>JOIN THE DISCORD</span>
            <Zap className="group-hover:fill-black" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-black to-zinc-900" id="features">
        <div className="max-w-7xl mx-auto space-y-40">
          
          {/* --- FEATURE 1 --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-20">
            <div className="relative">
              <div className="absolute -left-10 top-0 text-9xl font-black text-white/5 select-none italic">-01</div>
              <h2 className="text-4xl md:text-6xl font-black italic mb-6 leading-none">
                DIMENSIONAL <br/> WARFARE
              </h2>
              <p className="text-gray-400 text-2xl leading-relaxed border-l-4 border-amber-500 pl-6">
                Maps aren't static. In Parallel Worlds, the terrain shifts in real-time. Gravity inverts, cover dissolves, and entire chunks of the arena phase out of existence. Adapt or be deleted.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end relative group">
              <div className="absolute inset-[-30px] bg-amber-500/15 skew-x-[-12deg] transform group-hover:skew-x-[-6deg] transition duration-500"></div>

              <img
                src={side1}
                alt="Gameplay Screenshot 1"
                className="w-[550px] relative z-10 "
              />
            </div>
          </div>

          {/* --- FEATURE 2 --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-20">
            {/* Image Left on Desktop */}
            <div className="flex justify-center lg:justify-start relative order-2 lg:order-1 group">
               <div className="absolute inset-[-30px] bg-amber-500/15 skew-x-[-12deg] transform group-hover:skew-x-[-6deg] transition duration-500"></div>
              <img
                src={side2}
                alt="Gameplay Screenshot 2"
                className="w-[550px] relative z-10 "
              />
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="absolute -right-10 top-0 text-9xl font-black text-white/5 select-none italic">-02</div>
              <h2 className="text-4xl md:text-6xl font-black italic mb-6 leading-none">
                BREAK THE <br/> META
              </h2>
              <p className="text-gray-400 text-2xl leading-relaxed border-l-4 border-white pl-6">
                No classes. No presets. Build your loadout from scavenged tech across differing realities. Combine cyberpunk ballistics with arcane artifacts. If it kills, it works.
              </p>
              <button className="mt-8 px-8 py-3 bg-white text-black font-bold hover:bg-amber-400 transition skew-x-[-12deg] w-fit uppercase">
                View Armory
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dev/Hackathon Section */}
      <section className="py-24 px-6 bg-black border-t border-amber-500/20" id="hackathon">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-1 bg-amber-500/20 text-amber-500 font-bold mb-4 text-lg tracking-widest uppercase">
                Development Log
              </div>
              <h2 className="text-5xl md:text-6xl font-black italic mb-8">FORGED IN THE <br/> INDIE FIRE</h2>
              <p className="text-gray-400 text-2xl leading-relaxed mb-8">
                Parallel Worlds Arena isn't corporate churn. It's a passion project born from the <span className="text-white font-bold">Indie.fun Hackathon</span>. We are building this in public, fueled by caffeine and code, with zero compromises.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-4xl font-black text-amber-500 italic">100%</h3>
                  <p className="text-lg text-gray-500 uppercase tracking-wider font-bold">Community Driven</p>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-amber-500 italic">24/7</h3>
                  <p className="text-lg text-gray-500 uppercase tracking-wider font-bold">Development Cycle</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md aspect-square border border-amber-500/30 bg-amber-500/5 flex items-center justify-center p-12">
                {/* Logo Placeholder */}
                <img
                  src={logo}
                  alt="Studio Logo"
                  className="w-[140%] h-[140%] object-contain scale-110"
                  style={{ transform: "scale(1.25)" }}
                />

                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-amber-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-amber-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-amber-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-amber-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Updates */}
      <section className="py-20 px-6 bg-amber-500 text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black italic mb-6">DON'T GET LEFT IN THE VOID</h2>
          <p className="text-xl md:text-2xl font-bold mb-8 opacity-80">Sign up for access to early builds and exclusive dev logs.</p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="ENTER YOUR EMAIL" 
              className="w-full px-6 py-4 bg-black text-white placeholder:text-gray-500 font-bold italic focus:outline-none focus:ring-2 focus:ring-white skew-x-[-12deg]"
            />
            <button className="px-8 py-4 bg-white text-black font-black text-xl hover:bg-black hover:text-white transition skew-x-[-12deg]">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black pt-20 pb-10 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="text-3xl text-white font-black italic mb-6 tracking-tighter">
                PARALLEL
                <br />
                WORLDS
              </div>
              <p className="text-gray-500 max-w-sm text-lg">
                A competitive vertical extraction shooter built for the Indie.fun Hackathon. Survive the glitch.
              </p>
            </div>
            
            <div>
              <h4 className="font-black text-white text-lg mb-6 italic">NAVIGATION</h4>
              <ul className="space-y-4 text-gray-400 font-medium">
                <li><a href="#" className="hover:text-amber-400 transition">The Game</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Devlog</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Press Kit</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-white text-lg mb-6 italic">CONNECT</h4>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-amber-400 transition"><Twitter size={24} /></a>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition"><Instagram size={24} /></a>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition"><Twitch size={24} /></a>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition"><Youtube size={24} /></a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-600 font-bold">
            <p>© 2025 KRITAGYA JHA. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white">PRIVACY</a>
              <a href="#" className="hover:text-white">TERMS</a>
              <a href="#" className="hover:text-white">COOKIES</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}