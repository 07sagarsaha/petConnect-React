import SideNav from "./components/SideNav";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="flex flex-row">
      <SideNav />
      <Outlet />
    </div>
  );
}

export default App;
