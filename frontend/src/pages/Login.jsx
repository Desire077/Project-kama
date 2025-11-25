import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '../api/api'
import authClient from '../api/authClient'
import { useDispatch } from 'react-redux'
import { setUser, setToken } from '../store/slices/authSlice'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
})

export default function Login(){
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect URL from query params
  const searchParams = new URLSearchParams(location.search)
  const redirectUrl = searchParams.get('redirect')

  async function onSubmit(data){
    try {
      const res = await authClient.login(data)
      dispatch(setUser(res.user))
      dispatch(setToken(res.token))
      
      // Si une URL de redirection est fournie, y rediriger l'utilisateur
      if (redirectUrl) {
        navigate(redirectUrl)
        return
      }
      
      // Sinon, rediriger vers le dashboard basé sur le rôle
      if (res.user.role === 'vendeur') {
        navigate('/dashboard/seller')
      } else if (res.user.role === 'admin') {
        navigate('/dashboard/admin/properties')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de connexion')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gabon-beige to-white">
     <div className="w-full max-w-md">
        <div className="gabon-card rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto bg-gradient-to-r from-gabon-green to-dark-forest text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
              <i className="fas fa-lock text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
            <p className="text-gray-600">Accédez à votre espace Project-Kama</p>
            
            {/* Social Proof Element */}
            <div className="mt-4 flex justify-center items-center text-sm text-gray-500">
              <i className="fas fa-users text-gabon-green mr-1"></i>
              <span>Rejoint par 12,000+ utilisateurs</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <div className="relative">
                <input 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="votre@email.com"
                  {...register('email')} 
                />
                <i className="fas fa-envelope absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Mot de passe</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gabon-green smooth-transition ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="••••••••"
                  {...register('password')} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gabon-green focus:ring-gabon-green border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <div className="text-sm">
                <Link to="/mdp" className="font-medium text-gabon-green hover:text-dark-forest">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Engagement Element - Password Strength Indicator */}
            <div className="p-3 bg-gabon-beige rounded-lg border border-gray-200">
              <div className="flex items-center text-sm text-gray-700">
                <i className="fas fa-shield-alt text-gabon-green mr-2"></i>
                <span>Vos informations sont sécurisées avec chiffrement 256-bit</span>
              </div>
            </div>

            <button 
              disabled={isSubmitting} 
              className="w-full gabon-btn-primary py-3 rounded-lg font-bold disabled:opacity-50 shadow-lg hover-glow"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i> Connexion en cours...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
          
          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover-glow"
              >
                <i className="fab fa-google text-red-500"></i>
                <span className="ml-2">Google</span>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover-glow"
              >
                <i className="fab fa-facebook text-blue-600"></i>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="font-medium text-gabon-green hover:text-dark-forest">
                Inscrivez-vous
              </Link>
            </p>
            
            {/* Reciprocity Element */}
            <div className="mt-4 p-3 bg-gabon-gold bg-opacity-10 rounded-lg border border-gabon-gold inline-flex items-center">
              <i className="fas fa-gift text-gabon-gold mr-2"></i>
              <span className="text-sm text-gray-700">Premier mois gratuit pour les nouveaux vendeurs</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Project-Kama. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}