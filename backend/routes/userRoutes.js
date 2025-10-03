const express = require("express");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Exemple : route accessible uniquement si connecté
router.get("/profile", protect, (req, res) => {
  res.json({ message: "Bienvenue sur ton profil", user: req.user });
});

module.exports = router;
