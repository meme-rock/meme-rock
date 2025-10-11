import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadingScreen } from "./components/loading/LoadingScreen";
import { TopBar } from "./components/TopBar";
import { Navbar } from "./components/Navbar";
import { MainPage } from "./pages/MainPage";
import { RockPage } from "./pages/RockPage";
import { MarketPage } from "./pages/MarketPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

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
    <>
      <TonConnectUIProvider manifestUrl="https://gist.githubusercontent.com/bilalalibindal/28570ea4b0f3b327a2f8a2732e29a6b9/raw/fd8ccc3bdc6e970eaf88cd1e853be7bfc352f15c/tonconnect-manifest.json">
        <Router>
          <div className="min-h-screen bg-black text-white flex flex-col">
            <TopBar stones={stones} />

            <main className="flex-1 pb-16">
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/rock" element={<RockPage />} />
                <Route
                  path="/market"
                  element={<MarketPage stones={stones} />}
                />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>

            <Navbar />
          </div>
        </Router>
      </TonConnectUIProvider>
    </>
  );
}

export default App;
