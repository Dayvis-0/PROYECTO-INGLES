import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase";

interface Props {
  children: ReactNode;
  allowedRoles?: ("docente" | "estudiante")[];
}

/**
 * ProtectedRoute — verifica que exista sesión JWT de Supabase
 * y que el usuario tenga el rol adecuado.
 */
export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { currentUser } = useAppContext();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Verificar sesión JWT REAL (no confiar solo en localStorage)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setAuthorized(false);
        return;
      }

      if (!currentUser) {
        setAuthorized(false);
        return;
      }

      if (!allowedRoles || allowedRoles.length === 0) {
        setAuthorized(true);
        return;
      }

      // Verificar rol contra BD
      const { data: usuario } = await supabase
        .from("usuario")
        .select("id_usuario")
        .eq("nombre_usuario", currentUser)
        .maybeSingle();

      if (!usuario) {
        setAuthorized(false);
        return;
      }

      if (allowedRoles.includes("docente")) {
        const { data: docente } = await supabase
          .from("docente")
          .select("id_docente")
          .eq("id_usuario", usuario.id_usuario)
          .maybeSingle();
        if (docente) {
          setAuthorized(true);
          return;
        }
      }

      if (allowedRoles.includes("estudiante")) {
        const { data: estudiante } = await supabase
          .from("estudiante")
          .select("id_estudiante")
          .eq("id_usuario", usuario.id_usuario)
          .maybeSingle();
        if (estudiante) {
          setAuthorized(true);
          return;
        }
      }

      setAuthorized(false);
    };

    checkAuth();
  }, [currentUser, allowedRoles]);

  if (authorized === null) return null;
  if (!authorized) return <Navigate to="/" replace />;
  return <>{children}</>;
}
