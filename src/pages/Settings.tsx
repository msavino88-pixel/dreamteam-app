import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { Database, Wifi, WifiOff } from 'lucide-react';

export default function Settings() {
  const connected = isSupabaseConfigured();

  return (
    <div>
      <Header title="Impostazioni" />
      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connessione Supabase
            </CardTitle>
            <CardDescription>
              Configura la connessione al database per sincronizzazione real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {connected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Connesso</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600 font-medium">
                    Modalità offline — dati demo
                  </span>
                </>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Supabase URL</label>
              <Input placeholder="https://xxx.supabase.co" disabled={connected} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Anon Key</label>
              <Input placeholder="eyJ..." type="password" disabled={connected} />
            </div>

            <p className="text-xs text-muted-foreground">
              Per collegare Supabase, aggiungi le variabili VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nel file .env
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informazioni App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Versione:</strong> 1.0.0</p>
            <p><strong>Stack:</strong> React + Vite + Tailwind + Supabase</p>
            <p><strong>Compatibile:</strong> Lovable.dev</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
