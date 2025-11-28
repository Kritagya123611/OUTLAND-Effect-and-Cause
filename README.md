<div align="center">
  <br />
  <img src="./path/to/logo.png" alt="OUTLAND LOGO" width="100%" />
  
  <br />

  <h1 style="font-size: 3rem; font-weight: 900;">OUTLAND: EFFECT & CAUSE</h1>

  <p style="font-size: 1.5rem; font-style: italic;">
    "Where Violence Pays Off."
  </p>
  <p>
    <strong>The First Financial FPS on Solana. Wager on your aim. Verified On-Chain.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Solana-Mainnet_Beta-000000?style=for-the-badge&logo=solana&logoColor=white" />
    <img src="https://img.shields.io/badge/Engine-Phaser_3-blue?style=for-the-badge&logo=html5" />
    <img src="https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge&logo=react" />
    <img src="https://img.shields.io/badge/Oracle-Pyth_Network-purple?style=for-the-badge" />
  </p>

  <h3>
    <a href="https://your-demo-link.com">Play Live Demo 💀</a> | 
    <a href="https://youtube.com/your-trailer">View Trailer 🎬</a> | 
    <a href="https://devpost.com/your-hackathon-link">Hackathon Submission 🏆</a>
  </h3>
</div>

---

## ⚡ The Protocol (Introduction)

**OUTLAND** is not just a game; it is a **Skill-Based Derivatives Market**. 

Most Web3 games use "Click-to-Earn" mechanics that inflate tokens. OUTLAND uses a **Zero-Sum PVP** model. Players enter a lobby by locking a SOL wager into a Smart Contract. The game state (kills/deaths) is verified via a custom Phaser-to-Anchor bridge. The winner takes the liquidity pool immediately.

> **"We replaced luck with ballistics."**

<div align="center">
  <img src="./assets/gameplay-loop.gif" alt="Gameplay Demo" width="100%" />
</div>

---

## 💎 Core Features

### 1. 🔫 Prediction Protocol (Wager System)
Forget passive staking. In OUTLAND, you stake on your own performance.
* **Dynamic Risk Tiers:** Select from Scout (0.1 SOL) to Heavy (1.0 SOL) entry fees.
* **Oracle Integration:** Uses **Pyth Network** to calculate real-time USD value of wagers displayed in the UI.

### 2. 📹 "Barnfight" Uplink (Social Layer)
* **Live WebRTC Feeds:** See your opponent's face when you eliminate them. 
* **P2P Spectating:** Integrated betting layer for spectators to wager on active matches.

### 3. 📉 The Black Market
* **Diegetic Economy:** A fully immersive shop interface where weapons are purchased with SOL.
* **Risk vs. Reward:** Buying a "Minigun" costs 0.08 SOL. You must calculate if the firepower advantage will yield a return on investment (ROI) in the arena.

---

## 🕹️ Gameplay Loop

1.  **Initialize Uplink:** Connect Phantom/Solflare wallet.
2.  **Risk Assessment:** Choose your `Loadout` and `Wager Tier`.
3.  **Lock Liquidity:** Approve the transaction to move SOL into the Escrow PDA.
4.  **Enter The Rift:** 3-minute deathmatch.
5.  **Settlement:** Game ends. The Smart Contract verifies the kill count. The winner receives the pot (minus a small protocol fee).

---

## 🏗️ System Architecture

We built a hybrid stack to handle high-frequency inputs (60 FPS) with blockchain finality.

```mermaid
graph TD
    User[User / Operator] -->|Connects Wallet| ReactUI[React Frontend]
    ReactUI -->|Wager Tx| Solana[Solana Blockchain]
    Solana -->|Verify Funds| Anchor[Anchor Smart Contract]
    Anchor -->|Emit Event| GameClient[Phaser Game Client]
    
    subgraph "The Arena"
        GameClient -->|Movement/Shooting| PhaserEngine[Phaser Physics]
        PhaserEngine -->|Kill Confirmation| GameState[Local State]
    end
    
    GameState -->|Signed Oracle Data| Anchor
    Anchor -->|Payout| User
    
    Pyth[Pyth Oracle] -->|SOL/USD Price| ReactUI
Tech Stack
Frontend: React, Vite, Tailwind CSS (Cyberpunk UI System).

Game Engine: Phaser 3 (custom configured for React mounting).

Blockchain: Solana (Rust/Anchor).

Data Feeds: Pyth Network (Currency conversion & Risk calculations).

Streaming: WebRTC (Peer-to-Peer video connection).

📸 Visual Data
<table align="center"> <tr> <td align="center"> <img src="./assets/screenshot-ui-wager.png" width="400" /> <br /> <strong>Prediction Protocol (Wagering)</strong> </td> <td align="center"> <img src="./assets/screenshot-ui-market.png" width="400" /> <br /> <strong>Black Market (Equipment)</strong> </td> </tr> <tr> <td align="center"> <img src="./assets/screenshot-game-space.png" width="400" /> <br /> <strong>Combat Simulation</strong> </td> <td align="center"> <img src="./assets/screenshot-barnfight.png" width="400" /> <br /> <strong>Barnfight (Live Cam)</strong> </td> </tr> </table>

🛠️ Installation & Setup
To run the Outland Protocol locally:

Prerequisites
Node.js v18+

Rust & Cargo

Solana CLI

1. Clone the Repository
Bash

git clone [https://github.com/Kritagya123611/outland-protocol.git](https://github.com/Kritagya123611/outland-protocol.git)
cd outland-protocol
2. Install Frontend Dependencies
Bash

npm install
# Start the local development uplink
npm run dev
3. Deploy Smart Contracts (Devnet)
Bash

cd anchor-program
anchor build
anchor deploy
# Copy the new Program ID into lib.rs and anchor.toml
⚙️ Engineering Challenges (Hackathon Note)
Syncing State with Block Time: One of our biggest hurdles was bridging the gap between Phaser's 60 FPS update loop and Solana's block time. We solved this by implementing Optimistic UI updates for the gameplay (so shooting feels instant) while queuing the transactional data to settle in the background via a state-verification PDA.

🔮 Roadmap: Phase 2
[ ] Squads Protocol: Pooled wagering for 4v4 Team Deathmatch.

[ ] Mobile Uplink: Optimization for mobile browser wallets (PWA).

[ ] Rent-a-Gun: DeFi lending protocol where users can rent high-tier NFT weapons to other players for a cut of their earnings.

<div align="center"> <p>Built for the <strong>Indie.fun Hackathon 2025</strong>.</p> <p>Engineered by <strong>Kritagya Jha</strong>.</p> <p> <a href="https://www.google.com/search?q=https://twitter.com/yourhandle">Twitter</a> • <a href="https://www.google.com/search?q=https://github.com/Kritagya123611">GitHub</a> </p> </div>