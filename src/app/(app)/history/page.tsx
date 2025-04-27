
'use client';

import * as React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
} from "@/components/ui/alert-dialog";
import type { HistoryItem } from '@/types/history-item';

const HISTORY_STORAGE_KEY = 'utmka_history'; // Use the same key as generator

export default function PublicHistoryPage() {
  const { toast } = useToast();
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  React.useEffect(() => {
    try {
      const storedHistoryString = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistoryString) {
        const parsedHistory: HistoryItem[] = JSON.parse(storedHistoryString);
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
  }, [toast]);

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
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory.map(item => ({...item, date: item.date.toISOString()}))));
          setHistory(updatedHistory);
          toast({
            title: 'Удалено!',
            description: 'Ссылка удалена из истории.',
            variant: 'destructive',
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
          {/* Title is handled by AppLayout */}
          {history.length === 0 ? (
              <p className="text-muted-foreground">История сгенерированных ссылок пуста.</p>
          ) : (
              history.map((item) => (
                  <Card key={item.id} className="shadow-sm rounded-lg bg-card">
                      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4 break-all">
                          <div className="flex-1">
                              <p className="text-secondary mb-2">{item.url}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                  <span className="date-display rounded-md">
                                      {format(item.date, 'dd MMMM yyyy', { locale: ru })}
                                  </span>
                                  <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => copyToClipboard(item.url)}
                                      className="h-8 w-8 text-primary hover:text-primary/80 rounded-md shadow-sm hover:shadow transition-shadow"
                                      aria-label="Копировать ссылку"
                                  >
                                      <Copy className="h-4 w-4" />
                                  </Button>
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
                                              Это действие нельзя отменить. Ссылка будет навсегда удалена из вашей локальной истории.
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
