
import React from 'react';
import { Search, Users, Settings, Layers } from 'lucide-react';
import { Card } from "@/components/ui/card";

export const FeaturesTabContent = () => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Advanced Search Parameters</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate optimized Boolean search strings with precise keywords, modifiers, and operators for maximum search effectiveness.
        </p>
      </Card>

      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Target Profile Creation</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Define detailed candidate or lead profiles with specific skills, experiences, demographics, and attributes for your search.
        </p>
      </Card>

      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Platform-Specific Optimization</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Tailored search strings optimized for LinkedIn, major job boards, CRM systems, and other recruitment or lead generation platforms.
        </p>
      </Card>

      <Card className="border border-muted p-4">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Multi-Parameter Search</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Combine multiple search criteria to create complex strings that target precisely the candidates or leads your campaign needs.
        </p>
      </Card>
    </div>
  );
};
