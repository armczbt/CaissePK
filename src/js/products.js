let menuProducts = {};

async function loadProductsFromCSV() {
    try {
        const csvData = await window.electron.readCSVFile('products.csv');
        const lines = csvData.split('\n').filter(line => line.trim());
        
        // Ignorer l'en-tête
        const [header, ...rows] = lines;
        
        // Initialiser les catégories
        menuProducts = {};
        
        rows.forEach(row => {
            const [category, name, price, image] = row.split(',').map(item => item.trim());
            
            if (!menuProducts[category]) {
                menuProducts[category] = [];
            }
            
            menuProducts[category].push({
                name,
                price: parseFloat(price),
                image
            });
        });
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadProductsFromCSV();
    
    const menuButtons = document.querySelectorAll('#menu button');
    const grid = document.getElementById('grid');
    const cartItems = document.getElementById('cartItems');
    const adminButtonsStocks = document.getElementById('adminButtonsStocks');
    const adminButtonsActions = document.getElementById('adminButtonsActions');
    const latestOrdersButton = document.getElementById('latestOrdersButton');
    const stocksButton = document.getElementById('stocksButton');


    updateGrid('paninis');

    function updateGrid(menuId) {
        grid.innerHTML = '';
        adminButtonsStocks.style.display = 'none';
        adminButtonsActions.style.display = 'none';
        latestOrdersButton.style.display = 'none';
        stocksButton.style.display = 'none';

        const latestOrdersContainer = document.getElementById('latestOrdersContainer');
        const stocksContainer = document.getElementById('stocksContainer');
        latestOrdersContainer.style.display = 'none';
        stocksContainer.style.display = 'none';
    
        menuProducts[menuId].forEach(product => {
            const item = document.createElement('div');
            item.classList.add('item');
            item.innerHTML = `
                <img src="../images/${product.image}" alt="${product.name}" class="productImage">
                <div class="productInfo">
                    <h3>${product.name}</h3>
                    <p>Prix : ${product.price.toFixed(2)} €</p>
                </div>`;
            item.addEventListener('click', () => addToCart(product.name, product.price));
            grid.appendChild(item);
        });
    }

    window.addToCart = (productName, productPrice) => {
        const existingCartItem = findCartItemByName(productName);
    
        if (existingCartItem) {
            const quantityElement = existingCartItem.querySelector('.quantity');
            const currentQuantity = parseInt(quantityElement.textContent, 10);
            quantityElement.textContent = currentQuantity + 1;
        } else {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cartItem');
            cartItem.innerHTML = `
                <p>${productName}</p>
                <button class="adjustQuantity" onclick="adjustCartItemQuantity(this, '${productName}', ${productPrice}, false)">-</button>
                <span class="quantity">1</span>
                <button class="adjustQuantity" onclick="adjustCartItemQuantity(this, '${productName}', ${productPrice}, true)">+</button>
                <button class="removeItem" onclick="removeCartItem(this)">✖</button>`;
            document.getElementById('cartItems').appendChild(cartItem);
        }
    
        updateTotal();
    };
    
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const menuId = button.id;
            
            // Ajoutez une condition pour vérifier si le bouton n'est pas le bouton "admin"
            if (menuId !== 'admin') {
                updateGrid(menuId);
            }
        });
    });

     
});




function removeCartItem(element) {
    const cartItem = element.closest('.cartItem');
    cartItem.remove();
    updateTotal(); 
}

function clearCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    updateTotal();
}

function isCookie(productName) {
    return productName.toLowerCase().includes('cookie');
}

function isMuffin(productName) {
    return productName.toLowerCase().includes('muffin');
}

function isRedbull(productName) {
    return productName.toLowerCase().includes('redbull');
}

function analyzeCart() {
    const cartItems = document.querySelectorAll('.cartItem');
    let paniniCount = 0;
    let boissonCount = 0;
    let dessertCount = 0;
    let cookieCount = 0;
    let paniniNutellaCount = 0;

    cartItems.forEach(item => {
        const nameElement = item.querySelector('p');
        const quantityElement = item.querySelector('.quantity');
        if (nameElement && quantityElement) {
            const productName = nameElement.textContent.trim();
            const quantity = parseInt(quantityElement.textContent, 10);

            if (isPanini(productName)) {
                paniniCount+= quantity;
            }

            if (isBoisson(productName)&& !isCafe(productName) && !isRedbull(productName)) {
                boissonCount+= quantity;
            }

            if (isDessert(productName)) {
                if (isMuffin(productName)) {
                    dessertCount+= 0.5*quantity;
                }
                else{
                    dessertCount+= quantity;
                }
            }

            if (isCookie(productName)) {
                cookieCount+= quantity;
            }
            if (isPaniniNutella(productName)) {
                paniniNutellaCount+= quantity;
            }
        }
    });

    return { paniniCount, boissonCount, dessertCount, cookieCount, paniniNutellaCount };
}



function isPanini(productName) {
    return productName.toLowerCase().includes('panini') && !productName.toLowerCase().includes('nutella');
}


function isBoisson(productName) {
    return menuProducts.boissons.some(boisson => productName.toLowerCase().includes(boisson.name.toLowerCase()));
}

function isPaniniNutella(productName) {
    return productName.toLowerCase().includes('panini nutella');
}

function isCafe(productName) {
    return productName.toLowerCase().includes('café');
}

function isDessert(productName) {
    const desserts = menuProducts.desserts;
    const isDessert = desserts.some(dessert => productName.toLowerCase().includes(dessert.name.toLowerCase()));
    const isCookie = productName.toLowerCase().includes('cookie');
    const isPaniniNutella = productName.toLowerCase().includes('panini nutella');

    return isDessert && !isCookie && !isPaniniNutella;
}


function updateTotal() {
    const cartItems = document.querySelectorAll('.cartItem');
    let { paniniCount, boissonCount, dessertCount, cookieCount, paniniNutellaCount } = analyzeCart();
    let totalAmount = 0;

    cartItems.forEach(item => {
        const nameElement = item.querySelector('p');
        const quantityElement = item.querySelector('.quantity');
        if (nameElement && quantityElement) {
            const productName = nameElement.textContent.trim();
            const product = findProductByName(productName);
            const quantity = parseInt(quantityElement.textContent, 10);
            if (product) {
                totalAmount += product.price * quantity;
            }
        }
    });

    console.log(paniniCount, boissonCount, dessertCount, cookieCount, paniniNutellaCount);

    const activeFormulas = {
        formule1: false,
        formule2: false,
        formule3: false,
        formule4: false,
    };


    const possibleFormule3 = Math.min(paniniCount, boissonCount, cookieCount);
    paniniCount -= possibleFormule3;
    boissonCount -= possibleFormule3;
    cookieCount -= possibleFormule3;

    const possibleFormule4 = Math.min(paniniCount, boissonCount, paniniNutellaCount);
    paniniCount -= possibleFormule4;
    boissonCount -= possibleFormule4;
    paniniNutellaCount -= possibleFormule4;

    let roundedDessertCount = Math.floor(dessertCount);

    const possibleFormule2 = Math.min(paniniCount, boissonCount, roundedDessertCount);
    paniniCount -= possibleFormule2;
    boissonCount -= possibleFormule2;
    roundedDessertCount -= possibleFormule2;

    const possibleFormule1 = Math.min(paniniCount, boissonCount);
    paniniCount -= possibleFormule1;
    boissonCount -= possibleFormule1;

    

    

    

    totalAmount -= 0.30 * possibleFormule1;
    totalAmount -= 0.30 * possibleFormule2;
    totalAmount -= 0.50 * possibleFormule3;
    totalAmount -= 0.30 * possibleFormule4;

    const totalAmountElement = document.getElementById('totalAmount');
    totalAmountElement.textContent = totalAmount.toFixed(2);
}




window.adjustCartItemQuantity = (element, productName, productPrice, increase = false) => {
    const cartItem = element.closest('.cartItem');
    const quantityElement = cartItem.querySelector('.quantity');
    const currentQuantity = parseInt(quantityElement.textContent, 10);

    if (increase) {
        quantityElement.textContent = currentQuantity + 1;
    } else {
        if (currentQuantity > 1) {
            quantityElement.textContent = currentQuantity - 1;
        } else {
            cartItem.remove();
        }
    }

    updateTotal();
};
function findCartItemByName(productName) {
    const cartItems = document.querySelectorAll('.cartItem');
    for (const cartItem of cartItems) {
        const nameElement = cartItem.querySelector('p');
        if (nameElement) {
            const cartItemProductName = nameElement.textContent.trim();
            if (cartItemProductName.includes(productName)) {
                return cartItem;
            }
        }
    }
    return null;
}


function findProductByName(productName) {
    for (const menuId in menuProducts) {
        const menuProductsList = menuProducts[menuId];
        const foundProduct = menuProductsList.find(product => product.name === productName);

        if (foundProduct) {
            return foundProduct;
        }
    }

    return null;
}

function confirmCashPayment() {
    const totalAmount = document.getElementById('totalAmount').textContent;
    const confirmationMessage = `Proceder au paiement de : ${totalAmount} € en espèces ?`;
    const overlay = document.getElementById('confirmationOverlay');
    const messageElement = document.getElementById('confirmationMessage');
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');

    messageElement.textContent = confirmationMessage;

    if (totalAmount > 0) {

    confirmButton.onclick = function () {
        const cartItems = document.querySelectorAll('.cartItem');
        const products = [];

        cartItems.forEach(item => {
            const nameElement = item.querySelector('p');
            const quantityElement = item.querySelector('.quantity');

            if (nameElement && quantityElement) {
                const productName = nameElement.textContent.trim();
                const quantity = parseInt(quantityElement.textContent, 10);

                if (quantity > 0) {
                    products.push({ name: productName, quantity });
                }
            }
        });

        saveProductsToDatabase(products);

    hideConfirmation();
    clearCart();
    };

    cancelButton.onclick = function () {
        hideConfirmation();
    };

    overlay.style.display = 'flex';
}
}

function confirmLydiaPayment() {
    const totalAmount = document.getElementById('totalAmount').textContent;
    const confirmationMessage = `Proceder au paiement de : ${totalAmount} € avec Lydia ?`;
    const overlay = document.getElementById('confirmationOverlayLydia');
    const messageElement = document.getElementById('confirmationMessageLydia');
    const confirmButton = document.getElementById('confirmButtonLydia');
    const cancelButton = document.getElementById('cancelButtonLydia');

    messageElement.textContent = confirmationMessage;

    if (totalAmount > 0) {

    confirmButton.onclick = function () {
        const cartItems = document.querySelectorAll('.cartItem');
        const products = [];

        cartItems.forEach(item => {
            const nameElement = item.querySelector('p');
            const quantityElement = item.querySelector('.quantity');

            if (nameElement && quantityElement) {
                const productName = nameElement.textContent.trim();
                const quantity = parseInt(quantityElement.textContent, 10);

                if (quantity > 0) {
                    products.push({ name: productName, quantity });
                }
            }
        });

        saveProductsToDatabase(products);

    hideConfirmationLydia();
    clearCart();
    };

    cancelButton.onclick = function () {
        hideConfirmationLydia();
    };

    overlay.style.display = 'flex';
    }
}


function hideConfirmation() {
    const overlay = document.getElementById('confirmationOverlay');
    overlay.style.display = 'none';
}

function hideConfirmationLydia() {
    const overlay = document.getElementById('confirmationOverlayLydia');
    overlay.style.display = 'none';
}


function showCorrectStockOverlay() {
    const correctStockOverlay = document.getElementById('correctStockOverlay');
    correctStockOverlay.style.display = 'flex';

    const correctstockProductSelect = document.getElementById('correctstockProductSelect');
    correctstockProductSelect.innerHTML = '';

    // Utilise Object.entries pour parcourir les catégories et les produits
    Object.entries(menuProducts).forEach(([category, products]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.text = product.name;
            optgroup.appendChild(option);
        });

        correctstockProductSelect.appendChild(optgroup);
    });


}

function showAddStockOverlay() {
    const addStockOverlay = document.getElementById('addStockOverlay');
    addStockOverlay.style.display = 'flex';

    const stockProductSelect = document.getElementById('stockProductSelect');
    stockProductSelect.innerHTML = '';

    // Utilise Object.entries pour parcourir les catégories et les produits
    Object.entries(menuProducts).forEach(([category, products]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.text = product.name;
            optgroup.appendChild(option);
        });

        stockProductSelect.appendChild(optgroup);
    });


}

function closeAddStockOverlay() {
    const addStockOverlay = document.getElementById('addStockOverlay');
    addStockOverlay.style.display = 'none';
}

function closeCorrectOverlay() {
    const correctStockOverlay = document.getElementById('correctStockOverlay');
    correctStockOverlay.style.display = 'none';
}


let quantity = '';
let quantityC = '';

function appendToQuantityField(value) {
    quantity += value;
    updateQuantityStock();
}

function appendToCorrectField(value) {
    console.log(value);
    quantityC += value;
    updateCorrectStock();
}

function updateQuantityStock() {
    const quantityStock = document.getElementById('quantityStock');
    quantityStock.value = quantity;
}

function updateCorrectStock() {
    const correctStock = document.getElementById('correctStockField');
    correctStock.value = quantityC;
}


function clearQuantityField() {
    quantity = '';
    updateQuantityStock();
}

function clearCorrectField() {
    quantityC = '';
    updateCorrectStock();
}

function oppositeQuantity() {
    quantity = -quantity;
    updateQuantityStock();
}

function oppositeCorrect() {
    quantityC = -quantityC;
    updateCorrectStock();
}


async function displayStocks() {
    try {

        const quantitiesSumByProduct = await window.electron.getQuantitiesSumByProduct();

        const stocksTableBody = document.getElementById('stocksTableBody');
        stocksTableBody.innerHTML = '';

        Object.keys(menuProducts).forEach(category => {
            menuProducts[category].forEach(product => {
                const productName = product.name;
                const totalQuantity = quantitiesSumByProduct[productName] || 0;

                const row = document.createElement('tr');
                row.innerHTML = `<td>${productName}</td><td>${totalQuantity}</td>`;
                stocksTableBody.appendChild(row);
            });

        });

        const stocksContainer = document.getElementById('stocksContainer');
        stocksContainer.style.display = 'block';

    } catch (error) {
        console.error(`Error displaying stocks: ${error}`);
    }
}
