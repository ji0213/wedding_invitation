const PHOTO_API_URL = window.__PHOTO_API_URL || '';

async function loadPhotoGallery(){
  if(!PHOTO_API_URL) return;
  try{
    const res = await fetch(PHOTO_API_URL + '?type=photos');
    const photos = await res.json();
    const grid = document.getElementById('photoGalleryGrid');
    const empty = document.getElementById('photoGalleryEmpty');

    if(photoAllList.length === 0){
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    grid.innerHTML = photos.map(p => '<img src="${p.url} alt="" loading="lazy">').join('');
  }catch(err){
    console.error('사진 목록을 불러오지 못했습니다:', err);
  }
}

loadPhotoGallery();