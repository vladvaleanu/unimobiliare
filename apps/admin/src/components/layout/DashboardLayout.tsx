import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const SIDEBAR_WIDTH = 260;

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar open={sidebarOpen} width={SIDEBAR_WIDTH} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <Header onMenuClick={toggleSidebar} />

                <Box
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        backgroundColor: 'background.default',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
