import { useEffect } from "react";
import type { FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import { getDocenteId } from "../lib/supabase-service";

export default function LoginView() {
  const {
    currentUser,
    usernameInput, setUsernameInput,
    passwordInput, setPasswordInput,
    loginError, setLoginError,
    setCurrentUser,
  } = useAppContext();
  const navigate = useNavigate();

  // Si ya hay sesión guardada, redirigir automáticamente
  useEffect(() => {
    if (!currentUser) return;
    getDocenteId(currentUser).then((id) => {
      navigate(id ? "/docente" : "/estudiante", { replace: true });
    });
  }, [currentUser, navigate]);

  const handleLoginSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const username = usernameInput.trim();
    const password = passwordInput.trim();

    if (!username || !password) {
      setLoginError("Ingresá usuario y contraseña");
      return;
    }

    try {
      // 1. Buscar usuario en Supabase
      const { data: usuarios, error } = await supabase
        .from("usuario")
        .select("*")
        .eq("nombre_usuario", username)
        .eq("contrasena", password)
        .limit(1);

      if (error) {
        console.error("Error al consultar usuario:", error);
        setLoginError("Error de conexión con la base de datos");
        return;
      }

      if (!usuarios || usuarios.length === 0) {
        setLoginError("Usuario o contraseña incorrectos");
        return;
      }

      const usuario = usuarios[0];

      // 2. Verificar si es docente
      const { data: docentes } = await supabase
        .from("docente")
        .select("id_docente")
        .eq("id_usuario", usuario.id_usuario)
        .limit(1);

      if (docentes && docentes.length > 0) {
        setCurrentUser(usuario.nombre_usuario);
        navigate("/docente");
        return;
      }

      // 3. Verificar si es estudiante
      const { data: estudiantes } = await supabase
        .from("estudiante")
        .select("id_estudiante")
        .eq("id_usuario", usuario.id_usuario)
        .limit(1);

      if (estudiantes && estudiantes.length > 0) {
        setCurrentUser(usuario.nombre_usuario);
        navigate("/estudiante");
        return;
      }

      // 4. Existe pero no tiene rol asignado
      setLoginError("El usuario no tiene un rol asignado (estudiante/docente)");
    } catch (err) {
      console.error("Error inesperado en login:", err);
      setLoginError("Error inesperado al iniciar sesión");
    }
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
