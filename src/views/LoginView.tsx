import type { FormEvent } from "react";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { ROLES } from "../constants";

export default function LoginView() {
  const {
    usernameInput, setUsernameInput,
    passwordInput, setPasswordInput,
    loginError, setLoginError,
    selectedRole, setCurrentUser,
  } = useAppContext();
  const navigate = useNavigate();

  const handleLoginSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const userClean = usernameInput.trim();

    if (selectedRole === ROLES.STUDENT) {
      const finalUsername = userClean || "hitsuko.student";
      setCurrentUser(finalUsername);
      navigate("/estudiante");
    } else if (selectedRole === ROLES.TEACHER) {
      const finalUsername = userClean || "profesor.farfan";
      setCurrentUser(finalUsername);
      navigate("/docente");
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white duo-card p-8 shadow-xl relative">

        <button
          onClick={() => {
            setUsernameInput("");
            setPasswordInput("");
            setLoginError(null);
            navigate("/");
          }}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>

        <div className="text-center mt-6 mb-8">
          <span className="text-xs font-black uppercase tracking-widest text-[#777777]">
            Ingreso al Portal
          </span>
          <h2 className="text-3xl font-black text-[#3c3c3c] mt-2">
            Acceso {selectedRole === ROLES.STUDENT ? "Estudiante" : "Docente"}
          </h2>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-bold text-[#3c3c3c] mb-2 uppercase tracking-wide">
              Usuario
            </label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder={selectedRole === ROLES.STUDENT ? "Usuario de Estudiante" : "Usuario de Docente"}
              className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-base font-bold text-[#3c3c3c] outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#3c3c3c] mb-2 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-base font-bold text-[#3c3c3c] outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {loginError && (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-3 text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-4 font-black rounded-xl text-lg tracking-wider cursor-pointer ${
              selectedRole === ROLES.STUDENT ? "btn-3d-green" : "btn-3d-blue"
            }`}
          >
            INGRESAR AHORA
          </button>

        </form>

      </div>
    </main>
  );
}
