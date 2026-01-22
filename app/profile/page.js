"use client";
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/auth/login');
    }, [user, loading, router]);

    if (loading || !user) return null;

    return (
        <div className="container animate-fade-in" style={{ padding: '60px 20px', maxWidth: '600px' }}>
            <div className="card">
                <h2 style={{ marginBottom: '30px', color: 'var(--primary)' }}>👤 الملف الشخصي</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--surface-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '2px solid var(--primary)' }}>
                        👤
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '5px' }}>{user.name}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                    </div>
                </div>

                <div className="card" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary)', padding: '20px', textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>الرصيد المتاح</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{user.credits} كريديت</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => router.push('/dashboard')} className="btn btn-outline">العودة للوحة التحكم</button>
                    <button onClick={() => { logout(); router.push('/'); }} className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>تسجيل الخروج</button>
                </div>
            </div>
        </div>
    );
}
