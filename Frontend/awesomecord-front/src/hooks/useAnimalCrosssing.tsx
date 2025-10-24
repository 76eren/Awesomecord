import {useCallback, useEffect, useMemo, useRef, useState} from "react";

type Region = { start: number; duration: number };

export type SpriteAutoOptions = {
    url?: string;
    letters?: string;
    sampleRateDown?: number;
    windowMs?: number;
    hopMs?: number;
    energyFloor?: number;
    minSilenceMs?: number;

    charMs?: number;
    pitchBase?: number;
    pitchVar?: number;
    volume?: number;
    uppercaseBoost?: number;
    punctuationPauseMs?: number;
    spacePauseMs?: number;
    onAutoMap?: (regions: Region[]) => void;
};

const DEF: Required<Omit<SpriteAutoOptions, "onAutoMap" | "letters" | "url">> &
    { letters: string; url: string } = {
    url: "/assets/animalCrossing/m1.ogg",
    letters: "abcdefghijklmnopqrstuvwxyz",
    sampleRateDown: 8000,
    windowMs: 12,
    hopMs: 6,
    energyFloor: 0.0002,
    minSilenceMs: 40, // small silence between letters in the sprite
    charMs: 55,
    pitchBase: 1.0,
    pitchVar: 0.05,
    volume: 0.55,
    uppercaseBoost: 0.06,
    punctuationPauseMs: 80,
    spacePauseMs: 40,
};

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    if (!(getAudioContext as any)._ctx) (getAudioContext as any)._ctx = new Ctx();
    return (getAudioContext as any)._ctx as AudioContext;
}

function frameEnergy(buf: Float32Array, start: number, len: number): number {
    let sum = 0;
    for (let i = start; i < start + len; i++) {
        const v = buf[i] || 0;
        sum += v * v;
    }
    return sum / Math.max(1, len);
}

function resampleMono(channelData: Float32Array, inSr: number, outSr: number) {
    if (outSr >= inSr) return channelData;
    const ratio = inSr / outSr;
    const outLen = Math.floor(channelData.length / ratio);
    const out = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
        out[i] = channelData[Math.floor(i * ratio)] || 0;
    }
    return out;
}

export function useAnimaleseSpriteAuto(partial?: SpriteAutoOptions) {
    const opts = useMemo(() => ({...DEF, ...(partial || {})}), [partial]);
    const ctxRef = useRef<AudioContext | null>(null);
    const bufferRef = useRef<AudioBuffer | null>(null);
    const regionsRef = useRef<Region[] | null>(null);
    const readyRef = useRef(false);
    const [ready, setReady] = useState(false);
    const currentAbortRef = useRef<AbortController | null>(null);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const ensureCtx = useCallback(async () => {
        if (!ctxRef.current) ctxRef.current = getAudioContext();
        const ctx = ctxRef.current;
        if (!ctx) throw new Error("Web Audio API not supported");
        if (ctx.state === "suspended") {
            try {
                await ctx.resume();
            } catch {
            }
        }
        return ctx;
    }, []);

    const analyze = useCallback((buf: AudioBuffer) => {
        const ch = buf.numberOfChannels ? buf.getChannelData(0) : new Float32Array(0);
        const inSr = buf.sampleRate;
        const down = resampleMono(ch, inSr, opts.sampleRateDown);
        const sr = Math.min(inSr, opts.sampleRateDown);
        const win = Math.max(1, Math.round((opts.windowMs / 1000) * sr));
        const hop = Math.max(1, Math.round((opts.hopMs / 1000) * sr));
        const energies: number[] = [];
        for (let i = 0; i + win <= down.length; i += hop) {
            energies.push(frameEnergy(down, i, win));
        }
        const maxE = Math.max(...energies, 1e-9);
        const norm = energies.map(e => e / maxE);

        const thr = Math.max(opts.energyFloor, 0.05);
        const minGapFrames = Math.round((opts.minSilenceMs / 1000) * sr / hop);
        const active: { startF: number; endF: number }[] = [];
        let inRegion = false, startF = 0;
        for (let f = 0; f < norm.length; f++) {
            const isLoud = norm[f] >= thr;
            if (isLoud && !inRegion) {
                inRegion = true;
                startF = f;
            } else if (!isLoud && inRegion) {
                let end = f;
                active.push({startF, endF: end});
                inRegion = false;
            }
        }
        if (inRegion) active.push({startF, endF: norm.length - 1});

        const merged: { startF: number; endF: number }[] = [];
        for (const seg of active) {
            if (!merged.length) {
                merged.push(seg);
                continue;
            }
            const prev = merged[merged.length - 1];
            if (seg.startF - prev.endF < minGapFrames) {
                prev.endF = seg.endF;
            } else {
                merged.push(seg);
            }
        }

        const toTime = (f: number) => (f * hop) / sr;
        let regions = merged
            .map(({startF, endF}) => {
                const start = Math.max(0, toTime(startF) - 0.002);
                const end = Math.min(buf.duration, toTime(endF) + (win / sr) + 0.002);
                const duration = Math.max(0.02, end - start);
                return {start, duration};
            })
            .filter(r => r.duration >= 0.02);

        const want = opts.letters.length;
        if (regions.length > want) {
            const withPeak = regions.map(r => {
                const s = Math.floor(r.start * inSr);
                const d = Math.floor(r.duration * inSr);
                let peak = 0;
                for (let i = s; i < s + d && i < ch.length; i++) {
                    const v = Math.abs(ch[i]);
                    if (v > peak) peak = v;
                }
                return {r, peak};
            });
            withPeak.sort((a, b) => b.peak - a.peak);
            regions = withPeak.slice(0, want).map(x => x.r).sort((a, b) => a.start - b.start);
        } else if (regions.length < want) {
            const missing = want - regions.length;
            const padStart = regions.length ? regions[regions.length - 1].start + regions[regions.length - 1].duration : 0;
            const residual = Math.max(0, buf.duration - padStart);
            const slice = residual / Math.max(1, missing);
            for (let i = 0; i < missing; i++) {
                regions.push({start: padStart + i * slice, duration: Math.min(0.07, slice)});
            }
        }

        return regions.slice(0, want);
    }, [opts]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const ctx = await ensureCtx();
                const res = await fetch(opts.url);
                const arr = await res.arrayBuffer();
                const buffer = await ctx.decodeAudioData(arr.slice(0));
                if (cancelled) return;
                bufferRef.current = buffer;

                const regions = analyze(buffer);
                regionsRef.current = regions;
                opts.onAutoMap?.(regions);
                readyRef.current = true;
                setReady(true);
            } catch (e) {
                console.error("useAnimaleseSpriteAuto: load/analyze failed", e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [ensureCtx, analyze, opts.url, opts.onAutoMap]);

    const schedule = useCallback((
        ctx: AudioContext,
        when: number,
        region: Region,
        playbackRate: number,
        gainValue: number,
        maxDurMs: number
    ) => {
        const source = ctx.createBufferSource();
        const buf = bufferRef.current!;
        source.buffer = buf;
        source.playbackRate.value = playbackRate;

        const gain = ctx.createGain();
        const attack = 0.004;
        const release = 0.035;

        const sliceDur = region.duration;
        const durSec = Math.min(maxDurMs / 1000, sliceDur / playbackRate);

        gain.gain.setValueAtTime(0.0001, when);
        gain.gain.linearRampToValueAtTime(gainValue, when + attack);
        gain.gain.setTargetAtTime(0.0001, when + Math.max(0.01, durSec - release), release);

        source.connect(gain);
        gain.connect(ctx.destination);

        activeSourcesRef.current.add(source);
        const cleanUpSource = () => {
            try {
                source.disconnect();
            } catch {
            }
            activeSourcesRef.current.delete(source);
        };
        source.onended = cleanUpSource;

        source.start(when, region.start, Math.min(sliceDur, durSec * playbackRate));
        source.stop(when + durSec + 0.02);
        return durSec;
    }, []);

    const stop = useCallback(() => {
        currentAbortRef.current?.abort();

        const set = activeSourcesRef.current;
        set.forEach(s => {
            try {
                s.stop();
            } catch {
            }
            try {
                s.disconnect();
            } catch {
            }
        });
        set.clear();
    }, []);

    const speak = useCallback(async (text: string) => {
        if (!text) return;
        const ctx = await ensureCtx();
        const buf = bufferRef.current;
        const regions = regionsRef.current;
        if (!buf || !regions || regions.length === 0) return;

        stop();
        const aborter = new AbortController();
        currentAbortRef.current = aborter;

        let t = ctx.currentTime + 0.02;
        const baseMs = Math.max(25, opts.charMs);
        const letters = opts.letters;

        for (const raw of text) {
            if (aborter.signal.aborted) break;

            if (raw === " ") {
                t += opts.spacePauseMs / 1000;
                continue;
            }
            if (raw === "\n" || raw === "\r") {
                t += (opts.spacePauseMs + opts.punctuationPauseMs) / 1000;
                continue;
            }

            const low = raw.toLowerCase();
            const isLetter = /[a-z]/.test(low);
            const isUpper = raw !== low;
            const isVowel = /[aeiou]/.test(low);
            const isPunct = /[.,!?;:]/.test(raw);

            let region: Region | null = null;
            if (isLetter) {
                const idx = letters.indexOf(low);
                if (idx >= 0 && idx < regions.length) region = regions[idx];
            }
            if (!region) region = regions[0];

            const playbackRate =
                Math.max(
                    0.5,
                    (opts.pitchBase ?? 1) +
                    (isVowel ? 0.03 : 0) +
                    (isUpper ? (opts.uppercaseBoost ?? 0) : 0) +
                    ((Math.random() * 2 - 1) * (opts.pitchVar ?? 0.05))
                );

            const gainValue = Math.min(1, Math.max(0, (opts.volume ?? 0.55) * (isUpper ? 1.05 : 1.0)));
            const charMs = isVowel ? baseMs * 1.05 : isLetter ? baseMs * 0.95 : baseMs;

            const consumed = schedule(ctx, t, region, playbackRate, gainValue, charMs);
            t += consumed;
            if (isPunct) t += (opts.punctuationPauseMs ?? 80) / 1000;
        }
    }, [ensureCtx, schedule, stop, opts]);

    useEffect(() => () => stop(), [stop]);

    return {speak, stop, ready} as const;
}
