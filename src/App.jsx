import SideNav from "./components/SideNav";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/authContext/authContext";

function App() {
  const { userLoggedIn } = useAuth();
  return (
    <div>
      {!userLoggedIn && <Navigate to={"/"} replace={true} />}
      <div className="flex flex-row">
        <SideNav />
        <Outlet />
      </div>
    </div>
  );
}

export default App;
