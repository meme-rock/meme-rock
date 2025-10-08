export const MainPage = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-black">
      <div className="text-center px-6">
        <div className="mb-8">
          <img
            src="/rock-miner.svg"
            alt="Rock Miner"
            className="w-20 h-20 mx-auto mb-6 filter brightness-110"
          />
        </div>
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
          Main Mining Hub
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
          Start your crypto mining adventure and earn rewards in the Meme Rock
          ecosystem
        </p>

        {/* Mining stats preview */}
        <div className="mt-8 grid grid-cols-2 gap-4 max-w-xs mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">1,250</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Diamonds
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">50K</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Stones
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
