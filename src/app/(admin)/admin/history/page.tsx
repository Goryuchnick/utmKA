
'use client';

import * as React from 'react';
import { Copy, Trash2 } from 'lucide-react'; // Added Trash2 icon for delete
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // Removed Header and Title as they are in the layout now
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


// Mock data for demonstration. Replace with actual data fetching based on logged-in user.
const mockHistory = [
  { id: '1', url: 'https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale_july_2024', date: new Date(2024, 6, 15) },
  { id: '2', url: 'https://example.com/?utm_source=yandex&utm_medium=cpm&utm_campaign=new_collection_august_2024', date: new Date(2024, 7, 1) },
  { id: '3', url: 'https://example.com/?utm_source=alpinabook&utm_medium=email&utm_campaign=promo_september_2024', date: new Date(2024, 8, 10) },
];

// Interface for history items
interface HistoryItem {
    id: string;
    url: string;
    date: Date;
}

export default function AdminHistoryPage() {
  const { toast } = useToast();
  // TODO: Replace mockHistory with state management and data fetching for the logged-in user
  const [history, setHistory] = React.useState<HistoryItem[]>(mockHistory);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Скопировано!',
      description: 'Ссылка скопирована в буфер обмена.',
    });
  };

  const deleteLink = (id: string) => {
      // TODO: Implement actual delete logic (API call, update state)
      console.log(`Deleting link with id: ${id}`);
      setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
      toast({
        title: 'Удалено!',
        description: 'Ссылка удалена из истории.',
        variant: 'destructive', // Use destructive variant for delete confirmation
      });
  }

  return (
      <div className="space-y-4">
          {history.length === 0 ? (
              <p className="text-muted-foreground">История сгенерированных ссылок пуста.</p>
          ) : (
              history.map((item) => (
                  <Card key={item.id} className="shadow-sm rounded-lg">
                      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4 break-all">
                          <div className="flex-1">
                              <p className="text-secondary mb-2">{item.url}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                  {/* Non-clickable date display */}
                                  <span className="date-display">
                                      {format(item.date, 'dd MMMM yyyy', { locale: ru })}
                                  </span>
                                  {/* Copy Button */}
                                  <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => copyToClipboard(item.url)}
                                      className="h-8 w-8 text-primary hover:text-primary/80 rounded-md shadow-sm hover:shadow transition-shadow"
                                      aria-label="Копировать ссылку"
                                  >
                                      <Copy className="h-4 w-4" />
                                  </Button>
                                   {/* Delete Button with Confirmation Dialog */}
                                   <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                          <Button
                                              variant="destructive"
                                              size="icon"
                                              className="h-8 w-8 rounded-md shadow-sm hover:shadow transition-shadow"
                                              aria-label="Удалить ссылку"
                                          >
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                          <AlertDialogHeader>
                                          <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              Это действие нельзя отменить. Ссылка будет навсегда удалена из вашей истории.
                                          </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => deleteLink(item.id)}>
                                              Удалить
                                          </AlertDialogAction>
                                          </AlertDialogFooter>
                                      </AlertDialogContent>
                                  </AlertDialog>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              ))
          )}
      </div>
  );
}
