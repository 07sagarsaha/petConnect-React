import SideNav from "./components/SideNav";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/authContext/authContext";

import "../src/App.css"

function App() {
  const { userLoggedIn } = useAuth();
  return (
    <div>
      {!userLoggedIn && <Navigate to={"/"} replace={true} />}
      <div className="flex flex-row justify-start">
        <div className="fixed">
          <SideNav />
        </div>
        <div className=" min-[calc(100vw - 200px)] bg-[#e0e0e0] max-[calc(100vw - 250px)] ml-[200px] ">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
