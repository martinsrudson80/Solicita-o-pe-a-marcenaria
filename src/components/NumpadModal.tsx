import React, { useState, useEffect } from 'react';
import { Delete, X, Calculator, Plus, Minus, Equal, ArrowRight } from 'lucide-react';

interface NumpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue: number;
  onConfirm: (val: number) => void;
  unidade?: string;
}

export const NumpadModal: React.FC<NumpadModalProps> = ({
  isOpen,
  onClose,
  title,
  initialValue,
  onConfirm,
  unidade = 'mm',
}) => {
  // Expressão matemática digitada pelo usuário (ex: "800 - 18 - 18")
  const [expressao, setExpressao] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setExpressao(initialValue > 0 ? String(initialValue) : '');
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  // Avaliação segura da expressão matemática
  const calcularResultado = (expr: string): number => {
    if (!expr.trim()) return 0;
    try {
      // Normaliza operadores visuais para operadores aritméticos
      const normalizado = expr.replace(/×/g, '*').replace(/÷/g, '/');
      if (!/^[\d\s+\-*/.]+$/.test(normalizado)) {
        return parseInt(expr, 10) || 0;
      }
      // Remove operadores soltos no final da expressão (ex: "800 - ")
      const limpo = normalizado.replace(/[+\-*/.\s]+$/, '');
      if (!limpo) return 0;
      
      const res = Function(`"use strict"; return (${limpo})`)();
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        return Math.max(0, Math.round(res));
      }
      return parseInt(expr, 10) || 0;
    } catch {
      return parseInt(expr, 10) || 0;
    }
  };

  const resultadoAtual = calcularResultado(expressao);

  const handleDigito = (d: string) => {
    setExpressao((prev) => (prev === '0' ? d : prev + d));
  };

  const handleOperador = (op: string) => {
    setExpressao((prev) => {
      if (!prev.trim()) return '';
      // Se já termina com um operador, substitui pelo novo
      const semOperadorFinal = prev.replace(/[+\-×÷\s]+$/, '');
      return `${semOperadorFinal} ${op} `;
    });
  };

  const handleLimpar = () => {
    setExpressao('');
  };

  const handleBackspace = () => {
    setExpressao((prev) => {
      const trimmed = prev.trimEnd();
      return trimmed.slice(0, -1).trimEnd();
    });
  };


  const handleAplicarIgual = () => {
    const final = calcularResultado(expressao);
    setExpressao(String(final));
  };

  const handleConfirmar = () => {
    const final = calcularResultado(expressao);
    onConfirm(final);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header do Módulo Oficina */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calculator size={14} />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold block">{title}</span>
              <span className="text-[10px] text-amber-400 font-mono">
                Calculadora de Desconto & Ajuste de Medida
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Visor Duplo: Expressão Matemática e Resultado da Medida Final */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Cálculo / Desconto</span>
            <span>Resultado Final</span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            {/* Expressão digitada */}
            <div className="font-mono text-sm text-slate-600 truncate max-w-[50%]">
              {expressao || 'Digite a medida'}
            </div>

            {/* Resultado Final Calculado em Destaque */}
            <div className="flex items-baseline justify-end gap-1.5 font-mono text-right">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                {resultadoAtual}
              </span>
              <span className="text-base font-bold text-amber-700">{unidade}</span>
            </div>
          </div>
        </div>



        {/* Teclado Completo da Calculadora de Oficina */}
        <div className="p-3">
          <div className="grid grid-cols-4 gap-2">
            {/* Linha 1 */}
            <button
              type="button"
              onClick={handleLimpar}
              className="h-12 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center"
            >
              LIMPAR
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center"
            >
              <Delete size={20} />
            </button>
            <button
              type="button"
              onClick={() => handleOperador('÷')}
              className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-lg rounded-xl border border-slate-200 transition-colors flex items-center justify-center"
            >
              ÷
            </button>
            <button
              type="button"
              onClick={() => handleOperador('×')}
              className="h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-lg rounded-xl border border-slate-200 transition-colors flex items-center justify-center"
            >
              ×
            </button>

            {/* Linha 2 */}
            <button
              type="button"
              onClick={() => handleDigito('7')}
              className="h-13 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleDigito('8')}
              className="h-13 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleDigito('9')}
              className="h-13 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleOperador('-')}
              className="h-13 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-2xl rounded-xl border border-amber-300 transition-colors flex items-center justify-center shadow-2xs"
              title="Desconto / Subtrair"
            >
              <Minus size={20} />
            </button>

            {/* Linha 3 */}
            <button
              type="button"
              onClick={() => handleDigito('4')}
              className="h-13 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleDigito('5')}
              className="h-13 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleDigito('6')}
              className="h-13 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleOperador('+')}
              className="h-13 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-2xl rounded-xl border border-amber-300 transition-colors flex items-center justify-center shadow-2xs"
              title="Adicionar / Somar"
            >
              <Plus size={20} />
            </button>

            {/* Linha 4 */}
            <button
              type="button"
              onClick={() => handleDigito('1')}
              className="h-13 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleDigito('2')}
              className="h-13 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleDigito('3')}
              className="h-13 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              3
            </button>
            <button
              type="button"
              onClick={handleAplicarIgual}
              className="h-13 bg-slate-900 hover:bg-black text-white font-bold text-xl rounded-xl border border-slate-900 transition-colors flex items-center justify-center shadow-2xs"
              title="Calcular resultado"
            >
              <Equal size={20} />
            </button>

            {/* Linha 5 */}
            <button
              type="button"
              onClick={() => handleDigito('0')}
              className="col-span-2 h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-xl rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleDigito('00')}
              className="col-span-2 h-12 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-base rounded-xl shadow-2xs flex items-center justify-center font-mono"
            >
              00
            </button>
          </div>



          {/* BOTÃO DE CONFIRMAR A MEDIDA FINAL DESEJADA (SOLICITADO PELO USUÁRIO) */}
          <button
            type="button"
            onClick={handleConfirmar}
            className="w-full mt-3 py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>CONFIRMAR MEDIDA FINAL</span>
            <span className="bg-amber-800/80 px-2.5 py-0.5 rounded-lg font-mono text-sm">
              {resultadoAtual} {unidade}
            </span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
