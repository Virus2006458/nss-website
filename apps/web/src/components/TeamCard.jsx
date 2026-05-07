import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

const TeamCard = ({ member, index = 0 }) => {
  const photoUrl = member.photo
    ? supabase.storage.from('images').getPublicUrl(member.photo).data.publicUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=400&background=random`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden h-full group hover:shadow-lg transition-all duration-300">
        <div className="relative overflow-hidden aspect-square">
          <img
            src={photoUrl}
            alt={member.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
          <p className="text-sm text-primary font-medium mb-3">{member.designation}</p>
          {member.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TeamCard;