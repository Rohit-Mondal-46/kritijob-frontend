import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import EmployerHome from '../components/home/EmployerHome';
import Hero from '../components/layout/Hero';
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
        <main style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', maxWidth: '1600px', margin: '0 auto', paddingBottom: '32px', paddingTop: '10px' }}>
            <Hero />
            <FeaturedJobs />
            <FeaturedStartups />
            <FeaturedInvestors />
            <JobCategories />
            <CareerCTA />
            <FeaturesStrip />
            <Footer />
        </main>
    );
};

export default Home;
