import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

// ─── State ────────────────────────────────────────────────
interface AuthState {
  usernameInput: string;
  passwordInput: string;
  loginError: string | null;
  currentUser: string | null;
}

const initialAuthState: AuthState = {
  usernameInput: "",
  passwordInput: "",
  loginError: null,
  currentUser: localStorage.getItem("unajma_current_user") || null,
};

// ─── Actions ──────────────────────────────────────────────
type AuthAction =
  | { type: "SET_USERNAME_INPUT"; payload: string }
  | { type: "SET_PASSWORD_INPUT"; payload: string }
  | { type: "SET_LOGIN_ERROR"; payload: string | null }
  | { type: "SET_CURRENT_USER"; payload: string | null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USERNAME_INPUT": return { ...state, usernameInput: action.payload };
    case "SET_PASSWORD_INPUT": return { ...state, passwordInput: action.payload };
    case "SET_LOGIN_ERROR": return { ...state, loginError: action.payload };
    case "SET_CURRENT_USER": return { ...state, currentUser: action.payload };
    default: return state;
  }
}

// ─── Context type ─────────────────────────────────────────
export interface AuthContextType {
  usernameInput: string;
  setUsernameInput: (s: string) => void;
  passwordInput: string;
  setPasswordInput: (s: string) => void;
  loginError: string | null;
  setLoginError: (e: string | null) => void;
  currentUser: string | null;
  setCurrentUser: (u: string | null) => void;
}

const AuthCtx = createContext<AuthContextType | null>(null);

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuthContext must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Restaurar el usuario desde la sesión JWT de Supabase al montar.
  // Si NO hay sesión válida, se limpia cualquier usuario local (por si quedó
  // uno viejo de la época del login con texto plano).
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;

      if (!session) {
        localStorage.removeItem("unajma_current_user");
        dispatch({ type: "SET_CURRENT_USER", payload: null });
        return;
      }

      // Sesión válida → buscar el nombre de usuario vinculado por auth_uid
      const { data: usuario } = await supabase
        .from("usuario")
        .select("nombre_usuario")
        .eq("auth_uid", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      const nombre = usuario?.nombre_usuario ?? null;
      if (nombre) {
        localStorage.setItem("unajma_current_user", nombre);
      } else {
        localStorage.removeItem("unajma_current_user");
      }
      dispatch({ type: "SET_CURRENT_USER", payload: nombre });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Sync currentUser to localStorage
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem("unajma_current_user", state.currentUser);
    }
  }, [state.currentUser]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "unajma_current_user") {
        dispatch({ type: "SET_CURRENT_USER", payload: e.newValue });
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value: AuthContextType = {
    usernameInput: state.usernameInput,
    setUsernameInput: (s) => dispatch({ type: "SET_USERNAME_INPUT", payload: s }),
    passwordInput: state.passwordInput,
    setPasswordInput: (s) => dispatch({ type: "SET_PASSWORD_INPUT", payload: s }),
    loginError: state.loginError,
    setLoginError: (e) => dispatch({ type: "SET_LOGIN_ERROR", payload: e }),
    currentUser: state.currentUser,
    setCurrentUser: (u) => dispatch({ type: "SET_CURRENT_USER", payload: u }),
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
