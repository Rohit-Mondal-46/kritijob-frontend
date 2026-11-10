import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FourPillars.module.css';
import candidatesImg from '../../assets/images/pillar_candidates.jpg';
import employersImg from '../../assets/images/pillar_employers.jpg';
import startupsImg from '../../assets/images/pillar_startups.jpg';
import investorsImg from '../../assets/images/pillar_investors.jpg';

const FourPillars = () => {
    const navigate = useNavigate();

    return (
        <section id="four-pillars-section" className={styles.section}>
            <div className={styles.container}>
                
                {/* ── PILLAR 1: CANDIDATES (Job Seekers) ── Image on Right */}
                <div className={styles.row}>
                    <div className={styles.textCol}>
                        <span className={`${styles.subtitle} ${styles.colorCandidate}`}>I'M A JOB SEEKER</span>
                        <h2 className={styles.title}>Find your path & scale your career</h2>
                        <p className={styles.description}>
                            Discover roles matching your skills, apply with a single click, track your applications in real-time, and get matched with top product teams.
                        </p>
                        <ul className={styles.list}>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgCandidateCheck}`}><i className="fas fa-check"></i></span>
                                Personalised recommendations engine
                            </li>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgCandidateCheck}`}><i className="fas fa-check"></i></span>
                                Verified profile showcasing your project portfolios
                            </li>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgCandidateCheck}`}><i className="fas fa-check"></i></span>
                                Direct messaging to hiring managers
                            </li>
                        </ul>
                        <div className={styles.actions}>
                            <button onClick={() => navigate('/jobs')} className={`${styles.btn} ${styles.btnCandidate}`}>
                                Search jobs &rarr;
                            </button>
                            <button onClick={() => navigate('/login')} className={styles.btnLink}>
                                Build profile
                            </button>
                        </div>
                    </div>
                    <div className={styles.imageCol}>
                        <div className={styles.imageWrapper}>
                            <span className={`${styles.badge} ${styles.bgCandidate}`}>For Candidates</span>
                            <img 
                                src={candidatesImg} 
                                alt="Candidates" 
                                className={styles.image}
                            />
                            <div className={styles.overlayLabel}>Verified profiles</div>
                        </div>
                    </div>
                </div>

                {/* ── PILLAR 2: EMPLOYERS ── Image on Left */}
                <div className={`${styles.row} ${styles.rowReverse}`}>
                    <div className={styles.textCol}>
                        <span className={`${styles.subtitle} ${styles.colorEmployer}`}>I'M HIRING</span>
                        <h2 className={styles.title}>Post jobs, find talent & build your team</h2>
                        <p className={styles.description}>
                            Streamline hiring with an advanced applicant-tracking system, reach thousands of qualified professionals, and grow your employer brand effortlessly.
                        </p>
                        <ul className={styles.list}>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgEmployerCheck}`}><i className="fas fa-check"></i></span>
                                Smart applicant tracking & pipeline views
                            </li>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgEmployerCheck}`}><i className="fas fa-check"></i></span>
                                Branded company page & highlighted listings
                            </li>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgEmployerCheck}`}><i className="fas fa-check"></i></span>
                                Priority support & advanced filters
                            </li>
                        </ul>
                        <div className={styles.actions}>
                            <button onClick={() => navigate('/login')} className={`${styles.btn} ${styles.btnEmployer}`}>
                                Start hiring &rarr;
                            </button>
                        </div>
                    </div>
                    <div className={styles.imageCol}>
                        <div className={styles.imageWrapper}>
                            <span className={`${styles.badge} ${styles.bgEmployer}`}>For Employers</span>
                            <img 
                                src={employersImg} 
                                alt="Employers" 
                                className={styles.image}
                            />
                            <div className={styles.overlayLabel}>ATS + talent pool</div>
                        </div>
                    </div>
                </div>

                {/* ── PILLAR 3: STARTUPS ── Image on Right */}
                <div className={styles.row}>
                    <div className={styles.textCol}>
                        <span className={`${styles.subtitle} ${styles.colorStartup}`}>I'M A STARTUP / IDEA</span>
                        <h2 className={styles.title}>Pitch your startup & get discovered</h2>
                        <p className={styles.description}>
                            Showcase traction, tell your story, and put your venture in front of investors actively looking to fund the next big thing — all from one profile.
                        </p>
                        <ul className={styles.list}>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgStartupCheck}`}><i className="fas fa-check"></i></span>
                                Traction dashboard: MRR, users, growth charts
                            </li>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgStartupCheck}`}><i className="fas fa-check"></i></span>
                                Investor discovery by sector & stage
                            </li>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgStartupCheck}`}><i className="fas fa-check"></i></span>
                                Pitch room for deck, video & updates
                            </li>
                        </ul>
                        <div className={styles.actions}>
                            <button onClick={() => navigate('/startups')} className={`${styles.btn} ${styles.btnStartup}`}>
                                List your startup &rarr;
                            </button>
                        </div>
                    </div>
                    <div className={styles.imageCol}>
                        <div className={styles.imageWrapper}>
                            <span className={`${styles.badge} ${styles.bgStartup}`}>For Startups & Ideas</span>
                            <img 
                                src={startupsImg} 
                                alt="Startups" 
                                className={styles.image}
                            />
                            <div className={styles.overlayLabel}>Get funded faster</div>
                        </div>
                    </div>
                </div>

                {/* ── PILLAR 4: INVESTORS ── Image on Left */}
                <div className={`${styles.row} ${styles.rowReverse}`}>
                    <div className={styles.textCol}>
                        <span className={`${styles.subtitle} ${styles.colorInvestor}`}>I'M AN INVESTOR / VC</span>
                        <h2 className={styles.title}>Discover & shortlist promising startups</h2>
                        <p className={styles.description}>
                            Filter by sector and stage, compare traction side-by-side, and connect with founders directly — a clean, curated pipeline instead of inbox chaos.
                        </p>
                        <ul className={styles.list}>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgInvestorCheck}`}><i className="fas fa-check"></i></span>
                                Sector & stage filters with saved searches
                            </li>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgInvestorCheck}`}><i className="fas fa-check"></i></span>
                                Standardised traction cards for fast comparison
                            </li>
                            <li>
                                <span className={`${styles.checkIcon} ${styles.bgInvestorCheck}`}><i className="fas fa-check"></i></span>
                                Direct founder messaging & deal room
                            </li>
                        </ul>
                        <div className={styles.actions}>
                            <button onClick={() => navigate('/investors')} className={`${styles.btn} ${styles.btnInvestor}`}>
                                Become an investor &rarr;
                            </button>
                        </div>
                    </div>
                    <div className={styles.imageCol}>
                        <div className={styles.imageWrapper}>
                            <span className={`${styles.badge} ${styles.bgInvestor}`}>For Investors / VCs</span>
                            <img 
                                src={investorsImg} 
                                alt="Investors" 
                                className={styles.image}
                            />
                            <div className={styles.overlayLabel}>Curated deal flow</div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default FourPillars;
