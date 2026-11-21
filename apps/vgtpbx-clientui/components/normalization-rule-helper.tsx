import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

export function NormalizationRuleHelper() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">Number Normalization Examples</h4>
          <div className="text-sm">
            <p className="font-medium">Strip +1 from US numbers:</p>
            <p className="text-muted-foreground">
              Pattern: <code>^\\+1(\d{10})$</code>
            </p>
            <p className="text-muted-foreground">
              Replacement: <code>$1</code>
            </p>
          </div>
          <div className="text-sm">
            <p className="font-medium">Format as XXX-XXX-XXXX:</p>
            <p className="text-muted-foreground">
              Pattern:{" "}
              <code>
                ^(\d{3})(\d{3})(\d{4})$
              </code>
            </p>
            <p className="text-muted-foreground">
              Replacement: <code>$1-$2-$3</code>
            </p>
          </div>
          <div className="text-sm">
            <p className="font-medium">Add area code to 7-digit numbers:</p>
            <p className="text-muted-foreground">
              Pattern: <code>^(\d{7})$</code>
            </p>
            <p className="text-muted-foreground">
              Replacement: <code>212$1</code>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
