import pizza_info from './Pizza_List.js';

let cart = loadCart();

function generatePizzaHTML(pizza) {
    let pizzaClass = pizza.is_popular ? 'has-new' : '';
    let badgesHTML = '';
    if (pizza.is_popular) {
        badgesHTML += '<div class="badge-pizza-pop">Популярна</div>';
    }
    if (pizza.is_new) {
        badgesHTML += '<div class="badge-pizza">Нова</div>';
    }

    const isSingleSize = !pizza.small_size || !pizza.big_size;
    const centerClass = isSingleSize ? 'center' : '';

    return `
        <div class="pizza-item ${pizzaClass}">
            ${badgesHTML}
            <img class="pizza-image" src="${pizza.icon}" alt="${pizza.title}">
            <div class="pizza-details">
                <h1 class="pizza-name">${pizza.title}</h1>
                <h4 class="pizza-type">${pizza.type}</h4>
                <p class="pizza-description">${generatePizzaDescription(pizza.content)}</p>
                <div class="pizza-info ${centerClass}">
                    ${generatePizzaSizeHTML(pizza.small_size, pizza.big_size)}
                </div>
                <div class="pizza-price ${centerClass}">
                    ${generatePizzaPriceHTML(pizza)}
                </div>
            </div>
        </div>
    `;
}

function generatePizzaDescription(content) {
    let description = '';
    for (let key in content) {
        description += content[key].join(', ') + ', ';
    }
    return description.slice(0, -2);
}

function generatePizzaSizeHTML(smallSize, bigSize) {
    if (smallSize && bigSize) {
        return `
            <div class="pizza-inform" style="margin-left: 20px">
                <div class="pizza-size">
                    <img src="assets/images/size-icon.svg" class="size-image">
                    <span>${smallSize.size}</span>
                </div>
                <div class="pizza-weight">
                    <img src="assets/images/weight.svg" class="weight-image">
                    <span>${smallSize.weight}</span>
                </div>
            </div>
            <div class="pizza-inform" style="margin-right: 20px">
                <div class="pizza-size">
                    <img src="assets/images/size-icon.svg" class="size-image">
                    <span>${bigSize.size}</span>
                </div>
                <div class="pizza-weight">
                    <img src="assets/images/weight.svg" class="weight-image">
                    <span>${bigSize.weight}</span>
                </div>
            </div>
        `;
    } else if (smallSize) {
        return `
            <div class="pizza-inform">
                <div class="pizza-size">
                    <img src="assets/images/size-icon.svg" class="size-image">
                    <span>${smallSize.size}</span>
                </div>
                <div class="pizza-weight">
                    <img src="assets/images/weight.svg" class="weight-image">
                    <span>${smallSize.weight}</span>
                </div>
            </div>
        `;
    } else if (bigSize) {
        return `
            <div class="pizza-inform">
                <div class="pizza-size">
                    <img src="assets/images/size-icon.svg" class="size-image">
                    <span>${bigSize.size}</span>
                </div>
                <div class="pizza-weight">
                    <img src="assets/images/weight.svg" class="weight-image">
                    <span>${bigSize.weight}</span>
                </div>
            </div>
        `;
    }
    return '';
}

function generatePizzaPriceHTML(pizza) {
    const { small_size, big_size } = pizza;
    if (small_size && big_size) {
        return `
            <div class="price-container">
                <span class="price-regular">${small_size.price}</span>
                <span>грн.</span>
                <button class="order-button" data-id="${pizza.id}" data-size="small">Купити</button>
            </div>
            <div class="price-container">
                <span class="price-regular">${big_size.price}</span>
                <span>грн.</span>
                <button class="order-button" data-id="${pizza.id}" data-size="big">Купити</button>
            </div>
        `;
    } else if (small_size) {
        return `
            <div class="price-container">
                <span class="price-regular">${small_size.price}</span>
                <span>грн.</span>
                <button class="order-button" data-id="${pizza.id}" data-size="small">Купити</button>
            </div>
        `;
    } else if (big_size) {
        return `
            <div class="price-container">
                <span class="price-regular">${big_size.price}</span>
                <span>грн.</span>
                <button class="order-button" data-id="${pizza.id}" data-size="big">Купити</button>
            </div>
        `;
    }
    return '';
}

function loadPizzas(pizzas = pizza_info) {
    const pizzaMenu = document.querySelector('.pizza-menu');
    pizzaMenu.innerHTML = '';
    pizzas.forEach(pizza => {
        pizzaMenu.innerHTML += generatePizzaHTML(pizza);
    });
    loadCartUI();
}

document.addEventListener('DOMContentLoaded', () => {
    loadPizzas();

    document.querySelector('.clear-order').addEventListener('click', clearOrder);
    document.querySelector('.order-list').addEventListener('click', handleOrderListClick);
    document.querySelector('.pizza-menu-buttons').addEventListener('click', filterPizzas);

    document.querySelector('.pizza-menu').addEventListener('click', event => {
        if (event.target.classList.contains('order-button')) {
            const pizzaId = parseInt(event.target.dataset.id);
            const size = event.target.dataset.size;
            addToCart(pizzaId, size);
        }
    });
});

function addToCart(pizzaId, size) {
    const existingPizzaIndex = cart.findIndex(item => item.id === pizzaId && item.size === size);
    if (existingPizzaIndex !== -1) {
        cart[existingPizzaIndex].quantity++;
    } else {
        cart.push({ id: pizzaId, size, quantity: 1 });
    }
    saveCart();
    loadCartUI();
}

function handleOrderListClick(event) {
    if (event.target.classList.contains('item-increase')) {
        const pizzaId = parseInt(event.target.closest('.order-item').dataset.id);
        const size = event.target.closest('.order-item').dataset.size;
        updateCartItem(pizzaId, size, 1);
    } else if (event.target.classList.contains('item-decrease')) {
        const pizzaId = parseInt(event.target.closest('.order-item').dataset.id);
        const size = event.target.closest('.order-item').dataset.size;
        updateCartItem(pizzaId, size, -1);
    } else if (event.target.classList.contains('item-remove')) {
        const pizzaId = parseInt(event.target.closest('.order-item').dataset.id);
        const size = event.target.closest('.order-item').dataset.size;
        removeFromCart(pizzaId, size);
    }
}

function updateCartItem(pizzaId, size, change) {
    const cartItem = cart.find(item => item.id === pizzaId && item.size === size);
    if (cartItem) {
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => !(item.id === pizzaId && item.size === size));
        }
        saveCart();
        loadCartUI();
    }
}

function removeFromCart(pizzaId, size) {
    cart = cart.filter(item => !(item.id === pizzaId && item.size === size));
    saveCart();
    loadCartUI();
}

function clearOrder() {
    cart = [];
    saveCart();
    loadCartUI();
}

function loadCartUI() {
    const orderList = document.querySelector('.order-list');
    orderList.innerHTML = '';
    cart.forEach(item => {
        const pizza = pizza_info.find(p => p.id === item.id);
        const sizeInfo = item.size === 'small' ? pizza.small_size : pizza.big_size;
        orderList.innerHTML += `
            <div class="order-item" data-id="${item.id}" data-size="${item.size}">
                <div class="item-details">
                    <h2 class="item-name">${pizza.title} (${item.size === 'small' ? 'Мала' : 'Велика'})</h2>
                    <div class="item-info">
                        <img src="assets/images/size-icon.svg" class="size-image">
                        <span class="item-size">${sizeInfo.size}</span>
                        <img src="assets/images/weight.svg" class="weight-image">
                        <span class="item-gram">${sizeInfo.weight}</span>
                    </div>
                    <div class="item-quantity-controls">
                        <span class="item-price">${sizeInfo.price}грн</span>
                        <button class="item-decrease">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="item-increase">+</button>
                        <button class="item-remove">×</button>
                    </div>
                </div>
                <img class="item-image" src="${pizza.icon}" alt="${pizza.title}">
            </div>
        `;
    });
    updateTotalPrice();
    updateOrderCount();
}

function updateTotalPrice() {
    const total = cart.reduce((sum, item) => {
        const pizza = pizza_info.find(p => p.id === item.id);
        const sizeInfo = item.size === 'small' ? pizza.small_size : pizza.big_size;
        return sum + (sizeInfo.price * item.quantity);
    }, 0);
    document.querySelector('.total-price').textContent = `${total} грн`;
}

function updateOrderCount() {
    const orderCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.zamovlenna-container .order-count').textContent = orderCount;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
}

function filterPizzas(event) {
    if (event.target.classList.contains('menu-text') || event.target.classList.contains('menu-button')) {
        const filter = event.target.textContent.toLowerCase();

        document.querySelectorAll('.pizza-menu-buttons button').forEach(button => {
            button.classList.remove('menu-button');
            button.classList.add('menu-text');
        });
        event.target.classList.remove('menu-text');
        event.target.classList.add('menu-button');

        let filteredPizzas;
        if (filter === 'усі') {
            filteredPizzas = pizza_info;
        } else if (filter.includes('м\'ясні')) {
            filteredPizzas = pizza_info.filter(pizza => pizza.type.toLowerCase().includes('м’ясна піца'));
        } else if (filter.includes('з ананасами')) {
            filteredPizzas = pizza_info.filter(pizza => pizza.content.pineapple && pizza.content.pineapple.length > 0);
        } else if (filter.includes('з грибами')) {
            filteredPizzas = pizza_info.filter(pizza => pizza.content.mushroom && pizza.content.mushroom.length > 0);
        } else if (filter.includes('з морепродуктами')) {
            filteredPizzas = pizza_info.filter(pizza => pizza.type.toLowerCase().includes('морська піца'));
        } else if (filter.includes('вега')) {
            filteredPizzas = pizza_info.filter(pizza => pizza.type.toLowerCase().includes('вега піца'));
        } else {
            filteredPizzas = [];
        }
        loadPizzas(filteredPizzas);

        document.querySelector('.pizza-menu-title').innerHTML = `${event.target.textContent} <span class="order-count">${filteredPizzas.length}</span>`;
    }
}
