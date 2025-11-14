import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getCurrentUser, getAuthHeaders, authFetch } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Edit,
  Trash2,
  Loader2,
  Search,
  RefreshCw,
  Key,
  UserCheck,
  UserX,
} from "lucide-react";

interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function AdminUsersContent() {
  const [, setLocation] = useLocation();
  const currentUser = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // 对话框状态
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");

  // 统计信息
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [roleFilter, statusFilter]);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/users?`;

      if (roleFilter !== 'all') {
        url += `role=${roleFilter}&`;
      }

      if (statusFilter !== 'all') {
        url += `isActive=${statusFilter}&`;
      }

      const response = await authFetch(url);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error('加载用户列表失败');
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计信息
  const fetchStats = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/users/stats/overview`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    }
  };

  // 修改角色
  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const response = await authFetch(`${API_BASE_URL}/api/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('角色修改成功');
        setRoleDialogOpen(false);
        fetchUsers();
      } else {
        toast.error(data.message || '修改失败');
      }
    } catch (error) {
      console.error('修改角色失败:', error);
      toast.error('网络错误，请稍后重试');
    }
  };

  // 修改状态
  const handleToggleStatus = async (user: User) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/users/${user.id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: !user.is_active }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch (error) {
      console.error('修改状态失败:', error);
      toast.error('网络错误，请稍后重试');
    }
  };

  // 重置密码
  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      toast.error('请输入新密码');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('密码至少6位');
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/api/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('密码重置成功');
        setPasswordDialogOpen(false);
        setNewPassword("");
      } else {
        toast.error(data.message || '重置失败');
      }
    } catch (error) {
      console.error('重置密码失败:', error);
      toast.error('网络错误，请稍后重试');
    }
  };

  // 删除用户
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await authFetch(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('用户删除成功');
        setDeleteConfirmOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      toast.error('网络错误，请稍后重试');
    }
  };

  // 筛选用户列表
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 角色显示
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-red-500"><ShieldCheck className="h-3 w-3 mr-1" />超级管理员</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500"><Shield className="h-3 w-3 mr-1" />管理员</Badge>;
      default:
        return <Badge variant="outline">普通用户</Badge>;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="container py-8">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">用户管理</h1>
              <p className="text-gray-400 mt-2">管理系统用户和权限</p>
            </div>
          </div>

          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">总用户数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">激活用户</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">禁用用户</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-400">近7天新增</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{stats.recent}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 搜索和筛选 */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 relative min-w-[200px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索用户..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                    <SelectValue placeholder="角色筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部角色</SelectItem>
                    <SelectItem value="user">普通用户</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="super_admin">超级管理员</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="true">已激活</SelectItem>
                    <SelectItem value="false">已禁用</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 用户列表 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>用户列表</CardTitle>
              <CardDescription>
                共 {filteredUsers.length} 条记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>用户信息</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead>最后登录</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold">{user.name}</div>
                              <div className="text-xs text-gray-400">{user.email}</div>
                              <div className="text-xs text-gray-500">@{user.username}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? "default" : "destructive"}>
                              {user.is_active ? '已激活' : '已禁用'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(user.created_at).toLocaleDateString('zh-CN')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.last_login_at
                                ? new Date(user.last_login_at).toLocaleDateString('zh-CN')
                                : '从未登录'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewRole(user.role);
                                  setRoleDialogOpen(true);
                                }}
                                disabled={user.id === currentUser?.id}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(user)}
                                disabled={user.id === currentUser?.id}
                              >
                                {user.is_active ? (
                                  <UserX className="h-4 w-4 text-red-400" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-400" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setPasswordDialogOpen(true);
                                }}
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteConfirmOpen(true);
                                }}
                                disabled={user.id === currentUser?.id}
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 修改角色对话框 */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>修改用户角色</DialogTitle>
            <DialogDescription>
              修改 {selectedUser?.name} 的角色权限
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>选择角色</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">普通用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="super_admin">超级管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleChangeRole} className="bg-blue-600 hover:bg-blue-700">
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重置密码对话框 */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              为 {selectedUser?.name} 设置新密码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>新密码</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="至少6位"
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleResetPassword} className="bg-blue-600 hover:bg-blue-700">
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除用户 {selectedUser?.name} 吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}

// 使用路由保护包装组件
export default function AdminUsers() {
  return (
    <ProtectedRoute requireAuth requireSuperAdmin>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
