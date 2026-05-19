import {useEffect, useRef} from "react";

function PalmBackground({ showLeaves = true }) {
  const canvasRef = useRef(null);
  const showLeavesRef = useRef(showLeaves);

  useEffect(() => {
    showLeavesRef.current = showLeaves;
  }, [showLeaves]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Mouse coordinates with easing
    const mouse = {
      x: null,
      y: null,
      targetX: null,
      targetY: null,
      radius: 120,
    };

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = null;
      mouse.targetY = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Dynamic background particles
    const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
    const particles = [];

    class AmbientParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -Math.random() * 0.5 - 0.1; // slow float up
        this.size = Math.random() * 2 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.15;
        this.color = Math.random() > 0.5 ? "#b5cc6a" : "#4a8c32";
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 1.5;
            this.y += (dy / dist) * force * 1.5;
          }
        }

        // Wrap around
        if (this.y < 0) this.y = canvas.height;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize ambient particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new AmbientParticle());
    }

    // Glowing Pulse along Palm Tree
    class DataPulse {
      constructor(path, speed = 1.5) {
        this.path = path; // Array of {x, y} points
        this.progress = 0; // Index / position along path
        this.speed = speed;
        this.size = Math.random() * 2 + 1.5;
        this.color = "#b5cc6a";
      }

      update() {
        this.progress += this.speed;
        if (this.progress >= this.path.length) {
          return false; // completed
        }
        return true;
      }

      draw() {
        const index = Math.floor(this.progress);
        if (index >= this.path.length) return;
        const pt = this.path[index];

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    let pulses = [];

    // Animation Loop
    let time = 0;
    const animate = () => {
      time += 0.005;

      // Dark futuristic gradient background (Nvidia style but green/dark forest)
      const grad = ctx.createRadialGradient(
        canvas.width * 0.75, canvas.height * 0.5, 10,
        canvas.width * 0.75, canvas.height * 0.5, canvas.width
      );
      grad.addColorStop(0, "#0e2410"); // deep dark green
      grad.addColorStop(0.5, "#08150a"); // even darker green
      grad.addColorStop(1, "#030804"); // black-green
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add a subtle rotating grid overlay
      ctx.save();
      ctx.strokeStyle = "rgba(74, 140, 50, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Ease mouse coordinates
      if (mouse.targetX !== null && mouse.targetY !== null) {
        if (mouse.x === null) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.1;
          mouse.y += (mouse.targetY - mouse.y) * 0.1;
        }
      } else {
        mouse.x = null;
        mouse.y = null;
      }

      if (showLeavesRef.current) {
        // Generate Two Joined Leaves Coordinates dynamically
        const isMobile = canvas.width < 768;
        const baseX = isMobile ? canvas.width * 0.5 : canvas.width * 0.82;
        const baseY = canvas.height * 0.95;
        const stemHeight = isMobile ? canvas.height * 0.35 : canvas.height * 0.45;

        // Gentle swaying effect
        const sway = Math.sin(time * 0.8) * 10;
        const stemTopX = baseX + sway;
        const stemTopY = baseY - stemHeight;

        // Calculate stem (trunk) coordinates
        const stemPoints = [];
        const stemSegments = 10;
        for (let i = 0; i <= stemSegments; i++) {
          const t = i / stemSegments;
          const cx = baseX * (1 - t) + stemTopX * t;
          const cy = baseY * (1 - t) + stemTopY * t;

          // Apply mouse repulsion to stem nodes
          let finalX = cx;
          let finalY = cy;
          if (mouse.x !== null && mouse.y !== null) {
            const dx = cx - mouse.x;
            const dy = cy - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius * 1.5) {
              const force = (mouse.radius * 1.5 - dist) / (mouse.radius * 1.5);
              finalX += (dx / dist) * force * 15;
              finalY += (dy / dist) * force * 5;
            }
          }
          stemPoints.push({ x: finalX, y: finalY });
        }

        // Generate 2 Leaves joined at the stem top
        const leafConfigs = [
          {
            // Left leaf: curves up and left
            angle: -Math.PI * 0.65,
            curve: -0.25,
            leafLength: isMobile ? 130 : 220,
            maxWidth: isMobile ? 32 : 55,
          },
          {
            // Right leaf: curves up and right
            angle: -Math.PI * 0.35,
            curve: 0.25,
            leafLength: isMobile ? 130 : 220,
            maxWidth: isMobile ? 32 : 55,
          }
        ];

        const leafSway = Math.sin(time * 0.5) * 0.05;
        const allLeafPaths = []; // stores midrib paths
        const allLeafLeftMargins = [];
        const allLeafRightMargins = [];

        leafConfigs.forEach((config) => {
          const midribPoints = [];
          const leftMarginPoints = [];
          const rightMarginPoints = [];
          
          const baseAngle = config.angle + leafSway;
          const leafSegments = 12;

          for (let i = 0; i <= leafSegments; i++) {
            const t = i / leafSegments;
            
            // Leaf curves along its length
            const currentAngle = baseAngle + config.curve * t;
            const dist = t * config.leafLength;
            
            let mx = stemTopX + Math.cos(currentAngle) * dist;
            let my = stemTopY + Math.sin(currentAngle) * dist;

            // Droop curve
            const arch = Math.pow(t, 2) * (isMobile ? 15 : 30);
            my += arch;

            // Mouse repulsion on midrib
            if (mouse.x !== null && mouse.y !== null) {
              const dx = mx - mouse.x;
              const dy = my - mouse.y;
              const distMouse = Math.sqrt(dx * dx + dy * dy);
              if (distMouse < mouse.radius) {
                const force = (mouse.radius - distMouse) / mouse.radius;
                mx += (dx / distMouse) * force * 15;
                my += (dy / distMouse) * force * 15;
              }
            }

            // Perpendicular angle for width
            const perpAngle = currentAngle + Math.PI / 2;
            
            // Leaf width: starts at 0, peaks in the middle, tapers at the tip
            const widthFactor = Math.sin(Math.pow(t, 0.8) * Math.PI);
            const halfWidth = config.maxWidth * widthFactor;

            // Margins
            let lx = mx + Math.cos(perpAngle) * halfWidth;
            let ly = my + Math.sin(perpAngle) * halfWidth;

            let rx = mx - Math.cos(perpAngle) * halfWidth;
            let ry = my - Math.sin(perpAngle) * halfWidth;

            // Mouse repulsion on margins
            if (mouse.x !== null && mouse.y !== null) {
              const dxL = lx - mouse.x;
              const dyL = ly - mouse.y;
              const distL = Math.sqrt(dxL * dxL + dyL * dyL);
              if (distL < mouse.radius) {
                const force = (mouse.radius - distL) / mouse.radius;
                lx += (dxL / distL) * force * 15;
                ly += (dyL / distL) * force * 15;
              }

              const dxR = rx - mouse.x;
              const dyR = ry - mouse.y;
              const distR = Math.sqrt(dxR * dxR + dyR * dyR);
              if (distR < mouse.radius) {
                const force = (mouse.radius - distR) / mouse.radius;
                rx += (dxR / distR) * force * 15;
                ry += (dyR / distR) * force * 15;
              }
            }

            midribPoints.push({ x: mx, y: my });
            leftMarginPoints.push({ x: lx, y: ly });
            rightMarginPoints.push({ x: rx, y: ry });
          }

          allLeafPaths.push(midribPoints);
          allLeafLeftMargins.push(leftMarginPoints);
          allLeafRightMargins.push(rightMarginPoints);
        });

        // Occasional new data pulse traveling from root to leaf tips
        if (Math.random() < 0.015 && stemPoints.length > 0) {
          // Select random leaf midrib to travel to
          const randomLeafIndex = Math.floor(Math.random() * allLeafPaths.length);
          const leafPath = allLeafPaths[randomLeafIndex];
          
          // Full path = stem + leaf midrib
          const fullPath = [...stemPoints, ...leafPath];
          pulses.push(new DataPulse(fullPath, Math.random() * 0.8 + 0.8));
        }

        // Draw 2-Leaf Constellation (Web3 Grid style)
        ctx.save();
        
        // 1. Draw stem (trunk) lines
        ctx.strokeStyle = "rgba(74, 140, 50, 0.25)";
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(74, 140, 50, 0.4)";
        ctx.beginPath();
        ctx.moveTo(stemPoints[0].x, stemPoints[0].y);
        for (let i = 1; i < stemPoints.length; i++) {
          ctx.lineTo(stemPoints[i].x, stemPoints[i].y);
        }
        ctx.stroke();

        // 2. Draw leaf structures
        allLeafPaths.forEach((midrib, leafIdx) => {
          const leftMargin = allLeafLeftMargins[leafIdx];
          const rightMargin = allLeafRightMargins[leafIdx];

          // Draw midrib (tulang daun)
          ctx.strokeStyle = "rgba(74, 140, 50, 0.35)";
          ctx.lineWidth = 2;
          ctx.shadowColor = "rgba(74, 140, 50, 0.4)";
          ctx.beginPath();
          ctx.moveTo(midrib[0].x, midrib[0].y);
          for (let i = 1; i < midrib.length; i++) {
            ctx.lineTo(midrib[i].x, midrib[i].y);
          }
          ctx.stroke();

          // Draw left margin outline
          ctx.strokeStyle = "rgba(181, 204, 106, 0.25)";
          ctx.lineWidth = 1.5;
          ctx.shadowColor = "rgba(181, 204, 106, 0.3)";
          ctx.beginPath();
          ctx.moveTo(leftMargin[0].x, leftMargin[0].y);
          for (let i = 1; i < leftMargin.length; i++) {
            ctx.lineTo(leftMargin[i].x, leftMargin[i].y);
          }
          ctx.stroke();

          // Draw right margin outline
          ctx.beginPath();
          ctx.moveTo(rightMargin[0].x, rightMargin[0].y);
          for (let i = 1; i < rightMargin.length; i++) {
            ctx.lineTo(rightMargin[i].x, rightMargin[i].y);
          }
          ctx.stroke();

          // Draw leaf veins (urat daun) connecting midrib to margins
          ctx.strokeStyle = "rgba(181, 204, 106, 0.09)";
          ctx.lineWidth = 1;
          for (let i = 1; i < midrib.length; i++) {
            ctx.beginPath();
            ctx.moveTo(midrib[i].x, midrib[i].y);
            ctx.lineTo(leftMargin[i].x, leftMargin[i].y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(midrib[i].x, midrib[i].y);
            ctx.lineTo(rightMargin[i].x, rightMargin[i].y);
            ctx.stroke();
          }
        });

        // 3. Draw joints (dots/vertices)
        ctx.fillStyle = "#8dc868";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#8dc868";

        // Stem nodes
        stemPoints.forEach((pt, idx) => {
          if (idx % 2 === 0) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Leaf nodes (Midrib and margins)
        allLeafPaths.forEach((midrib, leafIdx) => {
          const leftMargin = allLeafLeftMargins[leafIdx];
          const rightMargin = allLeafRightMargins[leafIdx];

          midrib.forEach((pt, idx) => {
            if (idx > 0 && idx % 3 === 0) {
              ctx.fillStyle = "#8dc868";
              ctx.shadowColor = "#8dc868";
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          leftMargin.forEach((pt, idx) => {
            if (idx > 0 && idx % 3 === 0) {
              ctx.fillStyle = "#b5cc6a";
              ctx.shadowColor = "#b5cc6a";
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          rightMargin.forEach((pt, idx) => {
            if (idx > 0 && idx % 3 === 0) {
              ctx.fillStyle = "#b5cc6a";
              ctx.shadowColor = "#b5cc6a";
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        });

        ctx.restore();

        // Update and draw data pulses
        pulses = pulses.filter((pulse) => {
          const active = pulse.update();
          if (active) pulse.draw();
          return active;
        });
      } else {
        pulses = [];
      }

      // Ambient background particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Draw mouse glowing halo
      if (mouse.x !== null && mouse.y !== null) {
        ctx.save();
        const mouseGrad = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, mouse.radius
        );
        mouseGrad.addColorStop(0, "rgba(181, 204, 106, 0.07)");
        mouseGrad.addColorStop(1, "rgba(181, 204, 106, 0)");
        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block z-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

export default PalmBackground;
