import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface IntroSplashProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete, forcePlay = false }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroColumnRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);
  const titleMaskRef = useRef<HTMLDivElement>(null);
  const scanBeamRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const xrayGlowRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const symbolsGroupRef = useRef<HTMLDivElement>(null);
  const symbolRefs = useRef<(HTMLDivElement | null)[]>([]);

  const codeLetters = ['C', 'o', 'd', 'e'];
  const xrayLetters = ['X', 'r', 'a', 'y'];
  const codeLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const xrayLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const geminiOverlayRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
      
      // Light sweep & glow overlays
      gsap.set(shimmerRef.current, { opacity: 0, xPercent: -150 });
      gsap.set(xrayGlowRef.current, { opacity: 0, scale: 0.5 });

      // Hairline Typography Initial State (Font Weight 100, Opacity 1, No scale/position jump)
      codeLetterRefs.current.forEach((el) => {
        if (el) gsap.set(el, { opacity: 1, fontWeight: 100, scale: 1, y: 0, filter: 'blur(0px)' });
      });
      xrayLetterRefs.current.forEach((el) => {
        if (el) gsap.set(el, { opacity: 1, fontWeight: 100, scale: 1, y: 0, filter: 'blur(0px)' });
      });

      // Gemini gradient overlay on Xray (initially opacity 0 over chrome base)
      geminiOverlayRefs.current.forEach((el) => {
        if (el) gsap.set(el, { opacity: 0, fontWeight: 100, scale: 1 });
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

      // STAGE 2 & 3 (0.20s - 1.05s): Variable Stroke Weight Growth Wave (Left-to-Right)
      // Hairline (100) -> Thin (200) -> Medium (500) -> Ultra-Bold (900)
      const allLetters = [...codeLetterRefs.current, ...xrayLetterRefs.current];
      allLetters.forEach((letter, idx) => {
        if (!letter) return;
        masterTl.to(
          letter,
          {
            fontWeight: 900,
            duration: 0.45,
            ease: 'power2.inOut',
          },
          0.20 + idx * 0.06
        );
      });

      // Synchronize weight growth for Gemini overlay characters
      geminiOverlayRefs.current.forEach((overlay, idx) => {
        if (!overlay) return;
        masterTl.to(
          overlay,
          {
            fontWeight: 900,
            duration: 0.45,
            ease: 'power2.inOut',
          },
          0.20 + (codeLetters.length + idx) * 0.06
        );
      });

      // STAGE 5 (1.15s - 1.50s): Transition to Gemini Gradient & Soft Volumetric Pulse
      masterTl.to(
        xrayGlowRef.current,
        {
          opacity: 0.90,
          scale: 1.35,
          duration: 0.38,
          ease: 'sine.inOut',
        },
        1.15
      );

      // Gemini gradient flows smoothly through the stabilized "Xray" letters
      geminiOverlayRefs.current.forEach((overlay, idx) => {
        if (!overlay) return;
        masterTl.to(
          overlay,
          {
            opacity: 1,
            duration: 0.35,
            ease: 'power2.inOut',
          },
          1.15 + idx * 0.04
        );
      });

      masterTl.to(
        xrayGlowRef.current,
        {
          opacity: 0.40,
          scale: 1.0,
          duration: 0.45,
          ease: 'sine.inOut',
        },
        1.48
      );

      // Premium Light Reflection Sweep across the polished logo
      masterTl.to(
        shimmerRef.current,
        { opacity: 0.85, xPercent: -150, duration: 0.01 },
        1.35
      ).to(
        shimmerRef.current,
        {
          xPercent: 350,
          opacity: 0.95,
          duration: 0.42,
          ease: 'power2.inOut',
        },
        1.36
      ).to(
        shimmerRef.current,
        { opacity: 0, duration: 0.1 },
        1.78
      );

      // STAGE 6 (1.80s - 2.10s): Subtitle Tagline Reveal
      masterTl.to(
        taglineRef.current,
        {
          opacity: 0.90,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.42,
          ease: 'power3.out',
        },
        1.80
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

      // Sparks and Symbol Physics storage
      interface SparkParticle {
        el: HTMLDivElement;
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number; // 0 to 1
      }

      interface SymbolPhysics {
        el: HTMLDivElement;
        x: number;
        y: number;
        prevX: number;
        prevY: number;
        vx: number;
        vy: number;
        rotation: number;
        angularVel: number;
        scale: number;
        opacity: number;
        startX: number;
        startY: number;
        travelDist: number;
      }

      const activeSparks: SparkParticle[] = [];
      const symbolPhysicsList: SymbolPhysics[] = [];
      let physicsActive = false;
      let eraseExpansion = 0;

      // Canvas setup for particle reveal black overlay curtain
      if (maskCanvasRef.current) {
        const canvas = maskCanvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      const physicsTick = () => {
        if (!physicsActive) return;

        // Erase mask canvas at flying particle locations
        const canvas = maskCanvasRef.current;
        const ctx = canvas ? canvas.getContext('2d') : null;

        if (canvas && ctx) {
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;

          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';

          // A. Erase paths along flying symbols
          symbolPhysicsList.forEach((sp) => {
            const prevSx = cx + sp.prevX;
            const prevSy = cy + sp.prevY;
            const cSx = cx + sp.x;
            const cSy = cy + sp.y;

            // Soft feathered trail radius expanding organically from ~120px to ~220px
            const rad = 120 + Math.min(sp.travelDist * 0.35, 100);

            const grad = ctx.createRadialGradient(cSx, cSy, rad * 0.15, cSx, cSy, rad);
            grad.addColorStop(0, 'rgba(0,0,0,1)');
            grad.addColorStop(0.5, 'rgba(0,0,0,0.85)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cSx, cSy, rad, 0, Math.PI * 2);
            ctx.fill();

            // Connecting stroke between frames
            ctx.lineWidth = rad * 1.6;
            ctx.lineCap = 'round';
            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(prevSx, prevSy);
            ctx.lineTo(cSx, cSy);
            ctx.stroke();
          });

          // B. Erase spots along flying spark particles
          activeSparks.forEach((spark) => {
            const sx = cx + spark.x;
            const sy = cy + spark.y;
            const rad = 45;

            const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
            grad.addColorStop(0, 'rgba(0,0,0,0.95)');
            grad.addColorStop(0.6, 'rgba(0,0,0,0.5)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(sx, sy, rad, 0, Math.PI * 2);
            ctx.fill();
          });

          // C. Expanding organic reveal wash from center blast so 100% of curtain clears by ~4.85s
          eraseExpansion += 0.038;
          if (eraseExpansion > 0.15) {
            const expandRad = (eraseExpansion - 0.15) * Math.max(canvas.width, canvas.height) * 1.3;
            const expandGrad = ctx.createRadialGradient(cx, cy, expandRad * 0.25, cx, cy, expandRad);
            expandGrad.addColorStop(0, 'rgba(0,0,0,1)');
            expandGrad.addColorStop(0.7, 'rgba(0,0,0,0.85)');
            expandGrad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = expandGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, expandRad, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        // 1. Update Symbol Physics
        symbolPhysicsList.forEach((sp) => {
          sp.prevX = sp.x;
          sp.prevY = sp.y;

          const gravity = 0.45; // Gradual downward gravity
          const drag = 0.992; // Slow drag deceleration

          sp.vy += gravity;
          sp.vx *= drag;
          sp.vy *= drag;

          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.rotation += sp.angularVel;

          const dx = sp.x - sp.startX;
          const dy = sp.y - sp.startY;
          sp.travelDist = Math.sqrt(dx * dx + dy * dy);

          // Do not begin fading until symbol has traveled at least 300 pixels
          if (sp.travelDist >= 300) {
            sp.opacity = Math.max(0, sp.opacity - 0.032);
          }

          gsap.set(sp.el, {
            x: sp.x,
            y: sp.y,
            rotation: sp.rotation,
            scale: sp.scale, // Scale maintained within ±0% (constant size)
            opacity: sp.opacity,
            filter: 'blur(0px)',
          });
        });

        // 2. Update Spark Particles Physics
        for (let i = activeSparks.length - 1; i >= 0; i--) {
          const spark = activeSparks[i];
          spark.vy += 0.35; // Spark gravity
          spark.vx *= 0.96; // Spark drag
          spark.vy *= 0.96;
          spark.x += spark.vx;
          spark.y += spark.vy;
          spark.life -= 0.045; // Lifetime decay

          if (spark.life <= 0 || !spark.el.parentNode) {
            if (spark.el.parentNode) {
              spark.el.parentNode.removeChild(spark.el);
            }
            activeSparks.splice(i, 1);
          } else {
            gsap.set(spark.el, {
              x: spark.x,
              y: spark.y,
              opacity: Math.max(0, spark.life),
              scale: spark.life * 0.9,
            });
          }
        }
      };

      // 4.22s: FRAME-BY-FRAME PHYSICS RELEASE TRIGGER & PARTICLE REVEAL
      masterTl.add(() => {
        physicsActive = true;
        gsap.ticker.add(physicsTick);

        // Fade out intro hero text column so flying particles tear through curtain over homepage
        if (heroColumnRef.current) {
          gsap.to(heroColumnRef.current, {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.out',
          });
        }

        const omegaPerFrame = (4 * Math.PI) / 60; // Orbital angular velocity

        symbolRefs.current.forEach((sym, index) => {
          if (!sym) return;
          gsap.killTweensOf(sym); // Stop previous jitter/orbit tweens

          const pos = finalPositions[index] || { x: 0, y: 0, theta: 0 };
          const theta = pos.theta;

          // Compute exact tangential velocity from orbit ellipse
          const vxTangential = -Math.sin(theta) * rx * omegaPerFrame;
          const vyTangential = Math.cos(theta) * ry * omegaPerFrame;

          // Preserve tangential velocity with small ±10° random deviation
          const tangAngle = Math.atan2(vyTangential, vxTangential);
          const deviation = (Math.random() - 0.5) * (20 * Math.PI / 180); // ±10 deg
          const finalAngle = tangAngle + deviation;
          const speed = Math.sqrt(vxTangential * vxTangential + vyTangential * vyTangential);

          const vx = Math.cos(finalAngle) * speed;
          const vy = Math.sin(finalAngle) * speed;

          const z = Math.sin(theta);
          const initialScale = 1.0; // Maintain constant scale
          const initialOpacity = 0.85 + (z + 1) * 0.075;
          const initialRotation = (orbitObj.angle * 100) / Math.PI + index * 36;
          const angularVel = (index % 2 === 0 ? 1 : -1) * (3.5 + Math.random() * 2.5);

          symbolPhysicsList.push({
            el: sym,
            x: pos.x,
            y: pos.y,
            prevX: pos.x,
            prevY: pos.y,
            vx,
            vy,
            rotation: initialRotation,
            angularVel,
            scale: initialScale,
            opacity: Math.min(1.0, initialOpacity),
            startX: pos.x,
            startY: pos.y,
            travelDist: 0,
          });

          // Generate 6-10 tiny sparks at release point
          const sparkCount = 8 + Math.floor(Math.random() * 3);
          const parentContainer = symbolsGroupRef.current;
          if (parentContainer) {
            for (let k = 0; k < sparkCount; k++) {
              const sparkEl = document.createElement('div');
              sparkEl.className =
                'absolute w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(56,189,248,0.95)] pointer-events-none z-30';
              parentContainer.appendChild(sparkEl);

              const sparkAngle = finalAngle + (Math.random() - 0.5) * (80 * Math.PI / 180);
              const sparkSpeed = speed * (1.1 + Math.random() * 1.2);
              const sparkVx = Math.cos(sparkAngle) * sparkSpeed;
              const sparkVy = Math.sin(sparkAngle) * sparkSpeed - 2;

              gsap.set(sparkEl, { x: pos.x, y: pos.y, opacity: 1, scale: 1 });

              activeSparks.push({
                el: sparkEl,
                x: pos.x,
                y: pos.y,
                vx: sparkVx,
                vy: sparkVy,
                life: 1.0,
              });
            }
          }
        });
      }, 4.22);

      // 4.88s: End physics tick and unmount overlay
      masterTl.add(() => {
        physicsActive = false;
        gsap.ticker.remove(physicsTick);
      }, 4.88);
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
      className="fixed inset-0 z-[9999] text-white flex flex-col items-center justify-center overflow-hidden select-none pointer-events-none"
    >
      {/* Full-Screen Black Curtain Canvas Mask */}
      <canvas
        ref={maskCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Hero Text & Glow Column (Fades out at blast release so particles tear through curtain) */}
      <div
        ref={heroColumnRef}
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl mx-auto"
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

        {/* Soft Volumetric Background Pulse centered behind logo */}
        <div
          ref={xrayGlowRef}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(66,133,244,0.75), rgba(109,94,249,0.75), rgba(168,85,247,0.7), rgba(217,70,239,0.65))',
          }}
        />

        {/* 2. Main Hero Logo: "CodeXray" (Liquid Metal Formation) */}
        <div className="relative z-10 mb-4 py-2 overflow-hidden">
          {/* Light Sweep / Shimmer overlay */}
          <div
            ref={shimmerRef}
            className="absolute top-0 bottom-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 z-25 pointer-events-none"
          />

          <div className="relative z-20">
            <h1 className="text-[3.6rem] sm:text-[5.8rem] md:text-[6.6rem] leading-none tracking-tight font-sans flex items-center justify-center">
              {/* Variable Weight "Code" */}
              <span className="inline-flex drop-shadow-[0_4px_35px_rgba(255,255,255,0.55)]">
                {codeLetters.map((char, index) => (
                  <span
                    key={`code-let-${index}`}
                    ref={(el) => { codeLetterRefs.current[index] = el; }}
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-[#FFFFFF] via-[#E2E8F0] via-[#CBD5E1] to-[#64748B]"
                  >
                    {char}
                  </span>
                ))}
              </span>

              {/* Variable Weight -> Gemini Gradient "Xray" */}
              <span className="relative inline-flex px-2 drop-shadow-[0_0_40px_rgba(109,94,249,0.7)]">
                {/* Base Polished Chrome Layer */}
                {xrayLetters.map((char, index) => (
                  <span
                    key={`xray-base-${index}`}
                    ref={(el) => { xrayLetterRefs.current[index] = el; }}
                    className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-[#FFFFFF] via-[#E2E8F0] via-[#CBD5E1] to-[#64748B]"
                  >
                    {char}
                  </span>
                ))}

                {/* Overlaid Gemini Gradient Layer (flows organically over chrome once stabilized) */}
                <span className="absolute inset-0 flex items-center justify-center px-2 pointer-events-none">
                  {xrayLetters.map((char, index) => (
                    <span
                      key={`xray-gemini-${index}`}
                      ref={(el) => { geminiOverlayRefs.current[index] = el; }}
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
      </div>

      {/* 4. 3D Orbiting AI Symbols (Stays 100% visible during blast reveal over homepage) */}
      <div className="relative z-20 w-[440px] h-[440px] flex items-center justify-center pointer-events-none -mt-16">
        {/* 5 Original Futuristic AI Symbols Group */}
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


