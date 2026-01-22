"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SRTPage() {
    const { user, deductCredits, addHistoryItem, loading } = useAuth();
    const router = useRouter();
    const [audioFile, setAudioFile] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioDuration, setAudioDuration] = useState(0);

    const [poemText, setPoemText] = useState('');
    const [status, setStatus] = useState('input'); // input, processing, success
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState('');
    const [accuracy, setAccuracy] = useState(0);
    const [resultFile, setResultFile] = useState(null);

    useEffect(() => {
        if (!loading && !user) router.push('/auth/login');
    }, [user, loading, router]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const audio = new Audio(url);
            audio.onloadedmetadata = () => {
                setAudioDuration(audio.duration);
                setAudioFile(file);
                setAudioUrl(url);
            };
        }
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const processSRT = async () => {
        if (!audioFile || !poemText.trim()) return alert("يرجى رفع الملف الصوتي وإدخال نص القصيدة");
        if (user.credits < 3) return alert("عذراً، رصيدك لا يكفي.");

        const success = await deductCredits(3);
        if (!success) return;

        setStatus('processing');
        setProgress(10);
        setLog("جاري الرفع لمركز المعالجة السحابي...");

        try {
            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('text', poemText);

            const response = await fetch('/api/srt', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('فشل الاتصال بالسيرفر');

            const data = await response.json();

            setLog("تم استلام النتائج من السيرفر بنجاح");
            setProgress(100);

            const blob = new Blob([data.srt], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            setResultFile(url);
            setAccuracy(data.accuracy);

            addHistoryItem({
                type: 'srt',
                name: `مزامنة سحابية: ${audioFile.name}`,
                status: 'completed',
                url: url,
                date: new Date().toLocaleDateString('ar-BH')
            });

            setTimeout(() => setStatus('success'), 600);

        } catch (e) {
            console.error(e);
            alert("خطأ في الاتصال بالسيرفر");
            setStatus('input');
        }
    };

    if (loading || !user) return null;

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1200px' }}>
            <h1 style={{ marginBottom: '30px' }}>📜 مزامنة وترجمة القصائد (SRT)</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '10px' }}>1. رفع الملف الصوتي (MP3/WAV)</label>
                        <input type="file" onChange={handleFileChange} accept="audio/*" className="input-field" />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '10px' }}>2. نص القصيدة</label>
                        <textarea
                            value={poemText}
                            onChange={(e) => setPoemText(e.target.value)}
                            placeholder="أدخل كلمات القصيدة هنا..."
                            className="input-field"
                            style={{ width: '100%', height: '150px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '12px' }}>
                        <div>تكلفة العملية: 3 كريديت</div>
                    </div>

                    <button onClick={processSRT} className="btn btn-primary" style={{ width: '100%' }}>
                        {status === 'processing' ? 'جاري المعالجة...' : 'ابدأ المزامنة الآن'}
                    </button>
                    <button onClick={() => router.push('/dashboard')} className="btn btn-outline" style={{ width: '100%' }}>رجوع</button>
                </div>

                <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', minHeight: '400px', justifyContent: 'center', alignItems: 'center' }}>
                    {status === 'input' && (
                        <div style={{ textAlign: 'center', opacity: 0.5 }}>
                            <div style={{ fontSize: '4rem' }}>🎧</div>
                            <p>بانتظار الملفات...</p>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <div style={{ width: '100%', height: '10px', background: 'var(--surface)', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s' }}></div>
                            </div>
                            <p>{log}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{ fontSize: '3rem', color: 'var(--success)' }}>✅</div>
                            <h2 style={{ marginBottom: '20px' }}>جاهز للتحميل</h2>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                <div>الدقة: {accuracy}%</div>
                            </div>
                            <a href={resultFile} download="poem.srt" className="btn btn-primary" style={{ width: '100%' }}>تحميل ملف SRT</a>
                            <button onClick={() => setStatus('input')} className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }}>عمل جديد</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
