import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App';
import Signup from './Signup'; // Rename your file to LoginWrapper if needed
import Landing from './Landing';
import { SolanaContext } from './contexts/SolanaContext'; // Use the one we made in Phase 1
import PredictionTerminal from './PredictionTerminal';
import TacticalArmory from './TacticalArmory'; 
import StreamingArena from './StreamingArena';
import GameEnd from './GameEnd';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/game",
    element: <App />,
  },
  {
    path: "/prediction",
    element: <PredictionTerminal />,
  },
  {
    path: "/armory",
    element: <TacticalArmory />,
  },
  {
    path: "/streaming",
    element: <StreamingArena />,
  },
  {
    path: "/end",
    element: <GameEnd />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SolanaContext> {/* Wraps BOTH pages */}
      <RouterProvider router={router} />
    </SolanaContext>
  </React.StrictMode>,
);