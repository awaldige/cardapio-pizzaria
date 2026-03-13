/**
 * BANCO DE DADOS DO CARDÁPIO
 */
const menuData = {
    pizzas: [
        { name: "Margherita", price: 35.00 },
        { name: "Mussarela", price: 30.00 },
        { name: "Portuguesa", price: 38.00 },
        { name: "Frango com Catupiry", price: 36.00 },
        { name: "Pepperoni", price: 40.00 },
        { name: "Calabresa", price: 32.00 },
        { name: "Quatro Queijos", price: 42.00 },
        { name: "Vegetariana", price: 35.00 },
        { name: "Rúcula com Tomate Seco", price: 45.00 },
        { name: "Atum", price: 38.00 },
        { name: "Camarão", price: 60.00 },
        { name: "Palmito", price: 42.00 }
    ],
    drinks: [
        { name: "Coca-Cola 2L", price: 12.00 },
        { name: "Refrigerante Lata", price: 6.00 },
        { name: "Suco Natural", price: 8.00 },
        { name: "Água Mineral", price: 4.00 }
    ],
    desserts: [
        { name: "Pudim de Leite", price: 12.00 },
        { name: "Bolo de Chocolate", price: 15.00 },
        { name: "Torta de Limão", price: 10.00 }
    ]
};

// Multiplicadores de preço baseados no tamanho
const sizeModifiers = { "grande": 1.0, "media": 0.8, "broto": 0.6 };

/**
 * ESTADO DA APLICAÇÃO
 */
let cart = JSON.parse(localStorage.getItem('aw_pizzaria_cart')) || [];

/**
 * INICIALIZAÇÃO
 */
function init() {
    renderCategory(menuData.pizzas, document.getElementById('pizza-list'), true);
    renderCategory(menuData.drinks, document.getElementById('drink-list'), false);
    renderCategory(menuData.desserts, document.getElementById('dessert-list'), false);
    updateCartUI();
}

/**
 * RENDERIZAÇÃO DINÂMICA
 */
function renderCategory(items, container, isPizza) {
    if (!container) return;
    container.innerHTML = items.map((item, idx) => {
        let pizzaOptions = isPizza ? `
            <div class="item-options">
                <label>Tamanho:</label>
                <select id="size-${idx}">
                    <option value="grande">Grande (R$ ${item.price.toFixed(2)})</option>
                    <option value="media">Média (R$ ${(item.price * 0.8).toFixed(2)})</option>
                    <option value="broto">Broto (R$ ${(item.price * 0.6).toFixed(2)})</option>
                </select>
                <br><br>
                <label><input type="checkbox" onchange="toggleMeio(this, ${idx})"> Meio a Meio?</label>
                <div id="meio-box-${idx}" class="meio-a-meio-container">
                    <label>2º Sabor:</label>
                    <select id="sabor2-${idx}">
                        ${menuData.pizzas.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                    </select>
                </div>
            </div>` : `<p class="item-price">R$ ${item.price.toFixed(2)}</p>`;

        return `
            <li class="menu-item" data-name="${item.name}">
                <h4>${item.name}</h4>
                ${pizzaOptions}
                <button class="add-to-order" onclick="processAdd(${idx}, '${item.name}', ${item.price}, ${isPizza})">
                    Adicionar ao Pedido
                </button>
            </li>`;
    }).join('');
}

/**
 * LÓGICA DE INTERAÇÃO (PIZZAS)
 */
window.toggleMeio = (el, idx) => {
    document.getElementById(`meio-box-${idx}`).style.display = el.checked ? 'block' : 'none';
}

window.processAdd = (idx, name, price, isPizza) => {
    let finalName = name;
    let finalPrice = price;

    if (isPizza) {
        const size = document.getElementById(`size-${idx}`).value;
        // Busca o checkbox específico dentro do item
        const isMeio = document.querySelector(`#pizza-list li:nth-child(${idx+1}) input[type="checkbox"]`).checked;
        
        finalPrice = price * sizeModifiers[size];

        if (isMeio) {
            const sabor2 = document.getElementById(`sabor2-${idx}`).value;
            const priceSabor2 = menuData.pizzas.find(p => p.name === sabor2).price * sizeModifiers[size];
            
            // Regra de negócio: cobra o valor da metade mais cara
            finalPrice = Math.max(finalPrice, priceSabor2);
            finalName = `Pizza Meio ${name} / Meio ${sabor2} (${size})`;
        } else {
            finalName = `Pizza ${name} (${size})`;
        }
    }

    // Adiciona ao array com ID único para permitir remoção individual
    cart.push({ 
        id: Date.now() + Math.random(), 
        name: finalName, 
        price: finalPrice 
    });
    
    updateCartUI();
}

/**
 * ATUALIZAÇÃO DA INTERFACE DO CARRINHO
 */
window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('order-list');
    const totalPriceElement = document.getElementById('total-price');

    list.innerHTML = cart.map(item => `
        <li>
            <span>${item.name}</span>
            <div class="cart-actions">
                <span>R$ ${item.price.toFixed(2)}</span>
                <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
            </div>
        </li>`).join('');
    
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    totalPriceElement.textContent = total.toFixed(2);
    
    // Salva no navegador para não perder o pedido ao atualizar a página
    localStorage.setItem('aw_pizzaria_cart', JSON.stringify(cart));
}

/**
 * SISTEMA DE BUSCA
 */
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.menu-item').forEach(el => {
        const name = el.dataset.name.toLowerCase();
        el.style.display = name.includes(term) ? 'flex' : 'none';
    });
});

/**
 * FINALIZAÇÃO DO PEDIDO (WHATSAPP + LIMPEZA)
 */
document.getElementById('finalizar-pedido').addEventListener('click', () => {
    if (cart.length === 0) {
        alert("O seu carrinho está vazio! Escolha uma delícia primeiro.");
        return;
    }

    const payment = document.getElementById('payment').value;
    const total = document.getElementById('total-price').textContent;
    
    // Formatação da mensagem para o WhatsApp
    let msg = `*🍕 NOVO PEDIDO - PIZZARIA AW*%0A`;
    msg += `*Endereço:* Rua das Pizzas, 123%0A`;
    msg += `--------------------------%0A`;
    
    cart.forEach(item => {
        msg += `• ${item.name} - R$ ${item.price.toFixed(2)}%0A`;
    });
    
    msg += `--------------------------%0A`;
    msg += `*TOTAL: R$ ${total}*%0A`;
    msg += `*Pagamento:* ${payment.toUpperCase()}`;

    // Abre o WhatsApp
    window.open(`https://wa.me/5511985878638?text=${msg}`, '_blank');

    // LIMPEZA DO CARRINHO APÓS O ENVIO
    cart = []; // Esvazia o array
    updateCartUI(); // Atualiza a tela (total vira 0) e limpa o localStorage
    
    alert("Pedido enviado! O seu carrinho foi limpo com sucesso.");
});

// Inicia o app
document.addEventListener('DOMContentLoaded', init);
