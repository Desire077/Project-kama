# 📖 Documentation : Algorithme de comptage des biens vendus par ville

## 🎯 Objectif

Compter combien de biens immobiliers ont été vendus dans chaque ville.

**Endpoint** : `GET /api/properties/stats/sold-by-city`

---

## 🧠 Principe de l'algorithme : Le Pipeline d'Agrégation

Imagine un **tuyau** (pipeline) dans lequel tu fais passer tes données. À chaque étape du tuyau, les données sont **transformées** avant de passer à l'étape suivante.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DONNÉES DE DÉPART                                │
│  Toutes les propriétés de la base de données (vendues, en ligne, etc.)  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ÉTAPE 1 : FILTRAGE ($match)                        │
│         On garde UNIQUEMENT les propriétés avec status = "sold"         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     ÉTAPE 2 : REGROUPEMENT ($group)                     │
│     On regroupe les propriétés par ville et on compte chaque groupe     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        ÉTAPE 3 : TRI ($sort)                            │
│          On trie les villes par nombre de ventes (décroissant)          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ÉTAPE 4 : REFORMATAGE ($project)                     │
│              On renomme les champs pour un résultat propre              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            RÉSULTAT FINAL
```

---

## 📊 Exemple concret avec des données

### Données de départ (toutes les propriétés)

| ID | Titre | Ville | Status | Prix |
|----|-------|-------|--------|------|
| 1 | Maison A | Douala | **sold** | 50M |
| 2 | Appart B | Yaoundé | online | 30M |
| 3 | Terrain C | Douala | **sold** | 20M |
| 4 | Maison D | Kribi | **sold** | 80M |
| 5 | Appart E | Douala | pending | 45M |
| 6 | Maison F | Yaoundé | **sold** | 60M |
| 7 | Villa G | Douala | **sold** | 100M |

---

## Étape 1 : FILTRAGE (`$match`)

### But
Ne garder que les propriétés vendues

### Condition
`status = "sold"`

### Résultat après l'étape 1

| ID | Titre | Ville | Status | Prix |
|----|-------|-------|--------|------|
| 1 | Maison A | Douala | sold | 50M |
| 3 | Terrain C | Douala | sold | 20M |
| 4 | Maison D | Kribi | sold | 80M |
| 6 | Maison F | Yaoundé | sold | 60M |
| 7 | Villa G | Douala | sold | 100M |

➡️ **5 propriétés restantes** (on a éliminé les non-vendues)

---

## Étape 2 : REGROUPEMENT (`$group`)

### But
Rassembler les propriétés par ville et compter

### Clé de regroupement
`address.city` (la ville)

### Opération
Compter (`$sum: 1`) = ajouter 1 pour chaque document

```
         ┌──────────────────────────────────────┐
         │          REGROUPEMENT                │
         └──────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐    ┌─────────┐
    │ DOUALA  │    │ YAOUNDÉ  │    │  KRIBI  │
    ├─────────┤    ├──────────┤    ├─────────┤
    │Maison A │    │Maison F  │    │Maison D │
    │Terrain C│    └──────────┘    └─────────┘
    │Villa G  │         │               │
    └─────────┘         │               │
         │              │               │
         ▼              ▼               ▼
    count: 3       count: 1        count: 1
```

### Résultat après l'étape 2

| _id (ville) | count | totalValue |
|-------------|-------|------------|
| Douala | 3 | 170M |
| Yaoundé | 1 | 60M |
| Kribi | 1 | 80M |

---

## Étape 3 : TRI (`$sort`)

### But
Classer les résultats du plus grand au plus petit

### Critère
`count` en ordre décroissant (`-1`)

### Résultat après l'étape 3

| _id (ville) | count | totalValue |
|-------------|-------|------------|
| Douala | 3 | 170M |  ← 1er (le plus de ventes)
| Yaoundé | 1 | 60M |
| Kribi | 1 | 80M |

---

## Étape 4 : REFORMATAGE (`$project`)

### But
Renommer les champs pour un résultat plus lisible

### Transformation
- `_id` → `city`
- Supprimer le champ `_id` original

### Résultat final

| city | count | totalValue |
|------|-------|------------|
| Douala | 3 | 170M |
| Yaoundé | 1 | 60M |
| Kribi | 1 | 80M |

---

## 🔑 Résumé des opérateurs MongoDB

| Opérateur | Rôle | Analogie SQL |
|-----------|------|--------------|
| `$match` | Filtrer les documents | `WHERE` |
| `$group` | Regrouper et agréger | `GROUP BY` |
| `$sum` | Compter ou additionner | `COUNT()` ou `SUM()` |
| `$sort` | Trier les résultats | `ORDER BY` |
| `$project` | Choisir/renommer les champs | `SELECT ... AS` |

---

## 💻 Code implémenté

### Backend (Controller)

```javascript
// Fichier: backend/controllers/propertyController.js

exports.getSoldByCity = async (req, res) => {
  try {
    const stats = await Property.aggregate([
      // Étape 1: Filtrer uniquement les propriétés vendues
      { $match: { status: 'sold' } },
      
      // Étape 2: Grouper par ville et compter
      {
        $group: {
          _id: '$address.city',
          count: { $sum: 1 },
          totalValue: { $sum: '$price' }
        }
      },
      
      // Étape 3: Trier par nombre décroissant
      { $sort: { count: -1 } },
      
      // Étape 4: Reformater le résultat
      {
        $project: {
          _id: 0,
          city: '$_id',
          count: 1,
          totalValue: 1
        }
      }
    ]);

    const totalSold = stats.reduce((acc, item) => acc + item.count, 0);

    res.json({
      success: true,
      totalSold,
      byCity: stats
    });
  } catch (err) {
    console.error('Get sold by city error:', err);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des statistiques.' 
    });
  }
};
```

### Backend (Route)

```javascript
// Fichier: backend/routes/propertyRoutes.js

router.get('/stats/sold-by-city', getSoldByCity);
```

### Frontend (Client API)

```javascript
// Fichier: frontend/src/api/propertyClient.js

getSoldByCity: async () => {
  try {
    const response = await api.get('/api/properties/stats/sold-by-city');
    return response.data || response;
  } catch (error) {
    console.error('propertyClient.getSoldByCity error:', error);
    throw error;
  }
}
```

---

## 📤 Format de la réponse API

```json
{
  "success": true,
  "totalSold": 15,
  "byCity": [
    { "city": "Douala", "count": 7, "totalValue": 350000000 },
    { "city": "Yaoundé", "count": 5, "totalValue": 280000000 },
    { "city": "Kribi", "count": 3, "totalValue": 150000000 }
  ]
}
```

---

## 💡 Pourquoi utiliser l'agrégation MongoDB ?

| ❌ Mauvaise approche | ✅ Bonne approche (Agrégation) |
|---------------------|-------------------------------|
| Récupérer TOUTES les propriétés | Filtrer directement en base |
| Boucler en JavaScript pour compter | Laisser MongoDB faire le calcul |
| Beaucoup de données transférées | Seul le résultat est envoyé |
| Lent si beaucoup de données | Rapide même avec millions de docs |

---

## 🧪 Comment tester

### Avec cURL

```bash
curl http://localhost:5000/api/properties/stats/sold-by-city
```

### Dans le Frontend

```javascript
import { propertyClient } from './api/propertyClient';

const fetchStats = async () => {
  const stats = await propertyClient.getSoldByCity();
  console.log('Total vendu:', stats.totalSold);
  console.log('Par ville:', stats.byCity);
};
```

---

## 🎤 Phrase à retenir

> *"L'agrégation MongoDB fonctionne comme une chaîne de montage : les données passent par plusieurs étapes de transformation (filtrage, regroupement, tri, reformatage) et à la fin on obtient un résultat synthétisé directement depuis la base de données, sans avoir à tout récupérer et traiter côté serveur."*

---

## 📁 Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `backend/controllers/propertyController.js` | Ajout de la fonction `getSoldByCity` |
| `backend/routes/propertyRoutes.js` | Ajout de la route `GET /stats/sold-by-city` |
| `frontend/src/api/propertyClient.js` | Ajout de la méthode `getSoldByCity()` |

---

*Documentation créée le 12/12/2024*

