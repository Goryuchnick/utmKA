
'use client';

import * as React from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration. Replace with actual data fetching/saving.
interface Template {
    id: string;
    name: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string; // Keep campaign simple for now
    utm_term?: string;
    utm_content?: string;
}

const mockTemplates: Template[] = [
    { id: 't1', name: 'Google Ads - Summer Sale', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'summer_sale' },
    { id: 't2', name: 'VK Target - New Collection', utm_source: 'vk', utm_medium: 'cpm', utm_campaign: 'new_collection' },
];


export default function TemplatesPage() {
    const { toast } = useToast();
    const [templates, setTemplates] = React.useState<Template[]>(mockTemplates);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [currentTemplate, setCurrentTemplate] = React.useState<Partial<Template> | null>(null);
    const [isEditing, setIsEditing] = React.useState(false);

    const openDialogForNew = () => {
        setCurrentTemplate({ name: '' }); // Start with empty name for new template
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

        if (isEditing && currentTemplate.id) {
            // TODO: Implement update logic (API call)
            setTemplates(prev => prev.map(t => t.id === currentTemplate.id ? currentTemplate as Template : t));
            toast({ title: "Успешно", description: "Шаблон обновлен." });
        } else {
            // TODO: Implement create logic (API call)
            const newTemplate: Template = {
                id: `t${Date.now()}`, // Simple unique ID generation
                ...currentTemplate,
                name: currentTemplate.name, // Ensure name is present
            };
            setTemplates(prev => [...prev, newTemplate]);
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
             setCurrentTemplate(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div className="space-y-6">
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
                        <Card key={template.id} className="shadow-sm rounded-lg">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
                                {/* <CardDescription>Краткое описание шаблона</CardDescription> */}
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                {template.utm_source && <p><strong>Источник:</strong> {template.utm_source}</p>}
                                {template.utm_medium && <p><strong>Канал:</strong> {template.utm_medium}</p>}
                                {template.utm_campaign && <p><strong>Кампания:</strong> {template.utm_campaign}</p>}
                                {template.utm_term && <p><strong>Ключ. слово:</strong> {template.utm_term}</p>}
                                {template.utm_content && <p><strong>Содержание:</strong> {template.utm_content}</p>}
                            </CardContent>
                            <div className="flex justify-end gap-2 p-4 border-t">
                                <Button variant="outline" size="icon" onClick={() => openDialogForEdit(template)} className="h-8 w-8 rounded-md shadow-sm hover:shadow">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Редактировать</span>
                                </Button>
                                 {/* Add Delete Confirmation later if needed */}
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
                            Заполните поля для {isEditing ? 'обновления' : 'создания'} шаблона UTM-меток.
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
                         {/* UTM Fields */}
                         <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="utm_source" className="text-right col-span-1">
                                 Источник
                             </Label>
                             <Input id="utm_source" name="utm_source" value={currentTemplate?.utm_source || ''} onChange={handleInputChange} className="col-span-3 rounded-md shadow-sm" />
                         </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="utm_medium" className="text-right col-span-1">
                                 Канал
                             </Label>
                             <Input id="utm_medium" name="utm_medium" value={currentTemplate?.utm_medium || ''} onChange={handleInputChange} className="col-span-3 rounded-md shadow-sm" />
                         </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="utm_campaign" className="text-right col-span-1">
                                 Кампания
                             </Label>
                             <Input id="utm_campaign" name="utm_campaign" value={currentTemplate?.utm_campaign || ''} onChange={handleInputChange} className="col-span-3 rounded-md shadow-sm" />
                         </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="utm_term" className="text-right col-span-1">
                                 Ключ. слово
                             </Label>
                             <Input id="utm_term" name="utm_term" value={currentTemplate?.utm_term || ''} onChange={handleInputChange} className="col-span-3 rounded-md shadow-sm" />
                         </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                             <Label htmlFor="utm_content" className="text-right col-span-1">
                                 Содержание
                             </Label>
                             <Input id="utm_content" name="utm_content" value={currentTemplate?.utm_content || ''} onChange={handleInputChange} className="col-span-3 rounded-md shadow-sm" />
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
