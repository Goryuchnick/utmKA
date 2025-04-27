
'use client';

import * as React from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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


export default function TemplatesPage() {
    const { toast } = useToast();
    const [templates, setTemplates] = React.useState<Template[]>(mockTemplates);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    // Use Partial<Template> to allow for partially filled state during creation/edit
    const [currentTemplate, setCurrentTemplate] = React.useState<Partial<Template> | null>(null);
    const [isEditing, setIsEditing] = React.useState(false);

    const openDialogForNew = () => {
        setCurrentTemplate({ name: '', utm_source: '', utm_medium: '' }); // Start with empty fields for new template
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const openDialogForEdit = (template: Template) => {
        setCurrentTemplate({ ...template }); // Copy template data
        setIsEditing(true);
        setIsDialogOpen(true);
    };

     const handleSaveTemplate = () => {
        if (!currentTemplate || !currentTemplate.name) {
             toast({ title: "Ошибка", description: "Название шаблона обязательно.", variant: "destructive" });
             return;
         }

        // Ensure currentTemplate conforms to Template structure before saving
        const templateToSave: Template = {
            id: currentTemplate.id || `t${Date.now()}`, // Generate ID if new
            name: currentTemplate.name,
            utm_source: currentTemplate.utm_source || undefined, // Set to undefined if empty
            utm_medium: currentTemplate.utm_medium || undefined, // Set to undefined if empty
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
        setCurrentTemplate(null); // Reset current template
    };

    const handleDeleteTemplate = (id: string) => {
        // TODO: Implement delete logic (API call)
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast({ title: "Удалено", description: "Шаблон удален.", variant: "destructive"});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (currentTemplate) {
             const { name, value } = e.target;
             // Use type assertion here as we know currentTemplate is not null
             setCurrentTemplate(prev => ({ ...prev!, [name]: value }));
        }
    };

    return (
        <div className="space-y-6">
             {/* The h1 title is removed from here and handled in AppLayout */}
            <div className="flex justify-end">
                <Button onClick={openDialogForNew} className="rounded-md shadow-sm hover:shadow transition-shadow">
                    <PlusCircle className="mr-2 h-4 w-4" /> Добавить шаблон
                </Button>
            </div>

            {templates.length === 0 ? (
                <p className="text-muted-foreground">У вас пока нет сохраненных шаблонов.</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <Card key={template.id} className="shadow-sm rounded-lg bg-card">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                {/* Display only source and medium */}
                                {template.utm_source && <p><strong>Источник:</strong> {template.utm_source}</p>}
                                {template.utm_medium && <p><strong>Канал:</strong> {template.utm_medium}</p>}
                                {/* Show a message if neither is set */}
                                {!template.utm_source && !template.utm_medium && <p className="text-muted-foreground">Источник и канал не заданы</p>}
                            </CardContent>
                            <div className="flex justify-end gap-2 p-4 border-t border-border">
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
                    ))}
                </div>
            )}

            {/* Dialog for Add/Edit Template */}
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                                name="name" // Ensure name attribute matches state key
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
                         {/* Removed Campaign, Term, Content fields */}
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
