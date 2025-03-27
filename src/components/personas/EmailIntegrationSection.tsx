
import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { EmailAccountsCard } from './EmailAccountsCard';
import { EmailMessagesCard } from './EmailMessagesCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmailIntegrationSection() {
  const [activeView, setActiveView] = useState<'cards' | 'tabs'>('cards');
  const [isPending, startTransition] = useTransition();
  
  // Animation variants
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

  const handleViewChange = (view: 'cards' | 'tabs') => {
    startTransition(() => {
      setActiveView(view);
    });
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div variants={item} className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Email & Platform Integrations
          </h2>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant={activeView === 'cards' ? "default" : "outline"}
              onClick={() => handleViewChange('cards')}
              className="flex items-center gap-1"
              disabled={isPending}
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Card View</span>
            </Button>
            <Button 
              size="sm" 
              variant={activeView === 'tabs' ? "default" : "outline"}
              onClick={() => handleViewChange('tabs')}
              className="flex items-center gap-1"
              disabled={isPending}
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Tab View</span>
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Connect your email accounts and analyze email content to create personalized AI personas.
        </p>
      </motion.div>
      
      {activeView === 'cards' ? (
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
      ) : (
        <motion.div variants={item} className="bg-card rounded-lg border shadow-sm">
          <Tabs defaultValue="accounts" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-0 rounded-t-lg rounded-b-none bg-muted/50 p-1">
              <TabsTrigger value="accounts" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Mail className="h-4 w-4 text-primary" />
                <span>Connected Accounts</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-background">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>Email Content</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounts" className="p-6 m-0 border-t">
              <EmailAccountsCard />
            </TabsContent>
            
            <TabsContent value="messages" className="p-6 m-0 border-t">
              <EmailMessagesCard />
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
      
      <motion.div 
        variants={item}
        className="bg-muted/30 rounded-lg p-4 border border-dashed mt-2"
      >
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How Email Integration Works</p>
            <p>
              Connect your email accounts securely via OAuth to analyze your communication style.
              The system will create AI personas based on your email content to help you communicate more effectively.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
