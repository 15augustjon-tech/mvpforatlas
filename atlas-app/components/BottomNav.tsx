"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, Send, User } from "lucide-react";

const navItems = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
  { href: "/applications", icon: Send, label: "Applications" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom z-50">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 transition-colors ${
                isActive ? "text-teal" : "text-gray-text"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
