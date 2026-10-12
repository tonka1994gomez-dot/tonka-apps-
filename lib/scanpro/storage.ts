import type {Page} from './imaging';
import { openDB } from 'idb';
export type Doc = {id:string;name:string;folder:string;created:number;updated:number;pages:number;blob:Blob;thumbnail:string;text:string;favorite:boolean;deleted:boolean;cloud?:boolean;driveAccount?:string;driveFileId?:string;driveStatus?:'pending'|'uploading'|'synced'|'error';driveError?:string;driveURL?:string;sourcePages?:Page[];ocrStatus?:'pending'|'complete'|'error'};
export type Folder={id:string;name:string;parent:string};
const db=()=>openDB('scanpro-v1',1,{upgrade(d){d.createObjectStore('documents',{keyPath:'id'});d.createObjectStore('folders',{keyPath:'id'});d.createObjectStore('draft');}});
export const allDocs=async()=> (await db()).getAll('documents') as Promise<Doc[]>;
export const putDoc=async(d:Doc)=>{await(await db()).put('documents',d)};
export const removeDoc=async(id:string)=>{await(await db()).delete('documents',id)};
export const allFolders=async()=> (await db()).getAll('folders') as Promise<Folder[]>;
export const putFolder=async(f:Folder)=>{await(await db()).put('folders',f)};
export const saveDraft=async(p:unknown)=>{await(await db()).put('draft',p,'pages')};
export const getDraft=async()=> (await db()).get('draft','pages');
async function exportNative(blob:Blob,name:string){const {Filesystem,Directory}=await import('@capacitor/filesystem');const {Share}=await import('@capacitor/share');const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve((reader.result as string).split(',')[1]);reader.onerror=()=>reject(Error('No se pudo preparar el archivo'));reader.readAsDataURL(blob)});const path=crypto.randomUUID()+'-'+name.replace(/[^a-zA-Z0-9._-]/g,'_');const file=await Filesystem.writeFile({path,data,directory:Directory.Cache});await Share.share({title:name,url:file.uri,dialogTitle:'Guardar o compartir PDF'});}
export async function sharePDF(blob:Blob,name:string){const {Capacitor}=await import('@capacitor/core');if(Capacitor.isNativePlatform()){await exportNative(blob,name);return}const file=new File([blob],name,{type:'application/pdf'});if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:name})}catch(error){if((error as Error).name!=='AbortError')throw error}}else await download(blob,name);}
export async function download(blob:Blob,name:string){const {Capacitor}=await import('@capacitor/core');if(Capacitor.isNativePlatform()){await exportNative(blob,name);return}const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}

export const getDoc=async(id:string)=>(await db()).get('documents',id) as Promise<Doc|undefined>;
export async function patchStoredDoc(id:string,patch:Partial<Doc>){const database=await db();const tx=database.transaction('documents','readwrite');const old=await tx.store.get(id);if(old)await tx.store.put({...old,...patch});await tx.done;}
