let motionFrameId = null;

function stopMotion() {
  if (motionFrameId !== null) {
    cancelAnimationFrame(motionFrameId);
    motionFrameId = null;
  }
}

function runMotion(step) {
  stopMotion();

  const tick = () => {
    step();
    motionFrameId = requestAnimationFrame(tick);
  };

  motionFrameId = requestAnimationFrame(tick);
}

function startBouncingMotion(element, boxWidth, boxHeight) {
  let x = Math.max(0, (window.innerWidth - boxWidth) / 2);
  let y = Math.max(0, (window.innerHeight - boxHeight) / 2);
  const baseSpeed = 4;
  const angle = Math.random() * Math.PI * 2;
  let vx = Math.cos(angle) * baseSpeed;
  let vy = Math.sin(angle) * baseSpeed;

  runMotion(() => {
    const maxX = Math.max(0, window.innerWidth - boxWidth);
    const maxY = Math.max(0, window.innerHeight - boxHeight);

    x += vx;
    y += vy;

    if (x <= 0) {
      x = 0;
      vx = Math.abs(vx);
      vy += (Math.random() - 0.5) * 0.7;
    } else if (x >= maxX) {
      x = maxX;
      vx = -Math.abs(vx);
      vy += (Math.random() - 0.5) * 0.7;
    }

    if (y <= 0) {
      y = 0;
      vy = Math.abs(vy);
      vx += (Math.random() - 0.5) * 0.7;
    } else if (y >= maxY) {
      y = maxY;
      vy = -Math.abs(vy);
      vx += (Math.random() - 0.5) * 0.7;
    }

    const speed = Math.hypot(vx, vy) || baseSpeed;
    const normalizedSpeed = baseSpeed / speed;
    vx *= normalizedSpeed;
    vy *= normalizedSpeed;

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
}

function startLeftRightJumpMotion(element, boxWidth, boxHeight) {
  let x = Math.max(0, (window.innerWidth - boxWidth) / 2);
  let vx = 3;
  let jumpPhase = 0;

  runMotion(() => {
    const minX = 0;
    const maxX = Math.max(0, window.innerWidth - boxWidth);
    const maxY = Math.max(0, window.innerHeight - boxHeight);

    const minY = Math.max(0, window.innerHeight * 0.06);
    const safeBottom = window.innerHeight * 0.4;
    const baseY = Math.max(minY, safeBottom - boxHeight);
    const jumpAmplitude = Math.min(65, window.innerHeight * 0.12);

    x += vx;
    if (x <= minX) {
      x = minX;
      vx = Math.abs(vx);
    } else if (x >= maxX) {
      x = maxX;
      vx = -Math.abs(vx);
    }

    jumpPhase += 0.05;
    const jumpOffset = Math.abs(Math.sin(jumpPhase)) * jumpAmplitude;
    const y = Math.max(minY, Math.min(maxY, baseY - jumpOffset));

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
}

function startSideHopMotion(element, boxWidth, boxHeight) {
  let direction = 1; // 1 = left->right, -1 = right->left
  let jumpProgress = 0; // 0..1 for a single hop

  runMotion(() => {
    const viewportMaxX = Math.max(0, window.innerWidth - boxWidth);
    const maxY = Math.max(0, window.innerHeight - boxHeight);
    const regionLeft = window.innerWidth * 0.45;
    const regionRight = window.innerWidth * 0.55;
    let minX = Math.max(0, regionLeft - boxWidth / 2);
    let maxX = Math.min(viewportMaxX, regionRight - boxWidth / 2);
    if (minX > maxX) {
      minX = 0;
      maxX = viewportMaxX;
    }

    const minY = Math.max(0, window.innerHeight * 0.06);
    const safeBottom = window.innerHeight * 0.4;
    const baseY = Math.max(minY, safeBottom - boxHeight);
    const jumpAmplitude = Math.min(90, window.innerHeight * 0.16);
    const hopDurationFrames = 96;

    const fromX = direction === 1 ? minX : maxX;
    const toX = direction === 1 ? maxX : minX;
    const t = Math.min(1, jumpProgress);
    const smoothT = t * t * (3 - 2 * t); // smoothstep
    const x = fromX + (toX - fromX) * smoothT;

    // One arc per hop: low at takeoff/landing, highest in the middle.
    const y = Math.max(minY, Math.min(maxY, baseY - Math.sin(Math.PI * t) * jumpAmplitude));

    // Upright near the apex, max tilt on left/right edges.
    const centerX = (minX + maxX) / 2;
    const halfRange = Math.max(1, (maxX - minX) / 2);
    const sideRatio = (x - centerX) / halfRange; // -1..1
    const tilt = sideRatio * 16;

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.transform = `rotate(${tilt}deg)`;

    jumpProgress += 1 / hopDurationFrames;
    if (jumpProgress >= 1) {
      jumpProgress = 0;
      direction *= -1;
    }
  });
}

function startCircleHopMotion(element, boxWidth, boxHeight) {
  let segmentIndex = 0;
  let subHopIndex = 0;
  let subHopProgress = 0;
  let subHopCount = 2;
  const subHopDurationFrames = 50;

  runMotion(() => {
    const viewportMaxX = Math.max(0, window.innerWidth - boxWidth);
    const maxY = Math.max(0, window.innerHeight - boxHeight);
    const minY = Math.max(0, window.innerHeight * 0.06);
    const safeBottom = window.innerHeight * 0.37;
    const backY = Math.max(minY, safeBottom - boxHeight);

    const centerX = Math.max(0, (window.innerWidth - boxWidth) / 2);
    const leftX = Math.max(0, window.innerWidth * 0.39 - boxWidth / 2);
    const rightX = Math.min(viewportMaxX, window.innerWidth * 0.61 - boxWidth / 2);

    const points = [
      { x: centerX, y: backY, scale: 0.78 }, // baza/tyl (bardziej z tylu)
      { x: leftX, y: Math.min(maxY, backY + 34), scale: 0.96 }, // lewa, blizej
      { x: centerX, y: Math.min(maxY, backY + 56), scale: 1.16 }, // srodek, blisko (bardziej do przodu)
      { x: rightX, y: Math.min(maxY, backY + 34), scale: 0.96 }, // prawa, blizej
    ];

    const from = points[segmentIndex];
    const to = points[(segmentIndex + 1) % points.length];
    const subFromRatio = subHopIndex / subHopCount;
    const subToRatio = (subHopIndex + 1) / subHopCount;
    const subFromX = from.x + (to.x - from.x) * subFromRatio;
    const subToX = from.x + (to.x - from.x) * subToRatio;
    const subFromY = from.y + (to.y - from.y) * subFromRatio;
    const subToY = from.y + (to.y - from.y) * subToRatio;
    const subFromScale = from.scale + (to.scale - from.scale) * subFromRatio;
    const subToScale = from.scale + (to.scale - from.scale) * subToRatio;

    const t = Math.min(1, subHopProgress);
    const smoothT = t * t * (3 - 2 * t);
    const x = subFromX + (subToX - subFromX) * smoothT;
    const baseY = subFromY + (subToY - subFromY) * smoothT;
    const scale = subFromScale + (subToScale - subFromScale) * smoothT;
    const jumpArc = Math.sin(Math.PI * t) * Math.min(32, window.innerHeight * 0.055);
    const y = Math.max(minY, Math.min(maxY, baseY - jumpArc));

    const horizontalSpan = Math.max(1, rightX - leftX);
    const sideRatio = (x - centerX) / (horizontalSpan / 2);
    const sideRatioClamped = Math.max(-1, Math.min(1, sideRatio));
    const tilt = sideRatioClamped * 14;

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.transform = `rotate(${tilt}deg) scale(${scale})`;

    subHopProgress += 1 / subHopDurationFrames;
    if (subHopProgress >= 1) {
      subHopProgress = 0;
      subHopIndex += 1;

      if (subHopIndex >= subHopCount) {
        subHopIndex = 0;
        segmentIndex = (segmentIndex + 1) % points.length;
        subHopCount = 2 + Math.floor(Math.random() * 2); // 2 or 3 for next segment
      }
    }
  });
}

function prepareLoveScene() {
  const mainTitle = document.getElementById("main-title");
  const odDoContainer = document.querySelector(".od-do-container");
  const odBlock = document.querySelector(".od");
  const doBlock = document.querySelector(".do");
  const odText = document.querySelector(".od span");
  const doText = document.querySelector(".do span");
  const odImage = document.querySelector(".od img");
  const doImage = document.querySelector(".do img");

  if (!odDoContainer || !odBlock || !doBlock || !odImage || !doImage) return null;

  if (mainTitle) {
    mainTitle.textContent = "Już jesteś moją walentynką 💖";
    mainTitle.classList.add("is-centered-love-text");
  }

  if (odText) odText.style.display = "none";
  if (doText) doText.style.display = "none";

  const odWidth = odImage.getBoundingClientRect().width;
  const doWidth = doImage.getBoundingClientRect().width;
  const mergedWidth = odWidth + doWidth;
  const mergedHeight = Math.max(
    odImage.getBoundingClientRect().height,
    doImage.getBoundingClientRect().height
  );

  odBlock.style.transition = "none";
  doBlock.style.transition = "none";
  odBlock.style.transform = "none";
  doBlock.style.transform = "none";
  odBlock.style.left = "0px";
  doBlock.style.left = `${odWidth}px`;
  odBlock.style.top = "0px";
  doBlock.style.top = "0px";

  odDoContainer.style.width = `${mergedWidth}px`;
  odDoContainer.style.height = `${mergedHeight}px`;
  odDoContainer.style.position = "fixed";
  odDoContainer.style.margin = "0";
  odDoContainer.style.left = `${Math.max(0, (window.innerWidth - mergedWidth) / 2)}px`;
  odDoContainer.style.top = `${Math.max(0, window.innerHeight * 0.38 - mergedHeight / 2)}px`;
  odDoContainer.style.zIndex = "50";

  return {
    container: odDoContainer,
    width: mergedWidth,
    height: mergedHeight,
  };
}

function resetVisualEffectClasses(container) {
  container.classList.remove("spin");
  container.classList.remove("spin-flat");
  container.classList.remove("spin-blink");
  container.style.transform = "";
  container.style.opacity = "1";
}

function centerSceneContainer(scene, topRatio = 0.5) {
  scene.container.style.left = `${Math.max(0, (window.innerWidth - scene.width) / 2)}px`;
  scene.container.style.top = `${Math.max(0, window.innerHeight * topRatio - scene.height / 2)}px`;
}

function setActiveEffectButton(activeId) {
  const effect1Btn = document.getElementById("effect-1-btn");
  const effect2Btn = document.getElementById("effect-2-btn");
  const effect3Btn = document.getElementById("effect-3-btn");
  const effect4Btn = document.getElementById("effect-4-btn");
  const effect5Btn = document.getElementById("effect-5-btn");
  if (effect1Btn) effect1Btn.classList.toggle("is-active", activeId === "effect-1-btn");
  if (effect2Btn) effect2Btn.classList.toggle("is-active", activeId === "effect-2-btn");
  if (effect3Btn) effect3Btn.classList.toggle("is-active", activeId === "effect-3-btn");
  if (effect4Btn) effect4Btn.classList.toggle("is-active", activeId === "effect-4-btn");
  if (effect5Btn) effect5Btn.classList.toggle("is-active", activeId === "effect-5-btn");
}

document.addEventListener("DOMContentLoaded", () => {
  const scene = prepareLoveScene();
  if (!scene) return;

  const effect1Btn = document.getElementById("effect-1-btn");
  const effect2Btn = document.getElementById("effect-2-btn");
  const effect3Btn = document.getElementById("effect-3-btn");
  const effect4Btn = document.getElementById("effect-4-btn");
  const effect5Btn = document.getElementById("effect-5-btn");

  if (effect1Btn) {
    effect1Btn.addEventListener("click", () => {
      resetVisualEffectClasses(scene.container);
      scene.container.classList.add("spin-flat");
      startBouncingMotion(scene.container, scene.width, scene.height);
      setActiveEffectButton("effect-1-btn");
    });
  }

  if (effect2Btn) {
    effect2Btn.addEventListener("click", () => {
      stopMotion();
      resetVisualEffectClasses(scene.container);
      centerSceneContainer(scene, 0.34);
      scene.container.classList.add("spin-blink");
      setActiveEffectButton("effect-2-btn");
    });
  }

  if (effect3Btn) {
    effect3Btn.addEventListener("click", () => {
      resetVisualEffectClasses(scene.container);
      startLeftRightJumpMotion(scene.container, scene.width, scene.height);
      setActiveEffectButton("effect-3-btn");
    });
  }

  if (effect4Btn) {
    effect4Btn.addEventListener("click", () => {
      resetVisualEffectClasses(scene.container);
      startSideHopMotion(scene.container, scene.width, scene.height);
      setActiveEffectButton("effect-4-btn");
    });
  }

  if (effect5Btn) {
    effect5Btn.addEventListener("click", () => {
      resetVisualEffectClasses(scene.container);
      startCircleHopMotion(scene.container, scene.width, scene.height);
      setActiveEffectButton("effect-5-btn");
    });
  }
});
