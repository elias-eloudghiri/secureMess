import React from "react";
import { User } from "../types";
interface AvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
}
export function Avatar({ user, size = "md" }: AvatarProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
  };
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${user.avatarColor} ${sizeClasses[size]}`}
      aria-label={`Avatar de ${user.name}`}
    >
      {initials}
    </div>
  );
}
