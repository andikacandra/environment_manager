import React from "react";
import { Link } from "@inertiajs/react";
import {
    Calendar,
    Clock,
    Code,
    History,
    Key,
    Layers,
    Tag,
    User,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EnvValueChange } from "@/types";
import { cn, formatDate, formatTime } from "@/lib/utils";

interface ViewChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedChange: EnvValueChange | null;
}

const ViewChangeModal = ({
    isOpen,
    onClose,
    selectedChange,
}: ViewChangeModalProps) => {
    // Mask sensitive values
    const maskValue = (value: string) => {
        if (!value) return "";
        if (value.length <= 4) return "****";
        return (
            value.substring(0, 2) + "****" + value.substring(value.length - 2)
        );
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-indigo-600" />
                        Change Details
                    </DialogTitle>
                    <DialogDescription>
                        View the details of this environment variable change.
                    </DialogDescription>
                </DialogHeader>

                {selectedChange && (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                    Variable
                                </h4>
                                <p className="mt-1 flex items-center gap-1.5">
                                    <Code className="h-4 w-4 text-indigo-500" />
                                    <span className="font-medium">
                                        {
                                            selectedChange.env_value
                                                ?.env_variable?.name
                                        }
                                    </span>
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                    Application
                                </h4>
                                <p className="mt-1 flex items-center gap-1.5">
                                    <Layers className="h-4 w-4 text-indigo-500" />
                                    <Link
                                        href={route(
                                            "applications.show",
                                            selectedChange.env_value?.access_key
                                                ?.application?.id
                                        )}
                                        className="font-medium text-indigo-600 hover:underline"
                                    >
                                        {
                                            selectedChange.env_value?.access_key
                                                ?.application?.name
                                        }
                                    </Link>
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                    Environment
                                </h4>
                                <p className="mt-1 flex items-center gap-1.5">
                                    <Tag className="h-4 w-4 text-indigo-500" />
                                    <span>
                                        {
                                            selectedChange.env_value?.access_key
                                                ?.env_type?.name
                                        }
                                    </span>
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                    Access Key
                                </h4>
                                <p className="mt-1 flex items-center gap-1.5">
                                    <Key className="h-4 w-4 text-indigo-500" />
                                    <span className="text-sm font-mono">
                                        {selectedChange.env_value?.access_key?.key?.substring(
                                            0,
                                            8
                                        )}
                                        ...
                                    </span>
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                    Change Type
                                </h4>
                                <p className="mt-1">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            getChangeTypeBadgeColor(
                                                selectedChange.type
                                            )
                                        )}
                                    >
                                        {selectedChange.type}
                                    </Badge>
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                    Changed By
                                </h4>
                                <p className="mt-1 flex items-center gap-1.5">
                                    <User className="h-4 w-4 text-indigo-500" />
                                    <span>
                                        {selectedChange.user?.full_name}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                    Date
                                </h4>
                                <p className="mt-1 flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-indigo-500" />
                                    <span>
                                        {formatDate(selectedChange.created_at)}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                    Time
                                </h4>
                                <p className="mt-1 flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-indigo-500" />
                                    <span>
                                        {formatTime(selectedChange.created_at)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-3">
                                Value Changes
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-md p-3 bg-gray-50">
                                    <h5 className="text-xs font-medium text-gray-500 mb-1">
                                        Old Value
                                    </h5>
                                    <div className="font-mono text-sm bg-white p-2 rounded border overflow-x-auto">
                                        {selectedChange.type === "create" ? (
                                            <span className="text-gray-400 italic">
                                                N/A (New Variable)
                                            </span>
                                        ) : (
                                            <span>
                                                {maskValue(
                                                    selectedChange.old_value
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="border rounded-md p-3 bg-gray-50">
                                    <h5 className="text-xs font-medium text-gray-500 mb-1">
                                        New Value
                                    </h5>
                                    <div className="font-mono text-sm bg-white p-2 rounded border overflow-x-auto">
                                        {selectedChange.type === "delete" ? (
                                            <span className="text-gray-400 italic">
                                                N/A (Deleted)
                                            </span>
                                        ) : (
                                            <span>
                                                {maskValue(
                                                    selectedChange.new_value
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ViewChangeModal;
