import React from 'react';
import styles from './Testimonials.module.css';
import avatar1 from '../../assets/images/user_avatar_1.png';
import avatar2 from '../../assets/images/user_avatar_2.png';

const Testimonials = () => {
    const reviews = [
        {
            id: 1,
            name: "Shivam Patel",
            role: "Software Engineer",
            image: avatar1,
            rating: 5,
            text: "This job portal made job search easy and quick. Recommended to all job seekers!"
        },
        {
            id: 2,
            name: "Abhishek Kullu",
            role: "Designer",
            image: avatar2,
            rating: 5,
            text: "Found my dream job within a week! The application process was smooth."
        },
        {
            id: 3,
            name: "Swapnil Pandey",
            role: "Data Scientist",
            image: avatar1,
            rating: 4,
            text: "I secured a job offer within days of applying. Exceptional user experience and support."
        },
        {
            id: 4,
            name: "Pavan Barnana",
            role: "Product Manager",
            image: avatar2, // Using generated female image as placeholder/example
            rating: 5,
            text: "Highly efficient job portal with excellent resources. Helped me land a great position."
        }
    ];

    return (
        <section className={styles.section}>
            <div className="focused-container">
                <div className={styles.header}>
                    <h2>What <span className="text-gradient">User</span> says about us?</h2>
                </div>

                <div className={styles.grid}>
                    {reviews.map((review, index) => (
                        <div key={review.id} className={`${styles.card} glass-card`}>
                            <div className={styles.userInfo}>
                                <img src={review.image} alt={review.name} className={styles.avatar} />
                                <div>
                                    <h4>{review.name}</h4>
                                    <div className={styles.rating}>
                                        {[...Array(5)].map((_, i) => (
                                            <i 
                                                key={i} 
                                                className={`fas fa-star ${i < review.rating ? styles.filled : styles.empty}`}
                                            ></i>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className={styles.reviewText}>
                                "{review.text}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
