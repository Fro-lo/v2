"use client"

import { useState } from "react"
import { ChevronDown, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useVehicleData } from "@/hooks/use-vehicle-data"

export interface VehicleSelection {
  year: string
  make: string
  makeId: string
  model: string
}

interface VehicleYearMakeModelProps {
  value: VehicleSelection
  onChange: (value: VehicleSelection) => void
  showRequiredHint?: boolean
}

export function VehicleYearMakeModel({ value, onChange, showRequiredHint }: VehicleYearMakeModelProps) {
  const { years, makeOptions, models, loadingMakes, loadingModels } = useVehicleData(
    value.year,
    value.make,
    value.makeId,
  )

  const [yearOpen, setYearOpen] = useState(false)
  const [makeOpen, setMakeOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)

  const hintClass = (missing: boolean) =>
    `text-xs font-semibold uppercase tracking-wide ${showRequiredHint && missing ? "text-red-600" : "text-gray-500"}`

  const triggerClass =
    "w-full justify-between text-left font-normal bg-white border-gray-200 hover:border-[#6371BE] h-10 text-sm"

  return (
    <>
      {/* Year */}
      <div className="space-y-1.5">
        <Label className={hintClass(!value.year)}>Year</Label>
        <Popover open={yearOpen} onOpenChange={setYearOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={triggerClass}>
              <span className={value.year ? "text-gray-700" : "text-gray-400"}>{value.year || "Select year"}</span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-40 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search year..." />
              <CommandList>
                <CommandEmpty>No year found.</CommandEmpty>
                <CommandGroup>
                  {years.map((y) => (
                    <CommandItem
                      key={y}
                      value={y}
                      onSelect={() => {
                        // при смене года сбрасываем марку и модель
                        onChange({ year: y, make: "", makeId: "", model: "" })
                        setYearOpen(false)
                      }}
                    >
                      <Check className={`mr-2 h-4 w-4 ${value.year === y ? "opacity-100" : "opacity-0"}`} />
                      {y}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Make */}
      <div className="space-y-1.5">
        <Label className={hintClass(!value.make)}>Make</Label>
        <Popover open={makeOpen} onOpenChange={setMakeOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={triggerClass} disabled={!value.year || loadingMakes}>
              <span className={value.make ? "text-gray-700 truncate" : "text-gray-400 truncate"}>
                {loadingMakes ? "Loading…" : value.make || "Select make"}
              </span>
              {loadingMakes ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-40 shrink-0" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4 opacity-40 shrink-0" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search make..." />
              <CommandList>
                <CommandEmpty>No make found.</CommandEmpty>
                <CommandGroup>
                  {makeOptions.map((m) => (
                    <CommandItem
                      key={m.id || m.name}
                      value={m.name}
                      onSelect={() => {
                        // при смене марки сохраняем makeId и сбрасываем модель
                        onChange({ ...value, make: m.name, makeId: m.id, model: "" })
                        setMakeOpen(false)
                      }}
                    >
                      <Check className={`mr-2 h-4 w-4 ${value.make === m.name ? "opacity-100" : "opacity-0"}`} />
                      {m.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <Label className={hintClass(!value.model)}>Model</Label>
        <Popover open={modelOpen} onOpenChange={setModelOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={triggerClass} disabled={!value.make || loadingModels}>
              <span className={value.model ? "text-gray-700 truncate" : "text-gray-400 truncate"}>
                {loadingModels ? "Loading…" : value.model || "Select model"}
              </span>
              {loadingModels ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-40 shrink-0" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4 opacity-40 shrink-0" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search model..." />
              <CommandList>
                <CommandEmpty>No model found.</CommandEmpty>
                <CommandGroup>
                  {models.map((m) => (
                    <CommandItem
                      key={m}
                      value={m}
                      onSelect={() => {
                        onChange({ ...value, model: m })
                        setModelOpen(false)
                      }}
                    >
                      <Check className={`mr-2 h-4 w-4 ${value.model === m ? "opacity-100" : "opacity-0"}`} />
                      {m}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
