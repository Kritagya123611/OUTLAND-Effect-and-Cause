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

      if (!window.GameClient?.startGame) {
        console.error("startGame() missing on window.GameClient");
        return;
      }

      const canvas = canvasRef.current!;
      resizeCanvas(canvas);

      // Resize game when window resizes
      window.addEventListener("resize", () => resizeCanvas(canvas));

      window.GameClient.startGame(canvas);
    };

    document.body.appendChild(script);
  }, []);

  function resizeCanvas(canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
      }}
    />
  );
}
