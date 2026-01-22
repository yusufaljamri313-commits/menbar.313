"use client";
import Link from 'next/link';

export default function Home() {
    return (
        <div>
            {/* Hero Section */}
            <section className="hero">
                <div className="container animate-fade-in">
                    <h1 className="glow-text">
                        مكساج صوت العزاء<br />
                        <span style={{ color: 'var(--primary)' }}>بالذكاء الاصطناعي</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        حول تسجيلاتك الخام إلى إنتاج صوتي احترافي بجودة الاستوديو في دقائق.
                        مثالي للمواكب، المآتم، والرواديد.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Link href="/auth/register" className="btn btn-primary">
                            ابدأ تجربتك المجانية
                        </Link>
                        <Link href="/pricing" className="btn btn-outline">
                            عرض الباقات
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container" style={{ padding: '80px 20px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>لماذا تختار منصتنا؟</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <div className="card">
                        <h3 style={{ color: 'var(--primary)' }}>سرعة فائقة</h3>
                        <p>لا داعي لانتظار مهندسي الصوت لأيام. احصل على نتيجتك فوراً باستخدام خوارزميات الذكاء الاصطناعي المتقدمة.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ color: 'var(--primary)' }}>جودة استوديو</h3>
                        <p>نقوم بتنقية الصوت، موازنة الطبقات، وإضافة المؤثرات الخاصة (Reverb, Delay) المناسبة لأجواء العزاء.</p>
                    </div>
                    <div className="card">
                        <h3 style={{ color: 'var(--primary)' }}>سهولة الاستخدام</h3>
                        <p>صمم خصيصاً ليكون بسيطاً. ارفع ملفاتك، اختر نوع المكساج، واستلم النتيجة.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
