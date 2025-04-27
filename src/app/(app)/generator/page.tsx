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
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseUrl: 'https://example.com/',
      utm_source_custom: '',
      utm_source_preset: '',
      utm_medium_custom: '',
      utm_medium_preset: '',
      utm_campaign_name: '',
      utm_term: '',
      utm_content: '',
    },
  });

  const watchSourcePreset = watch('utm_source_preset');
  const watchMediumPreset = watch('utm_medium_preset');

  React.useEffect(() => {
    if (watchSourcePreset) {
      setValue('utm_source_custom', ''); // Clear custom field if preset is selected
    }
  }, [watchSourcePreset, setValue]);

  React.useEffect(() => {
    if (watchMediumPreset) {
      setValue('utm_medium_custom', ''); // Clear custom field if preset is selected
    }
  }, [watchMediumPreset, setValue]);

  const onSubmit = (data: FormData) => {
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

    url.search = params.toString();
    setGeneratedUrl(url.toString());
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

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Генератор UTM-меток</h1>
      <Card className="mb-8 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="baseUrl">URL сайта *</Label>
              <Controller
                name="baseUrl"
                control={control}
                render={({ field }) => (
                  <Input id="baseUrl" placeholder="https://example.com/" {...field} />
                )}
              />
              {errors.baseUrl && <p className="text-destructive text-sm mt-1">{errors.baseUrl.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="utm_source_custom">utm_source (Источник)</Label>
                 <Controller
                    name="utm_source_custom"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="utm_source_custom"
                        placeholder="Например: yandex"
                        {...field}
                        disabled={!!watchSourcePreset}
                      />
                    )}
                  />
              </div>
               <div>
                 <Label htmlFor="utm_source_preset">Предустановленные</Label>
                 <Controller
                    name="utm_source_preset"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!watch('utm_source_custom')}>
                        <SelectTrigger id="utm_source_preset">
                          <SelectValue placeholder="Выберите источник" />
                        </SelectTrigger>
                        <SelectContent>
                          {predefinedSources.map((source) => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
               </div>
            </div>

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
                        disabled={!!watchMediumPreset}
                      />
                    )}
                  />
              </div>
               <div>
                 <Label htmlFor="utm_medium_preset">Предустановленные</Label>
                 <Controller
                    name="utm_medium_preset"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!watch('utm_medium_custom')}>
                        <SelectTrigger id="utm_medium_preset">
                          <SelectValue placeholder="Выберите канал" />
                        </SelectTrigger>
                        <SelectContent>
                          {predefinedMediums.map((medium) => (
                            <SelectItem key={medium.value} value={medium.value}>
                              {medium.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="utm_campaign_name">utm_campaign (Название кампании)</Label>
                <Controller
                  name="utm_campaign_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="utm_campaign_name"
                      placeholder="Название кампании"
                      {...field}
                    />
                  )}
                />
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
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'LLLL yyyy', { locale: ru }) : <span>Выберите дату</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                           <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ru}
                              captionLayout="dropdown-buttons"
                              fromYear={2020}
                              toYear={new Date().getFullYear() + 5}
                              initialFocus
                            />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
              </div>
            </div>


             <div>
              <Label htmlFor="utm_term">utm_term (Ключевое слово)</Label>
               <Controller
                  name="utm_term"
                  control={control}
                  render={({ field }) => (
                    <Input id="utm_term" placeholder="Например: buy+book" {...field} />
                  )}
                />
            </div>

            <div>
              <Label htmlFor="utm_content">utm_content (Содержание)</Label>
               <Controller
                  name="utm_content"
                  control={control}
                  render={({ field }) => (
                   <Input id="utm_content" placeholder="Например: banner_728x90" {...field} />
                  )}
                />
            </div>

            <Button type="submit" className="w-full md:w-auto">Сгенерировать</Button>
          </form>
        </CardContent>
      </Card>

      {generatedUrl && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Сгенерированная ссылка</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4 break-all">
             <p className="flex-1 text-secondary">{generatedUrl}</p>
             <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                Копировать
             </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
