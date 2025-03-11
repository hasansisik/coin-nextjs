"use client"

import { useEffect, useState } from "react"
import { useFormik } from "formik"
import { useToast } from "@/components/ui/use-toast"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { getAllUsers, register, deleteUser, editUsers } from "@/redux/actions/userActions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Role gösterimi için helper fonksiyon
const getRoleLabel = (role: string) => {
  switch (role) {
    case 'user':
      return 'Kullanıcı'
    case 'admin':
      return 'Admin'
    default:
      return role
  }
}

export default function UserPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.user);
  const { toast } = useToast()
  console.log("users",users)

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setIsEditOpen(true)
  }

  const handleDelete = async (userId: string) => {
    try {
      await dispatch(deleteUser(userId));
      toast({
        title: "Kullanıcı silindi",
        description: "Kullanıcı başarıyla silindi.",
      })
      dispatch(getAllUsers());
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kullanıcı silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handleCreateClose = () => {
    setIsCreateOpen(false)
  }

  const handleEditClose = () => {
    setIsEditOpen(false)
    setEditingUser(null)
  }

  const UserForm = ({ isEdit = false }) => {
    const formik = useFormik({
      initialValues: {
        name: editingUser?.name || "",
        email: editingUser?.email || "",
        role: editingUser?.role || "user",
        password: "",
        confirmPassword: "",
      },
      onSubmit: async (values) => {
        try {
          if (isEdit) {
            await dispatch(editUsers({
              id: editingUser._id,  // _id'yi doğru şekilde gönderiyoruz
              name: values.name,
              email: values.email,
              role: values.role,
            }));
            toast({
              title: "Kullanıcı güncellendi",
              description: "Kullanıcı bilgileri başarıyla güncellendi.",
            })
            handleEditClose();
          } else {
            await dispatch(register(values));
            toast({
              title: "Kullanıcı oluşturuldu",
              description: "Yeni kullanıcı başarıyla oluşturuldu.",
            })
            handleCreateClose();
          }
          dispatch(getAllUsers());
        } catch (error) {
          toast({
            title: "Hata",
            description: isEdit ? "Güncelleme sırasında bir hata oluştu." : "Kullanıcı oluşturulurken bir hata oluştu.",
            variant: "destructive",
          })
        }
      },
    });

    return (
      <div className="p-6">
        <form onSubmit={formik.handleSubmit} className="max-w-lg mx-auto space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input 
                  id="name"
                  name="name"
                  placeholder="Name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  className="max-w-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input 
                  id="email"
                  name="email"
                  placeholder="Email"
                  type="email"
                  onChange={formik.handleChange}
                  value={formik.values.email}
                  className="max-w-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Kullanıcı Rolü</Label>
                <Select 
                  name="role"
                  value={formik.values.role}
                  onValueChange={(value) => formik.setFieldValue("role", value)}
                >
                  <SelectTrigger id="role" className="max-w-lg">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Kullanıcı</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input 
                  id="password"
                  name="password"
                  placeholder="Password"
                  type="password"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  className="max-w-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                <Input 
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  type="password"
                  onChange={formik.handleChange}
                  value={formik.values.confirmPassword}
                  className="max-w-lg"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={isEdit ? handleEditClose : handleCreateClose}
              className="flex-1"
            >
              Vazgeç
            </Button>
            <Button 
              type="submit"
              className="flex-1"
            >
              {isEdit ? "Kaydet" : "Kullanıcı Oluştur"}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        
        {/* Create User Drawer */}
        <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DrawerTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} />
              Kullanıcı Oluştur
            </Button>
          </DrawerTrigger>
          <DrawerContent className="pb-4">
            <DrawerHeader className="border-b pb-4">
              <DrawerTitle className="text-xl font-semibold">
                Kullanıcı Oluştur
              </DrawerTitle>
            </DrawerHeader>
            <UserForm isEdit={false} />
          </DrawerContent>
        </Drawer>

        {/* Edit User Drawer */}
        <Drawer open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DrawerContent className="pb-4">
            <DrawerHeader className="border-b pb-4">
              <DrawerTitle className="text-xl font-semibold">Edit User</DrawerTitle>
            </DrawerHeader>
            <UserForm isEdit={true} />
          </DrawerContent>
        </Drawer>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kullanıcı</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Oluşturulma Tarihi</TableHead>
            <TableHead className="text-right">Aksiyonlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleLabel(user.role)}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</TableCell>
              <TableCell className="text-right relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50">
                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600"
                    >
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
