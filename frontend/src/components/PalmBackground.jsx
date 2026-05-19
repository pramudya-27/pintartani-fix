import {useEffect, useRef} from "react";

function PalmBackground() {
  const canvasRef = useRef(null);

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

      // Generate Palm Tree Coordinates dynamically
      // We place the tree on the right side of the screen on desktop, or center it on mobile
      const isMobile = canvas.width < 768;
      const treeBaseX = isMobile ? canvas.width * 0.5 : canvas.width * 0.8;
      const treeBaseY = canvas.height * 0.95;
      const treeHeight = isMobile ? canvas.height * 0.5 : canvas.height * 0.65;
      const trunkTopY = treeBaseY - treeHeight;

      // Gentle swaying effect
      const sway = Math.sin(time) * 15;
      const trunkTopX = treeBaseX + sway;

      // Calculate trunk coordinates
      const trunkPoints = [];
      const trunkSegments = 15;
      for (let i = 0; i <= trunkSegments; i++) {
        const t = i / trunkSegments;
        // quadratic bezier for slight organic bend
        const cx = treeBaseX * (1 - t) * (1 - t) + (treeBaseX + sway * 0.2) * 2 * t * (1 - t) + trunkTopX * t * t;
        const cy = treeBaseY * (1 - t) + trunkTopY * t;

        // Apply slight mouse repulsion to trunk nodes
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

        trunkPoints.push({x: finalX, y: finalY});
      }

      // Generate Leaves (Fronds)
      const leafCount = 8;
      const allLeafPaths = [];

      for (let l = 0; l < leafCount; l++) {
        // angle radiating outward
        const angleBase = (l / leafCount) * Math.PI * 2 + time * 0.05;
        const leafPoints = [];
        const leafSegments = 12;
        const leafLength = isMobile ? 80 + Math.sin(time + l) * 5 : 160 + Math.sin(time + l) * 10;

        for (let i = 0; i <= leafSegments; i++) {
          const t = i / leafSegments;
          // Leaf curves outward and then arches downwards
          const angle = angleBase + Math.sin(time * 0.5 + l) * 0.05;
          const dist = t * leafLength;
          // Add arch (droop)
          const arch = Math.pow(t, 2) * (isMobile ? 35 : 70);
          
          let lx = trunkTopX + Math.cos(angle) * dist;
          let ly = trunkTopY + Math.sin(angle) * dist + arch;

          // Mouse interaction on leaves
          if (mouse.x !== null && mouse.y !== null) {
            const dx = lx - mouse.x;
            const dy = ly - mouse.y;
            const distMouse = Math.sqrt(dx * dx + dy * dy);
            if (distMouse < mouse.radius) {
              const force = (mouse.radius - distMouse) / mouse.radius;
              lx += (dx / distMouse) * force * 20;
              ly += (dy / distMouse) * force * 20;
            }
          }

          leafPoints.push({x: lx, y: ly});
        }
        allLeafPaths.push(leafPoints);
      }

      // Occasional new data pulse traveling from root to leaves
      if (Math.random() < 0.015 && trunkPoints.length > 0) {
        // Select random leaf to travel to
        const randomLeafIndex = Math.floor(Math.random() * allLeafPaths.length);
        const leafPath = allLeafPaths[randomLeafIndex];
        
        // Full path = trunk + leaf
        const fullPath = [...trunkPoints, ...leafPath];
        pulses.push(new DataPulse(fullPath, Math.random() * 0.8 + 0.8));
      }

      // Draw Palm Tree Constellation (Web3 Grid style)
      ctx.save();
      
      // Draw trunk lines
      ctx.strokeStyle = "rgba(74, 140, 50, 0.2)";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(74, 140, 50, 0.4)";
      ctx.beginPath();
      ctx.moveTo(trunkPoints[0].x, trunkPoints[0].y);
      for (let i = 1; i < trunkPoints.length; i++) {
        ctx.lineTo(trunkPoints[i].x, trunkPoints[i].y);
      }
      ctx.stroke();

      // Draw leaf fronds lines
      ctx.strokeStyle = "rgba(181, 204, 106, 0.2)";
      ctx.lineWidth = 1.5;
      allLeafPaths.forEach((leaf) => {
        ctx.beginPath();
        ctx.moveTo(leaf[0].x, leaf[0].y);
        for (let i = 1; i < leaf.length; i++) {
          ctx.lineTo(leaf[i].x, leaf[i].y);
        }
        ctx.stroke();

        // Draw leaf leaflets (pins radiating out from the main frond axis)
        ctx.strokeStyle = "rgba(181, 204, 106, 0.08)";
        ctx.lineWidth = 1;
        for (let i = 2; i < leaf.length; i += 2) {
          const pt = leaf[i];
          // Draw a small side needle
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x + Math.sin(i + time) * 12, pt.y + 10);
          ctx.stroke();
        }
      });

      // Draw joints (dots/vertices)
      ctx.fillStyle = "#8dc868";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#8dc868";

      // Trunk nodes
      trunkPoints.forEach((pt, idx) => {
        if (idx % 2 === 0) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Leaf nodes
      allLeafPaths.forEach((leaf) => {
        leaf.forEach((pt, idx) => {
          if (idx % 3 === 0) {
            ctx.fillStyle = "#b5cc6a";
            ctx.shadowColor = "#b5cc6a";
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
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
