"use client";

import { Button } from "@/components/ui/button";
import { Formik, Form as FormikForm, Field } from "formik";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { editProfile, verifyEmail } from "@/redux/actions/userActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { deleteSocialMenuItem, getFooterData, updateKvk, updateSocialMenu } from "@/redux/actions/footerActions";
import { clearError, clearSuccess } from "@/redux/reducers/footerReducer";
import { Textarea } from "@/components/ui/textarea";

interface ProfileFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  verificationCode: string;
}

const stripHtmlTags = (html: string) => {
  return html.replace(/<[^>]*>/g, '');
};

export function ProfileForm() {
  const [currentEmail, setCurrentEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { footer, error, success } = useSelector(
    (state: any) => state.footer
  );

  const [kvk, setKvk] = useState("<p></p>");
  const [socialMenu, setSocialMenu] = useState<any[]>([{ title: "", url: "" }]);

  useEffect(() => {
    dispatch(getFooterData());
  }, [dispatch]);

  useEffect(() => {
    if (footer) {
      if (footer.kvk?.content) {
        setKvk(stripHtmlTags(footer.kvk.content));
      }
      if (footer.socialMenu) {
        setSocialMenu(footer.socialMenu);
      }
    }
  }, [footer]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
      dispatch(clearError());
    }
    if (success) {
      toast({
        title: "Success",
        description: "Footer updated successfully!",
      });
      dispatch(clearSuccess());
      dispatch(getFooterData());
    }
  }, [error, success, dispatch, toast]);

  const handleKvkUpdate = () => {
    dispatch(
      updateKvk({
        title: "KVK Aydınlatma Metni",
        content: `<p>${kvk}</p>`,
      })
    );
  };

  const handleSocialMenuChange = (index: number, field: string, value: string) => {
    const newSocialMenu = socialMenu.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setSocialMenu(newSocialMenu);
  };

  const handleAddSocialMenu = () => {
    setSocialMenu([...socialMenu, { title: "", url: "" }]);
  };

  const handleRemoveSocialMenu = (index: number) => {
    const itemId = socialMenu[index]._id;
    dispatch(deleteSocialMenuItem(itemId)).then(() => {
      const newSocialMenu = socialMenu.filter((_, i) => i !== index);
      setSocialMenu(newSocialMenu);
      toast({
        title: "Success",
        description: "Sosyal menü öğesi başarıyla silindi!",
      });
    });
  };

  const handleSocialMenuUpdate = () => {
    dispatch(updateSocialMenu(socialMenu));
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
        onSubmit={async (
          values: ProfileFormValues,
          { setSubmitting, setFieldValue }
        ) => {
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
                  description:
                    "Lütfen email adresinize gönderilen doğrulama kodunu giriniz.",
                });
                return;
              } catch (error: any) {
                toast({
                  title: "Hata",
                  description:
                    error.message || "Email güncellenirken bir hata oluştu.",
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
        {({ isSubmitting, setFieldValue }) => (
          <FormikForm className="space-y-8">
            <div className="grid gap-8">
              {/* Policies Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Politikalar</CardTitle>
                </CardHeader>
                <CardContent>
                  <>
                    <Textarea 
                      value={kvk}
                      onChange={(e) => setKvk(e.target.value)}
                      placeholder="KVK metnini buraya giriniz"
                      className="min-h-[200px]"
                    />
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleKvkUpdate}>
                        KVK Metnini Güncelle
                      </Button>
                    </div>
                  </>
                </CardContent>
              </Card>

              <Separator />

              {/* Social Menu Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Sosyal Menü</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {socialMenu.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`socialMenu-title-${index}`}>
                        Başlık
                      </Label>
                      <Input
                        id={`socialMenu-title-${index}`}
                        value={item.title}
                        onChange={(e) =>
                          handleSocialMenuChange(index, "title", e.target.value)
                        }
                        placeholder="Başlık"
                      />
                      <Label htmlFor={`socialMenu-url-${index}`}>URL</Label>
                      <Input
                        id={`socialMenu-url-${index}`}
                        value={item.url}
                        onChange={(e) =>
                          handleSocialMenuChange(index, "url", e.target.value)
                        }
                        placeholder="URL"
                      />
                      <Button
                        variant="destructive"
                        onClick={() => handleRemoveSocialMenu(index)}
                      >
                        Sil
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <Button variant="secondary" onClick={handleAddSocialMenu}>
                      Yeni Sosyal Menü Ekle
                    </Button>
                    <Button onClick={handleSocialMenuUpdate}>
                      Sosyal Menüyü Güncelle
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
            <p>
              Email adresinize doğrulama kodu gönderildi. Lütfen gelen kodu
              girerek email adresinizi doğrulayın.
            </p>
            <Formik
              initialValues={{ verificationCode: "" }}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await dispatch(
                    verifyEmail({
                      email: currentEmail,
                      verificationCode: Number(values.verificationCode),
                    })
                  ).unwrap();

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
