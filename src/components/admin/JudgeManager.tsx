'use client';

import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Star, Sparkles, MessageSquare } from 'lucide-react';
import { Performance, Scorecard, Score } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { toast } from 'sonner';

interface JudgeManagerProps {
  eventId: string;
}

export function JudgeManager({ eventId }: JudgeManagerProps) {
  const { user } = useAuth();
  const { lastEvent } = useRealtime();

  const [performances, setPerformances] = useState<Performance[]>([]);
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  const [selectedPerfId, setSelectedPerfId] = useState<string | null>(null);
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    const perfs = db.getPerformances(eventId);
    setPerformances(perfs);
    const scs = db.getScorecards(eventId);
    setScorecards(scs);
    const scList = db.getScores();
    setScores(scList.filter((s) => s.event_id === eventId));
  };

  useEffect(() => {
    loadData();
  }, [eventId, lastEvent]);

  const activeCard = scorecards[0];
  const selectedPerf = performances.find((p) => p.id === selectedPerfId);
  const existingScore = scores.find((s) => s.performance_id === selectedPerfId && s.judge_id === user?.id);

  const handleScoreChange = (criterionId: string, val: number) => {
    setCriteriaScores({ ...criteriaScores, [criterionId]: val });
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerf || !activeCard) return;

    if (existingScore) {
      toast.error('You have already submitted a score for this act!');
      return;
    }

    setIsSubmitting(true);
    try {
      db.submitScore({
        eventId,
        performanceId: selectedPerf.id,
        judgeId: user?.id || 'prof-judge',
        scorecardId: activeCard.id,
        scores: criteriaScores,
        comments,
      });

      toast.success('Scorecard submitted successfully! ✓');
      setSelectedPerfId(null);
      setCriteriaScores({});
      setComments('');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl glass-panel-highlight border border-pink-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold text-xs uppercase tracking-wider">
            Jury Evaluation Module
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Judges Scoring & Rubric Console
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluating dance, vocals, choreography and stage presence with anti-duplicate locks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            Jury Scores Recorded: {scores.length}
          </span>
        </div>
      </div>

      {/* 2 COLUMN LAYOUT: PERFORMANCES LIST & SCORING SLATE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ASSIGNED PERFORMANCES */}
        <div className="lg:col-span-5 space-y-3">
          <div className="glass-panel rounded-3xl p-5 border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Acts for Adjudication
            </h3>

            <div className="space-y-2">
              {performances.map((perf) => {
                const isSelected = selectedPerfId === perf.id;
                const hasScore = scores.some((s) => s.performance_id === perf.id);

                return (
                  <button
                    key={perf.id}
                    onClick={() => {
                      setSelectedPerfId(perf.id);
                      setCriteriaScores({});
                      setComments('');
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-pink-950/40 border-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-amber-400">
                          #{perf.performance_number}
                        </span>
                        <h4 className="text-xs font-bold text-white">{perf.title}</h4>
                      </div>
                      <span className="text-[11px] text-slate-400">{perf.category?.name}</span>
                    </div>

                    {hasScore ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Scored</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-pink-400">Grade &gt;</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SCORING CRITERIA SHEET */}
        <div className="lg:col-span-7">
          {selectedPerf && activeCard ? (
            <div className="glass-panel-highlight rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Act #{selectedPerf.performance_number} • {selectedPerf.category?.name}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">{selectedPerf.title}</h3>
                </div>

                {existingScore && (
                  <div className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submitted ✓</span>
                  </div>
                )}
              </div>

              {existingScore ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <h4 className="text-lg font-bold text-emerald-300">Scorecard Finalized</h4>
                  <p className="text-xs text-slate-300">
                    Total Awarded Score: <strong className="text-amber-400 font-mono text-base">{existingScore.total_score} / 100</strong>
                  </p>
                  <p className="text-xs text-slate-400 italic">Comments: &quot;{existingScore.comments || 'No remarks.'}&quot;</p>
                </div>
              ) : (
                <form onSubmit={handleScoreSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {activeCard.criteria_json.map((crit) => (
                      <div key={crit.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{crit.name}</span>
                          <span className="font-mono text-xs text-amber-400 font-bold">
                            Score: {criteriaScores[crit.id] || 0} / {crit.max_score}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{crit.description}</p>

                        <input
                          type="range"
                          min={0}
                          max={crit.max_score}
                          value={criteriaScores[crit.id] || 0}
                          onChange={(e) => handleScoreChange(crit.id, Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Judge Remarks & Accolades:
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={2}
                      placeholder="e.g. Excellent synchronization, outstanding costume coordination!"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-pink-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-pink-500 to-pink-600 text-white font-black text-sm shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-102 active:scale-98 transition-all"
                  >
                    Submit Official Scorecard
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 border border-white/5">
              <Award className="w-12 h-12 text-pink-400 mx-auto mb-3" />
              <p className="font-bold text-white">Select a Performance from the Left</p>
              <p className="text-xs">Grade criteria points and provide comments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
