import React, { useState } from 'react';
import { AnalysisResult, TreatmentStep } from '../types/clinical';
import {
  ShieldAlert,
  Clock,
  Play,
  Copy,
  Check,
  Printer,
  ChevronRight,
  Flame,
  Activity,
  Compass,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface GlanceCardViewProps {
  analysis: AnalysisResult | null;
  onOpenTableMode: () => void;
  onOpenPubMedModal?: () => void;
}

export const GlanceCardView: React.FC<GlanceCardViewProps> = ({
  analysis,
  onOpenTableMode,
  onOpenPubMedModal,
}) => {
  const [copied, setCopied] = useState(false);

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[#181a19] rounded-2xl border border-[#2a2f2b]">
        <Sparkles className="w-10 h-10 text-[#c48943]/40 mb-3 animate-pulse" />
        <h3 className="text-base font-semibold text-[#eae6df]">No Clinical Protocol Generated Yet</h3>
        <p className="text-xs text-[#a8a39b] max-w-md mt-1">
          Adjust the multimodal intake dossier and click &quot;Synthesize Protocol &amp; Glance-Card&quot; to generate the 10-second Operator Glance-Card and interactive model payload.
        </p>
      </div>
    );
  }

  const payload = analysis.payloadJson;
  const treatmentSequence = payload?.treatment_sequence || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.glanceCardMarkdown || analysis.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col bg-[#181a19] rounded-2xl border border-[#2a2f2b] shadow-2xl backdrop-blur-md overflow-hidden text-[#eae6df]">
      {/* Top Header Card */}
      <div className="p-4 border-b border-[#2a2f2b] bg-[#141615] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#c48943]">
            PART 1: OPERATOR GLANCE-CARD
          </span>
          <span className="text-xs text-[#8a857d]">·</span>
          <span className="text-xs text-[#a8a39b] font-medium">
            10-Second Table-Side Rapid Uptake
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPubMedModal && (
            <button
              type="button"
              onClick={onOpenPubMedModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#222923] border border-[#2e3a31] text-[#a8c5b0] hover:text-[#f5f2ea] hover:bg-[#2a362d] transition-all cursor-pointer"
              title="View PubMed Research & Evidence"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#7ea18b]" />
              <span>PubMed Evidence</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e221f] border border-[#2a2f2b] text-[#a8a39b] hover:text-[#eae6df] transition-all cursor-pointer"
            title="Copy Markdown Glance Card"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e221f] border border-[#2a2f2b] text-[#a8a39b] hover:text-[#eae6df] transition-all cursor-pointer"
            title="Print Clinical Chart"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={onOpenTableMode}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#c48943] to-[#d4a373] text-[#121413] hover:from-[#d4a373] hover:to-[#e9c46a] transition-all shadow-md shadow-[#c48943]/20 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-[#121413]" />
            <span>Launch Table Mode</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-280px)]">
        {/* PRIMARY HYPOTHESIS BANNER (Root cause vs Symptom site in 1 sentence) */}
        <div className="p-4 rounded-xl bg-[#141615] border border-[#c48943]/50 shadow-inner space-y-1.5">
          <div className="flex items-center gap-2 text-[#c48943] font-bold text-xs uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#c48943] animate-pulse" />
            Primary Diagnostic Hypothesis (1-Sentence Clinical Formulation)
          </div>
          <p className="text-sm font-semibold text-[#f5f2ea] leading-snug">
            {payload?.diagnostic_summary?.primary_root_cause ||
              'Symptom site reflects downstream compensation for upstream kinetic fixations and channel stagnation.'}
          </p>
        </div>

        {/* CONTRAINDICATIONS & PRECAUTIONS */}
        <div className="p-4 rounded-xl bg-[#261b17] border border-[#522920] space-y-2 text-[#eae6df]">
          <div className="flex items-center gap-2 text-[#e76f51] font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-[#e76f51]" />
            Contraindications &amp; Precautions (Biometrics &amp; Labs)
          </div>
          <ul className="text-xs text-[#d4cdc3] space-y-1.5 list-disc pl-5">
            <li>
              <strong className="text-[#f5f2ea]">Fascial Glide:</strong> If hydration &lt; 50%, avoid sudden dry ischemic shear; warm ground substance with broad palm compression first (Stecco et al., 2011).
            </li>
            <li>
              <strong className="text-[#f5f2ea]">Systemic Inflammation:</strong> If hs-CRP &gt; 3.0 mg/L, Grade 5 deep friction at acute symptom site is contraindicated. Focus on distal Sen line draining and tsubo clearing.
            </li>
            <li>
              <strong className="text-[#f5f2ea]">Cervical &amp; Pelvic Stability:</strong> Protect hypermobile segments against uncontrolled hyperextension during passive traction.
            </li>
          </ul>
        </div>

        {/* 4-PHASE RAPID PROTOCOL SEQUENCING */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#a8a39b]">
            <h4 className="font-bold text-[#f5f2ea] tracking-wider uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#c48943]" />
              <span>Table Phase Sequencing (Quick-Switch Protocol)</span>
            </h4>
            <span>Total duration: ~35-45 min</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {treatmentSequence.map((step, idx) => (
              <div
                key={step.step || idx}
                className="p-4 rounded-xl bg-[#141615] border border-[#2a2f2b] hover:border-[#38433a] transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#c48943]">
                    {step.phase_name || `Phase ${idx + 1}`}
                  </span>
                  <span className="font-mono text-[#a8a39b]">
                    {step.duration_minutes || 8} min · Grade {step.pressure_grade || '2-3'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-[#8a857d]">Technique: </span>
                    <span className="text-[#f5f2ea] font-medium">
                      {step.technique_type ? step.technique_type.replace(/_/g, ' ') : 'Integrative Bodywork'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8a857d]">Target: </span>
                    <span className="text-[#d4cdc3]">{step.target_structure}</span>
                  </div>
                </div>

                {/* 15-Word Operator Cue */}
                <div className="p-2.5 rounded-lg bg-[#181a19] border border-[#222623] text-xs text-[#f5f2ea] leading-snug">
                  <span className="text-[10px] font-bold uppercase text-[#c48943] block mb-0.5">
                    Execution Cue:
                  </span>
                  &quot;{step.operator_cue}&quot;
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ENERGETIC & ANATOMICAL INTEGRATION SUMMARY */}
        {payload?.diagnostic_summary?.energetic_pathways && (
          <div className="p-4 rounded-xl bg-[#141615] border border-[#2a2f2b] space-y-3">
            <h4 className="text-xs font-bold text-[#f5f2ea] tracking-wider uppercase">
              Cross-System Energetic Synthesis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#181a19] border border-[#222623] space-y-1">
                <span className="text-[#7dd3fc] font-semibold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> TCM Meridians
                </span>
                <span className="text-[#d4cdc3]">
                  {payload.diagnostic_summary.energetic_pathways.meridians_involved?.join(', ') || 'Bladder & Gallbladder'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#181a19] border border-[#222623] space-y-1">
                <span className="text-[#e9c46a] font-semibold flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> Thai Sen Lines
                </span>
                <span className="text-[#d4cdc3]">
                  {payload.diagnostic_summary.energetic_pathways.sen_lines_involved?.join(', ') || 'Sen Kalathari & Ittha'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#181a19] border border-[#222623] space-y-1">
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Key Tsubo Nodes
                </span>
                <span className="text-[#f5f2ea] font-mono font-bold">
                  {payload.diagnostic_summary.energetic_pathways.key_acupressure_tsubo_points?.join(', ') || 'GB20, BL10, BL23'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
