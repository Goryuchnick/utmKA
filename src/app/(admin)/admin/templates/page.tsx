
'use client';

import * as React from 'react';
import { PlusCircle, Edit, Trash2, List, LayoutGrid } from 'lucide-react'; // Added List and LayoutGrid icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Import cn utility

// Updated Template interface: Only name, source, and medium
interface Template {
    id: string;
    name: string;
    utm_source?: string;
    utm_medium?: string;
}

// Updated Mock data: Reflects the new interface
const mockTemplates: Template[] = [
    { id: 't1', name: 'Google Ads - CPC', utm_source: 'google', utm_medium: 'cpc' },
    { id: 't2', name: 'VK Target - CPM', utm_source: 'vk', utm_medium: 'cpm' },
    { id: 't3', name: 'Email Promo', utm_medium: 'email' }, // Example with only medium
    { id: 't4', name: 'Yandex Source', utm_source: 'yandex' }, // Example with only source
];

const TEMPLATES_VIEW_MODE_STORAGE_KEY = 'utmka_templates_view_mode';

type ViewMode = 'list' | 'grid';

export default function TemplatesPage() {
    const { toast } = useToast();
    const [templates, setTemplates] = React.useState<Template[]>(mockTemplates);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [currentTemplate, setCurrentTemplate] = React.useState<Partial<Template> | null>(null);
    const [isEditing, setIsEditing] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<ViewMode>('grid'); // Default to grid view

    // Load view mode from localStorage on mount
    React.useEffect(() => {
        try {
            const storedViewMode = localStorage.getItem(TEMPLATES_VIEW_MODE_STORAGE_KEY) as ViewMode | null;
            if (storedViewMode && (storedViewMode === 'list' || storedViewMode === 'grid')) {
                setViewMode(storedViewMode);
            }
        } catch (error) {
            console.error("Error loading view mode from localStorage:", error);
            // Handle error if needed, maybe default to grid
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

    const openDialogForNew = () => {
        setCurrentTemplate({ name: '', utm_source: '', utm_medium: '' });
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const openDialogForEdit = (template: Template) => {
        setCurrentTemplate({ ...template });
        setIsEditing(true);
        setIsDialogOpen(true);
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
        };

        if (isEditing && templateToSave.id) {
            // TODO: Implement update logic (API call)
            setTemplates(prev => prev.map(t => t.id === templateToSave.id ? templateToSave : t));
            toast({ title: "Успешно", description: "Шаблон обновлен." });
        } else {
            // TODO: Implement create logic (API call)
            setTemplates(prev => [...prev, templateToSave]);
            toast({ title: "Успешно", description: "Шаблон создан." });
        }
        setIsDialogOpen(false);
        setCurrentTemplate(null);
    };

    const handleDeleteTemplate = (id: string) => {
        // TODO: Implement delete logic (API call)
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast({ title: "Удалено", description: "Шаблон удален.", variant: "destructive"});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (currentTemplate) {
             const { name, value } = e.target;
             setCurrentTemplate(prev => ({ ...prev!, [name]: value }));
        }
    };

    const renderTemplateCard = (template: Template) => (
        <Card key={template.id} className="shadow-sm rounded-lg bg-card flex flex-col h-full"> {/* Added h-full for consistent height in grid */}
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 pb-2 flex-grow"> {/* Added flex-grow */}
                {template.utm_source && <p><strong>Источник:</strong> {template.utm_source}</p>}
                {template.utm_medium && <p><strong>Канал:</strong> {template.utm_medium}</p>}
                {!template.utm_source && !template.utm_medium && <p className="text-muted-foreground">Источник и канал не заданы</p>}
            </CardContent>
            <div className="flex justify-end gap-2 px-4 pb-4 pt-2 mt-auto"> {/* Added mt-auto */}
                <Button variant="outline" size="icon" onClick={() => openDialogForEdit(template)} className="h-8 w-8 rounded-md shadow-sm hover:shadow">
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
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 mr-4">
                    <p className="text-lg font-semibold">{template.name}</p>
                    <div className="text-sm space-x-4 mt-1">
                        {template.utm_source && <span><strong>Источник:</strong> {template.utm_source}</span>}
                        {template.utm_medium && <span><strong>Канал:</strong> {template.utm_medium}</span>}
                        {!template.utm_source && !template.utm_medium && <span className="text-muted-foreground italic">Нет параметров</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openDialogForEdit(template)} className="h-8 w-8 rounded-md shadow-sm hover:shadow">
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


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 {/* Add Template Button */}
                <Button onClick={openDialogForNew} className="rounded-md shadow-sm hover:shadow transition-shadow">
                    <PlusCircle className="mr-2 h-4 w-4" /> Добавить шаблон
                </Button>
                 {/* View Mode Switcher */}
                <div className="flex gap-2">
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
                </div>
            </div>

            {templates.length === 0 ? (
                <p className="text-muted-foreground">У вас пока нет сохраненных шаблонов.</p>
            ) : (
                viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map(renderTemplateCard)}
                    </div>
                ) : (
                    // List View
                    <div className="space-y-4">
                        {templates.map(renderTemplateListItem)}
                    </div>
                )
            )}

            {/* Dialog for Add/Edit Template */}
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                 {/* <DialogOverlay /> Use this if you want overlay */}
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
                                onChange={handleInputChange}
                                className="col-span-3 rounded-md shadow-sm"
                                required
                              />
                          </div>
                          {/* UTM Source */}
                          <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="utm_source" className="text-right col-span-1">
                                  Источник (Source)
                              </Label>
                              <Input id="utm_source" name="utm_source" value={currentTemplate?.utm_source || ''} onChange={handleInputChange} className="col-span-3 rounded-md shadow-sm" />
                          </div>
                          {/* UTM Medium */}
                          <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="utm_medium" className="text-right col-span-1">
                                  Канал (Medium)
                              </Label>
                              <Input id="utm_medium" name="utm_medium" value={currentTemplate?.utm_medium || ''} onChange={handleInputChange} className="col-span-3 rounded-md shadow-sm" />
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
        </div>
    );
}
