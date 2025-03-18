// renderer.js
document.getElementById('confirmButton').addEventListener('click', () => {
    window.electron.ipcRenderer.send('launch-cash-drawer');
});

document.getElementById('resetButton').addEventListener('click', () => {
    window.electron.ipcRenderer.send('reset-database');
});

document.getElementById('changeLoginMdp').addEventListener('click', () => {
    window.electron.ipcRenderer.send('change-password');
});

document.getElementById('shutdownButton').addEventListener('click', () => {
    window.electron.ipcRenderer.send('shutdown-windows');
});

document.getElementById('exportButton').addEventListener('click', () => {
    window.electron.ipcRenderer.send('export-to-csv');
});

document.getElementById('openCDrawer').addEventListener('click', () => {
    window.electron.ipcRenderer.send('launch-cash-drawer');
});

document.getElementById('confirmButtonLydia').addEventListener('click', () => {
    const cartItems = document.querySelectorAll('.cartItem');

    let hasCoffeeInCart = false;

    cartItems.forEach(item => {
        const nameElement = item.querySelector('p');
        if (nameElement) {
            const productName = nameElement.textContent.trim();
            hasCoffeeInCart = productName.toLowerCase().includes('carte cafe');
        }
    });

    if (hasCoffeeInCart) {
        window.electron.ipcRenderer.send('launch-cash-drawer');
    } else {
        console.log("No coffee item in the cart.");
    }
});


function saveProductsToDatabase(products) {
    window.electron.ipcRenderer.send('save-products-to-database', products);
}

function saveProductsToDatabase(products) {
    window.electron.ipcRenderer.send('save-products-to-database', products);
}



