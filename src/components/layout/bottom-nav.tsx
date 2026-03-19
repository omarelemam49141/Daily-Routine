"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Droplets, Home, MoreHorizontal, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "اليوم", icon: Home },
  { href: "/routines", label: "الروتين", icon: Sparkles },
  { href: "/schedule", label: "الجدول", icon: CalendarDays },
  { href: "/budget", label: "الميزانية", icon: Droplets },
  { href: "/more", label: "المزيد", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-teal-200/40 bg-white/85 pb-safe pt-2 backdrop-blur-xl dark:border-white/10 dark:bg-black/50">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors",
                active
                  ? "text-teal-700 dark:text-teal-200"
                  : "text-teal-900/45 dark:text-white/45",
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-x-2 -top-1 h-1 rounded-full bg-gradient-to-l from-teal-500 to-cyan-400"
                />
              )}
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
