(async function(){
  const ADMIN_PASS = 'BensServices!722';
  const board = document.getElementById('board');
  const cols = {
    pending: document.getElementById('col-pending'),
    inprogress: document.getElementById('col-inprogress'),
    complete: document.getElementById('col-complete')
  };
  const statsEl = document.getElementById('stats');
  const toast = document.getElementById('toast');
  const exportBtn = document.getElementById('exportBtn');
  const segs = document.querySelectorAll('.seg');
  const logoutBtn = document.getElementById('logoutBtn');

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 2800);
  }

  function ensureAuth(){
    if(localStorage.getItem('sop_admin_auth') === '1') return true;
    const pw = prompt('Enter admin password:');
    if(pw === ADMIN_PASS){ localStorage.setItem('sop_admin_auth','1'); return true; }
    alert('Wrong password'); return false;
  }
  if(!ensureAuth()){ window.location.href='index.html'; }

  async function fetchOrders(){
    const snapshot = await db.collection('orders').orderBy('createdAt','desc').get();
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  }

  function renderStats(orders){
    const total = orders.length;
    const pending = orders.filter(o=>o.status==='pending').length;
    const inprogress = orders.filter(o=>o.status==='inprogress').length;
    const complete = orders.filter(o=>o.status==='complete').length;
    statsEl.innerHTML = `
      <div class="stat"><div>Total</div><div style="font-weight:800">${total}</div></div>
      <div class="stat"><div>Pending</div><div style="font-weight:800">${pending}</div></div>
      <div class="stat"><div>In prog.</div><div style="font-weight:800">${inprogress}</div></div>
      <div class="stat"><div>Complete</div><div style="font-weight:800">${complete}</div></div>
    `;
  }

  function createCard(o){
    const el = document.createElement('div');
    el.className = 'card-order';
    el.setAttribute('draggable','true');
    el.dataset.id = o.id;
    el.innerHTML = `
      <h5>${o.service} — ${o.name}</h5>
      <div class="meta">${o.email} • ${o.budget||'—'} • ${o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : ''}</div>
      <div class="note">${o.details.length>180 ? o.details.slice(0,180)+'…' : o.details}</div>
      <div style="margin-top:8px;display:flex;gap:8px;align-items:center;justify-content:flex-end">
        <span class="tag ${o.status}">${o.status}</span>
        <button class="btn small edit">Edit</button>
        <button class="btn ghost small del">Del</button>
      </div>
    `;
    el.querySelector('.del').addEventListener('click', async ()=>{
      if(!confirm('Delete order '+o.id+'?')) return;
      await db.collection('orders').doc(o.id).delete();
      await refreshBoard();
      showToast('Order deleted');
    });
    el.querySelector('.edit').addEventListener('click', async ()=>{
      const note = prompt('Edit admin note:', o.notes||'');
      if(note===null) return;
      await db.collection('orders').doc(o.id).update({
        notes: note,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      await refreshBoard();
      showToast('Note saved');
    });
    el.addEventListener('dragstart',(e)=> e.dataTransfer.setData('text/plain', o.id));
    return el;
  }

  async function renderBoard(orders){
    Object.values(cols).forEach(c=> c.innerHTML='');
    const byStatus = { pending: [], inprogress: [], complete: [] };
    orders.forEach(o=> (byStatus[o.status] = byStatus[o.status]||[]).push(o));
    ['pending','inprogress','complete'].forEach(s=>{
      byStatus[s].forEach(o=> cols[s].appendChild(createCard(o)));
    });
    renderStats(orders);
  }

  async function refreshBoard(){
    const orders = await fetchOrders();
    const activeFilter = document.querySelector('.seg.active')?.dataset.filter || 'all';
    if(activeFilter==='all') renderBoard(orders);
    else renderBoard(orders.filter(o=>o.status===activeFilter).concat(orders.filter(o=>o.status!==activeFilter)));
  }

  Object.entries(cols).forEach(([status, el])=>{
    el.addEventListener('dragover', e=> { e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', ()=> el.classList.remove('over'));
    el.addEventListener('drop', async e=>{
      e.preventDefault(); el.classList.remove('over');
      const id = e.dataTransfer.getData('text/plain');
      if(!id) return;
      await db.collection('orders').doc(id).update({
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      await refreshBoard();
      showToast('Status moved to '+status);
    });
  });

  segs.forEach(s=> s.addEventListener('click', async ()=>{
    segs.forEach(x=> x.classList.remove('active'));
    s.classList.add('active');
    await refreshBoard();
  }));

  exportBtn.addEventListener('click', async ()=>{
    const snapshot = await db.collection('orders').get();
    const rows = snapshot.docs.map(doc=> ({id: doc.id, ...doc.data()}));
    if(rows.length===0){ showToast('No orders to export'); return; }
    const headers = ['id','name','email','service','budget','details','status','notes','createdAt','updatedAt'];
    const csv = [headers.join(',')].concat(rows.map(r=> headers.map(h=> `"${(r[h]||'').toString().replace(/"/g,'""').replace(/\n/g,' ')}"`).join(','))).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
  });

  logoutBtn.addEventListener('click', ()=>{
    localStorage.removeItem('sop_admin_auth');
    showToast('Logged out');
    setTimeout(()=> location.href='index.html',800);
  });

  await refreshBoard();

})();
