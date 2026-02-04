import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const SIDEBAR_WIDTH = 240;

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar - fixed position */}
            <Sidebar open={sidebarOpen} width={SIDEBAR_WIDTH} />

            {/* Main content area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
                    ml: sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,
                    transition: (theme) => theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Header onMenuClick={toggleSidebar} />

                {/* Page content */}
                <Box
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        pt: 2,
                        backgroundColor: 'background.default',
                        overflow: 'auto',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
