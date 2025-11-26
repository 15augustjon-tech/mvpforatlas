"use client";

import Link from "next/link";
import { User } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/feed" className="text-xl font-bold text-navy">
          ATLAS
        </Link>
        <Link
          href="/profile"
          className="w-9 h-9 rounded-full bg-gray-light flex items-center justify-center"
        >
          <User className="w-5 h-5 text-gray-text" />
        </Link>
      </div>
    </header>
  );
}
