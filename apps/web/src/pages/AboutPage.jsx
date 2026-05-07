import React from 'react';
import { Helmet } from 'react-helmet';
import { Target, Eye, Award, Users } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To develop students through community service, instilling social and civic responsibility while promoting national integration and sustainable development.'
    },
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To create a generation of socially conscious youth who actively contribute to nation-building through voluntary service and community engagement.'
    },
    {
      icon: Award,
      title: 'Our Values',
      description: 'Integrity, compassion, dedication, and selfless service form the foundation of everything we do at NSS SRM RMP.'
    },
    {
      icon: Users,
      title: 'Our Community',
      description: 'A diverse network of passionate volunteers working together to create meaningful change in society through collaborative action.'
    }
  ];

  const stats = [
    { value: '150', label: 'Active Volunteers', color: 'text-primary' },
    { value: '12,400', label: 'Service Hours', color: 'text-primary' },
    { value: '63', label: 'Events Organized', color: 'text-primary' },
    { value: '28', label: 'Communities Served', color: 'text-primary' }
  ];

  return (
    <>
      <Helmet>
        <title>About Us - NSS SRM RMP</title>
        <meta
          name="description"
          content="Learn about NSS SRM RMP's mission, vision, and impact in creating positive social change through community service and youth empowerment."
        />
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-muted to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight" style={{ letterSpacing: '-0.02em' }}>
              About NSS SRM RMP
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Empowering students to serve society and build a better tomorrow through dedicated community service
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-xl shadow-primary/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-4xl md:text-5xl font-extrabold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chapter Description */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-balance leading-tight" style={{ letterSpacing: '-0.02em' }}>
                NSS at SRM Institute
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-justify">
                <p>
                  The National Service Scheme at SRM Institute of Science and Technology, Ramapuram Campus, Chennai, has been a beacon of social service and community development since its inception. Our chapter is dedicated to nurturing socially responsible citizens who actively contribute to nation-building.
                </p>
                <p>
                  Through various initiatives ranging from environmental conservation to educational outreach, our volunteers have touched thousands of lives. We believe in the philosophy of "Not Me But You," which emphasizes selfless service and putting community needs before individual interests.
                </p>
                <p>
                  Our programs are designed to provide students with hands-on experience in addressing real-world social challenges. From organizing health camps in rural areas to conducting literacy drives, every activity is an opportunity for personal growth and social impact.
                </p>
                <p>
                  We work closely with local communities, government agencies, and NGOs to maximize our reach and effectiveness. Our volunteers develop essential life skills including leadership, teamwork, empathy, and problem-solving while making a tangible difference in society.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src="/nss-logo.png"
                alt="NSS SRM RMP Logo"
                className="rounded-2xl shadow-lg w-full object-contain"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AboutPage;