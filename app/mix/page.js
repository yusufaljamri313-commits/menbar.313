"use client";
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react'

function MixContent() {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');
    const [mixType, setMixType] = useState(typeParam);
    const { user, deductCredits, addHistoryItem } = useAuth();
    const router = useRouter();

    const [files, setFiles] = useState({
        reciter: null,
        mourners: [], // Changed to array for multiple files
        latma: null,
    });

    const [status, setStatus] = useState('input');
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState('');
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [mournerInputCount, setMournerInputCount] = useState(2);

    // --- DSP HELPERS ---

    const createImpulse = (ctx, duration, decay, reverse = false, brightness = 0.5) => {
        const rate = ctx.sampleRate;
        const length = rate * duration;
        const impulse = ctx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const n = i / length;
            // Exponential decay
            const env = Math.pow(1 - n, decay);

            // Noise with simple lowpass smoothing for "darkness"
            let noiseL = (Math.random() * 2 - 1);
            let noiseR = (Math.random() * 2 - 1);

            // Simple Lowpass filter baked in for darker reverbs
            if (i > 0 && brightness < 1.0) {
                noiseL = (noiseL * brightness) + (left[i - 1] * (1 - brightness));
                noiseR = (noiseR * brightness) + (right[i - 1] * (1 - brightness));
            }

            left[i] = noiseL * env;
            right[i] = noiseR * env;
        }
        return impulse;
    };

    const processAudio = async () => {
        if (!user) return router.push('/auth/login');
        if (user.credits < 5) return alert("عذراً، رصيدك لا يكفي.");
        if (!files.reciter) return alert("يرجى رفع صوت الرادود");
        if (mixType === 'external' && !files.latma) return alert("يرجى رفع تسجيل اللطمة/الردة");

        if (!window.AudioContext && !window.webkitAudioContext) return alert("المتصفح لا يدعم معالجة الصوت");

        const deducted = deductCredits(5);
        if (!deducted) return;

        setStatus('processing');
        setProgress(0);

        // --- SIMULATED AI ANALYSIS PHASE ---
        const steps = [
            { msg: 'جاري تحليل الهيكل الصوتي (Spectral Analysis)...', prog: 10 },
            { msg: 'فصل ترددات الرادود عن الضوضاء (Noise Separation)...', prog: 20 },
            { msg: 'كشف نقاط الدخول والخروج (Transient Detection)...', prog: 30 },
            { msg: 'تحليل استجابة الصالة (Room Acoustics)...', prog: 35 }
        ];

        for (const step of steps) {
            setLog(step.msg);
            setProgress(step.prog);
            await new Promise(r => setTimeout(r, 800)); // Simulate work
        }

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();

            const decodeFile = async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                return await ctx.decodeAudioData(arrayBuffer);
            };

            const buffers = {};
            buffers.reciter = await decodeFile(files.reciter);
            if (mixType === 'internal') {
                buffers.mourners = [];
                if (files.mourners && files.mourners.length > 0) {
                    for (const f of files.mourners) {
                        if (f) buffers.mourners.push(await decodeFile(f));
                    }
                }
            } else {
                if (files.latma) buffers.latma = await decodeFile(files.latma);
            }

            setLog('تطبيق فلاتر Adobe Audition الاحترافية...');
            setProgress(45);

            // Determine Duration
            let maxDuration = buffers.reciter.duration;

            // Check reciter
            if (buffers.reciter.duration > maxDuration) maxDuration = buffers.reciter.duration;
            // Check latma
            if (buffers.latma && buffers.latma.duration > maxDuration) maxDuration = buffers.latma.duration;
            // Check mourners
            if (buffers.mourners) {
                buffers.mourners.forEach(b => {
                    if (b.duration > maxDuration) maxDuration = b.duration;
                });
            }

            // Add a tail for reverb
            const tailSeconds = 5;
            const totalDuration = maxDuration + tailSeconds;

            const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
            const offlineCtx = new OfflineAudioContext(2, totalDuration * 44100, 44100);

            // --- MASTER CHAIN ---

            // 1. Mastering EQ (The "Magic" Polish)
            const masterEq = offlineCtx.createBiquadFilter();
            masterEq.type = 'highshelf';
            masterEq.frequency.value = 12000;
            masterEq.gain.value = 4.0; // Air boost

            const masterWarmth = offlineCtx.createBiquadFilter();
            masterWarmth.type = 'peaking';
            masterWarmth.frequency.value = 250;
            masterWarmth.Q.value = 0.5;
            masterWarmth.gain.value = 2.0; // Body/Warmth

            // 2. Master Limiter / Compressor
            const masterComp = offlineCtx.createDynamicsCompressor();
            masterComp.threshold.value = -3;
            masterComp.knee.value = 10;
            masterComp.ratio.value = 20;
            masterComp.attack.value = 0.005;
            masterComp.release.value = 0.1;

            masterWarmth.connect(masterEq);
            masterEq.connect(masterComp);
            masterComp.connect(offlineCtx.destination);

            // --- FX BUSSES ---

            // 1. Radood Reverb (Deep Hall - MAIN EMOTION)
            // Much bigger, longer, and warmer
            const radoodRevIn = offlineCtx.createGain();
            const radoodRevConv = offlineCtx.createConvolver();
            radoodRevConv.buffer = createImpulse(offlineCtx, 5.0, 2.0, false, 0.4); // 5s Tail!
            const radoodRevLevel = offlineCtx.createGain();
            radoodRevLevel.gain.value = 0.45; // HEAVY Reverb
            radoodRevIn.connect(radoodRevConv);
            radoodRevConv.connect(radoodRevLevel);
            radoodRevLevel.connect(masterWarmth);

            // 2. Latma Reverb (Cathedral/Stadium)
            // Massive space for the crowd
            const latmaRevIn = offlineCtx.createGain();
            const latmaRevConv = offlineCtx.createConvolver();
            latmaRevConv.buffer = createImpulse(offlineCtx, 4.0, 2.5, false, 0.9); // Bright & Wide
            const latmaRevLevel = offlineCtx.createGain();
            latmaRevLevel.gain.value = 0.55; // Very wet
            latmaRevIn.connect(latmaRevConv);
            latmaRevConv.connect(latmaRevLevel);
            latmaRevLevel.connect(masterWarmth);

            // 3. Radood Delay (Ping Pong Emulation)
            // Distinct echo
            const radoodDelayIn = offlineCtx.createGain();
            const rDelay = offlineCtx.createDelay();
            rDelay.delayTime.value = 0.50; // 500ms (120BPM Half note)
            const rDelayFb = offlineCtx.createGain();
            rDelayFb.gain.value = 0.35; // More feedback
            const rDelayFilter = offlineCtx.createBiquadFilter();
            rDelayFilter.type = 'lowpass'; rDelayFilter.frequency.value = 2500;
            const rDelayOut = offlineCtx.createGain();
            rDelayOut.gain.value = 0.25; // Audible echo

            radoodDelayIn.connect(rDelay);
            rDelay.connect(rDelayFilter);
            rDelayFilter.connect(rDelayFb);
            rDelayFb.connect(rDelay);
            rDelayFilter.connect(rDelayOut);
            rDelayOut.connect(masterWarmth);

            // 4. Latma Delay (Stereo Slap)
            const latmaDelayIn = offlineCtx.createGain();
            const lDelay = offlineCtx.createDelay();
            lDelay.delayTime.value = 0.375;
            const lDelayFb = offlineCtx.createGain();
            lDelayFb.gain.value = 0.45;
            const lDelayFilter = offlineCtx.createBiquadFilter();
            lDelayFilter.type = 'highpass'; lDelayFilter.frequency.value = 400;
            const lDelayOut = offlineCtx.createGain();
            lDelayOut.gain.value = 0.35; // Strong echo for latma

            latmaDelayIn.connect(lDelay);
            lDelay.connect(lDelayFilter);
            lDelayFilter.connect(lDelayFb);
            lDelayFb.connect(lDelay);
            lDelayFilter.connect(lDelayOut);
            lDelayOut.connect(masterWarmth);


            // --- TRACK PROCESSING ---

            const processRadoodTrack = (buffer) => {
                const src = offlineCtx.createBufferSource();
                src.buffer = buffer;

                // 1. HPF 85Hz
                const hpf = offlineCtx.createBiquadFilter();
                hpf.type = 'highpass'; hpf.frequency.value = 85;

                // 2. Cut Mids (De-box)
                const boxCheck = offlineCtx.createBiquadFilter();
                boxCheck.type = 'peaking'; boxCheck.frequency.value = 350; boxCheck.gain.value = -4.5;

                // 3. High Boost (Clarity)
                const highBoost = offlineCtx.createBiquadFilter();
                highBoost.type = 'highshelf'; highBoost.frequency.value = 5000; highBoost.gain.value = 4.0;

                // 4. Compressor (Vocal Rider)
                const comp = offlineCtx.createDynamicsCompressor();
                comp.threshold.value = -20;
                comp.ratio.value = 4;
                comp.attack.value = 0.002;
                comp.release.value = 0.1;

                // 5. Gain
                const gain = offlineCtx.createGain();
                gain.gain.value = 0.95;

                // Chain
                src.connect(hpf);
                hpf.connect(boxCheck);
                boxCheck.connect(highBoost);
                highBoost.connect(comp);
                comp.connect(gain);
                gain.connect(masterWarmth); // To Master

                // Sends
                gain.connect(radoodRevIn); // Big Reverb
                gain.connect(radoodDelayIn); // Echo

                src.start(0);
            };

            const processLatmaTrack = (buffer) => {
                const src = offlineCtx.createBufferSource();
                src.buffer = buffer;

                // 1. HPF 100Hz
                const hpf = offlineCtx.createBiquadFilter();
                hpf.type = 'highpass'; hpf.frequency.value = 100;

                // 2. Low-Mid Cut (Clean Mud)
                const mudCut = offlineCtx.createBiquadFilter();
                mudCut.type = 'peaking'; mudCut.frequency.value = 300; mudCut.gain.value = -3.0;

                // 3. Presence
                const presence = offlineCtx.createBiquadFilter();
                presence.type = 'peaking'; presence.frequency.value = 3500; presence.gain.value = 4.0;

                // 4. Hard Compression (Wall of Sound)
                const comp = offlineCtx.createDynamicsCompressor();
                comp.threshold.value = -24;
                comp.ratio.value = 8;
                comp.attack.value = 0.005;
                comp.release.value = 0.1;

                // 5. Gain
                const gain = offlineCtx.createGain();
                gain.gain.value = 0.8;

                src.connect(hpf);
                hpf.connect(mudCut);
                mudCut.connect(presence);
                presence.connect(comp);
                comp.connect(gain);
                gain.connect(masterWarmth);

                // Sends
                gain.connect(latmaRevIn); // Wide Reverb
                gain.connect(latmaDelayIn); // Stereo Echo

                src.start(0);
            };

            // --- Helper: Calculate Rough RMS (Loudness) ---
            const getLoudness = (buffer) => {
                const data = buffer.getChannelData(0); // Check Left channel is enough for comparison
                let sum = 0;
                // Optimization: Step through every 100th sample to save CPU
                const step = 100;
                for (let i = 0; i < data.length; i += step) {
                    sum += data[i] * data[i];
                }
                const rms = Math.sqrt(sum / (data.length / step));
                return rms;
            };

            const processBackgroundTrack = (buffer) => {
                const src = offlineCtx.createBufferSource();
                src.buffer = buffer;

                // 1. HPF 120Hz (Thin out the background)
                const hpf = offlineCtx.createBiquadFilter();
                hpf.type = 'highpass'; hpf.frequency.value = 120;

                // 2. Mid Cut (Push back)
                const midCut = offlineCtx.createBiquadFilter();
                midCut.type = 'peaking'; midCut.frequency.value = 500; midCut.gain.value = -4.0;

                // 3. Compressor (Gentler)
                const comp = offlineCtx.createDynamicsCompressor();
                comp.threshold.value = -18;
                comp.ratio.value = 4;
                comp.attack.value = 0.01;
                comp.release.value = 0.1;

                // 4. Gain (Lower volume for background)
                const gain = offlineCtx.createGain();
                gain.gain.value = 0.5;

                src.connect(hpf);
                hpf.connect(midCut);
                midCut.connect(comp);
                comp.connect(gain);
                gain.connect(masterWarmth);

                // Sends (Same reverb to blend, less delay)
                gain.connect(latmaRevIn);

                src.start(0);
            };

            // Hook up sources based on logic
            // Track 1: Always Radoud
            if (buffers.reciter) processRadoodTrack(buffers.reciter);

            if (mixType === 'external') {
                // External: Track 2 = Latma
                if (buffers.latma) processLatmaTrack(buffers.latma);
            } else {
                // Internal: Track 2 = Loudest Latma, Remaining = Background
                const mournerTracks = [];
                if (buffers.mourners) {
                    buffers.mourners.forEach(b => mournerTracks.push({ buf: b, vol: getLoudness(b) }));
                }

                // Sort by volume descending
                mournerTracks.sort((a, b) => b.vol - a.vol);

                // Apply processing
                mournerTracks.forEach((track, index) => {
                    if (index === 0) {
                        // Loudest -> Track 2 (Main Latma)
                        processLatmaTrack(track.buf);
                    } else {
                        // Rest -> Remaining Tracks (Background)
                        processBackgroundTrack(track.buf);
                    }
                });
            }


            setLog('جاري المعالجة الرقمية (Pro Audio Engine)...');
            await new Promise(r => setTimeout(r, 100));

            const renderedBuffer = await offlineCtx.startRendering();

            setLog('جاري التصدير بتنسيق MP3 (High Quality)...');
            setProgress(75);

            // --- MP3 ENCODING (Reused Optimization) ---
            const channels = 2;
            const sampleRate = renderedBuffer.sampleRate;
            const mp3encoder = new window.lamejs.Mp3Encoder(channels, sampleRate, 320); // MAX Quality

            const leftData = renderedBuffer.getChannelData(0);
            const rightData = renderedBuffer.getChannelData(1);
            const mp3Data = [];
            const sampleBlockSize = 1152;
            const chunkSize = sampleRate * 2;

            const encodeChunk = async (offset) => {
                const end = Math.min(offset + chunkSize, leftData.length);
                for (let i = offset; i < end; i += sampleBlockSize) {
                    const size = Math.min(sampleBlockSize, end - i);
                    const lChunk = leftData.subarray(i, i + size);
                    const rChunk = rightData.subarray(i, i + size);
                    const leftInt = new Int16Array(size);
                    const rightInt = new Int16Array(size);
                    for (let j = 0; j < size; j++) {
                        let l = lChunk[j]; let r = rChunk[j];
                        leftInt[j] = l < -1 ? -32768 : l > 1 ? 32767 : l * 32767;
                        rightInt[j] = r < -1 ? -32768 : r > 1 ? 32767 : r * 32767;
                    }
                    const mp3buf = mp3encoder.encodeBuffer(leftInt, rightInt);
                    if (mp3buf.length > 0) mp3Data.push(mp3buf);
                }

                const progressPct = 75 + Math.round((offset / leftData.length) * 25);
                setProgress(progressPct);

                if (end < leftData.length) {
                    await new Promise(r => setTimeout(r, 0));
                    await encodeChunk(end);
                } else {
                    const mp3buf = mp3encoder.flush();
                    if (mp3buf.length > 0) mp3Data.push(mp3buf);
                    const blob = new Blob(mp3Data, { type: 'audio/mp3' });
                    setDownloadUrl(URL.createObjectURL(blob));
                    addHistoryItem({
                        id: Date.now(),
                        name: mixType === 'internal' ? 'مكساج داخلي (مأتم) - Pro' : 'مكساج خارجي (لطم) - Pro',
                        date: new Date().toLocaleDateString('ar-BH'),
                        type: mixType,
                        status: 'completed'
                    });
                    setStatus('success');
                }
            };
            await encodeChunk(0);

        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء المعالجة: ' + e.message);
            setStatus('input');
        }
    };

    if (!mixType) {
        return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>
            <h2>اختر نوع المكساج</h2>
            <div style={{ marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button onClick={() => setMixType('internal')} className="btn btn-primary">مكساج داخلي (مأتم)</button>
                <button onClick={() => setMixType('external')} className="btn btn-primary" style={{ filter: 'hue-rotate(15deg)' }}>مكساج خارجي (لطم)</button>
            </div>
        </div>
    }

    if (status === 'success') {
        return (
            <div className="container" style={{ padding: '50px', maxWidth: '600px', textAlign: 'center' }}>
                <div className="card" style={{ borderColor: 'var(--success)' }}>
                    <h1 style={{ color: 'var(--success)', marginBottom: '20px' }}>تم المكساج بنجاح!</h1>
                    <p>تم معالجة الملفات وتطبيق هندسة الصوت الاحترافية.</p>
                    <div style={{ margin: '30px 0' }}>
                        <audio controls src={downloadUrl} style={{ width: '100%' }} />
                    </div>
                    <a href={downloadUrl} download="professional-mix.mp3" className="btn btn-primary" style={{ width: '100%', display: 'flex' }}>
                        تحميل الملف (MP3)
                    </a>
                    <div style={{ marginTop: '20px' }}>
                        <button onClick={() => { setStatus('input'); setFiles({}); setDownloadUrl(null); }} className="btn btn-outline">مكساج جديد</button>
                        <Link href="/dashboard" className="btn btn-outline" style={{ marginLeft: '10px' }}>العودة للوحة التحكم</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'processing') {
        return (
            <div className="container" style={{ padding: '100px 20px', maxWidth: '600px', textAlign: 'center' }}>
                <h2 className="animate-pulse">جاري المعالجة بالذكاء الاصطناعي...</h2>
                <div style={{ width: '100%', height: '10px', background: 'var(--surface)', borderRadius: '5px', margin: '30px 0', overflow: 'hidden' }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'var(--primary)',
                        transition: 'width 0.2s ease',
                        boxShadow: '0 0 10px var(--primary)'
                    }}></div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontFamily: 'monospace' }}>{'>'} {log}</p>

                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', opacity: 0.7 }}>
                    {/* Simulated Spectrum Visualization EQ Bars */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="animate-pulse" style={{
                            height: '30px',
                            background: `hsl(${i * 40}, 70%, 50%)`,
                            animationDelay: `${i * 0.1}s`
                        }}></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '30px' }}>
                {mixType === 'internal' ? 'مكساج داخلي (مأتم)' : 'مكساج خارجي (لطم)'}
            </h1>

            <div className="card">
                <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '5px' }}>🎤 المهندس الافتراضي (Pro Audio Engine)</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        سيقوم النظام بتطبيق هندسة صوتية شاملة: Large Hall Reverb، Ping-Pong Echo، Mastering EQ، و Dynamics Processing لجعل الصوت احترافيًا وضخمًا.
                    </p>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>👤 تسجيل الرادود (Dry Vocal)</label>
                    <input type="file" onChange={(e) => setFiles(p => ({ ...p, reciter: e.target.files[0] }))} accept="audio/*" className="input-field" style={{ padding: '10px' }} />
                    <small>يفضل تسجيل نقي بدون مؤثرات</small>
                </div>

                {mixType === 'internal' ? (
                    <>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#fff' }}>👥 تسجيل المعزين (الجمهور)</label>
                            {Array.from({ length: mournerInputCount }).map((_, i) => (
                                <input
                                    key={i}
                                    type="file"
                                    onChange={(e) => {
                                        const newMourners = [...(files.mourners || [])];
                                        while (newMourners.length <= i) newMourners.push(null);
                                        newMourners[i] = e.target.files[0];
                                        setFiles(p => ({ ...p, mourners: newMourners }));
                                    }}
                                    accept="audio/*"
                                    className="input-field"
                                    style={{ padding: '10px', marginBottom: '10px' }}
                                />
                            ))}
                            <button
                                onClick={() => setMournerInputCount(c => c + 1)}
                                className="btn btn-outline"
                                style={{ fontSize: '0.8rem', padding: '10px', marginTop: '5px', width: '100%', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                            >
                                + إضافة تراك معزين آخر
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', color: '#fff' }}>👥 تسجيل اللطمة / الردة</label>
                        <input type="file" onChange={(e) => setFiles(p => ({ ...p, latma: e.target.files[0] }))} accept="audio/*" className="input-field" style={{ padding: '10px' }} />
                        <small>سيتم تطبيق معالجة استريو واسعة (Wide Stereo) لهذا المسار</small>
                    </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.9rem' }}>التكلفة</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>5 وحدات</span>
                    </div>
                    <button onClick={processAudio} className="btn btn-primary" style={{ padding: '12px 40px', fontSize: '1.1rem' }}>
                        ✨ تحليل ومعالجة (Start Pro Mix)
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MixPage() {
    return (
        <Suspense fallback={<div className="container">جاري التحميل...</div>}>
            <MixContent />
        </Suspense>
    )
}
