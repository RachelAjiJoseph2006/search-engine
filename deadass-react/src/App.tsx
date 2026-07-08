import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Results from "./pages/results";
import Splash from "./components/Splash";
import AuthChoice from "./pages/AuthChoice";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <Routes>
      <Route path="/search" element={<Home />} />
      <Route path="/results" element={<Results />} />
      <Route path="/" element={<AuthChoice />} />
    </Routes>
  );
}

export default App;