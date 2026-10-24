import React from 'react';
import { FitagemBorda } from '../types';

interface PecaFitagemVisualizerProps {
  fitagem: FitagemBorda;
  onChange: (fitagem: FitagemBorda) => void;
  comprimentoMm: number;
  larguraMm: number;
  espessuraMm: number;
  corPadrao: string;
  fitaEspessura: string;
  readOnly?: boolean;
}

export const PecaFitagemVisualizer: React.FC<PecaFitagemVisualizerProps> = ({
  fitagem,
  onChange,
  comprimentoMm,
  larguraMm,
  espessuraMm,
  corPadrao,
  fitaEspessura,
  readOnly = false,
}) => {
  const toggleLado = (lado: keyof FitagemBorda) => {
    if (readOnly) return;
    onChange({
      ...fitagem,
      [lado]: !fitagem[lado],
    });
  };

  const aplicarPredefinicao = (tipo: 'todas' | 'nenhuma') => {
    if (readOnly) return;
    if (tipo === 'todas') {
      onChange({ c1: true, c2: true, l1: true, l2: true });
    } else if (tipo === 'nenhuma') {
      onChange({ c1: false, c2: false, l1: false, l2: false });
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Esquema de Fitagem de Borda (C1, C2, L1, L2)
          </span>
          <p className="text-[11px] text-slate-500">
            Clique nos lados ou nos botões para ativar/desativar a fita de borda
          </p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => aplicarPredefinicao('todas')}
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            >
              4 Bordas
            </button>
            <button
              type="button"
              onClick={() => aplicarPredefinicao('nenhuma')}
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            >
              Sem Fita
            </button>
          </div>
        )}
      </div>

      {/* Visualizador 2D da Chapa com Grid Sem Sobreposição */}
      <div className="w-full max-w-md mx-auto grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-2 items-center justify-items-center select-none py-1">
        {/* Borda Superior: C1 (Comprimento 1) */}
        <div className="col-start-2 row-start-1 w-full flex justify-center">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => toggleLado('c1')}
            className={`w-full max-w-[210px] text-xs font-bold py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 border-2 shadow-2xs cursor-pointer ${
              fitagem.c1
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <span>C1 (Comprimento 1)</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${fitagem.c1 ? 'bg-amber-700 text-amber-100' : 'bg-slate-200 text-slate-600'}`}>
              {fitagem.c1 ? '✓ Fitado' : 'Sem fita'}
            </span>
          </button>
        </div>

        {/* Chapa MDF Central */}
        <div
          className="col-start-2 row-start-2 w-full h-32 sm:h-36 bg-amber-50/90 rounded-xl border-2 border-slate-300 flex flex-col items-center justify-center text-center p-2 relative shadow-inner overflow-hidden transition-all"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1.2px, transparent 1.2px)`,
            backgroundSize: '14px 14px',
          }}
        >
          {/* Bordas destacadas clicáveis diretamente no MDF */}
          <div
            onClick={() => toggleLado('c1')}
            className={`absolute top-0 left-0 right-0 h-2.5 transition-all cursor-pointer z-10 ${
              fitagem.c1 ? 'bg-amber-600 shadow-xs' : 'bg-transparent hover:bg-slate-300/40'
            }`}
            title="C1 - Comprimento 1"
          />
          <div
            onClick={() => toggleLado('c2')}
            className={`absolute bottom-0 left-0 right-0 h-2.5 transition-all cursor-pointer z-10 ${
              fitagem.c2 ? 'bg-amber-600 shadow-xs' : 'bg-transparent hover:bg-slate-300/40'
            }`}
            title="C2 - Comprimento 2"
          />
          <div
            onClick={() => toggleLado('l1')}
            className={`absolute top-0 bottom-0 left-0 w-2.5 transition-all cursor-pointer z-10 ${
              fitagem.l1 ? 'bg-amber-600 shadow-xs' : 'bg-transparent hover:bg-slate-300/40'
            }`}
            title="L1 - Largura 1"
          />
          <div
            onClick={() => toggleLado('l2')}
            className={`absolute top-0 bottom-0 right-0 w-2.5 transition-all cursor-pointer z-10 ${
              fitagem.l2 ? 'bg-amber-600 shadow-xs' : 'bg-transparent hover:bg-slate-300/40'
            }`}
            title="L2 - Largura 2"
          />

          <div className="z-10 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-lg border border-slate-200 shadow-xs max-w-[95%]">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block font-mono leading-tight">
              {comprimentoMm || 0} mm × {larguraMm || 0} mm
            </span>
            <span className="text-[11px] font-semibold text-slate-600 block mt-0.5 leading-tight">
              {corPadrao || 'MDF'} ({espessuraMm || 18} mm)
            </span>
          </div>
        </div>

        {/* Borda Esquerda: L1 (Largura 1) */}
        <div className="col-start-1 row-start-2 h-full flex items-center justify-center">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => toggleLado('l1')}
            className={`h-24 sm:h-28 px-1.5 py-1 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center justify-center border-2 shadow-2xs cursor-pointer ${
              fitagem.l1
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <span className="rotate-180" style={{ writingMode: 'vertical-lr' }}>
              L1 (Largura 1)
            </span>
            <span className={`text-[9px] font-semibold mt-1 px-1 py-0.2 rounded ${fitagem.l1 ? 'bg-amber-700 text-amber-100' : 'bg-slate-200 text-slate-600'}`}>
              {fitagem.l1 ? '✓' : '—'}
            </span>
          </button>
        </div>

        {/* Borda Direita: L2 (Largura 2) */}
        <div className="col-start-3 row-start-2 h-full flex items-center justify-center">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => toggleLado('l2')}
            className={`h-24 sm:h-28 px-1.5 py-1 text-[11px] font-bold rounded-lg transition-all flex flex-col items-center justify-center border-2 shadow-2xs cursor-pointer ${
              fitagem.l2
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <span style={{ writingMode: 'vertical-rl' }}>
              L2 (Largura 2)
            </span>
            <span className={`text-[9px] font-semibold mt-1 px-1 py-0.2 rounded ${fitagem.l2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-200 text-slate-600'}`}>
              {fitagem.l2 ? '✓' : '—'}
            </span>
          </button>
        </div>

        {/* Borda Inferior: C2 (Comprimento 2) */}
        <div className="col-start-2 row-start-3 w-full flex justify-center">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => toggleLado('c2')}
            className={`w-full max-w-[210px] text-xs font-bold py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 border-2 shadow-2xs cursor-pointer ${
              fitagem.c2
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <span>C2 (Comprimento 2)</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${fitagem.c2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-200 text-slate-600'}`}>
              {fitagem.c2 ? '✓ Fitado' : 'Sem fita'}
            </span>
          </button>
        </div>
      </div>

      {/* Resumo da fitagem */}
      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div>
          <span className="font-semibold text-slate-700">Fitagem Ativa: </span>
          <span className="font-medium text-slate-900">
            {[
              fitagem.c1 && 'C1',
              fitagem.c2 && 'C2',
              fitagem.l1 && 'L1',
              fitagem.l2 && 'L2',
            ]
              .filter(Boolean)
              .join(' + ') || 'Nenhuma borda selecionada'}
          </span>
        </div>
      </div>
    </div>
  );
};
