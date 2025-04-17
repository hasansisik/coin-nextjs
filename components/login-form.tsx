"use client";
import { Bitcoin, Instagram, Youtube, MessageCircle } from "lucide-react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/components/ui/use-toast";
import { login } from "@/redux/actions/userActions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TextField } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { PrivacyPolicyDialog } from "./privacy-policy-dialog";
import { AppDispatch } from "@/redux/store";
import { getFooterData } from "@/redux/actions/footerActions";

// Custom MUI theme
const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderWidth: '2px',
              borderImage: 'linear-gradient(to right, #2563eb, #38bdf8)',
              borderImageSlice: 1,
              borderRadius: '20px',
            },
            '&:hover fieldset': {
              borderWidth: '2px',
              borderImage: 'linear-gradient(to right, #3b82f6, #22d3ee)',
              borderImageSlice: 1,
              borderRadius: '20px',
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
              borderImage: 'linear-gradient(to right, #3b82f6, #22d3ee)',
              borderImageSlice: 1,
              borderRadius: '20px',
            },
            backgroundColor: 'transparent',
            color: 'white',
            borderRadius: '20px',
          },
          '& .MuiInputLabel-root': {
            color: '#93c5fd',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#3b82f6',
          },
          '& input::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)',
          },
        },
      },
    },
  },
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { footer } = useSelector((state: any) => state.footer);

  useEffect(() => {
    dispatch(getFooterData());
  }, [dispatch]);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      const errors: { email?: string; password?: string } = {};

      if (!values.email) {
        errors.email = "Email adresi gereklidir";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
      ) {
        errors.email = "Geçerli bir email adresi giriniz";
      }

      if (!values.password) {
        errors.password = "Şifre gereklidir";
      } else if (values.password.length < 6) {
        errors.password = "Şifre en az 6 karakter olmalıdır";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        const actionResult = await dispatch(login(values) as any);

        if (actionResult.type === "user/login/fulfilled") {
          toast({
            title: "Kullanıcı Girişi Başarılı",
            description:
              "Hoşgeldiniz! Ana sayfaya yönlendiriliyorsunuz." as React.ReactNode,
            variant: "default",
          });
          router.push("/dashboard");
        } else {
          const errorMessage = actionResult.payload || "Giriş yapılamadı";
          toast({
            title: "Giriş Başarısız",
            description: errorMessage as React.ReactNode,
          });
        }
      } catch (error: any) {
        toast({
          title: "Sistem Hatası",
          description:
            "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin." as React.ReactNode,
          variant: "destructive",
        });
      }
    },
  });

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open("https://www.instagram.com/kriptotek/", "_blank", "noopener,noreferrer");
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={cn("flex flex-col gap-4", className)} {...props}>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <TextField
            id="email"
            name="email"
            label="Email"
            variant="outlined"
            fullWidth
            size="small"
            placeholder="m@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            FormHelperTextProps={{
              style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent',
                borderRadius: '20px'
              }
            }}
          />
          
          <TextField
            id="password"
            name="password"
            label="Şifre"
            type="password"
            variant="outlined"
            fullWidth
            size="small"
            placeholder="••••••••"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            FormHelperTextProps={{
              style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'transparent',
                borderRadius: '20px'
              }
            }}
          />
          
          <Button
            type="submit"
            className="w-auto px-20 py-5 cursor-pointer hover:cursor-pointer bg-blue-500 text-white font-medium  rounded-md hover:opacity-90 transition-all mt-2 mx-auto"
          >
            Giriş Yap
          </Button>
        </form>

        <Button
          onClick={handleApplyClick}
          className="w-full cursor-pointer hover:cursor-pointer bg-gradient-to-r from-red-500 to-purple-500 text-white font-medium py-4 rounded-md hover:opacity-90 transition-all flex items-center justify-center"
        >
          <Instagram className="w-6 h-6 mr-2" /> Üyelik almak için iletişime geç
        </Button>

        <div className="text-white text-center text-xs text-balance">
          Politikaları Onaylıyorum{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPrivacyPolicyOpen(true);
            }}
            className="text-white underline underline-offset-4 hover:text-blue-200"
          >
            Gizlilik Politikası
          </a>
        </div>
        
        <div className="flex justify-center gap-3 mt-2">
          <a href="https://www.youtube.com/@kriptotek" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-sky-600 to-cyan-400 p-2 rounded-lg flex items-center justify-center hover:opacity-80 transition-all w-10 h-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
              <path d="m10 15 5-3-5-3z" />
            </svg>
          </a>
          <a href="https://www.instagram.com/kriptotek/" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-sky-600 to-cyan-400 p-2 rounded-lg flex items-center justify-center hover:opacity-80 transition-all w-10 h-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a href="https://t.me/kriptotek8907" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-sky-600 to-cyan-400 p-2 rounded-lg flex items-center justify-center hover:opacity-80 transition-all w-10 h-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 3-7 18-4-8-8-4 18-7Z" />
              <path d="M22 3 11 14" />
            </svg>
          </a>
        </div>
        
        <PrivacyPolicyDialog
          open={privacyPolicyOpen}
          onOpenChange={setPrivacyPolicyOpen}
        />
      </div>
    </ThemeProvider>
  );
}
