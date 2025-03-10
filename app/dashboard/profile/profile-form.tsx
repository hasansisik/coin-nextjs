"use client";

import { Button } from "@/components/ui/button";
import { Formik, Form as FormikForm, Field } from "formik";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/redux/hook";
import { editProfile, verifyEmail } from "@/redux/actions/userActions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface ProfileFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  verificationCode: string;
}

export function ProfileForm() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [currentEmail, setCurrentEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    const value = e.target.value;
    setFieldValue("email", value);
    setCurrentEmail(value);
  };

  return (
    <>
      <Formik
        initialValues={{
          name: "",
          email: "",
          password: "",
          passwordConfirm: "",
          verificationCode: "",
        }}
        onSubmit={async (values: ProfileFormValues, { setSubmitting, setFieldValue }) => {
          try {
            const updateData: any = {};

            // Check if name has changed and is not empty
            const name = values.name?.trim();
            if (name) {
              updateData.name = name;
            }

            const email = values.email?.trim();
            if (email) {
              try {
                await dispatch(editProfile({ email })).unwrap();
                setDialogOpen(true);
                toast({
                  title: "Doğrulama Kodu Gönderildi",
                  description: "Lütfen email adresinize gönderilen doğrulama kodunu giriniz.",
                });
                return;
              } catch (error: any) {
                toast({
                  title: "Hata",
                  description: error.message || "Email güncellenirken bir hata oluştu.",
                  variant: "destructive",
                });
                return;
              }
            }

            if (values.password && values.passwordConfirm) {
              if (values.password !== values.passwordConfirm) {
                toast({
                  title: "Hata",
                  description: "Şifreler eşleşmiyor.",
                  variant: "destructive",
                });
                return;
              }
              if (values.password.length < 8) {
                toast({
                  title: "Hata",
                  description: "Şifre en az 8 karakter olmalıdır.",
                  variant: "destructive",
                });
                return;
              }
              updateData.password = values.password;
            } else if (values.password || values.passwordConfirm) {
              toast({
                title: "Hata",
                description: "Lütfen şifrenizi tekrar giriniz.",
                variant: "destructive",
              });
              return;
            }

            if (Object.keys(updateData).length === 0) {
              toast({
                title: "Bilgi",
                description: "Değişiklik yapılmadı.",
                variant: "default",
              });
              return;
            }

            // Send the update request
            await dispatch(editProfile(updateData)).unwrap();
            toast({
              title: "Başarılı",
              description: "Profil bilgileriniz güncellendi.",
            });
            
            // Reset form after successful update
            setFieldValue("name", "");
            setFieldValue("email", "");
            if (updateData.password) {
              setFieldValue("password", "");
              setFieldValue("passwordConfirm", "");
            }
          } catch (error: any) {
            toast({
              title: "Hata",
              description: error.message || "Bir hata oluştu.",
              variant: "destructive",
            });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <FormikForm className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="name">İsim</Label>
              <Field
                as={Input}
                id="name"
                name="name"
                placeholder="İsminizi girin"
              />
              <p className="text-sm text-muted-foreground">
                Bu sizin herkese açık görünen adınızdır. Gerçek adınız veya
                takma adınız olabilir.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Field
                as={Input}
                id="email"
                name="email"
                type="email"
                placeholder="ornek@email.com"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEmailChange(e, setFieldValue)}
              />
              <p className="text-sm text-muted-foreground">
                Email adresiniz hesabınızı doğrulamak ve güvenlik bildirimleri
                için kullanılacaktır.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Yeni Şifre</Label>
                <Field
                  as={PasswordInput}
                  id="password"
                  name="password"
                  placeholder="********"
                />
                <p className="text-sm text-muted-foreground">
                  Şifrenizi değiştirmek istemiyorsanız boş bırakın.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Şifreyi Tekrar Girin</Label>
                <Field
                  as={PasswordInput}
                  id="passwordConfirm"
                  name="passwordConfirm"
                  placeholder="********"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </FormikForm>
        )}
      </Formik>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Doğrulama</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Email adresinize doğrulama kodu gönderildi. Lütfen gelen kodu girerek email adresinizi doğrulayın.</p>
            <Formik
              initialValues={{ verificationCode: "" }}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await dispatch(verifyEmail({ 
                    email: currentEmail,
                    verificationCode: Number(values.verificationCode)
                  })).unwrap();
                  
                  toast({
                    title: "Başarılı",
                    description: "Email adresiniz başarıyla doğrulandı.",
                  });
                  
                  setDialogOpen(false);
                } catch (error: any) {
                  toast({
                    title: "Hata",
                    description: error.message || "Doğrulama başarısız oldu.",
                    variant: "destructive",
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <FormikForm className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Doğrulama Kodu</Label>
                    <Field
                      as={Input}
                      id="verificationCode"
                      name="verificationCode"
                      placeholder="Doğrulama kodunu girin"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    Doğrula
                  </Button>
                </FormikForm>
              )}
            </Formik>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
