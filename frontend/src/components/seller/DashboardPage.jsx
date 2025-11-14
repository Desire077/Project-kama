import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import OverviewPage from './OverviewPage';
import ListingsPage from './ListingsPage';
import StatisticsPage from './StatisticsPage';
import BoostPage from './BoostPage';
import ProfilePage from './ProfilePage';

export default function DashboardPage() {
  const { section } = useParams();
  
  // Determine which section to show based on URL or default to overview
  const currentSection = section || 'overview';

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {currentSection === 'overview' && <OverviewPage />}
        {currentSection === 'listings' && <ListingsPage />}
        {currentSection === 'statistics' && <StatisticsPage />}
        {currentSection === 'boost' && <BoostPage />}
        {currentSection === 'profile' && <ProfilePage />}
      </div>
    </DashboardLayout>
  );
}