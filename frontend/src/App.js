import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import FindID from "./pages/FindID/FindID";
import FindPW from "./pages/FindPW/FindPW";
import DogOnboarding from "./pages/DogOnboarding/DogOnboarding";
import Home from "./pages/Home/Home";
import Map from "./pages/Map/Map";

export default function App() {
  return (
    <BrowserRouter>
      <div className="appShell">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/find-id" element={<FindID />} />
          <Route path="/find-pw" element={<FindPW />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dogOnboarding" element={<DogOnboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}