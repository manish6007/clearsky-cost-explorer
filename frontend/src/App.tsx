import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { SettingsProvider } from './hooks/useSettings';
import { LoginPage, DashboardPage, DomainDetailPage, DomainsPage } from './pages';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <SettingsProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/domains" element={<DomainsPage />} />
                        <Route path="/domains/:domainId" element={<DomainDetailPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </SettingsProvider>
        </ThemeProvider>
    );
};

export default App;
