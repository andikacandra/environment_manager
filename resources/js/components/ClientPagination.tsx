import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ClientPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    setCurrentPage: (page: number) => void;
}

const ClientPagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setCurrentPage,
}: ClientPaginationProps) => {
    // Calculate pagination details
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate pagination links
    const generatePaginationLinks = () => {
        const links = [];

        // Previous button
        links.push({
            url: currentPage > 1 ? "#" : null,
            label: "Previous",
            active: false,
            onClick: () => currentPage > 1 && setCurrentPage(currentPage - 1),
        });

        // First page
        links.push({
            url: "#",
            label: "1",
            active: currentPage === 1,
            onClick: () => setCurrentPage(1),
        });

        // Ellipsis after first page
        if (currentPage > 3) {
            links.push({
                url: null,
                label: "...",
                active: false,
                onClick: () => {},
            });
        }

        // Pages around current page
        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        ) {
            if (i === 1 || i === totalPages) continue; // Skip first and last page as they're added separately
            links.push({
                url: "#",
                label: i.toString(),
                active: currentPage === i,
                onClick: () => setCurrentPage(i),
            });
        }

        // Ellipsis before last page
        if (currentPage < totalPages - 2) {
            links.push({
                url: null,
                label: "...",
                active: false,
                onClick: () => {},
            });
        }

        // Last page (if more than one page)
        if (totalPages > 1) {
            links.push({
                url: "#",
                label: totalPages.toString(),
                active: currentPage === totalPages,
                onClick: () => setCurrentPage(totalPages),
            });
        }

        // Next button
        links.push({
            url: currentPage < totalPages ? "#" : null,
            label: "Next",
            active: false,
            onClick: () =>
                currentPage < totalPages && setCurrentPage(currentPage + 1),
        });

        return links;
    };

    if (totalPages <= 1) return null;

    const links = generatePaginationLinks();

    return (
        <div className="flex items-center justify-between px-2 py-3">
            <div className="flex flex-1 justify-between sm:hidden">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        currentPage > 1 && setCurrentPage(currentPage - 1)
                    }
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        currentPage < totalPages &&
                        setCurrentPage(currentPage + 1)
                    }
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startItem}</span>{" "}
                        to <span className="font-medium">{endItem}</span> of{" "}
                        <span className="font-medium">{totalItems}</span> items
                    </p>
                </div>
                <div>
                    <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-l-md"
                            disabled={currentPage === 1}
                            onClick={() =>
                                currentPage > 1 &&
                                setCurrentPage(currentPage - 1)
                            }
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous</span>
                        </Button>

                        {links.slice(1, -1).map((link, i) => {
                            // Skip the first and last items (Previous/Next buttons)
                            if (link.label === "...") {
                                return (
                                    <Button
                                        key={`ellipsis-${i}`}
                                        variant="outline"
                                        size="icon"
                                        className="cursor-default"
                                        disabled
                                    >
                                        <span className="text-xs">...</span>
                                    </Button>
                                );
                            }

                            return (
                                <Button
                                    key={`page-${link.label}`}
                                    variant={
                                        link.active ? "default" : "outline"
                                    }
                                    size="icon"
                                    onClick={link.onClick}
                                >
                                    {link.label}
                                </Button>
                            );
                        })}

                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-r-md"
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                currentPage < totalPages &&
                                setCurrentPage(currentPage + 1)
                            }
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next</span>
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default ClientPagination;
