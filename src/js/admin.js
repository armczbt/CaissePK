let passwordAdmin = '';
let passwordLogin = '';
let passwordChange = '';

function appendToPasswordAdminField(value) {
    passwordAdmin += value;
    updatePasswordAdminField();
}

function appendToPasswordLoginField(value) {
    passwordLogin += value;
    updatePasswordLoginField();
}

function appendToPasswordChangeField(value) {
    passwordChange += value;
    updatePasswordChangeField();
}

function clearPasswordAdminField() {
    passwordAdmin = '';
    updatePasswordAdminField();
}

function clearPasswordLoginField() {
    passwordLogin = '';
    updatePasswordLoginField();
}

function clearPasswordChangeField() {
    passwordChange = '';
    updatePasswordLoginField();
}


function updatePasswordAdminField() {
    const passwordInputAdmin = document.getElementById('passwordInputAdmin');
    passwordInputAdmin.value = passwordAdmin;
}

function updatePasswordLoginField() {
    const passwordInputLogin = document.getElementById('passwordInputLogin');
    passwordInputLogin.value = passwordLogin;
}

function openAdminOverlay() {
    const adminOverlay = document.getElementById('adminOverlay');
    adminOverlay.style.display = 'flex';
}

function closeAdminOverlay() {
    const adminOverlay = document.getElementById('adminOverlay');
    adminOverlay.style.display = 'none';
    clearPasswordAdminField();
}

function closeLoginOverlay() {
    const loginOverlay = document.getElementById('loginOverlay');
    loginOverlay.style.display = 'none';
    clearPasswordLoginField();
}

function closeChangeOverlay() {
    const loginOverlay = document.getElementById('changeOverlay');
    loginOverlay.style.display = 'none';
    clearPasswordChangeField();
}

function showChangeOverlay() {
    const loginOverlay = document.getElementById('changeOverlay');
    loginOverlay.style.display = 'flex';
}


function changePassword() {
    closeChangeOverlay();
}


function checkAdminPassword() {
    if (passwordAdmin === '230403') {
        showAdminContent();
    } else {
        clearPasswordAdminField();
    }
}

function checkLoginPassword() {
    if (passwordLogin === '240303') {
        closeLoginOverlay();
    } else {
        clearPasswordLoginField();
    }
}


function showAdminContent() {
  const adminContainer = document.getElementById('adminContainer');
  const adminButtonsActions = document.getElementById('adminButtonsActions');
  const adminButtonsStocks = document.getElementById('adminButtonsStocks');
  const latestOrdersContainer = document.getElementById('latestOrdersContainer');
  const latestOrdersButton = document.getElementById('latestOrdersButton');
  const stocksButton = document.getElementById('stocksButton');
  const stocksContainer = document.getElementById('stocksContainer');
  const grid = document.getElementById('grid');

  grid.innerHTML = '';

  adminContainer.style.display = 'block';
  adminButtonsActions.style.display = 'block';
  adminButtonsStocks.style.display = 'block';
  latestOrdersButton.style.display = 'inline';
  stocksButton.style.display = 'inline';

  latestOrdersContainer.style.display = 'none';
  stocksContainer.style.display = 'none';

  closeAdminOverlay();

  

  displayLatestOrders();
}

function hideAdminContent() {
  const adminContainer = document.getElementById('adminContainer');
  const adminButtonsActions = document.getElementById('adminButtonsActions');
  const adminButtonsStocks = document.getElementById('adminButtonsStocks');
  const latestOrdersContainer = document.getElementById('latestOrdersContainer');
  const stocksContainer = document.getElementById('stocksContainer');

  adminContainer.style.display = 'none';
  adminButtonsActions.style.display = 'none';
  adminButtonsStocks.style.display = 'none';

  latestOrdersContainer.style.display = 'none';
  stocksContainer.style.display = 'none';
}

async function displayLatestOrders() {
    try {
        const latestOrders = await window.electron.fetchLatestOrders();

        const tableBody = document.getElementById('latestOrdersTableBody');
        tableBody.innerHTML = '';

        latestOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${order.productName}</td><td>${order.quantity}</td><td>${order.timestamp}</td><td>${order.type}</td><td><button class="deleteButton" data-id="${order.id}">Supprimer</button></td>`;
            tableBody.appendChild(row);
        });

        const deleteButtons = document.querySelectorAll('.deleteButton');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const orderId = button.getAttribute('data-id');
                deleteOrder(orderId);
            });
        });

        const latestOrdersContainer = document.getElementById('latestOrdersContainer');
        latestOrdersContainer.style.display = 'block';
    } catch (error) {
        console.error(`Error fetching latest orders: ${error}`);
    }
}

function deleteOrder(orderId) {

    
      window.electron.ipcRenderer.invoke('delete-order', orderId).then(() => {
        displayLatestOrders();
      });
    
  }

document.addEventListener('DOMContentLoaded', () => {
    const adminButton = document.getElementById('admin');
    adminButton.addEventListener('click', openAdminOverlay);
});

document.addEventListener('click', function (event) {
    if (!adminOverlay.contains(event.target) && event.target !== admin) {
        adminOverlay.style.display = 'none';
    }
});
