//App.tsx
import GameCanvas from "./components/GameCanvas";
import GameHUD from "./components/GameHUD";
import DarkGame from "./components/DarkGameCanvas";

export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <DarkGame />
      <GameHUD />
    </div>
  );
}
