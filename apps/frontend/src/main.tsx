import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App';
import Signup from './Signup'; // Rename your file to LoginWrapper if needed
import Landing from './Landing';
import { SolanaContext } from './contexts/SolanaContext'; // Use the one we made in Phase 1
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
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SolanaContext> {/* Wraps BOTH pages */}
      <RouterProvider router={router} />
    </SolanaContext>
  </React.StrictMode>,
);