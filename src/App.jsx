import SideNav from "./components/SideNav";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/authContext/authContext";

import "../src/App.css"

function App() {
  
  const { userLoggedIn } = useAuth();
  return (
    <div className="bg-[#e0e0e0]">
      {!userLoggedIn && <Navigate to={"/"} replace={true} />}
      <div className="flex flex-row sm:justify-start">
        <div className="fixed">
          <SideNav />
        </div>
        <div className=" sm:w-3/5 sm:min-[calc(100vw - 200px)] bg-[#e0e0e0] sm:max-[calc(100vw - 250px)] sm:ml-[200px] ml-[90px]">
        <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
