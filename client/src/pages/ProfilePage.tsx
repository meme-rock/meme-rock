export const ProfilePage = () => {
  return (
    <div className="flex-1 bg-black px-6 py-8">
      <div className="max-w-md mx-auto">
        {/* Profile header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-cyan-500/30">
            <svg
              className="w-12 h-12 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            @CryptoMiner_42
          </h1>
          <p className="text-gray-400 text-sm">Level 15 Rock Miner</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">1,250</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Total Diamonds
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">50,000</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Total Stones
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">15</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Current Level
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">2,340</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Mining Power
            </div>
          </div>
        </div>

        {/* Achievement section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Achievements
          </h2>
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
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
                  <h3 className="text-yellow-400 font-semibold">
                    First Million Stones
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Mined 1,000,000 stones total
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-blue-400 font-semibold">Speed Demon</h3>
                  <p className="text-gray-500 text-sm">
                    Collected 500 stones in 1 hour
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings button */}
        <button className="w-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 text-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-300">
          Account Settings
        </button>
      </div>
    </div>
  );
};
