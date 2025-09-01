"use client";
import { useRef, useState, useEffect } from "react";
import Field from "./Field";

type Mode = "login" | "signup";

export default function AuthModals({
  open,
  mode,
  onClose,
}: {
  open: boolean;
  mode: Mode;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

  // Center the dialog when it opens
  useEffect(() => {
    if (!open) return;
    setPos({ x: 0, y: 0 });
  }, [open]);

  // Mouse handlers
  const onMouseDownHeader = (e: React.MouseEvent) => {
    if (!dialogRef.current) return;
    setDragging(true);
    // current left/top from transform translate(x,y)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      left: pos.x,
      top: pos.y,
    };
    // Prevent text selection while dragging
    document.body.style.userSelect = "none";
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({ x: dragStart.current.left + dx, y: dragStart.current.top + dy });
  };

  const onMouseUp = () => {
    if (!dragging) return;
    setDragging(false);
    document.body.style.userSelect = "";
  };

  // Touch handlers
  const onTouchStartHeader = (e: React.TouchEvent) => {
    if (!dialogRef.current) return;
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { x: t.clientX, y: t.clientY, left: pos.x, top: pos.y };
    document.body.style.userSelect = "none";
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.x;
    const dy = t.clientY - dragStart.current.y;
    setPos({ x: dragStart.current.left + dx, y: dragStart.current.top + dy });
  };

  const onTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    // attach global listeners during drag
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]); // rebind when dragging changes

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // click backdrop to close
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141A2A] shadow-xl"
        style={{
          // start centered, then apply drag offset
          transform: `translate(${pos.x}px, ${pos.y}px)`,
        }}
      >
        {/* Drag handle / header */}
        <div
          className="cursor-move select-none rounded-t-2xl px-6 py-4 border-b border-white/10 bg-black/20 flex items-center justify-between"
          onMouseDown={onMouseDownHeader}
          onTouchStart={onTouchStartHeader}
        >
          <div className="text-white text-lg font-semibold">
            {mode === "login" ? "Login" : "Sign Up"}
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-200 hover:border-white/20"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {mode === "signup" && <Field label="Name" placeholder="Your name" />}
          <div className="mt-2">
            <Field label="Email" placeholder="you@example.com" />
          </div>
          <div className="mt-2">
            <Field label="Password" placeholder="••••••••" />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-2 text-slate-200"
            >
              Cancel
            </button>
            <button className="rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
