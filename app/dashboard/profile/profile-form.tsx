"use client";

import { Button } from "@/components/ui/button";
import { Formik, Form as FormikForm } from "formik";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { editProfile } from "@/redux/actions/userActions";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { deleteSocialMenuItem, getFooterData, updateKvk, updateSocialMenu, updateInfo, updateLogin } from "@/redux/actions/footerActions";
import { clearError, clearSuccess } from "@/redux/reducers/footerReducer";
import { Textarea } from "@/components/ui/textarea";

interface ProfileFormValues {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  verificationCode: string;
}

export function ProfileForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { footer, error, success } = useSelector(
    (state: any) => state.footer
  );

  const [kvk, setKvk] = useState("");
  const [info, setInfo] = useState("");
  const [socialMenu, setSocialMenu] = useState<any[]>([{ title: "", url: "" }]);
  const [login, setLogin] = useState("");

  useEffect(() => {
    dispatch(getFooterData());
  }, [dispatch]);

  useEffect(() => {
    if (footer) {
      if (footer.kvk?.content) {
        setKvk(footer.kvk.content);
      }
      if (footer.info?.content) {
        setInfo(footer.info.content);
      }
      if (footer.socialMenu) {
        setSocialMenu(footer.socialMenu);
      }
      if (footer.login?.content) {
        setLogin(footer.login.content);
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
        content: kvk,
      })
    );
  };

  const handleInfoUpdate = () => {
    dispatch(
      updateInfo({
        title: "Information",
        content: info,
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

  const handleLoginUpdate = () => {
    dispatch(updateLogin(login));
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
        {({ isSubmitting }) => (
          <FormikForm className="space-y-8">
            <div className="grid gap-8">
              {/* Login Section */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Giriş Ekranı Başlığı</CardTitle>
                </CardHeader>
                <CardContent>
                  <>
                    <Textarea 
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      placeholder="Login bilgisini buraya giriniz"
                      className="min-h-[200px] dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400"
                    />
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleLoginUpdate} className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                        Login Bilgisini Güncelle
                      </Button>
                    </div>
                  </>
                </CardContent>
              </Card>

              {/* KVK Section */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">KVK Aydınlatma Metni</CardTitle>
                </CardHeader>
                <CardContent>
                  <>
                    <Textarea 
                      value={kvk}
                      onChange={(e) => setKvk(e.target.value)}
                      placeholder="KVK metnini buraya giriniz"
                      className="min-h-[200px] dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400"
                    />
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleKvkUpdate} className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                        KVK Metnini Güncelle
                      </Button>
                    </div>
                  </>
                </CardContent>
              </Card>

              {/* Info Section */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Bilgilendirme Metni</CardTitle>
                </CardHeader>
                <CardContent>
                  <>
                    <Textarea 
                      value={info}
                      onChange={(e) => setInfo(e.target.value)}
                      placeholder="Bilgilendirme metnini buraya giriniz"
                      className="min-h-[200px] dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400"
                    />
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleInfoUpdate} className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                        Bilgilendirme Metnini Güncelle
                      </Button>
                    </div>
                  </>
                </CardContent>
              </Card>

              {/* Social Menu Section */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Sosyal Medya Menüsü</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {socialMenu.map((item, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <Label htmlFor={`social-title-${index}`} className="dark:text-white">Başlık</Label>
                          <Input 
                            id={`social-title-${index}`}
                            value={item.title} 
                            onChange={(e) => handleSocialMenuChange(index, 'title', e.target.value)}
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`social-url-${index}`} className="dark:text-white">URL</Label>
                          <Input 
                            id={`social-url-${index}`}
                            value={item.url} 
                            onChange={(e) => handleSocialMenuChange(index, 'url', e.target.value)}
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                        <div className="flex items-end pb-1">
                          <Button 
                            variant="destructive" 
                            onClick={() => handleRemoveSocialMenu(index)}
                            className="dark:bg-red-900 dark:hover:bg-red-800"
                          >
                            Sil
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-4">
                      <Button 
                        onClick={handleAddSocialMenu}
                        className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                      >
                        Yeni Ekle
                      </Button>
                      <Button 
                        onClick={handleSocialMenuUpdate}
                        className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                      >
                        Sosyal Menüyü Güncelle
                      </Button>
                    </div>
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
    </>
  );
}
