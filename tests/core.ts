import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {PDFDocument,PDFDict,PDFName,PDFRawStream} from 'pdf-lib';
import {createPDF} from '../lib/scanpro/pdf';
import {crop,filterImage,rotate,orderCorners,detect} from '../lib/scanpro/imaging';
const require=createRequire(import.meta.url);
const canvas=require(require.resolve('@napi-rs/canvas',{paths:[require.resolve('pdfjs-dist')]}));
Object.assign(globalThis,{Image:canvas.Image,ImageData:canvas.ImageData,HTMLImageElement:canvas.Image,HTMLCanvasElement:canvas.createCanvas(1,1).constructor,document:{createElement:(tag:string)=>{assert.equal(tag,'canvas');return canvas.createCanvas(1,1)}}});
const originals:string[]=[];
for(let i=0;i<5;i++){const c=canvas.createCanvas(500,700),x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,500,700);x.fillStyle='black';x.font='50px sans-serif';x.fillText('SCANPRO '+(i+1),50,120);x.fillStyle=['red','blue','green','orange','purple'][i];x.fillRect(50,200,400,300);originals.push(c.toDataURL('image/jpeg'))}
for(const format of ['A4','Carta','Oficio','Automático']){const out=await createPDF(originals,format,'Alta');const pdf=await PDFDocument.load(await out.arrayBuffer());assert.equal(pdf.getPageCount(),5);assert.equal(pdf.getPages()[0].getWidth(),format==='A4'?595.28:format==='Automático'?500:612);assert.ok(out.size>2000);if(format==='A4'){for(let i=0;i<5;i++){const x=pdf.getPage(i).node.Resources()!.lookup(PDFName.of('XObject'),PDFDict);const raw=pdf.context.lookup(x.values()[0]) as PDFRawStream;const im=await canvas.loadImage(Buffer.from(raw.contents));const cc=canvas.createCanvas(im.width,im.height);cc.getContext('2d').drawImage(im,0,0);const px=cc.getContext('2d').getImageData(250,350,1,1).data;const expected=[[255,0,0],[0,0,255],[0,128,0],[255,165,0],[128,0,128]][i];for(let k=0;k<3;k++)assert.ok(Math.abs(px[k]-expected[k])<20,'Page order / embedded image must match source')}}}
console.log('PASS: five-page PDFs, all formats, valid PDF parsing');
const c=await crop(originals[0],[{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.9},{x:.1,y:.9}]);const im=await canvas.loadImage(c);assert.equal(im.width,400);assert.equal(im.height,560);
await assert.rejects(()=>crop(originals[0],[{x:0,y:0},{x:1,y:1},{x:1,y:0},{x:0,y:1}]));console.log('PASS: perspective crop dimensions and crossed-corner rejection');
const r=await canvas.loadImage(await rotate(originals[0]));assert.equal(r.width,700);assert.equal(r.height,500);
for(const f of ['Original','Grises','Blanco y negro','Color mejorado','Documento limpio']){const im=await canvas.loadImage(await filterImage(originals[0],f));assert.equal(im.width,500);assert.equal(im.height,700)}console.log('PASS: rotate and all five filters return valid images');
assert.deepEqual(orderCorners([{x:1,y:1},{x:0,y:0},{x:0,y:1},{x:1,y:0}]),[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}]);
const fixture=canvas.createCanvas(800,1000),ctx=fixture.getContext('2d');ctx.fillStyle='#222';ctx.fillRect(0,0,800,1000);ctx.fillStyle='white';ctx.fillRect(100,100,600,800);const pts=await detect(fixture.toDataURL('image/jpeg'));assert.equal(pts.length,4);assert.ok(Math.abs(pts[0].x-.125)<.04);console.log('PASS: OpenCV detects four corners of high-contrast document');
