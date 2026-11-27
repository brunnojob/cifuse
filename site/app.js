import {enrich} from './src/context.js';
import {analyze,markdown,MAX_BYTES} from './src/engine.js';
const $=id=>document.getElementById(id);
const translations={
source:'Código-fonte',eyebrow:'OPEN SOURCE / OFFLINE POR PRINCÍPIO',headline:'Menos tempo nos logs.<br><em>Mais entregas.</em>',intro:'Seu build falhou. Sua próxima hora não precisa.<br>Transforme logs extensos de CI em sinais agrupados, evidências exatas e um plano de investigação.',try:'Abrir bancada ↘',add:'Adicionar ao GitHub Actions →',trait1:'Sem chaves de API',trait2:'Sem upload de logs',trait3:'Sem dependências de execução',copy:'Copiar',workspace:'01 / BANCADA DE INVESTIGAÇÃO',worktitle:'Encontre por onde começar.',local:'● Processado no seu dispositivo',input:'Log de build',sample:'Carregar exemplo',paste:'Cole seu log de build',upload:'Escolher arquivos de log',limit:'5 MiB no total · até 100 arquivos',compare:'Comparar com relatório anterior',baseline:'Relatório JSON anterior do CIFuse',clearBaseline:'Remover referência',analyze:'Analisar log →',privacy:'Os logs ficam na memória. Credenciais comuns são ocultadas nos relatórios, mas a proteção é parcial. Revise os arquivos antes de compartilhar.',report:'Relatório de investigação',ready:'Pronto',emptyTitle:'O sinal está aí.',empty:'Carregue o exemplo ou adicione um log para encontrar padrões de falha.',clear:'Limpar sessão',f1:'Evidências antes de suposições.',f1p:'Cada sinal indica arquivo e linha. As sugestões orientam a investigação; não comprovam a causa raiz.',f2:'Pare de ler o mesmo erro.',f2p:'Diagnósticos repetidos viram grupos com contagem de ocorrências. Compare relatórios JSON para encontrar assinaturas novas e resolvidas.',f3:'Um motor. Três formas de usar.',f3p:'Navegador, CLI e GitHub Action reutilizável usam as mesmas regras determinísticas. Sem modelo, conta ou backend.',community:'DESENVOLVIDO ABERTAMENTE',contribute:'Seu erro de build também cabe aqui.',contributeP:'Melhore uma regra, contribua com um log sem dados sensíveis ou mostre onde o relatório deixou passar uma evidência.',issue:'Enviar feedback →',footer:'Feito para o momento depois do check vermelho.',codeUpload:'Pasta de código e configuração (opcional, local)',codeHelp:'Até 500 arquivos / 4 MiB; 128 KiB por arquivo. node_modules, dist e .git são ignorados. Testes e correções são executados pela CLI.',limits:'Escopo e limitações'};
const originals=new Map([...document.querySelectorAll('[data-i18n]')].map(el=>[el,el.innerHTML]));
let lang='en',sources=[],baseline,report,codeFiles={};
try{lang=localStorage.getItem('cifuse.language')==='pt-BR'?'pt-BR':'en';}catch{}
function language(){$('export-status').textContent='';document.documentElement.lang=lang;document.title=lang==='en'?'CIFuse · CI failure workbench':'CIFuse · Investigação de falhas de CI';for(const [el,original] of originals){el.innerHTML=lang==='en'?original:translations[el.dataset.i18n];}$('language').textContent=lang==='en'?'PT-BR':'EN';$('language').setAttribute('aria-label',lang==='en'?'Switch language to Brazilian Portuguese':'Mudar idioma para inglês');$('log').placeholder=lang==='en'?'Paste a CI log here…':'Cole um log de CI aqui…';if(report)run();}
$('language').onclick=()=>{lang=lang==='en'?'pt-BR':'en';try{localStorage.setItem('cifuse.language',lang);}catch{}language();};
const t=(en,pt)=>lang==='en'?en:pt;
const node=(tag,text,className)=>{const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;};
function error(e){$('export-status').textContent='';$('results').replaceChildren(node('p',e.message,'error'));$('state').textContent=t('Input error','Erro de entrada');report=undefined;$('clear').hidden=true;}
function run(){$('export-status').textContent='';try{const input=sources.length?sources:[{name:'pasted.log',text:$('log').value}];if(!input.some(s=>s.text.trim()))throw Error(t('Add a log first.','Adicione um log primeiro.'));report=enrich(analyze(input,{lang,baseline}),codeFiles);render();}catch(e){error(e);}}
function render(){const root=$('results');root.replaceChildren();$('state').textContent=t('Analysis complete','Análise concluída');const s=report.summary;root.append(node('div',`${s.groups} ${t('groups','grupos')} / ${s.signals} ${t('signals','sinais')} / ${s.lines} ${t('lines','linhas')}`,'stats'));if(baseline)root.append(node('p',`${s.new} ${t('new','novos')} · ${s.resolved} ${t('resolved signatures','assinaturas resolvidas')}`,'stats'));root.append(node('p',t('Pattern matches, not a proven root cause. No signals does not prove success.','Correspondências de padrões, não uma causa comprovada. Nenhum sinal não comprova sucesso.'),'notice'));for(const f of report.findings){const card=node('article','','finding');const heading=node('h4',f.title);heading.append(node('span',`×${f.count}${baseline?' · '+t(f.status,f.status==='new'?'novo':'existente'):''}`));card.append(heading,node('code',f.evidence),node('p',f.hint));
if(f.role==='investigate-first')card.append(node('p',t('Investigate first — heuristic, not a proven cause.','Investigue primeiro — heurística, não causa comprovada.'),'notice'));
for(const d of f.codeDiagnostics||[])card.append(node('p',`${d.path}:${d.line}: ${d.specifier} → ${d.candidates.join(', ')||t('unresolved in supplied files','não resolvido nos arquivos fornecidos')}`));
for(const check of f.diagnosis?.checks.slice(1)||[])card.append(node('p',check));
for(const l of f.codeLocations||[]){const d=node('details','');d.append(node('summary',`${t('Code','Código')}: ${l.path}:${l.line} · ${l.verified?t('verified','verificado'):t('file not supplied or invalid line','arquivo não fornecido ou linha inválida')}`),node('pre',l.snippet.map(s=>`${s.line}: ${s.text}`).join('\n')));card.append(d);}
for(const l of f.locations){card.append(node('div',`${l.file}:${l.line}`,'location'));const d=node('details','');d.append(node('summary',t('Show context','Mostrar contexto')),node('pre',l.context.join('\n')));card.append(d);}root.append(card);}if(!s.groups)root.append(node('p',t('No known failure patterns found. Inspect the original log for unsupported errors.','Nenhum padrão conhecido encontrado. Inspecione o log original para erros não suportados.')));$('clear').hidden=false;}
$('code-files').onchange=async()=>{try{
 const selected=[...$('code-files').files].map(f=>({file:f,path:(f.webkitRelativePath||f.name).replace(/^[^/]+\//,'')})).filter(({file,path})=>file.size<=128*1024&&/\.(?:[cm]?[jt]sx?|py|rs|go|c|cpp|h|cs|json|ya?ml)$/.test(path)&&!/(^|\/)(node_modules|vendor|dist|\.git)\//.test(path)&&!/(?:^|\/)(?:package-lock|pnpm-lock|yarn\.lock)/.test(path));
 if(selected.length>500||selected.reduce((n,{file})=>n+file.size,0)>4*1024*1024)throw Error(t('Source limit: 500 files / 4 MiB.','Limite de código: 500 arquivos / 4 MiB.'));
 const next={};for(const {file,path} of selected)next[path]=await file.text();codeFiles=next;
 $('code-count').textContent=`${selected.length} ${t('source/config files loaded','arquivos de código/configuração carregados')}`;if(report)run();
}catch(e){codeFiles={};$('code-count').textContent='';error(e);}};
$('analyze').onclick=run;
$('log').oninput=()=>{sources=[];$('files').value='';};
$('files').onchange=async()=>{try{const files=[...$('files').files];if(files.length>100||files.reduce((s,f)=>s+f.size+new TextEncoder().encode(f.name).length,0)>MAX_BYTES)throw Error(t('Maximum 100 files / 5 MiB total.','Máximo de 100 arquivos / 5 MiB no total.'));sources=await Promise.all(files.map(async f=>({name:f.name,text:await f.text()})));$('log').value=sources.map(s=>`--- ${s.name} ---\n${s.text}`).join('\n');}catch(e){sources=[];$('log').value='';error(e);}};
$('baseline').onchange=async()=>{try{baseline=undefined;const f=$('baseline').files[0];if(!f)return;if(f.size>MAX_BYTES)throw Error(t('Baseline exceeds 5 MiB.','Referência excede 5 MiB.'));const value=JSON.parse(await f.text());analyze([],{baseline:value});baseline=value;if(report)run();}catch(e){error(e);}};
$('clear-baseline').onclick=()=>{baseline=undefined;$('baseline').value='';if(report)run();};
const sample=`Starting build (illustrative fixture)
src/api.ts(12,7): error TS2322: Type 'string' is not assignable to type 'number'.
src/api.ts(12,7): error TS2322: Type 'string' is not assignable to type 'number'.
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: connect ECONNREFUSED 127.0.0.1:5432
FAIL tests/auth.test.ts
AssertionError: expected 200, received 503
Process completed with exit code 1`;
$('sample').onclick=()=>{sources=[];$('files').value='';$('log').value=sample;run();};
for (const format of ['json', 'markdown']) {
  $(format).onclick = () => {
    const status = $('export-status');
    if (!report) {
      status.textContent = t('Analyze a log before downloading a report.', 'Analise um log antes de baixar um relatório.');
      return;
    }
    const json = format === 'json';
    const url = URL.createObjectURL(new Blob(
      [json ? JSON.stringify(report, null, 2) : markdown(report)],
      {type: json ? 'application/json' : 'text/markdown'}
    ));
    const link = document.createElement('a');
    link.href = url;
    link.download = json ? 'cifuse-report.json' : 'cifuse-report.md';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    const label = json ? 'JSON' : 'Markdown';
    status.textContent = t(`Requested ${label} report download.`, `Download do relatório ${label} solicitado.`);
  };
}
$('clear').onclick=()=>{$('export-status').textContent='';sources=[];baseline=undefined;report=undefined;codeFiles={};$('code-files').value='';$('code-count').textContent='';$('log').value='';$('files').value='';$('baseline').value='';$('results').replaceChildren(node('p',t('Session cleared. Add a new log to begin.','Sessão limpa. Adicione um log para começar.')));$('state').textContent=t('Ready','Pronto');$('clear').hidden=true;};
$('copy-command').onclick=async()=>{try{await navigator.clipboard.writeText('npx --yes github:brunnojob/cifuse --demo');$('copy-command').textContent=t('Copied','Copiado');}catch{$('copy-command').textContent=t('Select the command to copy','Selecione o comando para copiar');}};
language();
