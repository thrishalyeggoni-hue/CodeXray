import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface IntroSplashProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete, forcePlay = false }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);
  const titleMaskRef = useRef<HTMLDivElement>(null);
  const scanBeamRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const xrayGlowRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const symbolsGroupRef = useRef<HTMLDivElement>(null);
  const symbolRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  const codeLetters = ['C', 'o', 'd', 'e'];
  const xrayLetters = ['X', 'r', 'a', 'y'];
  const codeLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const xrayLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    // Prevent scrolling while overlay is active
    document.body.style.overflow = 'hidden';

    // GSAP Context & Master Timeline setup
    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          setIsVisible(false);
          onComplete?.();
        },
      });

      // ----------------------------------------------------
      // INITIAL STATES (0.00s)
      // ----------------------------------------------------
      gsap.set(containerRef.current, { opacity: 1, x: 0, y: 0 });
      gsap.set(ambientGlowRef.current, { opacity: 0, scale: 0.6 });
      
      // Laser scan beam & title clip-path
      gsap.set(titleMaskRef.current, { clipPath: 'inset(0% 100% 0% 0%)', opacity: 1 });
      gsap.set(scanBeamRef.current, { left: '0%', opacity: 0 });
      gsap.set(shimmerRef.current, { opacity: 0, xPercent: -150 });
      gsap.set(xrayGlowRef.current, { opacity: 0, scale: 0.5 });

      // Letter-by-letter initial state
      codeLetterRefs.current.forEach((el) => {
        if (el) gsap.set(el, { opacity: 0, scale: 0.85, filter: 'blur(6px)' });
      });
      xrayLetterRefs.current.forEach((el) => {
        if (el) gsap.set(el, { opacity: 0, scale: 0.85, filter: 'blur(6px)' });
      });

      // Tagline
      gsap.set(taglineRef.current, { opacity: 0, y: 16, filter: 'blur(4px)' });

      // Orbit area & symbols group
      gsap.set(symbolsGroupRef.current, { opacity: 0 });

      // 5 Symbol Initial Placements
      symbolRefs.current.forEach((sym, index) => {
        if (!sym) return;
        const initX = (index - 2) * 75;
        gsap.set(sym, {
          x: initX,
          y: 0,
          opacity: 0,
          scale: 0.7,
          rotation: 0,
          filter: 'blur(4px)',
        });
      });

      // Light trails initial
      trailRefs.current.forEach((tr) => {
        if (!tr) return;
        gsap.set(tr, { opacity: 0, scale: 0 });
      });

      // Spark Particles initial
      particleRefs.current.forEach((pt) => {
        if (!pt) return;
        gsap.set(pt, { x: 0, y: 0, opacity: 0, scale: 0 });
      });

      // ----------------------------------------------------
      // TIMELINE SEQUENCE (~4.20s TOTAL)
      // ----------------------------------------------------

      // STAGE 1 (0.20s): Deep ambient radial blue glow appears
      masterTl.to(
        ambientGlowRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: 'power2.out',
        },
        0.20
      );

      // STAGE 2 (0.45s - 0.95s): Laser Scanning Beam sweeps across "CodeXray"
      masterTl.to(
        scanBeamRef.current,
        {
          opacity: 1,
          duration: 0.08,
          ease: 'power1.out',
        },
        0.45
      );

      const scanObj = { progress: 0 };
      masterTl.to(
        scanObj,
        {
          progress: 100,
          duration: 0.50,
          ease: 'power2.inOut',
          onUpdate: () => {
            const val = scanObj.progress;
            if (titleMaskRef.current) {
              gsap.set(titleMaskRef.current, {
                clipPath: `inset(0% ${100 - val}% 0% 0%)`,
              });
            }
            if (scanBeamRef.current) {
              gsap.set(scanBeamRef.current, {
                left: `${val}%`,
              });
            }
          },
        },
        0.45
      );

      // STAGE 3 (0.48s - 0.88s): Letter-by-letter staggered activation
      const allLetterEls = [...codeLetterRefs.current, ...xrayLetterRefs.current];
      allLetterEls.forEach((letter, idx) => {
        if (!letter) return;
        masterTl.to(
          letter,
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.28,
            ease: 'back.out(1.4)',
          },
          0.48 + idx * 0.042
        );
      });

      masterTl.to(
        scanBeamRef.current,
        {
          opacity: 0,
          duration: 0.12,
          ease: 'power2.out',
        },
        0.97
      );

      // STAGE 4 (0.95s - 1.35s): Gemini Gradient Energy Activation
      masterTl.to(
        xrayGlowRef.current,
        {
          opacity: 0.90,
          scale: 1.35,
          duration: 0.38,
          ease: 'sine.inOut',
        },
        0.95
      ).to(
        xrayGlowRef.current,
        {
          opacity: 0.40,
          scale: 1.0,
          duration: 0.45,
          ease: 'sine.inOut',
        },
        1.33
      );

      // STAGE 5 (1.30s - 1.65s): Premium Light Sweep / Shimmer Across Logo
      masterTl.to(
        shimmerRef.current,
        { opacity: 0.85, xPercent: -150, duration: 0.01 },
        1.30
      ).to(
        shimmerRef.current,
        {
          xPercent: 350,
          opacity: 0.95,
          duration: 0.42,
          ease: 'power2.inOut',
        },
        1.31
      ).to(
        shimmerRef.current,
        { opacity: 0, duration: 0.1 },
        1.70
      );

      // STAGE 6 (1.65s - 1.95s): Soft Glow Pulse
      masterTl.to(
        xrayGlowRef.current,
        {
          opacity: 0.70,
          scale: 1.18,
          duration: 0.22,
          ease: 'sine.out',
        },
        1.65
      ).to(
        xrayGlowRef.current,
        {
          opacity: 0.38,
          scale: 1.0,
          duration: 0.3,
          ease: 'sine.in',
        },
        1.87
      );

      // STAGE 7 (1.95s - 2.35s): Tagline Reveal
      masterTl.to(
        taglineRef.current,
        {
          opacity: 0.90,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.42,
          ease: 'power3.out',
        },
        1.95
      );

      // 2.20s: 5 Symbols appear with staggered entry
      masterTl.to(
        symbolsGroupRef.current,
        {
          opacity: 1,
          duration: 0.2,
          ease: 'power2.out',
        },
        2.20
      );

      symbolRefs.current.forEach((sym, idx) => {
        if (!sym) return;
        masterTl.to(
          sym,
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.35,
            ease: 'back.out(1.6)',
          },
          2.20 + idx * 0.05
        );
      });

      // 2.45s - 4.05s: EXTENDED 3D TILTED ORBIT around EMPTY SPACE (~1.6 seconds)
      // Radius: X = 175px, Y = 62px (3D Perspective tilted ring for larger symbols)
      const rx = 175;
      const ry = 62;
      const orbitObj = { angle: 0 };
      const symbolCount = 5;

      // Object to store final release positions & angles of symbols
      const finalPositions: { x: number; y: number; theta: number }[] = [
        { x: 0, y: 0, theta: 0 },
        { x: 0, y: 0, theta: 0 },
        { x: 0, y: 0, theta: 0 },
        { x: 0, y: 0, theta: 0 },
        { x: 0, y: 0, theta: 0 },
      ];

      masterTl.to(
        orbitObj,
        {
          angle: Math.PI * 2 * 3.2, // 3.2 full rotations for elegant prolonged orbit
          duration: 1.60,
          ease: 'power1.inOut',
          onUpdate: () => {
            const currentAngle = orbitObj.angle;
            symbolRefs.current.forEach((sym, index) => {
              if (!sym) return;
              const theta = currentAngle + (index * Math.PI * 2) / symbolCount;
              const x = Math.cos(theta) * rx;
              const y = Math.sin(theta) * ry;

              // Save last calculated position for release transition
              finalPositions[index] = { x, y, theta };

              // Depth z ranges from -1 (far back) to +1 (front)
              const z = Math.sin(theta);
              const scale = 1.0 + z * 0.15; // Front: 1.15x, Back: 0.85x
              const opacity = 0.72 + (z + 1) * 0.14; // Front: 1.0, Back: 0.72
              const blurVal = z < 0 ? Math.abs(z) * 1.5 : 0;
              const zIndex = Math.round((z + 1) * 10);

              gsap.set(sym, {
                x: x,
                y: y,
                scale: scale,
                opacity: opacity,
                zIndex: zIndex,
                rotation: (currentAngle * 100) / Math.PI + index * 36, // Self axis rotation
                filter: `blur(${blurVal}px)`,
              });
            });
          },
        },
        2.45
      );

      // 4.05s - 4.22s: ENERGY ACCELERATION & VIBRATION (170ms Jitter)
      symbolRefs.current.forEach((sym) => {
        if (!sym) return;
        masterTl.to(
          sym,
          {
            x: '+=3',
            y: '-=3',
            duration: 0.04,
            repeat: 3,
            yoyo: true,
            ease: 'sine.inOut',
          },
          4.05
        );
      });

      // 4.22s - 4.95s: EXPLOSIVE BURST & GRAVITY FALL TRANSITION
      symbolRefs.current.forEach((sym, index) => {
        if (!sym) return;
        const pos = finalPositions[index];
        const releaseAngle = pos.theta;

        // Random organic physical variations
        const jumpDist = 150 + (index % 3) * 25; // Instant outward explosion impulse
        const jumpX = pos.x + Math.cos(releaseAngle) * jumpDist;
        const jumpY = pos.y + Math.sin(releaseAngle) * jumpDist - 35; // Initial upward/outward force arc

        const fallGravityY = jumpY + 420 + (index % 2) * 60; // Downward acceleration under gravity
        const fallDriftX = jumpX + Math.cos(releaseAngle) * 90; // Natural momentum continuation
        const spinAmount = (index % 2 === 0 ? 380 : -380) + (index * 45); // Spin while tumbling

        // Animate light trail burst
        const trail = trailRefs.current[index];
        if (trail) {
          gsap.set(trail, {
            x: pos.x,
            y: pos.y,
            rotation: (releaseAngle * 180) / Math.PI,
            opacity: 0.9,
            scaleX: 0.2,
            scaleY: 0.8,
          });

          masterTl.to(
            trail,
            {
              x: jumpX,
              y: jumpY,
              scaleX: 3.2,
              scaleY: 0.15,
              opacity: 0.7,
              duration: 0.18,
              ease: 'expo.out',
            },
            4.22
          ).to(
            trail,
            {
              x: fallDriftX,
              y: fallGravityY,
              opacity: 0,
              scaleX: 0.1,
              duration: 0.48,
              ease: 'power2.in',
            },
            4.40
          );
        }

        // 1. Sudden Explosive Jump Outward (4.22s -> 4.40s)
        masterTl.to(
          sym,
          {
            x: jumpX,
            y: jumpY,
            scale: 1.25, // Brief surge in scale on explosion
            opacity: 1,
            rotation: `+=${spinAmount * 0.35}`,
            filter: 'blur(0px)',
            duration: 0.18,
            ease: 'expo.out',
          },
          4.22
        );

        // 2. Momentum Loss & Gravity Fall Downward with Spin (4.40s -> 4.90s)
        masterTl.to(
          sym,
          {
            x: fallDriftX,
            y: fallGravityY,
            scale: 0.4,
            opacity: 0,
            rotation: `+=${spinAmount * 0.65}`,
            filter: 'blur(10px)',
            duration: 0.50,
            ease: 'power2.in',
          },
          4.40
        );
      });

      // Spark Particles scatter along outward energy paths
      particleRefs.current.forEach((pt, idx) => {
        if (!pt) return;
        const angle = (idx * Math.PI * 2) / 10;
        const dist = 240 + (idx % 3) * 60;
        const destX = Math.cos(angle) * dist;
        const destY = Math.sin(angle) * dist + 150; // Gravity curve for sparks

        masterTl.to(
          pt,
          {
            x: destX,
            y: destY,
            scale: 1.3,
            opacity: 1,
            duration: 0.16,
            ease: 'expo.out',
          },
          4.22
        ).to(
          pt,
          {
            scale: 0,
            opacity: 0,
            duration: 0.42,
            ease: 'power2.in',
          },
          4.38
        );
      });

      // 4.55s - 4.90s: Seamless Reveal of Homepage as symbols dissolve
      masterTl.to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.38,
          ease: 'power3.inOut',
        },
        4.52
      );
    }, containerRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, [forcePlay, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center overflow-hidden select-none pointer-events-auto"
      style={{
        backgroundColor: '#000000',
        willChange: 'transform, opacity',
      }}
    >
      {/* 1. Deep Ambient Radial Volumetric Blue/Purple Glow */}
      <div
        ref={ambientGlowRef}
        className="absolute w-[950px] h-[950px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(66, 133, 244, 0.32) 0%, rgba(109, 94, 249, 0.18) 38%, rgba(217, 70, 239, 0.05) 60%, rgba(0,0,0,0) 75%)',
          willChange: 'transform, opacity',
        }}
      />

      {/* Main Content Center Column */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl mx-auto">
        {/* Soft Volumetric Background Pulse centered behind logo */}
        <div
          ref={xrayGlowRef}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(66,133,244,0.75), rgba(109,94,249,0.75), rgba(168,85,247,0.7), rgba(217,70,239,0.65))',
          }}
        />

        {/* 2. Main Hero Logo: "CodeXray" (-13% size reduction for perfect composition) */}
        <div className="relative z-10 mb-4 py-2 overflow-hidden">
          {/* Laser Scanning Beam Line */}
          <div
            ref={scanBeamRef}
            className="absolute top-0 bottom-0 w-[4px] bg-cyan-200 shadow-[0_0_25px_8px_rgba(56,189,248,0.95)] z-30 pointer-events-none"
          />

          {/* Light Sweep / Shimmer overlay */}
          <div
            ref={shimmerRef}
            className="absolute top-0 bottom-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 z-25 pointer-events-none"
          />

          <div ref={titleMaskRef} className="relative z-20">
            <h1 className="text-[3.6rem] sm:text-[5.8rem] md:text-[6.6rem] leading-none font-black tracking-tight font-sans flex items-center justify-center">
              {/* Metallic Light-Reflective White "Code" */}
              <span className="inline-flex font-extrabold drop-shadow-[0_4px_30px_rgba(255,255,255,0.5)]">
                {codeLetters.map((char, index) => (
                  <span
                    key={`code-let-${index}`}
                    ref={(el) => { codeLetterRefs.current[index] = el; }}
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-300"
                  >
                    {char}
                  </span>
                ))}
              </span>
              {/* Animated Glowing Gemini Gradient "Xray" */}
              <span className="inline-flex px-2 drop-shadow-[0_0_40px_rgba(109,94,249,0.7)]">
                {xrayLetters.map((char, index) => (
                  <span
                    key={`xray-let-${index}`}
                    ref={(el) => { xrayLetterRefs.current[index] = el; }}
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#4285F4] via-[#5B8CFF] via-[#6D5EF9] via-[#A855F7] to-[#D946EF]"
                    style={{
                      backgroundSize: '200% 200%',
                      animation: 'geminiGradientShift 3.2s ease infinite',
                    }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </h1>
          </div>
        </div>

        {/* 3. Subtitle Tagline */}
        <div ref={taglineRef} className="relative z-10 mb-16">
          <p className="text-sm sm:text-base md:text-lg font-bold text-white/90 tracking-[0.28em] uppercase font-mono drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
            Understand Code. Don&apos;t Just Copy It.
          </p>
        </div>

        {/* 4. 3D Orbiting AI Symbols around EMPTY CENTER Space */}
        <div className="relative w-[440px] h-[440px] flex items-center justify-center">
          {/* Light Motion Trails (5 elements matching symbols) */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`trail-${i}`}
              ref={(el) => { trailRefs.current[i] = el; }}
              className="absolute w-44 h-8 rounded-full blur-sm bg-gradient-to-r from-blue-400 via-cyan-300 to-transparent pointer-events-none z-10"
            />
          ))}

          {/* Spark Particles Scatter (10 elements) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={`spark-${i}`}
                ref={(el) => { particleRefs.current[i] = el; }}
                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-200 shadow-[0_0_14px_5px_rgba(56,189,248,0.95)]"
              />
            ))}
          </div>

          {/* 5 Original Futuristic AI Symbols Group (NO center object - completely clean empty orbit center) */}
          <div ref={symbolsGroupRef} className="relative w-full h-full flex items-center justify-center">
            {/* Symbol 1: Code Matrix Node */}
            <div
              ref={(el) => { symbolRefs.current[0] = el; }}
              className="absolute w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-950/95 border-2 border-blue-400/80 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(66,133,244,0.75)]"
            >
              <svg className="w-8 h-8 sm:w-9 sm:h-9 text-blue-400 drop-shadow-[0_0_10px_rgba(66,133,244,0.9)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.2" fill="#5B8CFF" />
              </svg>
            </div>

            {/* Symbol 2: Gemini AI Spark */}
            <div
              ref={(el) => { symbolRefs.current[1] = el; }}
              className="absolute w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-950/95 border-2 border-indigo-400/80 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(109,94,249,0.75)]"
            >
              <svg className="w-8 h-8 sm:w-9 sm:h-9 text-indigo-400 drop-shadow-[0_0_10px_rgba(109,94,249,0.9)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
              </svg>
            </div>

            {/* Symbol 3: X-Ray Scan Data Hexagon */}
            <div
              ref={(el) => { symbolRefs.current[2] = el; }}
              className="absolute w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-950/95 border-2 border-cyan-400/80 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.75)]"
            >
              <svg className="w-8 h-8 sm:w-9 sm:h-9 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <line x1="7" y1="12" x2="17" y2="12" stroke="#38BDF8" strokeWidth="1.8" strokeDasharray="2 2" />
              </svg>
            </div>

            {/* Symbol 4: Intelligence Delta Circuit */}
            <div
              ref={(el) => { symbolRefs.current[3] = el; }}
              className="absolute w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-950/95 border-2 border-purple-400/80 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.75)]"
            >
              <svg className="w-8 h-8 sm:w-9 sm:h-9 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 3l10 18H2L12 3z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="14" r="2.2" fill="#C084FC" />
              </svg>
            </div>

            {/* Symbol 5: Quantum Data Core */}
            <div
              ref={(el) => { symbolRefs.current[4] = el; }}
              className="absolute w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-950/95 border-2 border-pink-400/80 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(217,70,239,0.75)]"
            >
              <svg className="w-8 h-8 sm:w-9 sm:h-9 text-pink-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.9)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="9" strokeOpacity="0.5" />
                <circle cx="12" cy="12" r="5" stroke="#F472B6" />
                <circle cx="12" cy="12" r="2.2" fill="#F472B6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Global Inline Keyframe for moving gradient text */}
      <style>{`
        @keyframes geminiGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};


