"use client"
import { Bitcoin, GalleryVerticalEnd } from "lucide-react"
import { useFormik } from "formik"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { useToast } from "@/components/ui/use-toast"
import { login } from "@/redux/actions/userActions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { PrivacyPolicyDialog } from "./privacy-policy-dialog"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { toast } = useToast()
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validate: values => {
      const errors: { email?: string; password?: string } = {};
      
      if (!values.email) {
        errors.email = 'Email adresi gereklidir';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Geçerli bir email adresi giriniz';
      }

      if (!values.password) {
        errors.password = 'Şifre gereklidir';
      } else if (values.password.length < 6) {
        errors.password = 'Şifre en az 6 karakter olmalıdır';
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        const actionResult = await dispatch(login(values) as any);

        if (actionResult.type === 'user/login/fulfilled') {
          toast({
            title: "Kullanıcı Girişi Başarılı",
            description: "Hoşgeldiniz! Ana sayfaya yönlendiriliyorsunuz." as React.ReactNode,
            variant: "default",
          });
          router.push("/dashboard");
        } else {
          const errorMessage = actionResult.payload || 'Giriş yapılamadı';
          toast({
            title: "Giriş Başarısız",
            description: errorMessage as React.ReactNode,
          });
        }
      } catch (error: any) {
        toast({
          title: "Sistem Hatası",
          description: "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin." as React.ReactNode,
          variant: "destructive",
        });
      }
    }
  });

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const mailtoLink = `mailto:info@gmail.com?subject=${encodeURIComponent('Hesap Oluşturmak İstiyorum')}&body=${encodeURIComponent('Web sitenize kayıt olup başvuru yapmak istiyorum')}`
    window.location.href = mailtoLink
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <a href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex size-8 items-center justify-center rounded-md">
            <Bitcoin className="size-8" />
          </div>
        </a>
        <h1 className="text-xl font-bold">Coin Market&apos;e Hoşgeldiniz</h1>
        
      </div>
      
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            {...formik.getFieldProps('email')}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-red-500 text-sm">{formik.errors.email}</div>
          )}
        </div>
        {formik.values.email && (
          <div className="grid gap-3 transition-all duration-300 ease-in-out animate-in slide-in-from-top-2 fade-in">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              {...formik.getFieldProps('password')}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm">{formik.errors.password}</div>
            )}
          </div>
        )}
        <Button type="submit" className="w-full cursor-pointer hover:cursor-pointer">
          Giriş Yap
        </Button>
      </form>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Politikaları Onaylıyorum{" "}
        <a href="#" onClick={(e) => {
          e.preventDefault()
          setPrivacyPolicyOpen(true)
        }}>
          Gizlilik Politikası
        </a>
      </div>
      <PrivacyPolicyDialog
        open={privacyPolicyOpen}
        onOpenChange={setPrivacyPolicyOpen}
      />
    </div>
  )
}
