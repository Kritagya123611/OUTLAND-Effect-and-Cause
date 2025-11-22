//App.tsx
import GameCanvas from "./components/GameCanvas";
import GameHUD from "./components/GameHUD";

export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <GameCanvas />
      <GameHUD />
    </div>
  );
}
