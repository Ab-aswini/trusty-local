import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="card-soft p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            <div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded mt-1 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="card-soft p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          {theme === 'dark' ? (
            <Moon className="h-5 w-5 text-muted-foreground" />
          ) : theme === 'light' ? (
            <Sun className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Monitor className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-sm text-foreground">Appearance</h3>
          <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 ${
              theme === value
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;
