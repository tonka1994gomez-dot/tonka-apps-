import {createClient,SupabaseClient} from '@supabase/supabase-js';
declare const __SCANPRO_SUPABASE_URL__: string;
declare const __SCANPRO_SUPABASE_KEY__: string;
let client:SupabaseClient|undefined;
const builtURL=typeof __SCANPRO_SUPABASE_URL__==='undefined'?'':__SCANPRO_SUPABASE_URL__;
const builtKey=typeof __SCANPRO_SUPABASE_KEY__==='undefined'?'':__SCANPRO_SUPABASE_KEY__;
export function cloud(){if(typeof window==='undefined')return null;const url=localStorage.getItem('scanpro-supabase-url')||builtURL,key=localStorage.getItem('scanpro-supabase-key')||builtKey;if(!url||!key)return null;return client??=createClient(url,key)}
export function configureCloud(url:string,key:string){if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))throw Error('Introduce la URL HTTPS de tu proyecto Supabase');if(key.startsWith('sb_secret_'))throw Error('Usa únicamente la clave pública publishable/anon');if(key.startsWith('ey')){try{const p=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(p.role!=='anon')throw Error('invalid')}catch{throw Error('La clave debe ser pública (anon), nunca service_role')}}else if(!key.startsWith('sb_publishable_'))throw Error('Clave pública no reconocida');localStorage.setItem('scanpro-supabase-url',url);localStorage.setItem('scanpro-supabase-key',key);client=undefined;return cloud()}
