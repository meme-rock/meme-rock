interface TopBarProps {
  stones: number;
}

export const TopBar = ({ stones }: TopBarProps) => {
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 px-4 py-3 flex justify-end items-center shadow-lg">
      {/* Stones - Right aligned */}
      <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-700/20 to-cyan-700/20 px-4 py-2 rounded-xl border border-blue-500/30">
        <img
          src="/stone.svg"
          alt="Stone"
          className="w-[40px] h-[40px] filter brightness-110 drop-shadow-sm"
        />
        <span className="text-blue-300 font-bold text-lg">
          {stones.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
