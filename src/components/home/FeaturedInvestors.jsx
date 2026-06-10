import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import homeStyles from './Home.module.css';
import cardStyles from '../jobs/JobCard.module.css';

const formatTicket = (min, max) => {
    const fmt = (v) => {
        if (!v) return null;
        if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
        if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
        if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
        return `₹${v}`;
    };
    const a = fmt(min);
    const b = fmt(max);
    if (a && b) return `${a} – ${b}`;
    if (a) return `${a}+`;
    if (b) return `Up to ${b}`;
    return null;
};

const InvestorCard = ({ inv }) => {
    const navigate = useNavigate();
    const name = inv.name || 'Anonymous Investor';
    const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const ticket = formatTicket(inv.ticketSizeMin, inv.ticketSizeMax);

    return (
        <div
            className={cardStyles.card}
            onClick={() => navigate(`/company/${inv._id || inv.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(`/company/${inv._id || inv.id}`)}
        >
            <div className={cardStyles.companyIcon}>
                {inv.logoUrl
                    ? <img src={inv.logoUrl} alt={name} />
                    : <span>{initials}</span>
                }
            </div>

            <div className={cardStyles.jobInfo}>
                <div className={cardStyles.topRow}>
                    <span className={cardStyles.title}>{name}</span>
                </div>
                <div className={cardStyles.company}>{name}</div>
                <div className={cardStyles.metaRow}>
                    {inv.location && (
                        <span className={cardStyles.metaItem}>
                            <i className="fas fa-map-marker-alt"></i> {inv.location}
                        </span>
                    )}
                    {inv.investorType && (
                        <span className={cardStyles.metaItem}>
                            <i className="fas fa-user-tie"></i> {inv.investorType}
                        </span>
                    )}
                    {ticket && (
                        <span className={cardStyles.metaItem}>
                            <i className="fas fa-money-bill-wave"></i> {ticket}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const FeaturedInvestors = () => {
    const [investors, setInvestors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvestors = async () => {
            try {
                const cached = sessionStorage.getItem('featuredInvestors');
                if (cached) {
                    setInvestors(JSON.parse(cached));
                    setLoading(false);
                }
                const { data } = await api.get('/investors?limit=4');
                if (data.success && data.data?.length > 0) {
                    const result = data.data.slice(0, 4);
                    setInvestors(result);
                    sessionStorage.setItem('featuredInvestors', JSON.stringify(result));
                }
            } catch (err) {
                console.error('Failed to fetch featured investors:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvestors();
    }, []);

    if (loading || investors.length === 0) return null;

    return (
        <section className={homeStyles.section}>
            <div className={homeStyles.sectionHeader}>
                <div>
                    <h2 className={homeStyles.sectionTitle}>Funding & Capital</h2>
                    <p className={homeStyles.sectionSubtitle}>Connect with investors and VCs ready to fund your vision</p>
                </div>
                <div
                    onClick={() => navigate('/investors')}
                    style={{ color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                >
                    View all
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {investors.map(inv => (
                    <InvestorCard key={String(inv._id || inv.id)} inv={inv} />
                ))}
            </div>
        </section>
    );
};

export default FeaturedInvestors;
