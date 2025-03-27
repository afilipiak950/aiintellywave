
import { motion } from 'framer-motion';
import { EmailAccountsCard } from './EmailAccountsCard';
import { EmailMessagesCard } from './EmailMessagesCard';

export function EmailIntegrationSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div variants={item} className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Email & Platform Integrations
        </h2>
        <p className="text-muted-foreground">
          Connect your email accounts and analyze email content for your personas.
        </p>
      </motion.div>
      
      <motion.div 
        variants={item} 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div 
          whileHover={{ y: -8, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="h-full"
        >
          <EmailAccountsCard />
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -8, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="h-full"
        >
          <EmailMessagesCard />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
