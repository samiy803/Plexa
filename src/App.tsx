import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Preferences from "./components/Preferences";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Copy, Clock, Trash } from "lucide-react";

function App() {
    const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
    const [recentCodes, setRecentCodes] = useState([
        { company: "Amazon", code: "123456", time: "2 mins ago" },
        { company: "Google", code: "789012", time: "15 mins ago" },
        { company: "Apple", code: "345678", time: "1 hour ago" },
        { company: "Microsoft", code: "901234", time: "3 hours ago" },
        { company: "Netflix", code: "567890", time: "1 day ago" },
    ]);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        // TODO: show a toast message
    };

    const handleDeleteCode = (index: number) => {
        setRecentCodes(recentCodes.filter((_, i) => i !== index));
    };

    const pageTransition = {
        hidden: { x: "-100%", opacity: 0 },
        visible: { x: "0%", opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
    };

    return (
        <div className="h-full w-full relative bg-dot-white/[0.2]">
            <AnimatePresence>
                {isPreferencesOpen && (
                    <motion.div
                        className="h-full"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ type: "tween", duration: 0.1 }}
                        variants={pageTransition}
                        key="preferences"
                    >
                        <Preferences
                            onClose={() => setIsPreferencesOpen(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-full p-4">
                <div
                    className="flex flex-col"
                    style={{ height: "100vh", margin: "0 auto" }}
                >
                    <main className="flex-1 overflow-hidden px-4">
                        <h1 className="text-xl font-bold mb-3 -mt-1">
                            Code History
                        </h1>
                        {/* hide scrollbar but allow scrolling */}
                        <ScrollArea className="h-[calc(100%-195px)] no-scrollbar">
                            <div className="space-y-2 pr-2">
                                {recentCodes.map((item, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 mr-2">
                                                    <h3 className="font-semibold text-lg">
                                                        {item.company}
                                                    </h3>
                                                    <p className="text-lgxl font-mono">
                                                        {item.code}
                                                    </p>
                                                    <p className="text-md text-muted-foreground flex items-center mt-1">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {item.time}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-3 pr-2 cursor-pointer">
                                                    <Copy
                                                        className="h-4 w-4"
                                                        onClick={() =>
                                                            handleCopyCode(
                                                                item.code
                                                            )
                                                        }
                                                    />
                                                    <Trash
                                                        className="h-4 w-4 text-destructive cursor-pointer"
                                                        onClick={() =>
                                                            handleDeleteCode(
                                                                index
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </main>

                    <footer className="p-2 mb-2 flex justify-between items-center border-t fixed left-0 bottom-0 w-screen bg-background">
                        <Settings
                            className="h-4 w-4 m-1 cursor-pointer"
                            onClick={() =>
                                setIsPreferencesOpen(!isPreferencesOpen)
                            }
                        />
                        <nav className="flex space-x-4">
                            <a
                                href="#"
                                className="text-md text-muted-foreground hover:text-primary"
                            >
                                About
                            </a>
                        </nav>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default App;
