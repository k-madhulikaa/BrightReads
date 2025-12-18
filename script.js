function $id(id){ return document.getElementById(id); }
function saveCartToStorage(cart){ localStorage.setItem('brightreads_cart', JSON.stringify(cart)); }
function loadCartFromStorage(){ return JSON.parse(localStorage.getItem('brightreads_cart') || '[]'); }
function updateHeaderCounts(){
  const cart = loadCartFromStorage();
  const count = cart.length;
  // header spans on different pages (if exist)
  ['cart-count-header','cart-count-books','cart-count-review'].forEach(id=>{
    const el = $id(id);
    if(el) el.textContent = count;
  });
  const headerCounts = document.querySelectorAll('#cart-count-header, #cart-count-books, #cart-count-review');
  headerCounts.forEach(n => { if(n) n.textContent = count; });
}

// ---------- Cart functions ----------
function addToCart(name, price){
  const cart = loadCartFromStorage();
  cart.push({ name, price: Number(price) });
  saveCartToStorage(cart);
  updateHeaderCounts();
  showMiniToast(`${name} added to cart`);
}

function clearCart(){
  if(!confirm('Clear entire cart?')) return;
  saveCartToStorage([]);
  updateHeaderCounts();
  renderCartPage();
  showMiniToast('Cart cleared');
}

function removeCartItem(index){
  const cart = loadCartFromStorage();
  if(index >=0 && index < cart.length){
    cart.splice(index,1);
    saveCartToStorage(cart);
    updateHeaderCounts();
    renderCartPage();
  }
}

function getCartTotal(){
  const cart = loadCartFromStorage();
  return cart.reduce((s,i)=> s + Number(i.price), 0);
}

function downloadCart(){
  const cart = loadCartFromStorage();
  if(cart.length === 0){
    alert('Cart is empty');
    return;
  }

  let content = "BrightReads - Cart\n";
  content += "-------------------------\n\n";

  cart.forEach((item, index) => {
    content += `${index + 1}. Book Name : ${item.name}\n`;
    content += `   Price     : ₹${item.price}\n\n`;
  });

  content += "-------------------------\n";
  content += `Total Amount : ₹${getCartTotal()}\n`;
  content += "\nThank you for shopping with BrightReads!\n";

  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "BrightReads_Cart.txt";
  a.click();
}


// Checkout (simple simulation)
function checkout(){
  const cart = loadCartFromStorage();
  if(cart.length === 0){ alert('Cart is empty'); return; }
  alert('Thank you! Your order total is ₹' + getCartTotal() + '. (Checkout simulated)');
  saveCartToStorage([]);
  updateHeaderCounts();
  renderCartPage();
}

// ---------- Render cart page if present ----------
function renderCartPage(){
  const list = $id('cart-list');
  const totalEl = $id('cart-total');
  if(!list) return;
  const cart = loadCartFromStorage();
  list.innerHTML = '';
  if(cart.length === 0){
    list.innerHTML = '<div class="empty">Your cart is empty.</div>';
  } else {
    cart.forEach((it, idx)=>{
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `
        <div>${idx+1}. <strong>${escapeHtml(it.name)}</strong></div>
        <div>₹${it.price} <button onclick="removeCartItem(${idx})" class="btn danger small">Remove</button></div>
      `;
      list.appendChild(div);
    });
  }
  if(totalEl) totalEl.textContent = 'Total: ₹' + getCartTotal();
}

// ---------- Review functions ----------
function loadReviews(){
  return JSON.parse(localStorage.getItem('brightreads_reviews') || '[]');
}
function saveReviewObj(obj){
  const arr = loadReviews();
  arr.unshift(obj);
  localStorage.setItem('brightreads_reviews', JSON.stringify(arr));
}
function renderReviews(){
  const container = $id('reviews-list');
  if(!container) return;
  const reviews = loadReviews();
  if(reviews.length === 0) { container.innerHTML = '<p>No reviews yet.</p>'; return; }
  container.innerHTML = '';
  reviews.forEach(r=>{
    const div = document.createElement('div');
    div.style.padding = '10px';
    div.style.marginBottom = '10px';
    div.style.background = '#fff';
    div.style.borderRadius = '8px';
    div.innerHTML = `<strong>${escapeHtml(r.name)}</strong> — ${escapeHtml(r.rating)}★
      <p style="margin:6px 0 0;color:#444">${escapeHtml(r.text)}</p>`;
    container.appendChild(div);
  });
}
function submitReview(ev){
  ev.preventDefault();
  const name = $id('rev-name').value.trim();
  const rating = $id('rev-rating').value;
  const text = $id('rev-text').value.trim();
  if(!name || !rating || !text){ alert('Please complete the form'); return; }
  saveReviewObj({ name, rating, text, date: new Date().toISOString() });
  $id('review-form').reset();
  renderReviews();
  showMiniToast('Review submitted. Thank you!');
}

// ---------- small helpers ----------
function renderAllCartPlaces(){ // updates counts and renders cart page if present
  updateHeaderCounts();
  renderCartPage();
}
function viewDetails(title, author, desc, price){
  alert(`${title}\\nby ${author}\\n\\n${desc}\\n\\nPrice: ₹${price}`);
}
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

// tiny toast
function showMiniToast(message){
  const existing = document.querySelector('.mini-toast');
  if(existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'mini-toast';
  div.textContent = message;
  Object.assign(div.style, {
    position:'fixed', right:'20px', bottom:'20px', background:'#111', color:'#fff',
    padding:'10px 14px', borderRadius:'8px', opacity:0.95, zIndex:9999
  });
  document.body.appendChild(div);
  setTimeout(()=>{ div.remove(); }, 2200);
}

// ---------- initializers ----------
document.addEventListener('DOMContentLoaded', ()=>{
  // show current year where needed
  const y = new Date().getFullYear();
  ['year','year-books','year-cart','year-review'].forEach(id=>{
    const el = $id(id); if(el) el.textContent = y;
  });

  // If on review page, render reviews and hook form
  if($id('reviews-list')) renderReviews();
  const form = $id('review-form');
  if(form) form.addEventListener('submit', submitReview);

  // If on cart page, render cart
  renderAllCartPlaces();
});
