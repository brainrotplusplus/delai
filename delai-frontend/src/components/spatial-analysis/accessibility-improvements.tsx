"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$/components/ui/card";
import { Button } from "$/components/ui/button";
import { Badge } from "$/components/ui/badge";
import { Accessibility } from "lucide-react";

export function AccessibilityImprovements() {
  const getImprovementAnimationDelay = (index: number) => {
    const delays = [
      "animation-delay-400",
      "animation-delay-500",
      "animation-delay-600",
    ];
    return delays[index] || "animation-delay-600";
  };

  const getPriorityAnimationDelay = (index: number) => {
    const delays = [
      "animation-delay-500",
      "animation-delay-600",
      "animation-delay-700",
    ];
    return delays[index] || "animation-delay-700";
  };

  const improvementItems = [
    {
      title: "Dostępność dla Wózków Inwalidzkich",
      description: "Instalacja ramp i wind na 12 priorytetowych stacjach",
      cost: "2.4M PLN",
      iconColor: "text-blue-400",
    },
    {
      title: "Komunikaty Dźwiękowe",
      description: "Modernizacja systemów audio dla pasażerów z wadami wzroku",
      cost: "800K PLN",
      iconColor: "text-green-400",
    },
    {
      title: "Wskazówki Tactile",
      description:
        "Instalacja nawierzchni tactile na wszystkich głównych przystankach",
      cost: "1.2M PLN",
      iconColor: "text-purple-400",
    },
  ];

  const priorityItems = [
    {
      label: "Etap 1: Stacje o wysokim ruchu",
      badge: "6 miesięcy",
      variant: "linear-badge",
    },
    {
      label: "Etap 2: Huby Transferowe",
      badge: "12 miesięcy",
      variant: "secondary",
    },
    {
      label: "Etap 3: Pozostała Sieć",
      badge: "18 miesięcy",
      variant: "outline",
    },
  ];

  return (
    <div id="improvements" className="space-y-6">
      <h3 className="text-xl font-medium text-white/60 animate-fade-in-slide animation-delay-200">
        Ulepszenia Dostępności
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="linear-card animate-fade-in-up animation-delay-300">
          <CardHeader>
            <CardTitle className="text-white font-semibold">
              Rekomendacje Dostępności
            </CardTitle>
            <CardDescription className="text-white/60">
              Ulepszenia dla osób z niepełnosprawnościami
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {improvementItems.map((item, index) => (
              <div
                key={index}
                className={`p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-all duration-200 animate-fade-in-up ${getImprovementAnimationDelay(
                  index
                )}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Accessibility className={`h-5 w-5 ${item.iconColor}`} />
                  <h4 className="font-medium text-white">{item.title}</h4>
                </div>
                <p className="text-sm text-white/60 mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">
                    Szacowany Koszt: {item.cost}
                  </span>
                  <Button size="sm" className="linear-button">
                    Zobacz Szczegóły
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="linear-card animate-fade-in-up animation-delay-400">
          <CardHeader>
            <CardTitle className="text-white font-semibold">
              Priorytet Implementacji
            </CardTitle>
            <CardDescription className="text-white/60">
              Zalecany porządek ulepszania dostępności
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl animate-fade-in-up ${getPriorityAnimationDelay(
                    index
                  )}`}
                >
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                  <Badge className={item.variant}>{item.badge}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
