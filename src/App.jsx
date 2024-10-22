import SideNav from "./components/SideNav";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/authContext/authContext";

function App() {
  const { userLoggedIn } = useAuth();
  return (
    <div>
      {!userLoggedIn && <Navigate to={"/"} replace={true} />}
      <div className="flex flex-row">
        <div className="fixed">
        <SideNav />
        </div>
        <div className="w-4/5 min-[calc(100vw - 200px)] max-[calc(100vw - 250px)] flex item-end">
        <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
