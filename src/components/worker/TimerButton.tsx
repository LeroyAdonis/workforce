"use client";

import { Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerButtonProps {
  isStarted: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}

export function TimerButton({
  isStarted,
  isLoading,
  disabled,
  onStart,
  onStop,
  className,
}: TimerButtonProps) {
  if (isStarted) {
    return (
      <button
        onClick={onStop}
        disabled={isLoading || disabled}
        className={cn(
          "w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg",
          isLoading && "opacity-80 cursor-not-allowed",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Clock className="mr-2 h-5 w-5 animate-pulse" />
        )}
        {isLoading ? "PROCESSING..." : "STOP TASK TIMER"}
      </button>
    );
  }

  return (
    <button
      onClick={onStart}
      disabled={isLoading || disabled}
      className={cn(
        "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg",
        (isLoading || disabled) && "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Clock className="mr-2 h-5 w-5" />
      )}
      {isLoading ? "PROCESSING..." : "START TASK TIMER"}
    </button>
  );
}
