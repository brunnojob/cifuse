import {cp,mkdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/src',{recursive:true});
await cp('site','dist',{recursive:true});await cp('src','dist/src',{recursive:true});
console.log('Static site built in dist/');
