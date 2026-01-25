import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./auth/AuthContext";

/**
 * App raíz (CANÓNICA FINAL)
 *
 * Responsabilidades:
 * - Monta AuthProvider (sesión + rol desde backend)
 * - Monta AppRouter
 *
 * NO hace:
 * - NO maneja useState(session)
 * - NO renderiza Login
 * - NO decide flujos
 */
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
