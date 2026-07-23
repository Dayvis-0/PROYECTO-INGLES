import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
