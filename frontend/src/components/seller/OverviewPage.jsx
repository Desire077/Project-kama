import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import propertyClient from '../../api/propertyClient';
import userClient from '../../api/userClient';
import OverviewCard from '../OverviewCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function OverviewPage() {
  const auth = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    viewsByProperty: [],
    propertyTypes: [],
    performanceMetrics: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load user stats
      const statsResponse = await userClient.getStats();
      const statsData = statsResponse.data || statsResponse;
      
      // Load user properties
      const propertiesResponse = await propertyClient.getMyProperties();
      const propertiesData = propertiesResponse.data || propertiesResponse;
      
      // Process stats data for charts
      const viewsByProperty = propertiesData.map(property => ({
        name: property.title.length > 20 ? property.title.substring(0, 20) + '...' : property.title,
        views: property.views || 0,
        favorites: property.favorites || 0,
        contacts: property.contacts || 0
      }));
      
      // Count property types
      const propertyTypeCounts = propertiesData.reduce((acc, property) => {
        acc[property.type] = (acc[property.type] || 0) + 1;
        return acc;
      }, {});
      
      const propertyTypes = Object.entries(propertyTypeCounts).map(([name, value]) => ({
        name,
        value
      }));
      
      // Performance metrics
      const totalViews = propertiesData.reduce((sum, property) => sum + (property.views || 0), 0);
      const totalContacts = propertiesData.reduce((sum, property) => sum + (property.contacts || 0), 0);
      const totalFavorites = propertiesData.reduce((sum, property) => sum + (property.favorites || 0), 0);
      const totalProperties = propertiesData.length;
      
      const performanceMetrics = {
        totalViews,
        totalContacts,
        totalFavorites,
        totalProperties,
        avgViewsPerProperty: totalProperties > 0 ? Math.round(totalViews / totalProperties) : 0,
        avgContactsPerProperty: totalProperties > 0 ? Math.round(totalContacts / totalProperties) : 0,
        conversionRate: totalViews > 0 ? Math.round((totalContacts / totalViews) * 100) : 0
      };
      
      setStats({
        viewsByProperty,
        propertyTypes,
        performanceMetrics
      });
    } catch (error) {
      console.error('Error loading overview data:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-kama-bg flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-kama-vert mb-4">Connectez-vous pour accéder à votre tableau de bord</h1>
          <button 
            onClick={() => navigate('/login')}
            className="premium-btn-primary px-6 py-3 rounded-lg font-medium"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-poppins font-semibold text-kama-vert">
          Vue d'ensemble
        </h1>
        <p className="text-kama-muted">Voici les performances de vos annonces</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Performance Metrics Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse shadow-soft"></div>
          ))
        ) : (
          <>
            <OverviewCard 
              label="Vues totales" 
              value={stats.performanceMetrics.totalViews} 
              colorClass="bg-kama-vert"
              trend={12}
            />
            <OverviewCard 
              label="Contacts reçus" 
              value={stats.performanceMetrics.totalContacts} 
              colorClass="bg-kama-dore"
              trend={8}
            />
            <OverviewCard 
              label="Favoris" 
              value={stats.performanceMetrics.totalFavorites} 
              colorClass="bg-purple-500"
              trend={5}
            />
            <OverviewCard 
              label="Annonces actives" 
              value={stats.performanceMetrics.totalProperties} 
              colorClass="bg-gray-500"
              trend={0}
            />
          </>
        )}
      </section>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views by Property */}
        <section className="bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="font-poppins font-semibold text-lg text-kama-vert mb-4">Vues par annonce</h2>
          {loading ? (
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.viewsByProperty}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#0088FE" name="Vues" />
                  <Bar dataKey="favorites" fill="#00C49F" name="Favoris" />
                  <Bar dataKey="contacts" fill="#FFBB28" name="Contacts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Property Types Distribution */}
        <section className="bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="font-poppins font-semibold text-lg text-kama-vert mb-4">Distribution par type d'annonce</h2>
          {loading ? (
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.propertyTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.propertyTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}