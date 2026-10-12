import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const esbuild=require(require.resolve('esbuild',{paths:[require.resolve('vite')]}));
await esbuild.build({entryPoints:['tests/core.ts'],outfile:'.sites-runtime/core-test.mjs',bundle:true,platform:'node',format:'esm',packages:'external'});
const result=spawnSync(process.execPath,['.sites-runtime/core-test.mjs'],{stdio:'inherit',timeout:90000});
process.exit(result.status??1);
