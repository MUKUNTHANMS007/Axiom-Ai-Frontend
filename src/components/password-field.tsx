import { useId, useState } from "react"
import {
  EyeIcon,
  EyeOffIcon,
  CheckCircle2,
  Copy,
  RefreshCw,
} from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export default function PasswordField({
  label = "Password",
  placeholder = "Enter your password",
  className,
  showChecklist = true,
  allowGenerate = true,
  onChange,
  value: externalValue,
}: {
  label?: string
  placeholder?: string
  className?: string
  showChecklist?: boolean
  allowGenerate?: boolean
  onChange?: (value: string) => void
  value?: string
}) {
  const id = useId()
  const [isVisible, setIsVisible] = useState(false)
  const [internalValue, setInternalValue] = useState("")
  const [copied, setCopied] = useState(false)

  // Support both controlled (externalValue) and uncontrolled modes
  const value = externalValue !== undefined ? externalValue : internalValue

  const toggleVisibility = () => setIsVisible((prev) => !prev)

  const handleValueChange = (newVal: string) => {
    if (externalValue === undefined) setInternalValue(newVal)
    if (onChange) onChange(newVal)
  }

  // password checks
  const checks = [
    { label: "At least 8 characters", valid: value.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(value) },
    { label: "One number", valid: /\d/.test(value) },
    { label: "One special character", valid: /[!@#$%^&*]/.test(value) },
  ]

  // strength calculation
  const passed = checks.filter((c) => c.valid).length
  const strength =
    passed === 0
      ? "Very Weak"
      : passed === 1
        ? "Weak"
        : passed === 2
          ? "Medium"
          : passed === 3
            ? "Strong"
            : "Very Strong"

  const strengthColor =
    passed <= 1
      ? "bg-red-500"
      : passed === 2
        ? "bg-yellow-500"
        : passed === 3
          ? "bg-blue-500"
          : "bg-green-600"

  // generate random password
  const generatePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+"
    let password = ""
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    handleValueChange(password)
  }

  // copy to clipboard
  const copyToClipboard = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <Label htmlFor={id}>{label}</Label>

      <div className="relative flex items-center">
        <Input
          id={id}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
          className="pr-20"
        />

        {/* Toggle visibility */}
        <button
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-10 flex items-center pr-2 text-muted-foreground/70 hover:text-foreground focus:outline-none"
        >
          {isVisible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>

        {/* Copy button */}
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!value}
          className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground/70 hover:text-foreground focus:outline-none disabled:opacity-40"
        >
          <Copy size={16} />
        </button>
      </div>

      {/* Generate Button */}
      {allowGenerate && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={generatePassword}
        >
          <RefreshCw size={14} /> Generate Strong Password
        </Button>
      )}

      {/* Strength meter - Segmented */}
      {showChecklist && value && (
        <div className="space-y-2 mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Level</span>
            <div className="flex items-center gap-2">
                {copied && <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest animate-in fade-in slide-in-from-right-1">Keys Copied</span>}
                <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                passed <= 1 ? "text-red-400 border-red-400/20 bg-red-400/5" :
                passed === 2 ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/5" :
                passed === 3 ? "text-blue-400 border-blue-400/20 bg-blue-400/5" :
                "text-emerald-400 border-emerald-400/20 bg-emerald-400/5 shadow-[0_0_10px_rgba(52,211,153,0.2)]"
                )}>
                {strength}
                </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  passed >= level 
                    ? strengthColor
                    : "bg-white/5"
                )}
                style={{
                  boxShadow: passed >= level ? `0 0 8px ${strengthColor.replace('bg-', 'rgba(')}` : 'none'
                }}
              />
            ))}
          </div>

          {passed === 4 && (
            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] text-emerald-400 font-medium italic mt-2 flex items-center gap-1"
            >
              <CheckCircle2 size={12} />
              Maximum entropy achieved. Access key is secure.
            </motion.p>
          )}
        </div>
      )}

      {/* Checklist - Compact & Professional */}
      {showChecklist && (
        <div className="pt-2 grid grid-cols-1 gap-1.5">
          {checks.map((check, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 text-[10px] uppercase tracking-wider font-medium transition-colors duration-300",
                check.valid ? "text-white" : "text-slate-600"
              )}
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full border",
                check.valid ? "bg-primary border-primary shadow-[0_0_5px_rgba(182,160,255,0.5)]" : "border-slate-700"
              )} />
              {check.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
