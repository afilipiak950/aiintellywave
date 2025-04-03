import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/utils/cn"; // Updated from @/utils/cn
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
import { Badge } from "@/components/ui/badge";

interface CompanySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  showPrimaryBadge?: boolean;
  userId?: string;
}

interface Company {
  id: string;
  name: string;
  is_primary?: boolean;
}

export function CompanySelector({
  value,
  onChange,
  disabled = false,
  showPrimaryBadge = false,
  userId
}: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        
        if (userId) {
          // If we have a user ID, fetch companies this user is associated with
          const { data, error } = await supabase
            .from('company_users')
            .select(`
              company_id,
              is_primary_company,
              companies:company_id (id, name)
            `)
            .eq('user_id', userId);
            
          if (error) throw error;
          
          const formattedData = data?.map(item => ({
            id: item.company_id,
            name: item.companies?.name || 'Unknown Company',
            is_primary: item.is_primary_company || false
          })) || [];
          
          setCompanies(formattedData);
        } else {
          // Otherwise fetch all companies
          const { data, error } = await supabase
            .from('companies')
            .select('id, name')
            .order('name');
  
          if (error) throw error;
          
          setCompanies(data || []);
        }

        // Find the currently selected company
        if (value) {
          const current = companies.find(company => company.id === value);
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
  }, [value, userId]);

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
          <div className="flex items-center gap-2 truncate">
            {selected ? (
              <>
                <span className="truncate">{selected.name}</span>
                {showPrimaryBadge && selected.is_primary && (
                  <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 border-green-200">
                    Primary
                  </Badge>
                )}
              </>
            ) : (
              "Select company..."
            )}
          </div>
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
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected?.id === company.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {company.name}
                  </div>
                  
                  {showPrimaryBadge && company.is_primary && (
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                      Primary
                    </Badge>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CompanySelector;
