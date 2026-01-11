// Gestion du stockage local (localStorage)
// Ces variables servent à donner un nom unique à chaque type de donnée stockée
const userKey = 'ecoride_user'; // Pour l'utilisateur connecté
const storeKeyVeh = 'ecoride_vehicules'; // Pour les véhicules
const storeKeyPrefs = 'ecoride_prefs'; // Pour les préférences
const storeKeyTrips = 'ecoride_trips'; // Pour les trajets
const storeKeyReservations = 'ecoride_reservations'; // Pour les réservations

// Fonction de sanitization pour protéger contre les attaques XSS
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Fonction de validation d'email
function isValidEmail(email) {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
}

// Fonctions pour lire et écrire dans le stockage local
function getUser(){
  // Récupère l'utilisateur connecté (ou null si aucun)
  try { return JSON.parse(localStorage.getItem(userKey) || 'null'); } catch(e){ return null; }
}
function setUser(u){
  // Sauvegarde l'utilisateur connecté
  localStorage.setItem(userKey, JSON.stringify(u));
}
function getVeh(){
  // Récupère la liste des véhicules
  try { return JSON.parse(localStorage.getItem(storeKeyVeh) || '[]'); } catch(e){ return []; }
}
function setVeh(v){
  // Sauvegarde la liste des véhicules
  localStorage.setItem(storeKeyVeh, JSON.stringify(v));
}
function getPrefs(){
  // Récupère les préférences
  try { return JSON.parse(localStorage.getItem(storeKeyPrefs) || '{}'); } catch(e){ return {}; }
}
function setPrefs(p){
  // Sauvegarde les préférences
  localStorage.setItem(storeKeyPrefs, JSON.stringify(p));
}
function getTrips(){
  // Récupère la liste des trajets
  try { return JSON.parse(localStorage.getItem(storeKeyTrips) || '[]'); } catch(e){ return []; }
}
function setTrips(t){
  // Sauvegarde la liste des trajets
  localStorage.setItem(storeKeyTrips, JSON.stringify(t));
}
function getRes(){
  // Récupère la liste des réservations
  try { return JSON.parse(localStorage.getItem(storeKeyReservations) || '[]'); } catch(e){ return []; }
}
function setRes(r){
  // Sauvegarde la liste des réservations
  localStorage.setItem(storeKeyReservations, JSON.stringify(r));
}
// Menu déroulant (Mon Compte)
// Ce code permet d'ouvrir/fermer le menu déroulant quand on clique dessus
document.addEventListener('DOMContentLoaded', () => {
  // Pour chaque bouton de menu déroulant
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const dropdown = this.parentElement;
      dropdown.classList.toggle('open'); // Ouvre/ferme le menu
      // Ferme les autres menus ouverts
      document.querySelectorAll('.dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });
    });
  });
  // Ferme le menu si on clique ailleurs
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
    }
  });
  // Recherche de trajets sur la page d'accueil (Ecoride.html)
  if (document.getElementById('search-form')) {
    (function(){
      // Données de trajets fictives (pour la démo)
      const data = [
        { id: 1, conducteur: 'Amine', note: 4.8, places: 2, prix: 12, depart: 'Paris', arrivee: 'Lyon', horaire: '18:30', eco: true },
        { id: 2, conducteur: 'Chloé', note: 4.6, places: 3, prix: 10, depart: 'Marseille', arrivee: 'Nice', horaire: '09:15', eco: true },
        { id: 3, conducteur: 'Hugo', note: 4.2, places: 1, prix: 9, depart: 'Bordeaux', arrivee: 'Toulouse', horaire: '17:45', eco: false }
      ];
      const form = document.getElementById('search-form');
      const list = document.getElementById('search-results');
      // Quand on soumet le formulaire de recherche
      form.addEventListener('submit', function(e){
        e.preventDefault();
        // On récupère les valeurs saisies
        const d = form.depart.value.trim().toLowerCase();
        const a = form.arrivee.value.trim().toLowerCase();
        // On filtre les trajets selon la recherche
        const results = data.filter(t => (!d || t.depart.toLowerCase().includes(d)) && (!a || t.arrivee.toLowerCase().includes(a)));
        // On affiche les résultats
        list.innerHTML = results.map(t => `
          <li>
            <i class="fa-solid fa-car-side"></i>
            <strong>${t.depart} → ${t.arrivee}</strong>
            <span>${t.places} places • ${t.horaire} • ${t.prix}€ • ${t.eco ? 'Éco' : 'Classique'}</span>
            <span>Conducteur: ${t.conducteur} • ⭐ ${t.note}</span>
            <a href="detail.html?id=${t.id}" class="btn-auth" style="margin-top:10px; display:inline-block;">Détail</a>
          </li>
        `).join('');
      });
    })();
  }
  // Recherche avancée sur la page covoiturages.html (via API)
  if (document.getElementById('search')) {
    (function(){
      const form = document.getElementById('search');
      const results = document.getElementById('results');
      const API_BASE = window.location.origin.includes(':3000') ? '' : 'http://localhost:3000';

      function render(list){
        results.innerHTML = list.map(t => `
          <li>
            <i class="fa-solid fa-car-side"></i>
            <strong>${sanitizeHTML(t.lieu_depart)} → ${sanitizeHTML(t.lieu_arrivee)}</strong>
            <span>
              ${t.places_restantes ?? t.nb_place} places restantes • ${t.prix_personne}€ • 
              ${t.energie || '—'} • ⭐ ${t.note_moyenne ?? '—'}
            </span>
            <div style="margin-top:10px">
              <a href="detail.html?id=${t.covoiturage_id}" class="btn-auth">Détail</a>
              <button class="btn-auth" style="margin-left:8px" data-participer="${t.covoiturage_id}">Participer</button>
            </div>
          </li>
        `).join('');

        results.querySelectorAll('[data-participer]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-participer');
            if (!confirm('Confirmez-vous votre participation à ce trajet ?')) return;
            try {
              const resp = await fetch(`${API_BASE}/api/reservation/creer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ covoiturage_id: id, nb_places: 1 })
              });
              const data = await resp.json();
              if (resp.ok) {
                alert('✅ Réservation créée (en attente)');
              } else if (resp.status === 401) {
                alert('Veuillez vous connecter pour réserver.');
                const modal = document.getElementById('auth-modal');
                modal && modal.classList.add('is-open');
              } else {
                alert('❌ ' + (data.erreur || 'Erreur de réservation'));
              }
            } catch (e) {
              console.error(e);
              alert('❌ Erreur réseau');
            }
          });
        });
      }

      async function applyFilters(){
        const params = new URLSearchParams();
        const d = form.depart.value.trim();
        const a = form.arrivee.value.trim();
        const date = form.date.value;
        const eco = form.eco.checked;
        const prixMax = form.prix.value.trim();
        const noteMin = form.note.value.trim();

        if (d) params.append('lieu_depart', d);
        if (a) params.append('lieu_arrivee', a);
        if (date) params.append('date_depart', date);
        if (prixMax) params.append('prix_max', prixMax);
        if (noteMin) params.append('note_min', noteMin);
        if (eco) params.append('energie', 'electrique');

        try {
          const resp = await fetch(`${API_BASE}/api/covoiturage/liste?${params.toString()}`);
          const data = await resp.json();
          if (!resp.ok) {
            alert('❌ ' + (data.erreur || 'Erreur lors du chargement des trajets'));
            return;
          }
          render(data);
        } catch (e) {
          console.error(e);
          alert('❌ Erreur réseau');
        }
      }

      form.addEventListener('submit', function(e){ e.preventDefault(); applyFilters(); });
      applyFilters();
    })();
  }
  // Affichage des détails d'un trajet sur detail.html (via API)
  if (document.getElementById('trajet-title')) {
    (function(){
      const params = new URLSearchParams(window.location.search);
      const tripId = params.get('id');
      const API_BASE = window.location.origin.includes(':3000') ? '' : 'http://localhost:3000';
      if (!tripId) {
        alert('Aucun trajet sélectionné');
        window.location.href = 'covoiturages.html';
        return;
      }

      async function loadDetail(){
        try {
          const resp = await fetch(`${API_BASE}/api/covoiturage/detail?covoiturage_id=${encodeURIComponent(tripId)}`);
          const trip = await resp.json();
          if (!resp.ok) {
            alert('❌ ' + (trip.erreur || 'Trajet introuvable'));
            return;
          }

          document.getElementById('trajet-title').textContent = `${trip.lieu_depart} → ${trip.lieu_arrivee}`;
          document.getElementById('trajet-sub').textContent = `Départ le ${trip.date_depart} à ${trip.heure_depart}`;
          document.getElementById('driver-name').textContent = trip.conducteur_pseudo || '—';
          document.getElementById('driver-note').textContent = trip.note_moyenne ?? '—';
          document.getElementById('driver-reviews').innerHTML = trip.description ? `<li>${sanitizeHTML(trip.description)}</li>` : '';
          document.getElementById('vehicule-modele').textContent = trip.modele || '—';
          document.getElementById('vehicule-marque').textContent = trip.energie || '—';
          document.getElementById('vehicule-energie').textContent = trip.energie || '—';

          // Préférences (JSON en base)
          let prefs = [];
          if (trip.preferences) {
            try { prefs = JSON.parse(trip.preferences); } catch(e) { prefs = []; }
          }
          if (Array.isArray(prefs)) {
            document.getElementById('prefs-list').innerHTML = prefs.map(p => `<li>${sanitizeHTML(String(p))}</li>`).join('');
          } else if (typeof prefs === 'object') {
            const entries = Object.entries(prefs).filter(([_, v]) => v === true).map(([k]) => k);
            document.getElementById('prefs-list').innerHTML = entries.map(p => `<li>${sanitizeHTML(String(p))}</li>`).join('');
          }

          const partBtn = document.getElementById('participer-btn');
          partBtn.addEventListener('click', async () => {
            if (!confirm('Confirmez-vous votre participation à ce trajet ?')) return;
            try {
              const resp = await fetch(`${API_BASE}/api/reservation/creer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ covoiturage_id: tripId, nb_places: 1 })
              });
              const data = await resp.json();
              if (resp.ok) {
                alert('✅ Réservation créée (en attente)');
                window.location.href = 'covoiturages.html';
              } else if (resp.status === 401) {
                alert('Veuillez vous connecter pour réserver.');
                const modal = document.getElementById('auth-modal');
                modal && modal.classList.add('is-open');
              } else {
                alert('❌ ' + (data.erreur || 'Erreur de réservation'));
              }
            } catch(e) {
              console.error(e);
              alert('❌ Erreur réseau');
            }
          });
        } catch (e) {
          console.error(e);
          alert('❌ Erreur réseau');
        }
      }

      loadDetail();
    })();
  }
  // Gestion du profil utilisateur (profil.html)
  if (document.getElementById('user-name')) {
    (function(){
      const u = getUser() || { connected: false, credits: 0, name: '—', email: '—', role: 'passager' };
      document.getElementById('user-name').textContent = u.name || '—';
      document.getElementById('user-email').textContent = u.email || '—';
      document.getElementById('user-credits').textContent = u.credits || 0;
      const roleSel = document.getElementById('user-role');
      roleSel.value = (u.role === 'chauffeur') ? 'chauffeur' : 'passager';
      document.getElementById('save-role').addEventListener('click', () => {
        u.role = roleSel.value;
        setUser(u);
        alert('Rôle sauvegardé: ' + u.role);
      });

      // véhicules
      const vehList = document.getElementById('veh-list');
      function renderVeh(){
        const v = getVeh();
        vehList.innerHTML = v.map((x, i) => `<li><i class="fa-solid fa-car"></i> <strong>${x.marque} ${x.modele}</strong> <span>${x.energie}</span> <button class="btn-auth" data-del="${i}" style="margin-top:8px">Supprimer</button></li>`).join('');
        vehList.querySelectorAll('[data-del]').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-del'));
            const v = getVeh();
            v.splice(idx, 1);
            setVeh(v);
            renderVeh();
          });
        });
      }
      renderVeh();
      document.getElementById('vehicule-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const marque = document.getElementById('veh-marque').value.trim();
        const modele = document.getElementById('veh-modele').value.trim();
        const energie = document.getElementById('veh-energie').value;
        if (!marque || !modele) {
          alert('Marque et modèle sont requis.');
          return;
        }
        const v = getVeh();
        v.push({ marque, modele, energie });
        setVeh(v);
        renderVeh();
        e.target.reset();
      });

      // Préférences
      const prefsList = document.getElementById('prefs-list');
      function renderPrefs(){
        const p = getPrefs();
        const items = [];
        if (p.fumeur) items.push('Fumeur');
        if (p.animaux) items.push('Animaux');
        if (p.custom && p.custom.length) items.push(...p.custom);
        prefsList.innerHTML = items.map(x => `<li><i class="fa-solid fa-list"></i> <strong>${x}</strong></li>`).join('');
      }
      renderPrefs();
      document.getElementById('prefs-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fumeur = document.getElementById('pref-fumeur').checked;
        const animaux = document.getElementById('pref-animaux').checked;
        const customVal = document.getElementById('pref-custom').value.trim();
        const p = getPrefs();
        p.fumeur = fumeur;
        p.animaux = animaux;
        p.custom = p.custom || [];
        if (customVal) p.custom.push(customVal);
        setPrefs(p);
        renderPrefs();
        e.target.reset();
      });
    })();
  }
  // Affichage de l'historique des trajets et réservations (historique.html)
  if (document.getElementById('trip-list')) {
    (function(){
      const u = getUser() || { connected: false, credits: 0, name: '—', email: '—', role: 'passager' };
      const tripEl = document.getElementById('trip-list');
      const resEl = document.getElementById('res-list');
      function renderTrips(){
        const trips = getTrips();
        tripEl.innerHTML = trips.map((t, i) => `
          <li>
            <i class="fa-solid fa-car-side"></i>
            <strong>${t.depart} → ${t.arrivee}</strong>
            <span>${t.places} places • ${t.horaire} • ${t.prix}€ • ${t.eco ? 'Éco' : 'Classique'}</span>
            <button class="btn-auth" data-annuler-t="${i}" style="margin-top:8px">Annuler</button>
          </li>
        `).join('');
        tripEl.querySelectorAll('[data-annuler-t]').forEach(btn => {
          btn.addEventListener('click', () => {
            if (!confirm('Confirmer l\'annulation du trajet ?')) return;
            const idx = parseInt(btn.getAttribute('data-annuler-t'));
            let t = getTrips();
            t.splice(idx, 1);
            setTrips(t);
            renderTrips();
          });
        });
      }
      function renderRes(){
        const r = getRes();
        resEl.innerHTML = r.map((res, i) => `
          <li>
            <i class="fa-solid fa-car-side"></i>
            <strong>${res.depart} → ${res.arrivee}</strong>
            <span>Conducteur: ${res.conducteur} • ${res.horaire} • ${res.prix}€</span>
            <button class="btn-auth" data-annuler-r="${res.id}" style="margin-top:8px">Annuler</button>
          </li>
        `).join('');
        resEl.querySelectorAll('[data-annuler-r]').forEach(btn => {
          btn.addEventListener('click', () => {
            if (!confirm('Confirmer l\'annulation de la réservation ?')) return;
            const id = parseInt(btn.getAttribute('data-annuler-r'));
            let r = getRes();
            const idx = r.findIndex(x => x.id === id);
            if (idx >= 0) {
              const trip = r[idx];
              r.splice(idx, 1);
              setRes(r);
              if (u) {
                u.credits = (u.credits || 0) + (trip.prix || 0);
                setUser(u);
              }
            }
          });
        });
      }
      renderTrips();
      renderRes();
    })();
  }
  // Publication d'un nouveau trajet (publiertrajet.html)
  if (document.getElementById('publish-form')) {
    (function(){
      const u = getUser() || { connected: false, credits: 0, name: '—', email: '—', role: 'passager' };
      const vehSel = document.getElementById('vehicule');
      const vehList = getVeh();
      vehSel.innerHTML = vehList.map((v, i) => `<option value="${i}">${v.marque} ${v.modele}</option>`).join('');
      document.getElementById('publish-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!u || !u.connected) {
          alert('Veuillez vous connecter.');
          window.location.href = 'Ecoride.html';
          return;
        }
        if (u.role !== 'chauffeur') {
          alert('Vous devez être chauffeur pour publier un trajet.');
          return;
        }
        if (u.credits < 2) {
          alert('Vous n\'avez pas assez de crédits (coût: 2 crédits).');
          return;
        }
        const trip = {
          id: Date.now(),
          conducteur: u.name,
          depart: document.getElementById('departure').value.trim(),
          arrivee: document.getElementById('destination').value.trim(),
          date: document.getElementById('date').value,
          horaire: document.getElementById('time').value,
          places: parseInt(document.getElementById('places').value, 10),
          prix: parseFloat(document.getElementById('prix').value),
          eco: document.getElementById('eco').checked,
          vehicule: vehList[parseInt(vehSel.value, 10)]
        };
        const trips = getTrips();
        trips.push(trip);
        setTrips(trips);
        u.credits = (u.credits || 0) - 2;
        setUser(u);
        alert('Trajet publié ! (-2 crédits)');
        window.location.href = 'historique.html';
      });
    })();
  }
  // Gestion de la fenêtre de connexion/inscription (auth-modal)
  const modal = document.getElementById('auth-modal');
  if (modal) {
    const closes = modal.querySelectorAll('[data-close-modal]');
    const tabs = modal.querySelectorAll('[data-tab]');
    const loginForm = modal.querySelector('#login-form');
    const signupForm = modal.querySelector('#signup-form');

    const setTab = (tab) => {
      if (tab === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
      } else {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
      }
      tabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    };

    const openModal = (e) => {
      if (e) e.preventDefault();
      setTab('login');
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    // Ouvrir le modal uniquement via les liens vers #auth-modal
    document.querySelectorAll('[href="#auth-modal"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        openModal(e);
      });
    });
    
    // Ouvrir le modal via boutons .btn-auth uniquement sur la page d'accueil
    document.querySelectorAll('.btn-auth').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        // Ouvrir le modal seulement si c'est un lien direct vers l'authentification
        const href = btn.getAttribute('href');
        if (href && (href === '#auth-modal' || href.includes('#auth-modal'))) {
          openModal(e);
        }
      });
    });

    closes.forEach((btn) => btn.addEventListener('click', closeModal));
    tabs.forEach((btn) => btn.addEventListener('click', () => setTab(btn.dataset.tab)));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

  }

  // ==================== GESTION DU MODAL ====================
  // Ouvrir le modal
  document.querySelectorAll('a[href="#auth-modal"], .btn-auth[href="#auth-modal"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const modal = document.getElementById('auth-modal');
      if (modal) {
        modal.classList.add('is-open');
      }
    });
  });

  // Fermer le modal
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = document.getElementById('auth-modal');
      if (modal) {
        modal.classList.remove('is-open');
      }
    });
  });

  // Fermer en cliquant sur l'overlay
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('is-open');
      }
    });
  }

  // Gestion des onglets
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      if (targetTab === 'login') {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('signup-form').classList.add('hidden');
      } else if (targetTab === 'signup') {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
      }
    });
  });

  // ==================== CONNEXION / INSCRIPTION ====================
  // Formulaire de connexion
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email-modal').value.trim();
      const password = document.getElementById('password-modal').value;
      if (!email || !password) {
        alert('❌ Email et mot de passe requis');
        return;
      }
      if (!isValidEmail(email)) {
        alert('❌ Email invalide');
        return;
      }
      
      try {
        const API_BASE = window.location.origin.includes(':3000') ? '' : 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/connexion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('✅ Connexion réussie:', data);
          setUser({ id: data.utilisateur_id, email, nom: data.nom });
          document.getElementById('auth-modal').classList.remove('is-open');
          loginForm.reset();
          setTimeout(() => window.location.reload(), 500);
        } else {
          alert('❌ ' + (data.message || 'Erreur de connexion'));
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur serveur');
      }
    });
  }

  // Formulaire d'inscription
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const nom = document.getElementById('name-signup').value.trim();
      const email = document.getElementById('email-signup').value.trim();
      const password = document.getElementById('password-signup').value;
      const pseudo = nom; // on utilise le nom comme pseudo requis par l'API
      
      if (!nom || !email || !password) {
        alert('❌ Tous les champs sont requis');
        return;
      }

      if (!isValidEmail(email)) {
        alert('❌ Email invalide');
        return;
      }
      
      if (password.length < 6) {
        alert('❌ Le mot de passe doit faire au moins 6 caractères');
        return;
      }
      
      try {
        const API_BASE = window.location.origin.includes(':3000') ? '' : 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/inscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pseudo, nom, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('✅ Inscription réussie:', data);
          alert('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
          signupForm.reset();
          // Passer à l'onglet connexion
          document.querySelector('[data-tab="login"]').click();
        } else {
          alert('❌ ' + (data.message || 'Erreur lors de l\'inscription'));
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur serveur');
      }
    });
  }
});
