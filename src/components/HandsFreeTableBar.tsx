import React, { useState, useEffect, useRef } from 'react';
import { TopDownWorkflowStep, VoiceCommandEvent } from '../types/clinical';
import { playPhaseBellChime, playSoftTick } from '../utils/audioChime';
import {
  Mic,
  MicOff,
  ChevronRight,
  ChevronLeft,
  Flame,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  CheckCircle2,
  Hand,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const TOP_DOWN_WORKFLOW_STEPS: TopDownWorkflowStep[] = [
  {
    id: 'clavicular',
    regionName: '1. Clavicle & Pectoral Girdle',
    anatomicalZone: 'Sternoclavicular joint, Subclavius, Pectoralis Minor, AC joint',
    keyStructures: ['Subclavius', 'Pectoralis Minor', 'Anterior Scalenes', 'Sternoclavicular Joint'],
    techniqueCue: 'Hook subclavicular groove with fingerpads; mobilize clavicle during client slow exhale.',
    pressureGrade: 3,
    targetTsubo: ['LU1 (Zhongfu)', 'LI4 (Hegu)'],
    durationMinutes: 8,
  },
  {
    id: 'craniocervical',
    regionName: '2. Head & Cranio-Cervical Base',
    anatomicalZone: 'Suboccipital triangle, C1 Atlas, C2 Axis, Nuchal Crest',
    keyStructures: ['Rectus Capitis Posterior', 'Obliquus Capitis', 'Longus Colli', 'Upper SCM'],
    techniqueCue: 'Cranial base fingerpad traction; sustained 60s occipital decompression on exhale.',
    pressureGrade: 3,
    targetTsubo: ['GB20 (Fengchi)', 'BL10 (Tianzhu)'],
    durationMinutes: 7,
  },
  {
    id: 'thoracic_scapular',
    regionName: '3. Cervicothoracic & Scapular Border',
    anatomicalZone: 'Superior scapular angle, Medial border, C7-T4 paraspinal',
    keyStructures: ['Levator Scapulae TP1', 'Upper Trapezius', 'Rhomboid Minor'],
    techniqueCue: 'Longitudinal thumb glide along medial scapular border; pin and contralateral neck flex.',
    pressureGrade: 4,
    targetTsubo: ['SI14 (Jianwaishu)', 'BL11 (Dazhu)'],
    durationMinutes: 9,
  },
  {
    id: 'thoracolumbar_ql',
    regionName: '4. Thoracolumbar Spine & Quadratus Lumborum',
    anatomicalZone: '12th rib margin, L1-L5 paraspinal gutter, Iliac crest line',
    keyStructures: ['Quadratus Lumborum', 'Erector Spinae Longissimus', 'Thoracolumbar Fascia'],
    techniqueCue: 'Broad palm melting followed by perpendicular thumb sink into deep QL belly.',
    pressureGrade: 4,
    targetTsubo: ['BL23 (Shenshu)', 'BL25 (Dachangshu)'],
    durationMinutes: 10,
  },
  {
    id: 'lumbopelvic_piriformis',
    regionName: '5. Lumbopelvic Base & Piriformis',
    anatomicalZone: 'Greater trochanter to sacral border, Sacroiliac notch',
    keyStructures: ['Piriformis', 'Gluteus Medius', 'Sacrotuberous Ligament'],
    techniqueCue: 'Sustained elbow apex sink at midpoint of piriformis line; hold through ischemic release.',
    pressureGrade: 4,
    targetTsubo: ['GB30 (Huantiao)'],
    durationMinutes: 9,
  },
  {
    id: 'posterior_kinetic_foot',
    regionName: '6. Posterior Kinetic Chain & Foot Anchor',
    anatomicalZone: 'Popliteal fossa, Achilles tendon, Calcaneus, Plantar fascia',
    keyStructures: ['Biceps Femoris', 'Soleus TP1', 'Plantar Aponeurosis'],
    techniqueCue: 'Axial hamstring traction down to calcaneus; deep knuckle glide along plantar sole.',
    pressureGrade: 3,
    targetTsubo: ['BL40 (Weizhong)', 'KD3 (Taixi)', 'KD1 (Yongquan)'],
    durationMinutes: 7,
  },
];

interface HandsFreeTableBarProps {
  onStepChange?: (step: TopDownWorkflowStep) => void;
  onOpenFullTableMode?: () => void;
}

export const HandsFreeTableBar: React.FC<HandsFreeTableBarProps> = ({
  onStepChange,
  onOpenFullTableMode,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = TOP_DOWN_WORKFLOW_STEPS[currentStepIndex];
  const nextStep = TOP_DOWN_WORKFLOW_STEPS[currentStepIndex + 1] || null;

  const [pressureGrade, setPressureGrade] = useState(currentStep.pressureGrade);
  const [timerSeconds, setTimerSeconds] = useState(currentStep.durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string>('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [spokenFeedbackEnabled, setSpokenFeedbackEnabled] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Spoken feedback helper using Web Speech API
  const speakVoiceConfirmation = (text: string) => {
    if (!spokenFeedbackEnabled) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        utterance.volume = 0.7;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Speech synthesis fallback
      }
    }
  };

  // Sync step change
  useEffect(() => {
    setPressureGrade(currentStep.pressureGrade);
    setTimerSeconds(currentStep.durationMinutes * 60);
    onStepChange?.(currentStep);
  }, [currentStepIndex]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            playPhaseBellChime('high');
            if (currentStepIndex < TOP_DOWN_WORKFLOW_STEPS.length - 1) {
              const nextIdx = currentStepIndex + 1;
              setCurrentStepIndex(nextIdx);
              speakVoiceConfirmation(`Station completed. Advancing to ${TOP_DOWN_WORKFLOW_STEPS[nextIdx].regionName}`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, currentStepIndex]);

  // Voice Command Processing
  const processVoiceText = (text: string) => {
    const clean = text.toLowerCase().trim();
    setLastVoiceCommand(clean);

    if (clean.includes('next') || clean.includes('advance') || clean.includes('forward')) {
      handleNextStep();
    } else if (clean.includes('back') || clean.includes('previous')) {
      handlePrevStep();
    } else if (clean.includes('clavicle') || clean.includes('collar') || clean.includes('pectoral')) {
      jumpToStep('clavicular');
    } else if (clean.includes('head') || clean.includes('neck') || clean.includes('suboccipital') || clean.includes('cervical')) {
      jumpToStep('craniocervical');
    } else if (clean.includes('scapula') || clean.includes('shoulder') || clean.includes('trapezius')) {
      jumpToStep('thoracic_scapular');
    } else if (clean.includes('lumbar') || clean.includes('lower back') || clean.includes('ql') || clean.includes('quadratus')) {
      jumpToStep('thoracolumbar_ql');
    } else if (clean.includes('glute') || clean.includes('piriformis') || clean.includes('hip') || clean.includes('sacrum') || clean.includes('pelvis')) {
      jumpToStep('lumbopelvic_piriformis');
    } else if (clean.includes('foot') || clean.includes('feet') || clean.includes('calf') || clean.includes('hamstring') || clean.includes('leg')) {
      jumpToStep('posterior_kinetic_foot');
    } else if (clean.includes('start') || clean.includes('play') || clean.includes('begin')) {
      setIsTimerRunning(true);
      playSoftTick('start');
      speakVoiceConfirmation('Timer started');
    } else if (clean.includes('pause') || clean.includes('stop') || clean.includes('hold')) {
      setIsTimerRunning(false);
      playSoftTick('pause');
      speakVoiceConfirmation('Timer paused');
    } else if (clean.includes('pressure up') || clean.includes('deeper') || clean.includes('more pressure') || clean.includes('increase pressure')) {
      cyclePressure(1);
    } else if (clean.includes('pressure down') || clean.includes('lighter') || clean.includes('less pressure') || clean.includes('decrease pressure')) {
      cyclePressure(-1);
    }
  };

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const lastIndex = event.results.length - 1;
      const transcript = event.results[lastIndex][0].transcript;
      processVoiceText(transcript);
    };

    recognition.onerror = (e: any) => {
      console.warn('Voice recognition note:', e.error);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) return;
    if (isListeningVoice) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
      speakVoiceConfirmation('Voice listening paused');
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningVoice(true);
        speakVoiceConfirmation('Voice listening active. Say Clavicle, Head, or Next.');
      } catch (err) {
        setIsListeningVoice(true);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < TOP_DOWN_WORKFLOW_STEPS.length - 1) {
      playPhaseBellChime('mid');
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      speakVoiceConfirmation(`Moving to ${TOP_DOWN_WORKFLOW_STEPS[nextIdx].regionName}`);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      speakVoiceConfirmation(`Back to ${TOP_DOWN_WORKFLOW_STEPS[prevIdx].regionName}`);
    }
  };

  const jumpToStep = (id: string) => {
    const idx = TOP_DOWN_WORKFLOW_STEPS.findIndex((s) => s.id === id);
    if (idx !== -1) {
      playPhaseBellChime('low');
      setCurrentStepIndex(idx);
      speakVoiceConfirmation(`Targeting ${TOP_DOWN_WORKFLOW_STEPS[idx].regionName}`);
    }
  };

  const cyclePressure = (delta: number = 1) => {
    playSoftTick('start');
    setPressureGrade((prev) => {
      let next = prev + delta;
      if (next > 5) next = 1;
      if (next < 1) next = 5;
      speakVoiceConfirmation(`Pressure grade ${next}`);
      return next;
    });
  };

  const toggleTimer = () => {
    playSoftTick(isTimerRunning ? 'pause' : 'start');
    setIsTimerRunning(!isTimerRunning);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-[#181a19] border border-[#2a2f2b] rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-3.5 text-[#eae6df]">
      {/* Top Bar: Active Step & Voice Beacon */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c48943] shrink-0 animate-pulse" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c48943] block">
              Top-Down Table Progression ({currentStepIndex + 1}/{TOP_DOWN_WORKFLOW_STEPS.length})
            </span>
            <h3 className="text-sm font-bold text-[#f5f2ea] truncate">{currentStep.regionName}</h3>
          </div>
        </div>

        {/* Hands-Free Voice Controls */}
        <div className="flex items-center gap-2">
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceListening}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isListeningVoice
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20 animate-pulse'
                  : 'bg-[#121413] text-[#8a857d] border-[#222623] hover:text-[#eae6df]'
              }`}
              title="Speak commands: 'Next', 'Clavicle', 'Head', 'Pressure up', 'Start', 'Pause'"
            >
              {isListeningVoice ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{isListeningVoice ? 'Voice Active ("Next", "Head")' : 'Enable Voice Control'}</span>
            </button>
          )}

          {lastVoiceCommand && (
            <span className="text-[10px] font-mono text-[#a8c5b0] bg-[#121413] px-2 py-0.5 rounded border border-[#222623] hidden sm:inline">
              &quot;{lastVoiceCommand}&quot;
            </span>
          )}

          {onOpenFullTableMode && (
            <button
              type="button"
              onClick={onOpenFullTableMode}
              className="text-[11px] font-semibold text-[#c48943] hover:text-[#e9c46a] underline cursor-pointer ml-1"
            >
              Expand Full HUD
            </button>
          )}
        </div>
      </div>

      {/* Primary 1-Tap Tactile Glancing Cue Card (Legible from 4 feet without squinting) */}
      <div className="p-3.5 rounded-xl bg-[#121413] border border-[#222623] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#c48943] flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5" />
            <span>Table Glance Cue (10-Second Uptake)</span>
          </span>
          <span className="text-[10px] text-[#8a857d] font-mono">
            Tsubo: {currentStep.targetTsubo.join(' · ')}
          </span>
        </div>

        {/* Large execution cue */}
        <p className="text-sm sm:text-base font-semibold text-[#f5f2ea] leading-snug">
          &quot;{currentStep.techniqueCue}&quot;
        </p>

        {/* Zero-Cognitive-Delay NEXT PREVIEW: What comes next when hands move */}
        <div className="flex items-center justify-between pt-1 border-t border-[#1e221f] text-[11px] text-[#8a857d]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#a8a39b]">Structures:</span>
            <span className="text-[#d4cdc3] truncate max-w-[260px]">
              {currentStep.keyStructures.slice(0, 2).join(', ')}
            </span>
          </div>

          {nextStep ? (
            <div className="flex items-center gap-1 text-[#e9c46a] font-medium">
              <span>Next Hand Move:</span>
              <span className="text-[#f5f2ea] font-semibold">{nextStep.regionName.replace(/^\d+\.\s*/, '')}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          ) : (
            <span className="text-emerald-400 font-medium">Final Grounding Step</span>
          )}
        </div>
      </div>

      {/* ONE-FINGER ERGONOMIC ACTION CONTROLS (Massive $\ge 56px$ targets for therapist's single thumb/finger) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* 1. PREV AREA (One Finger Tap) */}
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
          className="h-14 rounded-xl bg-[#1e221f] hover:bg-[#283029] border border-[#2a2f2b] text-[#eae6df] font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev Region</span>
        </button>

        {/* 2. ONE-FINGER PRESSURE GRADE TOGGLE */}
        <button
          type="button"
          onClick={() => cyclePressure(1)}
          className="h-14 rounded-xl bg-[#1e221f] hover:bg-[#283029] border border-[#2a2f2b] text-[#e9c46a] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          title="Tap with one finger to cycle pressure depth Grade 1 through 5"
        >
          <Flame className="w-4 h-4 text-[#c48943]" />
          <span>Depth: Grade {pressureGrade}/5</span>
        </button>

        {/* 3. TIMER PLAY/PAUSE */}
        <button
          type="button"
          onClick={toggleTimer}
          className="h-14 rounded-xl bg-[#1e221f] hover:bg-[#283029] border border-[#2a2f2b] text-[#eae6df] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isTimerRunning ? <Pause className="w-4 h-4 text-[#c48943]" /> : <Play className="w-4 h-4 text-emerald-400" />}
          <span>{formatTimer(timerSeconds)}</span>
        </button>

        {/* 4. ONE-TAP NEXT REGION (Primary Big Button for Thumb) */}
        <button
          type="button"
          onClick={handleNextStep}
          disabled={currentStepIndex === TOP_DOWN_WORKFLOW_STEPS.length - 1}
          className="h-14 rounded-xl bg-[#c48943] hover:bg-[#d4a373] text-[#121413] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#c48943]/20 disabled:opacity-30 cursor-pointer"
        >
          <span>Next Region</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* QUICK TOP-DOWN ANATOMICAL STEP STRIP (1-Tap Switch without page turn) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
        {TOP_DOWN_WORKFLOW_STEPS.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isPassed = idx < currentStepIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => jumpToStep(step.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#2d3d32] border-[#c48943] text-[#f5f2ea] shadow-sm ring-1 ring-[#c48943]/30'
                  : isPassed
                  ? 'bg-[#181a19] border-[#222623] text-emerald-400/80 hover:bg-[#1e221f]'
                  : 'bg-[#121413] border-[#222623] text-[#8a857d] hover:text-[#eae6df] hover:bg-[#181a19]'
              }`}
            >
              {isPassed ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <span>{idx + 1}.</span>}
              <span>{step.regionName.replace(/^\d+\.\s*/, '').split('&')[0].trim()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
