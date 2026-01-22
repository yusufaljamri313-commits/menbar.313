"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ImageGenPage() {
    const { user, deductCredits, addHistoryItem, loading } = useAuth();
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!loading && !user) router.push('/auth/login');
    }, [user, loading, router]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return alert('يرجى إدخال وصف');
        if (user.credits < 3) return alert('رصيدك لا يكفي (يحتاج 3 كريديت)');

        setGenerating(true);
        setProgress(10);

        try {
            const success = await deductCredits(3);
            if (!success) throw new Error('Deduction failed');

            const response = await fetch('/api/image-gen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, aspectRatio })
            });

            if (!response.ok) throw new Error('Failed to generate');

            const data = await response.json();

            setProgress(100);
            setResult(data.imageUrl);

            addHistoryItem({
                id: Date.now(),
                name: prompt.substring(0, 30) + '...',
                date: new Date().toLocaleDateString('ar-BH'),
                url: data.imageUrl,
                status: 'completed',
                type: 'image'
            });

        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء الإنشاء');
        } finally {
            setGenerating(false);
        }
    };

    if (loading || !user) return null;

    return (
        <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1200px' }}>
            <h1 style={{ marginBottom: '30px' }}>🎨 استوديو الصور الذكي (AI Image)</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '10px' }}>وصف الصورة (Prompt)</label>
                        <textarea
                            className="input-field"
                            style={{ height: '150px', resize: 'none' }}
                            placeholder="صف الصورة التي تتخيلها..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '10px' }}>الأبعاد</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['1:1', '9:16', '16:9'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setAspectRatio(r)}
                                    className={`btn ${aspectRatio === r ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ flex: 1, padding: '8px' }}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '15px' }}
                    >
                        {generating ? 'جاري الرسم...' : 'إنشاء التصميم الآن'}
                    </button>
                    <button onClick={() => router.push('/dashboard')} className="btn btn-outline" style={{ width: '100%' }}>رجوع</button>
                </div>

                <div className="card" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    {generating && (
                        <div style={{ width: '100%' }}>
                            <div className="animate-spin" style={{ fontSize: '3rem', marginBottom: '20px' }}>🎨</div>
                            <h3>جاري الرسم السحابي...</h3>
                        </div>
                    )}

                    {!generating && result && (
                        <div style={{ width: '100%' }}>
                            <img src={result} alt="Generated" style={{ width: '100%', borderRadius: '12px', marginBottom: '20px' }} />
                            <a href={result} download className="btn btn-primary" style={{ width: '100%' }}>تحميل الصورة</a>
                            <button onClick={() => setResult(null)} className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }}>عمل جديد</button>
                        </div>
                    )}

                    {!generating && !result && (
                        <div style={{ opacity: 0.5 }}>
                            <div style={{ fontSize: '4rem' }}>✨</div>
                            <p>أدخل الوصف واضغط إنشاء لرؤية النتيجة</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
