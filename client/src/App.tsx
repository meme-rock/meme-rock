import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadingScreen } from "./components/loading/LoadingScreen";
import { TopBar } from "./components/TopBar";
import { Navbar } from "./components/Navbar";
import { MainPage } from "./pages/MainPage";
import { RockPage } from "./pages/RockPage";
import { MarketPage } from "./pages/MarketPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { useGlobalRockCounter } from "./hooks/useGlobalRockCounter";
import { MinePage } from "./pages/MinePage";
import { TaskPage } from "./pages/TaskPage";
import { LeaderBoardPage2 } from "./pages/LeaderBoardPage2";

function AppContent() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <TopBar
          stones={user.balance_data.stone}
          dust={user.balance_data.dust}
        />

        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/mine" element={<MinePage />} />
            <Route path="/rock" element={<RockPage />} />
            <Route path="/task" element={<TaskPage />} />
            <Route
              path="/market"
              element={<MarketPage stones={user.balance_data.stone} />}
            />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/leaderboard-2" element={<LeaderBoardPage2 />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>

        <Navbar />
      </div>
    </>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Initialize global rock counter (runs across all pages)
  useGlobalRockCounter();

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <TonConnectUIProvider manifestUrl="https://gist.githubusercontent.com/bilalalibindal/28570ea4b0f3b327a2f8a2732e29a6b9/raw/fd8ccc3bdc6e970eaf88cd1e853be7bfc352f15c/tonconnect-manifest.json">
      <Router>
        <AppContent />
      </Router>
    </TonConnectUIProvider>
  );
}

export default App;
