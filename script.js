(function(){
  function setHeroHeight(){
    document.documentElement.style.setProperty('--hero-vh',window.innerHeight + 'px');
  }
  setHeroHeight();
  window.addEventListener('orientationchange',setHeroHeight);
})()
const els = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold:0.01 });
els.forEach(el=>io.observe(el));


(function(){
  const target = new Date('2027-03-13T13:00:00');
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000*60*60*24));
  document.querySelector('#countdown .num').textContent = diff > 0 ? diff : 'D-Day';
})();

function toggleGift(){
  document.getElementById('giftPanel').classList.toggle('open');
}

function copyNum(btn, num){
  if(navigator.clipboard){
    navigator.clipboard.writeText(num).then(()=>{
      const original = btn.textContent;
      btn.textContent = '복사됨';
      btn.classList.add('copied');
      setTimeout(()=>{ btn.textContent = original; btn.classList.remove('copied'); }, 1500);
    });
  }
}

function renderGuestbook(entries){
  const list = document.getElementById('gbList');
  const empty = document.getElementById('gbEmpty');
  if(!entries || entries.length === 0){
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = entries.map(entry => `
    <div class="gb-card">
      <div class="gb-card-head">
        <span class="gb-card-name">${entry.name}</span>
        <span class="gb-card-time">${entry.time}</span>
      </div>
      <div class="gb-card-msg">${entry.message}</div>
    </div>
  `).join('');
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const GB_API_URL = window.__GUESTBOOK_API_URL || '';

async function loadGuestbook(){
  if(!GB_API_URL) return;
  try{
    const res = await fetch(GB_API_URL);
    const entries = await res.json();
    renderGuestbook(entries);
  }catch(err){
    console.error('방명록을 불러오지 못했습니다:', err);
  }
}

window.submitGuestbook = async function(e){
  e.preventDefault();
  const nameInput = document.getElementById('gbName');
  const msgInput = document.getElementById('gbMessage');
  const name = escapeHtml(nameInput.value.trim());
  const message = escapeHtml(msgInput.value.trim());
  if(!name || !message) return;

  if(!GB_API_URL){
    alert('방명록 연동이 아직 설정되지 않았어요.');
    return;
  }

  const submitBtn = document.querySelector('#gbForm .rsvp-submit');
  if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = '전달 중...'; }

  try{
    await fetch(GB_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ name, message })
    });
    document.getElementById('gbForm').reset();

    setTimeout(loadGuestbook, 600);
  }catch(err){
    console.error('메시지 저장 실패:', err);
    alert('메시지 전송에 실패했어요. 잠시 후 다시 시도해주세요.');
  }finally{
    if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = '메시지 남기기'; }
  }
};

loadGuestbook();


(function(){
  const slider = document.getElementById('gallerySlider');
  const dotsWrap = document.getElementById('galleryDots');
  if(!slider || !dotsWrap) return;

  const slides = slider.querySelectorAll('.slide');
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('.dot');

  function updateActiveDot(){
    const slideWidth = slides[0].getBoundingClientRect().width + 10;
    const index = Math.round(slider.scrollLeft / slideWidth);
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  let ticking = false;
  slider.addEventListener('scroll', () => {
    if(!ticking){
      requestAnimationFrame(() => { updateActiveDot(); ticking = false; });
      ticking = true;
    }
  });


  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  function goTo(delta){
    const slideWidth = slides[0].getBoundingClientRect().width + 10;
    const current = Math.round(slider.scrollLeft / slideWidth);
    const target = Math.max(0, Math.min(slides.length - 1, current + delta));
    slider.scrollTo({ left: target * slideWidth, behavior:'smooth' });
  }
  if(prevBtn) prevBtn.addEventListener('click', () => goTo(-1));
  if(nextBtn) nextBtn.addEventListener('click', () => goTo(1));
})();

(function(){
  const mapBox = document.getElementById('kakaoMap');
  if(!mapBox) return;

  function showFallback(){
    mapBox.textContent = '지도를 불러올 수 없어요. 위 주소를 확인해주세요.';
  }

  function waitForKakao(retries){
    if(window.kakao && window.kakao.maps){
      initMap();
      return;
    }
    if(retries <= 0){
      showFallback();
      return;
    }
    setTimeout(() => waitForKakao(retries - 1), 300);
  }

  function initMap(){
    try{
      window.kakao.maps.load(function(){
        const address = window.__VENUE_ADDRESS || '';
        const geocoder = new kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, function(result, status){
          if(status !== kakao.maps.services.Status.OK || !result[0]){
            showFallback();
            return;
          }

          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          const map = new kakao.maps.Map(mapBox, {
            center: coords,
            level: 3
          });

          new kakao.maps.Marker({
            map: map,
            position: coords
          });

          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:8px 14px;
            font-size:10px;
            font-weight:700;
            color:#4a4137;
            background:#fff;
            border-radius:4px;">${window.__VENUE_NAME || ''}</div>`
          });
          infowindow.open(map, new kakao.maps.Marker({ map, position: coords }));
        });
      });
    }catch(err){
      console.warn('카카오맵 초기화 실패:', err);
      showFallback();
    }
  }

  waitForKakao(15);
})();

(function(){
  const slider = document.getElementById('gallerySlider');
  if(!slider) return;
  const imgs = Array.from(slider.querySelectorAll('img'));
  if(imgs.length === 0) return;
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lb-close" aria-label="닫기">&times;</button>
    <div class="lb-track">
      ${imgs.map(img => `<div class="lb-slide"><img src="${img.src}" alt=""></div>`).join('')}
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
    document.body.style.overflow='';
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
  window.addEventListener('resize',() => setPosition(false));

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
      current -=1;
    }else if(delta < -threshold && current < lbSlides.length -1){
      current +=1;
    }
    setPosition();
  }
  track.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX),{passive:true});
  track.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX),{passive:true});
  track.addEventListener('touchend', onEnd);
  track.addEventListener('mousedown', (e) => {e.preventDefault(); onStart(e.clientX);});
  window.addEventListener('mousemove', (e) => onMove(e.clientX));
  window.addEventListener('mouseup', onEnd);

  window.addEventListener('keydown', (e) =>{
    if(!lb.classList.contains('open'))return;
    if(e.key ==='Escape')close();
    if(e.key === 'ArrowLeft' && current > 0){current -= 1; setPosition();}
    if(e.key === 'ArrowRight' && current < lbSlides.length -1){current += 1; setPosition();}
  });
})();