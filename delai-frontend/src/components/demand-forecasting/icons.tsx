import {
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Music,
  Trophy,
  Calendar,
} from "lucide-react";

export const WeatherIcon = ({
  weather,
  className = "h-6 w-6",
}: {
  weather: string;
  className?: string;
}) => {
  switch (weather) {
    case "sunny":
      return <Sun className={`${className} text-yellow-500`} />;
    case "rain":
      return <CloudRain className={`${className} text-blue-500`} />;
    case "snow":
      return <Snowflake className={`${className} text-blue-300`} />;
    case "cloudy":
      return <Cloud className={`${className} text-gray-500`} />;
    default:
      return <Sun className={`${className} text-yellow-500`} />;
  }
};

export const EventIcon = ({
  type,
  className = "h-5 w-5",
}: {
  type: string;
  className?: string;
}) => {
  switch (type) {
    case "music":
      return <Music className={`${className}`} />;
    case "sports":
      return <Trophy className={`${className}`} />;
    default:
      return <Calendar className={`${className}`} />;
  }
};
