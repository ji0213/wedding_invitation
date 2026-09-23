const PHOTO_API_URL = window.__PHOTO_API_URL || '';

async function loadPhotoGallery(){
  if(!PHOTO_API_URL) return;
  try{
    const res = await fetch(PHOTO_API_URL + '?type=photos');
    const photos = await res.json();
    const grid = document.getElementById('photoGalleryGrid');
    const empty = document.getElementById('photoGalleryEmpty');
    document.getElementById('photoLoadingText').style.display = 'none';

    if(photos.length === 0){
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    grid.innerHTML = photos.map(p => `<img src="${p.url}" data-full="https://lh3.googleusercontent.com/d/${p.id}" alt="" loading="lazy">`).join('');
    setupLightbox();
  }catch(err){
    console.error('사진 목록을 불러오지 못했습니다:', err);
  }
}

function setupLightbox(){
  const grid = document.getElementById('photoGalleryGrid');
  const imgs = Array.from(grid.querySelectorAll('img'));
  if(imgs.length === 0) return;

  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lb-close" aria-label="닫기">&times;</button>
    <div class="lb-track">
      ${imgs.map(img => `<div class="lb-slide"><img src="${img.dataset.full}" alt=""></div>`).join('')}
    </div>
  `;
  document.body.appendChild(lb);
  const track = lb.querySelector('.lb-track');
  const lbSlides = lb.querySelectorAll('.lb-slide');
  const closeBtn = lb.querySelector('.lb-close');
  let current = 0;
  let startX = 0;
  let currentX = 0;
  let dragging = false;
  let widthPx = 0;

  function open(index){
    current = index;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => setPosition(false));
  }
  function close(){
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  function setPosition(animate){
    widthPx = lb.clientWidth;
    track.style.transition = animate === false ? 'none' : 'transform 0.3s ease';
    track.style.transform = `translateX(${-current * widthPx}px)`;
  }
  imgs.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => open(i));
  });
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', (e) => {
    if(e.target === lb) close();
  });
  window.addEventListener('resize', () => setPosition(false));

  function onStart(x){
    dragging = true;
    startX = x;
    currentX = x;
    track.style.transition = 'none';
  }
  function onMove(x){
    if(!dragging) return;
    currentX = x;
    const delta = currentX - startX;
    track.style.transform = `translateX(${-current * widthPx + delta}px)`;
  }
  function onEnd(){
    if(!dragging) return;
    dragging = false;
    const delta = currentX - startX;
    const threshold = widthPx * 0.15;
    if(delta > threshold && current > 0){
      current -= 1;
    }else if(delta < -threshold && current < lbSlides.length - 1){
      current += 1;
    }
    setPosition();
  }
  track.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchend', onEnd);
  track.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e.clientX); });
  window.addEventListener('mousemove', (e) => onMove(e.clientX));
  window.addEventListener('mouseup', onEnd);

  window.addEventListener('keydown', (e) => {
    if(!lb.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft' && current > 0){ current -= 1; setPosition(); }
    if(e.key === 'ArrowRight' && current < lbSlides.length - 1){ current += 1; setPosition(); }
  });
}

loadPhotoGallery();
