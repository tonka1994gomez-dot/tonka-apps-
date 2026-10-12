// Static engine assets only. Never cache Supabase requests, private documents or authenticated HTML.
const CACHE='scanpro-assets-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('scanpro-assets-')&&k!==CACHE)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==self.location.origin||!(/\.(js|mjs|css|wasm|png|svg|webmanifest)$/.test(u.pathname)))return;event.respondWith((async()=>{const c=await caches.open(CACHE);const hit=await c.match(event.request);if(hit)return hit;const r=await fetch(event.request);if(r.ok&&r.type==='basic')await c.put(event.request,r.clone());return r})())});
