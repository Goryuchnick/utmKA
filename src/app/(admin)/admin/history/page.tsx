
'use client';

import * as React from 'react';
import { Copy, Trash2, List, LayoutGrid, ArrowDownZA, ArrowUpAZ, TableIcon } from 'lucide-react'; // Added TableIcon
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
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Table components
import type { HistoryItem } from '@/types/history-item';
import { cn } from '@/lib/utils'; // Import cn utility

const HISTORY_STORAGE_KEY = 'utmka_history';
const VIEW_MODE_STORAGE_KEY = 'utmka_history_view_mode';
const SORT_ORDER_STORAGE_KEY = 'utmka_history_sort_order'; // Key for sorting

type ViewMode = 'list' | 'grid' | 'table'; // Added 'table'
type SortOrder = 'newest' | 'oldest'; // Define sort order types

export default function AdminHistoryPage() {
  const { toast } = useToast();
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list'); // Default to list view
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('newest'); // Default to newest first

  // Load history, view mode, and sort order from localStorage on mount
  React.useEffect(() => {
    try {
      const storedHistoryString = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistoryString) {
        const parsedHistory: HistoryItem[] = JSON.parse(storedHistoryString);
        setHistory(parsedHistory.map(item => ({
          ...item,
          // Ensure date is a Date object, parsing if necessary
          date: typeof item.date === 'string' ? new Date(item.date) : item.date
        })));
      }

      const storedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY) as ViewMode | null;
      // Check if the stored view mode is valid
      if (storedViewMode && ['list', 'grid', 'table'].includes(storedViewMode)) {
        setViewMode(storedViewMode);
      }

      const storedSortOrder = localStorage.getItem(SORT_ORDER_STORAGE_KEY) as SortOrder | null;
      if (storedSortOrder && (storedSortOrder === 'newest' || storedSortOrder === 'oldest')) {
          setSortOrder(storedSortOrder);
      }

    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные.",
        variant: "destructive",
      });
    }
  }, [toast]);

   // Function to handle setting and saving sort order
   const handleSetSortOrder = (order: SortOrder) => {
       setSortOrder(order);
       try {
           localStorage.setItem(SORT_ORDER_STORAGE_KEY, order);
       } catch (error) {
           console.error("Error saving sort order to localStorage:", error);
       }
   };

   // Sort history based on the current sortOrder state
   const sortedHistory = React.useMemo(() => {
       return [...history].sort((a, b) => {
           const dateA = typeof a.date === 'string' ? new Date(a.date).getTime() : a.date.getTime();
           const dateB = typeof b.date === 'string' ? new Date(b.date).getTime() : b.date.getTime();
           if (sortOrder === 'newest') {
               return dateB - dateA; // Newest first
           } else {
               return dateA - dateB; // Oldest first
           }
       });
   }, [history, sortOrder]);


  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.error("Error saving view mode to localStorage:", error);
    }
  };

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
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory.map(item => ({
              ...item,
              // Ensure date is stored as ISO string consistently
              date: item.date instanceof Date ? item.date.toISOString() : new Date(item.date).toISOString()
          }))));
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

  const renderActions = (item: HistoryItem) => (
     <div className="flex items-center gap-2 justify-end">
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
  );

  const renderHistoryListItem = (item: HistoryItem) => (
    <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 break-all">
        <div className="flex-1">
            <p className="text-secondary mb-2">{item.url}</p>
            <div className="flex items-center gap-2 flex-wrap">
                <span className="date-display rounded-md">
                     {format(item.date instanceof Date ? item.date : new Date(item.date), 'dd MMMM yyyy HH:mm', { locale: ru })} {/* Show time */}
                </span>
                {renderActions(item)} {/* Render actions */}
            </div>
        </div>
    </div>
  );

  const renderHistoryGridItem = (item: HistoryItem) => (
      <Card key={item.id} className="shadow-sm rounded-lg bg-card flex flex-col"> {/* Ensure card is flex col for grid */}
          <CardContent className="p-4 flex-grow"> {/* Use flex-grow */}
              {/* Slightly modified rendering for grid card content */}
              <p className="text-secondary mb-2 break-all">{item.url}</p>
              <div className="flex items-center gap-2 flex-wrap">
                  <span className="date-display rounded-md">
                      {/* Use date directly, ensure it's a Date object */}
                      {format(item.date instanceof Date ? item.date : new Date(item.date), 'dd MMM yy HH:mm', { locale: ru })} {/* Shorter date format with time */}
                  </span>
              </div>
          </CardContent>
          {/* Actions at the bottom */}
          <div className="flex justify-end gap-2 px-4 pb-4 pt-2 mt-auto">
              {renderActions(item)} {/* Render actions */}
          </div>
      </Card>
  );

  const renderHistoryTableRow = (item: HistoryItem) => (
      <TableRow key={item.id}>
          <TableCell className="font-medium break-all max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl truncate">{item.url}</TableCell> {/* Allow breaking and truncate */}
          <TableCell className="whitespace-nowrap">
              {format(item.date instanceof Date ? item.date : new Date(item.date), 'dd MMM yy HH:mm', { locale: ru })}
          </TableCell>
          <TableCell className="text-right">
              {renderActions(item)}
          </TableCell>
      </TableRow>
  );


  return (
      <div className="space-y-4">
           {/* Controls: View Mode Switcher & Sorter */}
          <div className="flex flex-wrap justify-end gap-2 mb-4">
               {/* Sorter */}
                <Button
                   variant={sortOrder === 'newest' ? 'secondary' : 'outline'}
                   onClick={() => handleSetSortOrder('newest')}
                   className="h-8 rounded-md shadow-sm hover:shadow"
                   aria-label="Сортировать: Сначала новые"
               >
                   <ArrowDownZA className="h-4 w-4 mr-1" /> Новые
               </Button>
               <Button
                   variant={sortOrder === 'oldest' ? 'secondary' : 'outline'}
                   onClick={() => handleSetSortOrder('oldest')}
                   className="h-8 rounded-md shadow-sm hover:shadow"
                   aria-label="Сортировать: Сначала старые"
               >
                   <ArrowUpAZ className="h-4 w-4 mr-1" /> Старые
               </Button>

               {/* View Mode Switcher */}
              <Button
                  variant={viewMode === 'list' ? 'secondary' : 'outline'}
                  size="icon"
                  onClick={() => handleSetViewMode('list')}
                  className="h-8 w-8 rounded-md shadow-sm hover:shadow"
                  aria-label="List view"
              >
                  <List className="h-4 w-4" />
              </Button>
              <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'outline'}
                  size="icon"
                  onClick={() => handleSetViewMode('grid')}
                  className="h-8 w-8 rounded-md shadow-sm hover:shadow"
                  aria-label="Grid view"
              >
                  <LayoutGrid className="h-4 w-4" />
              </Button>
               <Button
                    variant={viewMode === 'table' ? 'secondary' : 'outline'}
                    size="icon"
                    onClick={() => handleSetViewMode('table')}
                    className="h-8 w-8 rounded-md shadow-sm hover:shadow"
                    aria-label="Table view"
                >
                    <TableIcon className="h-4 w-4" /> {/* Added Table View Button */}
               </Button>
          </div>

          {history.length === 0 ? (
              <p className="text-muted-foreground">История сгенерированных ссылок пуста.</p>
          ) : (
              <>
                   {viewMode === 'list' && (
                      // List View
                      <div className="space-y-4">
                          {sortedHistory.map((item) => (
                              <Card key={item.id} className="shadow-sm rounded-lg bg-card">
                                  <CardContent className="p-4">
                                      {renderHistoryListItem(item)}
                                  </CardContent>
                              </Card>
                          ))}
                      </div>
                  )}
                  {viewMode === 'grid' && (
                      // Grid View
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {sortedHistory.map(renderHistoryGridItem)}
                      </div>
                  )}
                  {viewMode === 'table' && (
                      // Table View
                      <Card className="shadow-sm rounded-lg bg-card overflow-hidden">
                          {/* Wrapper div for horizontal scrolling on mobile */}
                          <div className="w-full overflow-x-auto">
                              <Table className="min-w-max"> {/* Ensure table takes minimum width needed */}
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead>Сгенерированная ссылка</TableHead>
                                          <TableHead>Дата генерации</TableHead>
                                          <TableHead className="text-right">Действия</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {sortedHistory.map(renderHistoryTableRow)}
                                  </TableBody>
                              </Table>
                          </div>
                      </Card>
                   )}
              </>
          )}
      </div>
  );
}
