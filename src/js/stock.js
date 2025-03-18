function confirmCorrect() {
    const stockProductSelect = document.getElementById('correctstockProductSelect');
    const selectedProduct = stockProductSelect.value;

    const quantityInputElement = document.getElementById('correctStockField');
    const quantity = parseInt(quantityInputElement.value, 10);

    if (!isNaN(quantity)) {
        const confirmation = confirm(`Confirmez-vous la correction de ${quantity} unité(s) de ${selectedProduct} au stock ?`);

        if (confirmation) {
            window.electron.ipcRenderer.send('correct-stock-in-database', selectedProduct, quantity);

            setTimeout(() => {
                closeCorrectOverlay();

                displayStocks();


                clearCorrectField();
            }, 700);
            
            
            
        }
        
    } else {
        alert('Veuillez entrer une quantité valide.');
    }
}

function resetDB() {
    
    const confirmation = confirm("Êtes-vous sûr de vouloir réinitialiser la base de données des dernières commandes? Cette action est irréversible.");

    if (confirmation) {

        setTimeout(() => {
            displayLatestOrders();
            
        }, 400);
    } else {

    }
}


function confirmStock() {
    const stockProductSelect = document.getElementById('stockProductSelect');
    const selectedProduct = stockProductSelect.value;

    const quantityInputElement = document.getElementById('quantityStock');
    const quantity = parseInt(quantityInputElement.value, 10);

    if (!isNaN(quantity)) {
        const confirmation = confirm(`Confirmez-vous l'ajout de ${quantity} unité(s) de ${selectedProduct} au stock ?`);

        if (confirmation) {
            window.electron.ipcRenderer.send('save-stock-to-database', selectedProduct, quantity);

            setTimeout(() => {
                closeAddStockOverlay();

                displayStocks();


                clearQuantityField();
            }, 400);
            
            
            
        }
        
    } else {
        alert('Veuillez entrer une quantité valide.');
    }
}

function showLatestOrdersSection() {
    document.getElementById('latestOrdersContainer').style.display = 'block';
    document.getElementById('stocksContainer').style.display = 'none';
    displayLatestOrders();
}

function showStocksSection() {
    document.getElementById('latestOrdersContainer').style.display = 'none';
    document.getElementById('stocksContainer').style.display = 'block';
    displayStocks();
}