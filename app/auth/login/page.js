"use client";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loginWithGoogle, loading } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            // ترجمة الأخطاء
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('البيانات غير صحيحة');
            } else {
                setError('حدث خطأ: ' + err.message);
            }
        }
    };

    const handleGoogle = async () => {
        setError('');
        try {
            await loginWithGoogle();
            router.push('/dashboard');
        } catch (err) {
            setError('فشل الدخول بحساب جوجل');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>تسجيل الدخول</h2>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

                <button
                    onClick={handleGoogle}
                    className="btn"
                    style={{
                        width: '100%',
                        marginBottom: '20px',
                        display: 'flex',
                        gap: '10px',
                        background: '#fff',
                        color: '#000',
                        justifyContent: 'center',
                        border: '1px solid #ccc'
                    }}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    دخول عبر Google
                </button>

                <div style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-secondary)' }}>- أو -</div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        className="input-field"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="كلمة المرور"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? '...' : 'دخول'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p>ليس لديك حساب؟ <Link href="/auth/register" style={{ color: 'var(--primary)' }}>أنشئ حساب جديد</Link></p>
                </div>
            </div>
        </div>
    );
}
