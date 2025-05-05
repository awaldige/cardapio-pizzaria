document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const orderList = document.getElementById('order-list');
    const totalPriceElement = document.getElementById('total-price');
    const searchInput = document.getElementById('search-input');
    const finalizarPedidoBtn = document.getElementById('finalizar-pedido');

    let total = 0;
    let orderItems = [];  // Array para armazenar os itens do pedido

    // Função para atualizar o total
    const updateTotal = () => {
        totalPriceElement.textContent = total.toFixed(2);
    };

    // Função para salvar o pedido no localStorage
    const saveOrder = () => {
        const orderData = {
            items: orderItems,
            total: total
        };
        localStorage.setItem('order', JSON.stringify(orderData));  // Salva o pedido no localStorage
    };

    // Adiciona item ao pedido
    menuItems.forEach(item => {
        const button = item.querySelector('button');
        button.addEventListener('click', () => {
            const name = item.dataset.name;
            const price = parseFloat(item.dataset.price);

            // Cria o item na lista de pedido
            const li = document.createElement('li');
            li.textContent = `${name} - R$${price.toFixed(2)}`;

            // Cria o botão de remoção
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remover';
            removeButton.classList.add('remove-item');
            li.appendChild(removeButton);

            orderList.appendChild(li);

            // Atualiza o total
            total += price;
            updateTotal();

            // Adiciona o item ao array de pedidos
            orderItems.push({ name, price });

            // Salva o pedido no localStorage
            saveOrder();

            // Evento de remoção do item
            removeButton.addEventListener('click', () => {
                li.remove();  // Remove o item da lista

                // Subtrai o preço do item removido do total
                total -= price;
                updateTotal();

                // Remove o item do array de pedidos
                orderItems = orderItems.filter(orderItem => orderItem.name !== name || orderItem.price !== price);

                // Atualiza o localStorage
                saveOrder();
            });
        });
    });

    // Busca no cardápio
    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.toLowerCase();

        menuItems.forEach(item => {
            const itemName = item.dataset.name.toLowerCase();
            const shouldShow = itemName.includes(searchValue);
            item.style.display = shouldShow ? '' : 'none';
        });
    });

    // Finalizar pedido
    finalizarPedidoBtn.addEventListener('click', () => {
        if (orderItems.length === 0) {
            alert('Seu pedido está vazio!');
        } else {
            alert('Pedido finalizado com sucesso!');
            // Limpa o pedido após finalizar
            localStorage.removeItem('order');
            orderItems = [];
            total = 0;
            orderList.innerHTML = '';  // Limpa a lista de pedidos
            updateTotal();
        }
    });

    // Verifica se há pedido salvo no localStorage
    const savedOrder = localStorage.getItem('order');
    if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        orderItems = parsedOrder.items;
        total = parsedOrder.total;
        orderItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} - R$${item.price.toFixed(2)}`;

            // Cria o botão de remoção
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remover';
            removeButton.classList.add('remove-item');
            li.appendChild(removeButton);

            orderList.appendChild(li);

            // Evento de remoção do item
            removeButton.addEventListener('click', () => {
                li.remove();  // Remove o item da lista

                // Subtrai o preço do item removido do total
                total -= item.price;
                updateTotal();

                // Remove o item do array de pedidos
                orderItems = orderItems.filter(orderItem => orderItem.name !== item.name || orderItem.price !== item.price);

                // Atualiza o localStorage
                saveOrder();
            });
        });
        updateTotal();
    }
});















