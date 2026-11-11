import React from "react";
import { AlertTriangle } from "lucide-react";

interface State {
  hasError: boolean;
}

export class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackMessage?: string },
  State
> {
  constructor(props: { children: React.ReactNode; fallbackMessage?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center bg-[#FAFAFA] border border-[#E5E7EB] p-6 text-center gap-2">
          <AlertTriangle className="w-6 h-6 text-[#C8102E]" />
          <p className="text-sm font-semibold text-[#171717]">
            {this.props.fallbackMessage || "İnteraktiv xəritə bu brauzerdə yüklənə bilmədi."}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
