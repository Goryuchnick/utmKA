'use client';

import * as React from 'react';
import { Copy } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration. Replace with actual data fetching.
const mockHistory = [
  { id: '1', url: 'https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale_july_2024', date: new Date(2024, 6, 15) },
  { id: '2', url: 'https://example.com/?utm_source=yandex&utm_medium=cpm&utm_campaign=new_collection_august_2024', date: new Date(2024, 7, 1) },
  { id: '3', url: 'https://example.com/?utm_source=alpinabook&utm_medium=email&utm_campaign=promo_september_2024', date: new Date(2024, 8, 10) },
];

export default function HistoryPage() {
  const { toast } = useToast();
  // TODO: Replace mockHistory with state management and data fetching
  const [history, setHistory] = React.useState(mockHistory);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Скопировано!',
      description: 'Ссылка скопирована в буфер обмена.',
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">История ссылок</h1>
      {history.length === 0 ? (
        <p className="text-muted-foreground">История сгенерированных ссылок пуста.</p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="shadow-sm">
              <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4 break-all">
                <div className="flex-1">
                  <p className="text-secondary mb-2">{item.url}</p>
                  <div className="flex items-center gap-2">
                     <span className="date-display">
                        {format(item.date, 'dd MMMM yyyy', { locale: ru })}
                     </span>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(item.url)} className="h-8 w-8 text-primary hover:text-primary/80">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Копировать ссылку</span>
                      </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
