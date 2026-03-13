/**
 * BANCO DE DADOS: Centralização de dados para facilitar manutenção.
 * Em um projeto real, isso poderia vir de uma API.
 */
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

/**
 * ESTADO DA APLICAÇÃO
 * Recupera dados do localStorage ou inicia um array vazio.
 */
let cart = JSON.parse(localStorage.getItem('aw_pizzaria_cart')) || [];

// ELEMENTOS DO DOM
const domElements = {
    pizzaList: document.getElementById('pizza-list'),
    drinkList: document.getElementById('drink-list'),
    dessertList: document.getElementById('dessert-list'),
    orderList: document.getElementById('order-list'),
    totalPrice: document.getElementById('total-price'),
    searchInput: document.getElementById('search-input'),
    btnFinalizar: document.getElementById('finalizar-pedido'),
    paymentSelect: document.getElementById('payment')
};

/**
 * RENDERIZAÇÃO DO CARDÁPIO
 */
function renderCategory(items, container) {
    if (!container) return;
    container.innerHTML = items.map(item => `
        <li class="menu-item" data-name="${item.name}">
            <div class="item-info">
                <span class="item-name">${item.name}</span>
                <span class="item-price">R$ ${item.price.toFixed(2)}</span>
            </div>
            <button class="add-to-order" onclick="addToCart('${item.name}', ${item.price})">
                + Adicionar
            </button>
        </li>
    `).join('');
}

/**
 * LÓGICA DO CARRINHO
 */
window.addToCart = (name, price) => {
    // Cria um ID único para cada item, permitindo remover duplicatas individualmente
    const item = { id: Date.now() + Math.random(), name, price };
    cart.push(item);
    updateCartUI();
};

window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

function updateCartUI() {
    // Renderiza a lista de itens no resumo
    domElements.orderList.innerHTML = cart.map(item => `
        <li>
            <span>${item.name}</span>
            <div class="cart-item-actions">
                <span>R$ ${item.price.toFixed(2)}</span>
                <button class="remove-item" onclick="removeFromCart(${item.id})" title="Remover item">×</button>
            </div>
        </li>
    `).join('');

    // Cálculo do total usando reduce (Método funcional)
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    domElements.totalPrice.textContent = total.toFixed(2);
    
    // Persistência de dados
    localStorage.setItem('aw_pizzaria_cart', JSON.stringify(cart));
}

/**
 * BUSCA E FILTRO EM TEMPO REAL
 */
domElements.searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const allItems = document.querySelectorAll('.menu-item');
    
    allItems.forEach(el => {
        const name = el.dataset.name.toLowerCase();
        // Operador ternário para controle de exibição
        el.style.display = name.includes(term) ? 'flex' : 'none';
    });
});

/**
 * INTEGRAÇÃO COM WHATSAPP
 */
domElements.btnFinalizar.addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Ops! Seu carrinho está vazio. Escolha uma delícia antes de finalizar!");
        return;
    }
    
    const payment = domElements.paymentSelect.value;
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    
    // Formatação da mensagem para o WhatsApp
    let msg = `*🍕 NOVO PEDIDO - PIZZARIA AW*%0A`;
    msg += `--------------------------------%0A`;
    
    // Agrupa itens repetidos para a mensagem ficar mais limpa
    const summary = {};
    cart.forEach(item => summary[item.name] = (summary[item.name] || 0) + 1);
    
    for (let name in summary) {
        msg += `*${summary[name]}x* ${name}%0A`;
    }
    
    msg += `--------------------------------%0A`;
    msg += `*Total:* R$ ${total.toFixed(2)}%0A`;
    msg += `*Pagamento:* ${payment.toUpperCase()}%0A%0A`;
    msg += `_Pedido enviado via Cardápio Digital_`;
    
    // Seu número de WhatsApp (DDD + Número)
    const phoneNumber = "5511985878638";
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, '_blank');
});

/**
 * INICIALIZAÇÃO DA APLICAÇÃO
 */
function init() {
    renderCategory(menuData.pizzas, domElements.pizzaList);
    renderCategory(menuData.drinks, domElements.drinkList);
    renderCategory(menuData.desserts, domElements.dessertList);
    updateCartUI();
}

// Garante que o script rode apenas após o DOM estar pronto
document.addEventListener('DOMContentLoaded', init);
