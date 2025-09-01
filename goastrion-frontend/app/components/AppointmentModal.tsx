"use client";
import { useEffect, useRef, useState } from "react";
import Field from "./Field";

export default function AppointmentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });

  // Center on open (reset any previous drag)
  useEffect(() => {
    if (open) setPos({ x: 0, y: 0 });
  }, [open]);

  // Mouse drag
  const onMouseDownHeader = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, left: pos.x, top: pos.y };
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

  // Touch drag
  const onTouchStartHeader = (e: React.TouchEvent) => {
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

  // Attach global listeners while dragging
  useEffect(() => {
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
  }, [dragging]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // click backdrop to close
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#141A2A] shadow-xl"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      >
        {/* Drag handle / header */}
        <div
          className="cursor-move select-none rounded-t-2xl px-6 py-4 border-b border-white/10 bg-black/20 flex items-center justify-between"
          onMouseDown={onMouseDownHeader}
          onTouchStart={onTouchStartHeader}
        >
          <div className="text-white text-lg font-semibold">Book an Appointment</div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-200 hover:border-white/20"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-slate-400 text-sm">
            One-to-one session to discuss your skills & career path. (Placeholder)
          </p>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Name" placeholder="Your name" />
            <Field label="Email" placeholder="you@example.com" />
            <Field label="Preferred time" placeholder="e.g., 6:00 PM IST" />
            <Field label="Notes" placeholder="What would you like to discuss?" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-2 text-slate-200"
            >
              Cancel
            </button>
            <button className="rounded-full bg-cyan-500 px-4 py-2 text-slate-950 font-semibold hover:bg-cyan-400">
              Request Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
