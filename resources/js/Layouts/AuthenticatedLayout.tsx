"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import Sidebar from "@/components/Sidebar";
import { PageProps, User } from "@/types";

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    fluid?: boolean;
}

const AuthenticatedLayout = ({
    children,
    fluid = false,
}: AuthenticatedLayoutProps) => {
    const { auth } = usePage<PageProps>().props;
    const { user } = auth;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [pageLoaded, setPageLoaded] = useState(false);
    const mainContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile && !pageLoaded) {
                setSidebarOpen(true);
            }
        };

        handleResize();
        setPageLoaded(true);

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [pageLoaded]);
    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0;
        }
    }, [usePage().props.url]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <>
            <Head>
                {/* Cara yang benar untuk menambahkan tag ke <head> dokumen */}
                <meta name="api-token" content={user?.api_token || ""} />
            </Head>

            <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
                {sidebarOpen && isMobile && (
                    <div
                        className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                <Sidebar
                    sidebarOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                />

                <div
                    className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
                        sidebarOpen ? "lg:ml-64" : ""
                    }`}
                >
                    <div
                        className="flex-1 overflow-y-auto"
                        ref={mainContentRef}
                    >
                        <main className="flex-1">
                            <div
                                className={`p-4 sm:p-6 lg:p-8 ${
                                    fluid ? "w-full" : "max-w-7xl mx-auto"
                                }`}
                            >
                                <div className="animate-fadeIn">{children}</div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthenticatedLayout;
