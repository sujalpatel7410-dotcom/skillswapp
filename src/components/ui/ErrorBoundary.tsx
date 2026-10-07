import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    showStack: boolean;
    key: number;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    /** Optional custom fallback instead of the default screen */
    fallback?: React.ReactNode;
    /** Route name shown in heading e.g. "Dashboard" */
    routeName?: string;
    onNavigateHome?: () => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showStack: false,
            key: 0,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });
        // In production you'd ship to Sentry / LogRocket here
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState(prev => ({
            hasError: false,
            error: null,
            errorInfo: null,
            showStack: false,
            key: prev.key + 1,
        }));
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            const isDev = import.meta.env.DEV;
            const { error, errorInfo, showStack } = this.state;
            const { routeName = 'this page', onNavigateHome } = this.props;

            return (
                <div className="min-h-[60vh] flex items-center justify-center p-6">
                    <div
                        className="w-full max-w-lg text-center p-8 space-y-6"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-soft)',
                            borderRadius: 'var(--radius-card)',
                        }}
                    >
                        {/* Icon */}
                        <div
                            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: 'color-mix(in srgb, #f97316 12%, transparent)' }}
                        >
                            <AlertTriangle className="w-8 h-8" style={{ color: '#f97316' }} />
                        </div>

                        {/* Heading */}
                        <div>
                            <h2
                                className="text-xl font-semibold mb-2"
                                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                            >
                                Something went wrong
                            </h2>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                                An unexpected error occurred while loading <strong>{routeName}</strong>. Your data is safe — this is likely a temporary glitch.
                            </p>
                        </div>

                        {/* Error message pill */}
                        {error && (
                            <div
                                className="px-4 py-3 rounded-xl text-left text-xs font-mono break-all"
                                style={{
                                    backgroundColor: 'var(--color-bg)',
                                    color: '#f97316',
                                    border: '1px solid var(--color-soft)'
                                }}
                            >
                                {error.message || String(error)}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 cursor-pointer"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            {onNavigateHome && (
                                <button
                                    onClick={onNavigateHome}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-80 cursor-pointer"
                                    style={{
                                        backgroundColor: 'var(--color-soft)',
                                        color: 'var(--color-text)',
                                    }}
                                >
                                    <Home className="w-4 h-4" />
                                    Go to Dashboard
                                </button>
                            )}
                        </div>

                        {/* Dev: collapsible stack trace */}
                        {isDev && errorInfo && (
                            <div>
                                <button
                                    onClick={() => this.setState(s => ({ showStack: !s.showStack }))}
                                    className="flex items-center gap-1.5 mx-auto text-xs hover:opacity-70"
                                    style={{ color: 'var(--color-muted)' }}
                                >
                                    {showStack ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    {showStack ? 'Hide' : 'Show'} stack trace (dev only)
                                </button>
                                {showStack && (
                                    <pre
                                        className="mt-3 p-3 rounded-xl text-left text-[10px] overflow-x-auto max-h-48 overflow-y-auto"
                                        style={{
                                            backgroundColor: 'var(--color-bg)',
                                            color: 'var(--color-muted)',
                                            border: '1px solid var(--color-soft)',
                                            fontFamily: 'monospace',
                                        }}
                                    >
                                        {errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <React.Fragment key={this.state.key}>
                {this.props.children}
            </React.Fragment>
        );
    }
}
