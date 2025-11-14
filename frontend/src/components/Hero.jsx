import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Hero() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Hero slides data
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1523374547115-7d4d80884098?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      title: "Vendez plus vite. Achetez plus intelligemment.",
      subtitle: "Kama, votre conseiller immobilier intelligent au cœur du Gabon."
    },
    {
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      title: "Le luxe tropical et la réussite immobilière.",
      subtitle: "Découvrez des biens exceptionnels dans des lieux prestigieux."
    },
    {
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80",
      title: "Transformez vos annonces en ventes.",
      subtitle: "Notre technologie analyse le marché pour vous aider à fixer le bon prix."
    }
  ];

  const handlePublishClick = (e) => {
    e.preventDefault();
    if (!user) {
      // Redirect unauthenticated users to login with return URL
      navigate('/login?redirect=/vendre');
    } else {
      // Authenticated users can publish
      navigate('/vendre');
    }
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Slides container */}
      <div 
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0 relative">
            {/* Background image with overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/80" />
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font-poppins animate-fade-in-up">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl mb-10 max-w-3xl font-inter animate-fade-in-up delay-200">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                <button 
                  onClick={handlePublishClick}
                  className="bg-gradient-to-r from-kama-dore to-white bg-opacity-30 text-kama-vert font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 shadow-kama floating flex items-center justify-center"
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  Publier mon bien
                </button>
                <Link 
                  to="/offers" 
                  className="border-2 border-white text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:bg-white hover:text-kama-vert transform hover:scale-105 flex items-center justify-center"
                >
                  <i className="fas fa-search mr-2"></i>
                  Découvrir les offres
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Slide indicators */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-kama-dore w-6' : 'bg-white/50'
            }`}
            aria-label={`Voir la slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <i className="fas fa-chevron-down text-2xl"></i>
      </div>
    </section>
  );
}