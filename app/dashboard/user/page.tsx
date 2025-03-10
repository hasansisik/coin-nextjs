"use client"

import { useState } from "react"
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

export default function UserPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  // Dummy data - replace with real data later
  const users = [
    {
      id: 1,
      avatar: "/avatars/01.png",
      name: "John Doe",
      email: "john@example.com",
      status: "Active",
      createDate: "2024-01-20",
    },
    // Add more users as needed
  ]

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setIsEditOpen(true)
  }

  const handleCreateClose = () => {
    setIsCreateOpen(false)
  }

  const handleEditClose = () => {
    setIsEditOpen(false)
    setEditingUser(null)
  }

  const UserForm = ({ isEdit = false }) => (
    <div className="p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input 
                id="name"
                placeholder="Name" 
                defaultValue={editingUser?.name}
                className="max-w-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input 
                id="email"
                placeholder="Email" 
                type="email" 
                defaultValue={editingUser?.email}
                className="max-w-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Kullanıcı Rolü</Label>
              <Select defaultValue={editingUser?.status || "user"}>
                <SelectTrigger id="role" className="max-w-lg">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input 
                id="password"
                placeholder="Password" 
                type="password"
                className="max-w-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <Input 
                id="confirmPassword"
                placeholder="Confirm Password" 
                type="password"
                className="max-w-lg"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <Button 
            variant="outline" 
            onClick={isEdit ? handleEditClose : handleCreateClose}
            className="flex-1"
          >
            Vazgeç
          </Button>
          <Button 
            onClick={isEdit ? handleEditClose : handleCreateClose}
            className="flex-1"
          >
            {isEdit ? "Kaydet" : "Kullanıcı Oluştur"}
          </Button>
        </div>
      </div>
    </div>
  )

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
            <TableRow key={user.id}>
              <TableCell className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>{user.createDate}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
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
