import { useNavigate } from "react-router-dom";
import { Lock, Play } from "lucide-react";

interface MiniGame {
  id: string;
  title: string;
  icon: string;
  path: string;
  isLocked: boolean;
}

const games: MiniGame[] = [
  {
    id: "drill",
    title: "Rock Drill",
    icon: "\u26CF\uFE0F",
    path: "/mini-games/drill",
    isLocked: false,
  },
  {
    id: "coming-soon-1",
    title: "Coming Soon",
    icon: "",
    path: "",
    isLocked: true,
  },
  {
    id: "coming-soon-2",
    title: "Coming Soon",
    icon: "",
    path: "",
    isLocked: true,
  },
];

export const MiniGamesPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen pb-24 px-5 pt-14"
      style={{ background: "#060a14" }}
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <h1
          className="text-center mb-8 tracking-[0.25em] uppercase"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "20px",
            color: "#7a9ac0",
            letterSpacing: "0.25em",
          }}
        >
          Mini Games
        </h1>

        {/* Game List */}
        <div className="flex flex-col gap-3">
          {games.map((game) =>
            game.isLocked ? (
              <div
                key={game.id}
                className="flex items-center justify-between px-5 py-4 rounded-2xl"
                style={{
                  background: "rgba(12,18,30,0.6)",
                  border: "1px solid rgba(40,55,80,0.25)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-[#2a3a55]" />
                  <span
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "13px",
                      color: "#2a3a55",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {game.title}
                  </span>
                </div>
              </div>
            ) : (
              <button
                key={game.id}
                onClick={() => navigate(game.path)}
                className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all active:scale-[0.98]"
                style={{
                  background: "rgba(14,22,38,0.8)",
                  border: "1px solid #1e3050",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{game.icon}</span>
                  <span
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: "14px",
                      color: "#c0d4ec",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {game.title}
                  </span>
                </div>

                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "#1a2a45",
                    border: "1px solid #2a4a70",
                  }}
                >
                  <Play className="w-4 h-4 text-[#5a8ec0] ml-0.5" fill="#5a8ec0" />
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Load Orbitron font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default MiniGamesPage;
