import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Car,
  Zap,
  Waves,
  Mountain
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'auto' | 'neon' | 'ocean' | 'forest';

interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('audio-theme') as Theme || 'dark';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Remover clases anteriores
    root.classList.remove('light', 'dark', 'neon', 'ocean', 'forest');
    
    switch (theme) {
      case 'light':
        root.classList.add('light');
        break;
      case 'dark':
        root.classList.add('dark');
        break;
      case 'auto':
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(prefersDark ? 'dark' : 'light');
        break;
      case 'neon':
        root.classList.add('neon');
        break;
      case 'ocean':
        root.classList.add('ocean');
        break;
      case 'forest':
        root.classList.add('forest');
        break;
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('audio-theme', theme);
    applyTheme(theme);
  };

  const themes = [
    { id: 'dark' as Theme, name: 'Oscuro', icon: Moon, preview: 'bg-slate-900' },
    { id: 'light' as Theme, name: 'Claro', icon: Sun, preview: 'bg-slate-100' },
    { id: 'auto' as Theme, name: 'Auto', icon: Monitor, preview: 'bg-gradient-to-r from-slate-900 to-slate-100' },
    { id: 'neon' as Theme, name: 'Neón', icon: Zap, preview: 'bg-gradient-to-r from-purple-600 to-cyan-400' },
    { id: 'ocean' as Theme, name: 'Océano', icon: Waves, preview: 'bg-gradient-to-r from-blue-600 to-teal-400' },
    { id: 'forest' as Theme, name: 'Bosque', icon: Mountain, preview: 'bg-gradient-to-r from-green-700 to-emerald-500' }
  ];

  return (
    <Card className={cn("bg-audio-surface border-audio-muted p-4", className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-audio-primary" />
          <h3 className="text-sm text-audio-text font-medium uppercase tracking-wide">
            Tema visual
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = currentTheme === theme.id;
            
            return (
              <Button
                key={theme.id}
                variant={isSelected ? 'auto' : 'auto-secondary'}
                onClick={() => handleThemeChange(theme.id)}
                className="flex flex-col items-center gap-2 h-auto p-3 relative"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{theme.name}</span>
                </div>
                <div className={cn(
                  "w-full h-2 rounded-full",
                  theme.preview
                )} />
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-audio-primary rounded-lg" />
                )}
              </Button>
            );
          })}
        </div>
        
        <div className="text-xs text-audio-muted text-center">
          {currentTheme === 'auto' 
            ? 'Se adapta al sistema' 
            : `Tema ${themes.find(t => t.id === currentTheme)?.name.toLowerCase()} activado`
          }
        </div>
      </div>
    </Card>
  );
};