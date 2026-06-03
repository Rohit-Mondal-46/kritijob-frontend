import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import EmployerHome from '../components/home/EmployerHome';
import Hero from '../components/layout/Hero';
import FeaturedJobs from '../components/home/FeaturedJobs';
import JobCategories from '../components/home/JobCategories';
import CareerCTA from '../components/home/CareerCTA';
import FeaturesStrip from '../components/home/FeaturesStrip';
import Footer from '../components/layout/Footer';

const Home = () => {
    const { user } = useContext(AuthContext);

    if (user?.role === 'employer') {
        return <EmployerHome />;
    }

    return (
        <main style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', maxWidth: '1600px', margin: '0 auto', paddingBottom: '32px', paddingTop: '10px' }}>
            <Hero />
            <FeaturedJobs />
            <JobCategories />
            <CareerCTA />
            <FeaturesStrip />
            <Footer />
        </main>
    );
};

export default Home;
