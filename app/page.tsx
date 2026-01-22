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
        <div className="App">
            <LiveAPIProvider apiKey={apiKey}>
                <ErrorScreen />
                <Header />
                <Sidebar />
                <div className="streaming-console">
                    <main>
                        <div className="main-app-area">
                            <StreamingConsole />
                        </div>
                        <ControlTray />
                    </main>
                </div>
            </LiveAPIProvider>
        </div>
    );
}
