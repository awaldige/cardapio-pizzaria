// BANCO DE DADOS COMPLETO
const menuData = {
    pizzas: [
        { name: "Pizza Margherita", price: 25.00 },
        { name: "Pizza de Mussarela", price: 30.00 },
        { name: "Pizza Portuguesa", price: 32.00 },
        { name: "Pizza Frango com Catupiry", price: 30.00 },
        { name: "Pizza Pepperoni", price: 30.00 },
        { name: "Pizza Calabresa", price: 32.00 },
        { name: "Pizza Quatro Queijos", price: 35.00 },
        { name: "Pizza Vegetariana", price: 28.00 },
        { name: "Pizza de Rúcula", price: 40.00 },
        { name: "Pizza de Atum", price: 30.00 },
        { name: "Pizza de Camarão", price: 50.00 },
        { name: "Pizza de Palmito", price: 35.00 }
    ],
    drinks: [
        { name: "Água Mineral", price: 3.00 },
        { name: "Refrigerante Lata", price: 5.00 },
        { name: "Cerveja Lata", price: 8.00 },
        { name: "Suco de Uva", price: 6.00 },
        { name: "Suco de Morango", price: 7.50 },
        { name: "Suco de Maracujá", price: 6.80 },
        { name: "Suco de Laranja", price: 5.50 },
        { name: "Suco de Limão", price: 5.50 },
        { name: "Suco de Abacaxi", price: 7.00 }
    ],
    desserts: [
        { name: "Pudim", price: 10.00 },
        { name: "Torta de Morango", price: 12.00 },
        { name: "Torta de Limão", price: 12.00 },
        { name: "Bolo de Chocolate", price: 15.00 },
        { name: "Pavê", price: 12.00 },
        { name: "Mousse de Maracujá", price: 10.00 },
        { name: "Gelatina", price: 5.00 }
    ]
};

let cart = JSON.parse(localStorage.getItem('aw_pizzaria_cart')) || [];

// ELEMENTOS DOM
const pizzaList = document.getElementById('pizza-list');
const drinkList = document.getElementById('drink-list');
const dessertList = document.getElementById('dessert-list');
const orderList = document.getElementById('order-list');
const totalPriceElement = document.getElementById('total-price');

// INICIALIZAR CARDÁPIO
function init() {
    renderCategory(menuData.pizzas, pizzaList);
    renderCategory(menuData.drinks, drinkList);
    renderCategory(menuData.desserts, dessertList);
    updateCartUI();
}

function renderCategory(items, container) {
    container.innerHTML = items.map(item => `
        <li class="menu-item" data-name="${item.name}">
            <span>${item.name} - <strong>R$ ${item.price.toFixed(2)}</strong></span>
            <button class="add-to-order" onclick="addToCart('${item.name}', ${item.price})">Adicionar</button>
        </li>
    `).join('');
}

// LÓGICA DO CARRINHO
window.addToCart = (name, price) => {
    cart.push({ id: Date.now() + Math.random(), name, price });
    updateCartUI();
};

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

function updateCartUI() {
    orderList.innerHTML = cart.map(item => `
        <li>
            <span>${item.name} (R$ ${item.price.toFixed(2)})</span>
            <button class="remove-item" onclick="removeFromCart(${item.id})">Remover</button>
        </li>
    `).join('');

    const total = cart.reduce((acc, item) => acc + item.price, 0);
    totalPriceElement.textContent = total.toFixed(2);
    localStorage.setItem('aw_pizzaria_cart', JSON.stringify(cart));
}

// BUSCA
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.menu-item').forEach(el => {
        el.style.display = el.dataset.name.toLowerCase().includes(term) ? 'flex' : 'none';
    });
});

// WHATSAPP
document.getElementById('finalizar-pedido').addEventListener('click', () => {
    if (cart.length === 0) return alert("Adicione itens ao pedido!");
    
    const payment = document.getElementById('payment').value;
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    
    let msg = `*Pedido Pizzaria AW*%0A--------------------%0A`;
    cart.forEach(item => msg += `• ${item.name}%0A`);
    msg += `--------------------%0A*Total:* R$ ${total.toFixed(2)}%0A*Pagamento:* ${payment.toUpperCase()}`;
    
    window.open(`https://wa.me/5511985878638?text=${msg}`);
});

init();
