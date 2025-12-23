function $id(id) {
  return document.getElementById(id);
}

function saveCartToStorage(cart) {
  localStorage.setItem("brightreads_cart", JSON.stringify(cart));
}

function loadCartFromStorage() {
  return JSON.parse(localStorage.getItem("brightreads_cart") || "[]");
}

/* HEADER CART COUNT */
function updateHeaderCounts() {
  const cart = loadCartFromStorage();
  const count = cart.length;

  ["cart-count-header", "cart-count-books", "cart-count-review"].forEach(id => {
    const el = $id(id);
    if (el) el.textContent = count;
  });
}

function addToCart(name, price) {
  const cart = loadCartFromStorage();
  cart.push({ name, price: Number(price) });
  saveCartToStorage(cart);
  updateHeaderCounts();
  showMiniToast(`${name} added to cart`);
}

function clearCart() {
  if (!confirm("Clear entire cart?")) return;
  saveCartToStorage([]);
  updateHeaderCounts();
  renderCartPage();
  showMiniToast("Cart cleared");
}

function removeCartItem(index) {
  const cart = loadCartFromStorage();
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    saveCartToStorage(cart);
    updateHeaderCounts();
    renderCartPage();
  }
}

function getCartTotal() {
  const cart = loadCartFromStorage();
  return cart.reduce((sum, item) => sum + Number(item.price), 0);
}

/* LIVE BILL */
function renderLiveBill() {
  const billDiv = document.getElementById("bill-section");
  if (!billDiv) return;

  const cart = loadCartFromStorage();
  billDiv.innerHTML = "";

  if (cart.length === 0) {
    billDiv.innerHTML = "<p>No items to display bill.</p>";
    return;
  }

  let html = "<h3>Billing Details</h3>";

  cart.forEach((item, index) => {
    html += `
      <div class="bill-row">
        <span>${index + 1}. ${escapeHtml(item.name)}</span>
        <span>₹${item.price}</span>
      </div>
    `;
  });

  html += `
    <div class="bill-total">
      Total Amount: ₹${getCartTotal()}
    </div>
  `;

  billDiv.innerHTML = html;
}

/* CHECKOUT */
function checkout() {
  const cart = loadCartFromStorage();
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }
  alert("Thank you! Your order total is ₹" + getCartTotal());
  saveCartToStorage([]);
  updateHeaderCounts();
  renderCartPage();
}

function renderCartPage() {
  const list = $id("cart-list");
  const totalEl = $id("cart-total");
  if (!list) return;

  const cart = loadCartFromStorage();
  list.innerHTML = "";

  if (cart.length === 0) {
    list.innerHTML = "<div class='empty'>Your cart is empty.</div>";
  } else {
    cart.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div>${index + 1}. <strong>${escapeHtml(item.name)}</strong></div>
        <div>
          ₹${item.price}
          <button onclick="removeCartItem(${index})" class="btn danger small">
            Remove
          </button>
        </div>
      `;
      list.appendChild(div);
    });
  }

  if (totalEl) totalEl.textContent = "Total: ₹" + getCartTotal();
  renderLiveBill();
}

/* REVIEWS */
function loadReviews() {
  return JSON.parse(localStorage.getItem("brightreads_reviews") || "[]");
}

function saveReviewObj(obj) {
  const reviews = loadReviews();
  reviews.unshift(obj);
  localStorage.setItem("brightreads_reviews", JSON.stringify(reviews));
}

function renderReviews() {
  const container = $id("reviews-list");
  if (!container) return;

  const reviews = loadReviews();
  if (reviews.length === 0) {
    container.innerHTML = "<p>No reviews yet.</p>";
    return;
  }

  container.innerHTML = "";
  reviews.forEach(r => {
    const div = document.createElement("div");
    div.style.padding = "10px";
    div.style.marginBottom = "10px";
    div.style.background = "#fff";
    div.style.borderRadius = "8px";
    div.innerHTML = `
      <strong>${escapeHtml(r.name)}</strong>
      <span style="color:#6b7280;font-size:13px">
        (${escapeHtml(r.email)})
      </span>
      — ${r.rating}★
      <p style="margin:6px 0 0;color:#444">${escapeHtml(r.text)}</p>
    `;
    container.appendChild(div);
  });
}

function submitReview(event) {
  event.preventDefault();

  const name = $id("rev-name").value.trim();
  const email = $id("rev-email").value.trim();
  const rating = $id("rev-rating").value;
  const text = $id("rev-text").value.trim();

  if (!name || !email || !rating || !text) {
    alert("Please complete the form");
    return;
  }

  saveReviewObj({
    name,
    email,
    rating,
    text,
    date: new Date().toISOString()
  });

  $id("review-form").reset();
  renderReviews();
  showMiniToast("Review submitted. Thank you!");
}

/* HELPERS */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
  );
}

function showMiniToast(message) {
  const old = document.querySelector(".mini-toast");
  if (old) old.remove();

  const div = document.createElement("div");
  div.className = "mini-toast";
  div.textContent = message;
  Object.assign(div.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    background: "#111",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "8px",
    zIndex: 9999
  });

  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2200);
}

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderCounts();
  renderCartPage();
  if ($id("reviews-list")) renderReviews();
});
