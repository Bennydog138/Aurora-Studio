// Premium client-side order logic (index.html)
(function(){
  const LS_KEY = 'sop_orders_premium';
  const form = document.getElementById('orderForm');
  const toast = document.getElementById('toast');
  const clearBtn = document.getElementById('clearBtn');

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 3200);
  }

  function loadOrders(){ try{ return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }catch(e){return [];} }
  function saveOrders(arr){ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get('name').trim();
    const email = fd.get('email').trim();
    const service = fd.get('service');
    const budget = fd.get('budget').trim();
    const details = fd.get('details').trim();
    if(!name || !email || !details){ showToast('Please fill name, email and details.'); return; }
    const id = 'ORD-' + Date.now().toString(36);
    const order = { id, name, email, service, budget, details, status: 'pending', notes:'', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const arr = loadOrders();
    arr.unshift(order);
    saveOrders(arr);
    form.reset();
    showToast('Order placed — Admin will review it.');
  });

  clearBtn.addEventListener('click', ()=> form.reset());
})();
