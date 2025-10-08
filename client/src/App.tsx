import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadingScreen } from "./components/LoadingScreen";
import { TopBar } from "./components/TopBar";
import { Navbar } from "./components/Navbar";
import { MainPage } from "./pages/MainPage";
import { BoostersPage } from "./pages/BoostersPage";
import { MarketPage } from "./pages/MarketPage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [stones] = useState(50000);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Telegram Web App initialization
  useEffect(() => {
    // Telegram Web App SDK initialization would go here
    console.log("Meme Rock Telegram Mini App initialized");
  }, []);

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <TopBar stones={stones} />

        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/boosters" element={<BoostersPage />} />
            <Route path="/market" element={<MarketPage stones={stones} />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>

        <Navbar />
      </div>
    </Router>
  );
}

export default App;
