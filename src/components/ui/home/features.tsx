import { Carousel } from '@mantine/carousel';
import { Card, Text, Button, Box } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import classes from './features.module.css';

interface DestinationCardProps {
  image: string;
  title: string;
  category: string;
  trips: number;
}

function DestinationCard({ image, title, category, trips }: DestinationCardProps) {
  return (
    <Card className={classes.card} style={{ backgroundImage: `url(${image})` }}>
      <Text className={classes.category}>{category}</Text>
      <Text className={classes.title}>{title}</Text>
      <Text className={classes.trips}>{trips} viajes disponibles</Text>
      <Button 
        component={Link} 
        to={`/reservar?destino=${title}`} 
        className={classes.button}
      >
        Reservar ahora
      </Button>
    </Card>
  );
}

const data = [
  {
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=720&q=80',
    title: 'Madrid',
    category: 'CIUDAD',
    trips: 120,
  },
  {
    image: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=720&q=80',
    title: 'Barcelona',
    category: 'PLAYA',
    trips: 95,
  },
  // ... otros destinos
];

export function CardsCarousel() {
  return (
    <Box className={classes.carouselWrapper}>
      <Carousel
        slideSize="100%"  
        slideGap="md"
        loop
        align="start"
        slidesToScroll={1}
        classNames={{
          root: classes.carousel,
          slide: classes.carouselSlide,
          control: classes.carouselControl,
        }}
        nextControlIcon={<ChevronRight size={20} />}
        previousControlIcon={<ChevronLeft size={20} />}
      >
        {data.map((item) => (
          <Carousel.Slide key={item.title}>
            <DestinationCard {...item} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
}
