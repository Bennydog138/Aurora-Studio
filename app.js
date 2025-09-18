const form = document.getElementById('orderForm');
const toast = document.getElementById('toast');

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 3200);
}

// Submit order to Firestore
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(form);
  const name = fd.get('name').trim();
  const email = fd.get('email').trim();
  const service = fd.get('service');
  const budget = fd.get('budget').trim();
  const details = fd.get('details').trim();

  if(!name || !email || !details){
    showToast('Please fill name, email, and details.');
    return;
  }

  const order = {
    name,
    email,
    service,
    budget,
    details,
    status: 'pending',
    notes: '',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection('orders').add(order);
    form.reset();
    showToast('Order placed successfully!');
  } catch(err) {
    console.error(err);
    showToast('Error saving order.');
  }
});

document.getElementById('clearBtn').addEventListener('click', ()=> form.reset());
