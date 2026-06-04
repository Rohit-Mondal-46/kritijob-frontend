import React, { useState } from 'react';
import styles from './SalaryGuide.module.css';

const SALARY_DATA = [
  {
    id: 1,
    role: 'Driver',
    category: 'Logistics & Transport',
    min: '₹1,80,000',
    max: '₹3,00,000',
    avg: '₹2,16,000',
    growth: '+8%',
    demand: 'High'
  },
  {
    id: 2,
    role: 'Security Supervisor',
    category: 'Security Services',
    min: '₹2,40,000',
    max: '₹3,60,000',
    avg: '₹3,00,000',
    growth: '+5%',
    demand: 'Moderate'
  },
  {
    id: 3,
    role: 'AC Technician',
    category: 'Technical Services',
    min: '₹2,00,000',
    max: '₹4,00,000',
    avg: '₹3,00,000',
    growth: '+12%',
    demand: 'High'
  },
  {
    id: 4,
    role: 'Delivery Partner',
    category: 'Logistics & Transport',
    min: '₹1,50,000',
    max: '₹3,50,000',
    avg: '₹2,40,000',
    growth: '+15%',
    demand: 'Very High'
  },
  {
    id: 5,
    role: 'Electrician',
    category: 'Technical Services',
    min: '₹1,80,000',
    max: '₹3,60,000',
    avg: '₹2,70,000',
    growth: '+10%',
    demand: 'High'
  },
  {
    id: 6,
    role: 'Sales Executive',
    category: 'Sales & Business',
    min: '₹2,00,000',
    max: '₹4,50,000',
    avg: '₹3,00,000',
    growth: '+11%',
    demand: 'High'
  }
];

const SalaryGuide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = SALARY_DATA.filter(item => 
    item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Salary Explorer</h1>
        <p className={styles.subtitle}>
          Discover your earning potential. Explore market-competitive salary ranges across top job roles and industries in India.
        </p>
        
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search by job title or category..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.searchButton}>Explore</button>
        </div>
      </header>

      <div className={styles.sectionHeader}>
        <h2 style={{fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)'}}>
          Market Salaries & Insights
        </h2>
        <p style={{color: 'var(--color-text-muted)', marginBottom: '30px'}}>Based on recent industry data and placement trends.</p>
      </div>

      <div className={styles.grid}>
        {filteredData.length > 0 ? (
          filteredData.map(item => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.roleTitle}>{item.role}</h3>
                <span className={styles.category}>{item.category}</span>
              </div>
              
              <div className={styles.salaryRange}>
                <div className={styles.salaryLabel}>Average Annual Salary</div>
                <div className={styles.salaryValue}>{item.avg}</div>
              </div>

              <div className={styles.salaryRange}>
                <div className={styles.salaryLabel}>Salary Range</div>
                <div style={{fontWeight: '600', color: 'var(--color-text-main)'}}>
                  {item.min} — {item.max}
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Growth</span>
                  <span className={styles.statValue} style={{color: '#059669'}}>{item.growth}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Market Demand</span>
                  <span className={styles.statValue}>{item.demand}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <i className="fas fa-search" style={{fontSize: '3rem', marginBottom: '1rem', opacity: '0.2'}}></i>
            <p>No roles found matching your search.</p>
          </div>
        )}
      </div>

      <footer style={{marginTop: '80px', background: 'var(--color-surface-muted)', padding: '40px', borderRadius: '16px', textAlign: 'center'}}>
        <h3 style={{fontWeight: '700', marginBottom: '15px'}}>Want to know your exact worth?</h3>
        <p style={{color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 25px'}}>
          Our personalized AI career advisor can analyze your specific skills, experience, and certifications to give you a more accurate salary estimation.
        </p>
        <button className="btn btn-primary" style={{padding: '12px 30px', borderRadius: '8px', fontWeight: '600'}}>Get Career Insight</button>
      </footer>
    </div>
  );
};

export default SalaryGuide;
