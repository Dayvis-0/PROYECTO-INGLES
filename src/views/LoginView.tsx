import type { FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function LoginView() {
  const {
    usernameInput, setUsernameInput,
    passwordInput, setPasswordInput,
    loginError, setLoginError,
    setCurrentUser,
  } = useAppContext();
  const navigate = useNavigate();

  const handleLoginSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const finalUsername = usernameInput.trim() || "hitsuko.student";
    setCurrentUser(finalUsername);
    navigate("/estudiante");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white duo-card p-8 shadow-xl">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3">
            I.E. Manuel Vivanco Altamirano
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#3c3c3c]">
            Learn English
          </h1>
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
              placeholder="Tu usuario"
              className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-base font-bold text-[#3c3c3c] outline-none focus:border-emerald-500 transition-colors"
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
              className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-base font-bold text-[#3c3c3c] outline-none focus:border-emerald-500 transition-colors"
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
            className="w-full py-4 font-black rounded-xl text-lg tracking-wider cursor-pointer btn-3d-green"
          >
            INGRESAR
          </button>

        </form>

        <div className="mt-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
          UNAJMA
        </div>

      </div>
    </main>
  );
}
