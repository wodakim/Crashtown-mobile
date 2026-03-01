export async function safePlay(audioEl) {
  if (!audioEl) return false;
  try {
    await audioEl.play();
    return true;
  } catch {
    return false;
  }
}

export function stopAndReset(audioEl) {
  if (!audioEl) return;
  audioEl.pause();
  audioEl.currentTime = 0;
}
