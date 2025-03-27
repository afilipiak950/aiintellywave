
import React from 'react';
import { GitBranch, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PipelineEmptyStateProps {
  userRole: string;
}

const PipelineEmptyState: React.FC<PipelineEmptyStateProps> = ({ userRole }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-64 p-8 border-2 border-dashed rounded-lg text-center"
    >
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <GitBranch className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2">No projects in your pipeline</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Your project pipeline will help you track progress and manage workflow efficiently.
      </p>
      
      {userRole !== 'customer' && (
        <Button asChild>
          <Link to={`/${userRole}/projects?create=true`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create a project
          </Link>
        </Button>
      )}
    </motion.div>
  );
};

export default PipelineEmptyState;
