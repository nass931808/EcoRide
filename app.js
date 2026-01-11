const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET || 'ecoride-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 24 heures
    }
}));

// Headers de sécurité basiques
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Servir les fichiers statiques (styles, scripts, images)
app.use(express.static(__dirname));

// Configuration MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecoride',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware: Vérifier authentification
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ erreur: 'Non authentifié' });
    }
    next();
};

// ==================== AUTHENTIFICATION ====================

// Inscription
app.post('/api/inscription', async (req, res) => {
    try {
        const { pseudo, nom, prenom, email, password, telephone, adresse } = req.body;
        
        if (!pseudo || !email || !password) {
            return res.status(400).json({ erreur: 'Pseudo, email et mot de passe obligatoires' });
        }

        const [existing] = await pool.query(
            'SELECT utilisateur_id FROM utilisateur WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ erreur: 'Email déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO utilisateur (pseudo, nom, prenom, email, mot_de_passe, telephone, adresse, note_moyenne) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
            [pseudo, nom || '', prenom || '', email, hashedPassword, telephone || '', adresse || '']
        );

        req.session.userId = result.insertId;

        res.json({
            message: 'Inscription réussie',
            utilisateur_id: result.insertId,
            pseudo
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// Connexion
app.post('/api/connexion', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ erreur: 'Email et mot de passe requis' });
        }

        const [users] = await pool.query(
            'SELECT utilisateur_id, pseudo, mot_de_passe FROM utilisateur WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ erreur: 'Identifiants invalides' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.mot_de_passe);

        if (!validPassword) {
            return res.status(401).json({ erreur: 'Identifiants invalides' });
        }

        req.session.userId = user.utilisateur_id;

        res.json({
            message: 'Connexion réussie',
            utilisateur_id: user.utilisateur_id,
            pseudo: user.pseudo
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// Déconnexion
app.get('/api/deconnexion', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ erreur: 'Erreur lors de la déconnexion' });
        }
        res.json({ message: 'Déconnexion réussie' });
    });
});

// ==================== PROFIL ====================

// Profil utilisateur
app.get('/api/utilisateur/profil', requireAuth, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT utilisateur_id, pseudo, nom, prenom, email, telephone, adresse, note_moyenne FROM utilisateur WHERE utilisateur_id = ?',
            [req.session.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ erreur: 'Utilisateur non trouvé' });
        }

        res.json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// Véhicules utilisateur
app.get('/api/utilisateur/vehicules', requireAuth, async (req, res) => {
    try {
        const [vehicules] = await pool.query(
            `SELECT v.vehicule_id, v.modele, v.couleur, v.energie, v.immatriculation, v.nb_place, m.libelle as marque_libelle
             FROM vehicule v
             JOIN marque m ON v.marque_id = m.marque_id
             WHERE v.utilisateur_id = ?`,
            [req.session.userId]
        );

        res.json(vehicules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// ==================== COVOITURAGES ====================

// Liste covoiturages avec filtres
app.get('/api/covoiturage/liste', async (req, res) => {
    try {
        const { lieu_depart, lieu_arrivee, date_depart, prix_max, energie, note_min } = req.query;
        
        let query = `
            SELECT c.*, u.pseudo as conducteur_pseudo, u.note_moyenne, v.energie,
                   (c.nb_place - COALESCE((SELECT COUNT(*) FROM covoiturage_participant 
                    WHERE covoiturage_id = c.covoiturage_id AND statut = 'confirme'), 0)) as places_restantes
            FROM covoiturage c
            JOIN utilisateur u ON c.conducteur_id = u.utilisateur_id
            JOIN vehicule v ON c.vehicule_id = v.vehicule_id
            WHERE 1=1
        `;
        const params = [];

        if (lieu_depart) {
            query += ' AND c.lieu_depart LIKE ?';
            params.push('%' + lieu_depart + '%');
        }
        if (lieu_arrivee) {
            query += ' AND c.lieu_arrivee LIKE ?';
            params.push('%' + lieu_arrivee + '%');
        }
        if (date_depart) {
            query += ' AND DATE(c.date_depart) = ?';
            params.push(date_depart);
        }
        if (prix_max) {
            query += ' AND c.prix_personne <= ?';
            params.push(prix_max);
        }
        if (energie) {
            query += ' AND v.energie = ?';
            params.push(energie);
        }
        if (note_min) {
            query += ' AND u.note_moyenne >= ?';
            params.push(note_min);
        }

        const [covoiturages] = await pool.query(query, params);
        res.json(covoiturages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// Détail covoiturage
app.get('/api/covoiturage/detail', async (req, res) => {
    try {
        const { covoiturage_id } = req.query;

        if (!covoiturage_id) {
            return res.status(400).json({ erreur: 'covoiturage_id requis' });
        }

        const [covoiturages] = await pool.query(
            `SELECT c.*, u.pseudo as conducteur_pseudo, u.note_moyenne, u.utilisateur_id as conducteur_id, 
                    v.energie, v.modele, v.couleur,
                    (c.nb_place - COALESCE((SELECT COUNT(*) FROM covoiturage_participant 
                     WHERE covoiturage_id = c.covoiturage_id AND statut = 'confirme'), 0)) as places_restantes
             FROM covoiturage c
             JOIN utilisateur u ON c.conducteur_id = u.utilisateur_id
             JOIN vehicule v ON c.vehicule_id = v.vehicule_id
             WHERE c.covoiturage_id = ?`,
            [covoiturage_id]
        );

        if (covoiturages.length === 0) {
            return res.status(404).json({ erreur: 'Covoiturage non trouvé' });
        }

        res.json(covoiturages[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// Créer covoiturage
app.post('/api/covoiturage/creer', requireAuth, async (req, res) => {
    try {
        const { vehicule_id, date_depart, heure_depart, lieu_depart, lieu_arrivee, 
                date_arrivee, heure_arrivee, nb_place, prix_personne, description } = req.body;

        if (!vehicule_id || !date_depart || !lieu_depart || !lieu_arrivee || !nb_place || !prix_personne) {
            return res.status(400).json({ erreur: 'Champs obligatoires manquants' });
        }

        const [result] = await pool.query(
            `INSERT INTO covoiturage (conducteur_id, vehicule_id, date_depart, heure_depart, 
             lieu_depart, lieu_arrivee, date_arrivee, heure_arrivee, nb_place, prix_personne, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.session.userId, vehicule_id, date_depart, heure_depart, lieu_depart, 
             lieu_arrivee, date_arrivee, heure_arrivee, nb_place, prix_personne, description || '']
        );

        res.json({
            message: 'Covoiturage créé avec succès',
            covoiturage_id: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// ==================== RÉSERVATIONS ====================

// Créer réservation
app.post('/api/reservation/creer', requireAuth, async (req, res) => {
    try {
        const { covoiturage_id, nb_places } = req.body;

        if (!covoiturage_id || !nb_places) {
            return res.status(400).json({ erreur: 'covoiturage_id et nb_places requis' });
        }

        const [covoiturages] = await pool.query(
            `SELECT nb_place, prix_personne, 
             (nb_place - COALESCE((SELECT COUNT(*) FROM covoiturage_participant 
              WHERE covoiturage_id = ? AND statut = 'confirme'), 0)) as places_restantes
             FROM covoiturage WHERE covoiturage_id = ?`,
            [covoiturage_id, covoiturage_id]
        );

        if (covoiturages.length === 0) {
            return res.status(404).json({ erreur: 'Covoiturage non trouvé' });
        }

        const { places_restantes, prix_personne } = covoiturages[0];

        if (places_restantes < nb_places) {
            return res.status(400).json({ erreur: 'Places insuffisantes' });
        }

        const [result] = await pool.query(
            `INSERT INTO covoiturage_participant (covoiturage_id, passager_id, statut)
             VALUES (?, ?, 'en_attente')`,
            [covoiturage_id, req.session.userId]
        );

        res.json({
            message: 'Réservation créée',
            reservation_id: result.insertId,
            prix_total: prix_personne * nb_places,
            statut: 'en_attente'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// Confirmer réservation
app.post('/api/reservation/confirmer', requireAuth, async (req, res) => {
    try {
        const { covoiturage_id } = req.body;

        if (!covoiturage_id) {
            return res.status(400).json({ erreur: 'covoiturage_id requis' });
        }

        const [result] = await pool.query(
            `UPDATE covoiturage_participant SET statut = 'confirme' 
             WHERE covoiturage_id = ? AND passager_id = ? AND statut = 'en_attente'`,
            [covoiturage_id, req.session.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ erreur: 'Réservation non trouvée' });
        }

        res.json({ message: 'Réservation confirmée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// ==================== AVIS ====================

// Créer avis
app.post('/api/avis/creer', requireAuth, async (req, res) => {
    try {
        const { covoiturage_id, utilisateur_id, note, commentaire } = req.body;

        if (!covoiturage_id || !utilisateur_id || note === undefined) {
            return res.status(400).json({ erreur: 'Champs obligatoires manquants' });
        }

        if (note < 1 || note > 5) {
            return res.status(400).json({ erreur: 'Note doit être entre 1 et 5' });
        }

        const [result] = await pool.query(
            `INSERT INTO avis (covoiturage_id, auteur_id, utilisateur_id, note, commentaire)
             VALUES (?, ?, ?, ?, ?)`,
            [covoiturage_id, req.session.userId, utilisateur_id, note, commentaire || '']
        );

        // Mettre à jour note moyenne
        const [avg] = await pool.query(
            `SELECT AVG(note) as moyenne FROM avis WHERE utilisateur_id = ?`,
            [utilisateur_id]
        );

        await pool.query(
            `UPDATE utilisateur SET note_moyenne = ? WHERE utilisateur_id = ?`,
            [avg[0].moyenne || 0, utilisateur_id]
        );

        res.json({
            message: 'Avis créé avec succès',
            avis_id: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// Avis utilisateur
app.get('/api/avis/utilisateur', async (req, res) => {
    try {
        const { utilisateur_id } = req.query;

        if (!utilisateur_id) {
            return res.status(400).json({ erreur: 'utilisateur_id requis' });
        }

        const [avis] = await pool.query(
            `SELECT a.*, u.pseudo FROM avis a 
             JOIN utilisateur u ON a.auteur_id = u.utilisateur_id
             WHERE a.utilisateur_id = ? ORDER BY a.date_avis DESC`,
            [utilisateur_id]
        );

        res.json(avis);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// ==================== HISTORIQUE ====================

// Historique utilisateur
app.get('/api/historique/utilisateur', requireAuth, async (req, res) => {
    try {
        const [historique] = await pool.query(
            `SELECT h.*, c.lieu_depart, c.lieu_arrivee, c.date_depart
             FROM historique h
             JOIN covoiturage c ON h.covoiturage_id = c.covoiturage_id
             WHERE h.utilisateur_id = ?
             ORDER BY h.date_trajet DESC`,
            [req.session.userId]
        );

        res.json(historique);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: 'Erreur serveur' });
    }
});

// ==================== PAGES STATIQUES ====================

// Routes pour les fichiers HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'Ecoride.html'));
});

app.get('/Ecoride.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'Ecoride.html'));
});

app.get('/covoiturages.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'covoiturages.html'));
});

app.get('/detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'detail.html'));
});

app.get('/profil.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'profil.html'));
});

app.get('/historique.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'historique.html'));
});

app.get('/publiertrajet.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'publiertrajet.html'));
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'contact.html'));
});

app.get('/mentionlegale.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'mentionlegale.html'));
});

// Endpoint de santé simple
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Gestion 404 : renvoie la page 404.html si elle existe
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
});

app.listen(PORT, () => {
  console.log(`🚗 EcoRide démarré sur http://localhost:${PORT}`);
});


