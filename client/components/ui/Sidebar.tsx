"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import Image from "next/image";

const NAV = [
  { href: "/generate", label: "AI Roadmap", icon: "✨" },
  { href: "/roadmap", label: "Roadmap", icon: "🗺️" },
  { href: "/progress", label: "Progress", icon: "📊" },
  { href: "/patterns", label: "Patterns", icon: "🧩" },
  { href: "/resources", label: "Resources", icon: "📚" },
  { href: "/competitive", label: "Competitive", icon: "🏆" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { appUser } = useAuthStore();

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen bg-gray-900 border-r border-gray-800 px-4 py-6">
      {/* Brand */}
      <div className="mb-8 px-2">
        <span className="text-xl font-bold text-white">DSA Teacher</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
              pathname === item.href
                ? "bg-brand-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-800 pt-4 mt-4">
        {appUser && (
          <div className="flex items-center gap-3 px-2 mb-3">
            {appUser.photoURL ? (
              <Image
                src={appUser.photoURL}
                alt={appUser.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white">
                {appUser.name[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate">{appUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{appUser.preferredLanguage}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut(auth)}
          className="w-full text-left text-sm text-gray-500 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
