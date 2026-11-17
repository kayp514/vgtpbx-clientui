"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Shield, FileCode, RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export function FlushCacheButton({ isLoading, onClick }: ActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onClick}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            {isLoading && <span className="sr-only">Flushing cache...</span>}
            {!isLoading && <span className="sr-only">Flush Cache</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Flush Cache</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ReloadAclButton({ isLoading, onClick }: ActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onClick}
            disabled={isLoading}
          >
            <Shield className="h-4 w-4" />
            {isLoading && <span className="sr-only">Reloading ACL...</span>}
            {!isLoading && <span className="sr-only">Reload ACL</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reload ACL</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ReloadXmlButton({ isLoading, onClick }: ActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onClick}
            disabled={isLoading}
          >
            <FileCode className="h-4 w-4" />
            {isLoading && <span className="sr-only">Reloading XML...</span>}
            {!isLoading && <span className="sr-only">Reload XML</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reload XML</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function RefreshButton({ isLoading, onClick }: ActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onClick}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading && <span className="sr-only">Refreshing...</span>}
            {!isLoading && <span className="sr-only">Refresh</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
