import React, { useState } from 'react';
import { PUBMED_STUDIES, PubMedStudy } from '../data/pubmedData';
import {
  BookOpen,
  X,
  ExternalLink,
  Search,
  Sparkles,
  Layers,
  Activity,
  Flame,
  CheckCircle2,
  Filter,
} from 'lucide-react';

interface PubMedEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PubMedEvidenceModal: React.FC<PubMedEvidenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredStudies = PUBMED_STUDIES.filter((study) => {
    const matchesCategory = selectedCategory === 'all' || study.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.coreFinding.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.physiologicalMechanism.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.pmid.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#181a19] border border-[#2a2f2b] rounded-2xl shadow-2xl flex flex-col text-[#eae6df] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2a2f2b] bg-[#121413] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2d3d32] border border-[#3b5242] flex items-center justify-center text-[#7ea18b]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#f5f2ea] tracking-wide">
                  PubMed Clinical Research &amp; Biomechanical Rationales
                </h3>
                <span className="text-[10px] font-mono text-[#e9c46a] bg-[#1e221f] px-2 py-0.5 rounded border border-[#2a2f2b]">
                  Peer-Reviewed Evidence
                </span>
              </div>
              <p className="text-xs text-[#a8a39b] mt-0.5">
                Orthopedic fascia research (Stecco, Langevin), Travell-Simons trigger point biochemistry, &amp; Janda crossed syndromes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1e221f] hover:bg-[#283029] border border-[#2a2f2b] flex items-center justify-center text-[#a8a39b] hover:text-[#eae6df] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Ribbon */}
        <div className="p-4 border-b border-[#2a2f2b] bg-[#141615] flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a857d]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PMID, hyaluronan, shear strain, trigger points, Janda..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#121413] border border-[#222623] text-xs text-[#eae6df] placeholder-[#8a857d] focus:outline-none focus:border-[#c48943]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedCategory === 'all'
                  ? 'bg-[#2d3d32] text-[#cbe0d1]'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              All Evidence
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('fascial_mechanics')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedCategory === 'fascial_mechanics'
                  ? 'bg-[#2d3d32] text-[#cbe0d1]'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              Fascial Mechanics
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('trigger_points')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedCategory === 'trigger_points'
                  ? 'bg-[#2d3d32] text-[#cbe0d1]'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              Trigger Points
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('postural_biomechanics')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedCategory === 'postural_biomechanics'
                  ? 'bg-[#2d3d32] text-[#cbe0d1]'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              Postural Imbalance
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('acupressure_meridians')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                selectedCategory === 'acupressure_meridians'
                  ? 'bg-[#2d3d32] text-[#cbe0d1]'
                  : 'text-[#8a857d] hover:text-[#eae6df]'
              }`}
            >
              Acupressure Channels
            </button>
          </div>
        </div>

        {/* Study Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filteredStudies.map((study) => (
            <div
              key={study.pmid}
              className="p-4 rounded-xl bg-[#121413] border border-[#222623] hover:border-[#38433a] transition-all space-y-3"
            >
              {/* Card Header: Title & PubMed Link */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-[#e9c46a] bg-[#1e221f] px-2 py-0.5 rounded border border-[#2a2f2b]">
                      PMID: {study.pmid}
                    </span>
                    <span className="text-[11px] text-[#8a857d]">
                      {study.journal} ({study.year})
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#f5f2ea] leading-snug">
                    {study.title}
                  </h4>
                  <p className="text-[11px] text-[#8a857d] mt-0.5">{study.authors}</p>
                </div>

                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1e221f] hover:bg-[#283029] border border-[#2a2f2b] text-[#c48943] hover:text-[#e9c46a] flex items-center gap-1 transition-all shrink-0"
                >
                  <span>PubMed</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Core Finding */}
              <div className="p-3 rounded-lg bg-[#181a19] border border-[#262c27] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7ea18b] block">
                  Core Scientific Finding
                </span>
                <p className="text-xs text-[#d4cdc3] leading-relaxed">
                  {study.coreFinding}
                </p>
              </div>

              {/* Two Column Breakdown: Clinical Application vs Physiological Mechanism */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#161a17] border border-[#222924] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c48943] block">
                    Table-Side Clinical Application
                  </span>
                  <p className="text-[#a8a39b] leading-relaxed">
                    {study.clinicalApplication}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#161a17] border border-[#222924] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] block">
                    Biochemical &amp; Neural Mechanism
                  </span>
                  <p className="text-[#a8a39b] leading-relaxed">
                    {study.physiologicalMechanism}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredStudies.length === 0 && (
            <div className="text-center py-12 text-[#8a857d]">
              <p className="text-sm">No research studies match your search filter.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#2a2f2b] bg-[#121413] flex items-center justify-between text-xs text-[#8a857d]">
          <span>Evidence synthesized for Clinical Orthopedic &amp; Somatic Bodywork</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-semibold bg-[#222923] hover:bg-[#28322a] text-[#f5f2ea] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
