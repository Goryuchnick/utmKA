
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
import type { HistoryItem } from '@/types/history-item'; // Import shared type

const HISTORY_STORAGE_KEY = 'utmka_history';


export default function AdminHistoryPage() {
  const { toast } = useToast();
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  React.useEffect(() => {
    try {
      const storedHistoryString = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistoryString) {
        const parsedHistory: HistoryItem[] = JSON.parse(storedHistoryString);
        // Ensure dates are Date objects (or handle as strings if preferred)
        setHistory(parsedHistory.map(item => ({
          ...item,
          date: new Date(item.date) // Convert ISO string back to Date
        })));
      }
    } catch (error) {
      console.error("Error loading history from localStorage:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить историю.",
        variant: "destructive",
      });
    }
  }, [toast]); // Added toast to dependency array

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Скопировано!',
      description: 'Ссылка скопирована в буфер обмена.',
    });
  };

  const deleteLink = (id: string) => {
      try {
          const updatedHistory = history.filter(item => item.id !== id);
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory.map(item => ({...item, date: item.date.toISOString()})))); // Save back with ISO dates
          setHistory(updatedHistory);
          toast({
            title: 'Удалено!',
            description: 'Ссылка удалена из истории.',
            variant: 'destructive', // Use destructive variant for delete confirmation
          });
      } catch (error) {
           console.error("Error deleting history item from localStorage:", error);
           toast({
               title: "Ошибка",
               description: "Не удалось удалить ссылку из истории.",
               variant: "destructive",
           });
      }
  }

  return (
      <div className="space-y-4">
           {/* The h1 title is removed from here and handled in AppLayout */}
          {history.length === 0 ? (
              <p className="text-muted-foreground">История сгенерированных ссылок пуста.</p>
          ) : (
              history.map((item) => (
                  <Card key={item.id} className="shadow-sm rounded-lg bg-card"> {/* Use bg-card */}
                      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4 break-all">
                          <div className="flex-1">
                              <p className="text-secondary mb-2">{item.url}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                  {/* Non-clickable date display */}
                                  <span className="date-display rounded-md"> {/* Apply rounded-md */}
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

