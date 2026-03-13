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

const sizeModifiers = { "grande": 1.0, "media": 0.8, "broto": 0.6 };

let cart = JSON.parse(localStorage.getItem('aw_pizzaria_cart')) || [];

function init() {
    renderCategory(menuData.pizzas, document.getElementById('pizza-list'), true);
    renderCategory(menuData.drinks, document.getElementById('drink-list'), false);
    renderCategory(menuData.desserts, document.getElementById('dessert-list'), false);
    updateCartUI();
}

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
            </div>` : `<p>R$ ${item.price.toFixed(2)}</p><br>`;

        return `
            <li class="menu-item" data-name="${item.name}">
                <h4>${item.name}</h4>
                ${pizzaOptions}
                <button class="add-to-order" onclick="processAdd(${idx}, '${item.name}', ${item.price}, ${isPizza})">Adicionar</button>
            </li>`;
    }).join('');
}

window.toggleMeio = (el, idx) => {
    document.getElementById(`meio-box-${idx}`).style.display = el.checked ? 'block' : 'none';
}

window.processAdd = (idx, name, price, isPizza) => {
    let finalName = name;
    let finalPrice = price;

    if (isPizza) {
        const size = document.getElementById(`size-${idx}`).value;
        const isMeio = document.querySelector(`#pizza-list li:nth-child(${idx+1}) input`).checked;
        finalPrice = price * sizeModifiers[size];

        if (isMeio) {
            const sabor2 = document.getElementById(`sabor2-${idx}`).value;
            const p2 = menuData.pizzas.find(p => p.name === sabor2).price * sizeModifiers[size];
            finalPrice = Math.max(finalPrice, p2); // Regra comum: cobra a mais cara
            finalName = `Meio ${name} / Meio ${sabor2} (${size})`;
        } else {
            finalName = `${name} (${size})`;
        }
    }

    cart.push({ id: Date.now() + Math.random(), name: finalName, price: finalPrice });
    updateCartUI();
}

window.removeFromCart = (id) => {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('order-list');
    list.innerHTML = cart.map(i => `
        <li>
            <span>${i.name}</span>
            <span>R$ ${i.price.toFixed(2)} <button class="remove-item" onclick="removeFromCart(${i.id})">×</button></span>
        </li>`).join('');
    
    const total = cart.reduce((acc, i) => acc + i.price, 0);
    document.getElementById('total-price').textContent = total.toFixed(2);
    localStorage.setItem('aw_pizzaria_cart', JSON.stringify(cart));
}

document.getElementById('finalizar-pedido').addEventListener('click', () => {
    if (cart.length === 0) return alert("Seu carrinho está vazio!");
    const payment = document.getElementById('payment').value;
    let msg = `*🍕 NOVO PEDIDO - PIZZARIA AW*%0A*Endereço:* Rua das Pizzas, 123%0A--------------------------%0A`;
    cart.forEach(i => msg += `• ${i.name} - R$ ${i.price.toFixed(2)}%0A`);
    msg += `--------------------------%0A*TOTAL: R$ ${document.getElementById('total-price').textContent}*%0A*Pagamento:* ${payment.toUpperCase()}`;
    window.open(`https://wa.me/5511985878638?text=${msg}`);
});

init();
