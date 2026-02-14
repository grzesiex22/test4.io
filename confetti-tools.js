let cachedHeartShape = null;
let lastConfettiTimestamp = 0;

function getHeartShape() {
  if (cachedHeartShape) return cachedHeartShape;
  if (typeof confetti !== "function") return null;
  if (typeof confetti.shapeFromPath !== "function") return null;

  cachedHeartShape = confetti.shapeFromPath({
    path: "M0 6c0-3 2-5 5-5 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 2 5 5 0 7-10 12-10 12S0 13 0 6z",
    matrix: [1, 0, 0, 1, -10, -7],
  });
  return cachedHeartShape;
}

function launchHeartConfettiFromCenter(centerX, centerY, options = {}) {
  const amount = Math.max(1, Math.min(500, Number(options.amount) || 200));
  const speed = Math.max(0.2, Math.min(4, Number(options.speed) || 1));
  const range = Math.max(0.5, Math.min(3, Number(options.range) || 1));
  const now = performance.now();
  const rapidClick = now - lastConfettiTimestamp < 220;
  lastConfettiTimestamp = now;
  const effectiveAmount = rapidClick ? Math.max(20, Math.round(amount * 0.45)) : amount;

  const burstDomHearts = (heartsCount) => {
    const heartColors = ["#ff69b4", "#ff1493", "#ff0000", "#ff4d6d"];
    const safeCount = Math.min(120, heartsCount);
    const fragment = document.createDocumentFragment();
    const hearts = [];

    for (let i = 0; i < safeCount; i++) {
      const heart = document.createElement("span");
      heart.textContent = "\u2764";
      heart.style.position = "fixed";
      heart.style.left = `${centerX}px`;
      heart.style.top = `${centerY}px`;
      heart.style.fontSize = `${12 + Math.random() * 18}px`;
      heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];
      heart.style.pointerEvents = "none";
      heart.style.userSelect = "none";
      heart.style.zIndex = "9999";
      heart.style.willChange = "transform, opacity";
      fragment.appendChild(heart);
      hearts.push(heart);
    }

    document.body.appendChild(fragment);

    for (let i = 0; i < hearts.length; i++) {
      const heart = hearts[i];
      const angle = Math.random() * Math.PI * 2;
      const distance = (90 + Math.random() * 220) * speed * range;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - (40 + Math.random() * 120) * range;
      const rotate = -90 + Math.random() * 180;

      const animation = heart.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          { transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg) scale(0.6)`, opacity: 0 },
        ],
        {
          duration: ((1000 + Math.random() * 700) * range) / speed,
          easing: "cubic-bezier(.2,.8,.2,1)",
          fill: "forwards",
        }
      );

      animation.onfinish = () => heart.remove();
    }
  };

  const heartShape = getHeartShape();
  if (!heartShape) {
    burstDomHearts(effectiveAmount);
    return;
  }

  confetti({
    particleCount: effectiveAmount,
    angle: 90,
    spread: 360,
    startVelocity: 30 * speed * range,
    ticks: Math.round(200 * range),
    gravity: 1 / range,
    origin: {
      x: centerX / window.innerWidth,
      y: centerY / window.innerHeight,
    },
    shapes: [heartShape],
    scalar: 1.2,
    colors: ["#ff69b4", "#ff1493", "#ff0000"],
  });
}

window.launchHeartConfettiFromCenter = launchHeartConfettiFromCenter;
