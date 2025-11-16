import { useEffect, useRef } from "react";

declare global {
  interface Window {
    GameClient?: {
      startGame: (canvas: HTMLCanvasElement) => void;
    };
  }
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/game/bundle.js";
    script.async = true;

    script.onload = () => {
      console.log("Game script loaded.");

      if (!window.GameClient) {
        console.error("GameClient not found on window");
        return;
      }

      if (!window.GameClient.startGame) {
        console.error("startGame() not found.");
        return;
      }

      if (canvasRef.current) {
        window.GameClient.startGame(canvasRef.current);
      }
    };

    document.body.appendChild(script);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ width: "800px", height: "600px" }}
    />
  );
}
