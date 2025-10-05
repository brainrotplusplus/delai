import { Card, CardHeader, CardTitle, CardContent } from "$/components/ui/card";
import { Button } from "$/components/ui/button";
import { useRouter } from "next/navigation";

interface UserCardProps {
  title: string;
}

export function UserCard({ title, onRedirect }: UserCardProps) {
  return (
    <Card className="linear-card animate-fade-in-up animation-delay-500 flex flex-col justify-between">
      <CardHeader className="pb-4">
        <CardTitle className="text-white font-semibold text-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 items-center max-w-xs w-full mx-auto">
        <Button size="sm" className="linear-button px-4 py-2 text-sm w-full" onClick={onRedirect}>
          Zaloguj
        </Button>
        <Button size="sm" className="linear-button px-4 py-2 text-sm w-full" onClick={onRedirect}>
          Zarejestruj
        </Button>
      </CardContent>
    </Card>
  );
}
