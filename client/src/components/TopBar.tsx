import { AnimatedNumber } from "./rock/AnimatedNumber";

interface TopBarProps {
  stones: number;
  dust: number;
}

export const TopBar = ({ stones, dust }: TopBarProps) => {
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm px-4 py-3 flex justify-end items-center shadow-lg">
      {/* Ana konteyner: Öğeleri yan yana sıralamak için 'flex-row' ve aralarına boşluk için 'space-x-3' */}
      <div className="flex flex-row space-x-3">
        {/* 1. Dust Bakiyesi */}
        <div className="flex items-center space-x-2 bg-yellow-700/20 px-3 py-1.5 rounded-full">
          <img
            src="/dust.svg"
            alt="Dust"
            className="w-[28px] h-[28px] filter drop-shadow-sm"
          />
          <div className="text-yellow-300 font-bold text-lg min-w-[60px]">
            <AnimatedNumber value={dust} decimals={0} />
          </div>
        </div>
        {/* 2. Stone Bakiyesi */}
        <div className="flex items-center space-x-2 bg-blue-700/20 px-3 py-1.5 rounded-full">
          <img
            src="/stone.svg"
            alt="Stone"
            className="w-[28px] h-[28px] filter brightness-110 drop-shadow-sm"
          />
          <div className="text-blue-300 font-bold text-lg min-w-[60px]">
            <AnimatedNumber value={stones} decimals={0} />
          </div>
        </div>
      </div>
    </div>
  );
};
