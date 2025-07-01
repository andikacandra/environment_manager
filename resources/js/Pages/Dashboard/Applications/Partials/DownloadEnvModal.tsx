import { useState, useEffect } from "react";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Copy,
    CheckCircle2,
    Globe,
    Settings,
    Server,
    Loader2,
} from "lucide-react";
import { Application, Group } from "@/types";

interface DownloadEnvModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: Application;
    permissions: {
        canViewDevelopment: boolean;
        canViewStaging: boolean;
        canViewProduction: boolean;
    };
}

export default function DownloadEnvModal({
    isOpen,
    onClose,
    application,
    permissions,
}: DownloadEnvModalProps) {
    const [loadingToken, setLoadingToken] = useState(false);
    const [downloadToken, setDownloadToken] = useState("");
    const [copiedLinks, setCopiedLinks] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isOpen && !downloadToken) {
            fetchDownloadToken();
        }
    }, [isOpen]);

    const fetchDownloadToken = async () => {
        setLoadingToken(true);
        try {
            const response = await axios.get(
                route("applications.token", {
                    application: application.id,
                })
            );
            setDownloadToken(response.data.token);
        } catch (error) {
            console.error("Failed to fetch download token:", error);
        } finally {
            setLoadingToken(false);
        }
    };

    const getDownloadUrl = (envType: string) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/api/applications/${
            application.id
        }/download/${envType.toLowerCase()}/${downloadToken}`;
    };

    const copyToClipboard = (text: string, envType: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLinks((prev) => ({ ...prev, [envType]: true }));
        setTimeout(() => {
            setCopiedLinks((prev) => ({ ...prev, [envType]: false }));
        }, 2000);
    };

    // Map environment types to their icons and display properties
    const envTypes = [
        {
            name: "Development",
            canView: permissions.canViewDevelopment,
            icon: <Settings className="h-5 w-5 text-blue-500" />,
        },
        {
            name: "Staging",
            canView: permissions.canViewStaging,
            icon: <Globe className="h-5 w-5 text-yellow-500" />,
        },
        {
            name: "Production",
            canView: permissions.canViewProduction,
            icon: <Server className="h-5 w-5 text-red-500" />,
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        Download .env File
                    </DialogTitle>
                    <DialogDescription>
                        Copy the link for the environment you want to download.
                        Opening the link will download a .env file for{" "}
                        <span className="font-semibold">
                            {application.name}
                        </span>
                        .
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {loadingToken ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="ml-3 text-gray-600">
                                Generating download links...
                            </span>
                        </div>
                    ) : downloadToken ? (
                        <div className="rounded-md border">
                            <div className="divide-y">
                                {envTypes.map(
                                    (env) =>
                                        env.canView && (
                                            <div
                                                key={env.name}
                                                className="flex items-center justify-between p-4 hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {env.icon}
                                                    <div>
                                                        <div className="font-medium">
                                                            {env.name}{" "}
                                                            Environment
                                                        </div>
                                                        <div className="mt-1 text-sm text-gray-500 font-mono truncate max-w-md">
                                                            {getDownloadUrl(
                                                                env.name
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            getDownloadUrl(
                                                                env.name
                                                            ),
                                                            env.name
                                                        )
                                                    }
                                                    className="gap-1.5"
                                                >
                                                    {copiedLinks[env.name] ? (
                                                        <>
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-4 w-4" />
                                                            Copy Link
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        )
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md border bg-red-50 p-4 text-red-600">
                            Failed to generate download links. Please try again.
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                        Note: These links provide temporary access to your
                        environment variables. The links expire when you
                        generate new ones.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
