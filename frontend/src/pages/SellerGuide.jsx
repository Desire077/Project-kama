import React from 'react';

export default function SellerGuide() {
  const steps = [
    {
      title: "Évaluer la valeur de votre bien",
      description: "Faites estimer votre bien par un expert ou utilisez notre outil d'estimation en ligne.",
      icon: "fas fa-chart-line"
    },
    {
      title: "Préparer votre bien",
      description: "Mettez votre bien en état pour maximiser son attractivité : nettoyage, réparations, décoration.",
      icon: "fas fa-broom"
    },
    {
      title: "Rassembler les documents",
      description: "Collectez tous les documents nécessaires : titres de propriété, justificatifs, plans, etc.",
      icon: "fas fa-file-alt"
    },
    {
      title: "Créer une annonce attractive",
      description: "Rédigez une description détaillée et téléchargez des photos de qualité de votre bien.",
      icon: "fas fa-camera"
    },
    {
      title: "Publier votre annonce",
      description: "Soumettez votre annonce sur notre plateforme et attendez l'approbation de notre équipe.",
      icon: "fas fa-upload"
    },
    {
      title: "Gérer les visites",
      description: "Organisez les visites avec les acheteurs potentiels et présentez votre bien avantageusement.",
      icon: "fas fa-calendar-alt"
    },
    {
      title: "Négocier et vendre",
      description: "Négociez le prix avec les acheteurs et finalisez la vente avec l'aide de nos experts.",
      icon: "fas fa-handshake"
    }
  ];

  const tips = [
    {
      title: "Fixez un prix réaliste",
      content: "Un prix trop élevé découragera les acheteurs, tandis qu'un prix trop bas vous fera perdre de l'argent."
    },
    {
      title: "Soignez la présentation",
      content: "Un bien bien présenté attire plus d'acheteurs. Investissez dans le nettoyage et de petites réparations."
    },
    {
      title: "Soyez transparent",
      content: "Fournissez toutes les informations pertinentes sur votre bien pour éviter les mauvaises surprises."
    },
    {
      title: "Restez disponible",
      content: "Répondez rapidement aux demandes des acheteurs potentiels pour ne pas rater d'opportunités."
    }
  ];

  return (
    <div className="min-h-screen bg-kama-bg py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-kama-vert mb-4">Guide du Vendeur</h1>
          <p className="text-kama-muted max-w-3xl mx-auto">
            Suivez notre guide complet pour vendre votre bien immobilier rapidement et au meilleur prix.
          </p>
        </div>

        {/* Steps Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-kama-vert mb-8 text-center">Étapes pour vendre votre bien immobilier</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl shadow-kama-soft p-6 hover:shadow-lg transition">
                <div className="bg-kama-gold bg-opacity-10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <i className={`${step.icon} text-kama-gold text-lg`}></i>
                </div>
                <h3 className="font-bold text-kama-text mb-2">Étape {index + 1}</h3>
                <h4 className="text-lg font-semibold text-kama-vert mb-2">{step.title}</h4>
                <p className="text-kama-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-kama-vert mb-8 text-center">Conseils pour vendre plus rapidement</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white rounded-xl shadow-kama-soft p-6 flex">
                <div className="bg-kama-vert bg-opacity-10 w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-kama-vert font-bold">{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-bold text-kama-text mb-2">{tip.title}</h3>
                  <p className="text-kama-muted">{tip.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-kama-vert mb-8 text-center">Tarification et commissions</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-kama-soft p-6 border-t-4 border-kama-gold">
              <h3 className="font-bold text-kama-text mb-4">Publication gratuite</h3>
              <p className="text-kama-muted mb-4">Publiez votre annonce gratuitement sur notre plateforme.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Visibilité sur le site</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Contact avec les acheteurs</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Gestion de l'annonce</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-kama-soft p-6 border-t-4 border-kama-vert">
              <h3 className="font-bold text-kama-text mb-4">Pack Premium</h3>
              <div className="mb-4">
                <span className="text-2xl font-bold text-kama-vert">50 000 FCFA</span>
                <span className="text-kama-muted text-sm"> / annonce</span>
              </div>
              <p className="text-kama-muted mb-4">Boostez votre annonce pour plus de visibilité.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Tous les avantages gratuits</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Position premium dans les résultats</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Bannière "À la une"</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Relance automatique</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-kama-soft p-6 border-t-4 border-purple-600">
              <h3 className="font-bold text-kama-text mb-4">Service complet</h3>
              <div className="mb-4">
                <span className="text-2xl font-bold text-kama-vert">200 000 FCFA</span>
                <span className="text-kama-muted text-sm"> / transaction</span>
              </div>
              <p className="text-kama-muted mb-4">Notre équipe gère toute la transaction pour vous.</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Tous les avantages premium</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Accompagnement personnalisé</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Négociation avec les acheteurs</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check text-kama-gold mr-2"></i>
                  <span>Gestion administrative complète</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl shadow-kama-soft p-8">
          <h2 className="text-2xl font-bold text-kama-vert mb-6">Documents nécessaires pour vendre</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-kama-text mb-4">Documents de propriété :</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Titre de propriété (acte notarié)</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Relevé de situation hypothécaire</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Plan de situation et plan de masse</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Autorisations d'urbanisme (permis de construire)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-kama-text mb-4">Documents du vendeur :</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Pièce d'identité (CNI ou passeport)</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Justificatif de domicile</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Attestation de non-gage</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Procuration (si vente par représentation)</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-kama-gold bg-opacity-10 rounded-lg border border-kama-gold">
            <div className="flex">
              <i className="fas fa-info-circle text-kama-gold text-xl mr-3 mt-1"></i>
              <div>
                <h3 className="font-bold text-kama-text mb-1">Besoin d'aide ?</h3>
                <p className="text-kama-muted">
                  Notre équipe d'experts peut vous accompagner dans toutes les étapes de la vente de votre bien. 
                  <a href="/contact" className="text-kama-vert font-medium ml-1">Contactez-nous</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}