import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../api/api'

function CheckoutForm({ clientSecret, paymentId, propertyId }){
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e)=>{
    e.preventDefault()
    if(!stripe || !elements) return
    setLoading(true)
    setError(null)
    setSuccess(false)
    try{
      const card = elements.getElement(CardElement)
      const res = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } })
      if(res.error) {
        setError(res.error.message)
      } else if(res.paymentIntent && res.paymentIntent.status === 'succeeded'){
        // Payment is successful, the backend will be notified via webhook
        // For now, we'll just show success and redirect
        setSuccess(true)
        // Redirect to seller dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard/seller')
        }, 2000)
      }
    }catch(e){ 
      setError(e.message || 'Erreur lors du paiement') 
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Informations de carte bancaire
        </label>
        <div className="border border-gray-300 rounded-lg p-3">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
      </div>
      
      {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
      {success && (
        <div className="text-green-600 mb-2 text-sm">
          Paiement effectué avec succès ! Redirection...
        </div>
      )}
      
      <button 
        disabled={!stripe || loading || success} 
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-700 text-white rounded-lg font-bold hover:from-purple-700 hover:to-violet-800 disabled:opacity-50"
      >
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i> Traitement...
          </>
        ) : success ? (
          <>
            <i className="fas fa-check mr-2"></i> Paiement réussi
          </>
        ) : (
          'Payer 5 000 FCFA'
        )}
      </button>
    </form>
  )
}

export default function BoostCheckout(){
  const navigate = useNavigate()
  const loc = useLocation()
  const params = new URLSearchParams(loc.search)
  const propertyId = params.get('propertyId')
  const [clientSecret, setClientSecret] = useState(null)
  const [stripePromise, setStripePromise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    const init = async ()=>{
      if(!propertyId) {
        setError('ID de propriété manquant')
        setLoading(false)
        return
      }
      
      try{
        // Request server to create PaymentIntent for property
        const res = await api.post('/api/payments/create-payment-intent', { 
          amount: 5000, 
          currency: 'XAF', 
          propertyId 
        })
        const { clientSecret } = res.data
        setClientSecret(clientSecret)
        
        const publicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE || ''
        if(!publicKey) {
          setError('Clé Stripe non configurée')
          return
        }
        setStripePromise(loadStripe(publicKey))
      }catch(e){
        console.error('Payment initialization error:', e)
        setError('Erreur lors de l\'initialisation du paiement: ' + (e.response?.data?.message || e.message))
      } finally {
        setLoading(false)
      }
    }
    
    if(propertyId) init()
    else {
      setError('ID de propriété manquant')
      setLoading(false)
    }
  }, [propertyId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold mb-2">Initialisation du paiement</h2>
              <p className="text-gray-600">Veuillez patienter...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="mx-auto bg-red-100 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-exclamation-circle text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold mb-2 text-red-600">Erreur</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/dashboard/seller')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-800"
              >
                Retour au tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Erreur d'initialisation</h2>
              <p className="text-gray-600">Impossible d'initialiser le paiement. Veuillez réessayer.</p>
              <button
                onClick={() => navigate('/dashboard/seller')}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-indigo-800"
              >
                Retour au tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold mb-2">Chargement de Stripe</h2>
              <p className="text-gray-600">Veuillez patienter...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto bg-gradient-to-r from-purple-600 to-violet-700 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-rocket text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Booster votre annonce</h1>
            <p className="text-gray-600">Paiement sécurisé par Stripe</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">Boost Standard</h3>
                <p className="text-sm text-gray-600">Mise en avant de votre annonce</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">5 000 FCFA</div>
                <div className="text-sm text-gray-600">pour 7 jours</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>Mise en tête de liste</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>Badge "Mise en avant"</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>Highlight visuel</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-500 mr-2"></i>
                <span>Plus de visibilité</span>
              </div>
            </div>
          </div>
          
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} propertyId={propertyId} />
          </Elements>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <div className="flex justify-center space-x-4 mb-4">
              <div className="flex items-center">
                <i className="fas fa-lock text-green-500 mr-2"></i>
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-shield-alt text-blue-500 mr-2"></i>
                <span>Données cryptées</span>
              </div>
            </div>
            <p>
              Vous ne serez débité qu'après validation de votre annonce par notre équipe. 
              Le paiement est sécurisé.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}