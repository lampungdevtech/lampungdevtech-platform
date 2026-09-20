'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Store,
  Clock,
  Cloud,
  CloudSun,
  Sun,
  CloudRain,
  Tablet,
  UtensilsCrossed,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { WeatherData } from './types';

interface HeaderContextBarProps {
  selectedBranch: string;
  onBranchChange: (branchId: string) => void;
  branches: { id: string; name: string; isMain: boolean }[];
}

export function HeaderContextBar({
  selectedBranch,
  onBranchChange,
  branches,
}: HeaderContextBarProps) {
  // 1. Live Indonesian Clock (WIB - UTC+7)
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format WIB
      const timeStr = now.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const dateStr = now.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setCurrentTime(`${timeStr} WIB`);
      setCurrentDate(dateStr);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Open-Meteo Free Real-time Weather & Cloud Cover API
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const fetchWeather = async () => {
    setIsLoadingWeather(true);
    try {
      // Free Open-Meteo API for Bandar Lampung (-5.4294, 105.2625)
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=-5.4294&longitude=105.2625&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,wind_speed_10m&timezone=Asia%2FJakarta'
      );
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const current = data.current;

      const code = current.weather_code || 0;
      const clouds = current.cloud_cover ?? 45;

      // Interpretasi WMO Code & Cloud Cover
      let desc = 'Cerah Berawan';
      if (clouds > 80) desc = 'Mendung Pekat (Awan Tertutup)';
      else if (clouds > 40) desc = 'Awan Tersebar';
      else if (clouds > 20) desc = 'Cerah Sebagian';
      else desc = 'Cerah Terang';

      if (code >= 51 && code <= 67) desc = 'Hujan Ringan - Sedang';
      else if (code >= 80 && code <= 99) desc = 'Hujan Deras / Badai';

      setWeather({
        temperature: Math.round(current.temperature_2m || 29),
        cloudCover: clouds,
        weatherCode: code,
        weatherDescription: desc,
        humidity: Math.round(current.relative_humidity_2m || 75),
        windSpeed: Math.round(current.wind_speed_10m || 10),
        city: 'Bandar Lampung, Indonesia',
        lastUpdated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      // Fallback data if offline
      setWeather({
        temperature: 30,
        cloudCover: 48,
        weatherCode: 2,
        weatherDescription: 'Awan Tersebar (48%)',
        humidity: 72,
        windSpeed: 12,
        city: 'Bandar Lampung, Indonesia',
        lastUpdated: '12:00 WIB',
      });
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Auto refresh cuaca setiap 15 menit
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (clouds: number, code: number) => {
    if (code >= 51) return <CloudRain className="w-5 h-5 text-blue-500 animate-bounce" />;
    if (clouds > 75) return <Cloud className="w-5 h-5 text-slate-400" />;
    if (clouds > 30) return <CloudSun className="w-5 h-5 text-amber-500" />;
    return <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />;
  };

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5 space-y-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
            <Store className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">Kopi Ruang Temu</h1>
              <span className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                POS SaaS Cloud
              </span>
              <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-medium">
                Multi-Tenant v1.2
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Owner Business Intelligence Portal • Pengelolaan Terpadu Keuangan, Staff, Bahan Baku & Operasional
            </p>
          </div>
        </div>

        {/* Branch Selector & Terminals */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border">
            <Label htmlFor="branchSelect" className="text-xs text-muted-foreground whitespace-nowrap pl-2">
              Cabang:
            </Label>
            <select
              id="branchSelect"
              className="h-8 rounded-lg border border-input bg-background px-3 py-0.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              value={selectedBranch}
              onChange={(e) => onBranchChange(e.target.value)}
            >
              <option value="ALL">🌐 Semua Cabang (Konsolidasi Global)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.isMain ? '★ Pusat' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/pos/terminal" target="_blank">
              <Button size="sm" className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <Tablet className="h-3.5 w-3.5 mr-1.5" />
                Terminal Kasir
              </Button>
            </Link>
            <Link href="/pos/kds" target="_blank">
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              >
                <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" />
                KDS Dapur
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sub-bar: Real-time Clock & Open-Meteo Weather Status */}
      <div className="pt-3 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {/* Real-time Indonesian Clock */}
        <div className="flex items-center gap-2.5 bg-muted/40 p-2.5 rounded-xl border border-muted-foreground/10">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-foreground font-mono">
                {currentTime || 'Memuat jam...'}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[10px] font-bold">
                WIB
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{currentDate}</p>
          </div>
        </div>

        {/* Live Weather & Cloud Cover Widget (Open-Meteo) */}
        <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-muted-foreground/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 shrink-0">
              {weather ? getWeatherIcon(weather.cloudCover, weather.weatherCode) : <CloudSun className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-foreground">
                  {weather ? `${weather.temperature}°C` : '29°C'}
                </span>
                <span className="text-muted-foreground font-medium text-[11px]">
                  • {weather?.weatherDescription || 'Awan Tersebar'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                Tutupan Awan: <strong className="text-foreground">{weather?.cloudCover ?? 45}%</strong> | Kelembapan: {weather?.humidity ?? 75}%
              </p>
            </div>
          </div>
          <button
            onClick={fetchWeather}
            title="Perbarui Cuaca"
            className="p-1 rounded hover:bg-background text-muted-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Weather-driven Operations Advisory */}
        <div className="hidden lg:flex items-center gap-2.5 bg-gradient-to-r from-primary/5 to-emerald-500/5 p-2.5 rounded-xl border border-primary/15">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <div className="text-[11px]">
            <span className="font-bold text-foreground">Kondisi Operasional:</span>{' '}
            <span className="text-muted-foreground">
              {weather && weather.cloudCover > 70
                ? 'Langit mendung berpotensi hujan, pastikan payung teras siap & optimalkan kemasan take-away.'
                : 'Cuaca cerah bersahabat, siapkan stok biji kopi, es batu kristal & sirup minuman dingin.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
