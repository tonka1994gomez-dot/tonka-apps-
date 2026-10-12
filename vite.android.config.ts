import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>{const env={...loadEnv(mode,process.cwd(),'VITE_'),...process.env};return {root:'android-web',publicDir:'../public',plugins:[react()],define:{__SCANPRO_SUPABASE_URL__:JSON.stringify(env.VITE_SUPABASE_URL||''),__SCANPRO_SUPABASE_KEY__:JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY||'')},build:{outDir:'../dist-android',emptyOutDir:true}}});
