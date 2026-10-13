/* ------------------------------------------------------------
   VIDEO - lecture au scroll + chargement différé
   La vidéo ne se télécharge qu'à l'approche de la section
   ------------------------------------------------------------ */
export function init(){
  const frame = document.getElementById('videoFrame');
  const video = document.getElementById('videoPlayer');
  const overlay = document.getElementById('videoOverlay');
  const playPauseBtn = document.getElementById('videoPlayPause');
  const muteBtn = document.getElementById('videoMute');
  const playIcon = document.getElementById('videoPlayIcon');
  const pauseIcon = document.getElementById('videoPauseIcon');
  const muteIcon = document.getElementById('videoMuteIcon');
  const unmuteIcon = document.getElementById('videoUnmuteIcon');
  

  if (!frame || !video) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let videoLoaded = false;
  let videoExists = true;

function loadVideo(){
  if (videoLoaded) return;
  videoLoaded = true;
  video.load();
  console.log('[video] Chargement déclenché');
}


  // ----- Détection : la vidéo existe-t-elle ? -----
  function checkVideoAvailable(){
    return new Promise((resolve) => {
      const test = document.createElement('video');
      test.preload = 'metadata';
      test.muted = true;

      test.onloadedmetadata = () => resolve(true);
      test.onerror = () => resolve(false);

      setTimeout(() => resolve(false), 3000);
      test.src = '/assets/video/cafe.mp4';
    });
  }

  checkVideoAvailable().then(exists => {
    videoExists = exists;
    if (!exists){
      frame.classList.add('no-video');
      console.log('[video] Pas de vidéo trouvée — mode placeholder');
    }
  });

  // ----- Contrôles personnalisés -----
  function updatePlayIcon(){
    const isPlaying = !video.paused && !video.ended;
    if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
    if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
    if (overlay) overlay.classList.toggle('hidden', isPlaying);
  }

  function updateMuteIcon(){
    const isMuted = video.muted || video.volume === 0;
    if (muteIcon) muteIcon.style.display = isMuted ? 'block' : 'none';
    if (unmuteIcon) unmuteIcon.style.display = isMuted ? 'none' : 'block';
  }

  if (playPauseBtn){
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      loadVideo();
      if (video.paused){
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  if (muteBtn){
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      if (!video.muted){
        video.removeAttribute('muted');
      } else {
        video.setAttribute('muted', '');
      }
    });
  }

  if (overlay){
    overlay.addEventListener('click', () => {
      loadVideo();
      video.muted = false;
      video.removeAttribute('muted');
      video.play().catch(() => {});
    });
  }

  video.addEventListener('play', updatePlayIcon);
  video.addEventListener('pause', updatePlayIcon);
  video.addEventListener('ended', updatePlayIcon);
  video.addEventListener('volumechange', updateMuteIcon);
  video.addEventListener('loadedmetadata', () => {
    updatePlayIcon();
    updateMuteIcon();
  });

  updatePlayIcon();
  updateMuteIcon();

  // ----- Autoplay au scroll (avec chargement différé) -----
  if (!reduce && 'IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!videoExists) return;

        if (e.isIntersecting){
          // Déclenche le chargement si pas déjà fait
          loadVideo();
          // Autoplay silencieux
          if (video.paused){
            video.play().catch(() => {});
          }
        } else {
          // Pause quand on quitte la section
          if (!video.paused){
            video.pause();
          }
        }
      });
    }, {threshold: 0.4});

    io.observe(frame);
  }
}