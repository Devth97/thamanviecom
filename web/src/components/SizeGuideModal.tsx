"use client";
import { useState } from "react";
import { X, Ruler } from "lucide-react";

export default function SizeGuideModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-[#8B1A1A] underline underline-offset-2 hover:text-[#B8860B] transition-colors"
      >
        <Ruler className="h-3.5 w-3.5" />
        Size Guide & Draping Guide
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-[#E8DDD0] px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="font-display text-xl text-[#0D0808]">Saree Size & Draping Guide</h2>
              <button onClick={() => setOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#F5EDE0] transition-colors">
                <X className="h-4 w-4 text-[#666]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Saree Length by Height */}
              <div>
                <h3 className="font-semibold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs flex items-center justify-center">1</span>
                  Recommended Saree Length by Height
                </h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#F5EDE0]">
                      <th className="text-left px-3 py-2 font-semibold text-[#1A1A1A] border border-[#E8DDD0]">Your Height</th>
                      <th className="text-left px-3 py-2 font-semibold text-[#1A1A1A] border border-[#E8DDD0]">Recommended Length</th>
                      <th className="text-left px-3 py-2 font-semibold text-[#1A1A1A] border border-[#E8DDD0]">Width</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Below 5'2\"", "5.5 metres", "42–44 inches"],
                      ["5'2\" – 5'6\"", "6 metres", "44–46 inches"],
                      ["Above 5'6\"", "6.5 metres", "46–48 inches"],
                    ].map(([h, l, w]) => (
                      <tr key={h} className="border border-[#E8DDD0]">
                        <td className="px-3 py-2 text-[#444]">{h}</td>
                        <td className="px-3 py-2 text-[#1A1A1A] font-medium">{l}</td>
                        <td className="px-3 py-2 text-[#666]">{w}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[11px] text-[#888] mt-2">All Thamanvi sarees are 6 metres unless specified. Extra length available on request.</p>
              </div>

              {/* Blouse Piece */}
              <div>
                <h3 className="font-semibold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs flex items-center justify-center">2</span>
                  Blouse Piece Guide
                </h3>
                <div className="bg-[#FAF6F0] rounded-lg p-4 space-y-2 text-sm text-[#444]">
                  <p>✓ Most Thamanvi sarees include a <strong>0.8m matching blouse piece</strong></p>
                  <p>✓ Standard blouse piece covers sizes up to <strong>bust 40 inches</strong></p>
                  <p>✓ For bust above 40 inches, request extra blouse piece (₹200–₹400)</p>
                  <p>✓ Blouse stitching available at our Puttur store for local customers</p>
                </div>
              </div>

              {/* Draping Styles */}
              <div>
                <h3 className="font-semibold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs flex items-center justify-center">3</span>
                  Common Draping Styles
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { style: "Nivi (South Indian)", length: "5.5–6m", note: "Most common, shows pallu fully" },
                    { style: "Bengali Style", length: "6–6.5m", note: "Worn without pleats at front" },
                    { style: "Gujarati Style", length: "5.5m", note: "Pallu draped from front" },
                    { style: "Kodagu Style", length: "6m", note: "Karnataka traditional style" },
                  ].map(({ style, length, note }) => (
                    <div key={style} className="border border-[#E8DDD0] rounded-lg p-3">
                      <p className="font-semibold text-[#1A1A1A] text-xs">{style}</p>
                      <p className="text-[#8B1A1A] text-xs mt-0.5">{length}</p>
                      <p className="text-[#888] text-[10px] mt-1">{note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Care */}
              <div>
                <h3 className="font-semibold text-sm text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs flex items-center justify-center">4</span>
                  Pure Silk Care Instructions
                </h3>
                <div className="space-y-1.5 text-sm text-[#444]">
                  {[
                    "Dry clean only for pure silk and zari sarees",
                    "Hand wash gently in cold water for cotton varieties",
                    "Never wring or twist — pat dry with a soft towel",
                    "Store folded with tissue paper to prevent zari tarnish",
                    "Air in shade, never direct sunlight",
                  ].map(tip => (
                    <p key={tip} className="flex items-start gap-2">
                      <span className="text-[#B8860B] shrink-0">◆</span>
                      {tip}
                    </p>
                  ))}
                </div>
              </div>

              {/* Help CTA */}
              <div className="bg-[#0D0808] rounded-lg p-4 text-center">
                <p className="text-white text-sm mb-2">Need help choosing the right saree?</p>
                <a
                  href="https://wa.me/919535779597?text=Hi! I need help choosing a saree. Can you guide me?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#1da851] transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.534 5.867L.057 23.63a.5.5 0 0 0 .609.63l5.939-1.56A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 0 1-5.186-1.452l-.371-.22-3.525.927.934-3.432-.241-.383A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  Chat with our silk expert
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
