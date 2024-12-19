import SideNav from "./components/SideNav";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/authContext/authContext";

import "../src/App.css"

function App() {
  
  const { userLoggedIn } = useAuth();
  return (
    <div className="bg-[#EBE9E1]">
      {!userLoggedIn && <Navigate to={"/"} replace={true} />}
      <div className="flex flex-row sm:justify-start">
        <div className="fixed">
          <SideNav />
        </div>
        <div className=" sm:w-fit sm:min-[calc(100vw - 200px)] w-fit bg-[#EBE9E1] overflow-hidden sm:max-[calc(100vw - 250px)] sm:ml-[15%] ml-[19%]">
        <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
