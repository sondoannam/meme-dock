import { useState } from 'react';
import { AppwriteException } from 'appwrite';
import { client } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, Activity, Loader2 } from 'lucide-react';
import { StatusMessage } from './status-message';

export const DatabaseManager = () => {
  const [healthStatus, setHealthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [setupStatus, setSetupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [healthMessage, setHealthMessage] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  // Function to check database health
  async function checkDatabaseHealth() {
    setHealthStatus('loading');
    setHealthMessage(null);
    try {
      await client.ping(); // Just check if ping succeeds
      setHealthStatus('success');
      setHealthMessage('Database connection is healthy!');
    } catch (err) {
      setHealthStatus('error');
      setHealthMessage(
        err instanceof AppwriteException ? err.message : 'Failed to connect to the database',
      );
    }
  }

  // Function to setup database collections
  async function setupDatabaseCollections() {
    setSetupStatus('loading');
    setSetupMessage(null);
    try {
      // Here you would implement the actual collection setup
      // This is just a placeholder for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate async operation

      setSetupStatus('success');
      setSetupMessage('Database collections successfully created!');

      // In a real implementation, you would do something like:
      // await databases.createCollection('memes', { ... });
      // await databases.createCollection('tags', { ... });
      // etc.
    } catch (err) {
      setSetupStatus('error');
      setSetupMessage(
        err instanceof AppwriteException ? err.message : 'Failed to setup database collections',
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DatabaseZap className="h-6 w-6" />
          Database Management
        </CardTitle>
        <CardDescription>Check your database health and setup required collections</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={checkDatabaseHealth}
            disabled={healthStatus === 'loading'}
            className="flex items-center gap-2"
            variant="outline"
          >
            {healthStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            Check Database Health
          </Button>

          <Button
            onClick={setupDatabaseCollections}
            disabled={setupStatus === 'loading'}
            className="flex items-center gap-2"
          >
            {setupStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DatabaseZap className="h-4 w-4" />
            )}
            Setup Database Collections
          </Button>
        </div>

        {/* Status messages */}
        <StatusMessage status={healthStatus} message={healthMessage} />
        <StatusMessage status={setupStatus} message={setupMessage} />
      </CardContent>
    </Card>
  );
};
