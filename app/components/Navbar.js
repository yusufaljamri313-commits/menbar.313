"use client";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link href="/" className="logo">
                    <h2 style={{ color: 'var(--primary)', margin: 0 }}>صوت العزاء</h2>
                </Link>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <Link href="/" className="nav-link">الرئيسية</Link>
                    <Link href="/pricing" className="nav-link">الباقات</Link>
                    {user && (
                        <>
                            <Link href="/dashboard" className="nav-link">لوحة التحكم</Link>
                            <Link href="/srt" className="nav-link">SRT</Link>
                            <Link href="/image-gen" className="nav-link">الصور</Link>
                        </>
                    )}

                    {user ? (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Link href="/profile" className="badge" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                                {user.credits} كريديت
                            </Link>
                            <button onClick={logout} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                خروج
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                            دخول
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
