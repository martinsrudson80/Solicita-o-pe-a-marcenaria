import { TemaId } from '../types';

export interface TemaConfig {
  id: TemaId;
  nome: string;
  descricao: string;
  previewCor: string;
  accentCor: string;
  classes: {
    primaryBg: string;
    primaryHover: string;
    primaryText: string;
    primaryBorder: string;
    accentBg: string;
    headerBg: string;
    headerText: string;
    badgeBg: string;
    ringFocus: string;
    buttonPrimary: string;
  };
}

export const TEMAS: Record<TemaId, TemaConfig> = {
  azul: {
    id: 'azul',
    nome: 'Azul Marceneiro',
    descricao: 'Visual profissional de engenharia e marcenaria técnica',
    previewCor: '#1e40af',
    accentCor: '#3b82f6',
    classes: {
      primaryBg: 'bg-blue-700',
      primaryHover: 'hover:bg-blue-800',
      primaryText: 'text-blue-700',
      primaryBorder: 'border-blue-700',
      accentBg: 'bg-blue-50',
      headerBg: 'bg-slate-900 border-b border-slate-800',
      headerText: 'text-white',
      badgeBg: 'bg-blue-100 text-blue-800',
      ringFocus: 'focus:ring-blue-500',
      buttonPrimary: 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm',
    },
  },
  grafite: {
    id: 'grafite',
    nome: 'Grafite Elegante',
    descricao: 'Estilo sóbrio, contemporâneo e industrial',
    previewCor: '#334155',
    accentCor: '#0284c7',
    classes: {
      primaryBg: 'bg-slate-800',
      primaryHover: 'hover:bg-slate-900',
      primaryText: 'text-slate-800',
      primaryBorder: 'border-slate-800',
      accentBg: 'bg-slate-100',
      headerBg: 'bg-slate-950 border-b border-slate-800',
      headerText: 'text-white',
      badgeBg: 'bg-slate-200 text-slate-800',
      ringFocus: 'focus:ring-slate-500',
      buttonPrimary: 'bg-slate-900 hover:bg-black text-white shadow-sm',
    },
  },
  madeira: {
    id: 'madeira',
    nome: 'Madeira / Laranja',
    descricao: 'Tons quentes que remetem ao cedro, freijó e marcenaria artesanal',
    previewCor: '#c2410c',
    accentCor: '#f97316',
    classes: {
      primaryBg: 'bg-amber-800',
      primaryHover: 'hover:bg-amber-900',
      primaryText: 'text-amber-800',
      primaryBorder: 'border-amber-800',
      accentBg: 'bg-amber-50',
      headerBg: 'bg-stone-900 border-b border-stone-800',
      headerText: 'text-white',
      badgeBg: 'bg-amber-100 text-amber-900',
      ringFocus: 'focus:ring-amber-600',
      buttonPrimary: 'bg-amber-700 hover:bg-amber-800 text-white shadow-sm',
    },
  },
  verde: {
    id: 'verde',
    nome: 'Verde Oficina',
    descricao: 'Ambiente de chão de fábrica, produção e sustentabilidade',
    previewCor: '#15803d',
    accentCor: '#22c55e',
    classes: {
      primaryBg: 'bg-emerald-700',
      primaryHover: 'hover:bg-emerald-800',
      primaryText: 'text-emerald-700',
      primaryBorder: 'border-emerald-700',
      accentBg: 'bg-emerald-50',
      headerBg: 'bg-zinc-900 border-b border-zinc-800',
      headerText: 'text-white',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      ringFocus: 'focus:ring-emerald-600',
      buttonPrimary: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm',
    },
  },
  escuro: {
    id: 'escuro',
    nome: 'Tema Escuro (Dark Mode)',
    descricao: 'Alto contraste para ambientes com pouca luz ou telas OLED',
    previewCor: '#0f172a',
    accentCor: '#eab308',
    classes: {
      primaryBg: 'bg-amber-600',
      primaryHover: 'hover:bg-amber-700',
      primaryText: 'text-amber-500',
      primaryBorder: 'border-amber-600',
      accentBg: 'bg-slate-800',
      headerBg: 'bg-black border-b border-zinc-800',
      headerText: 'text-white',
      badgeBg: 'bg-zinc-800 text-amber-400',
      ringFocus: 'focus:ring-amber-500',
      buttonPrimary: 'bg-amber-600 hover:bg-amber-500 text-black font-semibold shadow-sm',
    },
  },
};
