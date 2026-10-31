/**
 * =========================================================
 * PIZZARIA AW — CARDÁPIO DEMONSTRATIVO
 * Desenvolvido por AW TECHNOLOGY
 * =========================================================
 * Projeto demonstrativo de portfólio.
 * Os pedidos não são reais.
 */

// =========================================================
// 1. CARDÁPIO
// =========================================================

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
        { name: "Água Mineral", price: 4.00 },
        { name: "Cerveja lata", price: 6.00 },
        { name: "Cerveja long neck", price: 8.00 }
    ],

    desserts: [
        { name: "Pudim de Leite", price: 12.00 },
        { name: "Bolo de Chocolate", price: 15.00 },
        { name: "Torta de Limão", price: 10.00 }
    ]
};

const sizeModifiers = {
    grande: 1,
    media: 0.8,
    broto: 0.6
};

const CART_STORAGE_KEY = "aw_pizzaria_cart";

// Número existente no projeto, mantido apenas para demonstração.
// Antes de uso real, configure e confirme o número correto.
const WHATSAPP_NUMBER = "5511985878638";

let cart = loadCart();

// =========================================================
// 2. CARRINHO E ARMAZENAMENTO
// =========================================================

function loadCart() {
    try {
        const savedCart = JSON.parse(
            localStorage.getItem(CART_STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(savedCart)) {
            return [];
        }

        return savedCart
            .filter(item =>
                item &&
                typeof item.name === "string" &&
                Number.isFinite(Number(item.price)) &&
                Number(item.price) >= 0
            )
            .map((item, index) => ({
                id: item.id ?? (Date.now() + index),
                name: item.name,
                price: Number(item.price),
                quantity: Math.max(
                    1,
                    Math.floor(Number(item.quantity) || 1)
                )
            }));
    } catch (error) {
        console.warn("Não foi possível recuperar o carrinho:", error);
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );
    } catch (error) {
        console.warn("Não foi possível salvar o carrinho:", error);
    }
}

// =========================================================
// 3. INICIALIZAÇÃO
// =========================================================

function init() {
    renderCategory(
        menuData.pizzas,
        document.getElementById("pizza-list"),
        true
    );

    renderCategory(
        menuData.drinks,
        document.getElementById("drink-list"),
        false
    );

    renderCategory(
        menuData.desserts,
        document.getElementById("dessert-list"),
        false
    );

    setupSearch();
    setupClearCartButton();
    setupCheckout();
    updateCartUI();
}

// =========================================================
// 4. FORMATAÇÃO DE PREÇOS
// =========================================================

function formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// =========================================================
// 5. RENDERIZAÇÃO DO CARDÁPIO
// =========================================================

function renderCategory(items, container, isPizza) {
    if (!container) {
        return;
    }

    container.innerHTML = items.map((item, idx) => {
        const pizzaOptions = isPizza
            ? `
                <div class="item-options">
                    <label for="size-${idx}">Tamanho:</label>

                    <select id="size-${idx}">
                        <option value="grande">
                            Grande — R$ ${formatCurrency(item.price)}
                        </option>

                        <option value="media">
                            Média — R$ ${formatCurrency(item.price * 0.8)}
                        </option>

                        <option value="broto">
                            Broto — R$ ${formatCurrency(item.price * 0.6)}
                        </option>
                    </select>

                    <div class="half-pizza-option">
                        <label>
                            <input
                                type="checkbox"
                                onchange="toggleMeio(this, ${idx})"
                            >
                            Meio a meio
                        </label>
                    </div>

                    <div
                        id="meio-box-${idx}"
                        class="meio-a-meio-container"
                        style="display: none;"
                    >
                        <label for="sabor2-${idx}">
                            Segundo sabor:
                        </label>

                        <select id="sabor2-${idx}">
                            ${menuData.pizzas.map(pizza => `
                                <option value="${pizza.name}">
                                    ${pizza.name}
                                </option>
                            `).join("")}
                        </select>

                        <small>
                            O preço considera o sabor de maior valor.
                        </small>
                    </div>
                </div>
            `
            : `
                <p class="item-price">
                    R$ ${formatCurrency(item.price)}
                </p>
            `;

        return `
            <li
                class="menu-item"
                data-name="${item.name.toLocaleLowerCase("pt-BR")}"
            >
                <h4>${item.name}</h4>

                ${pizzaOptions}

                <button
                    type="button"
                    class="add-to-order"
                    onclick="processAdd(${idx}, '${item.name}', ${item.price}, ${isPizza})"
                >
                    Adicionar ao pedido
                </button>
            </li>
        `;
    }).join("");
}

// =========================================================
// 6. OPÇÃO DE PIZZA MEIO A MEIO
// =========================================================

window.toggleMeio = (element, idx) => {
    const container = document.getElementById(`meio-box-${idx}`);

    if (container) {
        container.style.display = element.checked ? "block" : "none";
    }
};

// =========================================================
// 7. ADICIONAR PRODUTOS
// =========================================================

window.processAdd = (idx, name, price, isPizza) => {
    let finalName = name;
    let finalPrice = Number(price);

    if (isPizza) {
        const sizeElement = document.getElementById(`size-${idx}`);

        const pizzaItem = document.querySelector(
            `#pizza-list .menu-item:nth-child(${idx + 1})`
        );

        const halfCheckbox = pizzaItem?.querySelector(
            'input[type="checkbox"]'
        );

        if (!sizeElement) {
            return;
        }

        const size = sizeElement.value;
        const modifier = sizeModifiers[size] ?? 1;

        finalPrice = Number(price) * modifier;

        if (halfCheckbox?.checked) {
            const secondFlavor = document.getElementById(
                `sabor2-${idx}`
            )?.value;

            const secondPizza = menuData.pizzas.find(
                pizza => pizza.name === secondFlavor
            );

            if (secondPizza) {
                const secondPrice = secondPizza.price * modifier;

                finalPrice = Math.max(finalPrice, secondPrice);

                finalName =
                    `Pizza meio a meio: ${name} / ${secondFlavor} (${size})`;
            }
        } else {
            finalName = `Pizza ${name} (${size})`;
        }
    }

    cart.push({
        id: Date.now() + Math.random(),
        name: finalName,
        price: Number(finalPrice.toFixed(2)),
        quantity: 1
    });

    updateCartUI();

    console.info(`${finalName} adicionado ao carrinho.`);
};

// =========================================================
// 8. QUANTIDADES, REMOÇÃO E LIMPEZA
// =========================================================

window.changeQuantity = (id, change) => {
    const item = cart.find(product => product.id === id);

    if (!item) {
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== id);
    }

    updateCartUI();
};

window.removeFromCart = id => {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
};

window.clearCart = () => {
    if (cart.length === 0) {
        return;
    }

    if (!window.confirm("Deseja remover todos os itens do carrinho?")) {
        return;
    }

    cart = [];
    updateCartUI();
};

// =========================================================
// 9. ATUALIZAÇÃO DO CARRINHO
// =========================================================

function updateCartUI() {
    const list = document.getElementById("order-list");
    const totalPriceElement = document.getElementById("total-price");

    if (!list || !totalPriceElement) {
        return;
    }

    if (cart.length === 0) {
        list.innerHTML = `
            <li class="empty-cart">
                Seu carrinho está vazio.
                Escolha seus produtos favoritos!
            </li>
        `;
    } else {
        list.innerHTML = cart.map(item => {
            const subtotal = item.price * item.quantity;

            return `
                <li class="cart-item">
                    <div class="cart-item-info">
                        <span class="cart-item-name">
                            ${item.name}
                        </span>

                        <span class="cart-item-price">
                            R$ ${formatCurrency(subtotal)}
                        </span>
                    </div>

                    <div class="cart-actions">
                        <div class="quantity-controls">
                            <button
                                type="button"
                                aria-label="Diminuir quantidade"
                                onclick="changeQuantity(${item.id}, -1)"
                            >
                                −
                            </button>

                            <span>${item.quantity}</span>

                            <button
                                type="button"
                                aria-label="Aumentar quantidade"
                                onclick="changeQuantity(${item.id}, 1)"
                            >
                                +
                            </button>
                        </div>

                        <button
                            type="button"
                            class="remove-item"
                            onclick="removeFromCart(${item.id})"
                        >
                            Remover
                        </button>
                    </div>
                </li>
            `;
        }).join("");
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    totalPriceElement.textContent = formatCurrency(total);

    saveCart();
}

// =========================================================
// 10. BOTÃO PARA LIMPAR O CARRINHO
// =========================================================

function setupClearCartButton() {
    const checkoutButton = document.getElementById("finalizar-pedido");

    if (
        !checkoutButton ||
        document.getElementById("clear-cart-button")
    ) {
        return;
    }

    const button = document.createElement("button");

    button.type = "button";
    button.id = "clear-cart-button";
    button.className = "clear-cart-button";
    button.textContent = "Limpar carrinho";

    button.addEventListener("click", window.clearCart);

    checkoutButton.insertAdjacentElement("beforebegin", button);
}

// =========================================================
// 11. BUSCA DE PRODUTOS
// =========================================================

function setupSearch() {
    const searchInput = document.getElementById("search-input");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", event => {
        const term = event.target.value
            .trim()
            .toLocaleLowerCase("pt-BR");

        document.querySelectorAll(".menu-item").forEach(item => {
            const name = item.dataset.name || "";

            item.style.display = name.includes(term) ? "" : "none";
        });
    });
}

// =========================================================
// 12. FINALIZAÇÃO DEMONSTRATIVA VIA WHATSAPP
// =========================================================

function setupCheckout() {
    const checkoutButton = document.getElementById("finalizar-pedido");

    if (!checkoutButton) {
        return;
    }

    checkoutButton.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Seu carrinho está vazio. Adicione algum produto!");
            return;
        }

        const clientNameInput = document.getElementById("client-name");
        const paymentInput = document.getElementById("payment");

        const clientName =
            clientNameInput?.value.trim() || "Cliente demonstrativo";

        const payment =
            paymentInput?.value || "Não selecionado";

        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // Gera um resumo demonstrativo do pedido.
        const orderNumber = `DEMO-${Date.now().toString().slice(-6)}`;

        const orderSummary = cart.map(item =>
            `${item.quantity}x ${item.name} — R$ ${
                formatCurrency(item.price * item.quantity)
            }`
        ).join("\n");

        const confirmationMessage = [
            "PEDIDO DEMONSTRATIVO FINALIZADO!",
            "",
            `Número: ${orderNumber}`,
            `Cliente: ${clientName}`,
            "",
            "Itens:",
            orderSummary,
            "",
            `Total demonstrativo: R$ ${formatCurrency(total)}`,
            `Pagamento selecionado: ${payment}`,
            "",
            "Este pedido é fictício e não representa uma compra real."
        ].join("\n");

        // Exibe a confirmação no próprio site.
        alert(confirmationMessage);

        // Limpa o carrinho e o armazenamento local.
        cart = [];
        updateCartUI();
    });
}

// =========================================================
// 13. INICIAR A APLICAÇÃO
// =========================================================

document.addEventListener("DOMContentLoaded", init);