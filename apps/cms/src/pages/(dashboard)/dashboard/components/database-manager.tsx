import { useState } from 'react';
import { AppwriteException } from 'appwrite';
import { client } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseZap, Activity, Loader2 } from 'lucide-react';
import { StatusMessage } from './status-message';
import { CollectionSetupDialog } from './collection-setup-dialog';
import { DialogCustom } from '@/components/custom/dialog-custom';
import { useRequest } from 'ahooks';
import { collectionApi } from '@/services/database';
import { CollectionSchemaType } from '@/validators/collection-schema';

export const DatabaseManager = () => {
  const [healthStatus, setHealthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );
  const [setupStatus, setSetupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [healthMessage, setHealthMessage] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  const databaseDialog = DialogCustom.useDialog();
  // Fetch collections
  const { data: collections = [], refresh } = useRequest(collectionApi.getCollections, {
    onSuccess: (data) => {
      // If collections exist, we can assume setup was successful
      if (data && data.length > 0) {
        setSetupStatus('success');
      }
    },
  });

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
  } // Handler for collection setup success
  const handleCollectionSetupSuccess = (newCollections: CollectionSchemaType[]) => {
    setSetupStatus('success');
    // We don't rely on ID comparison here since we're not sure about the ID structure
    setSetupMessage('Database collections successfully updated!');
    refresh(); // Refresh collections data
    databaseDialog.close();
  };

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
          </Button>{' '}
          <Button
            onClick={() => databaseDialog.open()}
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
        </div>{' '}
        {/* Status messages */}
        <StatusMessage status={healthStatus} message={healthMessage} />
        <StatusMessage status={setupStatus} message={setupMessage} />
        {/* Collection Setup Dialog */}
        <CollectionSetupDialog
          dialog={databaseDialog}
          collections={collections}
          loadingCollections={!collections && refresh !== undefined}
          onSuccess={handleCollectionSetupSuccess}
        />
      </CardContent>
    </Card>
  );
};
