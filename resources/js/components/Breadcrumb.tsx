import { Link, usePage } from "@inertiajs/react";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="mb-4 flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center">
                    <Link
                        href={route("dashboard")}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="ml-1 text-sm font-medium text-gray-500 hover:text-gray-700 md:ml-2"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
