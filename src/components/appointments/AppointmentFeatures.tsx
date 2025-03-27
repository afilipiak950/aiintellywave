
import { motion } from 'framer-motion';
import { HelpCircle, MessageSquare, Clock, PieChart } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../../components/ui/card';

export const AppointmentFeatures = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: HelpCircle,
      title: t('platformQuestions'),
      description: t('platformQuestionsDesc')
    },
    {
      icon: MessageSquare,
      title: t('featureDiscussion'),
      description: t('featureDiscussionDesc')
    },
    {
      icon: Clock,
      title: t('flexibleScheduling'),
      description: t('flexibleSchedulingDesc')
    },
    {
      icon: PieChart,
      title: t('dataInsights'),
      description: t('dataInsightsDesc')
    }
  ];
  
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
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-6 mt-8"
    >
      {features.map((feature, index) => (
        <motion.div key={index} variants={item}>
          <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/80 dark:bg-sidebar/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="mb-4 bg-primary/10 p-3 rounded-full inline-block">
                <feature.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
