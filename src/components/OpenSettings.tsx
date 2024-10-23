import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, X } from "lucide-react"
import { exit } from '@tauri-apps/api/process';
import { invoke } from "@tauri-apps/api/tauri";

export default function Component() {
  const closeApp = () => {
    exit();
  }

  const openSettings = () => {
    invoke("open_system_settings");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Permission Error</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground text-2xs">
            Please enable Full Disk Access in System Settings. This is needed to access your messages.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 pt-2 scale-75 origin-right">
          <Button variant="ghost" onClick={closeApp}>
            <X className="mr-2 h-4 w-4" />
            Close App
          </Button>
          <Button onClick={openSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Open Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}