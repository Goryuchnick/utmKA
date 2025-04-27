
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, Copy, BookMarked } from 'lucide-react'; // Added BookMarked icon
import Link from 'next/link'; // Import Link

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { translateMonth } from '@/services/date-formatter';
import { MonthPicker } from '@/components/ui/month-picker';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import type { HistoryItem } from '@/types/history-item'; // Import shared type
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile hook


// Updated form schema: only baseUrl and utm_source are required
const formSchema = z.object({
  baseUrl: z.string().url({ message: 'Пожалуйста, введите действительный URL.' }),
  utm_source_custom: z.string().optional(),
  utm_source_preset: z.string().optional(),
  utm_medium_custom: z.string().optional(),
  utm_medium_preset: z.string().optional(),
  utm_campaign_name: z.string().optional(),
  utm_campaign_date: z.date().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  template_select: z.string().optional(), // Added dummy field for template selector control
}).refine(data => !!data.utm_source_custom || !!data.utm_source_preset, { // Ensure at least one source is provided
    message: "Источник (utm_source) должен быть указан.",
    path: ["utm_source_custom"], // Path for the primary source field where the error appears
});


type FormData = z.infer<typeof formSchema>;

// Interface for Templates (assuming structure from templates page)
interface Template {
    id: string;
    name: string;
    utm_source?: string;
    utm_medium?: string;
}

// Mock templates for demonstration - In a real app, fetch these based on the user
const mockTemplates: Template[] = [
    { id: 't1', name: 'Google Ads - CPC', utm_source: 'google', utm_medium: 'cpc' },
    { id: 't2', name: 'VK Target - CPM', utm_source: 'vk', utm_medium: 'cpm' },
    { id: 't3', name: 'Email Promo', utm_medium: 'email' }, // Example with only medium
    { id: 't4', name: 'Yandex Source', utm_source: 'yandex' }, // Example with only source
];


const predefinedSources = [
  { label: 'Имаг', value: 'alpinabook' },
  { label: 'Яндекс', value: 'yandex' },
  { label: 'Google', value: 'google' },
  { label: 'VK', value: 'vk' },
];

const predefinedMediums = [
  { label: 'CPC', value: 'cpc' },
  { label: 'CPM', value: 'cpm' },
  { label: 'Email', value: 'email' },
  { label: 'Social', value: 'social' },
];

const HISTORY_STORAGE_KEY = 'utmka_history';

export default function GeneratorPage() {
  const { toast } = useToast();
  const [generatedUrl, setGeneratedUrl] = React.useState<string>('');
  const [isDatePopoverOpen, setIsDatePopoverOpen] = React.useState(false); // State to control date picker popover
  const { isAuthenticated, isLoading } = useAuth(); // Get auth state
  const [templates, setTemplates] = React.useState<Template[]>([]); // State to hold templates
  const isMobile = useIsMobile(); // Get mobile state

  // TODO: Replace mock data fetching with actual API call based on user ID
  React.useEffect(() => {
      if (isAuthenticated) {
          // Simulate fetching user's templates
          setTemplates(mockTemplates);
      } else {
          setTemplates([]); // Clear templates if user logs out
      }
  }, [isAuthenticated]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger, // Add trigger for manual validation
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseUrl: '', // Start with empty base URL
      utm_source_custom: '',
      utm_source_preset: '',
      utm_medium_custom: '',
      utm_medium_preset: '',
      utm_campaign_name: '',
      utm_term: '',
      utm_content: '',
      template_select: '__placeholder__', // Initialize template select dummy field
    },
  });

 const onSubmit = async (data: FormData) => {
    // Manually trigger validation for all fields before processing
    const isValid = await trigger();
    if (!isValid) {
        // Optionally show a generic error toast or rely on individual field errors
        toast({
            title: "Ошибка валидации",
            description: "Пожалуйста, исправьте ошибки в форме.",
            variant: "destructive",
        });
        return; // Stop submission if validation fails
    }

    let url: URL;
    try {
      // Prepend https:// if no protocol is provided
      let baseUrl = data.baseUrl;
      if (!baseUrl.match(/^https?:\/\//)) {
          baseUrl = `https://${baseUrl}`;
      }
      url = new URL(baseUrl);
    } catch (e) {
        toast({
            title: "Неверный URL",
            description: "Пожалуйста, введите корректный URL сайта.",
            variant: "destructive",
        });
        return;
    }

    const params = new URLSearchParams();

    const utmSource = data.utm_source_custom || data.utm_source_preset;
    const utmMedium = data.utm_medium_custom || data.utm_medium_preset;

    // Only add utm_source if it has a value (it's required by schema refinement)
    if (utmSource) params.set('utm_source', utmSource.trim());

    // Add other optional params only if they have values
    if (utmMedium) params.set('utm_medium', utmMedium.trim());

    // Updated UTM Campaign Logic
    let campaignValue = '';
    const campaignName = data.utm_campaign_name?.trim(); // Trim whitespace
    const campaignDate = data.utm_campaign_date;

    if (campaignDate) {
        const monthRussian = format(campaignDate, 'LLLL', { locale: ru });
        const monthEnglish = translateMonth(monthRussian.toLowerCase());
        const year = format(campaignDate, 'yyyy');
        const datePart = `${monthEnglish}_${year}`;

        if (campaignName) {
            // Both name and date provided
            campaignValue = `${campaignName}_${datePart}`;
        } else {
            // Only date provided
            campaignValue = datePart; // Use only the date part as the value
        }
    } else if (campaignName) {
        // Only name provided
        campaignValue = campaignName;
    }

    if (campaignValue) params.set('utm_campaign', campaignValue);


    if (data.utm_term) params.set('utm_term', data.utm_term.trim());
    if (data.utm_content) params.set('utm_content', data.utm_content.trim());

    if (params.toString()) {
        url.search = params.toString();
    } else {
        url.search = ''; // Ensure no trailing '?' if no params
    }

    const finalUrl = url.toString();
    setGeneratedUrl(finalUrl);

    // Save the generated URL to history (for both logged in and guest users)
    try {
        const currentHistoryString = localStorage.getItem(HISTORY_STORAGE_KEY);
        // Parse history, keeping dates as strings initially
        const currentHistory: HistoryItem[] = currentHistoryString ? JSON.parse(currentHistoryString) : [];

        const newHistoryItem: HistoryItem = {
            id: Date.now().toString(), // Simple unique ID
            url: finalUrl,
            date: new Date().toISOString(), // Store new date as ISO string
        };

        // Add new item (with ISO string date) and existing history (with string dates)
        const updatedHistory = [newHistoryItem, ...currentHistory]; // Add to the beginning

        // Save the updated history directly (all dates are strings now)
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

        // If authenticated, you might also sync this with a backend database here
        // if (isAuthenticated) {
        //     // TODO: Add API call to save history to backend
        //     console.log('Saving to backend history for logged-in user:', finalUrl);
        // }

    } catch (error) {
         console.error("Error saving history to localStorage:", error);
         toast({
             title: "Ошибка",
             description: "Не удалось сохранить ссылку в историю.",
             variant: "destructive",
         });
    }
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast({
        title: 'Скопировано!',
        description: 'Ссылка скопирована в буфер обмена.',
      });
    }
  };

  // Function to load template data into the form
  const handleTemplateSelect = (templateId: string) => {
      if (!templateId || templateId === '__placeholder__') return; // Do nothing if placeholder is selected

      const selectedTemplate = templates.find(t => t.id === templateId);
      if (selectedTemplate) {
          // Update source field
          if (selectedTemplate.utm_source) {
              setValue('utm_source_custom', selectedTemplate.utm_source, { shouldValidate: true });
              // Check if the template source exists in predefined values to update the select
              const sourcePresetExists = predefinedSources.some(p => p.value === selectedTemplate.utm_source);
              setValue('utm_source_preset', sourcePresetExists ? selectedTemplate.utm_source : '__placeholder__'); // Use placeholder if not found
          } else {
              setValue('utm_source_custom', '', { shouldValidate: true });
              setValue('utm_source_preset', '__placeholder__');
          }

          // Update medium field
          if (selectedTemplate.utm_medium) {
              setValue('utm_medium_custom', selectedTemplate.utm_medium, { shouldValidate: true });
               // Check if the template medium exists in predefined values to update the select
              const mediumPresetExists = predefinedMediums.some(p => p.value === selectedTemplate.utm_medium);
              setValue('utm_medium_preset', mediumPresetExists ? selectedTemplate.utm_medium : '__placeholder__'); // Use placeholder if not found
          } else {
              setValue('utm_medium_custom', '', { shouldValidate: true });
              setValue('utm_medium_preset', '__placeholder__');
          }

          toast({
              title: 'Шаблон загружен',
              description: `Данные из шаблона "${selectedTemplate.name}" применены.`,
          });
      }
  };


  // Watch changes in preset fields to update custom fields
   React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            // Handle source sync
            if (name === 'utm_source_preset' && value.utm_source_preset && value.utm_source_preset !== '__placeholder__') {
                setValue('utm_source_custom', value.utm_source_preset, { shouldValidate: true }); // Set and validate
            } else if (name === 'utm_source_custom' && value.utm_source_custom !== watch('utm_source_preset')) {
                 // Check if the custom value matches any predefined value
                const presetValue = predefinedSources.find(p => p.value === value.utm_source_custom)?.value || '';
                setValue('utm_source_preset', presetValue || '__placeholder__'); // Update select or set to placeholder
                trigger('utm_source_custom'); // Validate custom field
            }

            // Handle medium sync
            if (name === 'utm_medium_preset' && value.utm_medium_preset && value.utm_medium_preset !== '__placeholder__') {
                setValue('utm_medium_custom', value.utm_medium_preset, { shouldValidate: true }); // Set and validate
            } else if (name === 'utm_medium_custom' && value.utm_medium_custom !== watch('utm_medium_preset')) {
                 // Check if the custom value matches any predefined value
                const presetValue = predefinedMediums.find(p => p.value === value.utm_medium_custom)?.value || '';
                setValue('utm_medium_preset', presetValue || '__placeholder__'); // Update select or set to placeholder
                 trigger('utm_medium_custom'); // Validate if needed
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue, trigger]);

    // Handler to close popover after selecting a date in MonthPicker
    const handleDateSelect = (date: Date | undefined, onChange: (...event: any[]) => void) => {
        onChange(date);
        setIsDatePopoverOpen(false); // Close the popover
    };


  return (
    <div className="space-y-8">
      {/* Card for Form Inputs */}
      <Card className="bg-card shadow-lg rounded-lg"> {/* Use bg-card and rounded-lg */}
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

             {/* Load Template Dropdown (Only shown if logged in and templates exist) */}
             {isAuthenticated && templates.length > 0 && (
                  <div>
                      <Label htmlFor="template_select">Загрузить шаблон</Label>
                      <Controller
                        name="template_select"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={handleTemplateSelect} value={field.value || '__placeholder__'}>
                              <SelectTrigger id="template_select" className={cn(
                                  'rounded-md shadow-md bg-input text-primary font-medium',
                                  !field.value || field.value === '__placeholder__' ? 'text-muted-foreground' : '' // Show placeholder style if no value or placeholder
                              )}>
                                  <SelectValue placeholder={
                                      <span className="text-muted-foreground flex items-center">
                                          <BookMarked className="mr-2 h-4 w-4" /> Выберите шаблон для загрузки
                                      </span>
                                  }>
                                      {field.value && field.value !== '__placeholder__' ? (
                                          templates.find(t => t.id === field.value)?.name
                                      ) : (
                                          <span className="text-muted-foreground flex items-center">
                                              <BookMarked className="mr-2 h-4 w-4" /> Выберите шаблон...
                                          </span>
                                      )}
                                  </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="rounded-lg">
                                  {/* Add a placeholder item with a non-empty value */}
                                  <SelectItem value="__placeholder__" disabled>
                                      <span className="text-muted-foreground flex items-center">
                                          <BookMarked className="mr-2 h-4 w-4" /> Выберите шаблон...
                                      </span>
                                  </SelectItem>
                                  {templates.map((template) => (
                                      <SelectItem key={template.id} value={template.id}>
                                          {template.name}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                        )}
                      />
                  </div>
             )}

            {/* Base URL */}
            <div>
              <Label htmlFor="baseUrl">URL сайта *</Label>
              <Controller
                name="baseUrl"
                control={control}
                render={({ field }) => (
                  <Input id="baseUrl" placeholder="https://example.com/" {...field} className="rounded-md font-medium shadow-md"/>
                )}
              />
              {errors.baseUrl && <p className="text-destructive text-sm mt-1">{errors.baseUrl.message}</p>}
            </div>

             {/* UTM Source - Merged Input + Select */}
            <div>
                <Label htmlFor="utm_source_custom">utm_source (Источник) *</Label>
                <div className="flex items-center rounded-md border border-input shadow-md overflow-hidden bg-input">
                    <Controller
                        name="utm_source_custom"
                        control={control}
                        render={({ field }) => (
                        <Input
                            id="utm_source_custom"
                            placeholder="Например: yandex"
                            {...field}
                            // Remove individual border/shadow, allow flex-grow
                            className="flex-grow !border-none !shadow-none !ring-0 focus:!ring-0 rounded-none bg-transparent pl-3 font-medium"
                            onChange={(e) => {
                                field.onChange(e);
                                trigger('utm_source_custom');
                            }}
                        />
                        )}
                    />
                    <Controller
                        name="utm_source_preset"
                        control={control}
                        render={({ field }) => (
                        <Select
                            onValueChange={(value) => field.onChange(value === '__placeholder__' ? '' : value)} // Set to empty string if placeholder
                            value={field.value || '__placeholder__'} // Use placeholder value
                            disabled={!isAuthenticated} // Disable for guest users
                        >
                            <SelectTrigger
                                id="utm_source_preset_merged"
                                // Custom styling for the button look
                                className={cn(
                                    "!h-10 !w-[170px] !border-none !border-l !border-input !shadow-none !ring-0 focus:!ring-0 rounded-none bg-muted text-primary font-medium px-3", // Use text-primary, ensure full opacity
                                    (!field.value || field.value === '__placeholder__') && 'text-muted-foreground',
                                    !isAuthenticated && 'cursor-not-allowed opacity-50' // Style when disabled
                                )}
                                aria-label="Предустановленные источники" // Accessibility
                            >
                                    {/* Show value or placeholder */}
                                <SelectValue placeholder={<span className="text-muted-foreground">Источник</span>}>
                                    {field.value && field.value !== '__placeholder__'
                                        ? predefinedSources.find(p => p.value === field.value)?.label || field.value
                                        : <span className="text-muted-foreground">Источник</span> // Short placeholder
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                {/* Add placeholder item */}
                                    <SelectItem value="__placeholder__" disabled>Выберите источник</SelectItem>
                                {isAuthenticated && predefinedSources.map((source) => ( // Conditionally render items
                                    <SelectItem key={source.value} value={source.value}>
                                    {source.label} ({source.value})
                                    </SelectItem>
                                ))}
                                {!isAuthenticated && (
                                    <SelectItem value="__no_auth__" disabled>
                                        <span className="text-muted-foreground italic">Доступно после входа</span>
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        )}
                    />
                </div>
                {/* Display the refined error message here (applies to custom field input) */}
                {errors.utm_source_custom && (
                    <p className="text-destructive text-sm mt-1">{errors.utm_source_custom.message}</p>
                )}
            </div>


           {/* UTM Medium - Merged Input + Select */}
            <div>
                <Label htmlFor="utm_medium_custom">utm_medium (Канал)</Label>
                <div className="flex items-center rounded-md border border-input shadow-md overflow-hidden bg-input">
                    <Controller
                        name="utm_medium_custom"
                        control={control}
                        render={({ field }) => (
                        <Input
                            id="utm_medium_custom"
                            placeholder="Например: cpc"
                            {...field}
                            className="flex-grow !border-none !shadow-none !ring-0 focus:!ring-0 rounded-none bg-transparent pl-3 font-medium"
                            onChange={(e) => {
                                field.onChange(e);
                                trigger('utm_medium_custom');
                            }}
                        />
                        )}
                    />
                    <Controller
                        name="utm_medium_preset"
                        control={control}
                        render={({ field }) => (
                        <Select
                            onValueChange={(value) => field.onChange(value === '__placeholder__' ? '' : value)} // Set to empty string if placeholder
                            value={field.value || '__placeholder__'} // Use placeholder value
                                disabled={!isAuthenticated} // Disable for guest users
                            >
                            <SelectTrigger
                                id="utm_medium_preset_merged"
                                className={cn(
                                    "!h-10 !w-[170px] !border-none !border-l !border-input !shadow-none !ring-0 focus:!ring-0 rounded-none bg-muted text-primary font-medium px-3", // Use text-primary, ensure full opacity
                                    (!field.value || field.value === '__placeholder__') && 'text-muted-foreground', // Keep placeholder muted
                                    !isAuthenticated && 'cursor-not-allowed opacity-50'
                                )}
                                aria-label="Предустановленные каналы"
                            >
                                    {/* Show value or placeholder */}
                                    <SelectValue placeholder={<span className="text-muted-foreground">Канал</span>}>
                                        {field.value && field.value !== '__placeholder__'
                                            ? predefinedMediums.find(p => p.value === field.value)?.label || field.value
                                            : <span className="text-muted-foreground">Канал</span> // Short placeholder
                                        }
                                    </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                    {/* Add placeholder item */}
                                <SelectItem value="__placeholder__" disabled>Выберите канал</SelectItem>
                                {isAuthenticated && predefinedMediums.map((medium) => ( // Conditionally render items
                                    <SelectItem key={medium.value} value={medium.value}>
                                    {medium.label} ({medium.value})
                                    </SelectItem>
                                ))}
                                 {!isAuthenticated && (
                                    <SelectItem value="__no_auth__" disabled>
                                        <span className="text-muted-foreground italic">Доступно после входа</span>
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        )}
                    />
                </div>
                 {errors.utm_medium_custom && <p className="text-destructive text-sm mt-1">{errors.utm_medium_custom.message}</p>}
            </div>

            {/* UTM Campaign - Merged Input + Date Button */}
            <div>
                <Label htmlFor="utm_campaign_name">utm_campaign (Название кампании)</Label>
                <div className="flex items-center rounded-md border border-input shadow-md overflow-hidden bg-input">
                    <Controller
                        name="utm_campaign_name"
                        control={control}
                        render={({ field }) => (
                        <Input
                            id="utm_campaign_name"
                            placeholder="Например: summer_sale"
                            {...field}
                            className="flex-grow !border-none !shadow-none !ring-0 focus:!ring-0 rounded-none bg-transparent pl-3 font-medium"
                        />
                        )}
                    />
                    <Controller
                        name="utm_campaign_date"
                        control={control}
                        render={({ field }) => (
                        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                            <PopoverTrigger asChild>
                            <Button
                                variant={'ghost'} // Use ghost variant for seamless look
                                className={cn(
                                    "!h-10 !w-[170px] !border-none !border-l !border-input !shadow-none !ring-0 focus:!ring-0 rounded-none bg-muted text-primary font-medium px-3 justify-between", // Use text-primary, ensure full opacity
                                    !field.value && 'text-muted-foreground' // Muted placeholder text
                                )}
                                aria-label="Выберите дату кампании"
                            >
                                    {/* Show formatted date or placeholder */}
                                    <span className="truncate">
                                    {field.value ? format(field.value, 'LLLL yyyy', { locale: ru }) : <span className="text-muted-foreground">Дата</span>}
                                </span>
                                <CalendarIcon className={cn("h-4 w-4", field.value ? "text-primary" : "text-muted-foreground")} />
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-lg shadow-lg" align="start">
                                <MonthPicker
                                selected={field.value}
                                onSelect={(date) => handleDateSelect(date, field.onChange)}
                                locale={ru}
                                />
                            </PopoverContent>
                        </Popover>
                        )}
                    />
                </div>
                {errors.utm_campaign_name && <p className="text-destructive text-sm mt-1">{errors.utm_campaign_name.message}</p>}
                {errors.utm_campaign_date && <p className="text-destructive text-sm mt-1">{errors.utm_campaign_date.message}</p>}
            </div>


            {/* UTM Term */}
             <div>
              <Label htmlFor="utm_term">utm_term (Ключевое слово)</Label>
               <Controller
                  name="utm_term"
                  control={control}
                  render={({ field }) => (
                    <Input id="utm_term" placeholder="Например: buy+book" {...field} className="rounded-md font-medium shadow-md" />
                  )}
                />
                 {errors.utm_term && <p className="text-destructive text-sm mt-1">{errors.utm_term.message}</p>}
            </div>

             {/* UTM Content */}
            <div>
              <Label htmlFor="utm_content">utm_content (Содержание)</Label>
               <Controller
                  name="utm_content"
                  control={control}
                  render={({ field }) => (
                   <Input id="utm_content" placeholder="Например: banner_728x90" {...field} className="rounded-md font-medium shadow-md"/>
                  )}
                />
                 {errors.utm_content && <p className="text-destructive text-sm mt-1">{errors.utm_content.message}</p>}
            </div>

            <Button type="submit" className="w-full md:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">Сгенерировать</Button>
          </form>
        </CardContent>
      </Card>

       {/* Card for Generated URL Output (conditionally rendered) */}
      {generatedUrl && (
        <Card className="bg-card shadow-lg rounded-lg"> {/* Use bg-card and rounded-lg */}
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Сгенерированная ссылка</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4 break-all p-6">
             {/* Make the URL text selectable */}
             <p className="flex-1 text-primary bg-muted p-3 rounded-md shadow-inner select-all">{generatedUrl}</p>
             <Button variant="default" size="sm" onClick={copyToClipboard} className="rounded-md shadow-md hover:shadow-lg transition-shadow">
                <Copy className="mr-2 h-4 w-4" />
                Копировать
             </Button>
          </CardContent>
        </Card>
      )}

       {/* Conditional Login Prompt */}
        {!isLoading && !isAuthenticated && (
             <p className="text-sm text-secondary text-center mt-4"> {/* Changed text-muted-foreground to text-secondary */}
                 Чтобы смотреть историю создания размеченных ссылок,{' '}
                 <Link href="/login" className="font-bold text-primary hover:underline">
                     войдите в аккаунт →
                 </Link>
             </p>
         )}
    </div>
  );
}
