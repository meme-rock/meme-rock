interface TopBarProps {
  stones: number;
  dust: number;
}

export const TopBar = ({ stones, dust }: TopBarProps) => {
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 px-4 py-3 flex justify-end items-center shadow-lg">
      {/* Ana konteyner: Öğeleri alt alta sıralamak için 'flex-col' ve aralarına boşluk için 'space-y-2' */}
      <div className="flex flex-col space-y-2">
        {/* 1. Stone Bakiyesi */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-700/20 to-cyan-700/20 px-4 py-2 rounded-xl border border-blue-500/30 min-w-[150px] justify-end">
          <img
            src="/stone.svg"
            alt="Stone"
            className="w-[30px] h-[30px] filter brightness-110 drop-shadow-sm"
          />
          <span className="text-blue-300 font-bold text-lg">
            {stones.toLocaleString()}
          </span>
        </div>

        {/* 2. Dust Bakiyesi */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-700/20 to-amber-700/20 px-4 py-2 rounded-xl border border-yellow-500/30 min-w-[150px] justify-end">
          <img
            src="/dust.svg"
            alt="Dust"
            // Dust ikonunuz için farklı bir stil kullanabiliriz
            className="w-[30px] h-[30px] filter drop-shadow-sm"
          />
          <span className="text-yellow-300 font-bold text-lg">
            {/* Buradaki stones.toLocaleString() hatasını düzelterek dust prop'unu kullandık */}
            {dust.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
