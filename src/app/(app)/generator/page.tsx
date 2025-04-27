
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, Copy } from 'lucide-react';

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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { translateMonth } from '@/services/date-formatter';

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
}).refine(data => data.utm_source_custom || data.utm_source_preset, {
    message: "Источник (utm_source) должен быть указан.",
    path: ["utm_source_custom"], // Path for the primary source field
});


type FormData = z.infer<typeof formSchema>;

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

export default function GeneratorPage() {
  const { toast } = useToast();
  const [generatedUrl, setGeneratedUrl] = React.useState<string>('');
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

    const url = new URL(data.baseUrl);
    const params = new URLSearchParams();

    const utmSource = data.utm_source_custom || data.utm_source_preset;
    const utmMedium = data.utm_medium_custom || data.utm_medium_preset;

    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);

    let campaignValue = '';
    if (data.utm_campaign_name && data.utm_campaign_date) {
        const monthRussian = format(data.utm_campaign_date, 'LLLL', { locale: ru });
        const monthEnglish = translateMonth(monthRussian.toLowerCase());
        const year = format(data.utm_campaign_date, 'yyyy');
        campaignValue = `${data.utm_campaign_name}_${monthEnglish}_${year}`;
    } else if (data.utm_campaign_name) {
        campaignValue = data.utm_campaign_name;
    }
    if (campaignValue) params.set('utm_campaign', campaignValue);

    if (data.utm_term) params.set('utm_term', data.utm_term);
    if (data.utm_content) params.set('utm_content', data.utm_content);

    if (params.toString()) {
        url.search = params.toString();
    } else {
        url.search = ''; // Ensure no trailing '?' if no params
    }
    setGeneratedUrl(url.toString());
    // TODO: Save the generated URL to history (likely requires API call/state management)
    console.log('Saving to history:', url.toString()); // Placeholder
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

  // Watch changes in preset fields to update custom fields
   React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'utm_source_preset' && value.utm_source_preset) {
                setValue('utm_source_custom', value.utm_source_preset);
                trigger('utm_source_custom'); // Trigger validation after update
            } else if (name === 'utm_source_custom' && value.utm_source_custom !== watch('utm_source_preset')) {
                // If user types manually in custom field, clear the preset selection
                setValue('utm_source_preset', '');
            }

            if (name === 'utm_medium_preset' && value.utm_medium_preset) {
                setValue('utm_medium_custom', value.utm_medium_preset);
                 trigger('utm_medium_custom'); // Trigger validation after update
            } else if (name === 'utm_medium_custom' && value.utm_medium_custom !== watch('utm_medium_preset')) {
                 // If user types manually in custom field, clear the preset selection
                 setValue('utm_medium_preset', '');
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue, trigger]);

  return (
    <div className="space-y-8">
      {/* Card for Form Inputs */}
      <Card className="shadow-md rounded-lg bg-card"> {/* Ensure card background is white */}
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Base URL */}
            <div>
              <Label htmlFor="baseUrl">URL сайта *</Label>
              <Controller
                name="baseUrl"
                control={control}
                render={({ field }) => (
                  <Input id="baseUrl" placeholder="https://example.com/" {...field} className="rounded-md"/>
                )}
              />
              {errors.baseUrl && <p className="text-destructive text-sm mt-1">{errors.baseUrl.message}</p>}
            </div>

             {/* UTM Source */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="utm_source_custom">utm_source (Источник) *</Label>
                    <Controller
                        name="utm_source_custom"
                        control={control}
                        render={({ field }) => (
                        <Input
                            id="utm_source_custom"
                            placeholder="Например: yandex"
                            {...field}
                            className="rounded-md"
                            onChange={(e) => {
                                field.onChange(e);
                                // Logic to clear preset moved to useEffect watcher
                                trigger('utm_source_custom'); // Validate on change
                            }}
                        />
                        )}
                    />
                    {errors.utm_source_custom && <p className="text-destructive text-sm mt-1">{errors.utm_source_custom.message}</p>}
                </div>
                <div>
                    <Label htmlFor="utm_source_preset">Предустановленные</Label>
                    <Controller
                        name="utm_source_preset"
                        control={control}
                        render={({ field }) => (
                        <Select
                            onValueChange={(value) => {
                                field.onChange(value);
                                // Logic to set custom field moved to useEffect watcher
                            }}
                            value={field.value || ''} // Ensure value is controlled, handle empty string
                            >
                            <SelectTrigger id="utm_source_preset" className="rounded-md">
                            <SelectValue placeholder="Выберите источник" />
                            </SelectTrigger>
                            <SelectContent>
                            {/* Add an empty value option if needed for clearing selection, though clearing via custom input is preferred */}
                            {/* <SelectItem value="">-- Не выбрано --</SelectItem> */}
                            {predefinedSources.map((source) => (
                                <SelectItem key={source.value} value={source.value}>
                                {source.label} ({source.value})
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {/* Error for preset is less direct, maybe show under custom field or a general form error */}
                </div>
            </div>


           {/* UTM Medium */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="utm_medium_custom">utm_medium (Канал)</Label>
                    <Controller
                        name="utm_medium_custom"
                        control={control}
                        render={({ field }) => (
                        <Input
                            id="utm_medium_custom"
                            placeholder="Например: cpc"
                            {...field}
                            className="rounded-md"
                            onChange={(e) => {
                                field.onChange(e);
                                // Logic to clear preset moved to useEffect watcher
                                 trigger('utm_medium_custom'); // Validate on change
                            }}
                        />
                        )}
                    />
                     {/* Remove error display for optional field */}
                     {/* {errors.utm_medium_custom && <p className="text-destructive text-sm mt-1">{errors.utm_medium_custom.message}</p>} */}
                </div>
                <div>
                    <Label htmlFor="utm_medium_preset">Предустановленные</Label>
                    <Controller
                        name="utm_medium_preset"
                        control={control}
                        render={({ field }) => (
                        <Select
                            onValueChange={(value) => {
                                field.onChange(value);
                               // Logic to set custom field moved to useEffect watcher
                            }}
                            value={field.value || ''} // Ensure value is controlled, handle empty string
                            >
                            <SelectTrigger id="utm_medium_preset" className="rounded-md">
                            <SelectValue placeholder="Выберите канал" />
                            </SelectTrigger>
                            <SelectContent>
                             {/* <SelectItem value="">-- Не выбрано --</SelectItem> */}
                            {predefinedMediums.map((medium) => (
                                <SelectItem key={medium.value} value={medium.value}>
                                {medium.label} ({medium.value})
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        )}
                    />
                     {/* Error for preset is less direct */}
                </div>
            </div>

            {/* UTM Campaign */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="utm_campaign_name">utm_campaign (Название кампании)</Label>
                <Controller
                  name="utm_campaign_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="utm_campaign_name"
                      placeholder="Например: summer_sale"
                      {...field}
                      className="rounded-md"
                    />
                  )}
                />
                 {/* Remove error display for optional field */}
                 {/* {errors.utm_campaign_name && <p className="text-destructive text-sm mt-1">{errors.utm_campaign_name.message}</p>} */}
              </div>
               <div>
                <Label htmlFor="utm_campaign_date">Дата кампании (Месяц, Год)</Label>
                 <Controller
                    name="utm_campaign_date"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal rounded-md shadow-sm bg-input text-primary', // Apply input styles
                              !field.value && 'text-muted-foreground' // Keep placeholder style
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" /> {/* Icon color */}
                            {field.value ? format(field.value, 'LLLL yyyy', { locale: ru }) : <span className="text-muted-foreground">Выберите дату</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-lg shadow-lg"> {/* Use rounded-lg */}
                           <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ru}
                              captionLayout="dropdown-buttons"
                              fromYear={2020}
                              toYear={new Date().getFullYear() + 5}
                              initialFocus
                              classNames={{
                                  caption_dropdowns: "flex justify-center gap-2",
                                  dropdown_month: "rdp-dropdown_month",
                                  dropdown_year: "rdp-dropdown_year",
                                  dropdown: "rounded border p-1 bg-background shadow",
                                  root: "rounded-lg" // Ensure calendar itself is rounded
                                }}
                            />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                   {/* Remove error display for optional field */}
                   {/* {errors.utm_campaign_date && <p className="text-destructive text-sm mt-1">{errors.utm_campaign_date.message}</p>} */}
              </div>
            </div>

            {/* UTM Term */}
             <div>
              <Label htmlFor="utm_term">utm_term (Ключевое слово)</Label>
               <Controller
                  name="utm_term"
                  control={control}
                  render={({ field }) => (
                    <Input id="utm_term" placeholder="Например: buy+book" {...field} className="rounded-md" />
                  )}
                />
                 {/* Remove error display for optional field */}
                 {/* {errors.utm_term && <p className="text-destructive text-sm mt-1">{errors.utm_term.message}</p>} */}
            </div>

             {/* UTM Content */}
            <div>
              <Label htmlFor="utm_content">utm_content (Содержание)</Label>
               <Controller
                  name="utm_content"
                  control={control}
                  render={({ field }) => (
                   <Input id="utm_content" placeholder="Например: banner_728x90" {...field} className="rounded-md"/>
                  )}
                />
                {/* Remove error display for optional field */}
                 {/* {errors.utm_content && <p className="text-destructive text-sm mt-1">{errors.utm_content.message}</p>} */}
            </div>

            <Button type="submit" className="w-full md:w-auto rounded-md shadow-md hover:shadow-lg transition-shadow">Сгенерировать</Button>
          </form>
        </CardContent>
      </Card>

       {/* Card for Generated URL Output (conditionally rendered) */}
      {generatedUrl && (
        <Card className="shadow-md rounded-lg bg-card"> {/* Ensure card background is white */}
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Сгенерированная ссылка</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4 break-all p-6">
             {/* Make the URL text selectable */}
             <p className="flex-1 text-primary bg-muted p-3 rounded-md shadow-inner select-all">{generatedUrl}</p>
             <Button variant="default" size="sm" onClick={copyToClipboard} className="rounded-md shadow-sm hover:shadow transition-shadow">
                <Copy className="mr-2 h-4 w-4" />
                Копировать
             </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
