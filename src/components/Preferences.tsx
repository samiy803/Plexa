import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, XCircle } from "lucide-react";
import { useSettings, type Schema } from "@/contexts/SettingsContext";

export default function Preferences({ onClose }: { onClose: () => void }) {
    const { get, set } = useSettings();

    const [codePosition, setCodePosition] = useState<Schema["position"] | null>(null);
    const [autoCopy, setAutoCopy] = useState<Schema["autoCopy"] | null>(null);

    useEffect(() => {
        get("position").then((position) => {
            setCodePosition(position as Schema["position"]);
        }).catch((e) => {
            console.error(e);
        })
        get("autoCopy").then((autoCopy) => {
            setAutoCopy(autoCopy as Schema["autoCopy"]);
        }).catch((e) => {
            console.error(e);
        })
    }, []);

    const positions = [
        { value: "top-left", label: "Top Left", src: "/vite.svg" },
        { value: "top-right", label: "Top Right", src: "/vite.svg" },
        { value: "bottom-left", label: "Bottom Left", src: "/vite.svg" },
        { value: "bottom-right", label: "Bottom Right", src: "/vite.svg" },
    ];

    return (
        <Card className="w-full max-w-2xl mx-auto h-[calc(100%-20px)] bg-transparent">
            <CardHeader className="-mb-6">
                <div className="flex flex-row items-center">
                    <ChevronLeft className="w-6 h-6 cursor-pointer mr-2" onClick={onClose}/>
                    <h2 className="text-2xl font-bold">Settings</h2> 
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-t-2">
                    <h3 className="text-lg font-medium mt-4">Code Position</h3>
                    <RadioGroup
                        value={codePosition ? codePosition : undefined}
                        onValueChange={(value) => {
                            set("position", value as Schema["position"]).then(() => {
                                setCodePosition(value as Schema["position"]);
                            }).catch((e) => {
                                console.error(e);
                            })
                        }}
                    >
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            {positions.map((option) => (
                                <Label
                                    key={option.value}
                                    className={`flex flex-col items-center space-y-2 rounded-md border-2 p-4 hover:bg-accent bg-background ${
                                        codePosition === option.value
                                            ? "border-primary"
                                            : "border-muted"
                                    }`}
                                >
                                    <RadioGroupItem
                                        value={option.value}
                                        id={option.value}
                                        className="sr-only"
                                    />
                                    <img
                                        src={option.src}
                                        alt={option.label}
                                        width={50}
                                        height={50}
                                        className="rounded-md"
                                    />
                                    <span>{option.label}</span>
                                </Label>
                            ))}
                        </div>
                        <Label
                            className={`flex items-center justify-center space-x-2 rounded-md border-2 p-4 bg-background hover:bg-accent ${
                                codePosition === "none"
                                    ? "border-primary"
                                    : "border-muted"
                            }`}
                        >
                            <RadioGroupItem
                                value="none"
                                id="none"
                                className="sr-only"
                            />
                            <XCircle className="w-5 h-5" />
                            <span>Don't show code on screen</span>
                        </Label>
                    </RadioGroup>
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Label
                            htmlFor="auto-copy"
                            className="text-lg font-medium"
                        >
                            Auto Copy Code
                        </Label>
                    </div>
                    <Switch
                        id="auto-copy"
                        checked={autoCopy ? autoCopy : false}
                        onCheckedChange={() => {
                            setAutoCopy(!autoCopy);
                            set("autoCopy", !autoCopy);
                            console.log(autoCopy);
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
