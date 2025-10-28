// app/ClientErrorBoundary.tsx
"use client";
import { Component, ReactNode } from "react";

export default class ClientErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: unknown) { console.error("[UI Crash]", err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm text-rose-300">
          Something went wrong. Please refresh. If it persists, try clearing cached data.
        </div>
      );
    }
    return this.props.children;
  }
}
