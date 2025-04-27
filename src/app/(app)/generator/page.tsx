
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
// Remove Calendar import
// import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { translateMonth } from '@/services/date-formatter';
import { MonthPicker } from '@/components/ui/month-picker'; // Import the new MonthPicker

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
}).refine(data => !!data.utm_source_custom || !!data.utm_source_preset, { // Ensure at least one source is provided
    message: "Источник (utm_source) должен быть указан.",
    path: ["utm_source_custom"], // Path for the primary source field where the error appears
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
  const [isDatePopoverOpen, setIsDatePopoverOpen] = React.useState(false); // State to control date picker popover

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

    // Only add utm_source if it has a value (it's required by schema refinement)
    if (utmSource) params.set('utm_source', utmSource);

    // Add other optional params only if they have values
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
            // Handle source sync
            if (name === 'utm_source_preset' && value.utm_source_preset) {
                setValue('utm_source_custom', value.utm_source_preset, { shouldValidate: true }); // Set and validate
            } else if (name === 'utm_source_custom' && value.utm_source_custom !== watch('utm_source_preset')) {
                setValue('utm_source_preset', ''); // Clear preset if custom changes
            }

            // Handle medium sync
            if (name === 'utm_medium_preset' && value.utm_medium_preset) {
                setValue('utm_medium_custom', value.utm_medium_preset, { shouldValidate: true }); // Set and validate
            } else if (name === 'utm_medium_custom' && value.utm_medium_custom !== watch('utm_medium_preset')) {
                 setValue('utm_medium_preset', ''); // Clear preset if custom changes
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
                  <Input id="baseUrl" placeholder="https://example.com/" {...field} className="rounded-md font-medium"/>
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
                            className="rounded-md font-medium" // Added font-medium
                            onChange={(e) => {
                                field.onChange(e);
                                // Logic to clear preset moved to useEffect watcher
                                // Trigger validation after custom input changes
                                trigger('utm_source_custom');
                            }}
                        />
                        )}
                    />
                    {/* Display the refined error message here */}
                    {errors.utm_source_custom && errors.utm_source_custom.type === 'refine' && (
                      <p className="text-destructive text-sm mt-1">{errors.utm_source_custom.message}</p>
                    )}
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
                                // Logic to set custom field and trigger validation is in useEffect watcher
                            }}
                            value={field.value || ''}
                            >
                            <SelectTrigger id="utm_source_preset" className="rounded-md bg-input text-primary shadow-md font-medium"> {/* Match date picker style */}
                                <SelectValue placeholder={<span className="text-muted-foreground">Выберите источник</span>} /> {/* Styled placeholder */}
                            </SelectTrigger>
                            <SelectContent>
                            {/* Allow clearing by selecting empty string if needed, but handled by custom input */}
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
                    {/* Error display might be less direct, possibly rely on the main field's error */}
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
                            className="rounded-md font-medium" // Added font-medium
                            onChange={(e) => {
                                field.onChange(e);
                                // Logic to clear preset moved to useEffect watcher
                                trigger('utm_medium_custom'); // Validate on change if needed
                            }}
                        />
                        )}
                    />
                     {/* Optional field: No error display needed unless specific validation rules apply */}
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
                                // Logic to set custom field is in useEffect watcher
                            }}
                            value={field.value || ''}
                            >
                            <SelectTrigger id="utm_medium_preset" className="rounded-md bg-input text-primary shadow-md font-medium"> {/* Match date picker style */}
                                <SelectValue placeholder={<span className="text-muted-foreground">Выберите канал</span>} /> {/* Styled placeholder */}
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
                     {/* Optional field: No error display needed */}
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
                      className="rounded-md font-medium" // Added font-medium
                    />
                  )}
                />
                 {/* Optional field: No error display needed */}
              </div>
               <div>
                <Label htmlFor="utm_campaign_date">Дата кампании (Месяц, Год)</Label>
                 <Controller
                    name="utm_campaign_date"
                    control={control}
                    render={({ field }) => (
                       <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                        <PopoverTrigger asChild>
                           <Button
                                variant={'outline'}
                                className={cn(
                                'w-full justify-start text-left font-normal rounded-md shadow-md bg-input text-primary font-medium', // Apply input styles, font-medium
                                !field.value && 'text-muted-foreground' // Keep placeholder style
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" /> {/* Icon color */}
                                {field.value ? format(field.value, 'LLLL yyyy', { locale: ru }) : <span className="text-muted-foreground">Выберите дату</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-lg shadow-lg" align="start">
                            <MonthPicker
                              selected={field.value}
                              onSelect={(date) => handleDateSelect(date, field.onChange)} // Use handler to close popover
                              locale={ru}
                            />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                   {/* Optional field: No error display needed */}
              </div>
            </div>

            {/* UTM Term */}
             <div>
              <Label htmlFor="utm_term">utm_term (Ключевое слово)</Label>
               <Controller
                  name="utm_term"
                  control={control}
                  render={({ field }) => (
                    <Input id="utm_term" placeholder="Например: buy+book" {...field} className="rounded-md font-medium" /> // Added font-medium
                  )}
                />
                 {/* Optional field: No error display needed */}
            </div>

             {/* UTM Content */}
            <div>
              <Label htmlFor="utm_content">utm_content (Содержание)</Label>
               <Controller
                  name="utm_content"
                  control={control}
                  render={({ field }) => (
                   <Input id="utm_content" placeholder="Например: banner_728x90" {...field} className="rounded-md font-medium"/> // Added font-medium
                  )}
                />
                 {/* Optional field: No error display needed */}
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
             <Button variant="default" size="sm" onClick={copyToClipboard} className="rounded-md shadow-sm hover:shadow transition-shadow"> {/* Button style consistent with Generate */}
                <Copy className="mr-2 h-4 w-4" />
                Копировать
             </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    