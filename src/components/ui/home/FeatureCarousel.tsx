import React, { useState, useEffect, useRef } from 'react';
import { Card, Text } from '@mantine/core';
import styles from './FeatureCarousel.module.css';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

interface FeatureCarouselProps {
  features: Feature[];
}

export const FeatureCarousel: React.FC<FeatureCarouselProps> = ({ features }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const autoplayRef = useRef<NodeJS.Timeout>();

  const startAutoplay = () => {
    autoplayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 3000);
  };

  useEffect(() => {
    if (isAutoplay) {
      startAutoplay();
    }
    return () => clearInterval(autoplayRef.current);
  }, [isAutoplay, features.length]);

  const handleMouseEnter = () => setIsAutoplay(false);
  const handleMouseLeave = () => setIsAutoplay(true);

  return (
    <div 
      className={styles.carouselContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.carouselTrack}>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const position = (index - activeIndex + features.length) % features.length;
          
          return (
            <Card
              key={index}
              className={`${styles.featureCard} ${styles['position-' + position]}`}
              onClick={() => setActiveIndex(index)}
              style={{
                '--feature-color': feature.color
              } as React.CSSProperties}
            >
              <div className={styles.iconWrapper}>
                <Icon size={32} className={styles.icon} />
                <div className={styles.iconGlow} />
              </div>
              <Text className={styles.title}>{feature.title}</Text>
              <Text className={styles.description}>{feature.description}</Text>
              
              <div className={styles.cardBackground}>
                <div className={styles.cardGlow} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className={styles.indicators}>
        {features.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === activeIndex ? styles.active : ''}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};