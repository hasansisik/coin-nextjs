"use client"
import { GalleryVerticalEnd } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
            </a>
            <h1 className="text-xl font-bold">Coin Market&apos;e Hoşgeldiniz</h1>
            <div className="text-center text-sm">
              Bir hesabın yok mu?{" "}
              <a href="#" className="underline underline-offset-4">
                Başvur
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {email && (
              <div className="grid gap-3 transition-all duration-300 ease-in-out animate-in slide-in-from-top-2 fade-in">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </div>
            )}
            <Button type="submit" className="w-full">
              Giriş Yap
            </Button>
          </div>

        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Politikaları Onaylıyorum <a href="#">Gizlilik Politikası</a>{" "}
        ve <a href="#">Yatırım Tavsiyesi Değildir</a>.
      </div>
    </div>
  )
}
