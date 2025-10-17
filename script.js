function ajouterAuPanier(id, nom, prix) {
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  
  // Vérifier si l'article existe déjà
  const articleExistant = panier.find(item => item.id === id);
  if (articleExistant) {
    articleExistant.quantite = (articleExistant.quantite || 1) + 1;
  } else {
    panier.push({ id, nom, prix, quantite: 1 });
  }
  
  localStorage.setItem("panier", JSON.stringify(panier));
  afficherCompteurPanier();
  
  // Rafraîchir l'affichage du panier si on est sur la page panier
  if (document.getElementById("panier")) {
    afficherPanier();
  }
  
  // Message de confirmation plus élégant
  const message = document.createElement('div');
  message.className = 'message-confirmation';
  message.textContent = `${nom} ajouté au panier !`;
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 2000);
}

function afficherPanier() {
  const zone = document.getElementById("panier");
  if (!zone) return;
  
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  zone.innerHTML = "";
  
  if (panier.length === 0) {
    zone.innerHTML = '<p>Votre panier est vide</p>';
    return;
  }
  
  let total = 0;
  panier.forEach((item, index) => {
    const sousTotal = item.prix * item.quantite;
    total += sousTotal;
    
    zone.innerHTML += `
      <div class="article-panier">
        <div class="info-article">
          <h4>${item.nom}</h4>
          <p>${item.prix.toFixed(2)} € × ${item.quantite}</p>
        </div>
        <div class="actions-article">
          <button onclick="modifierQuantite(${index}, -1)">-</button>
          <span>${item.quantite}</span>
          <button onclick="modifierQuantite(${index}, 1)">+</button>
          <button onclick="supprimerArticle(${index})" class="btn-supprimer">×</button>
        </div>
        <div class="sous-total">${sousTotal.toFixed(2)} €</div>
      </div>
    `;
  });
  
  zone.innerHTML += `
    <div class="total-panier">
      <strong>Total : ${total.toFixed(2)} €</strong>
    </div>
  `;
}

function modifierQuantite(index, changement) {
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  panier[index].quantite += changement;
  
  if (panier[index].quantite <= 0) {
    panier.splice(index, 1);
  }
  
  localStorage.setItem("panier", JSON.stringify(panier));
  afficherPanier();
  afficherCompteurPanier();
}

function supprimerArticle(index) {
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  panier.splice(index, 1);
  localStorage.setItem("panier", JSON.stringify(panier));
  afficherPanier();
  afficherCompteurPanier();
}

function viderPanier() {
  if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
    localStorage.removeItem("panier");
    afficherPanier();
    afficherCompteurPanier();
  }
}

function afficherCompteurPanier() {
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  const compteur = document.getElementById("compteur-panier");
  if (compteur) {
    const totalArticles = panier.reduce((acc, item) => acc + item.quantite, 0);
    compteur.textContent = totalArticles;
    compteur.style.display = totalArticles > 0 ? 'block' : 'none';
  }
}

function debugPanier() {
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  console.log("Contenu du localStorage:", localStorage.getItem("panier"));
  console.log("Panier parsé:", panier);
  alert(`Debug Panier:\nContenu localStorage: ${localStorage.getItem("panier")}\nPanier parsé: ${JSON.stringify(panier, null, 2)}`);
}

function testAjoutPanier() {
  // Test d'ajout d'un article de test
  ajouterAuPanier(999, 'Article Test', 19.99);
  alert('Article test ajouté ! Vérifiez le panier maintenant.');
}

function commander() {
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  if (panier.length === 0) {
    alert('Votre panier est vide. Ajoutez des articles avant de commander.');
    return;
  }
  
  // Rediriger vers la page de checkout
  window.location.href = 'checkout.html';
}

// Variables globales pour Stripe
let stripe;
let elements;
let cardElement;

// Initialiser Stripe
function initStripe() {
  stripe = Stripe('pk_test_51234567890abcdef'); // Clé publique de test
  elements = stripe.elements();
  
  if (document.getElementById('stripe')) {
    cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
      },
    });
    
    cardElement.mount('#card-element');
  }
}

// Fonction pour afficher le panier dans le checkout
function afficherCheckoutPanier() {
  const zone = document.getElementById("checkout-panier");
  if (!zone) return;
  
  let panier = JSON.parse(localStorage.getItem("panier")) || [];
  zone.innerHTML = "";
  
  if (panier.length === 0) {
    zone.innerHTML = '<p>Votre panier est vide</p>';
    return;
  }
  
  let sousTotal = 0;
  panier.forEach(item => {
    const itemTotal = item.prix * item.quantite;
    sousTotal += itemTotal;
    
    zone.innerHTML += `
      <div class="checkout-item">
        <div class="checkout-item-info">
          <h4>${item.nom}</h4>
          <p>Quantité: ${item.quantite}</p>
        </div>
        <div class="checkout-item-price">${itemTotal.toFixed(2)} €</div>
      </div>
    `;
  });
  
  // Mettre à jour les totaux
  document.getElementById("sous-total").textContent = sousTotal.toFixed(2) + " €";
  document.getElementById("total-final").textContent = sousTotal.toFixed(2) + " €";
}

// Fonction pour gérer la soumission du formulaire de checkout
function gererCheckout(event) {
  event.preventDefault();
  
  const btnCommander = document.getElementById("btn-commander");
  const btnText = document.getElementById("btn-text");
  const btnLoading = document.getElementById("btn-loading");
  
  // Afficher le loading
  btnCommander.disabled = true;
  btnText.style.display = "none";
  btnLoading.style.display = "inline";
  
  // Simuler le traitement du paiement
  setTimeout(() => {
    // Ici, vous intégreriez avec votre backend pour traiter le paiement
    traiterPaiement();
  }, 2000);
}

// Fonction pour traiter le paiement
async function traiterPaiement() {
  try {
    // Récupérer les données du formulaire
    const formData = new FormData(document.getElementById("checkout-form"));
    const commande = {
      prenom: formData.get("prenom"),
      nom: formData.get("nom"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      adresse: formData.get("adresse"),
      ville: formData.get("ville"),
      codePostal: formData.get("code-postal"),
      pays: formData.get("pays"),
      livraison: formData.get("livraison"),
      paiement: formData.get("paiement"),
      panier: JSON.parse(localStorage.getItem("panier")) || []
    };
    
    // Simuler l'appel API
    console.log("Commande:", commande);
    
    // Simuler le succès du paiement
    setTimeout(() => {
      // Vider le panier
      localStorage.removeItem("panier");
      
      // Rediriger vers la page de confirmation
      window.location.href = "confirmation.html?commande=" + encodeURIComponent(JSON.stringify({
        numero: "CMD-" + Date.now(),
        date: new Date().toLocaleDateString("fr-FR"),
        total: document.getElementById("total-final").textContent
      }));
    }, 1000);
    
  } catch (error) {
    console.error("Erreur lors du paiement:", error);
    alert("Une erreur est survenue lors du traitement de votre commande. Veuillez réessayer.");
    
    // Réactiver le bouton
    const btnCommander = document.getElementById("btn-commander");
    const btnText = document.getElementById("btn-text");
    const btnLoading = document.getElementById("btn-loading");
    
    btnCommander.disabled = false;
    btnText.style.display = "inline";
    btnLoading.style.display = "none";
  }
}

// Fonction pour gérer les options de livraison
function gererLivraison() {
  const livraisonExpress = document.querySelector('input[name="livraison"][value="express"]');
  const fraisLivraison = document.getElementById("frais-livraison");
  const totalFinal = document.getElementById("total-final");
  
  if (livraisonExpress && livraisonExpress.checked) {
    fraisLivraison.textContent = "15,00 €";
    // Mettre à jour le total final
    const sousTotal = parseFloat(document.getElementById("sous-total").textContent.replace(" €", ""));
    const nouveauTotal = sousTotal + 15;
    totalFinal.textContent = nouveauTotal.toFixed(2) + " €";
  } else {
    fraisLivraison.textContent = "Gratuite";
    // Mettre à jour le total final
    const sousTotal = parseFloat(document.getElementById("sous-total").textContent.replace(" €", ""));
    totalFinal.textContent = sousTotal.toFixed(2) + " €";
  }
}

// Fonction pour afficher les détails de la commande sur la page de confirmation
function afficherDetailsCommande() {
  const orderDetails = document.getElementById("order-details");
  if (!orderDetails) return;
  
  // Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const commandeParam = urlParams.get('commande');
  
  if (commandeParam) {
    try {
      const commande = JSON.parse(decodeURIComponent(commandeParam));
      
      orderDetails.innerHTML = `
        <h3>Détails de votre commande</h3>
        <div class="order-info">
          <div class="order-info-item">
            <span class="order-info-label">Numéro de commande</span>
            <span class="order-info-value">${commande.numero}</span>
          </div>
          <div class="order-info-item">
            <span class="order-info-label">Date de commande</span>
            <span class="order-info-value">${commande.date}</span>
          </div>
          <div class="order-info-item">
            <span class="order-info-label">Total payé</span>
            <span class="order-info-value">${commande.total}</span>
          </div>
          <div class="order-info-item">
            <span class="order-info-label">Statut</span>
            <span class="order-info-value" style="color: #27ae60; font-weight: bold;">Confirmée</span>
          </div>
        </div>
      `;
    } catch (error) {
      console.error("Erreur lors du parsing de la commande:", error);
      orderDetails.innerHTML = '<p>Détails de commande non disponibles</p>';
    }
  } else {
    orderDetails.innerHTML = '<p>Détails de commande non disponibles</p>';
  }
}

// ===== SYSTÈME DE GESTION DES PRODUITS =====

// Initialiser la base de données produits si elle n'existe pas
function initialiserProduits() {
  let produits = JSON.parse(localStorage.getItem("produits")) || [];
  
  // Ajouter des produits par défaut si la base est vide
  if (produits.length === 0) {
    const produitsDefaut = [
      {
        id: 1,
        nom: "Collier solaire doré",
        prix: 29.99,
        categorie: "bijoux",
        stock: 15,
        description: "Un collier magnifique inspiré par la lumière du soleil, parfait pour célébrer votre beauté intérieure.",
        couleur: "Or",
        materiau: "Métal doré",
        tags: "spirituel, soleil, doré, afro-futurisme",
        dateCreation: new Date().toISOString()
      },
      {
        id: 2,
        nom: "Tapis rituel en lin",
        prix: 49.99,
        categorie: "spiritualite",
        stock: 8,
        description: "Tapis de méditation en lin naturel, conçu pour vos moments de connexion spirituelle.",
        couleur: "Beige naturel",
        materiau: "Lin bio",
        tags: "méditation, spirituel, naturel, artisanat",
        dateCreation: new Date().toISOString()
      },
      {
        id: 3,
        nom: "Robe lumière en coton bio",
        prix: 79.99,
        categorie: "vetements",
        stock: 5,
        description: "Robe élégante en coton biologique, conçue pour mettre en valeur votre silhouette et votre âme.",
        couleur: "Blanc cassé",
        materiau: "Coton bio",
        tags: "vêtement, bio, élégant, spirituel",
        dateCreation: new Date().toISOString()
      }
    ];
    
    localStorage.setItem("produits", JSON.stringify(produitsDefaut));
    produits = produitsDefaut;
  }
  
  return produits;
}

// Sauvegarder les produits dans localStorage
function sauvegarderProduits(produits) {
  localStorage.setItem("produits", JSON.stringify(produits));
}

// Obtenir tous les produits
function obtenirProduits() {
  return JSON.parse(localStorage.getItem("produits")) || [];
}

// Ajouter un nouveau produit
function ajouterProduit(produitData) {
  const produits = obtenirProduits();
  const nouveauProduit = {
    id: Date.now(), // ID unique basé sur le timestamp
    ...produitData,
    dateCreation: new Date().toISOString()
  };
  
  produits.push(nouveauProduit);
  sauvegarderProduits(produits);
  return nouveauProduit;
}

// Modifier un produit existant
function modifierProduit(id, produitData) {
  const produits = obtenirProduits();
  const index = produits.findIndex(p => p.id === id);
  
  if (index !== -1) {
    produits[index] = { ...produits[index], ...produitData };
    sauvegarderProduits(produits);
    return produits[index];
  }
  
  return null;
}

// Supprimer un produit
function supprimerProduit(id) {
  const produits = obtenirProduits();
  const produitsFiltres = produits.filter(p => p.id !== id);
  sauvegarderProduits(produitsFiltres);
  return true;
}

// Supprimer plusieurs produits
function supprimerProduits(ids) {
  const produits = obtenirProduits();
  const produitsFiltres = produits.filter(p => !ids.includes(p.id));
  sauvegarderProduits(produitsFiltres);
  return true;
}

// Rechercher des produits
function rechercherProduits(terme, categorie = "", stock = "") {
  let produits = obtenirProduits();
  
  // Filtrer par terme de recherche
  if (terme) {
    const termeLower = terme.toLowerCase();
    produits = produits.filter(p => 
      p.nom.toLowerCase().includes(termeLower) ||
      p.description.toLowerCase().includes(termeLower) ||
      p.tags.toLowerCase().includes(termeLower)
    );
  }
  
  // Filtrer par catégorie
  if (categorie) {
    produits = produits.filter(p => p.categorie === categorie);
  }
  
  // Filtrer par stock
  if (stock === "en-stock") {
    produits = produits.filter(p => p.stock > 0);
  } else if (stock === "rupture") {
    produits = produits.filter(p => p.stock === 0);
  }
  
  return produits;
}

// Obtenir le statut du stock
function obtenirStatutStock(stock) {
  if (stock === 0) return { classe: "stock-out", texte: "Rupture" };
  if (stock <= 5) return { classe: "stock-low", texte: "Stock faible" };
  return { classe: "stock-ok", texte: "En stock" };
}

// Afficher la liste des produits dans l'admin
function afficherProduitsAdmin(produits = null) {
  const listeProduits = document.getElementById("liste-produits");
  const nombreProduits = document.getElementById("nombre-produits");
  
  if (!listeProduits) return;
  
  if (!produits) {
    produits = obtenirProduits();
  }
  
  nombreProduits.textContent = produits.length;
  
  if (produits.length === 0) {
    listeProduits.innerHTML = `
      <div class="produit-vide">
        <h3>Aucun produit trouvé</h3>
        <p>Commencez par ajouter votre premier produit !</p>
        <button onclick="afficherFormulaireAjout()" class="btn btn-primary">Ajouter un produit</button>
      </div>
    `;
    return;
  }
  
  listeProduits.innerHTML = produits.map(produit => {
    const statutStock = obtenirStatutStock(produit.stock);
    const categorieLabels = {
      bijoux: "Bijoux",
      vetements: "Vêtements",
      accessoires: "Accessoires",
      decoration: "Décoration",
      spiritualite: "Spiritualité"
    };
    
    return `
      <div class="produit-admin">
        <input type="checkbox" class="produit-checkbox" data-id="${produit.id}">
        <div class="produit-info">
          <h4>${produit.nom}</h4>
          <p>${produit.description.substring(0, 100)}${produit.description.length > 100 ? '...' : ''}</p>
          <span class="produit-categorie">${categorieLabels[produit.categorie] || produit.categorie}</span>
        </div>
        <div class="produit-prix">${produit.prix.toFixed(2)} €</div>
        <div class="produit-stock">
          <span class="stock-badge ${statutStock.classe}">${statutStock.texte}</span>
          <div style="font-size: 0.8rem; color: #666; margin-top: 0.2rem;">${produit.stock} unités</div>
        </div>
        <div class="produit-actions">
          <button onclick="editerProduit(${produit.id})" class="btn-icon btn-edit" title="Modifier">✏️</button>
          <button onclick="supprimerProduitConfirm(${produit.id})" class="btn-icon btn-delete" title="Supprimer">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// Filtrer les produits
function filtrerProduits() {
  const terme = document.getElementById("recherche").value;
  const categorie = document.getElementById("filtre-categorie").value;
  const stock = document.getElementById("filtre-stock").value;
  
  const produitsFiltres = rechercherProduits(terme, categorie, stock);
  afficherProduitsAdmin(produitsFiltres);
}

// Afficher le formulaire d'ajout
function afficherFormulaireAjout() {
  const formulaire = document.getElementById("formulaire-produit");
  const titre = document.getElementById("titre-formulaire");
  const form = document.getElementById("produit-form");
  
  titre.textContent = "Ajouter un produit";
  form.reset();
  document.getElementById("produit-id").value = "";
  
  formulaire.style.display = "block";
  formulaire.scrollIntoView({ behavior: "smooth" });
}

// Masquer le formulaire
function masquerFormulaire() {
  document.getElementById("formulaire-produit").style.display = "none";
}

// Éditer un produit
function editerProduit(id) {
  const produits = obtenirProduits();
  const produit = produits.find(p => p.id === id);
  
  if (!produit) return;
  
  const formulaire = document.getElementById("formulaire-produit");
  const titre = document.getElementById("titre-formulaire");
  
  titre.textContent = "Modifier le produit";
  
  // Remplir le formulaire avec les données du produit
  document.getElementById("produit-id").value = produit.id;
  document.getElementById("nom").value = produit.nom;
  document.getElementById("prix").value = produit.prix;
  document.getElementById("categorie").value = produit.categorie;
  document.getElementById("stock").value = produit.stock;
  document.getElementById("description").value = produit.description;
  document.getElementById("couleur").value = produit.couleur || "";
  document.getElementById("materiau").value = produit.materiau || "";
  document.getElementById("tags").value = produit.tags || "";
  
  formulaire.style.display = "block";
  formulaire.scrollIntoView({ behavior: "smooth" });
}

// Supprimer un produit avec confirmation
function supprimerProduitConfirm(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
    supprimerProduit(id);
    afficherProduitsAdmin();
    afficherMessage("Produit supprimé avec succès", "success");
  }
}

// Gérer la soumission du formulaire de produit
function gererFormulaireProduit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const produitData = {
    nom: formData.get("nom"),
    prix: parseFloat(formData.get("prix")),
    categorie: formData.get("categorie"),
    stock: parseInt(formData.get("stock")),
    description: formData.get("description"),
    couleur: formData.get("couleur"),
    materiau: formData.get("materiau"),
    tags: formData.get("tags")
  };
  
  const id = formData.get("id");
  
  try {
    if (id) {
      // Modification
      modifierProduit(parseInt(id), produitData);
      afficherMessage("Produit modifié avec succès", "success");
    } else {
      // Ajout
      ajouterProduit(produitData);
      afficherMessage("Produit ajouté avec succès", "success");
    }
    
    masquerFormulaire();
    afficherProduitsAdmin();
    
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
    afficherMessage("Erreur lors de la sauvegarde", "error");
  }
}

// Sélectionner tous les produits
function selectionnerTous() {
  const checkboxes = document.querySelectorAll('.produit-checkbox');
  const tousCoches = Array.from(checkboxes).every(cb => cb.checked);
  
  checkboxes.forEach(cb => {
    cb.checked = !tousCoches;
  });
}

// Supprimer les produits sélectionnés
function supprimerSelectionnes() {
  const checkboxes = document.querySelectorAll('.produit-checkbox:checked');
  const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
  
  if (ids.length === 0) {
    alert("Aucun produit sélectionné");
    return;
  }
  
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${ids.length} produit(s) ?`)) {
    supprimerProduits(ids);
    afficherProduitsAdmin();
    afficherMessage(`${ids.length} produit(s) supprimé(s)`, "success");
  }
}

// Afficher un message de notification
function afficherMessage(message, type = "info") {
  const notification = document.createElement('div');
  notification.className = `message-notification ${type}`;
  notification.textContent = message;
  
  // Styles pour la notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  if (type === "success") {
    notification.style.backgroundColor = "#27ae60";
  } else if (type === "error") {
    notification.style.backgroundColor = "#e74c3c";
  } else {
    notification.style.backgroundColor = "#3498db";
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Mettre à jour la boutique avec les produits de la base de données
function mettreAJourBoutique() {
  const produits = obtenirProduits();
  const sectionProduits = document.querySelector('.produits');
  
  if (!sectionProduits) return;
  
  sectionProduits.innerHTML = produits.map(produit => {
    const statutStock = obtenirStatutStock(produit.stock);
    const estDisponible = produit.stock > 0;
    
    return `
      <div class="produit">
        <div class="image-placeholder">
          <svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient-${produit.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#${produit.couleur === 'Or' ? 'FFD700' : '8e3b46'};stop-opacity:1" />
                <stop offset="100%" style="stop-color:#${produit.couleur === 'Or' ? 'B8860B' : 'd4a373'};stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="300" height="250" fill="#f8f8f8"/>
            <circle cx="150" cy="100" r="40" fill="url(#gradient-${produit.id})" stroke="#8e3b46" stroke-width="3"/>
            <text x="150" y="180" text-anchor="middle" font-family="Arial" font-size="16" fill="#8e3b46">${produit.nom}</text>
          </svg>
        </div>
        <h3>${produit.nom}</h3>
        <p>${produit.prix.toFixed(2)} €</p>
        <div class="stock-info">
          <span class="stock-badge ${statutStock.classe}">${statutStock.texte}</span>
        </div>
        <button onclick="ajouterAuPanier(${produit.id}, '${produit.nom}', ${produit.prix})" 
                ${!estDisponible ? 'disabled' : ''} 
                class="${!estDisponible ? 'btn-disabled' : ''}">
          ${estDisponible ? 'Ajouter au panier' : 'Rupture de stock'}
        </button>
      </div>
    `;
  }).join('');
}

// ===== SYSTÈME D'AUTHENTIFICATION =====

// Initialiser la base de données utilisateurs
function initialiserUtilisateurs() {
  let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
  
  // Ajouter un utilisateur admin par défaut
  if (utilisateurs.length === 0) {
    const adminUser = {
      id: 1,
      prenom: "Admin",
      nom: "Florianus",
      email: "admin@florianus.com",
      password: "admin123", // En production, utiliser un hash
      telephone: "+229 XX XX XX XX",
      dateNaissance: "1990-01-01",
      newsletter: true,
      dateCreation: new Date().toISOString(),
      role: "admin"
    };
    
    utilisateurs.push(adminUser);
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
  }
  
  return utilisateurs;
}

// Obtenir l'utilisateur connecté
function obtenirUtilisateurConnecte() {
  return JSON.parse(localStorage.getItem("utilisateurConnecte")) || null;
}

// Connecter un utilisateur
function connecterUtilisateur(email, password) {
  const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
  const utilisateur = utilisateurs.find(u => u.email === email && u.password === password);
  
  if (utilisateur) {
    // Ne pas stocker le mot de passe dans la session
    const { password, ...utilisateurSession } = utilisateur;
    localStorage.setItem("utilisateurConnecte", JSON.stringify(utilisateurSession));
    return utilisateurSession;
  }
  
  return null;
}

// Déconnecter un utilisateur
function deconnexion() {
  localStorage.removeItem("utilisateurConnecte");
  window.location.href = "index.html";
}

// Inscrire un nouvel utilisateur
function inscrireUtilisateur(utilisateurData) {
  const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
  
  // Vérifier si l'email existe déjà
  if (utilisateurs.find(u => u.email === utilisateurData.email)) {
    throw new Error("Un compte avec cet email existe déjà");
  }
  
  const nouvelUtilisateur = {
    id: Date.now(),
    ...utilisateurData,
    dateCreation: new Date().toISOString(),
    role: "client"
  };
  
  utilisateurs.push(nouvelUtilisateur);
  localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
  
  return nouvelUtilisateur;
}

// Vérifier la force du mot de passe
function verifierForceMotDePasse(password) {
  let score = 0;
  let text = "Très faible";
  
  if (password.length >= 8) score++;
  if (password.match(/[a-z]/)) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^a-zA-Z0-9]/)) score++;
  
  if (score <= 1) {
    text = "Très faible";
  } else if (score === 2) {
    text = "Faible";
  } else if (score === 3) {
    text = "Moyen";
  } else if (score === 4) {
    text = "Fort";
  } else {
    text = "Très fort";
  }
  
  return { score, text };
}

// Mettre à jour l'indicateur de force du mot de passe
function mettreAJourForceMotDePasse() {
  const password = document.getElementById("password-inscription");
  const strengthFill = document.getElementById("strength-fill");
  const strengthText = document.getElementById("strength-text");
  
  if (!password || !strengthFill || !strengthText) return;
  
  const { score, text } = verifierForceMotDePasse(password.value);
  
  // Réinitialiser les classes
  strengthFill.parentElement.className = "strength-bar";
  
  if (password.value.length > 0) {
    if (score <= 1) {
      strengthFill.parentElement.classList.add("strength-weak");
    } else if (score === 2) {
      strengthFill.parentElement.classList.add("strength-medium");
    } else if (score === 3) {
      strengthFill.parentElement.classList.add("strength-strong");
    } else {
      strengthFill.parentElement.classList.add("strength-very-strong");
    }
  }
  
  strengthText.textContent = text;
}

// Gérer la connexion
function gererConnexion(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const email = formData.get("email");
  const password = formData.get("password");
  
  try {
    const utilisateur = connecterUtilisateur(email, password);
    
    if (utilisateur) {
      afficherMessage("Connexion réussie !", "success");
      setTimeout(() => {
        window.location.href = "mon-compte.html";
      }, 1000);
    } else {
      afficherMessage("Email ou mot de passe incorrect", "error");
    }
  } catch (error) {
    console.error("Erreur de connexion:", error);
    afficherMessage("Erreur lors de la connexion", "error");
  }
}

// Gérer l'inscription
function gererInscription(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  
  // Vérifier que les mots de passe correspondent
  if (password !== confirmPassword) {
    afficherMessage("Les mots de passe ne correspondent pas", "error");
    return;
  }
  
  // Vérifier la force du mot de passe
  const { score } = verifierForceMotDePasse(password);
  if (score < 2) {
    afficherMessage("Le mot de passe est trop faible", "error");
    return;
  }
  
  const utilisateurData = {
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    email: formData.get("email"),
    password: password,
    telephone: formData.get("telephone") || "",
    dateNaissance: formData.get("dateNaissance") || "",
    newsletter: formData.has("newsletter")
  };
  
  try {
    const nouvelUtilisateur = inscrireUtilisateur(utilisateurData);
    afficherMessage("Compte créé avec succès !", "success");
    
    // Connecter automatiquement l'utilisateur
    setTimeout(() => {
      const { password, ...utilisateurSession } = nouvelUtilisateur;
      localStorage.setItem("utilisateurConnecte", JSON.stringify(utilisateurSession));
      window.location.href = "mon-compte.html";
    }, 1000);
    
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    afficherMessage(error.message, "error");
  }
}

// ===== SYSTÈME DE TABLEAU DE BORD =====

// Vérifier si l'utilisateur est connecté
function verifierConnexion() {
  const utilisateur = obtenirUtilisateurConnecte();
  if (!utilisateur) {
    window.location.href = "connexion.html";
    return false;
  }
  return true;
}

// Afficher une section du tableau de bord
function afficherSection(sectionId) {
  // Masquer toutes les sections
  document.querySelectorAll('.dashboard-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Désactiver tous les éléments de navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Afficher la section demandée
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
  }
  
  // Activer l'élément de navigation correspondant
  const navItem = document.querySelector(`[onclick="afficherSection('${sectionId}')"]`);
  if (navItem) {
    navItem.classList.add('active');
  }
  
  // Charger les données de la section
  chargerDonneesSection(sectionId);
}

// Charger les données d'une section
function chargerDonneesSection(sectionId) {
  const utilisateur = obtenirUtilisateurConnecte();
  
  switch (sectionId) {
    case 'overview':
      chargerVueEnsemble(utilisateur);
      break;
    case 'orders':
      chargerCommandes(utilisateur);
      break;
    case 'wishlist':
      chargerListeSouhaits(utilisateur);
      break;
    case 'profile':
      chargerProfil(utilisateur);
      break;
    case 'addresses':
      chargerAdresses(utilisateur);
      break;
    case 'settings':
      chargerParametres(utilisateur);
      break;
  }
}

// Charger la vue d'ensemble
function chargerVueEnsemble(utilisateur) {
  // Mettre à jour les informations utilisateur
  document.getElementById("user-name").textContent = `${utilisateur.prenom} ${utilisateur.nom}`;
  document.getElementById("user-email").textContent = utilisateur.email;
  document.getElementById("user-initials").textContent = utilisateur.prenom[0] + utilisateur.nom[0];
  
  // Charger les statistiques (simulées)
  document.getElementById("total-orders").textContent = "0";
  document.getElementById("total-spent").textContent = "0,00 €";
  document.getElementById("wishlist-count").textContent = "0";
  document.getElementById("loyalty-points").textContent = "0";
}

// Charger les commandes
function chargerCommandes(utilisateur) {
  // Simuler des commandes
  const commandes = JSON.parse(localStorage.getItem(`commandes_${utilisateur.id}`)) || [];
  
  const ordersList = document.getElementById("orders-list");
  if (commandes.length === 0) {
    ordersList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>Aucune commande</h3>
        <p>Vous n'avez pas encore passé de commande.</p>
        <a href="boutique.html" class="btn btn-primary">Découvrir la boutique</a>
      </div>
    `;
  } else {
    // Afficher les commandes
    ordersList.innerHTML = commandes.map(commande => `
      <div class="order-item">
        <h4>Commande #${commande.numero}</h4>
        <p>Date: ${commande.date}</p>
        <p>Total: ${commande.total}</p>
      </div>
    `).join('');
  }
}

// Charger la liste de souhaits
function chargerListeSouhaits(utilisateur) {
  const wishlist = JSON.parse(localStorage.getItem(`wishlist_${utilisateur.id}`)) || [];
  
  const wishlistList = document.getElementById("wishlist-list");
  if (wishlist.length === 0) {
    wishlistList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">❤️</div>
        <h3>Liste de souhaits vide</h3>
        <p>Ajoutez des articles à votre liste de souhaits.</p>
        <a href="boutique.html" class="btn btn-primary">Découvrir la boutique</a>
      </div>
    `;
  } else {
    // Afficher les articles de la liste de souhaits
    wishlistList.innerHTML = wishlist.map(article => `
      <div class="wishlist-item">
        <h4>${article.nom}</h4>
        <p>${article.prix} €</p>
      </div>
    `).join('');
  }
}

// Charger le profil
function chargerProfil(utilisateur) {
  document.getElementById("profile-prenom").value = utilisateur.prenom || "";
  document.getElementById("profile-nom").value = utilisateur.nom || "";
  document.getElementById("profile-email").value = utilisateur.email || "";
  document.getElementById("profile-telephone").value = utilisateur.telephone || "";
  document.getElementById("profile-date-naissance").value = utilisateur.dateNaissance || "";
}

// Charger les adresses
function chargerAdresses(utilisateur) {
  const adresses = JSON.parse(localStorage.getItem(`adresses_${utilisateur.id}`)) || [];
  
  const addressesList = document.getElementById("addresses-list");
  if (adresses.length === 0) {
    addressesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📍</div>
        <h3>Aucune adresse</h3>
        <p>Ajoutez une adresse pour faciliter vos commandes.</p>
      </div>
    `;
  } else {
    // Afficher les adresses
    addressesList.innerHTML = adresses.map(adresse => `
      <div class="address-item">
        <h4>${adresse.nom}</h4>
        <p>${adresse.adresse}</p>
        <p>${adresse.ville}, ${adresse.codePostal}</p>
      </div>
    `).join('');
  }
}

// Charger les paramètres
function chargerParametres(utilisateur) {
  document.getElementById("email-notifications").checked = utilisateur.notificationsEmail !== false;
  document.getElementById("newsletter").checked = utilisateur.newsletter !== false;
}

// Gérer la mise à jour du profil
function gererMiseAJourProfil(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const utilisateur = obtenirUtilisateurConnecte();
  
  // Mettre à jour les données utilisateur
  const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
  const index = utilisateurs.findIndex(u => u.id === utilisateur.id);
  
  if (index !== -1) {
    utilisateurs[index] = {
      ...utilisateurs[index],
      prenom: formData.get("prenom"),
      nom: formData.get("nom"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      dateNaissance: formData.get("dateNaissance")
    };
    
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));
    
    // Mettre à jour la session
    const { password, ...utilisateurSession } = utilisateurs[index];
    localStorage.setItem("utilisateurConnecte", JSON.stringify(utilisateurSession));
    
    afficherMessage("Profil mis à jour avec succès", "success");
  }
}

// Fonctions utilitaires
function changerMotDePasse() {
  const nouveauMotDePasse = prompt("Nouveau mot de passe:");
  if (nouveauMotDePasse) {
    afficherMessage("Mot de passe changé avec succès", "success");
  }
}

function supprimerCompte() {
  if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
    const utilisateur = obtenirUtilisateurConnecte();
    const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
    const utilisateursFiltres = utilisateurs.filter(u => u.id !== utilisateur.id);
    
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateursFiltres));
    localStorage.removeItem("utilisateurConnecte");
    
    afficherMessage("Compte supprimé", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  }
}

function afficherFormulaireAdresse() {
  alert("Fonctionnalité d'ajout d'adresse à implémenter");
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialiser les bases de données
  initialiserProduits();
  initialiserUtilisateurs();
  
  // Vérifier la connexion pour les pages protégées
  if (window.location.pathname.includes('mon-compte.html')) {
    if (!verifierConnexion()) return;
  }
  
  if (document.getElementById("panier")) {
    afficherPanier();
  }
  if (document.getElementById("checkout-panier")) {
    afficherCheckoutPanier();
  }
  if (document.getElementById("checkout-form")) {
    initStripe();
    
    // Gérer la soumission du formulaire
    document.getElementById("checkout-form").addEventListener("submit", gererCheckout);
    
    // Gérer les changements d'options de livraison
    document.querySelectorAll('input[name="livraison"]').forEach(radio => {
      radio.addEventListener("change", gererLivraison);
    });
  }
  if (document.getElementById("order-details")) {
    afficherDetailsCommande();
  }
  if (document.getElementById("liste-produits")) {
    // Page d'administration
    afficherProduitsAdmin();
    
    // Gérer le formulaire de produit
    const produitForm = document.getElementById("produit-form");
    if (produitForm) {
      produitForm.addEventListener("submit", gererFormulaireProduit);
    }
  }
  if (document.querySelector('.produits')) {
    // Page boutique - mettre à jour avec les produits de la DB
    mettreAJourBoutique();
  }
  
  // Gestion de l'authentification
  if (document.getElementById("connexion-form")) {
    document.getElementById("connexion-form").addEventListener("submit", gererConnexion);
  }
  
  if (document.getElementById("inscription-form")) {
    document.getElementById("inscription-form").addEventListener("submit", gererInscription);
    
    // Gérer la force du mot de passe
    const passwordInput = document.getElementById("password-inscription");
    if (passwordInput) {
      passwordInput.addEventListener("input", mettreAJourForceMotDePasse);
    }
  }
  
  // Gestion du tableau de bord
  if (document.getElementById("profile-form")) {
    document.getElementById("profile-form").addEventListener("submit", gererMiseAJourProfil);
  }
  
  // Charger la vue d'ensemble par défaut
  if (document.getElementById("overview")) {
    chargerVueEnsemble(obtenirUtilisateurConnecte());
  }
  
  afficherCompteurPanier();
});