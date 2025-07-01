import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export function Pagination({ links }: PaginationProps) {
    // Don't render pagination if there's only 1 page
    if (links.length <= 3) return null;

    return (
        <div className="flex items-center justify-between px-2 py-3">
            <div className="flex flex-1 justify-between sm:hidden">
                <Link
                    href={links[0].url || "#"}
                    className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                        links[0].url
                            ? "text-gray-700 hover:bg-gray-50"
                            : "cursor-not-allowed text-gray-400"
                    }`}
                >
                    Previous
                </Link>
                <Link
                    href={links[links.length - 1].url || "#"}
                    className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                        links[links.length - 1].url
                            ? "text-gray-700 hover:bg-gray-50"
                            : "cursor-not-allowed text-gray-400"
                    }`}
                >
                    Next
                </Link>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing page{" "}
                        <span className="font-medium">
                            {links.findIndex((link) => link.active) || 1}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">{links.length - 2}</span>{" "}
                        pages
                    </p>
                </div>
                <div>
                    <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                    >
                        {links.map((link, i) => {
                            // Skip the "Next" and "Previous" links at the beginning and end
                            if (i === 0) {
                                return (
                                    <Button
                                        key="previous"
                                        variant="outline"
                                        size="icon"
                                        className="rounded-l-md"
                                        disabled={!link.url}
                                        asChild={link.url ? true : false}
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>
                                                <ChevronLeft className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Previous
                                                </span>
                                            </Link>
                                        ) : (
                                            <>
                                                <ChevronLeft className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Previous
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                );
                            }

                            if (i === links.length - 1) {
                                return (
                                    <Button
                                        key="next"
                                        variant="outline"
                                        size="icon"
                                        className="rounded-r-md"
                                        disabled={!link.url}
                                        asChild={link.url ? true : false}
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>
                                                <ChevronRight className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Next
                                                </span>
                                            </Link>
                                        ) : (
                                            <>
                                                <ChevronRight className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Next
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                );
                            }

                            // For "..." labels
                            if (link.label.includes("...")) {
                                return (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="icon"
                                        className="cursor-default"
                                        disabled
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">
                                            More pages
                                        </span>
                                    </Button>
                                );
                            }

                            // For numbered pages
                            return (
                                <Button
                                    key={i}
                                    variant={
                                        link.active ? "default" : "outline"
                                    }
                                    size="icon"
                                    asChild={
                                        !link.active && link.url ? true : false
                                    }
                                    className={link.active ? "z-10" : ""}
                                >
                                    {!link.active && link.url ? (
                                        <Link href={link.url}>
                                            {link.label}
                                        </Link>
                                    ) : (
                                        link.label
                                    )}
                                </Button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
