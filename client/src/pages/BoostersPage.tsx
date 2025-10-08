export const BoostersPage = () => {
  return (
    <div className="flex-1 bg-black px-6 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
            <svg
              className="w-8 h-8 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Power Boosters
          </h1>
          <p className="text-gray-400">Level up your mining operation</p>
        </div>

        {/* Booster cards */}
        <div className="space-y-4">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">
                    Mining Speed +50%
                  </h3>
                  <p className="text-gray-500 text-sm">
                    2x faster stone collection
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold">250 💎</div>
                <div className="text-xs text-gray-500">24h duration</div>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold py-2 rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-300">
              Activate Booster
            </button>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Auto Collector</h3>
                  <p className="text-gray-500 text-sm">
                    Automatic stone gathering
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-400 font-bold">500 💎</div>
                <div className="text-xs text-gray-500">Permanent</div>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-2 rounded-lg hover:from-blue-400 hover:to-cyan-400 transition-all duration-300">
              Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
