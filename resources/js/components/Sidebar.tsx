import { Link, usePage } from "@inertiajs/react";
import {
    X,
    Database,
    FolderTree,
    Tags,
    Shield,
    Users,
    Home,
    ShieldAlert as Guard,
    ShieldAlert,
    LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import { PageProps } from "@/types";

interface SidebarProps {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar = ({ sidebarOpen, toggleSidebar }: SidebarProps) => {
    const { url, props } = usePage<PageProps>();
    const { auth } = props;
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const can = (permission: string): boolean => {
        if (!auth.user) {
            return false;
        }
        if (
            auth?.user?.permissions?.some(
                (p) => p.permission?.name === permission
            )
        ) {
            return true;
        }
        if (auth?.user?.roles) {
            return auth.user.roles.some(
                (role) =>
                    role?.permissions &&
                    role.permissions.some((p) => p?.name === permission)
            );
        }
        return false;
    };

    useEffect(() => {
        if (route().current("dashboard")) {
            setActiveSection("dashboard");
        } else if (
            route().current("groups.*") ||
            route().current("applications.*") ||
            route().current("envValueChanges.*")
        ) {
            setActiveSection("environments");
        } else if (
            route().current("users.*") ||
            route().current("roles.*") ||
            route().current("permissions.*")
        ) {
            setActiveSection("access");
        } else {
            setActiveSection(null);
        }
    }, [url]);
    const isEnvironmentSectionVisible =
        can("view-any-groups") ||
        can("view-any-applications") ||
        can("view-any-env-value-changes");

    const isAccessManagementSectionVisible =
        can("view-any-users") ||
        can("view-any-roles") ||
        can("view-any-permissions");

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-indigo-950 to-indigo-900 shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            {/* Sidebar header */}
            <div className="flex h-16 items-center justify-between border-b border-indigo-800/70 px-4">
                <Link href={route("dashboard")} className="flex items-center">
                    <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md shadow-indigo-700/30">
                        <Database className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-white">
                        Env Manager
                    </span>
                </Link>
                <button
                    onClick={toggleSidebar}
                    className="rounded-md p-1 text-indigo-300 hover:bg-indigo-800/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar content with custom scrollbar */}
            <div className="custom-scrollbar flex flex-col h-[calc(100%-4rem)] overflow-y-auto py-4">
                <nav className="space-y-0.5 px-3 flex-grow">
                    {/* Dashboard - show if user has permission */}
                    {can("view-dashboard") && (
                        <SidebarItem
                            href="dashboard"
                            icon={Home}
                            text="Dashboard"
                            isActive={route().current("dashboard")}
                        />
                    )}

                    {/* Environments Section */}
                    {isEnvironmentSectionVisible && (
                        <SidebarSection title="Environments">
                            {can("view-any-groups") && (
                                <SidebarItem
                                    href="groups.index"
                                    icon={FolderTree}
                                    text="Groups"
                                    isActive={route().current("groups.*")}
                                />
                            )}
                            {can("view-any-applications") && (
                                <SidebarItem
                                    href="applications.index"
                                    icon={Tags}
                                    text="Applications"
                                    isActive={route().current("applications.*")}
                                />
                            )}
                            {can("view-any-env-value-changes") && (
                                <SidebarItem
                                    href="envValueChanges.index"
                                    icon={ShieldAlert}
                                    text="Environment Value Changes"
                                    isActive={route().current(
                                        "envValueChanges.*"
                                    )}
                                />
                            )}
                        </SidebarSection>
                    )}

                    {/* Access Management Section */}
                    {isAccessManagementSectionVisible && (
                        <SidebarSection title="Access Management">
                            {can("view-any-users") && (
                                <SidebarItem
                                    href="users.index"
                                    icon={Users}
                                    text="Users"
                                    isActive={route().current("users.*")}
                                />
                            )}
                            {can("view-any-roles") && (
                                <SidebarItem
                                    href="roles.index"
                                    icon={Shield}
                                    text="Roles"
                                    isActive={route().current("roles.*")}
                                />
                            )}
                            {can("view-any-permissions") && (
                                <SidebarItem
                                    href="permissions.index"
                                    icon={Guard}
                                    text="Permissions"
                                    isActive={route().current("permissions.*")}
                                />
                            )}
                        </SidebarSection>
                    )}
                </nav>

                <div className="mt-auto border-t border-indigo-800/70 p-4">
                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-800/30 py-2.5 text-sm font-medium text-indigo-100 transition-all hover:bg-indigo-700/50 hover:text-white active:bg-indigo-800"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
