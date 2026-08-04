import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import { supabase } from "./lib/supabase";
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

  // Escuchar cambios de sesión en tiempo real:
  // si Supabase cierra la sesión (expiración, signOut remoto), limpiar todo.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        setUsernameInput("");
        setPasswordInput("");
        setWalkthroughActive(false);
        localStorage.removeItem("unajma_current_user");
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, setCurrentUser, setUsernameInput, setPasswordInput, setWalkthroughActive]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
    setWalkthroughActive(false);
    localStorage.removeItem("unajma_current_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f7f7f7] text-[#3c3c3c]">
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/docente" element={<ProtectedRoute allowedRoles={["docente"]}><DocenteView onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/estudiante" element={<ProtectedRoute allowedRoles={["estudiante"]}><EstudianteHomeView onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/estudiante/leccion/:stepType" element={<ProtectedRoute allowedRoles={["estudiante"]}><EstudianteLeccionView /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
