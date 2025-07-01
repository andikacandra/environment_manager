import { Link } from "@inertiajs/react";
import { LucideIcon } from "lucide-react";
import React from "react";

interface SidebarItemProps {
    href: string;
    icon: LucideIcon;
    text: string;
    isActive: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    href,
    icon: Icon,
    text,
    isActive,
}) => {
    return (
        <Link
            href={route(href)}
            className={`flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                    ? "bg-indigo-800/60 text-white"
                    : "text-indigo-100 hover:bg-indigo-800/40 hover:text-white"
            }`}
        >
            <Icon
                className={`mr-3 h-5 w-5 ${
                    isActive ? "text-white" : "text-indigo-300"
                }`}
            />
            {text}
        </Link>
    );
};

export default SidebarItem;
