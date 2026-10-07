import React, { useState, useEffect } from 'react';
import {
  ClientDossier,
  ViewPerspective,
  LayerType,
  AnalysisResult,
  PainPointMarker,
} from './types/clinical';
import { CLINICAL_PRESETS } from './data/clinicalPresets';
import { ClientPainIntakeStudio } from './components/ClientPainIntakeStudio';
import { CorroborationStudio } from './components/CorroborationStudio';
import { GlanceCardView } from './components/GlanceCardView';
import { TableMode } from './components/TableMode';
import { PayloadInspector } from './components/PayloadInspector';
import { HandsFreeTableBar } from './components/HandsFreeTableBar';
import { PubMedEvidenceModal } from './components/PubMedEvidenceModal';
import {
  Activity,
  Flame,
  Compass,
  FileText,
  Play,
  Code,
  Sparkles,
  Info,
  CheckCircle2,
  Stethoscope,
  Layers,
  BookOpen,
  Eye,
  Camera,
  FolderOpen,
} from 'lucide-react';

const INITIAL_LIVE_CLIENT: ClientDossier = {
  id: 'live_client_active',
  name: 'Active Patient',
  caseTitle: 'Real-Time Orthopedic & Somatic Assessment',
  summary: 'Live clinical assessment based on patient marked pain sites and supplied photographs.',
  posturalDeviances: {
    forwardHeadDegrees: 28,
    pelvicTilt: 'anterior',
    highShoulder: 'right_high',
    lateralSpinalShift: 'cervicothoracic_right',
    description: 'Postural deviations to be evaluated from client photographs.',
  },
  clientPhotos: {},
  biometrics: {
    hydrationPercent: 48.5,
    skeletalMuscleMassKg: 31.0,
    asymmetryNote: 'Right shoulder elevation with pectoral tension',
    hsCrpMgL: 1.8,
    esrMmHr: 14,
    metabolicStressScore: 7,
    sleepHours: 6.5,
  },
  lifestyle: {
    profession: 'Client in treatment room',
    repetitiveStrainPattern: 'Unilateral dominant arm loading',
    ergonomicStaticLoading: 'Desk/device seated posture',
    voiceTranscript: 'Client expresses acute tightness along right clavicle and neck when turning.',
  },
  painPresentation: {
    primarySymptomSite: 'Right Clavicle & Lateral Neck',
    chronicity: 'chronic_longstanding',
    aggravatingMotion: 'Cervical rotation and forward shoulder flexion',
    mannequinMarkers: [
      {
        id: 'marker_init_1',
        x: 62,
        y: 22,
        view: 'anterior',
        type: 'symptom',
        label: 'Client Expressed Pain: Right Clavicle & Subclavius',
      },
    ],
  },
};

export default function App() {
  const [dossier, setDossier] = useState<ClientDossier>(INITIAL_LIVE_CLIENT);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'intake' | 'corroboration' | 'glance_card' | 'payload'>('intake');
  const [isTableModeOpen, setIsTableModeOpen] = useState(false);
  const [isPubMedOpen, setIsPubMedOpen] = useState(false);
  const [isCaseStudiesOpen, setIsCaseStudiesOpen] = useState(false);

  // Process live client data and photos via /api/analyze
  const handleProcessClient = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dossier),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setAnalysis(data);
      // Auto-switch to Corroboration Studio so therapist corroborates pictures with body double
      setActiveNavTab('corroboration');
    } catch (err) {
      console.warn('Client processing notification:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial synthesis on mount so app has initial formulated analysis
  useEffect(() => {
    handleProcessClient();
  }, []);

  // Handle loading reference case study
  const handleLoadPresetCase = (presetId: string) => {
    const selected = CLINICAL_PRESETS.find((p) => p.id === presetId);
    if (selected) {
      setDossier(JSON.parse(JSON.stringify(selected)));
      setIsCaseStudiesOpen(false);
    }
  };

  const handleResetToLiveClient = () => {
    setDossier(INITIAL_LIVE_CLIENT);
    setIsCaseStudiesOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#121413] text-[#eae6df] flex flex-col font-sans selection:bg-[#c48943]/30 selection:text-[#e9c46a]">
      {/* TOP CLINICAL APP HEADER */}
      <header className="sticky top-0 z-40 bg-[#141615]/95 border-b border-[#2a2f2b] backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Engine Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c48943] via-[#d4a373] to-[#829d8a] flex items-center justify-center shadow-lg shadow-[#c48943]/20 text-[#121413]">
              <Stethoscope className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-wider text-[#f5f2ea] uppercase font-sans">
                  SomaKinetic Engine
                </h1>
                <span className="text-[10px] font-mono text-[#c48943] bg-[#1e221f] px-2 py-0.5 rounded border border-[#2a2f2b]">
                  LIVE CLINICAL
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#a8a39b]">
                <span>{dossier.name}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#c48943]">{dossier.caseTitle}</span>
              </div>
            </div>
          </div>

          {/* Navigation Bar: Intake -> Corroboration -> Glance Card -> JSON */}
          <nav className="flex items-center gap-1 p-1 bg-[#181a19] border border-[#2a2f2b] rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveNavTab('intake')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNavTab === 'intake'
                  ? 'bg-[#c48943] text-[#121413] font-bold shadow-md shadow-[#c48943]/20'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>1. Client Pain &amp; Photos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNavTab('corroboration')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNavTab === 'corroboration'
                  ? 'bg-[#c48943] text-[#121413] font-bold shadow-md shadow-[#c48943]/20'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2. Corroboration Studio</span>
              {analysis && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveNavTab('glance_card')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNavTab === 'glance_card'
                  ? 'bg-[#c48943] text-[#121413] font-bold shadow-md shadow-[#c48943]/20'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. Treatment Plan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNavTab('payload')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeNavTab === 'payload'
                  ? 'bg-[#c48943] text-[#121413] font-bold shadow-md shadow-[#c48943]/20'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>4. JSON</span>
            </button>
          </nav>

          {/* Secondary Controls: Case Studies Archive Toggle, PubMed, Table Mode */}
          <div className="flex items-center gap-2">
            {/* Case Studies Toggle (Secondary reference) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCaseStudiesOpen(!isCaseStudiesOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#181a19] hover:bg-[#222923] border border-[#2a2f2b] text-[#8a857d] hover:text-[#eae6df] transition-all cursor-pointer"
                title="Toggle Reference Case Studies"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Case Studies</span>
              </button>

              {isCaseStudiesOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#181a19] border border-[#2a2f2b] rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="p-1.5 text-[10px] uppercase font-bold text-[#8a857d] border-b border-[#222623]">
                    Reference Case Archive
                  </div>
                  <button
                    type="button"
                    onClick={handleResetToLiveClient}
                    className="w-full text-left p-2 rounded-lg text-xs hover:bg-[#222923] text-[#e9c46a] font-semibold cursor-pointer"
                  >
                    + New Live Patient Session
                  </button>
                  {CLINICAL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleLoadPresetCase(preset.id)}
                      className="w-full text-left p-2 rounded-lg text-xs hover:bg-[#222923] text-[#eae6df] transition-all cursor-pointer"
                    >
                      <div className="font-semibold">{preset.name}</div>
                      <div className="text-[10px] text-[#8a857d] truncate">{preset.caseTitle}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsPubMedOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#181a19] hover:bg-[#222923] border border-[#2a2f2b] text-[#a8c5b0] hover:text-[#f5f2ea] transition-all cursor-pointer"
              title="Review PubMed Orthopedic Bodywork & Fascial Evidence"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#7ea18b]" />
              <span>PubMed</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTableModeOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#c48943] to-[#d4a373] hover:from-[#d4a373] hover:to-[#e9c46a] text-[#121413] transition-all shadow-lg shadow-[#c48943]/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-[#121413]" />
              <span>Table Mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* DOCKED TABLE FLOW & HANDS-FREE VOICE BAR (Single-Finger Table Glide) */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-3">
        <HandsFreeTableBar onOpenFullTableMode={() => setIsTableModeOpen(true)} />
      </section>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col min-h-[640px]">
        {activeNavTab === 'intake' && (
          <ClientPainIntakeStudio
            dossier={dossier}
            onChangeDossier={setDossier}
            onProcessClient={handleProcessClient}
            isProcessing={isLoading}
            onOpenCorroboration={() => setActiveNavTab('corroboration')}
            hasAnalysisResult={!!analysis}
          />
        )}

        {activeNavTab === 'corroboration' && (
          <CorroborationStudio
            dossier={dossier}
            analysis={analysis}
            onOpenTableMode={() => setIsTableModeOpen(true)}
            onBackToIntake={() => setActiveNavTab('intake')}
          />
        )}

        {activeNavTab === 'glance_card' && (
          <GlanceCardView
            analysis={analysis}
            onOpenTableMode={() => setIsTableModeOpen(true)}
            onOpenPubMedModal={() => setIsPubMedOpen(true)}
          />
        )}

        {activeNavTab === 'payload' && <PayloadInspector analysis={analysis} />}
      </main>

      {/* FOOTER BAR */}
      <footer className="border-t border-[#2a2f2b] bg-[#141615] px-6 py-3 text-xs text-[#8a857d]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[#eae6df] font-medium">SomaKinetic Clinical Engine</span>
            <span>—</span>
            <span>Live Patient Form $\rightarrow$ Photo Processing $\rightarrow$ Body Double Corroboration</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#8a857d]">
            <span>Travell &amp; Simons Trigger Points</span>
            <span aria-hidden="true">·</span>
            <span>TCM 12 Meridians</span>
            <span aria-hidden="true">·</span>
            <span>Thai Sib Sen</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsPubMedOpen(true)}
              className="text-[#c48943] hover:underline cursor-pointer"
            >
              PubMed Evidence
            </button>
          </div>
        </div>
      </footer>

      {/* PUBMED EVIDENCE MODAL */}
      <PubMedEvidenceModal
        isOpen={isPubMedOpen}
        onClose={() => setIsPubMedOpen(false)}
      />

      {/* TABLE MODE FULLSCREEN MODAL */}
      {isTableModeOpen && (
        <TableMode
          payload={analysis?.payloadJson || null}
          onClose={() => setIsTableModeOpen(false)}
        />
      )}
    </div>
  );
}
