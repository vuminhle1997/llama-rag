import { UserIcon } from "@heroicons/react/24/solid";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { SidebarSeparator } from "../ui/sidebar";
import { Settings2Icon, LogOutIcon } from "lucide-react";

export default function FooterNavigation() {
    return (
        <div className="mt-auto">
            <div className="flex justify-center gap-1 py-4">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled
              >
                <span>1</span>
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <span>2</span>
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <span>3</span>
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <span>...</span>
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <span>12</span>
              </Button>
            </div>
            <SidebarSeparator />
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://ui.shadcn.com/avatars/01.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-muted-foreground">
                    john.doe@example.com
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings2Icon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings2Icon className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
    )
}