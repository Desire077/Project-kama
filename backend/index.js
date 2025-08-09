// 1) Importer express
const express = require("express");
const app = express();

// 2) Définir le port
const PORT = process.env.PORT || 5000;

// 3) Route test
app.get("/", (req, res) => {
  res.send("Bienvenue sur le backend de Project-Kama 🚀");
});

// 4) Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});