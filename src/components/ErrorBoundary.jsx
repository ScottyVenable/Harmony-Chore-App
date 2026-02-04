import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 font-sans">
                    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertCircle size={32} />
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-4 text-sm">
                            We encountered an unexpected error. Please try reloading the app.
                        </p>
                        <div className="bg-gray-100 p-3 rounded-lg text-left text-xs font-mono text-gray-600 mb-4 overflow-auto max-h-24">
                            {this.state.error?.toString()}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
                        >
                            Reload App
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
