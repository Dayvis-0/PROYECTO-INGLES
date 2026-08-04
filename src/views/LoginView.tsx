import { useEffect } from "react";
import type { FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase";

/**
 * LoginView — autentica contra Supabase Auth.
 * El usuario ingresa nombre_usuario + contraseña (como siempre);
 * el frontend traduce nombre_usuario → email y llama a signInWithPassword.
 * La contraseña ya NO se consulta en texto plano contra la tabla usuario.
 */
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
    checkRoleAndRedirect(currentUser);
  }, [currentUser, navigate]);

  const checkRoleAndRedirect = async (username: string) => {
    const { data: docentes } = await supabase
      .from("docente")
      .select("id_docente")
      .in("id_usuario", (
        await supabase.from("usuario").select("id_usuario").eq("nombre_usuario", username)
      ).data?.map(u => u.id_usuario) ?? [])
      .limit(1);

    navigate(docentes && docentes.length > 0 ? "/docente" : "/estudiante", { replace: true });
  };

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
      // 1. Traducir nombre_usuario → email vía función segura (SECURITY DEFINER).
      //    No consultamos la tabla usuario directo: con RLS activo, el login
      //    ocurre ANTES de que exista sesión, y la tabla ya no sería visible.
      const { data: email, error: lookupError } = await supabase
        .rpc("get_email_by_username", { p_username: username });

      if (lookupError) {
        console.error("Error RPC:", lookupError);
        setLoginError("Error al consultar usuario");
        return;
      }

      if (!email) {
        setLoginError("Usuario o contraseña incorrectos");
        return;
      }

      // 2. Autenticar contra Supabase Auth (contraseña hasheada + sesión JWT)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Mensaje genérico a propósito: no filtrar si el error es de email o password
        setLoginError("Usuario o contraseña incorrectos");
        return;
      }

      // 3. Sesión válida → guardar usuario local (identificador interno de la app)
      setCurrentUser(username);
      localStorage.setItem("unajma_current_user", username);

      // Redirigir según rol
      await checkRoleAndRedirect(username);

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
