import type {Page} from './imaging';
import { openDB } from 'idb';
export type Doc = {id:string;name:string;folder:string;created:number;updated:number;pages:number;blob:Blob;thumbnail:string;text:string;favorite:boolean;deleted:boolean;cloud?:boolean;sourcePages?:Page[];ocrStatus?:'pending'|'complete'|'error'};
export type Folder={id:string;name:string;parent:string};
const db=()=>openDB('scanpro-v1',1,{upgrade(d){d.createObjectStore('documents',{keyPath:'id'});d.createObjectStore('folders',{keyPath:'id'});d.createObjectStore('draft');}});
export const allDocs=async()=> (await db()).getAll('documents') as Promise<Doc[]>;
export const putDoc=async(d:Doc)=>{await(await db()).put('documents',d)};
export const removeDoc=async(id:string)=>{await(await db()).delete('documents',id)};
export const allFolders=async()=> (await db()).getAll('folders') as Promise<Folder[]>;
export const putFolder=async(f:Folder)=>{await(await db()).put('folders',f)};
export const saveDraft=async(p:unknown)=>{await(await db()).put('draft',p,'pages')};
export const getDraft=async()=> (await db()).get('draft','pages');
export async function download(blob:Blob,name:string){const {Capacitor}=await import('@capacitor/core');if(Capacitor.isNativePlatform()){try{const {Filesystem,Directory}=await import('@capacitor/filesystem');const {Share}=await import('@capacitor/share');const data=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve((r.result as string).split(',')[1]);r.onerror=()=>reject(Error('No se pudo preparar el archivo'));r.readAsDataURL(blob)});const f=await Filesystem.writeFile({path:name.replace(/[^a-zA-Z0-9._-]/g,'_'),data,directory:Directory.Cache});await Share.share({title:name,url:f.uri});return}catch(e){alert('No se pudo exportar: '+(e as Error).message);return}}const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000)}
