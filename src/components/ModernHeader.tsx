import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Book, 
  Settings, 
  Headphones,
  Sparkles,
  Car
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernHeaderProps {
  title: string;
  author?: string;
  onSettingsClick?: () => void;
  className?: string;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  author,
  onSettingsClick,
  className
}) => {
  return (
    <Card className={cn(
      "bg-gradient-audio border-none p-6 relative overflow-hidden shadow-auto",
      className
    )}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Audio Auto
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Audiolibros inteligentes
              </p>
            </div>
          </div>
          
          {onSettingsClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettingsClick}
              className="text-foreground hover:bg-foreground/10"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>

        {title && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Book className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Reproduciendo ahora</span>
            </div>
            <h2 className="text-xl font-bold text-foreground truncate">
              {title}
            </h2>
            {author && (
              <p className="text-muted-foreground">
                por {author}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};