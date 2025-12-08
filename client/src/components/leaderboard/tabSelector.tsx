"use client";

import { Trophy, Users } from "lucide-react";

interface TabSelectorProps {
  activeTab: "general" | "weekly";
  onTabChange: (tab: "general" | "weekly") => void;
}

export const TabSelector = ({ activeTab, onTabChange }: TabSelectorProps) => {
  return (
    <div className="flex gap-2 p-1 bg-[#1a1a25] rounded-xl">
      <button
        onClick={() => onTabChange("general")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
          activeTab === "general"
            ? "bg-[#10b981] text-[#10b981]-[#f5f5f5] shadow-lg shadow-[#10b981]/25"
            : "text-[#252530]-[#f5f5f5] hover:text-[#f5f5f5]"
        }`}
      >
        <Trophy className="w-4 h-4" />
        <span>General</span>
      </button>

      <button
        onClick={() => onTabChange("weekly")}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
          activeTab === "weekly"
            ? "bg-[#10b981] text-[#10b981]-[#f5f5f5] shadow-lg shadow-[#10b981]/25"
            : "text-[#252530]-[#f5f5f5] hover:text-[#f5f5f5]"
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Weekly Invites</span>
      </button>
    </div>
  );
};
