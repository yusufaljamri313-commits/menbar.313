"use client";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Pricing() {
    const { addCredits, user } = useAuth();
    const router = useRouter();
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [paymentStep, setPaymentStep] = useState('select'); // select, processing, success

    const packages = [
        { id: 1, price: 5, credits: 25, name: "الباقة الأساسية", color: '#ffffff' },
        { id: 2, price: 15, credits: 35, name: "الباقة المتقدمة", color: '#d4af37' },
        { id: 3, price: 20, credits: 50, name: "باقة المحترفين", color: '#000000', border: true }
    ];

    const openPayment = (pkg) => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        setSelectedPackage(pkg);
        setPaymentStep('select');
    };

    const processPayment = async (method) => {
        setPaymentStep('processing');
        // Simulate Payment Gateway
        await new Promise(r => setTimeout(r, 2500));

        // Success
        setPaymentStep('success');
        addCredits(selectedPackage.credits);

        // Redirect after a moment
        setTimeout(() => {
            router.push('/dashboard');
        }, 3000);
    };

    return (
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '10px' }}>باقات الشحن</h1>
            <p style={{ marginBottom: '50px' }}>ادفع مرة واحدة، واستخدم الرصيد في أي وقت. لا توجد اشتراكات شهرية.</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
                {packages.map((pkg) => (
                    <div key={pkg.id} className="card" style={{
                        width: '300px',
                        padding: '40px 20px',
                        border: pkg.border ? '2px solid var(--primary)' : '1px solid var(--border)',
                        transform: pkg.border ? 'scale(1.05)' : 'none',
                        position: 'relative'
                    }}>
                        {pkg.border && <div className="badge" style={{ position: 'absolute', top: '-15px', right: '50%', transform: 'translateX(50%)', background: 'var(--primary)', color: '#000' }}>الأكثر طلباً</div>}

                        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{pkg.name}</h2>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '20px 0', color: 'var(--primary)' }}>
                            ${pkg.price}
                        </div>
                        <div style={{ fontSize: '1.2rem', marginBottom: '30px', fontWeight: 'bold' }}>
                            {pkg.credits} كريديت
                        </div>

                        <ul style={{ textAlign: 'right', marginBottom: '30px', listStyle: 'none', paddingRight: '20px' }}>
                            <li style={{ marginBottom: '10px' }}>✅ جودة صوت عالية</li>
                            <li style={{ marginBottom: '10px' }}>✅ مكساج بالذكاء الاصطناعي</li>
                            <li style={{ marginBottom: '10px' }}>✅ دعم فني سريع</li>
                        </ul>

                        <button
                            onClick={() => openPayment(pkg)}
                            className={`btn ${pkg.border ? 'btn-primary' : 'btn-outline'}`}
                            style={{ width: '100%' }}
                        >
                            شراء الآن
                        </button>
                    </div>
                ))}
            </div>

            {/* PAYMENT MODAL */}
            {selectedPackage && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '500px', animation: 'fadeIn 0.3s' }}>

                        {/* HEADER */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                            <h3>الدفع الآمن</h3>
                            <button onClick={() => !['processing', 'success'].includes(paymentStep) && setSelectedPackage(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {/* CONTENT */}
                        {paymentStep === 'select' && (
                            <>
                                <p style={{ marginBottom: '20px' }}>اختر وسيلة الدفع لإتمام عملية شراء <strong>{selectedPackage.name}</strong> بقيمة <strong>${selectedPackage.price}</strong></p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <button onClick={() => processPayment('benefit')} style={{
                                        display: 'flex', alignItems: 'center', gap: '15px', padding: '15px',
                                        background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                        fontSize: '1.1rem', fontWeight: 'bold'
                                    }}>
                                        <div style={{ width: '40px', height: '40px', background: '#d6001a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>B</div>
                                        BenefitPay (للبحرين)
                                    </button>

                                    <button onClick={() => processPayment('card')} style={{
                                        display: 'flex', alignItems: 'center', gap: '15px', padding: '15px',
                                        background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                        fontSize: '1.1rem', fontWeight: 'bold'
                                    }}>
                                        <div style={{ width: '40px', height: '40px', background: '#1a1f71', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem' }}>VISA</div>
                                        Visa / MasterCard
                                    </button>
                                </div>
                            </>
                        )}

                        {paymentStep === 'processing' && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div className="animate-spin" style={{ width: '50px', height: '50px', border: '5px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 20px' }}></div>
                                <h3>جاري معالجة الدفع...</h3>
                                <p>يرجى الانتظار، لا تقم بإغلاق الصفحة</p>
                            </div>
                        )}

                        {paymentStep === 'success' && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>✅</div>
                                <h3 style={{ color: 'var(--success)' }}>تم الدفع بنجاح!</h3>
                                <p style={{ marginTop: '10px' }}>تم تحويل المبلغ إلى الحساب: <span style={{ fontFamily: 'monospace', background: '#333', padding: '2px 5px', borderRadius: '4px' }}>BH51ALSA...</span></p>
                                <p>تم إضافة {selectedPackage.credits} كريديت إلى حسابك.</p>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}
