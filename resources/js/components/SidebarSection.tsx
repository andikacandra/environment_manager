import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarSectionProps {
    title: string;
    children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="mb-2">
            <button
                onClick={toggleExpand}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-indigo-200 hover:bg-indigo-800/30"
            >
                <span className="uppercase tracking-wider text-xs font-semibold">
                    {title}
                </span>
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-indigo-400" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-indigo-400" />
                )}
            </button>
            <div
                className={`mt-1 space-y-0.5 ${
                    isExpanded ? "block" : "hidden"
                }`}
            >
                {children}
            </div>
        </div>
    );
};

export default SidebarSection;
