import { useState, useEffect, useRef } from 'react';
import { getProducts, deleteProduct, uploadProductImage, uploadProductFiles, getProductFiles, deleteProductFile } from '@/lib/api';
import type { Product, ProductFile } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, Package, Search, AlertCircle, Upload, File, X, Eye, ChevronDown, ChevronUp, Image } from 'lucide-react';
import { toast } from 'sonner';

// Platform options
const PLATFORMS = ['NinjaTrader 8', 'cTrader', 'MetaTrader 5', 'TradingView', 'Python'];

// Plan types and pricing tiers
const PLAN_TYPES = ['Lifetime', 'Monthly'] as const;
const LIFETIME_PRICES = [600, 550];
const MONTHLY_PRICES = [55, 45, 35];

// Trading chart visualization SVG component for card design presets (60 presets)
const CardDesignVisualization: React.FC<{ designId: string }> = ({ designId }) => {
  // Standard candlestick data patterns
  const candlestickData = [
    { o: 60, h: 75, l: 55, c: 70, bull: true },
    { o: 70, h: 72, l: 58, c: 60, bull: false },
    { o: 60, h: 80, l: 58, c: 78, bull: true },
    { o: 78, h: 82, l: 70, c: 72, bull: false },
    { o: 72, h: 85, l: 70, c: 82, bull: true },
    { o: 82, h: 84, l: 75, c: 78, bull: false },
    { o: 78, h: 90, l: 76, c: 88, bull: true },
    { o: 88, h: 92, l: 82, c: 85, bull: false },
  ];

  // Volume data
  const volumes = [30, 45, 25, 60, 80, 40, 55, 70, 35, 50];

  switch (designId) {
    // ==================== GROUP 1: CANDLESTICK STYLES (10) ====================
    case 'candles_dark':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0a0a0a"/>
          <g stroke="#1a1a1a" strokeWidth="0.5">
            {[...Array(8)].map((_, i) => <line key={i} x1={0} y1={i*10} x2={100} y2={i*10}/>)}
            {[...Array(10)].map((_, i) => <line key={i} x1={i*10} y1={0} x2={i*10} y2={80}/>)}
          </g>
          {candlestickData.map((c, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#00d084' : '#ff4757'} strokeWidth="1.5"/>
              <rect x={8 + i * 11} y={Math.min(c.o, c.c)} width="8" height={Math.max(Math.abs(c.c - c.o), 3)} fill={c.bull ? '#00d084' : '#ff4757'}/>
            </g>
          ))}
        </svg>
      );

    case 'candles_light':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#f8f9fa"/>
          <g stroke="#dee2e6" strokeWidth="0.5">
            {[...Array(8)].map((_, i) => <line key={i} x1={0} y1={i*10} x2={100} y2={i*10}/>)}
            {[...Array(10)].map((_, i) => <line key={i} x1={i*10} y1={0} x2={i*10} y2={80}/>)}
          </g>
          {candlestickData.map((c, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#28a745' : '#dc3545'} strokeWidth="1.5"/>
              <rect x={8 + i * 11} y={Math.min(c.o, c.c)} width="8" height={Math.max(Math.abs(c.c - c.o), 3)} fill={c.bull ? '#28a745' : '#dc3545'}/>
            </g>
          ))}
        </svg>
      );

    case 'candles_neon':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <defs>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100" height="80" fill="#0d0221"/>
          {candlestickData.map((c, i) => (
            <g key={i} filter="url(#neonGlow)">
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#39ff14' : '#ff073a'} strokeWidth="2"/>
              <rect x={8 + i * 11} y={Math.min(c.o, c.c)} width="8" height={Math.max(Math.abs(c.c - c.o), 3)} fill={c.bull ? '#39ff14' : '#ff073a'}/>
            </g>
          ))}
        </svg>
      );

    case 'candles_thin':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {candlestickData.map((c, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#22c55e' : '#ef4444'} strokeWidth="0.8"/>
              <rect x={10 + i * 11} y={Math.min(c.o, c.c)} width="4" height={Math.max(Math.abs(c.c - c.o), 1)} fill={c.bull ? '#22c55e' : '#ef4444'}/>
            </g>
          ))}
        </svg>
      );

    case 'candles_wide':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#1e293b"/>
          {candlestickData.map((c, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#22c55e' : '#ef4444'} strokeWidth="1"/>
              <rect x={6 + i * 11} y={Math.min(c.o, c.c)} width="12" height={Math.max(Math.abs(c.c - c.o), 4)} fill={c.bull ? '#22c55e' : '#ef4444'} rx="1"/>
            </g>
          ))}
        </svg>
      );

    case 'candles_contrast':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#000000"/>
          {candlestickData.map((c, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#ffffff' : '#ff0000'} strokeWidth="2"/>
              <rect x={7 + i * 11} y={Math.min(c.o, c.c)} width="10" height={Math.max(Math.abs(c.c - c.o), 3)} fill={c.bull ? '#ffffff' : '#ff0000'} stroke={c.bull ? '#000' : '#fff'} strokeWidth="0.5"/>
            </g>
          ))}
        </svg>
      );

    case 'candles_pastel':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#fafafa"/>
          {candlestickData.map((c, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#a8e6cf' : '#ffb3ba'} strokeWidth="1.5"/>
              <rect x={8 + i * 11} y={Math.min(c.o, c.c)} width="8" height={Math.max(Math.abs(c.c - c.o), 3)} fill={c.bull ? '#a8e6cf' : '#ffb3ba'}/>
            </g>
          ))}
        </svg>
      );

    case 'candles_grid':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <g stroke="#334155" strokeWidth="0.8">
            {[...Array(9)].map((_, i) => <line key={`h${i}`} x1={0} y1={i*10} x2={100} y2={i*10}/>)}
            {[...Array(11)].map((_, i) => <line key={`v${i}`} x1={i*10} y1={0} x2={i*10} y2={80}/>)}
          </g>
          {candlestickData.map((c, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#22c55e' : '#ef4444'} strokeWidth="1.5"/>
              <rect x={8 + i * 11} y={Math.min(c.o, c.c)} width="8" height={Math.max(Math.abs(c.c - c.o), 3)} fill={c.bull ? '#22c55e' : '#ef4444'}/>
            </g>
          ))}
        </svg>
      );

    case 'candles_session':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="0" y="0" width="33" height="80" fill="#1e3a5f" opacity="0.3"/>
          <rect x="67" y="0" width="33" height="80" fill="#1e3a5f" opacity="0.3"/>
          <line x1="33" y1="0" x2="33" y2="80" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4,2"/>
          <line x1="67" y1="0" x2="67" y2="80" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4,2"/>
          {candlestickData.map((c, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#22c55e' : '#ef4444'} strokeWidth="1.5"/>
              <rect x={8 + i * 11} y={Math.min(c.o, c.c)} width="8" height={Math.max(Math.abs(c.c - c.o), 3)} fill={c.bull ? '#22c55e' : '#ef4444'}/>
            </g>
          ))}
        </svg>
      );

    case 'candles_vwap':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,65 25,60 40,55 55,50 70,45 85,40" fill="none" stroke="#f59e0b" strokeWidth="2"/>
          {candlestickData.map((c, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#22c55e' : '#ef4444'} strokeWidth="1.5"/>
              <rect x={8 + i * 11} y={Math.min(c.o, c.c)} width="8" height={Math.max(Math.abs(c.c - c.o), 3)} fill={c.bull ? '#22c55e' : '#ef4444'}/>
            </g>
          ))}
        </svg>
      );

    // ==================== GROUP 2: ORDERFLOW / FOOTPRINT (10) ====================
    case 'footprint_bidask':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0a0a0a"/>
          {[...Array(12)].map((_, row) => (
            <g key={row}>
              <rect x="5" y={8 + row * 6} width="42" height="5" fill={`rgba(34,197,94,${0.3 + (row % 3) * 0.2})`}/>
              <rect x="53" y={8 + row * 6} width="42" height="5" fill={`rgba(239,68,68,${0.3 + ((11-row) % 3) * 0.2})`}/>
              <text x="26" y={12 + row * 6} fill="#22c55e" fontSize="3" textAnchor="middle">{(450 + row * 10).toString()}</text>
              <text x="74" y={12 + row * 6} fill="#ef4444" fontSize="3" textAnchor="middle">{(320 - row * 8).toString()}</text>
            </g>
          ))}
          <text x="26" y="78" fill="#64748b" fontSize="4" textAnchor="middle">BID</text>
          <text x="74" y="78" fill="#64748b" fontSize="4" textAnchor="middle">ASK</text>
        </svg>
      );

    case 'footprint_delta':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0a0a0a"/>
          {[...Array(14)].map((_, row) => {
            const delta = (row % 5) - 2;
            const intensity = Math.abs(delta) / 3;
            const color = delta > 0 ? `rgba(34,197,94,${intensity})` : delta < 0 ? `rgba(239,68,68,${intensity})` : '#1a1a1a';
            return (
              <g key={row}>
                <rect x="2" y={6 + row * 5.2} width="96" height="5" fill={color}/>
                <text x="50" y={10 + row * 5.2} fill={delta > 0 ? '#22c55e' : delta < 0 ? '#ef4444' : '#64748b'} fontSize="3" textAnchor="middle">
                  {delta > 0 ? '+' : ''}{delta * 150}
                </text>
              </g>
            );
          })}
        </svg>
      );

    case 'footprint_imbalance':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0a0a0a"/>
          {[...Array(10)].map((_, row) => (
            <g key={row}>
              <rect x="5" y={10 + row * 7} width="40" height="6" fill={row % 3 === 0 ? '#22c55e' : '#1a1a1a'}/>
              <rect x="55" y={10 + row * 7} width="40" height="6" fill={row % 4 === 1 ? '#ef4444' : '#1a1a1a'}/>
              {(row % 3 === 0 || row % 4 === 1) && (
                <text x="50" y={15 + row * 7} fill="#fbbf24" fontSize="4" textAnchor="middle">!</text>
              )}
            </g>
          ))}
        </svg>
      );

    case 'footprint_absorption':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0a0a0a"/>
          {[...Array(8)].map((_, row) => (
            <g key={row}>
              <rect x="5" y={12 + row * 8} width="35" height="6" fill="#22c55e" opacity={0.3 + row * 0.08}/>
              <rect x="60" y={12 + row * 8} width="35" height="6" fill="#ef4444" opacity={0.3 + (7-row) * 0.08}/>
              <circle cx="50" cy={15 + row * 8} r="2" fill="#fbbf24" opacity={row === 3 ? 1 : 0.3}/>
            </g>
          ))}
          <text x="50" y="78" fill="#fbbf24" fontSize="4" textAnchor="middle">ABSORPTION</text>
        </svg>
      );

    case 'footprint_aggression':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0a0a0a"/>
          {[...Array(12)].map((_, row) => {
            const agg = Math.sin(row * 0.8) * 50 + 50;
            return (
              <g key={row}>
                <rect x="5" y={8 + row * 6} width={agg * 0.4} height="5" fill={agg > 60 ? '#22c55e' : '#ef4444'}/>
                <rect x={95 - (100-agg) * 0.4} y={8 + row * 6} width={(100-agg) * 0.4} height="5" fill={agg < 40 ? '#22c55e' : '#ef4444'}/>
                <text x="50" y={12 + row * 6} fill="#94a3b8" fontSize="3" textAnchor="middle">{Math.floor(agg)}%</text>
              </g>
            );
          })}
        </svg>
      );

    case 'footprint_stacked':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0a0a0a"/>
          {[...Array(6)].map((_, col) => (
            <g key={col}>
              {[...Array(8)].map((_, row) => (
                <rect key={row} x={8 + col * 15} y={12 + row * 8} width="12" height="6" 
                  fill={row < 4 ? `rgba(34,197,94,${0.2 + (3-row)*0.2})` : `rgba(239,68,68,${0.2 + (row-4)*0.2})`}/>
              ))}
            </g>
          ))}
        </svg>
      );

    case 'footprint_iceberg':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0a0a0a"/>
          {[...Array(10)].map((_, row) => (
            <g key={row}>
              <rect x="5" y={10 + row * 7} width="40" height="5" fill={row === 5 ? '#3b82f6' : '#22c55e'}/>
              <rect x="55" y={10 + row * 7} width="40" height="5" fill={row === 4 ? '#3b82f6' : '#ef4444'}/>
              {row === 5 && <polygon points="25,8 28,12 22,12" fill="#fbbf24"/>}
              {row === 4 && <polygon points="75,8 78,12 72,12" fill="#fbbf24"/>}
            </g>
          ))}
        </svg>
      );

    case 'footprint_poc':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0a0a0a"/>
          {[...Array(12)].map((_, row) => {
            const isPoc = row === 6;
            return (
              <g key={row}>
                <rect x="5" y={8 + row * 6} width={isPoc ? 50 : 30} height="5" fill={isPoc ? '#fbbf24' : '#22c55e'}/>
                <rect x={isPoc ? 60 : 40} y={8 + row * 6} width={isPoc ? 35 : 25} height="5" fill={isPoc ? '#fbbf24' : '#ef4444'}/>
                {isPoc && <text x="50" y={12 + row * 6} fill="#000" fontSize="3" textAnchor="middle" fontWeight="bold">POC</text>}
              </g>
            );
          })}
        </svg>
      );

    case 'footprint_gradient':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <defs>
            <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#064e3b"/>
              <stop offset="100%" stopColor="#22c55e"/>
            </linearGradient>
            <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7f1d1d"/>
              <stop offset="100%" stopColor="#ef4444"/>
            </linearGradient>
          </defs>
          <rect width="100" height="80" fill="#0a0a0a"/>
          {[...Array(10)].map((_, row) => (
            <g key={row}>
              <rect x="5" y={10 + row * 7} width="42" height="5" fill="url(#gradGreen)" opacity={0.3 + (row % 4) * 0.2}/>
              <rect x="53" y={10 + row * 7} width="42" height="5" fill="url(#gradRed)" opacity={0.3 + ((9-row) % 4) * 0.2}/>
            </g>
          ))}
        </svg>
      );

    case 'footprint_dom':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0a0a0a"/>
          <line x1="50" y1="5" x2="50" y2="75" stroke="#334155" strokeWidth="1"/>
          {[...Array(10)].map((_, row) => (
            <g key={row}>
              <rect x="5" y={10 + row * 6.5} width={(40 - row * 3)} height="5" fill="#22c55e" opacity={0.4 + row * 0.06}/>
              <rect x={95 - (40 - row * 3)} y={10 + row * 6.5} width={(40 - row * 3)} height="5" fill="#ef4444" opacity={0.4 + row * 0.06}/>
              <text x="50" y={14 + row * 6.5} fill={row === 5 ? '#fbbf24' : '#64748b'} fontSize="3" textAnchor="middle">{4500 + row}</text>
            </g>
          ))}
        </svg>
      );

    // ==================== GROUP 3: VOLUME & PROFILE (10) ====================
    case 'vol_basic':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <g fill="#6366f1">
            {volumes.map((v, i) => (
              <rect key={i} x={5 + i * 9.5} y={75 - v} width="7" height={v} rx="1"/>
            ))}
          </g>
        </svg>
      );

    case 'vol_colored':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {[45, 30, 55, 40, 65, 35, 50, 70, 45, 60].map((v, i) => (
            <rect key={i} x={5 + i * 9.5} y={75 - v} width="7" height={v} rx="1" fill={i % 2 === 0 ? '#22c55e' : '#ef4444'}/>
          ))}
        </svg>
      );

    case 'vol_delta':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="0" y1="40" x2="100" y2="40" stroke="#475569" strokeWidth="1"/>
          {[20, -15, 30, -10, 25, -20, 35, -15, 28, -18].map((v, i) => (
            <rect key={i} x={5 + i * 9.5} y={v > 0 ? 40 - v : 40} width="7" height={Math.abs(v)} rx="1" fill={v > 0 ? '#22c55e' : '#ef4444'}/>
          ))}
        </svg>
      );

    case 'vol_ma':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <g fill="#6366f1" opacity="0.6">
            {volumes.map((v, i) => (
              <rect key={i} x={5 + i * 9.5} y={75 - v} width="7" height={v} rx="1"/>
            ))}
          </g>
          <polyline points="8,60 18,55 28,58 38,50 48,45 58,48 68,40 78,42 88,38 95,40" fill="none" stroke="#f59e0b" strokeWidth="2"/>
        </svg>
      );

    case 'vol_spikes':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {[25, 35, 30, 75, 40, 35, 80, 45, 30, 40].map((v, i) => (
            <g key={i}>
              <rect x={5 + i * 9.5} y={75 - v} width="7" height={v} rx="1" fill={v > 60 ? '#fbbf24' : '#6366f1'}/>
              {v > 60 && <polygon points={`${8.5 + i * 9.5},${75-v-3} ${6 + i * 9.5},${75-v} ${11 + i * 9.5},${75-v}`} fill="#fbbf24"/>}
            </g>
          ))}
        </svg>
      );

    case 'vol_session':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="0" y="0" width="30" height="80" fill="#1e3a5f" opacity="0.2"/>
          <rect x="70" y="0" width="30" height="80" fill="#7c3aed" opacity="0.2"/>
          <line x1="30" y1="0" x2="30" y2="80" stroke="#3b82f6" strokeWidth="0.5"/>
          <line x1="70" y1="0" x2="70" y2="80" stroke="#a855f7" strokeWidth="0.5"/>
          {volumes.map((v, i) => (
            <rect key={i} x={5 + i * 9.5} y={75 - v} width="7" height={v} rx="1" fill={i < 3 ? '#3b82f6' : i > 6 ? '#a855f7' : '#6366f1'}/>
          ))}
        </svg>
      );

    case 'profile_right':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,60 20,55 30,58 40,48 50,50 60,42 70,45 80,38 90,40" fill="none" stroke="#64748b" strokeWidth="1"/>
          {[20, 35, 55, 75, 60, 45, 30, 40, 50, 35, 25, 30].map((w, i) => (
            <rect key={i} x={60} y={8 + i * 6} width={w * 0.5} height="4" fill="#8b5cf6" opacity="0.7"/>
          ))}
        </svg>
      );

    case 'profile_composite':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <g opacity="0.5">
            {[15, 30, 50, 70, 55, 40, 25, 35, 45, 30, 20, 25].map((w, i) => (
              <rect key={i} x={60} y={8 + i * 6} width={w * 0.5} height="4" fill="#64748b"/>
            ))}
          </g>
          {[10, 25, 45, 65, 50, 35, 20, 30, 40, 25, 15, 20].map((w, i) => (
            <rect key={i} x={60} y={8 + i * 6} width={w * 0.5} height="4" fill="#8b5cf6"/>
          ))}
        </svg>
      );

    case 'profile_poc_va':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="55" y="30" width="40" height="24" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,2"/>
          {[15, 30, 50, 75, 60, 45, 30, 40, 50, 35, 25, 30].map((w, i) => (
            <g key={i}>
              <rect x={60} y={8 + i * 6} width={w * 0.5} height="4" fill={i === 3 ? '#fbbf24' : '#8b5cf6'} opacity={i >= 3 && i <= 6 ? 1 : 0.5}/>
              {i === 3 && <text x="50" y={12 + i * 6} fill="#fbbf24" fontSize="4">POC</text>}
            </g>
          ))}
          <text x="75" y="58" fill="#3b82f6" fontSize="3" textAnchor="middle">VA</text>
        </svg>
      );

    case 'profile_liquidity':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="55" y="15" width="40" height="8" fill="#22c55e" opacity="0.3"/>
          <rect x="55" y="58" width="40" height="8" fill="#ef4444" opacity="0.3"/>
          {[20, 35, 50, 65, 55, 40, 30, 35, 45, 40, 30, 35].map((w, i) => (
            <rect key={i} x={60} y={8 + i * 6} width={w * 0.5} height="4" fill="#8b5cf6" opacity="0.7"/>
          ))}
          <text x="75" y="21" fill="#22c55e" fontSize="3" textAnchor="middle">LIQ+</text>
          <text x="75" y="64" fill="#ef4444" fontSize="3" textAnchor="middle">LIQ-</text>
        </svg>
      );

    // ==================== GROUP 4: NON-TIME BASED (10) ====================
    case 'renko_classic':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <g>
            <rect x="10" y="55" width="14" height="10" fill="#22c55e"/>
            <rect x="10" y="45" width="14" height="10" fill="#22c55e"/>
            <rect x="24" y="45" width="14" height="10" fill="#22c55e"/>
            <rect x="38" y="35" width="14" height="10" fill="#ef4444"/>
            <rect x="38" y="45" width="14" height="10" fill="#ef4444"/>
            <rect x="52" y="25" width="14" height="10" fill="#22c55e"/>
            <rect x="52" y="35" width="14" height="10" fill="#22c55e"/>
            <rect x="66" y="35" width="14" height="10" fill="#22c55e"/>
            <rect x="80" y="25" width="14" height="10" fill="#22c55e"/>
          </g>
        </svg>
      );

    case 'renko_wicks':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <g>
            <rect x="10" y="50" width="14" height="10" fill="#22c55e"/>
            <line x1="17" y1="45" x2="17" y2="50" stroke="#22c55e" strokeWidth="1"/>
            <rect x="24" y="50" width="14" height="10" fill="#22c55e"/>
            <rect x="38" y="40" width="14" height="10" fill="#ef4444"/>
            <line x1="45" y1="50" x2="45" y2="55" stroke="#ef4444" strokeWidth="1"/>
            <rect x="52" y="30" width="14" height="10" fill="#22c55e"/>
            <line x1="59" y1="25" x2="59" y2="30" stroke="#22c55e" strokeWidth="1"/>
            <rect x="66" y="30" width="14" height="10" fill="#22c55e"/>
            <rect x="80" y="20" width="14" height="10" fill="#22c55e"/>
          </g>
        </svg>
      );

    case 'renko_mean':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="0" y1="40" x2="100" y2="40" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,2"/>
          <g>
            <rect x="8" y="35" width="12" height="8" fill="#22c55e"/>
            <rect x="20" y="35" width="12" height="8" fill="#22c55e"/>
            <rect x="32" y="43" width="12" height="8" fill="#ef4444"/>
            <rect x="44" y="35" width="12" height="8" fill="#22c55e"/>
            <rect x="56" y="27" width="12" height="8" fill="#22c55e"/>
            <rect x="68" y="27" width="12" height="8" fill="#22c55e"/>
            <rect x="80" y="19" width="12" height="8" fill="#22c55e"/>
          </g>
        </svg>
      );

    case 'range_clean':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {[35, 50, 40, 55, 45, 60, 50, 52].map((y, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={y - 10} x2={12 + i * 11} y2={y + 10} stroke="#64748b" strokeWidth="0.5"/>
              <rect x={7 + i * 11} y={y - 6} width="10" height="12" fill={i % 3 === 0 ? '#ef4444' : '#22c55e'} rx="1"/>
            </g>
          ))}
        </svg>
      );

    case 'range_reversal':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {[40, 45, 50, 45, 40, 35, 40, 45].map((y, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={y - 8} x2={12 + i * 11} y2={y + 8} stroke="#64748b" strokeWidth="0.5"/>
              <rect x={7 + i * 11} y={y - 5} width="10" height="10" fill={i % 2 === 0 ? '#22c55e' : '#ef4444'} rx="1"/>
              {(i === 3 || i === 5) && <circle cx={12 + i * 11} cy={y} r="3" fill="#fbbf24"/>}
            </g>
          ))}
        </svg>
      );

    case 'tick_blocks':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <g>
            <rect x="8" y="50" width="8" height="6" fill="#22c55e"/>
            <rect x="16" y="50" width="6" height="6" fill="#22c55e"/>
            <rect x="22" y="44" width="10" height="6" fill="#22c55e"/>
            <rect x="32" y="44" width="8" height="6" fill="#22c55e"/>
            <rect x="40" y="50" width="12" height="6" fill="#ef4444"/>
            <rect x="52" y="50" width="6" height="6" fill="#ef4444"/>
            <rect x="58" y="38" width="10" height="6" fill="#22c55e"/>
            <rect x="68" y="38" width="8" height="6" fill="#22c55e"/>
            <rect x="76" y="32" width="14" height="6" fill="#22c55e"/>
          </g>
        </svg>
      );

    case 'point_figure':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <g fill="none" strokeWidth="2">
            <text x="15" y="65" fill="#22c55e" fontSize="10" fontFamily="monospace">X</text>
            <text x="25" y="55" fill="#22c55e" fontSize="10" fontFamily="monospace">X</text>
            <text x="35" y="45" fill="#22c55e" fontSize="10" fontFamily="monospace">X</text>
            <text x="45" y="45" fill="#ef4444" fontSize="10" fontFamily="monospace">O</text>
            <text x="45" y="55" fill="#ef4444" fontSize="10" fontFamily="monospace">O</text>
            <text x="55" y="35" fill="#22c55e" fontSize="10" fontFamily="monospace">X</text>
            <text x="65" y="35" fill="#22c55e" fontSize="10" fontFamily="monospace">X</text>
            <text x="75" y="25" fill="#22c55e" fontSize="10" fontFamily="monospace">X</text>
          </g>
        </svg>
      );

    case 'kagi':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,60 10,45 25,45 25,30 40,30 40,50 55,50 55,25 70,25 70,40 85,40" 
            fill="none" stroke="#22c55e" strokeWidth="2"/>
          <line x1="25" y1="45" x2="40" y2="45" stroke="#ef4444" strokeWidth="2"/>
          <line x1="55" y1="50" x2="70" y2="50" stroke="#ef4444" strokeWidth="2"/>
        </svg>
      );

    case 'line_break':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <g strokeWidth="8" strokeLinecap="butt">
            <line x1="12" y1="55" x2="22" y2="55" stroke="#22c55e"/>
            <line x1="24" y1="48" x2="34" y2="48" stroke="#22c55e"/>
            <line x1="36" y1="40" x2="46" y2="40" stroke="#22c55e"/>
            <line x1="48" y1="52" x2="58" y2="52" stroke="#ef4444"/>
            <line x1="60" y1="35" x2="70" y2="35" stroke="#22c55e"/>
            <line x1="72" y1="28" x2="82" y2="28" stroke="#22c55e"/>
            <line x1="84" y1="22" x2="94" y2="22" stroke="#22c55e"/>
          </g>
        </svg>
      );

    case 'momentum_bricks':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <defs>
            <linearGradient id="momGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e"/>
              <stop offset="100%" stopColor="#064e3b"/>
            </linearGradient>
          </defs>
          <g>
            <rect x="10" y="55" width="14" height="8" fill="url(#momGrad)"/>
            <rect x="24" y="48" width="14" height="8" fill="url(#momGrad)"/>
            <rect x="38" y="40" width="14" height="8" fill="url(#momGrad)"/>
            <rect x="52" y="32" width="14" height="8" fill="url(#momGrad)"/>
            <rect x="66" y="25" width="14" height="8" fill="url(#momGrad)"/>
            <rect x="80" y="18" width="14" height="8" fill="url(#momGrad)"/>
          </g>
        </svg>
      );

    // ==================== GROUP 5: INDICATOR OVERLAYS (10) ====================
    case 'ind_ma_cross':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,50 25,48 40,42 55,45 70,35 85,38" fill="none" stroke="#64748b" strokeWidth="1"/>
          <polyline points="10,55 25,52 40,48 55,50 70,42 85,45" fill="none" stroke="#3b82f6" strokeWidth="2"/>
          <circle cx="55" cy="50" r="3" fill="#fbbf24"/>
          <line x1="55" y1="0" x2="55" y2="80" stroke="#fbbf24" strokeWidth="0.5" strokeDasharray="2,2"/>
        </svg>
      );

    case 'ind_triple_ma':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,55 25,52 40,48 55,45 70,42 85,38" fill="none" stroke="#ef4444" strokeWidth="1.5"/>
          <polyline points="10,50 25,47 40,43 55,48 70,40 85,43" fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
          <polyline points="10,45 25,42 40,38 55,42 70,35 85,38" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
        </svg>
      );

    case 'ind_bollinger':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 10,35 Q 30,25 50,30 T 90,35" fill="none" stroke="#8b5cf6" strokeWidth="1"/>
          <path d="M 10,60 Q 30,70 50,65 T 90,60" fill="none" stroke="#8b5cf6" strokeWidth="1"/>
          <polyline points="10,48 25,46 40,50 55,47 70,52 85,49" fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
          <path d="M 10,35 Q 30,25 50,30 T 90,35 L 90,60 Q 50,65 10,60 Z" fill="#8b5cf6" opacity="0.1"/>
        </svg>
      );

    case 'ind_vwap_bands':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,55 25,52 40,48 55,45 70,40 85,35" fill="none" stroke="#f59e0b" strokeWidth="2"/>
          <polyline points="10,45 25,42 40,38 55,35 70,30 85,25" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,2"/>
          <polyline points="10,65 25,62 40,58 55,55 70,50 85,45" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2"/>
        </svg>
      );

    case 'ind_rsi':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="5" y="50" width="90" height="25" fill="#1e293b"/>
          <line x1="5" y1="58" x2="95" y2="58" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2"/>
          <line x1="5" y1="68" x2="95" y2="68" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2,2"/>
          <text x="8" y="57" fill="#ef4444" fontSize="3">70</text>
          <text x="8" y="72" fill="#22c55e" fontSize="3">30</text>
          <polyline points="8,65 20,62 32,68 44,60 56,65 68,55 80,58 92,52" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
        </svg>
      );

    case 'ind_macd':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="5" y="50" width="90" height="25" fill="#1e293b"/>
          <line x1="5" y1="62" x2="95" y2="62" stroke="#64748b" strokeWidth="0.5"/>
          <polyline points="8,60 20,58 32,62 44,55 56,60 68,52 80,55 92,50" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
          <polyline points="8,65 20,63 32,67 44,60 56,65 68,57 80,60 92,55" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2"/>
          <g>
            {[58, 62, 55, 60, 52, 55, 50, 53].map((y, i) => (
              <rect key={i} x={8 + i * 11} y={y < 62 ? y : 62} width="4" height={Math.abs(y - 62)} fill={y < 62 ? '#22c55e' : '#ef4444'}/>
            ))}
          </g>
        </svg>
      );

    case 'ind_stoch':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="5" y="50" width="90" height="25" fill="#1e293b"/>
          <line x1="5" y1="57" x2="95" y2="57" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2"/>
          <line x1="5" y1="70" x2="95" y2="70" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2,2"/>
          <text x="8" y="56" fill="#ef4444" fontSize="3">80</text>
          <text x="8" y="74" fill="#22c55e" fontSize="3">20</text>
          <polyline points="8,62 20,58 32,65 44,55 56,60 68,52 80,58 92,55" fill="none" stroke="#8b5cf6" strokeWidth="1.5"/>
          <polyline points="8,68 20,65 32,70 44,62 56,65 68,58 80,63 92,60" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2"/>
        </svg>
      );

    case 'ind_ribbon':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e'].map((color, idx) => (
            <polyline key={idx} 
              points={`10,${55-idx*3} 25,${52-idx*3} 40,${48-idx*3} 55,${50-idx*3} 70,${42-idx*3} 85,${45-idx*3}`} 
              fill="none" stroke={color} strokeWidth="1.5"/>
          ))}
        </svg>
      );

    case 'ind_sr_zones':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="0" y="20" width="100" height="12" fill="#ef4444" opacity="0.15"/>
          <rect x="0" y="50" width="100" height="12" fill="#22c55e" opacity="0.15"/>
          <line x1="0" y1="26" x2="100" y2="26" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,2"/>
          <line x1="0" y1="56" x2="100" y2="56" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,2"/>
          <polyline points="10,45 25,42 40,48 55,35 70,40 85,32" fill="none" stroke="#64748b" strokeWidth="1.5"/>
          <text x="5" y="24" fill="#ef4444" fontSize="4">R1</text>
          <text x="5" y="66" fill="#22c55e" fontSize="4">S1</text>
        </svg>
      );

    case 'ind_mtf':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,45 30,40 50,42 70,35 90,38" fill="none" stroke="#3b82f6" strokeWidth="2"/>
          <polyline points="10,50 20,48 30,50 40,45 50,47 60,42 70,44 80,40 90,42" fill="none" stroke="#22c55e" strokeWidth="1"/>
          <polyline points="10,55 15,53 25,55 35,50 45,52 55,48 65,50 75,46 85,48 95,45" fill="none" stroke="#f59e0b" strokeWidth="0.8" opacity="0.7"/>
          <text x="5" y="75" fill="#64748b" fontSize="3">D | 4H | 1H</text>
        </svg>
      );

    // ==================== GROUP 6: STRATEGY / SIGNALS (10) ====================
    case 'sig_arrows':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,50 25,45 40,48 55,38 70,42 85,32" fill="none" stroke="#64748b" strokeWidth="1"/>
          <g transform="translate(55, 38)">
            <polygon points="0,-10 -5,0 5,0" fill="#22c55e"/>
          </g>
          <g transform="translate(85, 32)">
            <polygon points="0,10 -5,0 5,0" fill="#ef4444"/>
          </g>
        </svg>
      );

    case 'sig_dots':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,50 25,45 40,48 55,38 70,42 85,32" fill="none" stroke="#64748b" strokeWidth="1"/>
          <circle cx="25" cy="45" r="3" fill="#64748b"/>
          <circle cx="40" cy="48" r="3" fill="#22c55e"/>
          <circle cx="55" cy="38" r="3" fill="#64748b"/>
          <circle cx="70" cy="42" r="3" fill="#ef4444"/>
          <circle cx="85" cy="32" r="3" fill="#22c55e"/>
        </svg>
      );

    case 'sig_breakout':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="25" y="25" width="50" height="30" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,2"/>
          <line x1="10" y1="40" x2="25" y2="40" stroke="#64748b" strokeWidth="1"/>
          <line x1="75" y1="35" x2="90" y2="30" stroke="#22c55e" strokeWidth="2"/>
          <polygon points="90,30 85,32 85,28" fill="#22c55e"/>
          <text x="35" y="60" fill="#3b82f6" fontSize="4">BREAKOUT</text>
        </svg>
      );

    case 'sig_reversal':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,30 30,30 40,40 50,40 60,50 70,50 90,60" fill="none" stroke="#64748b" strokeWidth="1"/>
          <circle cx="50" cy="40" r="4" fill="#fbbf24"/>
          <path d="M 45,55 Q 50,45 55,55" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
          <text x="50" y="72" fill="#fbbf24" fontSize="4" textAnchor="middle">REVERSAL</text>
        </svg>
      );

    case 'sig_trend_cont':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,60 30,55 50,45 70,35 90,25" fill="none" stroke="#22c55e" strokeWidth="2"/>
          <line x1="30" y1="55" x2="30" y2="70" stroke="#22c55e" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="50" y1="45" x2="50" y2="70" stroke="#22c55e" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="70" y1="35" x2="70" y2="70" stroke="#22c55e" strokeWidth="1" strokeDasharray="2,2"/>
          <polygon points="90,25 85,28 85,25 82,25" fill="#22c55e"/>
        </svg>
      );

    case 'sig_liquidity':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="10" y="20" width="80" height="8" fill="#22c55e" opacity="0.2"/>
          <rect x="10" y="55" width="80" height="8" fill="#ef4444" opacity="0.2"/>
          <line x1="10" y1="24" x2="90" y2="24" stroke="#22c55e" strokeWidth="1"/>
          <line x1="10" y1="59" x2="90" y2="59" stroke="#ef4444" strokeWidth="1"/>
          <polyline points="15,42 35,38 55,45 75,35 90,40" fill="none" stroke="#64748b" strokeWidth="1"/>
          <text x="50" y="75" fill="#64748b" fontSize="4" textAnchor="middle">LIQUIDITY</text>
        </svg>
      );

    case 'sig_orderblock':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="25" y="30" width="20" height="15" fill="#22c55e" opacity="0.3"/>
          <rect x="55" y="45" width="20" height="15" fill="#ef4444" opacity="0.3"/>
          <line x1="10" y1="37" x2="25" y2="37" stroke="#64748b" strokeWidth="1"/>
          <line x1="45" y1="52" x2="55" y2="52" stroke="#64748b" strokeWidth="1"/>
          <line x1="75" y1="52" x2="90" y2="52" stroke="#64748b" strokeWidth="1"/>
          <text x="35" y="40" fill="#22c55e" fontSize="3" textAnchor="middle">OB+</text>
          <text x="65" y="55" fill="#ef4444" fontSize="3" textAnchor="middle">OB-</text>
        </svg>
      );

    case 'sig_fvg':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="35" y="30" width="8" height="20" fill="#fbbf24" opacity="0.4"/>
          <line x1="10" y1="35" x2="35" y2="35" stroke="#64748b" strokeWidth="1"/>
          <line x1="43" y1="50" x2="90" y2="50" stroke="#64748b" strokeWidth="1"/>
          <text x="39" y="42" fill="#fbbf24" fontSize="3" textAnchor="middle">FVG</text>
          <polygon points="35,35 32,38 38,38" fill="#fbbf24"/>
          <polygon points="43,50 40,47 46,47" fill="#fbbf24"/>
        </svg>
      );

    case 'sig_trailing':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,55 25,50 40,52 55,42 70,45 85,35" fill="none" stroke="#64748b" strokeWidth="1"/>
          <polyline points="10,65 25,58 40,60 55,50 70,52 85,42" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,2"/>
          <polygon points="85,35 82,38 82,35 79,35" fill="#64748b"/>
          <text x="50" y="75" fill="#22c55e" fontSize="4" textAnchor="middle">TRAIL</text>
        </svg>
      );

    case 'sig_backtest':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,50 25,45 40,48 55,38 70,42 85,32" fill="none" stroke="#64748b" strokeWidth="1"/>
          <g>
            <rect x="15" y="60" width="12" height="8" fill="#22c55e" opacity="0.6"/>
            <rect x="30" y="55" width="12" height="8" fill="#22c55e" opacity="0.6"/>
            <rect x="45" y="62" width="12" height="8" fill="#ef4444" opacity="0.6"/>
            <rect x="60" y="58" width="12" height="8" fill="#22c55e" opacity="0.6"/>
            <rect x="75" y="52" width="12" height="8" fill="#22c55e" opacity="0.6"/>
          </g>
          <text x="50" y="78" fill="#64748b" fontSize="3" textAnchor="middle">P&L: +$1,250</text>
        </svg>
      );

    // ==================== GROUP 7: STRUCTURE (8) ====================
    case 'struct_hh':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,55 25,50 40,45 55,35 70,30 85,25" fill="none" stroke="#22c55e" strokeWidth="2"/>
          <circle cx="40" cy="45" r="3" fill="#22c55e"/>
          <circle cx="70" cy="30" r="3" fill="#22c55e"/>
          <line x1="40" y1="45" x2="70" y2="30" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2,2"/>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">HH</text>
        </svg>
      );

    case 'struct_ll':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,25 25,30 40,40 55,50 70,55 85,60" fill="none" stroke="#ef4444" strokeWidth="2"/>
          <circle cx="40" cy="40" r="3" fill="#ef4444"/>
          <circle cx="70" cy="55" r="3" fill="#ef4444"/>
          <line x1="40" y1="40" x2="70" y2="55" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2"/>
          <text x="50" y="72" fill="#ef4444" fontSize="4" textAnchor="middle">LL</text>
        </svg>
      );

    case 'struct_bos':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="10" y1="40" x2="90" y2="40" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,2"/>
          <polyline points="10,50 30,48 50,45 60,35 75,32 90,28" fill="none" stroke="#22c55e" strokeWidth="2"/>
          <polygon points="90,28 85,30 85,26" fill="#22c55e"/>
          <text x="50" y="72" fill="#3b82f6" fontSize="4" textAnchor="middle">BOS</text>
        </svg>
      );

    case 'struct_ms':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,30 25,32 40,35 50,45 60,50 75,48 90,45" fill="none" stroke="#64748b" strokeWidth="1"/>
          <circle cx="50" cy="45" r="4" fill="#fbbf24"/>
          <polyline points="55,50 70,45 85,38" fill="none" stroke="#ef4444" strokeWidth="2"/>
          <text x="50" y="72" fill="#fbbf24" fontSize="4" textAnchor="middle">MS</text>
        </svg>
      );

    case 'struct_trend':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,55 20,52 30,48 40,45 50,40 60,35 70,30 80,25 90,20" fill="none" stroke="#22c55e" strokeWidth="2.5"/>
          <line x1="30" y1="48" x2="50" y2="25" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5"/>
          <line x1="50" y1="40" x2="70" y2="17" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5"/>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">TREND</text>
        </svg>
      );

    case 'struct_compress':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="10" y1="25" x2="90" y2="25" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2"/>
          <line x1="10" y1="55" x2="90" y2="55" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,2"/>
          <polyline points="10,48 25,45 40,42 55,38 70,35 85,32" fill="none" stroke="#a855f7" strokeWidth="2"/>
          <polyline points="10,32 25,35 40,38 55,42 70,45 85,48" fill="none" stroke="#a855f7" strokeWidth="2"/>
          <text x="50" y="72" fill="#a855f7" fontSize="4" textAnchor="middle">COMPRESS</text>
        </svg>
      );

    case 'struct_expand':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="10" y1="30" x2="90" y2="30" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>
          <line x1="10" y1="50" x2="90" y2="50" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>
          <polyline points="20,40 35,38 50,35 65,30 80,22" fill="none" stroke="#22c55e" strokeWidth="2"/>
          <polyline points="20,40 35,42 50,45 65,50 80,58" fill="none" stroke="#ef4444" strokeWidth="2"/>
          <text x="50" y="72" fill="#f59e0b" fontSize="4" textAnchor="middle">EXPAND</text>
        </svg>
      );

    case 'struct_range':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="20" y="25" width="60" height="30" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3,2"/>
          <line x1="10" y1="25" x2="90" y2="25" stroke="#ef4444" strokeWidth="1"/>
          <line x1="10" y1="55" x2="90" y2="55" stroke="#22c55e" strokeWidth="1"/>
          <polyline points="15,40 30,38 45,42 60,36 75,40 90,38" fill="none" stroke="#64748b" strokeWidth="1"/>
          <text x="50" y="72" fill="#64748b" fontSize="4" textAnchor="middle">RANGE</text>
        </svg>
      );

    // ==================== GROUP 8: SMART MONEY (8) ====================
    case 'sm_liqgrab':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="10" y="20" width="80" height="8" fill="#22c55e" opacity="0.2"/>
          <line x1="10" y1="24" x2="90" y2="24" stroke="#22c55e" strokeWidth="1"/>
          <polyline points="15,45 30,42 45,48 55,30 70,35 85,32" fill="none" stroke="#64748b" strokeWidth="1"/>
          <polygon points="55,30 52,35 58,35" fill="#fbbf24"/>
          <text x="50" y="72" fill="#fbbf24" fontSize="4" textAnchor="middle">LIQ GRAB</text>
        </svg>
      );

    case 'sm_stophunt':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="10" y1="22" x2="90" y2="22" stroke="#22c55e" strokeWidth="1" strokeDasharray="2,2"/>
          <polyline points="15,35 30,32 45,28 55,22 65,28 80,35 90,45" fill="none" stroke="#ef4444" strokeWidth="2"/>
          <circle cx="55" cy="22" r="3" fill="#fbbf24"/>
          <text x="50" y="72" fill="#ef4444" fontSize="4" textAnchor="middle">STOP HUNT</text>
        </svg>
      );

    case 'sm_ob':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="30" y="25" width="25" height="20" fill="#22c55e" opacity="0.25"/>
          <rect x="30" y="25" width="25" height="20" fill="none" stroke="#22c55e" strokeWidth="1"/>
          <polyline points="10,45 30,40 55,28 80,22" fill="none" stroke="#64748b" strokeWidth="1"/>
          <text x="42" y="38" fill="#22c55e" fontSize="3" textAnchor="middle">OB</text>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">ORDER BLOCK</text>
        </svg>
      );

    case 'sm_mb':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="30" y="35" width="25" height="20" fill="#f59e0b" opacity="0.25"/>
          <rect x="30" y="35" width="25" height="20" fill="none" stroke="#f59e0b" strokeWidth="1"/>
          <polyline points="10,30 30,35 55,48 80,55" fill="none" stroke="#64748b" strokeWidth="1"/>
          <text x="42" y="48" fill="#f59e0b" fontSize="3" textAnchor="middle">MB</text>
          <text x="50" y="72" fill="#f59e0b" fontSize="4" textAnchor="middle">MITIGATION</text>
        </svg>
      );

    case 'sm_imb':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="45" y="30" width="12" height="20" fill="#a855f7" opacity="0.3"/>
          <line x1="10" y1="35" x2="45" y2="35" stroke="#64748b" strokeWidth="1"/>
          <line x1="57" y1="50" x2="90" y2="50" stroke="#64748b" strokeWidth="1"/>
          <polygon points="45,35 42,38 48,38" fill="#a855f7"/>
          <polygon points="57,50 54,47 60,47" fill="#a855f7"/>
          <text x="50" y="72" fill="#a855f7" fontSize="4" textAnchor="middle">IMBALANCE</text>
        </svg>
      );

    case 'sm_fvg':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="40" y="28" width="20" height="24" fill="#3b82f6" opacity="0.2"/>
          <rect x="40" y="28" width="20" height="24" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="10" y1="40" x2="40" y2="40" stroke="#64748b" strokeWidth="1"/>
          <line x1="60" y1="40" x2="90" y2="40" stroke="#64748b" strokeWidth="1"/>
          <text x="50" y="43" fill="#3b82f6" fontSize="3" textAnchor="middle">FVG</text>
          <text x="50" y="72" fill="#3b82f6" fontSize="4" textAnchor="middle">FAIR VALUE</text>
        </svg>
      );

    case 'sm_premium':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <defs>
            <linearGradient id="premGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          <rect x="10" y="15" width="80" height="25" fill="url(#premGrad)"/>
          <line x1="10" y1="40" x2="90" y2="40" stroke="#64748b" strokeWidth="1"/>
          <polyline points="15,50 35,45 55,35 75,25 90,20" fill="none" stroke="#ef4444" strokeWidth="1.5"/>
          <text x="50" y="72" fill="#ef4444" fontSize="4" textAnchor="middle">PREMIUM</text>
        </svg>
      );

    case 'sm_discount':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <defs>
            <linearGradient id="discGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.05"/>
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
          <rect x="10" y="40" width="80" height="25" fill="url(#discGrad)"/>
          <line x1="10" y1="40" x2="90" y2="40" stroke="#64748b" strokeWidth="1"/>
          <polyline points="15,60 35,55 55,50 75,45 90,42" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">DISCOUNT</text>
        </svg>
      );

    // ==================== GROUP 9: MOMENTUM (7) ====================
    case 'mom_impulse':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,55 25,52 40,48 55,40 70,30 85,18" fill="none" stroke="#22c55e" strokeWidth="3"/>
          <polygon points="85,18 80,22 82,25 88,22" fill="#22c55e"/>
          <g fill="#22c55e" opacity="0.3">
            <rect x="15" y="58" width="8" height="12"/>
            <rect x="30" y="52" width="8" height="18"/>
            <rect x="45" y="45" width="8" height="25"/>
            <rect x="60" y="35" width="8" height="35"/>
            <rect x="75" y="22" width="8" height="48"/>
          </g>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">IMPULSE</text>
        </svg>
      );

    case 'mom_exhaust':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,50 25,45 40,38 55,30 70,25 85,22" fill="none" stroke="#22c55e" strokeWidth="2"/>
          <polyline points="70,25 80,28 90,32" fill="none" stroke="#f59e0b" strokeWidth="2"/>
          <circle cx="85" cy="22" r="4" fill="#fbbf24"/>
          <text x="50" y="72" fill="#fbbf24" fontSize="4" textAnchor="middle">EXHAUSTION</text>
        </svg>
      );

    case 'mom_accel':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,55 25,50 40,42 55,32 70,20 90,10" fill="none" stroke="#22c55e" strokeWidth="2"/>
          <line x1="25" y1="50" x2="35" y2="30" stroke="#22c55e" strokeWidth="0.5" opacity="0.5"/>
          <line x1="40" y1="42" x2="55" y2="15" stroke="#22c55e" strokeWidth="0.5" opacity="0.5"/>
          <line x1="55" y1="32" x2="75" y2="8" stroke="#22c55e" strokeWidth="0.5" opacity="0.5"/>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">ACCEL</text>
        </svg>
      );

    case 'mom_decel':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,55 30,45 50,38 65,32 78,28 90,25" fill="none" stroke="#f59e0b" strokeWidth="2"/>
          <line x1="30" y1="45" x2="40" y2="35" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5"/>
          <line x1="50" y1="38" x2="60" y2="30" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5"/>
          <line x1="65" y1="32" x2="75" y2="26" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5"/>
          <text x="50" y="72" fill="#f59e0b" fontSize="4" textAnchor="middle">DECEL</text>
        </svg>
      );

    case 'mom_para':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 10,60 Q 30,55 50,40 Q 70,20 90,5" fill="none" stroke="#22c55e" strokeWidth="2.5"/>
          <circle cx="90" cy="5" r="4" fill="#22c55e"/>
          <g fill="#22c55e" opacity="0.2">
            <circle cx="30" cy="52" r="3"/>
            <circle cx="50" cy="38" r="4"/>
            <circle cx="70" cy="18" r="5"/>
          </g>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">PARABOLIC</text>
        </svg>
      );

    case 'mom_vol':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,45 25,42 40,40 55,35 70,38 85,45" fill="none" stroke="#64748b" strokeWidth="1"/>
          <rect x="45" y="15" width="10" height="30" fill="#a855f7" opacity="0.4"/>
          <polygon points="50,10 45,18 55,18" fill="#a855f7"/>
          <polygon points="50,50 45,42 55,42" fill="#a855f7"/>
          <text x="50" y="72" fill="#a855f7" fontSize="4" textAnchor="middle">VOL SPIKE</text>
        </svg>
      );

    case 'mom_fade':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,50 25,42 40,35 55,28 70,22 85,18" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.3"/>
          <polyline points="55,28 65,30 75,32 85,35" fill="none" stroke="#ef4444" strokeWidth="2"/>
          <polygon points="85,35 82,32 82,38" fill="#ef4444"/>
          <text x="50" y="72" fill="#ef4444" fontSize="4" textAnchor="middle">MOM FADE</text>
        </svg>
      );

    // ==================== GROUP 10: EXECUTION (8) ====================
    case 'exec_entry':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,45 30,42 50,38 70,32 90,25" fill="none" stroke="#64748b" strokeWidth="1"/>
          <circle cx="70" cy="32" r="5" fill="#22c55e" opacity="0.3"/>
          <circle cx="70" cy="32" r="3" fill="#22c55e"/>
          <polygon points="70,24 67,30 73,30" fill="#22c55e"/>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">ENTRY</text>
        </svg>
      );

    case 'exec_confirm':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,50 30,45 50,40 70,35 90,30" fill="none" stroke="#64748b" strokeWidth="1"/>
          <circle cx="70" cy="35" r="4" fill="#22c55e"/>
          <path d="M 66,35 L 69,38 L 75,30" fill="none" stroke="#fff" strokeWidth="1.5"/>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">CONFIRM</text>
        </svg>
      );

    case 'exec_retest':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="10" y1="40" x2="90" y2="40" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,2"/>
          <polyline points="10,30 30,32 50,38 60,45 75,42 90,38" fill="none" stroke="#64748b" strokeWidth="1"/>
          <circle cx="60" cy="45" r="3" fill="#fbbf24"/>
          <path d="M 57,48 L 60,52 L 63,48" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
          <text x="50" y="72" fill="#3b82f6" fontSize="4" textAnchor="middle">RETEST</text>
        </svg>
      );

    case 'exec_pullback':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,50 25,45 40,40 55,30 65,35 75,32 90,25" fill="none" stroke="#64748b" strokeWidth="1"/>
          <path d="M 55,30 Q 60,38 65,35" fill="none" stroke="#22c55e" strokeWidth="2"/>
          <polygon points="65,35 62,33 62,37" fill="#22c55e"/>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">PULLBACK</text>
        </svg>
      );

    case 'exec_breakout':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="15" y="25" width="50" height="20" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="15" y1="25" x2="90" y2="25" stroke="#ef4444" strokeWidth="1"/>
          <polyline points="15,45 35,42 55,35 75,25 90,18" fill="none" stroke="#22c55e" strokeWidth="2"/>
          <polygon points="90,18 86,22 88,25 92,21" fill="#22c55e"/>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">BREAKOUT</text>
        </svg>
      );

    case 'exec_reversal':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,30 30,28 50,32 65,40 80,50 90,60" fill="none" stroke="#64748b" strokeWidth="1"/>
          <circle cx="65" cy="40" r="4" fill="#fbbf24"/>
          <path d="M 65,36 Q 70,38 72,42" fill="none" stroke="#ef4444" strokeWidth="2"/>
          <polygon points="72,42 70,39 74,40" fill="#ef4444"/>
          <text x="50" y="72" fill="#ef4444" fontSize="4" textAnchor="middle">REVERSAL</text>
        </svg>
      );

    case 'exec_scale':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="10,50 30,45 50,38 70,30 90,22" fill="none" stroke="#22c55e" strokeWidth="1"/>
          <circle cx="40" cy="42" r="2.5" fill="#3b82f6"/>
          <circle cx="55" cy="36" r="2.5" fill="#3b82f6"/>
          <circle cx="70" cy="30" r="2.5" fill="#3b82f6"/>
          <text x="50" y="72" fill="#3b82f6" fontSize="4" textAnchor="middle">SCALE IN</text>
        </svg>
      );

    case 'exec_target':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="10" y1="25" x2="90" y2="25" stroke="#22c55e" strokeWidth="1" strokeDasharray="3,2"/>
          <polyline points="10,55 30,50 50,42 70,35 90,28" fill="none" stroke="#64748b" strokeWidth="1"/>
          <circle cx="90" cy="28" r="4" fill="#22c55e"/>
          <line x1="86" y1="25" x2="94" y2="25" stroke="#22c55e" strokeWidth="2"/>
          <line x1="90" y1="21" x2="90" y2="29" stroke="#22c55e" strokeWidth="2"/>
          <text x="50" y="72" fill="#22c55e" fontSize="4" textAnchor="middle">TAKE PROFIT</text>
        </svg>
      );

    // ==================== GROUP 11: SIGNAL WAVE (15) ====================
    case 'wave_pulse':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 10,40 Q 25,20 40,40 T 70,40 T 100,40" fill="none" stroke="#3b82f6" strokeWidth="2"/>
          <circle cx="40" cy="40" r="4" fill="#3b82f6"/>
          <circle cx="70" cy="40" r="4" fill="#3b82f6"/>
        </svg>
      );

    case 'wave_flow':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 5,45 Q 20,35 35,45 Q 50,55 65,45 Q 80,35 95,45" fill="none" stroke="#06b6d4" strokeWidth="2"/>
          <path d="M 5,50 Q 20,40 35,50 Q 50,60 65,50 Q 80,40 95,50" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.5"/>
        </svg>
      );

    case 'wave_surge':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 10,55 Q 30,50 50,35 Q 70,20 90,15" fill="none" stroke="#8b5cf6" strokeWidth="3"/>
          <path d="M 10,60 Q 30,55 50,45 Q 70,35 90,30" fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.5"/>
        </svg>
      );

    case 'wave_ripple':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <ellipse cx="50" cy="40" rx="35" ry="15" fill="none" stroke="#ec4899" strokeWidth="1"/>
          <ellipse cx="50" cy="40" rx="25" ry="10" fill="none" stroke="#ec4899" strokeWidth="1"/>
          <ellipse cx="50" cy="40" rx="15" ry="5" fill="none" stroke="#ec4899" strokeWidth="1"/>
        </svg>
      );

    case 'wave_echo':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 15,40 L 25,30 L 35,50 L 45,35 L 55,45 L 65,25 L 75,40" fill="none" stroke="#f59e0b" strokeWidth="2"/>
          <path d="M 20,50 L 30,40 L 40,60 L 50,45 L 60,55 L 70,35 L 80,50" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.4"/>
        </svg>
      );

    case 'wave_burst':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="50" y1="40" x2="20" y2="25" stroke="#ef4444" strokeWidth="2"/>
          <line x1="50" y1="40" x2="80" y2="25" stroke="#ef4444" strokeWidth="2"/>
          <line x1="50" y1="40" x2="20" y2="55" stroke="#ef4444" strokeWidth="2"/>
          <line x1="50" y1="40" x2="80" y2="55" stroke="#ef4444" strokeWidth="2"/>
          <circle cx="50" cy="40" r="6" fill="#ef4444"/>
        </svg>
      );

    case 'wave_drift':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 10,45 Q 30,42 50,40 Q 70,38 90,35" fill="none" stroke="#10b981" strokeWidth="2"/>
          <path d="M 10,50 Q 30,48 50,46 Q 70,44 90,42" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4"/>
        </svg>
      );

    case 'wave_pulse_mpo':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="15" y="35" width="8" height="15" fill="#3b82f6" opacity="0.6"/>
          <rect x="28" y="30" width="8" height="20" fill="#3b82f6"/>
          <rect x="41" y="38" width="8" height="12" fill="#3b82f6" opacity="0.6"/>
          <rect x="54" y="32" width="8" height="18" fill="#3b82f6"/>
          <rect x="67" y="36" width="8" height="14" fill="#3b82f6" opacity="0.6"/>
          <rect x="80" y="28" width="8" height="22" fill="#3b82f6"/>
        </svg>
      );

    case 'wave_flux':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 10,40 C 25,20 35,60 50,40 C 65,20 75,60 90,40" fill="none" stroke="#6366f1" strokeWidth="2"/>
          <circle cx="50" cy="40" r="3" fill="#fbbf24"/>
        </svg>
      );

    case 'wave_stream':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 5,35 Q 20,30 35,35 Q 50,40 65,35 Q 80,30 95,35" fill="none" stroke="#22d3ee" strokeWidth="2"/>
          <path d="M 5,45 Q 20,40 35,45 Q 50,50 65,45 Q 80,40 95,45" fill="none" stroke="#22d3ee" strokeWidth="2"/>
          <path d="M 5,55 Q 20,50 35,55 Q 50,60 65,55 Q 80,50 95,55" fill="none" stroke="#22d3ee" strokeWidth="2"/>
        </svg>
      );

    case 'wave_flar':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 20,50 L 35,30 L 50,50 L 65,30 L 80,50" fill="none" stroke="#f97316" strokeWidth="2"/>
          <circle cx="35" cy="30" r="4" fill="#fbbf24"/>
          <circle cx="65" cy="30" r="4" fill="#fbbf24"/>
        </svg>
      );

    case 'wave_success':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="15,50 30,45 45,35 60,40 75,30 90,25" fill="none" stroke="#22c55e" strokeWidth="2"/>
          <circle cx="90" cy="25" r="4" fill="#22c55e"/>
          <path d="M 87,25 L 90,28 L 94,22" fill="none" stroke="#fff" strokeWidth="1.5"/>
        </svg>
      );

    case 'wave_sector':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="15" y="30" width="15" height="25" fill="#64748b" opacity="0.5"/>
          <rect x="35" y="25" width="15" height="30" fill="#64748b"/>
          <rect x="55" y="35" width="15" height="20" fill="#64748b" opacity="0.5"/>
          <rect x="75" y="20" width="15" height="35" fill="#64748b"/>
        </svg>
      );

    case 'wave_oport':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 20,50 Q 35,30 50,45 Q 65,60 80,35" fill="none" stroke="#a855f7" strokeWidth="2"/>
          <circle cx="50" cy="45" r="5" fill="#fbbf24" opacity="0.8"/>
        </svg>
      );

    case 'wave_marubozu':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="20" y="30" width="12" height="25" fill="#22c55e"/>
          <rect x="38" y="25" width="12" height="30" fill="#22c55e"/>
          <rect x="56" y="35" width="12" height="20" fill="#ef4444"/>
          <rect x="74" y="28" width="12" height="27" fill="#22c55e"/>
        </svg>
      );

    // ==================== GROUP 12: CANDLESTICK PATTERNS (18) ====================
    case 'cs_bullrun':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="15" y="45" width="10" height="15" fill="#22c55e"/>
          <rect x="30" y="38" width="10" height="22" fill="#22c55e"/>
          <rect x="45" y="30" width="10" height="30" fill="#22c55e"/>
          <rect x="60" y="25" width="10" height="35" fill="#22c55e"/>
          <rect x="75" y="18" width="10" height="42" fill="#22c55e"/>
        </svg>
      );

    case 'cs_beardrop':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="15" y="20" width="10" height="35" fill="#ef4444"/>
          <rect x="30" y="28" width="10" height="30" fill="#ef4444"/>
          <rect x="45" y="35" width="10" height="25" fill="#ef4444"/>
          <rect x="60" y="42" width="10" height="20" fill="#ef4444"/>
          <rect x="75" y="50" width="10" height="15" fill="#ef4444"/>
        </svg>
      );

    case 'cs_doji':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="25" y1="30" x2="25" y2="50" stroke="#fbbf24" strokeWidth="1"/>
          <line x1="20" y1="40" x2="30" y2="40" stroke="#fbbf24" strokeWidth="3"/>
          <line x1="50" y1="25" x2="50" y2="55" stroke="#fbbf24" strokeWidth="1"/>
          <line x1="45" y1="40" x2="55" y2="40" stroke="#fbbf24" strokeWidth="2"/>
          <line x1="75" y1="32" x2="75" y2="48" stroke="#fbbf24" strokeWidth="1"/>
          <line x1="70" y1="40" x2="80" y2="40" stroke="#fbbf24" strokeWidth="3"/>
        </svg>
      );

    case 'cs_hammer':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="25" y1="20" x2="25" y2="50" stroke="#22c55e" strokeWidth="1"/>
          <rect x="20" y="45" width="10" height="10" fill="#22c55e"/>
          <line x1="50" y1="25" x2="50" y2="55" stroke="#22c55e" strokeWidth="1"/>
          <rect x="45" y="50" width="10" height="8" fill="#22c55e"/>
          <line x1="75" y1="22" x2="75" y2="52" stroke="#22c55e" strokeWidth="1"/>
          <rect x="70" y="48" width="10" height="7" fill="#22c55e"/>
        </svg>
      );

    case 'cs_engulfing':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="20" y="35" width="12" height="15" fill="#ef4444"/>
          <rect x="36" y="30" width="16" height="25" fill="#22c55e"/>
          <rect x="58" y="32" width="12" height="18" fill="#22c55e"/>
          <rect x="74" y="28" width="16" height="28" fill="#ef4444"/>
        </svg>
      );

    case 'cs_footprints':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {[...Array(8)].map((_, row) => (
            <g key={row}>
              <rect x="15" y={15 + row * 7} width="20" height="5" fill="#22c55e" opacity={0.3 + (row % 3) * 0.2}/>
              <rect x="40" y={15 + row * 7} width="20" height="5" fill="#ef4444" opacity={0.3 + ((7-row) % 3) * 0.2}/>
              <rect x="65" y={15 + row * 7} width="20" height="5" fill="#3b82f6" opacity={0.3 + (row % 4) * 0.15}/>
            </g>
          ))}
        </svg>
      );

    case 'cs_morning':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="18" y="35" width="10" height="20" fill="#ef4444"/>
          <rect x="33" y="40" width="10" height="12" fill="#64748b"/>
          <rect x="48" y="30" width="10" height="22" fill="#22c55e"/>
          <rect x="63" y="25" width="10" height="28" fill="#22c55e"/>
          <rect x="78" y="20" width="10" height="32" fill="#22c55e"/>
        </svg>
      );

    case 'cs_evening':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="18" y="20" width="10" height="30" fill="#22c55e"/>
          <rect x="33" y="25" width="10" height="25" fill="#22c55e"/>
          <rect x="48" y="35" width="10" height="15" fill="#64748b"/>
          <rect x="63" y="40" width="10" height="18" fill="#ef4444"/>
          <rect x="78" y="45" width="10" height="15" fill="#ef4444"/>
        </svg>
      );

    case 'cs_crows':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="18" y="25" width="10" height="25" fill="#ef4444"/>
          <line x1="23" y1="20" x2="23" y2="55" stroke="#ef4444" strokeWidth="1"/>
          <rect x="38" y="30" width="10" height="22" fill="#ef4444"/>
          <line x1="43" y1="25" x2="43" y2="57" stroke="#ef4444" strokeWidth="1"/>
          <rect x="58" y="35" width="10" height="20" fill="#ef4444"/>
          <line x1="63" y1="30" x2="63" y2="60" stroke="#ef4444" strokeWidth="1"/>
        </svg>
      );

    case 'cs_marubozu':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="15" y="40" width="15" height="18" fill="#22c55e"/>
          <rect x="35" y="32" width="15" height="26" fill="#22c55e"/>
          <rect x="55" y="45" width="15" height="15" fill="#ef4444"/>
          <rect x="75" y="28" width="15" height="30" fill="#22c55e"/>
        </svg>
      );

    case 'cs_berning':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="20" y="30" width="12" height="22" fill="#ef4444"/>
          <rect x="38" y="38" width="12" height="12" fill="#64748b"/>
          <rect x="56" y="42" width="12" height="16" fill="#ef4444"/>
          <rect x="74" y="48" width="12" height="12" fill="#ef4444"/>
        </svg>
      );

    case 'cs_soldiers':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="18" y="40" width="10" height="18" fill="#22c55e"/>
          <line x1="23" y1="35" x2="23" y2="62" stroke="#22c55e" strokeWidth="1"/>
          <rect x="38" y="35" width="10" height="22" fill="#22c55e"/>
          <line x1="43" y1="28" x2="43" y2="62" stroke="#22c55e" strokeWidth="1"/>
          <rect x="58" y="30" width="10" height="26" fill="#22c55e"/>
          <line x1="63" y1="22" x2="63" y2="62" stroke="#22c55e" strokeWidth="1"/>
        </svg>
      );

    case 'cs_reap':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 20,50 Q 35,30 50,45 Q 65,60 80,35" fill="none" stroke="#a855f7" strokeWidth="2"/>
          <polygon points="80,35 77,40 83,40" fill="#a855f7"/>
        </svg>
      );

    case 'cs_pernarigns':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="15" y="35" width="8" height="15" fill="#22c55e" opacity="0.6"/>
          <rect x="28" y="30" width="8" height="20" fill="#ef4444" opacity="0.6"/>
          <rect x="41" y="38" width="8" height="12" fill="#22c55e" opacity="0.6"/>
          <rect x="54" y="32" width="8" height="18" fill="#ef4444" opacity="0.6"/>
          <rect x="67" y="36" width="8" height="14" fill="#22c55e" opacity="0.6"/>
          <rect x="80" y="28" width="8" height="22" fill="#ef4444" opacity="0.6"/>
        </svg>
      );

    case 'cs_cbv':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="15,50 30,45 45,48 60,40 75,42 90,35" fill="none" stroke="#06b6d4" strokeWidth="2"/>
          <g fill="#06b6d4" opacity="0.5">
            <rect x="15" y="50" width="8" height="12"/>
            <rect x="30" y="45" width="8" height="17"/>
            <rect x="45" y="48" width="8" height="14"/>
            <rect x="60" y="40" width="8" height="22"/>
            <rect x="75" y="42" width="8" height="20"/>
          </g>
        </svg>
      );

    case 'cs_cci':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="10" y1="40" x2="90" y2="40" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2,2"/>
          <polyline points="15,45 30,50 45,35 60,45 75,30 90,40" fill="none" stroke="#f97316" strokeWidth="2"/>
          <circle cx="45" cy="35" r="3" fill="#fbbf24"/>
          <circle cx="75" cy="30" r="3" fill="#fbbf24"/>
        </svg>
      );

    case 'cs_stochheat':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <defs>
            <linearGradient id="stochGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e"/>
              <stop offset="50%" stopColor="#fbbf24"/>
              <stop offset="100%" stopColor="#ef4444"/>
            </linearGradient>
          </defs>
          <rect x="15" y="30" width="70" height="20" fill="url(#stochGrad)" opacity="0.4"/>
          <polyline points="15,40 30,38 45,42 60,35 75,40 90,36" fill="none" stroke="#fbbf24" strokeWidth="2"/>
        </svg>
      );

    case 'cs_tdi':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="10" y="25" width="80" height="30" fill="#1e293b"/>
          <line x1="10" y1="32" x2="90" y2="32" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2"/>
          <line x1="10" y1="48" x2="90" y2="48" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2,2"/>
          <polyline points="15,40 30,38 45,42 60,36 75,40 90,34" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
          <polyline points="15,44 30,42 45,46 60,40 75,44 90,38" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2"/>
        </svg>
      );

    // ==================== GROUP 13: MOMENTUM INDICATORS (9) ====================
    case 'mom_maplh':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="15,50 30,45 45,48 60,40 75,42 90,35" fill="none" stroke="#8b5cf6" strokeWidth="2"/>
          <g fill="#8b5cf6" opacity="0.4">
            <rect x="15" y="50" width="10" height="15"/>
            <rect x="30" y="45" width="10" height="20"/>
            <rect x="45" y="48" width="10" height="17"/>
            <rect x="60" y="40" width="10" height="25"/>
            <rect x="75" y="42" width="10" height="23"/>
          </g>
        </svg>
      );

    case 'mom_maoman':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="15,55 30,50 45,52 60,45 75,48 90,40" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
          <polyline points="15,48 30,43 45,45 60,38 75,41 90,33" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
          <polyline points="15,62 30,57 45,59 60,52 75,55 90,47" fill="none" stroke="#ef4444" strokeWidth="1.5"/>
        </svg>
      );

    case 'mom_t3':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 15,45 Q 30,35 45,42 Q 60,50 75,38 Q 90,25 95,30" fill="none" stroke="#06b6d4" strokeWidth="2"/>
          <circle cx="45" cy="42" r="3" fill="#fbbf24"/>
        </svg>
      );

    case 'mom_r3':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 15,40 C 30,30 40,50 55,40 C 70,30 80,50 95,35" fill="none" stroke="#ec4899" strokeWidth="2"/>
          <path d="M 15,50 C 30,40 40,60 55,50 C 70,40 80,60 95,45" fill="none" stroke="#ec4899" strokeWidth="1.5" opacity="0.6"/>
          <path d="M 15,60 C 30,50 40,70 55,60 C 70,50 80,70 95,55" fill="none" stroke="#ec4899" strokeWidth="1" opacity="0.4"/>
        </svg>
      );

    case 'mom_rsi_heat':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {[...Array(10)].map((_, i) => (
            <rect key={i} x={12 + i * 8} y={20} width="6" height="40" fill={i < 3 ? '#22c55e' : i < 7 ? '#fbbf24' : '#ef4444'} opacity={0.4 + (i % 3) * 0.2}/>
          ))}
        </svg>
      );

    case 'mom_atr':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="15" y="30" width="8" height="25" fill="#f59e0b" opacity="0.5"/>
          <rect x="28" y="25" width="8" height="35" fill="#f59e0b"/>
          <rect x="41" y="35" width="8" height="20" fill="#f59e0b" opacity="0.5"/>
          <rect x="54" y="22" width="8" height="38" fill="#f59e0b"/>
          <rect x="67" y="32" width="8" height="22" fill="#f59e0b" opacity="0.5"/>
          <rect x="80" y="28" width="8" height="30" fill="#f59e0b"/>
        </svg>
      );

    case 'mom_rri':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <ellipse cx="35" cy="40" rx="20" ry="12" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5"/>
          <ellipse cx="50" cy="40" rx="25" ry="15" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.4"/>
          <ellipse cx="65" cy="40" rx="20" ry="12" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.5"/>
          <polyline points="20,45 35,40 50,42 65,38 80,40" fill="none" stroke="#a855f7" strokeWidth="1.5"/>
        </svg>
      );

    case 'mom_momentatic':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 15,50 L 30,35 L 45,45 L 60,25 L 75,40 L 90,20" fill="none" stroke="#22c55e" strokeWidth="2.5"/>
          <polygon points="90,20 85,25 88,28 93,23" fill="#22c55e"/>
        </svg>
      );

    case 'mom_cbvflow':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="15,45 30,42 45,46 60,38 75,42 90,35" fill="none" stroke="#06b6d4" strokeWidth="2"/>
          <g fill="#06b6d4" opacity="0.3">
            <rect x="15" y="45" width="10" height="18"/>
            <rect x="30" y="42" width="10" height="21"/>
            <rect x="45" y="46" width="10" height="17"/>
            <rect x="60" y="38" width="10" height="25"/>
            <rect x="75" y="42" width="10" height="21"/>
          </g>
        </svg>
      );

    // ==================== GROUP 14: VOLUME ANALYSIS (9) ====================
    case 'vol_rsi':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="15,50 30,45 45,48 60,40 75,42 90,35" fill="none" stroke="#8b5cf6" strokeWidth="2"/>
          <polyline points="15,55 30,52 45,55 60,48 75,50 90,45" fill="none" stroke="#22c55e" strokeWidth="1"/>
        </svg>
      );

    case 'vol_aple':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 15,40 Q 30,30 45,40 Q 60,50 75,35 Q 90,20 95,30" fill="none" stroke="#ec4899" strokeWidth="2"/>
          <path d="M 15,50 Q 30,40 45,50 Q 60,60 75,45 Q 90,30 95,40" fill="none" stroke="#ec4899" strokeWidth="1.5" opacity="0.5"/>
        </svg>
      );

    case 'vol_t2':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="15" y="38" width="10" height="15" fill="#f59e0b" opacity="0.5"/>
          <rect x="30" y="32" width="10" height="22" fill="#f59e0b"/>
          <rect x="45" y="40" width="10" height="14" fill="#f59e0b" opacity="0.5"/>
          <rect x="60" y="28" width="10" height="26" fill="#f59e0b"/>
          <rect x="75" y="36" width="10" height="16" fill="#f59e0b" opacity="0.5"/>
        </svg>
      );

    case 'vol_bertmap':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {[...Array(6)].map((_, i) => (
            <g key={i}>
              <rect x={15 + i * 14} y={25} width="10" height="30" fill="none" stroke="#64748b" strokeWidth="0.5"/>
              <rect x={15 + i * 14} y={30 + i * 2} width="10" height={20 - i * 3} fill="#3b82f6" opacity={0.3 + i * 0.1}/>
            </g>
          ))}
        </svg>
      );

    case 'vol_tick':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <g stroke="#22c55e" strokeWidth="1">
            <line x1="20" y1="40" x2="20" y2="50"/>
            <line x1="35" y1="35" x2="35" y2="55"/>
            <line x1="50" y1="30" x2="50" y2="60"/>
            <line x1="65" y1="38" x2="65" y2="52"/>
            <line x1="80" y1="42" x2="80" y2="48"/>
          </g>
        </svg>
      );

    case 'vol_rbv':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="55" y="20" width="30" height="40" fill="#1e293b"/>
          {[15, 25, 35, 45, 55].map((y, i) => (
            <rect key={i} x={55} y={y} width={20 + i * 3} height="6" fill="#ef4444" opacity={0.4 + i * 0.1}/>
          ))}
          <polyline points="15,50 30,48 45,45 60,42 75,40" fill="none" stroke="#64748b" strokeWidth="1"/>
        </svg>
      );

    case 'vol_pivot':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="50" y1="15" x2="50" y2="65" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,2"/>
          <line x1="20" y1="40" x2="80" y2="40" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,2"/>
          <circle cx="50" cy="40" r="5" fill="#fbbf24" opacity="0.5"/>
          <text x="50" y="43" fill="#000" fontSize="4" textAnchor="middle" fontWeight="bold">P</text>
        </svg>
      );

    case 'vol_ema_cross':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="15,50 30,47 45,49 60,42 75,45 90,38" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
          <polyline points="15,55 30,52 45,54 60,48 75,50 90,45" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
          <circle cx="60" cy="45" r="3" fill="#fbbf24"/>
        </svg>
      );

    case 'vol_vwap_zones':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="10" y1="30" x2="90" y2="30" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2,2"/>
          <line x1="10" y1="40" x2="90" y2="40" stroke="#fbbf24" strokeWidth="1"/>
          <line x1="10" y1="50" x2="90" y2="50" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2,2"/>
          <polyline points="15,45 30,43 45,46 60,40 75,43 90,38" fill="none" stroke="#64748b" strokeWidth="1"/>
        </svg>
      );

    // ==================== GROUP 15: TECHNICAL STUDIES (9) ====================
    case 'tech_wpor':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 20,50 Q 35,35 50,45 Q 65,55 80,30" fill="none" stroke="#8b5cf6" strokeWidth="2"/>
          <path d="M 20,55 Q 35,40 50,50 Q 65,60 80,35" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.5"/>
          <circle cx="50" cy="45" r="3" fill="#fbbf24"/>
        </svg>
      );

    case 'tech_pcccm':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="20" y="30" width="15" height="25" fill="#22c55e" opacity="0.4"/>
          <rect x="42" y="25" width="15" height="30" fill="#ef4444" opacity="0.4"/>
          <rect x="64" y="35" width="15" height="20" fill="#22c55e" opacity="0.4"/>
        </svg>
      );

    case 'tech_obv':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <polyline points="15,50 30,48 45,45 60,42 75,38 90,35" fill="none" stroke="#06b6d4" strokeWidth="2"/>
          <g fill="#06b6d4" opacity="0.3">
            <rect x="15" y="50" width="10" height="15"/>
            <rect x="30" y="48" width="10" height="17"/>
            <rect x="45" y="45" width="10" height="20"/>
            <rect x="60" y="42" width="10" height="23"/>
            <rect x="75" y="38" width="10" height="27"/>
          </g>
        </svg>
      );

    case 'tech_keltner':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 15,30 Q 35,25 55,30 Q 75,35 95,28" fill="none" stroke="#a855f7" strokeWidth="1"/>
          <path d="M 15,50 Q 35,45 55,50 Q 75,55 95,48" fill="none" stroke="#a855f7" strokeWidth="1"/>
          <polyline points="15,40 35,38 55,42 75,38 95,40" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
        </svg>
      );

    case 'tech_bollinger':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <path d="M 15,25 Q 35,20 55,25 Q 75,30 95,22" fill="none" stroke="#64748b" strokeWidth="1"/>
          <path d="M 15,55 Q 35,60 55,55 Q 75,50 95,58" fill="none" stroke="#64748b" strokeWidth="1"/>
          <polyline points="15,40 35,38 55,42 75,36 95,40" fill="none" stroke="#3b82f6" strokeWidth="1.5"/>
        </svg>
      );

    case 'tech_heikin':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="18" y="35" width="10" height="12" fill="#22c55e" opacity="0.7"/>
          <rect x="33" y="30" width="10" height="15" fill="#22c55e" opacity="0.7"/>
          <rect x="48" y="38" width="10" height="10" fill="#ef4444" opacity="0.7"/>
          <rect x="63" y="32" width="10" height="14" fill="#22c55e" opacity="0.7"/>
          <rect x="78" y="28" width="10" height="16" fill="#22c55e" opacity="0.7"/>
        </svg>
      );

    case 'tech_fokinger':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <rect x="15" y="25" width="70" height="12" fill="#ef4444" opacity="0.15"/>
          <rect x="15" y="43" width="70" height="12" fill="#22c55e" opacity="0.15"/>
          <line x1="15" y1="31" x2="85" y2="31" stroke="#ef4444" strokeWidth="0.5"/>
          <line x1="15" y1="49" x2="85" y2="49" stroke="#22c55e" strokeWidth="0.5"/>
          <polyline points="20,40 35,38 50,42 65,36 80,40" fill="none" stroke="#64748b" strokeWidth="1"/>
        </svg>
      );

    case 'tech_fidancici':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          <line x1="30" y1="15" x2="30" y2="65" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2,2"/>
          <line x1="50" y1="15" x2="50" y2="65" stroke="#fbbf24" strokeWidth="1"/>
          <line x1="70" y1="15" x2="70" y2="65" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2,2"/>
          <polyline points="20,45 35,42 50,48 65,38 80,42" fill="none" stroke="#64748b" strokeWidth="1"/>
        </svg>
      );

    case 'tech_ma_ribbon':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4'].map((color, idx) => (
            <polyline key={idx} 
              points={`15,${50-idx*2} 30,${47-idx*2} 45,${49-idx*2} 60,${44-idx*2} 75,${46-idx*2} 90,${40-idx*2}`} 
              fill="none" stroke={color} strokeWidth="1"/>
          ))}
        </svg>
      );

    // Legacy presets fallback (for backward compatibility)
    case 'candlestick_chart':
    case 'clean_candles':
    case 'orderflow_footprint':
    case 'volume_bars':
    case 'volume_profile':
    case 'renko_blocks':
    case 'range_bars':
    case 'dom_depth':
    case 'indicator_overlay':
    case 'strategy_signals':
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#0f172a"/>
          {candlestickData.map((c, i) => (
            <g key={i}>
              <line x1={12 + i * 11} y1={c.l} x2={12 + i * 11} y2={c.h} stroke={c.bull ? '#22c55e' : '#ef4444'} strokeWidth="1"/>
              <rect x={8 + i * 11} y={Math.min(c.o, c.c)} width="8" height={Math.max(Math.abs(c.c - c.o), 2)} fill={c.bull ? '#22c55e' : '#ef4444'}/>
            </g>
          ))}
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 80" className="w-full h-full">
          <rect width="100" height="80" fill="#1f2937"/>
          <text x="50" y="42" fill="#64748b" fontSize="6" textAnchor="middle">{designId.slice(0, 8)}</text>
        </svg>
      );
  }
};

// Accepted image types
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

// Accepted file types for product files
const ACCEPTED_FILE_TYPES = ['.zip', '.rar', '.pdf', '.txt', '.dll', '.ex5', '.cs'];

interface ProductFormData {
  name: string;
  platform: string;
  plan_type: 'Lifetime' | 'Monthly' | '';
  price: string;
  description: string;
  short_description: string;
  long_description: string;
  image_url: string;
  card_design: string;
  modules: string[];
}

const initialFormData: ProductFormData = {
  name: '',
  platform: '',
  plan_type: '',
  price: '',
  description: '',
  short_description: '',
  long_description: '',
  image_url: '',
  card_design: '',
  modules: [],
};

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productFiles, setProductFiles] = useState<ProductFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  
  // Gallery images state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  // Section expansion state
  const [isCardSectionOpen, setIsCardSectionOpen] = useState(true);
  const [isDetailsSectionOpen, setIsDetailsSectionOpen] = useState(false);

  // Get available prices based on plan type
  const availablePrices = formData.plan_type === 'Lifetime' ? LIFETIME_PRICES : 
                         formData.plan_type === 'Monthly' ? MONTHLY_PRICES : [];

  // Initial load with loading spinner
  const loadProducts = async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setHasError(true);
      setProducts([]);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Silent refresh without loading spinner (used after mutations)
  const refreshProducts = async () => {
    setIsRefreshing(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to refresh products');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      (product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product?.platform || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setImagePreview('');
    setSelectedImageFile(null);
    setSelectedFiles([]);
    setGalleryImages([]);
    setSelectedGalleryFiles([]);
    setIsCardSectionOpen(true);
    setIsDetailsSectionOpen(false);
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenView = async (product: Product) => {
    setViewingProduct(product);
    setIsViewDialogOpen(true);
    setIsLoadingFiles(true);
    try {
      const files = await getProductFiles(product.id);
      setProductFiles(files);
    } catch (err) {
      toast.error('Failed to load product files');
      setProductFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please select a valid image file (PNG, JPG, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setSelectedImageFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file extensions
    const validFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return ACCEPTED_FILE_TYPES.includes(ext);
    });

    if (validFiles.length !== files.length) {
      toast.error(`Some files were rejected. Accepted types: ${ACCEPTED_FILE_TYPES.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Gallery image handlers
  const handleGalleryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total limit
    const currentCount = galleryImages.length + selectedGalleryFiles.length;
    const remainingSlots = 6 - currentCount;
    
    if (remainingSlots <= 0) {
      toast.error('Maximum 6 gallery images allowed');
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    // Validate file types
    const validFiles = filesToAdd.filter(file => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds 2MB limit`);
        return false;
      }
      return true;
    });

    setSelectedGalleryFiles(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setGalleryImages(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setSelectedGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = "";
      let galleryUrls: string[] = [];

      // Upload card image if selected
      if (selectedImageFile) {
        setIsUploadingImage(true);
        try {
          imageUrl = await uploadProductImage(selectedImageFile);
        } catch (err) {
          toast.error('Failed to upload card image');
          setIsUploadingImage(false);
          setIsSubmitting(false);
          return;
        }
        setIsUploadingImage(false);
      }

      // Upload gallery images if selected - wait for ALL to complete before creating product
      if (selectedGalleryFiles.length > 0) {
        setIsUploadingGallery(true);
        try {
          // Upload each gallery image individually and wait for all to complete
          const uploadPromises = selectedGalleryFiles.map(file => uploadProductImage(file));
          galleryUrls = await Promise.all(uploadPromises);
        } catch (err) {
          toast.error('Failed to upload gallery images. Product not created.');
          setIsUploadingGallery(false);
          setIsSubmitting(false);
          return; // Do NOT create product if any gallery upload fails
        }
        setIsUploadingGallery(false);
      }

      // Create product with uploaded image URLs
      const API_BASE = "https://api.fluidtradingsystems.com";
      const res = await fetch(API_BASE + "/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer owner_session"
        },
        body: JSON.stringify({
          name: formData.name,
          platform: formData.platform,
          price: parseFloat(formData.price),
          short_description: formData.short_description,
          long_description: formData.long_description,
          image_url: imageUrl,
          gallery_images: galleryUrls.length > 0 ? galleryUrls : (imageUrl ? [imageUrl] : []),
          plan_type: formData.plan_type.toLowerCase() || null,
          price_tier: null,
          enabled: 1
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to create product' }));
        throw new Error(errorData.error || errorData.message || 'Failed to create product');
      }

      const newProduct = await res.json();
      toast.success('Product created successfully');

      // Upload product files if any (these are attached to the product after creation)
      if (selectedFiles.length > 0 && newProduct?.product?.id) {
        try {
          await uploadProductFiles(newProduct.product.id, selectedFiles);
          toast.success(`${selectedFiles.length} file(s) uploaded`);
        } catch (err) {
          toast.error('Some files failed to upload');
        }
      }

      setIsDialogOpen(false);
      // Reset form
      setFormData(initialFormData);
      setImagePreview('');
      setSelectedImageFile(null);
      setSelectedFiles([]);
      setGalleryImages([]);
      setSelectedGalleryFiles([]);
      // Refresh data from API
      await refreshProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
      setIsUploadingGallery(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct(deletingProduct.id);
      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingProduct(null);
      // Refresh data from API
      await refreshProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!viewingProduct) return;

    try {
      await deleteProductFile(viewingProduct.id, fileId);
      toast.success('File deleted');
      // Refresh files
      const files = await getProductFiles(viewingProduct.id);
      setProductFiles(files);
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number' || isNaN(price)) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {hasError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">Failed to load data</p>
            <p className="text-red-400/70 text-sm">Could not fetch products from the server.</p>
          </div>
          <Button onClick={loadProducts} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-slate-400 mt-1">Manage your trading software products</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
              />
            </div>
            <div className="text-slate-400 text-sm flex items-center gap-2">
              {isRefreshing && <Loader2 className="h-3 w-3 animate-spin" />}
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
              <p className="text-slate-400">Fetching data...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No products found</h3>
              <p className="text-slate-500 mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new product'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Product</TableHead>
                    <TableHead className="text-slate-400">Platform</TableHead>
                    <TableHead className="text-slate-400">Price</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product?.id || Math.random()} className="border-slate-800">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product?.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product?.name || 'Product'}
                              className="h-12 w-12 rounded-lg object-cover bg-slate-800"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '';
                                (e.target as HTMLImageElement).className = 'h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center';
                              }}
                            />
                          ) : product?.card_design ? (
                            <div className="h-12 w-12 rounded-lg overflow-hidden">
                              <CardDesignVisualization designId={product.card_design} />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center">
                              <Package className="h-5 w-5 text-slate-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">{product?.name || 'Unnamed Product'}</div>
                            <div className="text-sm text-slate-500 truncate max-w-xs">
                              {product?.description || ''}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                          {product?.platform || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {formatPrice(product?.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => product && handleOpenView(product)}
                            className="text-slate-400 hover:text-blue-400 hover:bg-blue-950/50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => product && handleOpenDelete(product)}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-950/50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a new trading software product
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              
              {/* SECTION 1: Product Card (Listing View) */}
              <Collapsible open={isCardSectionOpen} onOpenChange={setIsCardSectionOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                    <div>
                      <h3 className="font-semibold text-white">Product Card (Listing View)</h3>
                      <p className="text-xs text-slate-400">Controls how the product appears in the storefront grid</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="text-slate-400">
                      {isCardSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Pro Trader Suite"
                      className="bg-slate-950 border-slate-700 text-white"
                      required
                    />
                  </div>

                  {/* Platform Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="platform" className="text-slate-300">
                      Platform *
                    </Label>
                    <select
                      id="platform"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select a platform</option>
                      {PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plan Type Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="plan_type" className="text-slate-300">
                      Plan Type *
                    </Label>
                    <select
                      id="plan_type"
                      value={formData.plan_type}
                      onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as 'Lifetime' | 'Monthly', price: '' })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select plan type</option>
                      {PLAN_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-2">
                    <Label htmlFor="short_description" className="text-slate-300">
                      Short Description *
                    </Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Brief description for product card"
                      className="bg-slate-950 border-slate-700 text-white"
                      required
                    />
                  </div>

                  {/* Product Card Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Product Card Image</Label>
                    <p className="text-xs text-slate-500">PNG, JPG, WebP • Max 2MB</p>
                    
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageSelect}
                      accept=".png,.jpg,.jpeg,.webp"
                      className="hidden"
                    />
                    
                    {!imagePreview ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full border-dashed border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Card Image
                      </Button>
                    ) : (
                      <div className="relative">
                        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setImagePreview('');
                            setSelectedImageFile(null);
                            if (imageInputRef.current) imageInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* SECTION 2: Product Details (Product Page) */}
              <Collapsible open={isDetailsSectionOpen} onOpenChange={setIsDetailsSectionOpen}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                    <div>
                      <h3 className="font-semibold text-white">Product Details (Product Page)</h3>
                      <p className="text-xs text-slate-400">Controls the detailed product information and screenshots</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="text-slate-400">
                      {isDetailsSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  {/* Product Name (auto-filled but editable) */}
                  <div className="space-y-2">
                    <Label htmlFor="detail_name" className="text-slate-300">
                      Product Name
                    </Label>
                    <Input
                      id="detail_name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Product name"
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                  </div>

                  {/* Platform (auto-filled) */}
                  <div className="space-y-2">
                    <Label htmlFor="detail_platform" className="text-slate-300">
                      Platform
                    </Label>
                    <select
                      id="detail_platform"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Select a platform</option>
                      {PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plan Type (auto-filled) */}
                  <div className="space-y-2">
                    <Label htmlFor="detail_plan_type" className="text-slate-300">
                      Plan Type
                    </Label>
                    <select
                      id="detail_plan_type"
                      value={formData.plan_type}
                      onChange={(e) => setFormData({ ...formData, plan_type: e.target.value as 'Lifetime' | 'Monthly', price: '' })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                    >
                      <option value="">Select plan type</option>
                      {PLAN_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Tier Selector */}
                  {formData.plan_type && (
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-slate-300">
                        Price *
                      </Label>
                      <select
                        id="price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 py-2"
                        required
                      >
                        <option value="">Select a price</option>
                        {availablePrices.map((price) => (
                          <option key={price} value={price}>
                            ${price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Long Description */}
                  <div className="space-y-2">
                    <Label htmlFor="long_description" className="text-slate-300">
                      Long Description
                    </Label>
                    <Textarea
                      id="long_description"
                      value={formData.long_description}
                      onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                      placeholder="Detailed product description for the product page"
                      className="bg-slate-950 border-slate-700 text-white min-h-[100px]"
                    />
                  </div>

                  {/* Display Gallery Upload */}
                  <div className="space-y-2">
                    <Label className="text-slate-300">Display Gallery</Label>
                    <p className="text-xs text-slate-500">PNG, JPG, WebP • Max 2MB each • Max 6 images</p>
                    
                    <input
                      type="file"
                      ref={galleryInputRef}
                      onChange={handleGalleryImageSelect}
                      accept=".png,.jpg,.jpeg,.webp"
                      multiple
                      className="hidden"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={galleryImages.length >= 6}
                      className="w-full border-dashed border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Add Gallery Images ({galleryImages.length}/6)
                    </Button>

                    {/* Gallery Preview Grid */}
                    {galleryImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {galleryImages.map((img, index) => (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
                            <img
                              src={img}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Product Files Section */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <Label className="text-slate-300">Product Files</Label>
                <p className="text-xs text-slate-500">ZIP, RAR, PDF, TXT, DLL, EX5, CS</p>
                
                <input
                  type="file"
                  ref={filesInputRef}
                  onChange={handleFilesSelect}
                  accept=".zip,.rar,.pdf,.txt,.dll,.ex5,.cs"
                  multiple
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => filesInputRef.current?.click()}
                  className="w-full border-dashed border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <File className="h-4 w-4 mr-2" />
                  Add Files
                </Button>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-950 rounded-md px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <File className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <span className="text-sm text-slate-300 truncate">{file.name}</span>
                          <span className="text-xs text-slate-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedFile(index)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImage || isUploadingGallery}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {(isSubmitting || isUploadingImage || isUploadingGallery) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingProduct?.name}</DialogTitle>
            <DialogDescription className="text-slate-400">
              Product details and files
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Product Image */}
            {viewingProduct?.image_url && (
              <div className="space-y-2">
                <Label className="text-slate-300">Product Image</Label>
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
                  <img
                    src={viewingProduct.image_url}
                    alt={viewingProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500 text-xs">Platform</Label>
                <p className="text-white">{viewingProduct?.platform}</p>
              </div>
              <div>
                <Label className="text-slate-500 text-xs">Price</Label>
                <p className="text-white">{formatPrice(viewingProduct?.price || 0)}</p>
              </div>
            </div>

            <div>
              <Label className="text-slate-500 text-xs">Description</Label>
              <p className="text-slate-300 text-sm">{viewingProduct?.description}</p>
            </div>

            {/* Product Files */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <Label className="text-slate-300">Product Files</Label>
              
              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                </div>
              ) : productFiles.length === 0 ? (
                <p className="text-slate-500 text-sm">No files attached</p>
              ) : (
                <div className="space-y-2">
                  {productFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-slate-950 rounded-md px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <File className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <span className="text-sm text-slate-300 truncate">{file.file_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Download
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
