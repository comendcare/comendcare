import { icons } from "lucide-react";

export const Icon = ({
                       name,
                       color = "currentColor", // Default to current text color
                       size = 24, // Default size
                       className,
                     }: {
  name: keyof typeof icons;
  color?: string;
  size?: number;
  className?: string;
}) => {
  // Ensure the icon exists in the icons object
  const LucideIcon = icons[name as keyof typeof icons];

  // If the icon does not exist, return null or some fallback
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return <LucideIcon color={color} size={size} className={className} />;
};
