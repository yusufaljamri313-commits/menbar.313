"use client";
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register, loading } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) return setError("كلمة المرور قصيرة جداً (6 أحرف على الأقل)");

        try {
            await register(name, email, password);
            router.push('/dashboard');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('البريد الإلكتروني مستخدم بالفعل');
            } else {
                setError('حدث خطأ أثناء التسجيل');
            }
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>إنشاء حساب جديد</h2>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="الاسم الكامل"
                        className="input-field"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                        {loading ? '...' : 'تسجيل'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p>لديك حساب بالفعل؟ <Link href="/auth/login" style={{ color: 'var(--primary)' }}>تسجيل الدخول</Link></p>
                </div>
            </div>
        </div>
    );
}
