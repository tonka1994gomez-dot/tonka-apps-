import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>{const env={...loadEnv(mode,process.cwd(),'VITE_'),...process.env};return {root:'android-web',publicDir:'../public',plugins:[react()],define:{__SCANGAIA_GOOGLE_CLIENT_ID__:JSON.stringify(env.VITE_GOOGLE_WEB_CLIENT_ID||'')},build:{outDir:'../dist-android',emptyOutDir:true}}});
