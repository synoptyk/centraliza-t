import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

import Topbar from './Topbar';

const PageWrapper = ({ children, className = "", title, subtitle, icon, headerActions, auth, onLogout }) => {
    // Ensure scroll is at top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const variants = {
        initial: {
            opacity: 0,
            y: 10,
            scale: 0.99
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for "spectacular" feel
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            <Topbar title={title} subtitle={subtitle} icon={icon} actions={headerActions} auth={auth} onLogout={onLogout} />
            <motion.div
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`w-full max-w-[1600px] mx-auto p-4 md:p-8 pt-24 md:pt-28 flex-1 ${className}`}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default PageWrapper;
