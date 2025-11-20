"use client";
import { useNavigate } from "react-router-dom";
import evolutionImage from "./assets/EvolutionOfMoney.png";
import CodeImage from "./assets/CodeImage.png";
import FlyingStablecoin from "./assets/FlyingStablecoin.png";
import ShieldImg from "./assets/ShieldImg.png";
import { ChevronRight, Route, Shield } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full border-b border-gray-900 bg-black/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white" />
            <span className="font-bold text-2xl tracking-wider">OutLand</span>
          </div>

          {/* Menu */}
          <div className="hidden md:flex gap-8 items-center text-lg tracking-widest text-gray-400">
            <button className="hover:text-white transition">PARALLEL WORLDS</button>
            <button className="hover:text-white transition">GAME MECHANICS</button>
            <button className="hover:text-white transition">ON-CHAIN PROGRESSION</button>
          </div>

          {/* CTA */}
          <button className="bg-lime-400 text-black px-6 py-2 font-bold text-xs hover:bg-lime-300 transition" onClick={() => navigate("/signup")}>
            LAUNCH GAME
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="min-h-screen pt-24 pb-12 relative overflow-hidden border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center h-full py-24">

          {/* Left */}
          <div className="space-y-8">
            <h1 className="text-7xl md:text-6xl font-bold leading-tight tracking-tight">
              A PvP Arena Where Two Worlds Collide
            </h1>

            <p className="text-sm text-gray-300 max-w-md font-mono leading-relaxed tracking-wide">
              OUTLAND IS A FAST-PACED PARALLEL-WORLD ARENA FIGHTER. SHIFT BETWEEN TWO DIMENSIONS,
              OUTPLAY YOUR ENEMIES, COLLECT SHARD NFTs, AND PROGRESS ON-CHAIN.
            </p>

            <button className="bg-lime-400 text-black px-8 py-3 font-bold text-sm hover:bg-lime-300 transition w-full max-w-xs flex items-center justify-between group" onClick={() => navigate("/signup")}>
              <span>PLAY DEMO</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>

          {/* Right - Artwork */}
          <div className="relative h-96 md:h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              <img
                src={evolutionImage}
                alt="Parallel Worlds Visual"
                className="object-cover object-center w-full h-full"
              />

              {/* Floating Labels */}
              <div className="absolute inset-0 pointer-events-none">
                <FloatingLabel pos="top-12 right-8" tag="// OUTLAND" text="DUAL WORLDS" />
                <FloatingLabel pos="top-1/3 left-8" tag="// SHIFT" text="MECHANICS" />
                <FloatingLabel pos="top-2/3 right-12" tag="// LIGHT" text="SHADOW" />
                <FloatingLabel pos="bottom-20 left-12" tag="// SKILL" text="STRATEGY" />
              </div>

              <p className="absolute bottom-0 right-0 text-xs tracking-widest text-gray-500">
                PARALLEL WORLDS ENGINE
              </p>
            </div>
          </div>
        </div>

        {/* Partner Logos */}
        <PartnerSection
          partners={[
            "Solana Gaming",
            "Phaser Engine",
            "WebSocket Arena",
            "ShadowForge Studios",
            "LightRealm Labs",
          ]}
        />
      </section>

      {/* DUAL-WORLD COMBAT */}
      <section className="py-24 border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-8">
          <SectionHeader tag="// GAME MECHANICS" title="Master the Art of Dual-World Combat." />

          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <p className="text-sm text-gray-300 mb-12 font-mono leading-relaxed tracking-wide">
                OUTLAND’S SIGNATURE MECHANIC LETS YOU SHIFT BETWEEN TWO PARALLEL REALMS —
                THE ANCIENT WORLD AND THE FUTURE WORLD. EACH WORLD OFFERS UNIQUE POWER-UPS,
                MOVEMENT RULES, AND COMBAT ADVANTAGES. MASTER THE SHIFT AND CONTROL THE ARENA.
              </p>

              <FeatureList
                items={[
                  {
                    num: "01",
                    tag: "CORE MECHANIC",
                    title: "Two Worlds. One Fight.",
                    desc: "Exist in both dimensions, but appear in only one at a time. Enemies in the opposite world cannot hit or see you.",
                  },
                  {
                    num: "02",
                    tag: "COMBAT",
                    title: "Shift to Outplay",
                    desc: "Use instant realm-shifts to dodge, flank, escape, and ambush. Timing becomes the ultimate mind game.",
                  },
                  {
                    num: "03",
                    tag: "STRATEGY",
                    title: "World-Based Perks",
                    desc: "Ancient World = agility. Future World = damage. Switch at the right moment to maximize your advantage.",
                  },
                ]}
              />
            </div>

            {/* Right */}
            <img
              src={FlyingStablecoin}
              alt="Dual World Preview"
              className="object-cover object-center w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* SAFETY SYSTEM */}
      <section className="py-24 border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-8">

          <SectionHeader
            centered
            tag="// WORLD SAFETY SYSTEM"
            title="Shift-Protected Combat. Always Active."
            subtitle="EVERY PLAYER ACTION IN OUTLAND IS TRACKED AND SYNCHRONIZED. NO DESYNC. NO INVISIBLE CHEESE. NO BROKEN HITBOXES."
          />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                tag: "FOR NEW PLAYERS",
                title: "Guaranteed Fair Fights",
                desc: "Server-side world shift & hit detection prevents lag abuse and ghost states.",
              },
              {
                tag: "FOR COMPETITORS",
                title: "Anti-Desync Architecture",
                desc: "Parallel worlds stay synced through authoritative WebSocket logic.",
              },
              {
                tag: "FOR ESPORTS / RANKED",
                title: "On-Chain Combat Logs",
                desc: "Every match generates a verifiable battle record — ideal for rankings and tournaments.",
              },
            ].map((card, i) => (
              <div key={i} className="border border-gray-800 p-8 hover:border-gray-700 transition">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-4 h-4 text-lime-400" />
                  <span className="text-xs font-mono tracking-widest text-gray-500">{card.tag}</span>
                </div>

                <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                <p className="text-sm text-gray-400 font-mono leading-relaxed mb-6">{card.desc}</p>

                <button className="text-xs font-mono w-full border border-gray-700 px-4 py-2 hover:border-gray-500 transition">
                  LEARN MORE →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARACTERS & WORLDS */}
      <section className="py-24 border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-8">
          <SectionHeader
            tag="// CHARACTERS & WORLDS"
            title="Two Worlds. Two Archetypes. One Arena."
          />

          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <p className="text-sm text-gray-300 mb-8 font-mono leading-relaxed tracking-wide">
                Choose between Ancient World warriors and Futuristic World robots — each with unique stats, animations, and perks.
              </p>

              {/* CODE SNIPPET */}
              <CodeBlock />

              <FeatureList
                items={[
                  {
                    num: "01",
                    tag: "FOR PLAYERS",
                    title: "Master Your Abilities",
                    desc: "Unlock class-based skills across eras — swords, beams, teleports, traps, and more.",
                  },
                  {
                    num: "02",
                    tag: "FOR GAME WORLD",
                    title: "Shift Between Eras",
                    desc: "Travel through time to change terrain, enemies, and available powers.",
                  },
                ]}
              />
            </div>

            {/* Right */}
            <img
              src={CodeImage}
              alt="Game Code Visual"
              className="w-[500px] h-auto mx-auto"
            />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div className="space-y-8">
            <h2 className="text-6xl font-bold leading-tight">Static gameplay is obsolete</h2>
            <p className="text-sm text-gray-300 font-mono tracking-wide leading-relaxed max-w-md">
              OUTLAND EVOLVES AS YOU PLAY — NEW ABILITIES, SHIFTING WORLDS, AND DYNAMIC COMBAT THAT NEVER STAYS THE SAME.
            </p>

            <div className="flex gap-4">
              <PrimaryButton text="PLAY NOW" />
              <OutlineButton text="GAME LORE" />
            </div>
          </div>

          {/* Right */}
          <img
            src={ShieldImg}
            alt="Outland Realm"
            className="object-cover object-center w-full h-full"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
          <button className="text-lime-400 hover:text-lime-300 transition font-bold text-sm">
            JOIN COMMUNITY
          </button>
          <p className="text-xs text-gray-600 mt-4 md:mt-0">© 2025 OutLand</p>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* COMPONENTS */
/* ---------------------------------------------------------------- */

function FloatingLabel({ pos, tag, text }) {
  return (
    <div className={`absolute ${pos} text-xs tracking-widest text-gray-400`}>
      <span className="text-lime-400">{tag}</span>
      <span className="mx-2">→</span>
      <span>{text}</span>
    </div>
  );
}

function SectionHeader({ tag, title, subtitle, centered }) {
  return (
    <div className={`mb-20 space-y-4 ${centered ? "text-center" : ""}`}>
      <p className="text-xs font-mono tracking-widest text-lime-400">{tag}</p>
      <h2 className="text-5xl font-bold leading-tight">{title}</h2>
      {subtitle && (
        <p className="text-sm text-gray-400 max-w-2xl mx-auto font-mono tracking-wide">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function PartnerSection({ partners }) {
  return (
    <div className="border-t border-gray-900 mt-12">
      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
        {partners.map((partner) => (
          <div
            key={partner}
            className="text-xs text-gray-500 hover:text-gray-300 transition cursor-pointer"
          >
            {partner}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureList({ items }) {
  return (
    <div className="space-y-12">
      {items.map((item) => (
        <div key={item.num} className="border-l border-gray-800 pl-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-2xl font-bold text-gray-600">{item.num}</span>
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="text-xs font-mono tracking-widest text-gray-500">{item.tag}</span>
          </div>

          <h3 className="text-lg font-bold mb-2">{item.title}</h3>
          <p className="text-sm text-gray-400 font-mono leading-relaxed mb-3">{item.desc}</p>

          <OutlineButton text="VIEW WORLDS →" small />
        </div>
      ))}
    </div>
  );
}

function PrimaryButton({ text }) {
  return (
    <button className="bg-lime-400 text-black px-8 py-3 font-bold text-sm hover:bg-lime-300 transition flex items-center gap-2">
      {text} <ChevronRight className="w-4 h-4" />
    </button>
  );
}

function OutlineButton({ text, small }) {
  return (
    <button
      className={`text-xs font-mono tracking-widest text-white border border-gray-700 px-4 py-2 hover:border-gray-500 transition ${
        small ? "" : "flex items-center gap-2"
      }`}
    >
      {text}
    </button>
  );
}

function CodeBlock() {
  return (
    <div className="bg-gray-900 border border-gray-800 p-6 mb-12 font-mono text-sm text-lime-400">
      <div className="space-y-2">
        <div>
          <span className="text-gray-500">const</span> action ={" "}
          <span className="text-white">await</span> player.
          <span className="text-lime-400">triggerAbility</span>(
        </div>
        <div className="ml-4">
          <span className="text-gray-500">player</span>.id,
        </div>
        <div className="ml-4">
          <span className="text-orange-400">ABILITY_TYPE</span>,
        </div>
        <div className="ml-4">
          <span className="text-orange-400">WORLD_STATE</span>
        </div>
        <div>);</div>
      </div>
    </div>
  );
}
