import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchHistory, type HistoryItem, type AnalysisResult } from '@/services/api';
import { cn } from '@/lib/utils';
import { FileDown, CheckCircle2, AlertCircle, FileText, Layout, X, Loader2 } from 'lucide-react';

interface BlueprintExporterProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export const BlueprintExporter: React.FC<BlueprintExporterProps> = ({ isOpen, onClose, projectName }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<HistoryItem | null>(null);
  const [exportMode, setExportMode] = useState<'full' | 'summary'>('full');

  useEffect(() => {
    if (isOpen) {
      const loadHistory = async () => {
        setLoading(true);
        try {
          const localSession = localStorage.getItem("vibe_session");
          if (!localSession) return;
          const user = JSON.parse(localSession).user;
          const data = await fetchHistory(user.name);
          setHistory(data);
          
          // Auto-select current project if name matches
          if (projectName) {
            const current = data.find(h => h.name === projectName);
            if (current) setSelectedProject(current);
          }
        } catch (err) {
          console.error("Failed to load history:", err);
        } finally {
          setLoading(false);
        }
      };
      loadHistory();
    }
  }, [isOpen, projectName]);

  const generatePDF = () => {
    if (!selectedProject || !selectedProject.result_json) return;

    try {
      const doc = new jsPDF() as any;
      const res = selectedProject.result_json as AnalysisResult;
      const timestamp = new Date().toLocaleDateString();

      // -- Header --
      doc.setFillColor(15, 15, 15);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text((res.project_title || "SYSTME ARCHITECTURE").toUpperCase(), 15, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`ARCHITECTURAL BLUEPRINT v1.0 | ${timestamp}`, 15, 32);
      
      doc.setDrawColor(124, 58, 237); // Primary color
      doc.setLineWidth(1);
      doc.line(15, 35, 60, 35);

      let y = 50;

      // -- Executive Summary --
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("EXECUTIVE SUMMARY", 15, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(res.project_summary || "No summary provided.", 180);
      doc.text(summaryLines, 15, y);
      y += (summaryLines.length * 5) + 10;

      // Stats Table
      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Confidence Score', `${res.confidence_score || 0}%`],
          ['Complexity', res.complexity || 'Unknown'],
          ['Estimated Timeline', res.estimated_timeline || 'N/A'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [124, 58, 237] },
        margin: { left: 15 }
      });
      
      y = (doc as any).lastAutoTable.finalY + 15;

      if (exportMode === 'full') {
        // -- Technical Stack --
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("TECHNICAL ECOSYSTEM", 15, y);
        y += 10;

        const techBody = [
          ...(res.languages || []).map(l => [l.name, l.type || 'Language', l.reason || '']),
          ...(res.frameworks || []).map(f => [f.name, f.category || 'Framework', f.reason || ''])
        ];

        if (techBody.length > 0) {
          autoTable(doc, {
            startY: y,
            head: [['Technology', 'Type', 'Justification']],
            body: techBody,
            theme: 'grid',
            headStyles: { fillColor: [60, 60, 60] },
            styles: { fontSize: 9 },
            margin: { left: 15 }
          });
          y = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(9);
          doc.text("No technical stack defined.", 15, y);
          y += 10;
        }

        // -- Risk Analysis --
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("RISK ASSESSMENT", 15, y);
        y += 10;

        const risks = res.potential_risks || [];
        const riskBody = risks.map((r: any) => [
          typeof r === 'string' ? r : r.title || 'Risk',
          typeof r === 'string' ? 'Medium' : r.severity || 'N/A',
          typeof r === 'string' ? 'See digital dashboard for details.' : r.description || ''
        ]);

        if (riskBody.length > 0) {
          autoTable(doc, {
            startY: y,
            head: [['Risk Factor', 'Severity', 'Impact Analysis']],
            body: riskBody,
            theme: 'grid',
            headStyles: { fillColor: [239, 68, 68] },
            styles: { fontSize: 9 },
            margin: { left: 15 }
          });
          y = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(9);
          doc.text("No significant risks identified.", 15, y);
          y += 10;
        }

        // -- Market Analysis --
        if (res.market_analysis) {
          if (y > 240) { doc.addPage(); y = 20; }
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("MARKET VIABILITY", 15, y);
          y += 8;
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("Honest Assessment:", 15, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          const marketLines = doc.splitTextToSize(res.market_analysis.market_opportunity || "N/A", 180);
          doc.text(marketLines, 15, y);
          y += (marketLines.length * 5) + 5;

          doc.setFont("helvetica", "bold");
          doc.text("Startup Viability:", 15, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          const viabilityLines = doc.splitTextToSize(res.market_analysis.startup_viability || "N/A", 180);
          doc.text(viabilityLines, 15, y);
          y += (viabilityLines.length * 5) + 10;
        }
      }

      // -- Footer --
      const pageCount = (doc as any).internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`Page ${i} of ${pageCount} | Generated by Axiom AI Platform`, 105, 290, { align: "center" });
      }

      doc.save(`${(res.project_title || "Blueprint").replace(/\s+/g, '_')}_Blueprint.pdf`);
    } catch (err) {
      console.error("PDF Generation crashed:", err);
      alert("Failed to generate PDF. Please check architectural data.");
    }
  };

  const isFinalized = selectedProject?.result_json !== undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/90 backdrop-blur-xl"
        >
          <div className="max-w-4xl w-full bg-[#080808] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <FileDown className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-2xl font-headline font-bold text-white tracking-tight">Blueprint Exporter</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black font-mono">
                    Professional Workflow Generation • v1.0
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
              {/* Project History List */}
              <div className="p-8 border-r border-white/5 bg-black/20 flex flex-col h-full overflow-hidden">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Layout className="w-3 h-3" /> Select Project History
                </h3>
                
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-[10px] text-slate-500 uppercase font-black">Scanning Neural Records...</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedProject(item)}
                        className={cn(
                          "w-full text-left p-4 rounded-2xl border transition-all group relative",
                          selectedProject?.id === item.id 
                            ? "bg-primary/20 border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]" 
                            : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.05]"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-white truncate pr-4">{item.name}</h4>
                          {item.result_json ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-white/10"></span>
                          <span>Score: {item.score}%</span>
                        </div>
                      </button>
                    ))}
                    {history.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-xs text-slate-500 italic">No project history found.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Export Options & Actions */}
              <div className="p-8 flex flex-col bg-[#0a0a0a] justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Export Configuration
                  </h3>

                  {selectedProject ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
                        <h4 className="text-white font-bold mb-4">{selectedProject.name}</h4>
                        {!isFinalized ? (
                          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                               <p className="text-xs font-bold text-amber-500 uppercase tracking-tight mb-1">Architecture Not Finalized</p>
                               <p className="text-[10px] text-slate-400 leading-relaxed">This project hasn't been fully analyzed. Please go to the architecture page and save your stack first.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-4">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div>
                               <p className="text-xs font-bold text-emerald-500 uppercase tracking-tight mb-1">Synthesis Complete</p>
                               <p className="text-[10px] text-slate-400 leading-relaxed">Neural records are fully analyzed and ready for professional workflow documentation.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setExportMode('full')}
                          className={cn(
                            "p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                            exportMode === 'full' ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-slate-400"
                          )}
                        >
                          <FileText className="w-5 h-5" />
                          <span className="text-[10px] uppercase font-black">Full Blueprint</span>
                        </button>
                        <button
                          onClick={() => setExportMode('summary')}
                          className={cn(
                            "p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                            exportMode === 'summary' ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-slate-400"
                          )}
                        >
                          <FileDown className="w-5 h-5" />
                          <span className="text-[10px] uppercase font-black">Executive Summary</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-30">
                       <Layout className="w-12 h-12 text-slate-500" />
                       <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Select project history to begin Export</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                   <button
                     disabled={!isFinalized}
                     onClick={generatePDF}
                     className={cn(
                       "w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-2xl",
                       isFinalized 
                         ? "bg-primary text-white hover:scale-[1.02] active:scale-95 shadow-primary/30" 
                         : "bg-white/5 text-slate-700 cursor-not-allowed border border-white/5"
                     )}
                   >
                     Download {exportMode === 'full' ? "Neural Blueprint" : "Summary"}
                     <FileDown className="w-4 h-4" />
                   </button>
                   <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest">
                     Generated as Professional standard PDF v1.4
                   </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
