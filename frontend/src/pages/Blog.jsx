import React, { useState } from 'react';

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [openedPost, setOpenedPost] = useState(null);

  // Enhanced blog posts data with more detailed real estate content
  const blogPosts = [
    {
      id: 1,
      title: "Tendances immobilières au Gabon en 2023",
      excerpt: "Découvrez les dernières tendances du marché immobilier gabonais et comment elles peuvent affecter vos décisions d'achat ou de vente.",
      content: `
        <p>Le marché immobilier gabonais connaît des transformations significatives en 2023, marquées par une stabilisation progressive après les fluctuations des années précédentes.</p>
        
        <h3>Évolution des prix</h3>
        <p>À Libreville, les prix moyens au mètre carré se situent entre 800 000 et 1 200 000 FCFA selon les quartiers. Les zones comme l'Olympe, le Plateau et le Quartier des Institutions maintiennent des prix élevés en raison de leur attractivité.</p>
        
        <h3>Quartiers en développement</h3>
        <p>Les quartiers de Ndjili, Akébé et Andoulou connaissent un essor particulier grâce aux infrastructures nouvelles et à la construction de routes bitumées. Ces zones offrent un excellent rapport qualité-prix pour les investisseurs.</p>
        
        <h3>Impact économique</h3>
        <p>La diversification de l'économie gabonaise et les projets d'infrastructure liés au plan Gabon Émergent influencent positivement le secteur immobilier. Les banques locales ont également adapté leurs produits de financement pour répondre à la demande croissante.</p>
      `,
      category: "marché",
      date: "15 Juin 2023",
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "Comment bien négocier le prix de votre bien",
      excerpt: "Apprenez les techniques essentielles pour négocier efficacement le prix de votre bien immobilier.",
      content: `
        <p>La négociation immobilière est un art qui peut faire gagner plusieurs milliers de francs CFA. Voici les clés pour réussir votre transaction.</p>
        
        <h3>Préparation avant la négociation</h3>
        <p>Étudiez le marché : Analysez les prix des biens similaires dans le quartier. Un bon agent immobilier peut vous fournir ces informations. Déterminez votre fourchette de prix acceptable avant toute discussion.</p>
        
        <h3>Techniques de négociation</h3>
        <ul>
          <li>Soyez le dernier à donner un chiffre</li>
          <li>Justifiez vos propositions avec des éléments concrets</li>
          <li>Utilisez le silence comme technique de pression</li>
          <li>Négociez sur d'autres aspects que le prix (délai, inclusion d'équipements, etc.)</li>
        </ul>
        
        <h3>Erreurs à éviter</h3>
        <p>Ne montrez pas trop d'enthousiasme pour un bien, cela affaiblit votre position. Évitez les concessions trop rapides qui pourraient laisser penser que vous pouvez baisser davantage.</p>
      `,
      category: "conseils",
      date: "10 Juin 2023",
      readTime: "7 min",
      image: "https://images.unsplash.com/photo-1523374547115-7d4d80884098?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      title: "Les quartiers en plein essor à Libreville",
      excerpt: "Explorez les quartiers qui connaissent une croissance rapide à Libreville et pourquoi ils sont attractifs pour les investisseurs.",
      content: `
        <p>Libreville se transforme rapidement, et certains quartiers connaissent un développement exceptionnel. Voici ceux qui devraient être sur votre radar d'investisseur.</p>
        
        <h3>Ndjili</h3>
        <p>Avec la construction de nouvelles routes et l'amélioration des infrastructures, Ndjili attire de plus en plus de familles moyennes. Les prix restent accessibles tout en offrant un fort potentiel de plus-value.</p>
        
        <h3>Akébé</h3>
        <p>Ce quartier résidentiel en développement bénéficie d'un cadre verdoyant et d'une proximité avec les zones commerciales. Il commence à attirer les classes moyennes supérieures.</p>
        
        <h3>Andoulou</h3>
        <p>En pleine mutation, Andoulou voit l'arrivée de nouveaux projets résidentiels et commerciaux. La zone est particulièrement prisée pour son équilibre entre tranquillité et accessibilité.</p>
        
        <h3>Facteurs de croissance</h3>
        <p>L'urbanisation croissante, les améliorations d'infrastructures et la demande de logements abordables soutiennent la croissance de ces quartiers émergents.</p>
      `,
      category: "localisation",
      date: "5 Juin 2023",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1523374547115-7d4d80884098?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      title: "Financement immobilier : quelles options pour vous ?",
      excerpt: "Découvrez les différentes options de financement disponibles pour l'achat de votre bien immobilier au Gabon.",
      content: `
        <p>L'accès à la propriété devient plus accessible grâce aux solutions de financement adaptées au contexte gabonais. Examinons les options disponibles.</p>
        
        <h3>Crédits bancaires classiques</h3>
        <p>Les principales banques du Gabon (BGFI, Ecobank, Banque Internationale du Gabon) proposent des prêts immobiliers avec des taux variant entre 12% et 18% sur une durée pouvant aller jusqu'à 20 ans.</p>
        
        <h3>Apport requis</h3>
        <p>Les banques exigent généralement un apport initial de 20% à 30% du prix du bien. Cet apport peut provenir d'épargne personnelle, de cadeaux familiaux ou de prêts sociaux.</p>
        
        <h3>Alternatives innovantes</h3>
        <p>Certaines institutions proposent des solutions de co-propriété ou des plans d'épargne logement. Le système de crédit-bail est également utilisé pour les biens commerciaux.</p>
        
        <h3>Documents nécessaires</h3>
        <p>Fiche de salaire, relevés bancaires sur 6 mois, justificatifs de domicile, et pour les indépendants, des états financiers détaillés sont requis pour constituer un dossier complet.</p>
      `,
      category: "financement",
      date: "1 Juin 2023",
      readTime: "8 min",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 5,
      title: "Bien préparer sa visite de bien immobilier",
      excerpt: "Suivez notre checklist pour bien préparer votre visite et identifier les points importants à vérifier.",
      content: `
        <p>Une visite immobilière bien préparée augmente vos chances de trouver le bien idéal et évite les mauvaises surprises. Voici notre guide complet.</p>
        
        <h3>Avant la visite</h3>
        <p>Dressez une liste de vos besoins prioritaires (nombre de pièces, budget maximum, quartiers privilégiés). Préparez des questions spécifiques sur le bien et ses alentours.</p>
        
        <h3>Points d'attention pendant la visite</h3>
        <ul>
          <li>Vérifiez l'état général des installations électriques, plomberie et menuiseries</li>
          <li>Testez l'isolation phonique et thermique</li>
          <li>Observez l'exposition naturelle et l'environnement immédiat</li>
          <li>Vérifiez la sécurité du quartier et la disponibilité des services publics</li>
          <li>Notez les problèmes visibles (humidité, fissures, etc.)</li>
        </ul>
        
        <h3>Questions essentielles à poser</h3>
        <p>Interrogez le vendeur ou l'agent sur l'historique du bien, les charges mensuelles, les travaux prévus, les risques naturels et les procédures de copropriété si applicable.</p>
      `,
      category: "conseils",
      date: "25 Mai 2023",
      readTime: "4 min",
      image: "https://images.unsplash.com/photo-1523374547115-7d4d80884098?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 6,
      title: "Investir dans l'immobilier locatif : est-ce rentable ?",
      excerpt: "Analyse de la rentabilité de l'investissement locatif au Gabon et conseils pour débuter.",
      content: `
        <p>L'investissement locatif peut générer des revenus complémentaires stables, mais nécessite une approche stratégique. Voici ce qu'il faut savoir.</p>
        
        <h3>Rendement locatif moyen</h3>
        <p>A Libreville, le rendement brut varie entre 6% et 10% selon les quartiers. Après déduction des charges, taxes et entretien, le rendement net se situe généralement entre 4% et 7%.</p>
        
        <h3>Facteurs de rentabilité</h3>
        <p>La localisation reste primordiale. Les quartiers en développement comme Ndjili ou Akébé offrent un bon potentiel de plus-value. Les biens proches des universités ou des zones d'affaires assurent une bonne rotation des locataires.</p>
        
        <h3>Risques et contraintes</h3>
        <p>Le vide locatif peut durer plusieurs mois, surtout hors saison universitaire. La gestion locative exige du temps et des compétences, ou l'intermédiaire d'une agence (facturant 8-12% du loyer mensuel).</p>
        
        <h3>Stratégie d'investissement</h3>
        <p>Optez pour des biens nécessitant peu de travaux, privilégiez les surfaces fonctionnelles et adaptables. Diversifiez vos investissements géographiquement pour réduire les risques.</p>
      `,
      category: "investissement",
      date: "20 Mai 2023",
      readTime: "9 min",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const categories = [
    { id: 'tous', name: 'Tous les articles' },
    { id: 'marché', name: 'Marché immobilier' },
    { id: 'conseils', name: 'Conseils' },
    { id: 'localisation', name: 'Quartiers & Localisation' },
    { id: 'financement', name: 'Financement' },
    { id: 'investissement', name: 'Investissement' }
  ];

  const filteredPosts = selectedCategory === 'tous' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-kama-bg py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-kama-vert mb-4">Blog Immobilier</h1>
          <p className="text-kama-muted max-w-3xl mx-auto">
            Découvrez nos articles, conseils et analyses sur le marché immobilier gabonais.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === category.id
                  ? 'bg-kama-vert text-white'
                  : 'bg-white text-kama-text hover:bg-kama-bg'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <article key={post.id} className="bg-white rounded-xl shadow-kama-soft overflow-hidden hover:shadow-lg transition">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center text-xs text-kama-muted mb-3">
                  <span className="bg-kama-bg px-2 py-1 rounded">
                    {categories.find(cat => cat.id === post.category)?.name}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readTime} de lecture</span>
                </div>
                <h2 className="text-xl font-bold text-kama-text mb-3">{post.title}</h2>
                <p className="text-kama-muted mb-4">{post.excerpt}</p>
                <button 
                  onClick={() => setOpenedPost(post)}
                  className="text-kama-vert font-medium hover:text-opacity-80 transition flex items-center"
                >
                  Lire l'article
                  <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-kama-vert to-dark-forest rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Restez informé</h2>
          <p className="text-kama-bg max-w-2xl mx-auto mb-6">
            Inscrivez-vous à notre newsletter pour recevoir les dernières actualités immobilières et nos conseils exclusifs.
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-l-lg focus:outline-none"
            />
            <button className="bg-kama-gold text-kama-vert px-6 py-3 rounded-r-lg font-medium hover:bg-opacity-90 transition">
              S'inscrire
            </button>
          </div>
        </div>
      </div>

      {/* Modal lecture d'article */}
      {openedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-2xl font-bold text-kama-text">{openedPost.title}</h3>
                <div className="text-sm text-kama-muted mt-1">{openedPost.date} • {openedPost.readTime}</div>
              </div>
              <button 
                className="px-3 py-2 rounded-lg bg-gray-200 text-kama-text"
                onClick={() => setOpenedPost(null)}
              >
                Fermer
              </button>
            </div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: openedPost.content }} />
          </div>
        </div>
      )}
    </div>
  );
}