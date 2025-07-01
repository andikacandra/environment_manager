import { useState } from "react";
import { Copy, CheckCircle, Eye, EyeOff, Edit } from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { EnvValue } from "@/types";

interface EnvValueDisplayProps {
    variable: any;
    envType: string;
    canView: boolean;
    canEdit: boolean;
    onEditEnvValue: (envValue: EnvValue) => void;
    copySuccess: string | null;
    setCopySuccess: (value: string | null) => void;
}

const EnvValueDisplay = ({
    variable,
    envType,
    canView,
    canEdit,
    onEditEnvValue,
    copySuccess,
    setCopySuccess,
}: EnvValueDisplayProps) => {
    const [showSecretValues, setShowSecretValues] = useState<
        Record<string, boolean>
    >({});

    // If the user doesn't have permission to view this environment, show a message
    if (!canView) {
        return <span className="text-gray-400 italic text-xs">No access</span>;
    }

    const envValue = variable.env_values?.find(
        (value: any) =>
            value.access_key?.env_type?.name?.toLowerCase() ===
            envType.toLowerCase()
    );

    // If there's no value set for this environment
    if (!envValue) {
        return <span className="text-gray-400 italic text-xs">Not set</span>;
    }

    const valueId = `${envType.charAt(0)}-${envValue.id}`;
    const isValueVisible = showSecretValues[valueId] || false;

    const toggleSecretVisibility = () => {
        setShowSecretValues((prev) => ({
            ...prev,
            [valueId]: !prev[valueId],
        }));
    };

    const copyToClipboard = () => {
        if (!envValue.value) return;

        navigator.clipboard.writeText(envValue.value);
        setCopySuccess(variable.name);
        setTimeout(() => setCopySuccess(null), 2000);
    };

    const handleEdit = () => {
        if (canEdit) {
            onEditEnvValue(envValue);
        }
    };

    return (
        <div className="flex items-center space-x-1">
            <div
                className={`font-mono text-sm ${
                    isValueVisible ? "" : "filter blur-[3px]"
                } transition-all duration-200`}
            >
                {envValue.value || (
                    <span className="text-gray-400 italic text-xs">Empty</span>
                )}
            </div>
            <div className="flex items-center space-x-0.5">
                {/* Always show the eye button if user can view */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-gray-700"
                                onClick={toggleSecretVisibility}
                            >
                                {isValueVisible ? (
                                    <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p className="text-xs">
                                {isValueVisible ? "Hide value" : "Show value"}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Copy button - only if there's a value and user can view */}
                {envValue.value && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-gray-700"
                                    onClick={copyToClipboard}
                                >
                                    {copySuccess === variable.name ? (
                                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p className="text-xs">Copy to clipboard</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {/* Edit button - only if the user has edit permission */}
                {canEdit && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-blue-500 hover:text-blue-700"
                                    onClick={handleEdit}
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p className="text-xs">Edit value</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
    );
};

export default EnvValueDisplay;
