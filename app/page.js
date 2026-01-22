"use client";
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UnifiedPreviewPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [view, setView] = useState('home'); // home, tools, active-tool

    return (
        <div className="animate-fade-in">
            {/* Unified Hero Section (Directly from Preview) */}
            <section className="hero">
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 className="glow-text" style={{ fontSize: '3.5rem', marginBottom: '20px' }}>
                        منصة <span style={{ color: 'var(--primary)' }}>مِنبَر</span> السحابية
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 30px' }}>
                        استوديو الذكاء الاصطناعي المتكامل لخدمة العزاء والمحتوى الديني.
                        مكساج احترافي، مزامنة قصائد، وتوليد صور إبداعية في مكان واحد.
                    </p>

                    {!user ? (
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <Link href="/auth/register" className="btn btn-primary">ابدأ مجاناً (10 كريديت)</Link>
                            <Link href="/auth/login" className="btn btn-outline">تسجيل الدخول</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <Link href="/dashboard" className="btn btn-primary">لوحة التحكم</Link>
                            <button onClick={logout} className="btn btn-outline">تسجيل الخروج</button>
                        </div>
                    )}
                </div>
            </section>

            {/* Main Tools Grid (The Interface) */}
            <section className="container" style={{ padding: '60px 20px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>أدواتنا الذكية المتصلة بالسحاب</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>

                    {/* Audio Mix Tool */}
                    <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎙️</div>
                        <h3>المكساج الصوتي (Cloud Mix)</h3>
                        <p>دمج أصوات الرواديد مع المعزين أو تراكات اللطم بتوزيع هندسي احترافي تلقائي.</p>
                        <Link href="/mix" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>فتح الأداة</Link>
                    </div>

                    {/* SRT Sync Tool */}
                    <div className="card" style={{ borderTop: '4px solid #8b5cf6' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📜</div>
                        <h3>مزامنة القصائد (SRT)</h3>
                        <p>توليد ملفات الترجمة والمزامنة آلياً من الصوت والنص بدقة متناهية.</p>
                        <Link href="/srt" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', filter: 'hue-rotate(240deg)' }}>فتح الأداة</Link>
                    </div>

                    {/* AI Image Studio */}
                    <div className="card" style={{ borderTop: '4px solid #ec4899' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎨</div>
                        <h3>استوديو الصور (AI)</h3>
                        <p>حوّل أوصافك إلى صور وتصاميم سينمائية عالية الدقة للمنشورات والمقاطع.</p>
                        <Link href="/image-gen" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', filter: 'hue-rotate(300deg)' }}>فتح الأداة</Link>
                    </div>

                </div>
            </section>

            {/* Benefits / Info */}
            <section style={{ background: 'var(--surface)', padding: '80px 0', marginTop: '60px' }}>
                <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
                    <div style={{ flex: '1', minWidth: '300px' }}>
                        <h2 style={{ color: 'var(--primary)' }}>لماذا المعالجة السحابية؟</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '15px', fontSize: '1.1rem' }}>🚀 <strong>سرعة معالجة جبارة:</strong> نستخدم أقوى السيرفرات لضمان عدم تعليق جهازك.</li>
                            <li style={{ marginBottom: '15px', fontSize: '1.1rem' }}>📱 <strong>متوافق مع كل الأجهزة:</strong> يعمل من الموبايل أو الكمبيوتر بنفس الجودة.</li>
                            <li style={{ marginBottom: '15px', fontSize: '1.1rem' }}>🔒 <strong>حماية البيانات:</strong> ملفاتك آمنة وتتم معالجتها في بيئة مشفرة.</li>
                        </ul>
                    </div>
                    <div className="card" style={{ flex: '1', minWidth: '300px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                        <h3>ابدأ الآن بـ 10 كريديت مجانية</h3>
                        <p>جرب المكساج أو توليد الصور مجاناً فور التسجيل</p>
                        <Link href="/auth/register" className="btn btn-primary" style={{ width: '200px' }}>أنشئ حسابك</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
