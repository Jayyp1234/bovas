import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

/** BOVAS & Company logo lockup (badge + wordmark). */
export function Logo({ className }: LogoProps) {
  return (
    <Image
      src="/Bovas-Logo.png"
      alt="BOVAS & Company"
      width={77}
      height={29}
      priority
      unoptimized
      className={cn("h-9 w-auto", className)}
    />
  );
}
