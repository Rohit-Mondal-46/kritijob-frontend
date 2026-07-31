import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import EmployerHome from '../components/home/EmployerHome';
import Hero from '../components/layout/Hero';
import EntryAndSteps from '../components/home/EntryAndSteps';
import FourPillars from '../components/home/FourPillars';
import FeaturedJobs from '../components/home/FeaturedJobs';
import FeaturedStartups from '../components/home/FeaturedStartups';
import FeaturedInvestors from '../components/home/FeaturedInvestors';
import JobCategories from '../components/home/JobCategories';
import CareerCTA from '../components/home/CareerCTA';
import FeaturesStrip from '../components/home/FeaturesStrip';
import Footer from '../components/layout/Footer';
import { updateSEO } from '../utils/seo';

const Home = () => {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user?.role === 'employer') {
            updateSEO({
                title: 'Employer Dashboard',
                description: 'Post jobs, find top talent, and manage your company profile on KirtiJob.',
            });
        } else {
            updateSEO({
                title: 'Premium Job Portal',
                description: 'Your gateway to premium career opportunities. Connect with top employers and showcase your professional journey with confidence.',
            });
        }
    }, [user]);

    if (user?.role === 'employer') {
        return <EmployerHome />;
    }

    return (
        <main style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', maxWidth: '1600px', margin: '0 auto', paddingLeft: '10px', paddingRight: '10px', paddingBottom: '32px', paddingTop: '10px' }}>
            <Hero />
            <EntryAndSteps />
            <FourPillars />
            <FeaturedJobs />
            <FeaturedStartups />
            <FeaturedInvestors />
            <JobCategories />
            <CareerCTA />
            <FeaturesStrip />
            <Footer />

            {/* Floating WhatsApp Button */}
            <a 
                href="https://wa.me/919991421687" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    left: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    zIndex: 9999,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
                }}
            >
                <i className="fab fa-whatsapp"></i>
            </a>
        </main>
    );
};

export default Home;
