import { Image } from "lucide-react";
import type { JSX } from "react";

/**
 * Renders a grammar SVG infographic or a fallback placeholder.
 */
export function renderSVGInfographic(imgStr: string): JSX.Element {
  if (imgStr.startsWith("data:image/svg+xml")) {
    return (
      <div
        className="w-full max-w-lg mx-auto rounded-xl overflow-hidden shadow-sm flex justify-center [&_svg]:max-h-[160px] md:[&_svg]:max-h-[220px] [&_svg]:w-auto [&_svg]:h-full [&_svg]:mx-auto"
        dangerouslySetInnerHTML={{
          __html: decodeURIComponent(
            imgStr.replace("data:image/svg+xml;utf8,", "")
          ),
        }}
      />
    );
  }

  // Modern styled fallback
  return (
    <div className="w-full max-w-lg mx-auto border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-xl py-6 px-4 flex flex-col items-center justify-center min-h-[140px]">
      <Image className="w-10 h-10 text-slate-400/80 mb-2 stroke-[1.5]" />
      <span className="font-mono text-[10px] text-slate-400 font-medium tracking-wide">
        Ref: {imgStr || "https://example.com/presentsimple.png"}
      </span>
    </div>
  );
}
