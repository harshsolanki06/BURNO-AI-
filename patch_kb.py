"""Patch burno.html to add the Knowledge Base view and sidebar nav"""

with open('frontend/public/burno.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Enable knowledge nav item click
html = html.replace(
    '<div class="ni" data-t="Knowledge">&#128218;</div>',
    '<div class="ni" data-t="Knowledge" onclick="go(\'knowledge\',this)">&#128218;</div>'
)

# 2. Add knowledge view just before the voice view
knowledge_view = '''
    <!-- ===== KNOWLEDGE VIEW ===== -->
    <div class="view" id="view-knowledge">
      <div class="scroll-view">
        <div class="view-header">
          <div>
            <div class="view-title">&#128218; Knowledge Base</div>
            <div class="view-sub">Upload documents &mdash; BURNO extracts, chunks and makes them searchable</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="loadKB()">&#8635; Refresh</button>
        </div>
        <div class="stat-strip">
          <div class="stat-box"><div class="stat-val" style="color:#00E5FF" id="kbDocs">0</div><div class="stat-lbl">Documents</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#10B981" id="kbChunks">0</div><div class="stat-lbl">Chunks</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#8B5CF6" id="kbSize">0 B</div><div class="stat-lbl">Storage</div></div>
          <div class="stat-box"><div class="stat-val" style="color:#F59E0B" id="kbTypes">0</div><div class="stat-lbl">File Types</div></div>
        </div>
        <div id="kbDropZone" style="padding:28px;text-align:center;border-radius:14px;border:2px dashed rgba(0,229,255,.2);background:rgba(255,255,255,.02);cursor:pointer;margin-bottom:14px;transition:all .25s" onclick="document.getElementById('kbFileInput').click()">
          <input type="file" id="kbFileInput" multiple accept=".pdf,.txt,.md,.docx" style="display:none" onchange="uploadKBFiles(this.files)"/>
          <div id="kbDropContent">
            <div style="font-size:32px;margin-bottom:10px">&#128194;</div>
            <div style="font-size:14px;font-weight:600;color:#e2eeff;margin-bottom:5px">Drop files or click to upload</div>
            <div style="font-size:11px;color:var(--d)">PDF &middot; TXT &middot; Markdown &middot; DOCX &mdash; max 20 MB each</div>
          </div>
        </div>
        <div style="position:relative;margin-bottom:12px">
          <input type="text" id="kbSearch" placeholder="Search across all documents..." oninput="searchKB()" style="width:100%;padding:10px 14px 10px 38px;background:rgba(255,255,255,.03);border:1px solid rgba(0,229,255,.2);border-radius:12px;color:#e2eeff;font-size:12px;font-family:Inter,sans-serif;outline:none"/>
        </div>
        <div id="kbDocList"><div class="mem-empty">Loading...</div></div>
      </div>
    </div>
'''

html = html.replace('    <!-- ===== VOICE VIEW ===== -->', knowledge_view + '    <!-- ===== VOICE VIEW ===== -->')

# 3. Add KB JS before the closing </script>
kb_js = """
// ============================================================
// KNOWLEDGE BASE
// ============================================================
async function loadKB(){await Promise.all([loadKBStats(),loadKBDocs(null)])}
async function loadKBStats(){
  try{
    const r=await fetch('http://localhost:8000/api/knowledge/stats/summary',{signal:AbortSignal.timeout(5000)});
    const d=await r.json();
    document.getElementById('kbDocs').textContent=d.total_documents||0;
    const tc=d.total_chunks||0;document.getElementById('kbChunks').textContent=tc>999?Math.floor(tc/1000)+'K':tc;
    const b=d.total_size_bytes||0;document.getElementById('kbSize').textContent=b<1024?b+'B':b<1048576?(b/1024).toFixed(1)+'KB':(b/1048576).toFixed(1)+'MB';
    document.getElementById('kbTypes').textContent=Object.keys(d.file_types||{}).length;
  }catch(e){}
}
const KB_ICONS={pdf:'&#128213;',txt:'&#128196;',md:'&#128221;',docx:'&#128216;',doc:'&#128216;'};
const KB_COLORS={pdf:'#ef4444',txt:'#10b981',md:'#3b82f6',docx:'#8b5cf6',doc:'#8b5cf6'};
async function loadKBDocs(q){
  const el=document.getElementById('kbDocList');
  el.innerHTML='<div class="mem-empty">Loading...</div>';
  try{
    let url=q?('http://localhost:8000/api/knowledge/search?q='+encodeURIComponent(q)+'&limit=20'):'http://localhost:8000/api/knowledge/documents?limit=50';
    const r=await fetch(url,{signal:AbortSignal.timeout(6000)});const d=await r.json();
    const docs=d.results||d.documents||[];
    if(!docs.length){el.innerHTML='<div class="mem-empty">'+(q?'No results for &ldquo;'+q+'&rdquo;':'No documents yet. Upload a file above.')+'</div>';return}
    el.innerHTML='';
    docs.forEach(function(doc){
      const cc=KB_COLORS[doc.file_type]||'#00E5FF',ic=KB_ICONS[doc.file_type]||'&#128196;';
      const sz=doc.size_bytes<1024?doc.size_bytes+'B':doc.size_bytes<1048576?(doc.size_bytes/1024).toFixed(1)+'KB':(doc.size_bytes/1048576).toFixed(1)+'MB';
      const dt=doc.created_at?new Date(doc.created_at).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';
      const hits=(doc.matching_chunks||[]).slice(0,2).map(function(c){return '<div style="padding:8px 10px;border-radius:8px;background:rgba(245,158,11,.05);border:1px solid rgba(245,158,11,.12);font-size:11px;color:#e2eeff;line-height:1.6;margin-top:6px">'+c+'</div>'}).join('');
      const card=document.createElement('div');card.className='mem-card';card.style.borderColor=cc+'20';
      card.innerHTML='<div class="mem-card-top"><div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0"><div style="width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;background:'+cc+'10;border:1px solid '+cc+'20;flex-shrink:0">'+ic+'</div><div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;color:#e2eeff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+doc.filename+'</div><div style="font-size:9px;color:var(--d);margin-top:2px">'+sz+' &middot; '+doc.chunk_count+' chunks &middot; '+dt+(doc.match_count?' &middot; '+doc.match_count+' match':'')+' </div></div></div><div><button class="btn btn-danger btn-sm" onclick="deleteKBDoc(\''+doc.id+'\',this)">&#128465;</button></div></div>'+hits+'<div style="font-size:11px;color:var(--m);line-height:1.6;margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">'+(doc.preview||'')+'</div>';
      el.appendChild(card);
    });
  }catch(e){document.getElementById('kbDocList').innerHTML='<div class="mem-empty">Could not load. Backend may be offline.</div>'}
}
let kbST=null;
function searchKB(){clearTimeout(kbST);const q=document.getElementById('kbSearch').value.trim();kbST=setTimeout(function(){loadKBDocs(q||null)},400)}
async function deleteKBDoc(id,btn){
  btn.textContent='...';btn.disabled=true;
  try{await fetch('http://localhost:8000/api/knowledge/'+id,{method:'DELETE',signal:AbortSignal.timeout(5000)});loadKB();ale('Knowledge doc deleted','')}
  catch(e){btn.textContent='&#128465;';btn.disabled=false}
}
async function uploadKBFiles(files){
  if(!files||!files.length)return;
  const dc=document.getElementById('kbDropContent');
  const dz=document.getElementById('kbDropZone');
  dz.style.pointerEvents='none';
  for(const file of Array.from(files)){
    dc.innerHTML='<div style="font-size:12px;color:#00E5FF">Uploading '+file.name+'...</div>';
    const form=new FormData();form.append('file',file);
    try{
      const r=await fetch('http://localhost:8000/api/knowledge/upload',{method:'POST',body:form,signal:AbortSignal.timeout(30000)});
      const d=await r.json();
      if(d.uploaded){dc.innerHTML='<div style="font-size:12px;color:#10B981">&#9989; '+d.filename+' &mdash; '+d.chunk_count+' chunks extracted</div>';ale('Knowledge uploaded',d.filename+' indexed')}
      else{dc.innerHTML='<div style="font-size:12px;color:#ef4444">&#10060; '+(d.detail||'Upload failed')+'</div>'}
    }catch(e){dc.innerHTML='<div style="font-size:12px;color:#ef4444">&#10060; Upload failed &mdash; check backend</div>'}
    await new Promise(function(res){setTimeout(res,1200)});
  }
  dc.innerHTML='<div style="font-size:32px;margin-bottom:10px">&#128194;</div><div style="font-size:14px;font-weight:600;color:#e2eeff;margin-bottom:5px">Drop files or click to upload</div><div style="font-size:11px;color:var(--d)">PDF &middot; TXT &middot; Markdown &middot; DOCX &mdash; max 20 MB</div>';
  dz.style.pointerEvents='';
  loadKB();
}
"""

html = html.replace('</script>', kb_js + '</script>', 1)

with open('frontend/public/burno.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f'Done. burno.html = {len(html):,} chars')
