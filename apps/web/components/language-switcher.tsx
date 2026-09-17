"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

const languages = [
  {
    code: 'id',
    name: 'Bahasa Indonesia',
    shortName: 'ID',
    flag: '🇮🇩',
  },
  {
    code: 'en',
    name: 'English',
    shortName: 'EN',
    flag: '🇺🇸',
  },
] as const;

export function LanguageSwitcher({
  className,
  variant = 'ghost',
}: LanguageSwitcherProps) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (newLocale: 'id' | 'en') => {
    if (newLocale === currentLocale) return;
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 font-medium text-sm transition-colors rounded-md",
            className
          )}
          aria-label="Pilih bahasa / Select language"
        >
          <span className="text-base leading-none" role="img" aria-label={currentLanguage.name}>
            {currentLanguage.flag}
          </span>
          <span className="uppercase text-xs font-semibold tracking-wider">
            {currentLanguage.shortName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-1">
        {languages.map((language) => {
          const isActive = language.code === currentLocale;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm cursor-pointer rounded-sm",
                isActive && "font-semibold bg-accent text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base leading-none" role="img" aria-label={language.name}>
                  {language.flag}
                </span>
                <span>{language.name}</span>
              </div>
              {isActive && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
