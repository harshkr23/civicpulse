import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReportForm from './components/ReportForm';
import ComplaintsList from './components/ComplaintsList';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  if (window.location.pathname === '/admin') {
    return <AdminDashboard />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', color: '#e2e8f0' }} className="antialiased">
      <Navbar />
      <main>
        <Hero />
        <ReportForm onSubmitted={() => setRefreshKey((k) => k + 1)} />
        <ComplaintsList refreshKey={refreshKey} />
        <HowItWorks />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

export default App;
