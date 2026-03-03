export function createSpritesheet(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  const S = 160;

  // --- DRILL FRAMES (4 frames) ---
  for (let f = 0; f < 4; f++) {
    const ox = f * S;
    const oy = 0;
    const shake = f % 2 === 0 ? 0 : f === 1 ? -3 : 3;
    const bitPush = (f % 2) * 5;

    ctx.save();
    ctx.translate(ox + S / 2 + shake, oy + 18);

    // Drop shadow
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.roundRect(-26, 5, 52, 58, 8);
    ctx.fill();

    // Main body gradient
    const bodyGrad = ctx.createLinearGradient(-24, 0, 24, 0);
    bodyGrad.addColorStop(0, "#3a5575");
    bodyGrad.addColorStop(0.25, "#5a85b5");
    bodyGrad.addColorStop(0.5, "#7aA5d5");
    bodyGrad.addColorStop(0.75, "#5a85b5");
    bodyGrad.addColorStop(1, "#3a5575");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-24, 0, 48, 55, 7);
    ctx.fill();

    // Body panel lines
    ctx.strokeStyle = "rgba(30,50,80,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-24, 18);
    ctx.lineTo(24, 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-24, 36);
    ctx.lineTo(24, 36);
    ctx.stroke();

    // Top panel
    const topPanelGrad = ctx.createLinearGradient(0, 0, 0, 18);
    topPanelGrad.addColorStop(0, "rgba(140,180,220,0.4)");
    topPanelGrad.addColorStop(1, "rgba(140,180,220,0)");
    ctx.fillStyle = topPanelGrad;
    ctx.beginPath();
    ctx.roundRect(-23, 1, 46, 17, [6, 6, 0, 0]);
    ctx.fill();

    // Engine housing top
    const housingGrad = ctx.createLinearGradient(0, -14, 0, 4);
    housingGrad.addColorStop(0, "#6a9ad0");
    housingGrad.addColorStop(0.5, "#5080b8");
    housingGrad.addColorStop(1, "#3a6a9a");
    ctx.fillStyle = housingGrad;
    ctx.beginPath();
    ctx.roundRect(-28, -12, 56, 16, 8);
    ctx.fill();

    // Housing highlight
    ctx.fillStyle = "rgba(150,200,255,0.25)";
    ctx.beginPath();
    ctx.roundRect(-24, -11, 48, 6, [6, 6, 0, 0]);
    ctx.fill();

    // Exhaust vents
    ctx.fillStyle = "#1e3550";
    for (let v = 0; v < 5; v++) {
      ctx.fillRect(-14 + v * 7, -9, 4, 2.5);
    }

    // Warning stripes
    ctx.save();
    ctx.beginPath();
    ctx.rect(-24, 36, 48, 8);
    ctx.clip();
    for (let s = -8; s < 14; s++) {
      ctx.fillStyle = s % 2 === 0 ? "#e8b020" : "#2a2a2a";
      ctx.save();
      ctx.translate(-24 + s * 8, 36);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, 0);
      ctx.lineTo(16, 8);
      ctx.lineTo(8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Left handle
    const lhGrad = ctx.createLinearGradient(-36, 0, -24, 0);
    lhGrad.addColorStop(0, "#1e2e42");
    lhGrad.addColorStop(0.5, "#2a4060");
    lhGrad.addColorStop(1, "#1e2e42");
    ctx.fillStyle = lhGrad;
    ctx.beginPath();
    ctx.roundRect(-36, 4, 14, 34, 5);
    ctx.fill();

    // Right handle
    const rhGrad = ctx.createLinearGradient(22, 0, 36, 0);
    rhGrad.addColorStop(0, "#1e2e42");
    rhGrad.addColorStop(0.5, "#2a4060");
    rhGrad.addColorStop(1, "#1e2e42");
    ctx.fillStyle = rhGrad;
    ctx.beginPath();
    ctx.roundRect(22, 4, 14, 34, 5);
    ctx.fill();

    // Rubber grip texture
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#15202f" : "#223348";
      ctx.fillRect(-35, 7 + i * 6, 12, 4);
      ctx.fillRect(23, 7 + i * 6, 12, 4);
    }

    // Rivets
    const rivetPositions = [
      [-16, 8],
      [16, 8],
      [-16, 28],
      [16, 28],
      [-16, 48],
      [16, 48],
      [-8, 48],
      [8, 48],
    ];
    rivetPositions.forEach(([rx, ry]) => {
      ctx.fillStyle = "#2a4060";
      ctx.beginPath();
      ctx.arc(rx, ry + 1, 3, 0, Math.PI * 2);
      ctx.fill();
      const rivGrad = ctx.createRadialGradient(
        rx - 0.5,
        ry - 0.5,
        0.5,
        rx,
        ry,
        3
      );
      rivGrad.addColorStop(0, "#b0d0f0");
      rivGrad.addColorStop(0.6, "#7aa0cc");
      rivGrad.addColorStop(1, "#4a7098");
      ctx.fillStyle = rivGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a5a80";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(rx - 1.5, ry);
      ctx.lineTo(rx + 1.5, ry);
      ctx.stroke();
    });

    // Power indicator
    const indColor = f % 2 === 0 ? "#00ff88" : "#ff5544";
    const indGlow =
      f % 2 === 0 ? "rgba(0,255,136,0.3)" : "rgba(255,85,68,0.3)";
    ctx.fillStyle = indGlow;
    ctx.beginPath();
    ctx.arc(0, 9, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = indColor;
    ctx.beginPath();
    ctx.arc(0, 9, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(-1, 8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Pressure gauge
    ctx.fillStyle = "#1a2a3a";
    ctx.beginPath();
    ctx.arc(0, 26, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a8ab5";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 26, 6, 0, Math.PI * 2);
    ctx.stroke();
    const gaugeAngle = -Math.PI * 0.7 + f * 0.3;
    ctx.strokeStyle = "#44dd88";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 26, 4, -Math.PI * 0.8, gaugeAngle);
    ctx.stroke();
    ctx.strokeStyle = "#ff6644";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 26);
    ctx.lineTo(Math.cos(gaugeAngle) * 4, 26 + Math.sin(gaugeAngle) * 4);
    ctx.stroke();

    // Collar
    const collarGrad = ctx.createLinearGradient(-14, 52, 14, 52);
    collarGrad.addColorStop(0, "#3a5575");
    collarGrad.addColorStop(0.3, "#6a95c0");
    collarGrad.addColorStop(0.5, "#8ab5dd");
    collarGrad.addColorStop(0.7, "#6a95c0");
    collarGrad.addColorStop(1, "#3a5575");
    ctx.fillStyle = collarGrad;
    ctx.beginPath();
    ctx.roundRect(-14, 52, 28, 10, 3);
    ctx.fill();

    // Drill shaft
    const shaftTop = 62;
    const shaftLen = 42 + bitPush;
    const shaftGrad = ctx.createLinearGradient(-8, shaftTop, 8, shaftTop);
    shaftGrad.addColorStop(0, "#5a6a7a");
    shaftGrad.addColorStop(0.2, "#8a9aaa");
    shaftGrad.addColorStop(0.45, "#d0dce8");
    shaftGrad.addColorStop(0.55, "#c0ccd8");
    shaftGrad.addColorStop(0.8, "#8090a0");
    shaftGrad.addColorStop(1, "#4a5a6a");
    ctx.fillStyle = shaftGrad;
    ctx.beginPath();
    ctx.moveTo(-9, shaftTop);
    ctx.lineTo(9, shaftTop);
    ctx.lineTo(5, shaftTop + shaftLen);
    ctx.lineTo(-5, shaftTop + shaftLen);
    ctx.closePath();
    ctx.fill();

    // Shaft spiral grooves
    const spiralOffset = f * 5;
    ctx.strokeStyle = "rgba(40,60,80,0.35)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      const yy = shaftTop + 3 + ((i * 6 + spiralOffset) % (shaftLen - 6));
      const pct = (yy - shaftTop) / shaftLen;
      const w = 9 - pct * 4;
      ctx.beginPath();
      ctx.moveTo(-w, yy);
      ctx.quadraticCurveTo(0, yy + 3, w, yy);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(220,235,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2, shaftTop + 2);
    ctx.lineTo(-3, shaftTop + shaftLen - 4);
    ctx.stroke();

    // Drill bit tip
    const tipTop = shaftTop + shaftLen;
    const tipLen = 22;
    const tipGrad = ctx.createLinearGradient(-5, tipTop, 5, tipTop);
    tipGrad.addColorStop(0, "#6a7a8a");
    tipGrad.addColorStop(0.4, "#b0c5d8");
    tipGrad.addColorStop(0.6, "#a0b5c8");
    tipGrad.addColorStop(1, "#5a6a7a");
    ctx.fillStyle = tipGrad;
    ctx.beginPath();
    ctx.moveTo(-5, tipTop);
    ctx.lineTo(5, tipTop);
    ctx.lineTo(1, tipTop + tipLen);
    ctx.lineTo(-1, tipTop + tipLen);
    ctx.closePath();
    ctx.fill();

    // Tip cutting edges
    ctx.strokeStyle = "rgba(180,210,240,0.5)";
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 4; i++) {
      const ty = tipTop + 3 + i * 5;
      const tw = 5 - ((ty - tipTop) / tipLen) * 4;
      ctx.beginPath();
      ctx.moveTo(-tw, ty);
      ctx.lineTo(tw, ty + 2);
      ctx.stroke();
    }

    // Cartoon outline
    ctx.strokeStyle = "#0e1520";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.roundRect(-28, -12, 56, 16, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-24, 0, 48, 55, 7);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-36, 4, 14, 34, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(22, 4, 14, 34, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-14, 52, 28, 10, 3);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-9, shaftTop);
    ctx.lineTo(-5, shaftTop + shaftLen);
    ctx.lineTo(-1, tipTop + tipLen);
    ctx.lineTo(1, tipTop + tipLen);
    ctx.lineTo(5, shaftTop + shaftLen);
    ctx.lineTo(9, shaftTop);
    ctx.stroke();

    // Vibration lines
    if (f % 2 === 1) {
      ctx.strokeStyle = "rgba(100,160,230,0.35)";
      ctx.lineWidth = 1.5;
      for (let v = 0; v < 3; v++) {
        const vx = -38 - v * 6;
        const vy = 15 + v * 8;
        ctx.beginPath();
        ctx.arc(vx, vy, 4 + v * 2, -0.5, 0.5);
        ctx.stroke();
      }
      for (let v = 0; v < 3; v++) {
        const vx = 38 + v * 6;
        const vy = 15 + v * 8;
        ctx.beginPath();
        ctx.arc(vx, vy, 4 + v * 2, Math.PI - 0.5, Math.PI + 0.5);
        ctx.stroke();
      }
    }

    // Specular shine
    ctx.fillStyle = "rgba(200,230,255,0.15)";
    ctx.beginPath();
    ctx.ellipse(-10, 6, 10, 20, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- COIN FRAMES (4 rotation frames) ---
  for (let f = 0; f < 4; f++) {
    const ox = f * S;
    const oy = S * 2;
    ctx.save();
    ctx.translate(ox + S / 2, oy + S / 2);

    const scaleX = [1, 0.6, 0.15, 0.6][f];
    const isEdge = f === 2;
    ctx.scale(scaleX, 1);

    if (isEdge) {
      const edgeGrad = ctx.createLinearGradient(-5, 0, 5, 0);
      edgeGrad.addColorStop(0, "#a06000");
      edgeGrad.addColorStop(0.5, "#e8a020");
      edgeGrad.addColorStop(1, "#a06000");
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(-5, -30, 10, 60);
      ctx.strokeStyle = "#c87800";
      ctx.lineWidth = 1;
      for (let r = 0; r < 8; r++) {
        const ry = -26 + r * 7;
        ctx.beginPath();
        ctx.moveTo(-4, ry);
        ctx.lineTo(4, ry);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "rgba(255,200,50,0.12)";
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fill();

      const coinGrad = ctx.createRadialGradient(-6, -6, 4, 0, 0, 30);
      coinGrad.addColorStop(0, "#ffe880");
      coinGrad.addColorStop(0.5, "#f0b030");
      coinGrad.addColorStop(0.8, "#d09020");
      coinGrad.addColorStop(1, "#a06800");
      ctx.fillStyle = coinGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#b08018";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 27, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#c89830";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#9a6810";
      ctx.font = "bold 28px Bungee, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 1, 2);
      ctx.fillStyle = "#d4a030";
      ctx.fillText("$", 0, 1);

      ctx.fillStyle = "rgba(255,255,230,0.45)";
      ctx.beginPath();
      ctx.ellipse(-9, -10, 10, 6, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.ellipse(-6, -12, 5, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#6a4800";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- PARTICLE / DEBRIS frames ---
  for (let f = 0; f < 4; f++) {
    const ox = f * S;
    const oy = S * 3;
    ctx.save();
    ctx.translate(ox + S / 2, oy + S / 2);

    const debrisShapes = [
      () => {
        const grad = ctx.createLinearGradient(-10, -8, 10, 8);
        grad.addColorStop(0, "#5a7090");
        grad.addColorStop(1, "#3a4a5f");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-3, -12);
        ctx.lineTo(8, -8);
        ctx.lineTo(12, 2);
        ctx.lineTo(5, 10);
        ctx.lineTo(-8, 7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#1a2530";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.strokeStyle = "rgba(150,190,230,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-3, -12);
        ctx.lineTo(8, -8);
        ctx.stroke();
      },
      () => {
        ctx.fillStyle = "#4a6080";
        ctx.beginPath();
        ctx.moveTo(-6, -10);
        ctx.lineTo(5, -8);
        ctx.lineTo(8, 6);
        ctx.lineTo(-3, 10);
        ctx.lineTo(-8, 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#1a2530";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "rgba(80,150,230,0.6)";
        ctx.beginPath();
        ctx.arc(1, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      },
      () => {
        const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 8);
        grad.addColorStop(0, "#6a8098");
        grad.addColorStop(1, "#3a4a5f");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1a2530";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      },
      () => {
        ctx.fillStyle = "#3a6aa0";
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(6, -2);
        ctx.lineTo(4, 10);
        ctx.lineTo(-4, 12);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(120,180,255,0.5)";
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(3, -4);
        ctx.lineTo(-2, -2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#1a2a40";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(6, -2);
        ctx.lineTo(4, 10);
        ctx.lineTo(-4, 12);
        ctx.lineTo(-6, 0);
        ctx.closePath();
        ctx.stroke();
      },
    ];
    debrisShapes[f]();

    // Sparkle star
    ctx.fillStyle = "rgba(180,220,255,0.7)";
    const starX = 15,
      starY = -15;
    ctx.beginPath();
    for (let s = 0; s < 8; s++) {
      const sa = (s / 8) * Math.PI * 2 - Math.PI / 2;
      const sr = s % 2 === 0 ? 6 : 2.5;
      ctx.lineTo(starX + Math.cos(sa) * sr, starY + Math.sin(sa) * sr);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  return canvas;
}
