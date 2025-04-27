
"use client"

import * as React from "react"
import { format, addMonths, subMonths, setMonth, setYear, getYear, getMonth } from "date-fns"
import { ru } from 'date-fns/locale'; // Import Russian locale
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MonthPickerProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  locale?: Locale;
  fromYear?: number;
  toYear?: number;
}

const MonthPicker = ({
  selected,
  onSelect,
  locale = ru, // Default to Russian locale
  fromYear = getYear(new Date()) - 10, // Default range: 10 years back
  toYear = getYear(new Date()) + 10, // Default range: 10 years forward
}: MonthPickerProps) => {
  const [currentYear, setCurrentYear] = React.useState(getYear(selected || new Date()));
  const [selectedDate, setSelectedDate] = React.useState(selected);

  React.useEffect(() => {
      setSelectedDate(selected);
      if (selected) {
          setCurrentYear(getYear(selected));
      }
  }, [selected]);

  const handleMonthClick = (monthIndex: number) => {
    const newDate = setMonth(setYear(selectedDate || new Date(), currentYear), monthIndex);
    setSelectedDate(newDate);
    onSelect?.(newDate);
  };

  const handleYearChange = (yearValue: string) => {
    const year = parseInt(yearValue, 10);
    setCurrentYear(year);
    // Optionally update the selected date's year immediately or wait for month click
    if (selectedDate) {
        const newDate = setYear(selectedDate, year);
        setSelectedDate(newDate);
        // Decide if onSelect should be called here or only on month click
        // onSelect?.(newDate);
    }
  };

  const changeYear = (amount: number) => {
      const newYear = currentYear + amount;
      if (newYear >= fromYear && newYear <= toYear) {
          setCurrentYear(newYear);
          if (selectedDate) {
             const newDate = setYear(selectedDate, newYear);
             setSelectedDate(newDate);
             // onSelect?.(newDate); // Decide if onSelect should be called here
          }
      }
  };

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="p-3 rounded-lg bg-card shadow-md"> {/* Added rounding and shadow */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-md" // Apply rounded-md
          onClick={() => changeYear(-1)}
          disabled={currentYear <= fromYear}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Select value={currentYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[120px] rounded-md shadow-sm bg-input text-primary font-medium h-8"> {/* Style SelectTrigger */}
            <SelectValue placeholder="Выберите год" />
          </SelectTrigger>
          <SelectContent className="rounded-lg"> {/* Apply rounded-lg */}
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-md" // Apply rounded-md
          onClick={() => changeYear(1)}
          disabled={currentYear >= toYear}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {months.map((monthIndex) => {
          const monthDate = setMonth(setYear(new Date(), currentYear), monthIndex);
          const isSelected = selectedDate && getYear(selectedDate) === currentYear && getMonth(selectedDate) === monthIndex;
          return (
            <Button
              key={monthIndex}
              variant={isSelected ? "default" : "ghost"} // Use default variant for selected
              size="sm"
              className={cn(
                  "rounded-md w-full justify-center", // Apply rounded-md
                  isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => handleMonthClick(monthIndex)}
            >
              {format(monthDate, 'LLLL', { locale })}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

MonthPicker.displayName = "MonthPicker";

export { MonthPicker };

    