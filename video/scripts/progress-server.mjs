// Tiny dashboard so the render can be watched from the browser.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'out');
const port = Number(process.env.PORT || 3333);

const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>BETTING LAB — рендер</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;background:#04070e;color:#eef4ff;font-family:system-ui,Segoe UI,Roboto,sans-serif;padding:40px}
h1{letter-spacing:.2em;font-size:22px;color:#4cc9ff;margin:0 0 6px}
.sub{color:#9fb3cf;margin-bottom:28px}
.bar{height:16px;background:#14203a;border-radius:8px;overflow:hidden}
.bar>div{height:100%;background:linear-gradient(90deg,#4cc9ff,#35e08c);transition:width .5s}
.total{font-size:56px;font-weight:800;margin:10px 0}
table{width:100%;border-collapse:collapse;margin-top:28px}
td{padding:10px 8px;border-bottom:1px solid #1a2640}
.st-done{color:#35e08c}.st-rendering{color:#ffc63d}.st-queued{color:#6c7f9c}.st-error{color:#ff3b57}
.mini{width:240px}.mini .bar{height:8px}
img{max-width:100%;border-radius:10px;margin-top:24px;border:1px solid #1a2640}
</style></head><body>
<h1>BETTING LAB · РЕНДЕР</h1><div class="sub" id="sub">загрузка…</div>
<div class="total" id="pct">0%</div><div class="bar"><div id="tb" style="width:0"></div></div>
<table id="t"></table><img id="prev" alt="">
<script>
const L={queued:'в очереди',rendering:'рендерится',encoding:'кодируется',done:'готово',error:'ошибка'};
async function tick(){
 try{const s=await (await fetch('status.json?'+Date.now())).json();
 const tot=s.parts.reduce((a,p)=>a+p.frames,0), done=s.parts.reduce((a,p)=>a+Math.min(p.rendered,p.frames),0);
 const pct=(100*done/tot);
 document.getElementById('pct').textContent=pct.toFixed(1)+'%';
 document.getElementById('tb').style.width=pct+'%';
 const el=(Date.now()-s.startedAt)/1000, eta=done?el*(tot-done)/done:0;
 const fm=x=>Math.floor(x/60)+' мин '+Math.round(x%60)+' с';
 document.getElementById('sub').textContent=s.message+' · прошло '+fm(el)+(done&&pct<100?' · осталось ≈ '+fm(eta):'');
 document.getElementById('t').innerHTML=s.parts.map(p=>'<tr><td>'+p.title+'</td><td class="st-'+p.state+'">'+L[p.state]+'</td><td class="mini"><div class="bar"><div style="width:'+(100*Math.min(p.rendered,p.frames)/p.frames)+'%"></div></div></td><td>'+Math.min(p.rendered,p.frames)+' / '+p.frames+'</td></tr>').join('');
 if(s.preview){const i=document.getElementById('prev');const src='preview.jpg?'+s.preview;if(i.dataset.v!==String(s.preview)){i.src=src;i.dataset.v=s.preview;}}
 }catch(e){}
}
tick();setInterval(tick,2000);
</script></body></html>`;

http
  .createServer((req, res) => {
    const u = req.url.split('?')[0];
    if (u === '/' || u === '/index.html') {
      res.writeHead(200, {'content-type': 'text/html; charset=utf-8'});
      return res.end(html);
    }
    const file = {'/status.json': 'status.json', '/preview.jpg': 'preview.jpg'}[u];
    if (file && fs.existsSync(path.join(root, file))) {
      res.writeHead(200, {'content-type': file.endsWith('json') ? 'application/json' : 'image/jpeg', 'cache-control': 'no-store'});
      return fs.createReadStream(path.join(root, file)).pipe(res);
    }
    res.writeHead(404);
    res.end();
  })
  .listen(port, '0.0.0.0', () => console.log(`progress on :${port}`));
