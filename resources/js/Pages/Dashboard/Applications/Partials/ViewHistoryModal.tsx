import { useState, useMemo } from "react";
import { EnvValueChange } from "@/types";
import { Calendar, Clock, Code, History, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ViewHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    changes: EnvValueChange[];
    variableName: string;
}

const ViewHistoryModal = ({
    isOpen,
    onClose,
    changes,
    variableName,
}: ViewHistoryModalProps) => {
    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Format time for display
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get badge color based on change type
    const getChangeTypeBadgeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "create":
                return "bg-green-100 text-green-800 border-green-200";
            case "update":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "delete":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Mask sensitive values
    const maskValue = (value: string) => {
        if (!value) return "";
        if (value.length <= 4) return "****";
        return (
            value.substring(0, 2) + "****" + value.substring(value.length - 2)
        );
    };

    // Sort changes by date (newest first)
    const sortedChanges = useMemo(() => {
        return [...changes].sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );
    }, [changes]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-indigo-600" />
                        Variable History:{" "}
                        <span className="text-indigo-600">{variableName}</span>
                    </DialogTitle>
                    <DialogDescription>
                        View all changes made to this environment variable over
                        time.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {sortedChanges.length === 0 ? (
                        <div className="py-8 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <History className="h-10 w-10 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-600">
                                    No history available
                                </h3>
                                <p className="text-gray-500">
                                    No changes have been recorded for this
                                    variable.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[140px]">
                                            Date & Time
                                        </TableHead>
                                        <TableHead className="w-[100px]">
                                            Type
                                        </TableHead>
                                        <TableHead>Old Value</TableHead>
                                        <TableHead>New Value</TableHead>
                                        <TableHead>Changed By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedChanges.map((change) => (
                                        <TableRow key={change.id}>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                                        {formatDate(
                                                            change.created_at
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Clock className="h-3 w-3" />
                                                        {formatTime(
                                                            change.created_at
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        getChangeTypeBadgeColor(
                                                            change.type
                                                        )
                                                    )}
                                                >
                                                    {change.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-mono text-sm p-2 bg-gray-50 rounded border overflow-x-auto max-w-[200px]">
                                                    {change.type ===
                                                    "create" ? (
                                                        <span className="text-gray-400 italic">
                                                            N/A (New)
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            {maskValue(
                                                                change.old_value
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-mono text-sm p-2 bg-gray-50 rounded border overflow-x-auto max-w-[200px]">
                                                    {change.type ===
                                                    "delete" ? (
                                                        <span className="text-gray-400 italic">
                                                            N/A (Deleted)
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            {maskValue(
                                                                change.new_value
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-full w-6 h-6 bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-medium">
                                                        {change.user?.full_name
                                                            ?.charAt(0)
                                                            .toUpperCase() ||
                                                            "U"}
                                                    </div>
                                                    <span className="text-sm">
                                                        {change.user?.full_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-4">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewHistoryModal;
