import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Hero from '../components/Hero';

export default function Home() {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { value: 0, target: 83, label: "% des annonces vendues en moins de 60 jours" },
    { value: 0, target: 15000, label: "Offres actives sur la plateforme" },
    { value: 0, target: 12000, label: "Utilisateurs vérifiés" }
  ]);
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showBuyerModal, setShowBuyerModal] = useState(false);

  // Handle "Publier mon bien" button click
  const handlePublishProperty = () => {
    if (!user) {
      // If user is not logged in, go to login page with redirect
      navigate('/login?redirect=/vendre');
    } else if (user.role === 'vendeur') {
      // If user is a seller, go to the sell page
      navigate('/vendre');
    } else {
      // If user is a buyer, show modal
      setShowBuyerModal(true);
    }
  };

  // Close buyer modal
  const closeBuyerModal = () => {
    setShowBuyerModal(false);
  };

  // Animate statistics counters
  useEffect(() => {
    const timers = stats.map((stat, index) => {
      if (stat.value < stat.target) {
        return setInterval(() => {
          setStats(prevStats => {
            const newStats = [...prevStats];
            if (newStats[index].value < newStats[index].target) {
              const increment = Math.ceil(newStats[index].target / 100);
              newStats[index].value = Math.min(
                newStats[index].value + increment,
                newStats[index].target
              );
            }
            return newStats;
          });
        }, 20);
      }
      return null;
    });

    return () => timers.forEach(timer => timer && clearInterval(timer));
  }, []);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % 4);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Testimonial data
  const testimonials = [
    {
      id: 1,
      text: "J'ai mis en ligne ma maison à Libreville, Kama m'a conseillé un meilleur prix et j'ai vendu en 2 semaines.",
      author: "Richard N.",
      role: "Propriétaire à Nzeng-Ayong",
      avatar: "RN"
    },
    {
      id: 2,
      text: "En tant que vendeur, j'apprécie la validation des documents et la sécurité des transactions. Mes biens se vendent beaucoup plus rapidement grâce à la plateforme.",
      author: "Marie Curie",
      role: "Propriétaire à Akanda",
      avatar: "MC"
    },
    {
      id: 3,
      text: "Grâce à Kama, j'ai trouvé mon appartement de rêve en moins de 2 semaines. La recherche avancée m'a permis de filtrer exactement selon mes critères.",
      author: "Jean Pierre",
      role: "Acheteur à Mont-Bouët",
      avatar: "JP"
    },
    {
      id: 4,
      text: "Les alertes personnalisées m'ont permis de trouver un appartement parfait pour mes études. La communication directe avec le propriétaire via WhatsApp a été très pratique.",
      author: "Sophie Lambert",
      role: "Étudiante à l'UOB",
      avatar: "SL"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />
      
      {/* Buyer Modal */}
      {showBuyerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-kama-vert bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-info-circle text-kama-vert text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-kama-text mb-4">Compte acheteur détecté</h3>
              <p className="text-kama-muted mb-6">
                Vous possédez actuellement un compte acheteur. Pour publier une annonce, vous devez créer un compte vendeur.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={closeBuyerModal}
                  className="px-6 py-3 border border-kama-vert text-kama-vert rounded-xl font-medium hover:bg-kama-vert hover:text-white transition"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    closeBuyerModal();
                    navigate('/profile');
                  }}
                  className="px-6 py-3 bg-kama-vert text-white rounded-xl font-medium hover:bg-opacity-90 transition"
                >
                  Accéder à mon profil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Seller Argumentation Section - Premium Design */}
      <section className="py-20 bg-kama-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-kama-vert mb-4 animate-fade-in">Vendez avec un avantage concret</h2>
            <p className="text-kama-muted max-w-2xl mx-auto text-lg animate-fade-in delay-100">
              Notre technologie vous donne un avantage compétitif sur le marché immobilier gabonais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-up">
              <div className="w-16 h-16 bg-kama-vert bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <i className="fas fa-lightbulb text-kama-vert text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-kama-text mb-3">Vendez avec intelligence</h3>
              <p className="text-kama-muted mb-4">
                Notre plateforme analyse le marché gabonais et vous conseille le bon prix.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-up delay-100">
              <div className="w-16 h-16 bg-kama-vert bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <i className="fas fa-cog text-kama-vert text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-kama-text mb-3">Gérez tout simplement</h3>
              <p className="text-kama-muted mb-4">
                Publiez, modifiez et suivez vos offres depuis votre tableau de bord.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-up delay-200">
              <div className="w-16 h-16 bg-kama-vert bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <i className="fas fa-compass text-kama-vert text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-kama-text mb-3">Soyez visible partout</h3>
              <p className="text-kama-muted mb-4">
                Des milliers d'acheteurs visitent Kama chaque semaine.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-up delay-300">
              <div className="w-16 h-16 bg-kama-vert bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <i className="fas fa-lock text-kama-vert text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-kama-text mb-3">Sécurité garantie</h3>
              <p className="text-kama-muted mb-4">
                Vos annonces sont vérifiées et protégées contre la fraude.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sell With Kama Section - Premium Design */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-kama-vert mb-4 animate-fade-in">Des résultats concrets pour les vendeurs</h2>
            <p className="text-kama-muted max-w-2xl mx-auto text-lg animate-fade-in delay-100">
              Découvrez les performances de notre plateforme
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-8 bg-gradient-to-br from-kama-bg to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-up delay-100">
                <div className="text-5xl md:text-6xl font-bold mb-4 text-kama-vert">
                  {stat.target >= 1000 ? `${Math.round(stat.value / 1000)}k+` : stat.value}
                  {stat.target >= 100 && stat.value === stat.target && '+'}
                </div>
                <p className="text-kama-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Premium Design */}
      <section className="py-20 bg-kama-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-kama-vert mb-4 animate-fade-in">Ils ont vendu grâce à Kama</h2>
            <p className="text-kama-muted max-w-2xl mx-auto text-lg animate-fade-in delay-100">
              Découvrez les histoires de réussite de nos utilisateurs
            </p>
          </div>
          
          {/* Testimonial Carousel for mobile */}
          <div className="md:hidden max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-kama-vert flex items-center justify-center text-white font-bold mr-4">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <h4 className="font-bold text-kama-text">{testimonials[currentTestimonial].author}</h4>
                  <p className="text-kama-muted text-sm">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
              <p className="text-kama-text italic mb-4">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="flex text-kama-dore">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>
            
            {/* Carousel indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-kama-vert' : 'bg-gray-300'
                  }`}
                  aria-label={`Voir le témoignage ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
          
          {/* Testimonial Grid for larger screens */}
          <div className="hidden md:block max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.slice(0, 2).map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-kama-vert flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-kama-text">{testimonial.author}</h4>
                      <p className="text-kama-muted text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-kama-text italic mb-4">
                    "{testimonial.text}"
                  </p>
                  <div className="flex text-kama-dore">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Additional testimonials for larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {testimonials.slice(2, 4).map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in delay-100">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-kama-vert flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-kama-text">{testimonial.author}</h4>
                      <p className="text-kama-muted text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-kama-text italic mb-4">
                    "{testimonial.text}"
                  </p>
                  <div className="flex text-kama-dore">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Premium Design */}
      <section className="py-24 relative overflow-hidden bg-cover bg-center" 
               style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')" }}>
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-kama-vert/80 to-black/90"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fade-in">
            Ne laissez pas votre bien attendre.
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-200 animate-fade-in delay-100">
            Faites confiance à l'expert immobilier intelligent du Gabon.
          </p>
          
          <button 
            onClick={handlePublishProperty}
            className="inline-block bg-kama-dore text-kama-vert font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 animate-pulse shadow-lg hover:shadow-kama-gold"
          >
            <i className="fas fa-bolt mr-2"></i>
            Publier mon bien maintenant
          </button>
          
          {/* Scarcity indicator */}
          <div className="mt-8 flex flex-col items-center animate-fade-in delay-200">
            <div className="flex items-center bg-white bg-opacity-20 px-6 py-3 rounded-full border border-white">
              <i className="fas fa-fire text-white mr-2"></i>
              <span className="font-medium text-gray-200">Seulement 3 biens similaires à ce prix</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}