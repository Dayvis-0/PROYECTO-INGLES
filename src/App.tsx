import { useEffect } from "react";
import { AppProvider, useAppContext } from "./context/AppContext";
import WelcomeView from "./views/WelcomeView";
import LoginView from "./views/LoginView";
import DocenteView from "./views/DocenteView";
import EstudianteHomeView from "./views/EstudianteHomeView";
import EstudianteLeccionView from "./views/EstudianteLeccionView";

export default function App() {
  // Prime the speech synthesis engine on mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
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
    setCurrentView("welcome");
    setWalkthroughActive(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f7f7f7] text-[#3c3c3c]">
      {currentView === "welcome" && <WelcomeView />}
      {currentView === "login" && <LoginView />}
      {currentView === "docente" && <DocenteView onLogout={handleLogout} />}
      {currentView === "estudiante_home" && <EstudianteHomeView onLogout={handleLogout} />}
      {currentView === "estudiante_leccion" && <EstudianteLeccionView />}
    </div>
  );
}
