// Simple product details modal controller
(function(){
  const modal = document.getElementById('product-modal');
  if (!modal) return;
  const title = document.getElementById('modal-title');
  const img = document.getElementById('modal-img');
  const desc = document.getElementById('modal-desc');
  const qty = document.getElementById('modal-qty');
  const addBtn = document.getElementById('modal-add');
  const closeBtn = document.getElementById('modal-close');

  function open(product) {
    title.textContent = product.name || '';
    img.src = product.image || '';
    desc.textContent = product.description || '';
    qty.value = product.quantity || 1;
    addBtn.onclick = function(){
      const q = Number(qty.value) || 1;
      // call global addToCart if available
      if (window.addToCart) {
        window.addToCart(product.id, product.name, product.price, product.image, q);
        close();
      } else {
        console.warn('addToCart not found');
      }
    };
    modal.style.display = 'flex';
  }

  function close(){
    modal.style.display = 'none';
  }

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function(e){ if (e.target === modal) close(); });

  window.openProductDetails = open;
})();
