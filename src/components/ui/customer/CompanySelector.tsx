
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface CompanySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface Company {
  id: string;
  name: string;
}

export function CompanySelector({
  value,
  onChange,
  disabled = false
}: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');

        if (error) throw error;

        setCompanies(data || []);

        // Find the currently selected company
        if (value) {
          const current = data?.find(company => company.id === value);
          if (current) {
            setSelected(current);
          }
        }
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [value]);

  const handleSelect = (companyId: string) => {
    const selectedCompany = companies.find(company => company.id === companyId);
    setSelected(selectedCompany || null);
    onChange(companyId);
    setOpen(false);
  };

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !selected && "text-muted-foreground"
          )}
        >
          {selected ? selected.name : "Select company..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search company..." />
          <CommandEmpty>No company found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                value={company.id}
                onSelect={() => handleSelect(company.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected?.id === company.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {company.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CompanySelector;
