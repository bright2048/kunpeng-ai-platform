/**
 * 管理员 - 算力券管理页面
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  Gift,
  Loader2,
  Calendar,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface CloudProvider {
  id: number;
  name: string;
  code: string;
}

interface Voucher {
  id: number;
  code: string;
  name: string;
  cloud_provider_id?: number;
  cloud_provider_code?: string;
  cloud_provider_name?: string;
  type: 'amount' | 'discount' | 'free_hours';
  value: number;
  min_amount: number;
  max_discount?: number;
  total_quantity: number;
  used_quantity: number;
  valid_from?: string;
  valid_until?: string;
  status: 'active' | 'inactive' | 'expired';
  description?: string;
  created_at: string;
}

export default function AdminVouchers() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);

  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // 表单数据
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    cloudProviderId: '',
    cloudProviderCode: '',
    type: 'amount',
    value: '',
    minAmount: '0',
    maxDiscount: '',
    totalQuantity: '100',
    validFrom: '',
    validUntil: '',
    description: ''
  });

  // 赠送表单
  const [grantForm, setGrantForm] = useState({
    voucherCode: '',
    userIds: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        if (!userData.is_admin) {
          toast.error("无权访问");
          setLocation("/");
          return;
        }
        fetchVouchers(userData);
        fetchCloudProviders();
      } catch (e) {
        console.error("Failed to parse user data:", e);
        setLocation("/login");
      }
    } else {
      setLocation("/login");
    }
  }, []);

  const fetchVouchers = async (userData: any) => {
    setLoading(true);
    try {
      const token = userData.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vouchers/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setVouchers(data.data);
      }
    } catch (error) {
      console.error('获取算力券失败:', error);
      toast.error('获取算力券列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCloudProviders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cloud-providers?status=active`);
      const data = await response.json();
      if (data.success) {
        setCloudProviders(data.data);
      }
    } catch (error) {
      console.error('获取云厂商失败:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.code || !formData.name || !formData.value) {
      toast.error('请填写完整信息');
      return;
    }

    setSubmitting(true);
    try {
      const token = user.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vouchers/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          cloudProviderId: formData.cloudProviderId ? parseInt(formData.cloudProviderId) : null,
          cloudProviderCode: formData.cloudProviderCode || null,
          type: formData.type,
          value: parseFloat(formData.value),
          minAmount: parseFloat(formData.minAmount),
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          totalQuantity: parseInt(formData.totalQuantity),
          validFrom: formData.validFrom || null,
          validUntil: formData.validUntil || null,
          description: formData.description
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('算力券创建成功');
        setCreateDialogOpen(false);
        resetForm();
        fetchVouchers(user);
      } else {
        toast.error(data.message || '创建失败');
      }
    } catch (error) {
      console.error('创建算力券失败:', error);
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrant = async () => {
    if (!grantForm.voucherCode || !grantForm.userIds) {
      toast.error('请填写完整信息');
      return;
    }

    const userIds = grantForm.userIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (userIds.length === 0) {
      toast.error('请输入有效的用户ID');
      return;
    }

    setSubmitting(true);
    try {
      const token = user.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vouchers/admin/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          voucherCode: grantForm.voucherCode,
          userIds
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`成功赠送${data.data.successCount}张，失败${data.data.failCount}张`);
        setGrantDialogOpen(false);
        setGrantForm({ voucherCode: '', userIds: '' });
        fetchVouchers(user);
      } else {
        toast.error(data.message || '赠送失败');
      }
    } catch (error) {
      console.error('赠送算力券失败:', error);
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这张算力券吗？')) return;

    try {
      const token = user.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vouchers/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('删除成功');
        fetchVouchers(user);
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除算力券失败:', error);
      toast.error('网络错误');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      cloudProviderId: '',
      cloudProviderCode: '',
      type: 'amount',
      value: '',
      minAmount: '0',
      maxDiscount: '',
      totalQuantity: '100',
      validFrom: '',
      validUntil: '',
      description: ''
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-20 pb-12">
        <div className="container">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">算力券管理</h1>
              <p className="text-gray-400">创建、管理和赠送算力券</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setGrantDialogOpen(true)} variant="outline">
                <Gift className="h-4 w-4 mr-2" />
                赠送算力券
              </Button>
              <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                创建算力券
              </Button>
            </div>
          </div>

          {/* 算力券列表 */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vouchers.map((voucher) => (
                <Card key={voucher.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{voucher.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {voucher.code}
                        </Badge>
                      </div>
                      <Badge
                        variant={voucher.status === 'active' ? 'default' : 'secondary'}
                        className={voucher.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {voucher.status === 'active' ? '有效' : voucher.status === 'expired' ? '已过期' : '已停用'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {/* 云厂商 */}
                      <div className="flex justify-between">
                        <span className="text-gray-400">适用云厂商</span>
                        <span>{voucher.cloud_provider_name || '全部'}</span>
                      </div>

                      {/* 类型和值 */}
                      <div className="flex justify-between">
                        <span className="text-gray-400">类型</span>
                        <span>
                          {voucher.type === 'amount' && `抵扣¥${voucher.value}`}
                          {voucher.type === 'discount' && `${voucher.value}折`}
                          {voucher.type === 'free_hours' && `${voucher.value}小时`}
                        </span>
                      </div>

                      {/* 最低消费 */}
                      {voucher.min_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">最低消费</span>
                          <span>¥{voucher.min_amount}</span>
                        </div>
                      )}

                      {/* 发行量 */}
                      <div className="flex justify-between">
                        <span className="text-gray-400">发行量</span>
                        <span>{voucher.used_quantity} / {voucher.total_quantity}</span>
                      </div>

                      {/* 有效期 */}
                      {voucher.valid_until && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">有效期至</span>
                          <span className="text-xs">{new Date(voucher.valid_until).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="flex gap-2 pt-3 border-t border-gray-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(voucher.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          删除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 创建算力券对话框 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建算力券</DialogTitle>
              <DialogDescription className="text-gray-400">
                填写算力券信息
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* 代码 */}
              <div>
                <Label>算力券代码 *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="例如: ALIYUN50"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              {/* 名称 */}
              <div>
                <Label>算力券名称 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: 阿里云50元算力券"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              {/* 云厂商 */}
              <div>
                <Label>适用云厂商（可选）</Label>
                <Select
                  value={formData.cloudProviderId}
                  onValueChange={(value) => {
                    const provider = cloudProviders.find(p => p.id === parseInt(value));
                    setFormData({
                      ...formData,
                      cloudProviderId: value,
                      cloudProviderCode: provider?.code || ''
                    });
                  }}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="全部云厂商" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部云厂商</SelectItem>
                    {cloudProviders.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 类型 */}
              <div>
                <Label>类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">金额券</SelectItem>
                    <SelectItem value="discount">折扣券</SelectItem>
                    <SelectItem value="free_hours">免费时长</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 值 */}
              <div>
                <Label>
                  {formData.type === 'amount' && '抵扣金额（元）*'}
                  {formData.type === 'discount' && '折扣率（%）*'}
                  {formData.type === 'free_hours' && '免费小时数 *'}
                </Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="例如: 50"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              {/* 最低消费 */}
              <div>
                <Label>最低消费金额（元）</Label>
                <Input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  placeholder="0表示无限制"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              {/* 最大优惠 */}
              <div>
                <Label>最大优惠金额（元，可选）</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="不填表示无限制"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              {/* 发行数量 */}
              <div>
                <Label>发行数量 *</Label>
                <Input
                  type="number"
                  value={formData.totalQuantity}
                  onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value })}
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              {/* 有效期 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>有效期开始（可选）</Label>
                  <Input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                <div>
                  <Label>有效期结束（可选）</Label>
                  <Input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
              </div>

              {/* 说明 */}
              <div>
                <Label>使用说明（可选）</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="算力券的使用说明"
                  className="bg-gray-900 border-gray-700"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
                取消
              </Button>
              <Button onClick={handleCreate} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 赠送算力券对话框 */}
        <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>赠送算力券</DialogTitle>
              <DialogDescription className="text-gray-400">
                批量赠送算力券给用户
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* 算力券代码 */}
              <div>
                <Label>算力券代码 *</Label>
                <Input
                  value={grantForm.voucherCode}
                  onChange={(e) => setGrantForm({ ...grantForm, voucherCode: e.target.value })}
                  placeholder="例如: ALIYUN50"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              {/* 用户ID列表 */}
              <div>
                <Label>用户ID列表 *</Label>
                <Textarea
                  value={grantForm.userIds}
                  onChange={(e) => setGrantForm({ ...grantForm, userIds: e.target.value })}
                  placeholder="多个用户ID用逗号分隔，例如: 1,2,3,4,5"
                  className="bg-gray-900 border-gray-700"
                  rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">
                  提示：多个用户ID用逗号分隔
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setGrantDialogOpen(false)} disabled={submitting}>
                取消
              </Button>
              <Button onClick={handleGrant} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                赠送
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
