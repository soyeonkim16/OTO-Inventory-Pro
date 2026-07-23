const CACHE='oto-inventory-v4.2.4-hotfix-1';
const STATIC=['/index.html','/manifest.webmanifest','/oto-app-logo.png','/icons/icon-192.png','/icons/icon-512.png','/icons/apple-touch-icon.png'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(STATIC))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

function isHtmlResponse(response){
  const type=(response.headers.get('content-type')||'').toLowerCase();
  return response.ok && type.includes('text/html');
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;

  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request,{cache:'no-store'});
        // CSS/JS가 잘못 반환된 경우 index.html로 저장하지 않도록 방지
        if(isHtmlResponse(response)){
          const cache=await caches.open(CACHE);
          await cache.put('/index.html',response.clone());
          return response;
        }
        const fallback=await fetch('/index.html',{cache:'no-store'});
        if(isHtmlResponse(fallback)){
          const cache=await caches.open(CACHE);
          await cache.put('/index.html',fallback.clone());
          return fallback;
        }
        throw new Error('HTML 문서를 받지 못했습니다.');
      }catch(error){
        const cached=await caches.match('/index.html');
        if(cached&&isHtmlResponse(cached)) return cached;
        throw error;
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(request);
    try{
      const response=await fetch(request);
      if(response.ok){
        const cache=await caches.open(CACHE);
        await cache.put(request,response.clone());
      }
      return response;
    }catch(error){
      if(cached) return cached;
      throw error;
    }
  })());
});
