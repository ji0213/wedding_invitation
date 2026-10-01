const openingText = "박정희♡최지우 결혼합니다.";
const openingTarget = document.getElementById("typing-opening");
const openingScreen = document.getElementById("opening-screen");

let charCount = 0;
const speed = 150;

function preventScroll(e) {
  const popup = document.getElementById('rsvpPopup');
  const sheet = document.querySelector('.rsvp-popup-inner');

  if(popup?.classList.contains('show') && sheet?.contains(e.target)){
    return;
  }
  e.preventDefault();
}

function lockScroll() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.classList.add('scroll-locked');
  window.addEventListener('wheel', preventScroll, { passive: false });
  window.addEventListener('touchmove', preventScroll, { passive: false });
}
function setFlag(k, v){
  try{
    localStorage.setItem(k,v);
  }catch(e){}
  document.cookie = k + '=' + encodeURIComponent(v) + ';max-age=31536000;path=/;samesite=lax';
}
function getFlag(k){
  try{
    const v = localStorage.getItem(k);
    if(v) return v;
  }catch(e){}
  const m = document.cookie.match(new RegExp('(?:^|; )' + k + '=([; ]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function unlockScroll() {
  openingScreen.style.display = 'none';

  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.classList.add('scroll-locked');

  const hiddenDate = getFlag('rsvpPopupHiddenDate');
  const done = getFlag('rsvpDone');
  const today = new Date().toDateString();
  if(hiddenDate === today || done){
    window.removeEventListener('wheel', preventScroll);
    window.removeEventListener('touchmove', preventScroll);
    document.body.classList.remove('scroll-locked');
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
    return;
  }
  setTimeout(() =>{
    document.getElementById('rsvpPopup').classList.add('show');
  },500);
}

function playOpeningTyping() {
  if (charCount < openingText.length) {
    openingTarget.textContent += openingText.charAt(charCount);
    charCount++;
    setTimeout(playOpeningTyping, speed);
  } else {
    setTimeout(() => {
      openingScreen.classList.add("fade-out");
      setTimeout(unlockScroll, 1000);
    }, 1000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  lockScroll();
  const skip = new URLSearchParams(location.search).get('skip') === '1';
  if(skip){
    history.replaceState(null, '', location.pathname);
    unlockScroll();
  }else{
    playOpeningTyping();
  }
});


(function(){
  function setHeroHeight(){
    document.documentElement.style.setProperty('--hero-vh',window.innerHeight + 'px');
  }
  setHeroHeight();
  window.addEventListener('orientationchange',setHeroHeight);
  window.addEventListener('orientationchange', setHeroHeight);
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', setHeroHeight);
  }
})();
const els = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold:0.01 });
els.forEach(el=>io.observe(el));


function countDday() {
    const weddingDate = new Date(2027, 2, 13);
    const today = new Date();
    today.setHours(0,0,0,0);

    const difference = weddingDate - today;
    const dDay = Math.round(difference / (1000 * 60 * 60 * 24));

    const beforeElement = document.getElementById("d-day-before");
    const numElement = document.getElementById("d-day-count");
    const afterElement = document.getElementById("d-day-after");

    if (beforeElement && numElement && afterElement) {
        if (dDay > 0) {
            beforeElement.innerText = "결혼식까지";
            numElement.innerText = dDay;
            afterElement.innerText = "일 남았습니다.";
        } else if (dDay === 0) {
            beforeElement.innerText = "";
            numElement.innerText = "";
            afterElement.innerText = "오늘 결혼식 당일입니다! 🎉";
        } else {
            beforeElement.innerText = "결혼식이 ";
            numElement.innerText = Math.abs(dDay);
            afterElement.innerText = "일 지났습니다.";
        }
    }
}

window.addEventListener("DOMContentLoaded", countDday);


function toggleGift(){
  document.getElementById('giftPanel').classList.toggle('open');
}
function toggleContact(){
  document.getElementById('contactPanel').classList.toggle('open');
}
function copyNum(btn, num){
  const done = () => {
    const original = btn.textContent;
    btn.textContent = '복사됨';
    btn.classList.add('copied');
    setTimeout(()=>{ btn.textContent = original; btn.classList.remove('copied'); }, 1500);
  };
  const fallback = () => {
    const t = document.createElement('textarea');
    t.value = num;
    t.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(t);
    t.select();
    try{ document.execCommand('copy'); done(); }catch(e){}
    t.remove();
  };
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(num).then(done).catch(fallback);
  }else{
    fallback();
  }
}

const GB_PAGE_SIZE = 5;
let gbAllEntries = [];
let gbShownCount = 0;

function renderGuestbook(entries){
  gbAllEntries = Array.isArray(entries) ? entries : [];
  gbShownCount = 0;
  const empty = document.getElementById('gbEmpty');

  if(gbAllEntries.length === 0){
    document.getElementById('gbList').innerHTML = '';
    document.getElementById('gbMoreBtn').style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  renderGbPage();
}

function renderGbPage(){
  const list = document.getElementById('gbList');
  const moreBtn = document.getElementById('gbMoreBtn');
  const nextCount = Math.min(gbShownCount + GB_PAGE_SIZE, gbAllEntries.length);
  const slice = gbAllEntries.slice(0, nextCount);

  list.innerHTML = slice.map(entry => `
<div class="gb-card">
<div class="gb-card-head">
<span class="gb-card-name">${escapeHtml(entry.name)}</span>
<span class="gb-card-time">${escapeHtml(entry.time)}</span>
</div>
<div class="gb-card-msg">${escapeHtml(entry.message)}</div>
</div>
`).join('');

  gbShownCount = nextCount;
  moreBtn.style.display = gbShownCount < gbAllEntries.length ? 'block' : 'none';
}

function showMoreGuestbook(){
  renderGbPage();
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str ?? '';
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
  const name = nameInput.value.trim();
  const message = msgInput.value.trim();
  if(!name || !message) return;

  if(!GB_API_URL){
    alert('방명록 연동이 아직 설정되지 않았어요.');
    return;
  }

  const submitBtn = document.querySelector('#gbForm .rsvp-submit');
  const originalText = submitBtn ? submitBtn.textContent : '';
  
  if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = '전달 중...'; }

  try{
    await fetch(GB_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ type: 'guestbook', name, message })
    });
    document.getElementById('gbForm').reset();

    setTimeout(loadGuestbook, 600);
  }catch(err){
    console.error('방명록 저장 실패:', err);
    alert('방명록 전송에 실패했어요. 잠시 후 다시 시도해주세요.');
  }finally{
    if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = originalText; }
  }
};

loadGuestbook();


(function(){
  const main = document.getElementById('galleryMain');
  const thumbWrap = document.getElementById('galleryThumbs');
  if(!main || !thumbWrap) return;

  const thumbs = Array.from(thumbWrap.querySelectorAll('img'));
  if(thumbs.length === 0) return;
  let cur = 0;
  
  window.__galleryIndex = 0;

  function showPhoto(i){
    cur = i;
    window.__galleryIndex = i;
    main.style.opacity = 0;
    setTimeout(() => { main.src = thumbs[i].src; main.style.opacity = 1; }, 150);
    thumbs.forEach((t, k) => t.classList.toggle('active', k === i));
    thumbWrap.scrollTo({
      left: thumbs[i].offsetLeft - (thumbWrap.clientWidth - thumbs[i].clientWidth) / 2,
      behavior: 'smooth'
    });
  }
  window.__galleryShow = showPhoto;
  
  thumbs.forEach((t, i) => t.addEventListener('click', () => showPhoto(i)));

  let sx = 0, sy = 0;
  main.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive:true });
  main.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)*2){
      showPhoto((cur + (dx < 0 ? 1 : -1) + thumbs.length) % thumbs.length);
    }
  });
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

          const overlayContent = document.createElement('div');
          overlayContent.className = 'map-label';
          overlayContent.textContent = window.__VENUE_NAME||'';

          const customOverlay = new kakao.maps.CustomOverlay({
            map: map,
            position: coords,
            content: overlayContent,
            yAnchor: 2.8
          });
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
  const thumbWrap = document.getElementById('galleryThumbs');
  const mainImg = document.getElementById('galleryMain');
  if(!thumbWrap || !mainImg) return;
  const imgs = Array.from(thumbWrap.querySelectorAll('img'));
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
  let moved = false;
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
    if(window.__galleryShow) window.__galleryShow(current);
  }
  function setPosition(animate){
    widthPx = lb.clientWidth;
    track.style.transition = animate === false ? 'none' : 'transform 0.3s ease';
    track.style.transform = `translateX(${-current * widthPx}px)`;
  }
  mainImg.style.cursor = 'zoom-in';
  mainImg.addEventListener('click', () => open(window.__galleryIndex || 0));
  closeBtn.addEventListener('click', close);
  lb.addEventListener('click', () => {
    if(!moved) close();
  });
  window.addEventListener('resize',() => setPosition(false));

  function onStart(x){
    dragging = true;
    moved = false;
    startX = x;
    currentX = x;
    track.style.transition = 'none';
  }
  function onMove(x){
    if(!dragging) return;
    currentX = x;
    const delta = currentX - startX;
    if(Math.abs(delta) > 5) moved = true;
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
function toggleAccordion(id) {
  const content = document.getElementById(id);
  const header = content.previousElementSibling;

  header.classList.toggle('active');

  if (content.style.maxHeight) {
    content.style.maxHeight = null;
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
  }
}

function shareKakao(){
  if(!window.Kakao|| !Kakao.isInitialized()){
    alert('카카오 공유를 불러오지 못했어요. 잠시후 다시 시도해 주세요.');
    return;
  }
  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: '박정희♡최지우 결혼합니다',
      description: '2027.03.13 토요일 오후 1시 엔팰리스웨딩컨벤션',
      imageUrl: 'https://ji0213.github.io/wedding_invitation/image/asd.png',
      link: {
        mobileWebUrl:window.location.href,
        webUrl: window.location.href
      }
    },
    buttons: [
      {
        title : '청첩장 보기',
        link:{
          mobileWebUrl: window.location.href,
          webUrl: window.location.href
        }
      }
    ]
  });
}

(function () {
  const popup = document.getElementById('rsvpPopup');
  const sheet = popup?.querySelector('.rsvp-popup-inner');

  if (!popup || !sheet) return;

  let startY = 0;
  let currentY = 0;
  let dragging = false;

  const CLOSE_THRESHOLD = 120;

  sheet.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    currentY = startY;
    dragging = true;

    sheet.style.transition = 'none';
  }, { passive: true });

  sheet.addEventListener('touchmove', (e) => {
    if (!dragging) return;

    currentY = e.touches[0].clientY;

    const deltaY = currentY - startY;

    if (deltaY <= 0) {
      sheet.style.transform = 'translateY(0)';
      return;
    }

    sheet.style.transform = `translateY(${deltaY}px)`;
  }, { passive: true });

  sheet.addEventListener('touchend', () => {
    if (!dragging) return;

    dragging = false;

    const deltaY = currentY - startY;

    if (deltaY > CLOSE_THRESHOLD) {
      sheet.style.transition =
        'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)';

      sheet.style.transform = 'translateY(100%)';

      setTimeout(() => {
        closeRsvpPopup();
        sheet.style.transform = '';
        sheet.style.transition = '';
      }, 250);
    } else {
      sheet.style.transition =
        'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)';

      sheet.style.transform = 'translateY(0)';

      setTimeout(() => {
        sheet.style.transition = '';
      }, 250);
    }
  });
})();

function closeRsvpPopup(){
  document.getElementById('rsvpPopup').classList.remove('show');
  window.removeEventListener('wheel',preventScroll);
  window.removeEventListener('touchmove',preventScroll);
  document.documentElement.style.removeProperty('overflow');
  document.body.style.removeProperty('overflow');
  document.body.classList.remove('scroll-locked');
}
function hideRsvpPopupToday(){
  setFlag('rsvpPopupHiddenDate', new Date().toDateString());
  closeRsvpPopup();
}
const RSVP_API_URL = window.__RSVP_API_URL ||'';

window.submitRSVP = async function(e) {
  e.preventDefault();
  const name = document.getElementById('rsvpName').value.trim();
  const attend = document.querySelector('input[name="attend"]:checked').value;
  const count = document.getElementById('rsvpCount').value;
  if(!name) return;

  if(!RSVP_API_URL){
    alert('참석 여부 연동이 아직 설정되지 않았어요.');
    return;
  }

  const submitBtn = document.getElementById('rsvpSubmitBtn');
  const btnText = document.getElementById('rsvpBtnText');
  const spinner = document.getElementById('rsvpSpinner');

  submitBtn.disabled = true;
  btnText.textContent = '전달 중';
  spinner.style.display = 'inline-block';

  try{
    await fetch(RSVP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ type: 'rsvp', name, attend, count })
    });
    document.getElementById('rsvpPopupForm').reset();
    alert('참석 여부가 전달되었습니다. 감사합니다!');
    setFlag('rsvpDone', '1');
    closeRsvpPopup();
  }catch(err){
    console.error('참석 여부 전송 실패:', err);
    alert('참석 여부 전송에 실패했어요. 잠시 후 다시 시도해주세요.');
  }finally{
    submitBtn.disabled = false;
    btnText.textContent = '참석 여부 전달하기';
    spinner.style.display = 'none';
  }
}
const PHOTO_API_URL = window.__PHOTO_API_URL || '';
let selectedPhotoFiles = [];

function fileToBase64(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
let uploadLockEl = null;
function warnLeave(e){
  e.preventDefault();
  e.returnValue = '';
}
function lockUpload(){
  uploadLockEl = document.createElement('div');
  uploadLockEl.className = 'upload-lock';
  uploadLockEl.innerHTML = 
  '<div>
    <div id = "uploadLockMsg">업로드하고 있습니다.</div>' + 
    '<div style = "font-size: 12px;
    opacity: 0.8;
    margin-top: 6px;">잠시만 기다려 주세요.</div>
  </div>';

  const lockMsg = document.getElementById('uploadLockMsg');
  if(lockMsg) lockMsg.textContent = "업로드 중... (" + (i+1) + "/" + selectedPhotoFiles.length + ")";
  document.body.appendChild(uploadLockEl);
  window.addEventListener('beforeunload', warnLeave);
}
function unlockUpload(){
  if(uploadLockEl){
    uploadLockEl.remove();
    uploadLockEl = null;
  }
  window.removeEventListener('beforeunload', warnLeave);
}
async function resizeImage(file, max = 2000, quality = 0.85){
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', quality);
}

function friendlyUploadError(err){
  const msg = String((err && err.message) || err);
  if(!navigator.onLine) return '인터넷 연결을 확인해주세요.';
  if(/createImageBitmap|decode|source image|InvalidState/i.test(msg))
    return '지원하지 않는 사진 형식이에요. JPG나 PNG로 올려주세요.';
  if(/Failed to fetch|NetworkError|Load failed/i.test(msg))
    return '전송에 실패했어요. 사진 용량이 크거나 네트워크가 불안정할 수 있어요.';
  if(/Unexpected token|JSON/i.test(msg))
    return '서버 응답에 문제가 있어요. 사진 수를 줄여 다시 시도해주세요.';
  return msg;
}

window.renderPhotoPreviews = function(){
  const input = document.getElementById('photoFiles');
  selectedPhotoFiles = Array.from(input.files);
  const list = document.getElementById('photoPreviewList');
  list.innerHTML = '';

  selectedPhotoFiles.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const item = document.createElement('div');
    item.className = 'photo-preview-item';
    item.innerHTML = `
      <img src="${url}" alt="">
      <button type="button" class="photo-preview-remove" onclick="removePhotoPreview(${index})">×</button>
    `;
    list.appendChild(item);
  });
};

window.removePhotoPreview = function(index){
  selectedPhotoFiles.splice(index, 1);
  const dt = new DataTransfer();
  selectedPhotoFiles.forEach(file => dt.items.add(file));
  document.getElementById('photoFiles').files = dt.files;
  renderPhotoPreviews();
};

window.uploadPhotos = async function(e){
  e.preventDefault();
  const nameInput = document.getElementById('photoUploaderName');
  const uploaderName = nameInput.value.trim();
  const btn = document.getElementById('photoUploadBtn');
  const progressWrap = document.getElementById('photoProgressWrap');
  const progressFill = document.getElementById('photoProgressFill');
  const progressText = document.getElementById('photoProgressText');

  if(!uploaderName){
    alert('성함을 입력해주세요.');
    return;
  }
  if(selectedPhotoFiles.length === 0){
    alert('사진을 선택해주세요.');
    return;
  }
  if(!PHOTO_API_URL){
    alert('업로드 연동이 아직 설정되지 않았어요.');
    return;
  }
  const MAX_MB = 20;
  const bad = selectedPhotoFiles.find(f => !f.type.startsWith('image/'));
  if(bad){
    alert('"' + bad.name + '"은(는) 사진 파일이 아니에요.');
    return;
  }
  const big = selectedPhotoFiles.find(f => f.size > MAX_MB * 1024 * 1024);
  if(big){
    alert('"' + big.name + '"은(는) 용량이 너무 커요. (' + (big.size/1024/1024).toFixed(1) + 'MB, 최대 ' + MAX_MB + 'MB)');
    return;
}

  btn.disabled = true;
  lockUpload();
  progressWrap.style.display = 'block';

  for(let i = 0; i < selectedPhotoFiles.length; i++){
    const file = selectedPhotoFiles[i];
    const percent = Math.round(((i) / selectedPhotoFiles.length) * 100);
    progressFill.style.width = percent + '%';
    progressText.textContent = "업로드 중... (" + (i+1) + "/" + selectedPhotoFiles.length + ")";
    const lockmsg = document.getElementById('uploadLockMsg');
    if(lockMsg) lockMsg.textContent = "업로드 중... (" + (i+1) + "/" + selectedPhotoFiles.length + ")";

    try{
      const fileData = await resizeImage(file);
      const res = await fetch(PHOTO_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          uploaderName: uploaderName,
          fileName: file.name.replace(/\.\w+$/,'')+'.jpg',
          mimeType: 'image/jpeg',
          fileData: fileData
        })
      });
      const result = await res.json();
      if(result.error){
        throw new Error(result.error);
      }
    }catch(err){
      console.error('사진 업로드 실패:', err);
      progressText.textContent = '"' + file.name + '" 업로드 실패: ' + friendlyUploadError(err);
      btn.disabled = false;
      unlockUpload();
      return;
    }
  }

  progressFill.style.width = '100%';
  progressText.textContent = '업로드가 완료되었습니다. 감사합니다!';
  selectedPhotoFiles = [];
  document.getElementById('photoPreviewList').innerHTML = '';
  document.getElementById('photoUploadForm').reset();
  btn.disabled = false;
  unlockUpload();
};