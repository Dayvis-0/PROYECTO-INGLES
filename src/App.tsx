import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import WelcomeView from "./views/WelcomeView";
import LoginView from "./views/LoginView";
import DocenteView from "./views/DocenteView";
import EstudianteHomeView from "./views/EstudianteHomeView";
import EstudianteLeccionView from "./views/EstudianteLeccionView";
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * App — the top-level React tree.
 * AppProvider is mounted in main.tsx, so this component only renders AppShell.
 * The speech synthesis engine is primed once on mount to reduce latency later.
 */
export default function App() {
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return <AppShell />;
}

function AppShell() {
  const {
    setCurrentUser,
    setUsernameInput,
    setPasswordInput,
    setWalkthroughActive,
  } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
    setWalkthroughActive(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f7f7f7] text-[#3c3c3c]">
      <Routes>
        <Route path="/" element={<WelcomeView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/docente" element={<ProtectedRoute><DocenteView onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/estudiante" element={<ProtectedRoute><EstudianteHomeView onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/estudiante/leccion/:id" element={<ProtectedRoute><EstudianteLeccionView /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
