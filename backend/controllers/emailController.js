const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @desc    Send welcome email
// @route   POST /api/email/welcome
// @access  Private
exports.sendWelcomeEmail = async (req, res) => {
  try {
    const { email, firstName } = req.body;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Bienvenue sur Kama !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Bienvenue sur Kama, ${firstName} !</h1>
          <p>Merci de vous être inscrit sur notre plateforme immobilière.</p>
          <p>Vous pouvez maintenant :</p>
          <ul>
            <li>Rechercher des biens immobiliers</li>
            <li>Créer des annonces</li>
            <li>Gérer votre profil</li>
          </ul>
          <p>Bonne navigation !</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email de bienvenue envoyé.' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'envoi de l\'email.' });
  }
};

// @desc    Send property inquiry email
// @route   POST /api/email/inquiry
// @access  Private
exports.sendInquiryEmail = async (req, res) => {
  try {
    const { propertyId, message, contactInfo } = req.body;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'contact@kama.com', // Property owner email
      subject: 'Nouvelle demande d\'information',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Nouvelle demande d'information</h1>
          <p><strong>Propriété ID:</strong> ${propertyId}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Contact:</strong> ${contactInfo}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Demande d\'information envoyée.' });
  } catch (error) {
    console.error('Error sending inquiry email:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'envoi de l\'email.' });
  }
};

// @desc    Send password reset email
// @route   POST /api/email/reset-password
// @access  Public
exports.sendPasswordResetEmail = async (req, res) => {
  try {
    const { email, resetToken } = req.body;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Réinitialisation de votre mot de passe</h1>
          <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
             style="background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
          <p>Ce lien expire dans 1 heure.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email de réinitialisation envoyé.' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'envoi de l\'email.' });
  }
};

// @desc Send property validation email to owner
exports.sendPropertyValidationEmail = async ({ to, firstName, propertyTitle, propertyId, status, reason }) => {
  try {
    const subject = status === 'online' ? 'Votre annonce a été validée' : 'Votre annonce a été rejetée';
    const html = status === 'online' ?
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h1 style="color:#1e40af">Bonjour ${firstName}</h1><p>Votre annonce "${propertyTitle}" a été validée et est désormais en ligne.</p><p>Consultez-la ici: <a href="${process.env.FRONTEND_URL}/offers/${propertyId}">Voir l'annonce</a></p></div>` :
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h1 style="color:#1e40af">Bonjour ${firstName}</h1><p>Nous sommes désolés, votre annonce "${propertyTitle}" a été rejetée.</p><p>Raison: ${reason || 'Non spécifiée'}</p><p>Vous pouvez la modifier et la soumettre à nouveau.</p></div>`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending property validation email:', error);
    return false;
  }
}
