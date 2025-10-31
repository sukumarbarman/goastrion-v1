"use client";

import { useCallback, useRef } from "react";

export default function JumpButton() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.9;
      audio.play().catch(() => {});
      // fade out after 2.5s
      const fade = setInterval(() => {
        if (audio.volume > 0.05) audio.volume -= 0.05;
        else {
          clearInterval(fade);
          audio.pause();
        }
      }, 100);
    }

    // Redirect after slight delay
    setTimeout(() => {
      window.location.href = "/daily";
    }, 400);
  }, []);

  return (
    <>
      <button
        onClick={handleClick}
        className="
          relative inline-flex items-center gap-2 overflow-hidden
          bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500
          text-white text-lg font-semibold
          px-8 py-3 rounded-2xl
          shadow-[0_0_15px_rgba(168,85,247,0.6)]
          hover:shadow-[0_0_25px_rgba(168,85,247,0.9)]
          hover:scale-105
          transition-all duration-300
          shimmer-btn
        "
      >
        <span className="animate-pulse">🚀</span> Jump to Today →
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer-light" />
      </button>

      {/* Om sound */}
      <audio ref={audioRef} src="/sounds/launch.mp3" preload="auto" />
    </>
  );
}
