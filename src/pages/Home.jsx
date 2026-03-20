import Hero from '../components/layout/Hero';
import FeaturedJobs from '../components/home/FeaturedJobs';
import JobCategories from '../components/home/JobCategories';
import CareerCTA from '../components/home/CareerCTA';
import FeaturesStrip from '../components/home/FeaturesStrip';
import Footer from '../components/layout/Footer';

const Home = () => {
    return (
        <main style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh', maxWidth: '1600px', margin: '0 auto', paddingBottom: '32px', paddingTop: '50px' }}>
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
