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

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("panier")) {
    afficherPanier();
  }
  afficherCompteurPanier();
});