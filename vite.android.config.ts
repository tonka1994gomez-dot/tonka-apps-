import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({root:'android-web',publicDir:'../public',plugins:[react()],build:{outDir:'../dist-android',emptyOutDir:true}});
