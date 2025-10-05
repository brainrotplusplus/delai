"use client";

import { useEffect, useState } from "react";
import { Route, MapPin, TrendingUp } from "lucide-react";
import { Logo } from "$/components/ui/logo";

interface LoadingShellProps {
  onLoadingComplete: () => void;
}

export function LoadingShell({ onLoadingComplete }: LoadingShellProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onLoadingComplete, 500); // Small delay before showing content
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="flex h-screen">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-black/30 backdrop-blur-md border-r border-white/10 p-4">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8 animate-pulse">
            <Logo className="h-16 w-auto opacity-50" width={140} height={91} />
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            {[
              {
                icon: Route,
                title: "Optymalizacja Tras",
                subtitle: "i Rozkładów",
              },
              { icon: MapPin, title: "Analiza", subtitle: "Przestrzenna" },
              { icon: TrendingUp, title: "Prognozowanie", subtitle: "Popytu" },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg bg-white/5 border border-white/10 animate-pulse ${
                  index === 0 ? "bg-blue-500/20 border-blue-500/30" : ""
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      index === 0 ? "bg-blue-500" : "bg-white/10"
                    }`}
                  >
                    <item.icon className="h-4 w-4 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <div className="space-y-1">
                      <div className="h-3 bg-white/20 rounded w-24"></div>
                      <div className="h-3 bg-white/20 rounded w-20"></div>
                    </div>
                    <div className="h-2 bg-white/10 rounded w-32 mt-2"></div>
                  </div>
                </div>
                {/* Subsections */}
                <div className="mt-3 ml-3 space-y-2 border-l border-white/10 pl-3">
                  {[1, 2, 3].map((sub) => (
                    <div
                      key={sub}
                      className="h-2 bg-white/10 rounded w-20"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 bg-black/20 backdrop-blur-md border-b border-white/8 px-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-white/10 rounded animate-pulse"></div>
            <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
            <div className="h-4 bg-white/20 rounded w-80 animate-pulse"></div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 space-y-8">
            {/* Page Title */}
            <div className="space-y-3 animate-fade-in-up">
              <div className="h-8 bg-gradient-to-r from-white/20 to-white/10 rounded w-96"></div>
              <div className="h-4 bg-white/15 rounded w-64"></div>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((card) => (
                <div
                  key={card}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-pulse"
                  style={{ animationDelay: `${card * 300}ms` }}
                >
                  <div className="space-y-4">
                    <div className="h-5 bg-white/20 rounded w-48"></div>
                    <div className="h-3 bg-white/15 rounded w-32"></div>
                    <div className="h-40 bg-white/10 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Content */}
            <div className="space-y-6">
              <div
                className="h-5 bg-white/20 rounded w-40 animate-pulse"
                style={{ animationDelay: "600ms" }}
              ></div>
              <div
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-pulse"
                style={{ animationDelay: "700ms" }}
              >
                <div className="space-y-4">
                  <div className="h-5 bg-white/20 rounded w-56"></div>
                  <div className="h-3 bg-white/15 rounded w-40"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-white/20 rounded w-32"></div>
                          <div className="h-2 bg-white/15 rounded w-24"></div>
                        </div>
                        <div className="w-16 h-6 bg-white/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Progress */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-black/50 backdrop-blur-sm border-t border-white/10 p-4">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <span className="text-white/80 text-sm font-medium">
                Ładowanie panelu transportowego...
              </span>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <div className="relative">
              <div className="w-full bg-white/10 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-1 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-center mt-2">
                <span className="text-white/60 text-xs">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div
        className="absolute bottom-20 left-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </div>
  );
}
