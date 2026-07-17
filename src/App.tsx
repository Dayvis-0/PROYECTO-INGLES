import { useEffect } from "react";
import { useAppContext } from "./context/AppContext";
import { VIEWS } from "./constants";
import WelcomeView from "./views/WelcomeView";
import LoginView from "./views/LoginView";
import DocenteView from "./views/DocenteView";
import EstudianteHomeView from "./views/EstudianteHomeView";
import EstudianteLeccionView from "./views/EstudianteLeccionView";

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
    currentView,
    setCurrentUser,
    setUsernameInput,
    setPasswordInput,
    setSelectedRole,
    setCurrentView,
    setWalkthroughActive,
  } = useAppContext();

  const handleLogout = () => {
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
    setSelectedRole(null);
    setCurrentView(VIEWS.WELCOME);
    setWalkthroughActive(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f7f7f7] text-[#3c3c3c]">
      {currentView === VIEWS.WELCOME && <WelcomeView />}
      {currentView === VIEWS.LOGIN && <LoginView />}
      {currentView === VIEWS.DOCENTE && <DocenteView onLogout={handleLogout} />}
      {currentView === VIEWS.ESTUDIANTE_HOME && <EstudianteHomeView onLogout={handleLogout} />}
      {currentView === VIEWS.ESTUDIANTE_LECCION && <EstudianteLeccionView />}
    </div>
  );
}
