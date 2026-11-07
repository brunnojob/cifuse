#!/usr/bin/env node
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {analyze,markdown,MAX_BYTES} from '../src/engine.js';
const usage=`CIFuse 0.1.0 — evidence first CI triage
Usage: cifuse [file.log ... | - | --demo] [--format json|markdown] [--lang en|pt-BR]
              [--baseline report.json] [--fail-on findings|new]
Exit: 0 completed, 1 threshold matched, 2 input/usage error.
Input limit: 5 MiB total, 100 files. No network requests. No commands executed.`;
async function main() {
  const args=process.argv.slice(2), files=[],options={}; let format='markdown',failOn;
  const take=()=>{const value=args.shift();if(!value||value.startsWith('--'))throw Error('Missing option value');return value;};
  while(args.length) {
    const arg=args.shift();
    if(arg==='--help'||arg==='-h'){console.log(usage);return;}
    if(arg==='--version'){console.log('0.1.0');return;}
    if(arg==='--format')format=take();
    else if(arg==='--lang')options.lang=take();
    else if(arg==='--baseline')options.baseline=JSON.parse(await boundedRead(take()));
    else if(arg==='--fail-on')failOn=take();
    else if(arg==='--demo')files.push(fileURLToPath(new URL('../examples/build.log',import.meta.url)));
    else if(arg.startsWith('-')&&arg!=='-')throw Error(`Unknown option: ${arg}`);
    else files.push(arg);
  }
  if(!['json','markdown'].includes(format))throw Error('Format must be json or markdown');
  if(options.lang&&!['en','pt-BR'].includes(options.lang))throw Error('Language must be en or pt-BR');
  if(failOn&&!['findings','new'].includes(failOn))throw Error('Threshold must be findings or new');
  if(failOn==='new'&&!options.baseline)throw Error('--fail-on new requires --baseline');
  if(!files.length)throw Error('Provide a log path, - for stdin, or --demo');
  if(files.length>100)throw Error('Maximum 100 files');
  let size=0;const sources=[];
  for(const file of files){
    const text=file==='-'?await readStdin():await boundedRead(file);
    size+=Buffer.byteLength(text)+Buffer.byteLength(file);if(size>MAX_BYTES)throw Error('Input exceeds 5 MiB');
    sources.push({name:file==='-'?'stdin':file,text});
  }
  const report=analyze(sources,options);
  console.log(format==='json'?JSON.stringify(report,null,2):markdown(report));
  if((failOn==='findings'&&report.findings.length)||(failOn==='new'&&report.summary.new))process.exitCode=1;
}
async function boundedRead(path){const s=await stat(path);if(!s.isFile()||s.size>MAX_BYTES)throw Error('Expected regular file of at most 5 MiB');const text=await readFile(path,'utf8');if(Buffer.byteLength(text)>MAX_BYTES)throw Error('Input exceeds 5 MiB');return text;}
async function readStdin(){const chunks=[];let n=0;for await(const chunk of process.stdin){n+=chunk.length;if(n>MAX_BYTES)throw Error('Input exceeds 5 MiB');chunks.push(chunk);}return Buffer.concat(chunks).toString('utf8');}
main().catch(e=>{console.error(`CIFuse: ${e.message}`);process.exitCode=2;});
