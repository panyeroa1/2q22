'use client';

import ControlTray from '../components/console/control-tray/ControlTray';
import ErrorScreen from '../components/demo/ErrorScreen';
import StreamingConsole from '../components/demo/streaming-console/StreamingConsole';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { LiveAPIProvider } from '../contexts/LiveAPIContext';

export default function Home() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        return (
            <div className="App error-screen">
                <Header />
                <main className="error-main">
                    <h2 className="error-title">Configuration Error</h2>
                    <p className="error-message">
                        A Gemini API Key must be set to run the interpreter. <br />
                        Please set <code>NEXT_PUBLIC_GEMINI_API_KEY</code> in your environment or <code>.env.local</code> file.
                    </p>
                    <div className="error-hint">
                        Ensure the variable is prefixed with <code>NEXT_PUBLIC_</code> to be accessible in the browser.
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="App success-class-container">
            <LiveAPIProvider apiKey={apiKey}>
                <ErrorScreen />
                <div className="success-class-grid">
                    {/* LEFT COLUMN: PRIMARY HOST */}
                    <aside className="sc-card">
                        <div className="sc-card-header">
                            <span className="sc-card-title">PRIMARY HOST</span>
                            <span className="icon">keyboard_double_arrow_left</span>
                        </div>
                        <div className="sc-card-body">
                            <div className="host-placeholder" style={{
                                width: '100%',
                                aspectRatio: '16/9',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                <span className="sc-badge" style={{ position: 'absolute', top: '12px', left: '12px' }}>HOST</span>
                            </div>

                            <div className="host-stats" style={{ marginTop: '20px' }}>
                                <div className="sc-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span className="sc-label">Status</span>
                                        <span className="sc-badge" style={{ background: 'none', color: var('--lime'), border: 'none' }}>Live</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span className="sc-label">Audio Pan</span>
                                        <span className="sc-badge" style={{ fontSize: '9px' }}>PAN: ON</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="sc-label">Time</span>
                                        <span style={{ fontSize: '12px', fontWeight: '700' }}>00:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* MIDDLE COLUMN: COLLABORATION FEED */}
                    <main className="flex-col" style={{ display: 'flex', gap: '12px' }}>
                        <div className="sc-card-header" style={{ padding: '0 4px' }}>
                            <span className="sc-card-title">COLLABORATION FEED</span>
                            <span className="sc-badge" style={{ background: 'rgba(0,255,0,0.1)', color: '#00ff00', border: '1px solid #00ff00' }}>Syncing</span>
                        </div>

                        <div className="sc-card" style={{ flex: 1 }}>
                            <div className="sc-card-header">
                                <span className="sc-card-title">SUCCESS FEED</span>
                                <div className="sc-target-label">
                                    TARGET: <span className="sc-target-value">--</span>
                                </div>
                            </div>
                            <div className="sc-card-body">
                                <StreamingConsole />
                            </div>
                        </div>
                    </main>

                    {/* RIGHT COLUMN: CLASSROOM */}
                    <aside className="sc-card">
                        <div className="sc-card-header">
                            <span className="sc-card-title">CLASSROOM</span>
                            <span className="icon">keyboard_double_arrow_left</span>
                        </div>
                        <div className="sc-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: var('--gray-500') }}>
                            <span className="icon" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.2 }}>person</span>
                            <span style={{ fontSize: '14px', opacity: 0.5 }}>Waiting for others...</span>
                        </div>
                    </aside>
                </div>

                <ControlTray />
            </LiveAPIProvider>
        </div>
    );
}
