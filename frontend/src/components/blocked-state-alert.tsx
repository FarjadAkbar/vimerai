"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

interface BlockedStateInfo {
  message: string;
  cta: { text: string; href: string } | null;
  secondaryCta?: { text: string; href: string };
  variant: "default" | "destructive" | "info";
}

interface BlockedStateAlertProps {
  blockedStateInfo: BlockedStateInfo;
}

export function BlockedStateAlert({ blockedStateInfo }: BlockedStateAlertProps) {
  const variantStyles = {
    destructive: {
      container: "bg-destructive/10 border-destructive/20",
      icon: "text-destructive",
      text: "text-destructive",
      link: "text-destructive hover:text-destructive/80 underline underline-offset-4",
    },
    info: {
      container: "bg-blue-500/10 border-blue-500/20",
      icon: "text-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      link: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4",
    },
    default: {
      container: "bg-amber-500/10 border-amber-500/20",
      icon: "text-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      link: "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-4",
    },
  };

  const styles = variantStyles[blockedStateInfo.variant];

  return (
    <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${styles.container}`}>
      <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${styles.text}`}>
          {blockedStateInfo.message}
          {blockedStateInfo.cta && (
            <>
              {" "}
              <Link 
                href={blockedStateInfo.cta.href}
                className={`text-sm font-medium ${styles.link}`}
              >
                {blockedStateInfo.cta.text}
              </Link>
            </>
          )}
          {blockedStateInfo.secondaryCta && (
            <>
              {" "}
              <Link 
                href={blockedStateInfo.secondaryCta.href}
                className={`text-sm font-medium ${styles.link} opacity-80 hover:opacity-100`}
              >
                {blockedStateInfo.secondaryCta.text}
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
