import { type ReactNode } from "react";
import { AuthProvider, useAuthContext, type AuthContextType } from "./AuthContext";
import { LessonsProvider, useLessonsContext, type LessonsContextType } from "./LessonsContext";
import { TeacherFormProvider, useTeacherFormContext, type TeacherFormContextType } from "./TeacherFormContext";
import { WalkthroughProvider, useWalkthroughContext, type WalkthroughContextType } from "./WalkthroughContext";

/**
 * AppContext — AGREGADOR de los 4 contextos especializados.
 *
 * Sigue exportando `useAppContext()` con la misma interfaz de 84 campos
 * para que ningún componente existente se rompa.
 *
 * Pero INTERNAMENTE el estado está particionado en 4 contextos separados,
 * cada uno con su propio reducer. Esto significa que si un componente
 * solo consume campos de AuthContext, NO se re-renderiza cuando cambia
 * WalkthroughContext (y viceversa).
 *
 * Los componentes nuevos pueden importar directamente los hooks
 * específicos (useAuthContext, useLessonsContext, etc.) para
 * beneficiarse de re-renders más precisos.
 */

// ─── Tipo combinado (idéntico al original) ──────────────
export type AppContextType = AuthContextType & LessonsContextType & TeacherFormContextType & WalkthroughContextType;

// ─── Hook combinado (compatible con código existente) ────
export function useAppContext(): AppContextType {
  const auth = useAuthContext();
  const lessons = useLessonsContext();
  const teacher = useTeacherFormContext();
  const walkthrough = useWalkthroughContext();

  return { ...auth, ...lessons, ...teacher, ...walkthrough };
}

// ─── Provider que monta los 4 contextos anidados ─────────
export function AppProvider({ children }: { children: ReactNode }) {
  // Renderless component que conecta AuthContext con LessonsContext
  return (
    <AuthProvider>
      <LessonsBridge>
        <TeacherFormProvider>
          <WalkthroughProvider>
            {children}
          </WalkthroughProvider>
        </TeacherFormProvider>
      </LessonsBridge>
    </AuthProvider>
  );
}

/**
 * Bridge: LessonsProvider necesita currentUser del AuthContext.
 * Este componente obtiene currentUser y se lo pasa a LessonsProvider.
 */
function LessonsBridge({ children }: { children: ReactNode }) {
  const { currentUser } = useAuthContext();
  return <LessonsProvider currentUser={currentUser}>{children}</LessonsProvider>;
}
