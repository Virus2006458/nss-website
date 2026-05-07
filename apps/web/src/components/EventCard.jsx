import React from 'react';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

const EventCard = ({ event, index = 0 }) => {
  const imageUrl = event.image_url || (event.image
    ? supabase.storage.from('images').getPublicUrl(event.image).data.publicUrl
    : 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isUpcoming = event.eventType === 'upcoming';
  const hasLink = !!event.googleFormLink;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col group hover:shadow-xl transition-all duration-300 bg-card border-primary/10">
        <div className="relative overflow-hidden h-[120px] shrink-0">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2">
             <Badge
              variant={isUpcoming ? 'default' : 'secondary'}
              className={isUpcoming ? 'bg-primary text-white text-[10px] py-0 px-2 shadow-lg shadow-primary/20' : 'bg-primary/10 text-primary backdrop-blur-md border border-primary/20 text-[10px] py-0 px-2'}
            >
              {isUpcoming ? 'Upcoming' : 'Past Event'}
            </Badge>
          </div>
        </div>
        
        <CardContent className="flex-1 p-6 flex flex-col items-center justify-center gap-4 text-center bg-primary/5 backdrop-blur-sm">
          <h3 className="text-lg md:text-xl font-bold text-foreground uppercase tracking-wide">
            {event.title}
          </h3>
          <p className="text-sm font-semibold text-primary">
            {formatDate(event.date)}
          </p>
        </CardContent>

        {hasLink && (
          <CardFooter className="p-4 pt-0 bg-primary/5 backdrop-blur-sm">
            <Button
              className="w-full h-10 text-sm font-bold btn-gradient-pt hover:scale-[1.02] transition-transform"
              onClick={() => window.open(event.googleFormLink, '_blank')}
            >
              Join Now
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default EventCard;