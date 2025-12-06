import React from 'react';
import Sidebar from './Sidebar';

interface PageContainerProps {
    children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default PageContainer;
