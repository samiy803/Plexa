import { createContext, useContext, useEffect } from "react";
import { SettingsManager } from "tauri-settings";
import { listen } from "@tauri-apps/api/event";

export type Schema = {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "none";
    autoCopy: boolean;
};

type GetSettingsEvent = {
    key: string;
};

type SetSettingsEvent = {
    key: string;
    value: any;
};

const settingsManager = new SettingsManager<Schema>(
    {
        // defaults
        position: "top-right",
        autoCopy: true,
    },
    {
        // options
        fileName: "settings.json",
    }
);

const SettingsContext = createContext<{
    get: (key: keyof Schema) => Promise<Schema[keyof Schema]>;
    set: (key: keyof Schema, value: Schema[keyof Schema]) => Promise<Schema>;
} | null>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        settingsManager.initialize();

        const unlistenPromise = listen<GetSettingsEvent>("get-settings", async (event) => {
            return settingsManager.get(event.payload.key as keyof Schema);
        });

        const unlistenPromise2 = listen<SetSettingsEvent>("set-settings", async (event) => {
            return settingsManager.set(event.payload.key as keyof Schema, event.payload.value);
        });

        return () => {
            unlistenPromise.then((fn) => fn());
            unlistenPromise2.then((fn) => fn());
        };
    }, []);

    return (
        <SettingsContext.Provider value={{ get: settingsManager.get.bind(settingsManager), set: settingsManager.set.bind(settingsManager) }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Custom hook to use the settings context
export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
