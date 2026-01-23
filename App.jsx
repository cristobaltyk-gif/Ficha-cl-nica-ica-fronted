import { useState } from "react";
import Login from "./pages/Login";
import AppRouter from "./router/AppRouter";

export default function App() {
  const [session, setSession] = useState(null);
  // session = { usuario, role }

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return (
    <AppRouter
      session={session}
      onLogout={() => setSession(null)}
    />
  );
}
