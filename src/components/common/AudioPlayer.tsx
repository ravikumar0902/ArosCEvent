'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Music, Bookmark, Sliders } from 'lucide-react';
import { formatSecondsToMinutes } from '@/lib/utils';
import { toast } from 'sonner';

interface AudioPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  showCueMarkers?: boolean;
}

export function AudioPlayer({
  src,
  title = 'Performance Audio Track',
  autoPlay = false,
  className,
  showCueMarkers = true,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [cueMarker, setCueMarker] = useState<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration || 300);
      setCurrentTime(audio.currentTime || 0);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [src]);

  // Draw Audio Waveform Visualization on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barCount = 48;
    const barWidth = 3;
    const gap = (width - barCount * barWidth) / (barCount - 1);
    const progress = duration > 0 ? currentTime / duration : 0;

    // Pseudo-random deterministic waveform peaks based on title
    for (let i = 0; i < barCount; i++) {
      const normalizedI = i / barCount;
      const seed = Math.sin(i * 12.9898 + (title.length % 5)) * 43758.5453;
      const randomFactor = seed - Math.floor(seed);
      const barHeight = Math.max(8, (randomFactor * 0.7 + 0.3) * (height - 6));
      const x = i * (barWidth + gap);
      const y = (height - barHeight) / 2;

      // Color active vs inactive bars
      if (normalizedI <= progress) {
        ctx.fillStyle = isPlaying ? '#f59e0b' : '#fbbf24'; // Active radiant amber
      } else {
        ctx.fillStyle = '#334155'; // Muted slate
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();

      // Draw Cue marker flag
      if (cueMarker !== null && duration > 0) {
        const cueNormalized = cueMarker / duration;
        const cueX = cueNormalized * width;
        ctx.fillStyle = '#ec4899'; // Magenta cue flag
        ctx.fillRect(cueX - 1, 0, 2, height);
      }
    }
  }, [currentTime, duration, isPlaying, title, cueMarker]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.warn(e));
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current || duration <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = pct * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const setStageCue = () => {
    setCueMarker(currentTime);
    toast.success(`Stage cue marker pinned at ${formatSecondsToMinutes(Math.floor(currentTime))}`);
  };

  const jumpToCue = () => {
    if (cueMarker !== null && audioRef.current) {
      audioRef.current.currentTime = cueMarker;
      setCurrentTime(cueMarker);
      toast.info(`Jumped to cue: ${formatSecondsToMinutes(Math.floor(cueMarker))}`);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  return (
    <div className={`p-4 rounded-2xl glass-panel border border-white/10 ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            <Music className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-200 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-amber-400 font-bold">
            {formatSecondsToMinutes(Math.floor(currentTime))}
          </span>
          <span className="text-xs font-mono text-slate-500">/</span>
          <span className="text-xs font-mono text-slate-400">
            {formatSecondsToMinutes(Math.floor(duration || 300))}
          </span>
        </div>
      </div>

      {/* Canvas Interactive Audio Waveform */}
      <div className="relative my-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
        <canvas
          ref={canvasRef}
          width={400}
          height={40}
          onClick={handleCanvasClick}
          className="w-full h-10 cursor-pointer block"
          title="Click to seek anywhere on waveform"
        />
        {cueMarker !== null && (
          <div
            className="absolute top-0 text-[9px] font-bold font-mono text-pink-400 bg-pink-950/80 px-1 rounded border border-pink-700 pointer-events-none"
            style={{ left: `${(cueMarker / (duration || 300)) * 95}%` }}
          >
            Cue: {formatSecondsToMinutes(Math.floor(cueMarker))}
          </div>
        )}
      </div>

      {/* Controls & Cue Pins */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={restart}
            title="Restart track to beginning"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {showCueMarkers && (
            <div className="flex items-center gap-1 ml-2 border-l border-slate-800 pl-2">
              <button
                type="button"
                onClick={setStageCue}
                className="px-2 py-1 rounded-lg bg-pink-950/80 hover:bg-pink-900 border border-pink-800 text-pink-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Pin stage entry cue at current playback second"
              >
                <Bookmark className="w-3 h-3" />
                <span>Pin Cue</span>
              </button>
              {cueMarker !== null && (
                <button
                  type="button"
                  onClick={jumpToCue}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono"
                  title="Jump to pinned cue"
                >
                  Jump
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
