import './globals.css'
import { Providers } from './providers'
import Navbar from './components/Navbar'

import Script from 'next/script'

export const metadata = {
    title: 'صوت العزاء - مكساج احترافي بالذكاء الاصطناعي',
    description: 'منصة مكساج صوت العزاء واللطميات الأولى بالذكاء الاصطناعي. جودة عالية للمواكب والمآتم.',
}

export default function RootLayout({ children }) {
    return (
        <html lang="ar" dir="rtl">
            <body>
                <Script src="https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js" strategy="beforeInteractive" />
                <Providers>
                    <Navbar />
                    <main style={{ minHeight: 'calc(100vh - 80px)' }}>{children}</main>
                </Providers>
            </body>
        </html>
    )
}
