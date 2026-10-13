import type {Point} from './imaging';
export type AutoCropResult={image:string;corners:Point[]};
/** One worker and one active image keep capture responsive and limit processing memory. */
export class BatchProcessor{
 private worker:Worker|null=null;private jobs:{id:string;src:string;resolve:(r:AutoCropResult)=>void;reject:(e:Error)=>void}[]=[];private active=false;private timer:ReturnType<typeof setTimeout>|null=null;
 process(id:string,src:string){return new Promise<AutoCropResult>((resolve,reject)=>{this.jobs.push({id,src,resolve,reject});this.pump()})}
 private pump(){if(this.active||!this.jobs.length)return;this.active=true;try{if(!this.worker){this.worker=new Worker(new URL('./scan.worker.ts',import.meta.url),{type:'module'});this.worker.onmessage=event=>{const job=this.jobs[0];if(!job||event.data.id!==job.id)return;this.clearTimer();this.jobs.shift();this.active=false;event.data.error?job.reject(Error(event.data.error)):job.resolve({image:event.data.image,corners:event.data.corners});this.pump()};this.worker.onerror=()=>this.fail(Error('No se pudo iniciar el recorte automático. Puedes recortar la foto manualmente.'))}this.timer=setTimeout(()=>this.fail(Error('La detección tardó demasiado. Revisa el recorte manualmente.')),45000);this.worker.postMessage({id:this.jobs[0].id,src:this.jobs[0].src})}catch(e){this.fail(e instanceof Error?e:Error('Recorte automático no disponible'))}}
 private clearTimer(){if(this.timer)clearTimeout(this.timer);this.timer=null}
 private fail(error:Error){this.clearTimer();this.worker?.terminate();this.worker=null;this.active=false;for(const job of this.jobs.splice(0))job.reject(error)}
 dispose(){this.fail(Error('Procesamiento cancelado'))}
}
