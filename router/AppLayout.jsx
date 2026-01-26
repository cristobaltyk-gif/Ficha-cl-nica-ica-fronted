import { Outlet } from "react-router-dom";
import TopBar from "../components/ui/TopBar";

export default function AppLayout() {
  return (
    <div>
      <TopBar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
