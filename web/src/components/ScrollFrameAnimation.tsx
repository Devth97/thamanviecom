"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TOTAL_FRAMES = 60;
const FRAME_PATH = (n: number) =>
  `/frames/frame_${String(n).padStart(3, "0")}.jpg`;

export default function ScrollFrameAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Set canvas size
    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    // Preload all frames
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    const drawFrame = (index: number) => {
      const img = framesRef.current[index];
      if (!img || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cover fit — maintain aspect ratio
      const scale = Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      );
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    };

    const onAllLoaded = () => {
      drawFrame(0);

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const frameIndex = Math.min(
            Math.floor(self.progress * (TOTAL_FRAMES - 1)),
            TOTAL_FRAMES - 1
          );
          if (frameIndex !== currentFrameRef.current) {
            currentFrameRef.current = frameIndex;
            drawFrame(frameIndex);
          }
        },
      });
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) onAllLoaded();
      };
      images.push(img);
    }
    framesRef.current = images;

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    /* Tall section — scroll distance controls playback speed */
    <div ref={sectionRef} className="relative h-[400vh]">
      {/* Sticky canvas — stays in view while section scrolls */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0D0808]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        />

        {/* Overlay text that fades during scroll */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 pointer-events-none">
          <div className="text-center">
            <p className="text-[#B8860B] text-xs tracking-[0.3em] uppercase mb-3">
              The Craft
            </p>
            <h2 className="font-display text-4xl md:text-6xl text-white italic">
              Woven in Gold
            </h2>
            <p className="text-white/50 text-sm mt-3 tracking-wide">
              Scroll to witness the silk unfurl
            </p>
          </div>
        </div>

        {/* Gradient overlay — bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D0808] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
