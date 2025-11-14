import React from 'react';

export default function BuyerGuide() {
  const steps = [
    {
      title: "Définir votre budget",
      description: "Évaluez vos finances et déterminez le montant maximum que vous pouvez investir dans l'achat d'un bien immobilier.",
      icon: "fas fa-wallet"
    },
    {
      title: "Choisir le type de bien",
      description: "Déterminez le type de bien qui correspond à vos besoins : maison, appartement, terrain, etc.",
      icon: "fas fa-home"
    },
    {
      title: "Sélectionner la localisation",
      description: "Identifiez les quartiers qui correspondent à vos critères en termes d'accessibilité, d'environnement et de services.",
      icon: "fas fa-map-marker-alt"
    },
    {
      title: "Rechercher les offres",
      description: "Utilisez notre moteur de recherche pour trouver les biens correspondant à vos critères.",
      icon: "fas fa-search"
    },
    {
      title: "Visiter les biens",
      description: "Contactez les vendeurs pour organiser des visites des biens qui vous intéressent.",
      icon: "fas fa-calendar-check"
    },
    {
      title: "Négocier le prix",
      description: "Une fois le bien identifié, négociez le prix avec le vendeur jusqu'à trouver un accord.",
      icon: "fas fa-handshake"
    },
    {
      title: "Finaliser l'achat",
      description: "Procédez aux démarches administratives et juridiques pour finaliser l'achat.",
      icon: "fas fa-file-contract"
    }
  ];

  const tips = [
    {
      title: "Vérifiez la légalité du bien",
      content: "Assurez-vous que le vendeur est le propriétaire légitime et que le bien ne présente aucun problème juridique."
    },
    {
      title: "Faites appel à un expert",
      content: "Pour les biens importants, faites appel à un expert immobilier pour évaluer la valeur du bien."
    },
    {
      title: "Prévoyez les frais annexes",
      content: "N'oubliez pas de prévoir les frais de notaire, d'enregistrement et autres frais liés à l'achat."
    },
    {
      title: "Inspectez minutieusement",
      content: "Examinez attentivement l'état du bien, ses installations et son environnement avant d'acheter."
    }
  ];

  return (
    <div className="min-h-screen bg-kama-bg py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-kama-vert mb-4">Guide de l'Acheteur</h1>
          <p className="text-kama-muted max-w-3xl mx-auto">
            Découvrez toutes les étapes clés pour acheter votre bien immobilier en toute sérénité.
          </p>
        </div>

        {/* Steps Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-kama-vert mb-8 text-center">Étapes pour acheter un bien immobilier</h2>
          
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
          <h2 className="text-2xl font-bold text-kama-vert mb-8 text-center">Conseils essentiels</h2>
          
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

        {/* Additional Info */}
        <div className="bg-white rounded-xl shadow-kama-soft p-8">
          <h2 className="text-2xl font-bold text-kama-vert mb-6">Documents nécessaires pour l'achat</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-kama-text mb-4">En tant qu'acheteur individuel :</h3>
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
                  <span className="text-kama-muted">Relevé bancaire ou attestation de solvabilité</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Procuration (si achat par représentation)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-kama-text mb-4">En tant que société :</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Extrait K-bis ou registre de commerce</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Statuts de la société</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Pièce d'identité du représentant légal</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-kama-gold mt-1 mr-2"></i>
                  <span className="text-kama-muted">Procès-verbal de nomination du dirigeant</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-kama-gold bg-opacity-10 rounded-lg border border-kama-gold">
            <div className="flex">
              <i className="fas fa-info-circle text-kama-gold text-xl mr-3 mt-1"></i>
              <div>
                <h3 className="font-bold text-kama-text mb-1">Besoin d'assistance ?</h3>
                <p className="text-kama-muted">
                  Notre équipe d'experts est disponible pour vous accompagner dans toutes les étapes de votre achat immobilier. 
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