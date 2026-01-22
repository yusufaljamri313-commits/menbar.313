"use client";
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    if (loading || !user) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>جاري التحميل...</div>;

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>أهلاً بك، {user.name}</h1>
                    <p>لوحة التحكم الشخصية</p>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px 30px' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>رصيدك الحالي</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{user.credits} كريديت</div>
                    </div>
                    <Link href="/pricing" className="btn btn-outline">
                        ترقية الرصيد
                    </Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                {/* Actions */}
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ marginBottom: '20px' }}>جاهز لإنتاج عملك الجديد؟</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                        <Link href="/mix?type=internal" className="btn btn-primary">
                            مكساج داخلي (مأتم)
                        </Link>
                        <Link href="/mix?type=external" className="btn btn-primary" style={{ filter: 'hue-rotate(15deg)' }}>
                            مكساج خارجي (لطم)
                        </Link>
                        <Link href="/srt" className="btn btn-primary" style={{ filter: 'hue-rotate(180deg)' }}>
                            مزامنة القصائد (SRT)
                        </Link>
                        <Link href="/image-gen" className="btn btn-primary" style={{ filter: 'hue-rotate(240deg)' }}>
                            استوديو الصور (AI)
                        </Link>
                    </div>
                </div>

                {/* History */}
                <div>
                    <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>سجل العمليات السابقة</h3>
                    {user.history.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '20px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)' }}>
                            لم تقم بأي عمليات مكساج بعد.
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {user.history.map((item, index) => (
                                <div key={index} className="card" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{item.name || 'مشروع بدون اسم'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.date} • {item.type}</div>
                                    </div>
                                    <div>
                                        <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>مكتمل</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
