
'use client';

import * as React from 'react';
import { PlusCircle, Edit, Trash2, List, LayoutGrid, Filter, FolderPlus, Folder, Calendar as CalendarIcon, TableIcon } from 'lucide-react'; // Added TableIcon
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'; // Date functions
import { ru } from 'date-fns/locale'; // Russian locale
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Table components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // Import Calendar
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Import cn utility
import type { Template, TemplateGroup } from '@/types/template'; // Import types
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile hook

// Mock data with added createdAt and group properties
const mockGroups: TemplateGroup[] = [
    { id: 'g1', name: 'Социальные сети' },
    { id: 'g2', name: 'Поисковики' },
    { id: 'g3', name: 'Email-маркетинг'},
];

const mockTemplates: Template[] = [
    { id: 't1', name: 'Google Ads - CPC', utm_source: 'google', utm_medium: 'cpc', createdAt: new Date(2024, 5, 10), groupId: 'g2' },
    { id: 't2', name: 'VK Target - CPM', utm_source: 'vk', utm_medium: 'cpm', createdAt: new Date(2024, 6, 15), groupId: 'g1' },
    { id: 't3', name: 'Email Promo', utm_medium: 'email', createdAt: new Date(2023, 11, 1), groupId: 'g3' }, // Example with only medium
    { id: 't4', name: 'Yandex Source', utm_source: 'yandex', createdAt: new Date(2024, 0, 20), groupId: 'g2' }, // Example with only source
    { id: 't5', name: 'Facebook Ads', utm_source: 'facebook', utm_medium: 'cpc', createdAt: new Date(2024, 7, 1), groupId: 'g1' },
];


const TEMPLATES_VIEW_MODE_STORAGE_KEY = 'utmka_templates_view_mode';

type ViewMode = 'list' | 'grid' | 'table'; // Added 'table' view mode
type FilterType = 'all' | 'source' | 'medium' | 'date' | 'group'; // Added 'group' filter type
type DateFilterRange = 'all' | 'this_month' | 'this_year' | 'custom';

export default function TemplatesPage() {
    const { toast } = useToast();
    const [templates, setTemplates] = React.useState<Template[]>(mockTemplates);
    const [groups, setGroups] = React.useState<TemplateGroup[]>(mockGroups);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = React.useState(false);
    const [isGroupDialogOpen, setIsGroupDialogOpen] = React.useState(false);
    const [currentTemplate, setCurrentTemplate] = React.useState<Partial<Template> | null>(null);
    const [currentGroup, setCurrentGroup] = React.useState<Partial<TemplateGroup> | null>(null); // State for new group name
    const [isEditing, setIsEditing] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<ViewMode>('grid'); // Default to grid view
    const [filterType, setFilterType] = React.useState<FilterType>('all');
    const [filterValue, setFilterValue] = React.useState<string>(''); // For source/medium text filter
    const [dateFilterRange, setDateFilterRange] = React.useState<DateFilterRange>('all');
    const [customDate, setCustomDate] = React.useState<Date | undefined>(undefined);
    const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
    const [selectedGroupFilter, setSelectedGroupFilter] = React.useState<string>('all'); // Group filter state

    const isMobile = useIsMobile(); // Get mobile state

    // Load view mode from localStorage on mount
    React.useEffect(() => {
        try {
            const storedViewMode = localStorage.getItem(TEMPLATES_VIEW_MODE_STORAGE_KEY) as ViewMode | null;
            if (storedViewMode && ['list', 'grid', 'table'].includes(storedViewMode)) {
                setViewMode(storedViewMode);
            }
        } catch (error) {
            console.error("Error loading view mode from localStorage:", error);
        }
    }, []);

    const handleSetViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        try {
            localStorage.setItem(TEMPLATES_VIEW_MODE_STORAGE_KEY, mode);
        } catch (error) {
            console.error("Error saving view mode to localStorage:", error);
        }
    };

    const openDialogForNewTemplate = () => {
        setCurrentTemplate({ name: '', utm_source: '', utm_medium: '', groupId: groups[0]?.id || '' }); // Pre-select first group if available
        setIsEditing(false);
        setIsTemplateDialogOpen(true);
    };

    const openDialogForEditTemplate = (template: Template) => {
        setCurrentTemplate({ ...template });
        setIsEditing(true);
        setIsTemplateDialogOpen(true);
    };

    const openDialogForNewGroup = () => {
        setCurrentGroup({ name: '' });
        setIsGroupDialogOpen(true);
    };

     const handleSaveTemplate = () => {
        if (!currentTemplate || !currentTemplate.name) {
             toast({ title: "Ошибка", description: "Название шаблона обязательно.", variant: "destructive" });
             return;
         }

        const templateToSave: Template = {
            id: currentTemplate.id || `t${Date.now()}`,
            name: currentTemplate.name,
            utm_source: currentTemplate.utm_source || undefined,
            utm_medium: currentTemplate.utm_medium || undefined,
            createdAt: currentTemplate.createdAt || new Date(), // Set creation date
            groupId: currentTemplate.groupId || undefined, // Assign group ID
        };

        if (isEditing && templateToSave.id) {
            // TODO: Implement update logic (API call)
            setTemplates(prev => prev.map(t => t.id === templateToSave.id ? templateToSave : t));
            toast({ title: "Успешно", description: "Шаблон обновлен." });
        } else {
            // TODO: Implement create logic (API call)
            setTemplates(prev => [...prev, templateToSave].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())); // Add and sort
            toast({ title: "Успешно", description: "Шаблон создан." });
        }
        setIsTemplateDialogOpen(false);
        setCurrentTemplate(null);
    };

     const handleSaveGroup = () => {
        if (!currentGroup || !currentGroup.name?.trim()) {
             toast({ title: "Ошибка", description: "Название группы обязательно.", variant: "destructive" });
             return;
         }
        const newGroup: TemplateGroup = {
            id: `g${Date.now()}`,
            name: currentGroup.name.trim(),
        };
         // TODO: Implement group create logic (API call)
        setGroups(prev => [...prev, newGroup]);
        toast({ title: "Успешно", description: "Группа создана." });
        setIsGroupDialogOpen(false);
        setCurrentGroup(null);
    };

    const handleDeleteTemplate = (id: string) => {
        // TODO: Implement delete logic (API call)
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast({ title: "Удалено", description: "Шаблон удален.", variant: "destructive"});
    };

     const handleDeleteGroup = (id: string) => {
        // TODO: Implement group delete logic (API call)
        // Optionally: Handle templates within the group (reassign/delete?)
        setGroups(prev => prev.filter(g => g.id !== id));
        // Remove group assignment from templates
        setTemplates(prev => prev.map(t => t.groupId === id ? { ...t, groupId: undefined } : t));
        toast({ title: "Удалено", description: "Группа удалена.", variant: "destructive"});
    };


    const handleTemplateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (currentTemplate) {
             const { name, value } = e.target;
             setCurrentTemplate(prev => ({ ...prev!, [name]: value }));
        }
    };

    const handleGroupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         if (currentGroup) {
             const { name, value } = e.target;
             setCurrentGroup(prev => ({ ...prev!, [name]: value }));
         }
    };

    const handleTemplateGroupChange = (groupId: string) => {
        if (currentTemplate) {
            setCurrentTemplate(prev => ({ ...prev!, groupId: groupId === 'none' ? undefined : groupId }));
        }
    };


    // Filtering Logic
    const filteredTemplates = React.useMemo(() => {
        let filtered = templates;

        // Filter by Group if the filter type is 'group'
        if (filterType === 'group' && selectedGroupFilter !== 'all') {
            filtered = filtered.filter(t => t.groupId === selectedGroupFilter || (selectedGroupFilter === 'none' && !t.groupId));
        }

        // Filter by Type (Source/Medium Text)
        if (filterType === 'source' && filterValue) {
            filtered = filtered.filter(t => t.utm_source?.toLowerCase().includes(filterValue.toLowerCase()));
        } else if (filterType === 'medium' && filterValue) {
            filtered = filtered.filter(t => t.utm_medium?.toLowerCase().includes(filterValue.toLowerCase()));
        }

        // Filter by Date
        if (filterType === 'date') {
            const now = new Date();
            if (dateFilterRange === 'this_month') {
                const start = startOfMonth(now);
                const end = endOfMonth(now);
                filtered = filtered.filter(t => t.createdAt >= start && t.createdAt <= end);
            } else if (dateFilterRange === 'this_year') {
                const start = startOfYear(now);
                const end = endOfYear(now);
                filtered = filtered.filter(t => t.createdAt >= start && t.createdAt <= end);
            } else if (dateFilterRange === 'custom' && customDate) {
                 // Filter by selected custom date (match the day)
                const start = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate());
                const end = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate() + 1);
                filtered = filtered.filter(t => t.createdAt >= start && t.createdAt < end);
            }
        }


        // Default sort by creation date (newest first)
        return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    }, [templates, filterType, filterValue, dateFilterRange, customDate, selectedGroupFilter]);


    const renderTemplateCard = (template: Template) => (
        <Card key={template.id} className="shadow-sm rounded-lg bg-card flex flex-col h-full"> {/* Added h-full for consistent height in grid */}
             {/* Display Group Name if it exists */}
            {template.groupId && (
                 <div className="text-xs text-muted-foreground px-4 pt-2 flex items-center">
                     <Folder size={12} className="mr-1" />
                     {groups.find(g => g.id === template.groupId)?.name || 'Без группы'}
                 </div>
             )}
            <CardHeader className={cn("pb-2", template.groupId ? "pt-1" : "")}> {/* Adjust padding if group name is shown */}
                <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
                 <span className="text-xs text-muted-foreground pt-1">
                    {format(template.createdAt, 'dd MMM yyyy', { locale: ru })}
                 </span>
            </CardHeader>
            <CardContent className="text-sm space-y-1 pb-2 flex-grow"> {/* Added flex-grow */}
                {template.utm_source && <p><strong>Источник:</strong> {template.utm_source}</p>}
                {template.utm_medium && <p><strong>Канал:</strong> {template.utm_medium}</p>}
                {!template.utm_source && !template.utm_medium && <p className="text-muted-foreground">Источник и канал не заданы</p>}
            </CardContent>
            <div className="flex justify-end gap-2 px-4 pb-4 pt-2 mt-auto"> {/* Added mt-auto */}
                <Button variant="outline" size="icon" onClick={() => openDialogForEditTemplate(template)} className="h-8 w-8 rounded-md shadow-sm hover:shadow">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Редактировать</span>
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteTemplate(template.id)} className="h-8 w-8 rounded-md shadow-sm hover:shadow">
                    <Trash2 className="h-4 w-4" />
                     <span className="sr-only">Удалить</span>
                </Button>
            </div>
        </Card>
    );

    const renderTemplateListItem = (template: Template) => (
        <Card key={template.id} className="shadow-sm rounded-lg bg-card">
            <CardContent className="p-4 flex items-center justify-between flex-wrap">
                <div className="flex-1 mr-4 mb-2 md:mb-0">
                    <p className="text-lg font-semibold">{template.name}</p>
                     {/* Display Group Name */}
                     {template.groupId && (
                         <div className="text-xs text-muted-foreground mt-1 flex items-center">
                              <Folder size={12} className="mr-1" />
                             {groups.find(g => g.id === template.groupId)?.name || 'Без группы'}
                         </div>
                     )}
                    <div className="text-sm space-x-4 mt-1">
                        {template.utm_source && <span><strong>Источник:</strong> {template.utm_source}</span>}
                        {template.utm_medium && <span><strong>Канал:</strong> {template.utm_medium}</span>}
                        {!template.utm_source && !template.utm_medium && <span className="text-muted-foreground italic">Нет параметров</span>}
                         <span className="text-xs text-muted-foreground ml-4">
                            {format(template.createdAt, 'dd MMM yyyy', { locale: ru })}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openDialogForEditTemplate(template)} className="h-8 w-8 rounded-md shadow-sm hover:shadow">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Редактировать</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteTemplate(template.id)} className="h-8 w-8 rounded-md shadow-sm hover:shadow">
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Удалить</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const renderTemplateTableRow = (template: Template) => (
        <TableRow key={template.id}>
            <TableCell className="font-medium">{template.name}</TableCell>
            <TableCell>{template.utm_source || '-'}</TableCell>
            <TableCell>{template.utm_medium || '-'}</TableCell>
            <TableCell>{groups.find(g => g.id === template.groupId)?.name || 'Без группы'}</TableCell>
            <TableCell>{format(template.createdAt, 'dd MMM yyyy', { locale: ru })}</TableCell>
            <TableCell className="text-right">
                 <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => openDialogForEditTemplate(template)} className="h-8 w-8 rounded-md shadow-sm hover:shadow">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Редактировать</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteTemplate(template.id)} className="h-8 w-8 rounded-md shadow-sm hover:shadow">
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Удалить</span>
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );


    return (
        <div className="space-y-6">
             {/* Top Controls: Add buttons, Filters, View Mode */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Add Buttons */}
                 <div className="flex gap-2">
                     <Button onClick={openDialogForNewTemplate} className="rounded-md shadow-sm hover:shadow transition-shadow">
                         <PlusCircle className="mr-2 h-4 w-4" /> Добавить шаблон
                     </Button>
                      <Button onClick={openDialogForNewGroup} variant="outline" className="rounded-md shadow-sm hover:shadow transition-shadow">
                         <FolderPlus className="mr-2 h-4 w-4" /> Новая группа
                     </Button>
                 </div>

                 {/* Filters & View Mode */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Filter Type Select */}
                    <Select value={filterType} onValueChange={(value) => {setFilterType(value as FilterType); setFilterValue(''); setDateFilterRange('all'); setCustomDate(undefined); setSelectedGroupFilter('all'); /* Reset other filters */ }}>
                        <SelectTrigger className="w-auto md:w-[150px] h-8 rounded-md shadow-sm text-xs">
                            <SelectValue placeholder="Фильтр по..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            <SelectItem value="all">Без фильтра</SelectItem>
                            <SelectItem value="source">Источник</SelectItem>
                            <SelectItem value="medium">Канал</SelectItem>
                            <SelectItem value="date">Дата</SelectItem>
                             <SelectItem value="group">Группа</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Conditional Filter Inputs */}
                    {(filterType === 'source' || filterType === 'medium') && (
                        <Input
                            type="text"
                            placeholder={`Поиск по ${filterType === 'source' ? 'источнику' : 'каналу'}...`}
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            className="h-8 rounded-md shadow-sm text-xs w-auto md:w-[180px]"
                        />
                    )}
                    {filterType === 'date' && (
                         <>
                         <Select value={dateFilterRange} onValueChange={(value) => { setDateFilterRange(value as DateFilterRange); if (value !== 'custom') setCustomDate(undefined); }}>
                            <SelectTrigger className="w-auto md:w-[150px] h-8 rounded-md shadow-sm text-xs">
                                <SelectValue placeholder="Диапазон дат..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="all">Все даты</SelectItem>
                                <SelectItem value="this_month">Этот месяц</SelectItem>
                                <SelectItem value="this_year">Этот год</SelectItem>
                                <SelectItem value="custom">Выбрать дату</SelectItem>
                            </SelectContent>
                        </Select>
                        {dateFilterRange === 'custom' && (
                             <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-auto md:w-[200px] h-8 justify-start text-left font-normal rounded-md shadow-sm text-xs",
                                            !customDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {customDate ? format(customDate, 'dd MMMM yyyy', {locale: ru}) : <span>Выберите дату</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-lg" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={customDate}
                                        onSelect={(date) => {setCustomDate(date); setIsDatePickerOpen(false);}}
                                        initialFocus
                                        locale={ru}
                                        className="rounded-lg"
                                    />
                                </PopoverContent>
                             </Popover>
                        )}
                        </>
                    )}
                    {filterType === 'group' && (
                         <Select value={selectedGroupFilter} onValueChange={setSelectedGroupFilter}>
                            <SelectTrigger className="w-auto md:w-[180px] h-8 rounded-md shadow-sm text-xs">
                                <SelectValue placeholder="Выберите группу..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="all">Все группы</SelectItem>
                                <SelectItem value="none">Без группы</SelectItem>
                                {groups.map(group => (
                                     <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}


                    {/* View Mode Switcher */}
                    <div className="flex gap-2 ml-auto">
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
                </div>
            </div>


            {filteredTemplates.length === 0 ? (
                <p className="text-muted-foreground text-center mt-4">
                    {templates.length === 0 ? "У вас пока нет сохраненных шаблонов." : "Шаблоны, соответствующие фильтру, не найдены."}
                </p>
            ) : (
                viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredTemplates.map(renderTemplateCard)}
                    </div>
                ) : viewMode === 'list' ? (
                    // List View
                    <div className="space-y-4">
                        {filteredTemplates.map(renderTemplateListItem)}
                    </div>
                ) : (
                   // Table View
                    <Card className="shadow-sm rounded-lg bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Название</TableHead>
                                    <TableHead>Источник</TableHead>
                                    <TableHead>Канал</TableHead>
                                    <TableHead>Группа</TableHead>
                                    <TableHead>Дата</TableHead>
                                    <TableHead className="text-right">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTemplates.map(renderTemplateTableRow)}
                            </TableBody>
                        </Table>
                    </Card>
                )
            )}

            {/* Dialog for Add/Edit Template */}
             <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                 <DialogContent className="sm:max-w-[600px] rounded-lg shadow-lg">
                      <DialogHeader>
                        <DialogTitle>{isEditing ? 'Редактировать шаблон' : 'Добавить новый шаблон'}</DialogTitle>
                        <DialogDescription>
                            Заполните поля для {isEditing ? 'обновления' : 'создания'} шаблона UTM-меток. Можно указать источник (utm_source) и/или канал (utm_medium).
                         </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                          {/* Template Name */}
                          <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="name" className="text-right col-span-1">
                                  Название*
                              </Label>
                              <Input
                                id="name"
                                name="name"
                                value={currentTemplate?.name || ''}
                                onChange={handleTemplateInputChange}
                                className="col-span-3 rounded-md shadow-sm"
                                required
                              />
                          </div>
                           {/* Template Group */}
                           <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="groupId" className="text-right col-span-1">
                                  Группа
                              </Label>
                              <Select
                                  value={currentTemplate?.groupId || 'none'}
                                  onValueChange={handleTemplateGroupChange}
                              >
                                  <SelectTrigger id="groupId" className="col-span-3 rounded-md shadow-sm">
                                      <SelectValue placeholder="Выберите группу..." />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-lg">
                                      <SelectItem value="none">Без группы</SelectItem>
                                      {groups.map(group => (
                                          <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                           </div>
                          {/* UTM Source */}
                          <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="utm_source" className="text-right col-span-1">
                                  Источник (Source)
                              </Label>
                              <Input id="utm_source" name="utm_source" value={currentTemplate?.utm_source || ''} onChange={handleTemplateInputChange} className="col-span-3 rounded-md shadow-sm" />
                          </div>
                          {/* UTM Medium */}
                          <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="utm_medium" className="text-right col-span-1">
                                  Канал (Medium)
                              </Label>
                              <Input id="utm_medium" name="utm_medium" value={currentTemplate?.utm_medium || ''} onChange={handleTemplateInputChange} className="col-span-3 rounded-md shadow-sm" />
                          </div>
                      </div>
                      <DialogFooter>
                           <DialogClose asChild>
                              <Button type="button" variant="outline" className="rounded-md shadow-sm">Отмена</Button>
                           </DialogClose>
                          <Button type="button" onClick={handleSaveTemplate} className="rounded-md shadow-md hover:shadow-lg">
                              {isEditing ? 'Сохранить изменения' : 'Создать шаблон'}
                          </Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>

            {/* Dialog for Add Group */}
             <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
                 <DialogContent className="sm:max-w-[450px] rounded-lg shadow-lg">
                      <DialogHeader>
                        <DialogTitle>Добавить новую группу</DialogTitle>
                        <DialogDescription>
                            Введите название для новой группы шаблонов.
                         </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="groupName" className="text-right col-span-1">
                                  Название*
                              </Label>
                              <Input
                                id="groupName"
                                name="name" // Matches state key
                                value={currentGroup?.name || ''}
                                onChange={handleGroupInputChange}
                                className="col-span-3 rounded-md shadow-sm"
                                required
                                autoFocus
                              />
                          </div>
                      </div>
                      <DialogFooter>
                           <DialogClose asChild>
                              <Button type="button" variant="outline" className="rounded-md shadow-sm">Отмена</Button>
                           </DialogClose>
                          <Button type="button" onClick={handleSaveGroup} className="rounded-md shadow-md hover:shadow-lg">
                              Создать группу
                          </Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
        </div>
    );
}
