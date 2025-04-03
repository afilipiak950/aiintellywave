
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Form, FormItem, FormLabel, FormControl, FormField } from '@/components/ui/form';
import { MessageSquare, Lock } from 'lucide-react';
import { useXingIntegration } from '@/hooks/use-xing-integration';

const XingIntegrationTab = () => {
  const { 
    username, 
    setUsername, 
    password, 
    setPassword,
    isEditing,
    existingIntegration,
    handleSubmit,
    startEditing,
    cancelEditing
  } = useXingIntegration();

  const form = useForm({
    defaultValues: {
      username: username,
      password: ''
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-green-50 p-3 rounded-full">
          <MessageSquare className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-medium">Xing Integration</h2>
          <p className="text-sm text-gray-500">Connect your Xing account to import contacts and messages</p>
        </div>
      </div>

      {existingIntegration && !isEditing ? (
        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{existingIntegration.username}</p>
                <p className="text-sm text-gray-500">Connected on {new Date(existingIntegration.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={startEditing}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your Xing username" 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 mt-6">
              {isEditing && (
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {existingIntegration ? 'Update Connection' : 'Connect with Xing'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Card>
  );
};

export default XingIntegrationTab;
