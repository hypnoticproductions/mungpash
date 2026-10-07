import React, { useState } from 'react';
import { AnalysisResult } from '../types/clinical';
import { Code, Copy, Check, Download, Layers, Sparkles } from 'lucide-react';

interface PayloadInspectorProps {
  analysis: AnalysisResult | null;
}

export const PayloadInspector: React.FC<PayloadInspectorProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'raw'>('json');

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[#181a19] rounded-2xl border border-[#2a2f2b]">
        <Code className="w-10 h-10 text-[#c48943]/40 mb-3" />
        <h3 className="text-base font-semibold text-[#eae6df]">No JSON Payload Active</h3>
        <p className="text-xs text-[#a8a39b] max-w-md mt-1">
          Synthesize a clinical protocol to inspect the strict JSON payload feeding the animated model, floating icons, and table timers.
        </p>
      </div>
    );
  }

  const jsonString = JSON.stringify(analysis.payloadJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `somatic-protocol-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col bg-[#181a19] rounded-2xl border border-[#2a2f2b] shadow-2xl backdrop-blur-md overflow-hidden text-[#eae6df]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2f2b] bg-[#141615]">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#c48943]">
            PART 2: ANIMATED MODEL &amp; UI PAYLOAD
          </span>
          <span className="text-xs text-[#8a857d] font-mono">
            Source: {analysis.source}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#121413] p-0.5 rounded-lg border border-[#222623] mr-2">
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                activeTab === 'json' ? 'bg-[#222923] text-[#e9c46a]' : 'text-[#8a857d]'
              }`}
            >
              Strict JSON Payload
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                activeTab === 'raw' ? 'bg-[#222923] text-[#e9c46a]' : 'text-[#8a857d]'
              }`}
            >
              Raw Model Output
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e221f] border border-[#2a2f2b] text-[#a8a39b] hover:text-[#eae6df] transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e221f] border border-[#2a2f2b] text-[#a8a39b] hover:text-[#eae6df] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Inspector Content */}
      <div className="p-5 max-h-[calc(100vh-280px)] overflow-y-auto font-mono text-xs leading-relaxed">
        {activeTab === 'json' ? (
          <pre className="p-4 rounded-xl bg-[#121413] text-[#a8c5b0] border border-[#222623] overflow-x-auto text-[11px] selection:bg-[#c48943]/30">
            {jsonString}
          </pre>
        ) : (
          <div className="p-4 rounded-xl bg-[#121413] text-[#d4cdc3] border border-[#222623] whitespace-pre-wrap text-[11px]">
            {analysis.rawText}
          </div>
        )}
      </div>
    </div>
  );
};
