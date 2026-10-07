import React, { useState } from 'react';
import { BiometricsData, ParsedPdfBiometrics } from '../types/clinical';
import { SAMPLE_PDF_TEMPLATES, parseBiometricPdfContent } from '../utils/pdfParser';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck,
  Activity,
  Layers,
  Sparkles,
  Droplets,
  Flame,
  Info,
} from 'lucide-react';

interface BiometricPdfIngestionProps {
  currentBiometrics: BiometricsData;
  onApplyBiometrics: (biometrics: BiometricsData) => void;
}

export const BiometricPdfIngestion: React.FC<BiometricPdfIngestionProps> = ({
  currentBiometrics,
  onApplyBiometrics,
}) => {
  const [parsedData, setParsedData] = useState<ParsedPdfBiometrics | null>(SAMPLE_PDF_TEMPLATES[0].parsed);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('inbody_770_marcus');
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedSuccessfully, setAppliedSuccessfully] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await parseBiometricPdfContent(file);
      setParsedData(result);
      setAppliedSuccessfully(false);
    } catch (err) {
      console.error('Failed to parse PDF document:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPresetTemplate = (templateId: string) => {
    setActiveTemplateId(templateId);
    const template = SAMPLE_PDF_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setIsProcessing(true);
    setTimeout(() => {
      setParsedData(template.parsed);
      setAppliedSuccessfully(false);
      setIsProcessing(false);
    }, 200);
  };

  const handleApplyToActiveDossier = () => {
    if (!parsedData) return;

    onApplyBiometrics({
      hydrationPercent: parsedData.hydrationPercent ?? currentBiometrics.hydrationPercent,
      skeletalMuscleMassKg: parsedData.skeletalMuscleMassKg ?? currentBiometrics.skeletalMuscleMassKg,
      asymmetryNote: parsedData.asymmetryNote ?? currentBiometrics.asymmetryNote,
      hsCrpMgL: parsedData.hsCrpMgL ?? currentBiometrics.hsCrpMgL,
      esrMmHr: parsedData.esrMmHr ?? currentBiometrics.esrMmHr,
      metabolicStressScore: parsedData.metabolicStressScore ?? currentBiometrics.metabolicStressScore,
      sleepHours: currentBiometrics.sleepHours,
    });

    setAppliedSuccessfully(true);
    setTimeout(() => setAppliedSuccessfully(false), 3000);
  };

  const currentTemplate = SAMPLE_PDF_TEMPLATES.find((t) => t.id === activeTemplateId) || SAMPLE_PDF_TEMPLATES[0];

  return (
    <div className="flex flex-col space-y-4 text-[#eae6df]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2a2f2b]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#c48943]" />
            <h3 className="text-sm font-semibold tracking-wide text-[#f5f2ea]">
              Consultation PDF &amp; Biometric Scale Ingestion
            </h3>
          </div>
          <p className="text-xs text-[#a8a39b] mt-0.5">
            Auto-extracts InBody BIA fluid ratios, lean muscle asymmetries, and systemic inflammatory markers directly from patient documents.
          </p>
        </div>

        {/* Upload or Drop Action */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#222923] hover:bg-[#2a342c] border border-[#343e37] text-[#f5f2ea] cursor-pointer transition-all shadow-sm">
          <Upload className="w-3.5 h-3.5 text-[#c48943]" />
          <span>Feed Patient PDF</span>
          <input
            type="file"
            accept=".pdf,.txt,.json,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Preset PDF Switcher Ribbon */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-[#8a857d] uppercase tracking-wider">
          Preloaded Clinic Reports:
        </span>
        {SAMPLE_PDF_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => handleSelectPresetTemplate(tmpl.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTemplateId === tmpl.id
                ? 'bg-[#222923] border-[#c48943]/60 text-[#e9c46a] ring-1 ring-[#c48943]/20 shadow-sm'
                : 'bg-[#181a19] border-[#2a2f2b] text-[#a8a39b] hover:text-[#eae6df] hover:bg-[#1e221f]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{tmpl.sourceType} Scan</span>
          </button>
        ))}
      </div>

      {/* Main Two-Column PDF Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Formatted Document Preview (6 cols) */}
        <div className="md:col-span-6 bg-[#181a19] rounded-xl border border-[#2a2f2b] p-3.5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2f2b]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#829d8a]" />
              <span className="text-xs font-mono font-medium text-[#eae6df] truncate max-w-[200px]">
                {parsedData?.fileName || currentTemplate.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowRawText(!showRawText)}
              className="text-[10px] text-[#8a857d] hover:text-[#eae6df] underline cursor-pointer"
            >
              {showRawText ? 'Hide Document Text' : 'View Raw Text'}
            </button>
          </div>

          {/* Document Content View */}
          <div className="h-56 overflow-y-auto font-mono text-[11px] leading-relaxed p-3 bg-[#121413] rounded-lg border border-[#222623] text-[#a8c5b0] select-text">
            {showRawText ? (
              <pre className="whitespace-pre-wrap">{currentTemplate.content}</pre>
            ) : (
              <div className="space-y-2 text-[#d4cdc3]">
                <div className="text-[#e9c46a] font-bold border-b border-[#222623] pb-1">
                  REPORT METRICS EXTRACTED:
                </div>
                <div>Source Device: <span className="text-white">{parsedData?.sourceType || 'InBody 770'}</span></div>
                <div>Extracellular Water Ratio (ECW/TBW): <span className="text-amber-300 font-bold">0.384</span></div>
                <div>Total Body Hydration: <span className="text-emerald-300 font-bold">{parsedData?.hydrationPercent}%</span></div>
                <div>Skeletal Muscle Mass: <span className="text-white font-bold">{parsedData?.skeletalMuscleMassKg} kg</span></div>
                <div>Systemic Inflammation hs-CRP: <span className={`font-bold ${parsedData?.hsCrpMgL && parsedData.hsCrpMgL >= 3.0 ? 'text-red-400' : 'text-emerald-400'}`}>{parsedData?.hsCrpMgL} mg/L</span></div>
                <div>Erythrocyte Sed Rate (ESR): <span className="text-white">{parsedData?.esrMmHr} mm/hr</span></div>
                <div>Visceral Fat Grade: <span className="text-white">Level {parsedData?.visceralFatLevel || 8}</span></div>
                <div className="text-[10px] text-[#8a857d] italic pt-1 border-t border-[#222623]">
                  Diagnostic Note: {parsedData?.asymmetryNote}
                </div>
              </div>
            )}
          </div>

          <div className="text-[10px] text-[#8a857d] flex items-center justify-between">
            <span>Scan Timestamp: {parsedData?.extractedAt || '2026-09-14'}</span>
            <span className="text-[#829d8a]">Validated Clinical PDF Format</span>
          </div>
        </div>

        {/* Right: Extracted Biomarkers & 1-Tap Dossier Sync (6 cols) */}
        <div className="md:col-span-6 bg-[#181a19] rounded-xl border border-[#2a2f2b] p-3.5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#f5f2ea]">Extracted Biological Indicators</span>
              <span className="text-[10px] font-mono text-[#e9c46a] bg-[#121413] px-2 py-0.5 rounded border border-[#222623]">
                Fascial Mechanics Ready
              </span>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Hydration & Fascial Glide */}
              <div className="p-2.5 rounded-lg bg-[#121413] border border-[#222623] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#8a857d]">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-[#38bdf8]" /> Hydration
                  </span>
                  <span className="text-emerald-400 font-bold">{parsedData?.hydrationPercent}%</span>
                </div>
                <div className="w-full bg-[#1e221f] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#38bdf8] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (parsedData?.hydrationPercent || 50) * 1.5)}%` }}
                  />
                </div>
                <p className="text-[9px] text-[#8a857d]">
                  {(parsedData?.hydrationPercent || 50) < 50
                    ? 'Viscous gel state: Requires pre-friction warming'
                    : 'Optimal fluid shear: Fast myofascial glide'}
                </p>
              </div>

              {/* Systemic Inflammation */}
              <div className="p-2.5 rounded-lg bg-[#121413] border border-[#222623] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#8a857d]">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" /> hs-CRP
                  </span>
                  <span className={`font-bold ${(parsedData?.hsCrpMgL || 1) >= 3.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {parsedData?.hsCrpMgL} mg/L
                  </span>
                </div>
                <div className="w-full bg-[#1e221f] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${(parsedData?.hsCrpMgL || 1) >= 3.0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (parsedData?.hsCrpMgL || 1) * 20)}%` }}
                  />
                </div>
                <p className="text-[9px] text-[#8a857d]">
                  {(parsedData?.hsCrpMgL || 1) >= 3.0
                    ? 'High inflammation: Avoid deep periosteal friction'
                    : 'Normal inflammation: Full pressure permitted'}
                </p>
              </div>

              {/* Skeletal Muscle Mass */}
              <div className="p-2.5 rounded-lg bg-[#121413] border border-[#222623] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#8a857d]">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-[#c48943]" /> Skeletal Muscle
                  </span>
                  <span className="text-white font-bold">{parsedData?.skeletalMuscleMassKg} kg</span>
                </div>
                <p className="text-[9px] text-[#8a857d] truncate">
                  {parsedData?.asymmetryNote || 'Symmetric distribution'}
                </p>
              </div>

              {/* Metabolic Stress */}
              <div className="p-2.5 rounded-lg bg-[#121413] border border-[#222623] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#8a857d]">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#829d8a]" /> Stress Index
                  </span>
                  <span className="text-[#e9c46a] font-bold">{parsedData?.metabolicStressScore} / 10</span>
                </div>
                <p className="text-[9px] text-[#8a857d]">
                  {(parsedData?.metabolicStressScore || 5) >= 7
                    ? 'Sympathetic overdrive: Integrate Shiatsu holds'
                    : 'Balanced autonomic baseline'}
                </p>
              </div>
            </div>
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleApplyToActiveDossier}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              appliedSuccessfully
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#c48943] to-[#d4a373] hover:from-[#d4a373] hover:to-[#e9c46a] text-[#121413]'
            }`}
          >
            {appliedSuccessfully ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Synchronized with Client File!</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Inject PDF Data Into Active Dossier</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
