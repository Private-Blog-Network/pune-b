"use client";

import { useEffect, useState } from "react";

const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
];

export default function TopBar() {
  const email = process.env.NEXT_PUBLIC_AD_EMAIL || "admin@example.com";
  const firstLetter = email.charAt(0).toUpperCase();

  const [bgColor, setBgColor] = useState("");

  useEffect(() => {
    // Pick random color once
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBgColor(randomColor);
  }, []);

  return (
    <header className="w-full sticky top-0 h-16 bg-white shadow flex items-center justify-between px-4">
      {/* Left: Logo + Brand Name */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
          P
        </div>
        <span className="font-semibold text-lg text-gray-800">
          PBETB Administrator
        </span>
      </div>

      {/* Right: Profile Circle */}
      <div className="relative group">
        <div
          className={`w-10 h-10 ${bgColor} text-white rounded-full flex items-center justify-center cursor-pointer font-semibold`}
        >
          {firstLetter}
        </div>
        {/* Tooltip */}
        <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap z-10">
          {email}
        </div>
      </div>
    </header>
  );
}
