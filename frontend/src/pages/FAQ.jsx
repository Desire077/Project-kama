import React, { useState } from 'react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Comment puis-je publier une annonce ?",
      answer: "Pour publier une annonce, vous devez d'abord créer un compte sur notre plateforme. Une fois connecté, rendez-vous dans votre espace vendeur et cliquez sur 'Créer une annonce'. Suivez les étapes en remplissant les informations requises sur votre bien."
    },
    {
      question: "Quels documents dois-je fournir pour vendre mon bien ?",
      answer: "Pour vendre votre bien, vous devez fournir : les titres de propriété, un justificatif d'identité, un relevé de situation hypothécaire, et des photos de qualité de votre bien. Nos experts vérifieront ces documents avant la mise en ligne de votre annonce."
    },
    {
      question: "Combien de temps faut-il pour que mon annonce soit en ligne ?",
      answer: "Après soumission de votre annonce avec tous les documents requis, notre équipe de vérification examine votre dossier dans un délai de 24 à 48 heures. Une fois approuvée, votre annonce est automatiquement mise en ligne."
    },
    {
      question: "Comment contacter un vendeur ?",
      answer: "Sur chaque fiche d'annonce, vous trouverez un bouton 'Contacter le vendeur'. En cliquant dessus, vous serez redirigé vers WhatsApp pour communiquer directement avec le vendeur."
    },
    {
      question: "Puis-je modifier mon annonce après publication ?",
      answer: "Oui, vous pouvez modifier votre annonce à tout moment depuis votre tableau de bord vendeur. Connectez-vous à votre compte, allez dans 'Mes annonces' et cliquez sur 'Modifier' pour l'annonce concernée."
    },
    {
      question: "Comment fonctionne le système de boost d'annonce ?",
      answer: "Le boost d'annonce permet de mettre en avant votre bien dans les résultats de recherche. Votre annonce apparaîtra en tête de liste pendant une durée déterminée (1, 7 ou 30 jours). Pour booster une annonce, allez dans votre tableau de bord et cliquez sur 'Booster'."
    }
  ];

  return (
    <div className="min-h-screen bg-kama-bg py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-kama-vert mb-4">Questions Fréquemment Posées</h1>
          <p className="text-kama-muted max-w-2xl mx-auto">
            Trouvez les réponses aux questions les plus courantes sur notre plateforme.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-kama-soft overflow-hidden">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 last:border-b-0">
              <button
                className="flex justify-between items-center w-full p-6 text-left focus:outline-none"
                onClick={() => toggleAccordion(index)}
                aria-expanded={openIndex === index}
              >
                <h3 className="text-lg font-medium text-kama-text">{faq.question}</h3>
                <svg
                  className={`w-5 h-5 text-kama-gold transition-transform duration-300 ${openIndex === index ? 'transform rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 text-kama-muted">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-kama-soft p-8 text-center">
          <h3 className="text-xl font-semibold text-kama-vert mb-4">Vous ne trouvez pas la réponse à votre question ?</h3>
          <p className="text-kama-muted mb-6">
            Notre équipe de support est disponible pour vous aider.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-kama-vert text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition"
          >
            Contactez-nous
          </a>
        </div>
      </div>
    </div>
  );
}