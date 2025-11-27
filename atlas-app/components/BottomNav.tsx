"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bookmark, Send, User, FileEdit } from "lucide-react";

const navItems = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
  { href: "/apply-prep", icon: FileEdit, label: "Prep" },
  { href: "/applications", icon: Send, label: "Applied" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex justify-around py-1.5 sm:py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1.5 sm:py-2 px-3 sm:px-4 transition-colors active:scale-95 ${
                isActive ? "text-teal" : "text-gray-text"
              }`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
