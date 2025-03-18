# CaissePK - Guide d'utilisation et de personnalisation

## ⚠️ AVERTISSEMENT IMPORTANT
<span style="color: red">**ATTENTION : Après la compilation du projet qui génère un fichier setup.exe, il est IMPÉRATIF de copier manuellement le fichier `products.csv` et le dossier `images` dans le répertoire d'installation. Sans ces fichiers, l'application ne pourra pas afficher les produits ni leurs images !**</span>


## Table des matières
1. [Présentation et fonctionnalités](#présentation-et-fonctionnalités)
2. [Guide de personnalisation](#guide-de-personnalisation)
3. [Guide technique](#guide-technique)

## Présentation et fonctionnalités

### Vue d'ensemble
CaissePK est une application de caisse enregistreuse développée avec Electron, spécialement conçue pour la gestion des commandes de paninis, boissons et autres produits. L'application permet de :
- Gérer les commandes et les paiements
- Suivre les stocks
- Gérer les accès administrateur
- Ouvrir le tiroir caisse
- Exporter les données

### Interface utilisateur
L'application est divisée en deux panneaux principaux :
- **Panneau gauche** : Affichage des produits et gestion des stocks
- **Panneau droit** : Panier et paiement

### Fonctionnalités principales

#### 1. Gestion des commandes
- Sélection des produits par catégorie (Paninis, Boissons, Desserts, Autres)
- Ajout/suppression de produits dans le panier
- Modification des quantités
- Calcul automatique du total
- Application automatique des formules de réduction

#### 2. Paiement
Deux modes de paiement disponibles :
- Paiement en espèces
- Paiement par Lydia

#### 3. Gestion des stocks
- Ajout de stock
- Correction de stock
- Suivi des mouvements
- Export des données

#### 4. Administration
- Accès protégé par mot de passe
- Gestion des mots de passe
- Ouverture du tiroir caisse
- Réinitialisation de la base de données

## Guide de personnalisation

### IMPORTANT Architecture Electron et personnalisation post-compilation
Electron est un framework qui permet de créer des applications desktop en utilisant des technologies web (HTML, CSS, JavaScript). Une fois l'application compilée en exécutable (.exe), certains fichiers restent modifiables sans recompilation, tandis que d'autres nécessitent une nouvelle compilation :

#### Fichiers modifiables sans recompilation :
- `products.csv` : Liste des produits et leurs prix
- Dossier `images/` : Photos des produits
- Base de données SQLite : Stocks et historique

#### Fichiers nécessitant une recompilation :
- `icone.png` : L'icône principale de l'application
- Fichiers source dans `src/` : Code JavaScript, HTML, CSS
- `main.js` et `preload.js` : Configuration Electron

### 1. Personnalisation visuelle

#### Modification des logos et images
Les images des produits sont stockées à la racine du projet dans le dossier `images/`. Pour modifier :
1. Remplacez les images existantes par vos propres images
2. Assurez-vous que les noms des fichiers correspondent à ceux dans `products.csv`
3. L'icône principale de l'application se trouve dans le dossier src/images/ : `icone.png`

#### Modification de la charte graphique
Les styles sont définis dans le dossier `src/styles/` :
- `main.css` : Style général
- `cart.css` : Style du panier
- `itemGrid.css` : Style de la grille de produits
- `admin.css` : Style de l'interface admin
- `overlays.css` : Style des fenêtres modales
- `stock.css` : Style de la gestion des stocks

### 2. Gestion des produits

#### Ajout/modification de produits
1. Ouvrez le fichier `products.csv` à la racine du projet
2. Format de chaque ligne : `catégorie,nom,prix,image`
3. Exemple :
```csv
paninis,Panini Merguez Chorizo,2.80,paniniChorizo.jpg
boissons,Coca,1.00,coca.png
```

#### Ajout de photos
1. Placez vos images dans le dossier `images/`
2. Formats supportés : .jpg, .png, .webp
3. Assurez-vous que le nom du fichier correspond à celui dans `products.csv`

### 3. Sécurité

#### Modification des mots de passe
Les mots de passe sont définis dans `src/js/admin.js` :
```javascript
function checkAdminPassword() {
    if (passwordAdmin === '230403') { // Modifiez ce mot de passe
        showAdminContent();
    }
}
```

## Guide technique

### Architecture du projet

#### Structure des dossiers
```
CaissePK/
├── src/
│   ├── js/
│   │   ├── admin.js
│   │   ├── loginHour.js
│   │   ├── products.js
│   │   ├── renderer.js
│   │   └── stock.js
│   ├── styles/
│   │   ├── admin.css
│   │   ├── cart.css
│   │   ├── itemGrid.css
│   │   ├── main.css
│   │   ├── overlays.css
│   │   └── stock.css
│   └── index.html
├── images/
├── products.csv
├── icone.png
├── main.js
├── preload.js
├── package.json
└── CashDrawer.exe
```

### Technologies utilisées
- Electron : Framework pour l'application desktop
- SQLite3 : Base de données locale
- HTML/CSS/JavaScript : Interface utilisateur

### Architecture inter-processus
L'application suit l'architecture multi-processus d'Electron, composée de trois parties principales :

#### 1. Processus de rendu (Renderer)
- Géré par les fichiers dans `src/js/`
- Responsable de l'interface utilisateur et des interactions
- Exemple dans `products.js` :
```javascript
function confirmCashPayment() {
    // ... code ...
    saveProductsToDatabase(products); // Appel de la fonction
}
```

#### 2. Processus de préchargement (Preload)
- Géré par `preload.js`
- Sert de pont sécurisé entre le renderer et le main
- Expose les fonctionnalités au renderer :
```javascript
contextBridge.exposeInMainWorld('electron', {
    saveProductsToDatabase: (products) => {
        ipcRenderer.send('save-products-to-database', products);
    }
});
```

#### 3. Processus principal (Main)
- Géré par `main.js`
- Contrôle l'application et gère les opérations système
- Reçoit les messages du renderer :
```javascript
ipcMain.on('save-products-to-database', (event, products) => {
    // Traitement de la sauvegarde
});
```

#### Flux de communication
1. L'utilisateur interagit avec l'interface (renderer)
2. Le renderer appelle une fonction exposée via le preload
3. Le preload transmet la requête au main via IPC
4. Le main traite la requête et effectue les opérations système
5. Le résultat est renvoyé au renderer si nécessaire

Cette architecture assure :
- La sécurité en isolant le code système
- La performance en séparant l'interface et la logique
- La stabilité en protégeant le processus principal

### Fonctionnalités techniques

#### 1. Gestion du tiroir caisse
Le fichier `CashDrawer.exe` est responsable de l'ouverture du tiroir caisse. Il utilise :
- `WinIo32.dll` : Bibliothèque pour l'accès aux ports
- `WinIo32.sys` : Pilote système

#### 2. Base de données
- Stockage local avec SQLite3
- Tables pour les stocks et l'historique des commandes


### Développement et build

#### Installation des dépendances
```bash
npm install
```

#### Test en développement
```bash
npm start
```

#### Build en exécutable
```bash
npm run package
```
L'exécutable sera généré dans le dossier `dist/`.


🚨 **IMPORTANT** 🚨
- ❗ La compilation génère un fichier setup.exe
- ❗ Après installation, vous DEVEZ copier :
  - 📄 Le fichier `products.csv`
  - 📁 Le dossier `images`
- ❗ Ces fichiers doivent être placés dans le dossier d'installation
- ⚠️ Sans ces fichiers, l'application ne fonctionnera pas correctement !

### Points d'attention
1. Le dossier `images/` doit être copié à côté de l'exécutable
2. `CashDrawer.exe`, `WinIo32.dll` et `WinIo32.sys` doivent être présents
3. Les droits administrateur sont nécessaires pour l'ouverture du tiroir caisse

### Maintenance
- Sauvegardez régulièrement le fichier `products.csv`
- Vérifiez les logs dans la console pour le débogage
- La base de données peut être réinitialisée via l'interface admin

### Sécurité
- Les mots de passe sont stockés en dur dans le code
- Les données sont stockées localement
- L'application nécessite des droits administrateur pour certaines fonctionnalités 

### Documentation des fonctions JavaScript

#### Fichier products.js
```javascript
// Fonction principale de chargement des produits
async function loadProductsFromCSV() {
    // Charge les produits depuis le fichier CSV
    // Structure les données dans l'objet menuProducts
}

// Gestion du panier
window.addToCart = (productName, productPrice) => {
    // Ajoute un produit au panier
    // Gère l'incrémentation si le produit existe déjà
}

// Analyse du panier pour les formules
function analyzeCart() {
    // Compte les produits par catégorie
    // Retourne un objet avec les compteurs
}

// Mise à jour du total avec formules
function updateTotal() {
    // Calcule le total initial
    // Applique les formules de réduction
    // Met à jour l'affichage
}

// Gestion des paiements
function confirmCashPayment() {
    // Affiche la confirmation
    // Sauvegarde la transaction
    // Vide le panier
}

function confirmLydiaPayment() {
    // Similaire à confirmCashPayment
    // Pour le paiement par Lydia
}
```

#### Fichier main.js (Processus principal)
```javascript
// Création de la fenêtre principale
function createWindow() {
    // Configure et crée la fenêtre Electron
}

// Gestion du tiroir caisse
ipcMain.on('launch-cash-driver', () => {
    // Exécute CashDrawer.exe avec les droits admin
})

// Gestion de la base de données
ipcMain.on('save-products-to-database', (event, products) => {
    // Sauvegarde les ventes dans la base
})

ipcMain.handle('read-csv-file', async (event, filename) => {
    // Lit le fichier CSV des produits
})

// Gestion des stocks
ipcMain.on('save-stock-to-database', (event, productName, quantity) => {
    // Ajoute du stock
})

ipcMain.on('correct-stock-in-database', (event, productName, correctedQuantity) => {
    // Corrige le stock
})
```

#### Fichier stock.js
```javascript
// Gestion des stocks
function confirmStock() {
    // Confirme l'ajout de stock
    // Met à jour l'interface
}

function confirmCorrect() {
    // Confirme la correction de stock
    // Met à jour l'interface
}

function resetDB() {
    // Réinitialise la base de données
    // Demande confirmation
}
```

#### Fichier preload.js
```javascript
// Exposition des fonctionnalités au renderer
contextBridge.exposeInMainWorld('electron', {
    // Communication avec le processus principal
    ipcRenderer: ipcRenderer,
    fetchLatestOrders: async () => {
        // Récupère les dernières commandes
    },
    getQuantitiesSumByProduct: async () => {
        // Récupère les quantités par produit
    },
    readCSVFile: (filename) => {
        // Lit le fichier CSV
    }
});
```