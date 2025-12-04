/**
 * 管理员 - 折扣管理页面
 * 简化版：管理产品折扣活动
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
  Tag,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface CloudProvider {
  id: number;
  name: string;
  code: string;
}

interface Discount {
  id: number;
  name: string;
  cloud_provider_id?: number;
  cloud_provider_code?: string;
  cloud_provider_name?: string;
  resource_id?: number;
  gpu_model?: string;
  discount_rate: number;
  priority: number;
  valid_from?: string;
  valid_until?: string;
  status: 'active' | 'inactive' | 'expired';
  description?: string;
  created_at: string;
}

export default function AdminDiscounts() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cloudProviderId: '',
    cloudProviderCode: '',
    gpuModel: '',
    discountRate: '',
    priority: '0',
    validFrom: '',
    validUntil: '',
    description: ''
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
        fetchDiscounts(userData);
        fetchCloudProviders();
      } catch (e) {
        console.error("Failed to parse user data:", e);
        setLocation("/login");
      }
    } else {
      setLocation("/login");
    }
  }, []);

  const fetchDiscounts = async (userData: any) => {
    setLoading(true);
    try {
      const token = userData.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/discounts/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDiscounts(data.data);
      }
    } catch (error) {
      console.error('获取折扣失败:', error);
      toast.error('获取折扣列表失败');
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
    if (!formData.name || !formData.discountRate) {
      toast.error('请填写完整信息');
      return;
    }

    const rate = parseFloat(formData.discountRate);
    if (rate < 0 || rate > 100) {
      toast.error('折扣率必须在0-100之间');
      return;
    }

    setSubmitting(true);
    try {
      const token = user.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/discounts/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          cloudProviderId: formData.cloudProviderId ? parseInt(formData.cloudProviderId) : null,
          cloudProviderCode: formData.cloudProviderCode || null,
          gpuModel: formData.gpuModel || null,
          discountRate: rate,
          priority: parseInt(formData.priority),
          validFrom: formData.validFrom || null,
          validUntil: formData.validUntil || null,
          description: formData.description
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('折扣创建成功');
        setCreateDialogOpen(false);
        resetForm();
        fetchDiscounts(user);
      } else {
        toast.error(data.message || '创建失败');
      }
    } catch (error) {
      console.error('创建折扣失败:', error);
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个折扣吗？')) return;

    try {
      const token = user.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/discounts/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('删除成功');
        fetchDiscounts(user);
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除折扣失败:', error);
      toast.error('网络错误');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cloudProviderId: '',
      cloudProviderCode: '',
      gpuModel: '',
      discountRate: '',
      priority: '0',
      validFrom: '',
      validUntil: '',
      description: ''
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-20 pb-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">折扣管理</h1>
              <p className="text-gray-400">创建和管理产品折扣活动</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              创建折扣
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discounts.map((discount) => (
                <Card key={discount.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{discount.name}</CardTitle>
                      <Badge
                        variant={discount.status === 'active' ? 'default' : 'secondary'}
                        className={discount.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {discount.status === 'active' ? '有效' : discount.status === 'expired' ? '已过期' : '已停用'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">折扣率</span>
                        <span className="text-green-400 font-bold">{discount.discount_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">云厂商</span>
                        <span>{discount.cloud_provider_name || '全部'}</span>
                      </div>
                      {discount.gpu_model && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">GPU型号</span>
                          <span>{discount.gpu_model}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">优先级</span>
                        <span>{discount.priority}</span>
                      </div>
                      {discount.valid_until && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">有效期至</span>
                          <span className="text-xs">{new Date(discount.valid_until).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex gap-2 pt-3 border-t border-gray-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(discount.id)}
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

        {/* 创建折扣对话框 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建折扣</DialogTitle>
              <DialogDescription className="text-gray-400">
                填写折扣活动信息
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label>折扣名称 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: 双十一特惠"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

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

              <div>
                <Label>GPU型号（可选）</Label>
                <Input
                  value={formData.gpuModel}
                  onChange={(e) => setFormData({ ...formData, gpuModel: e.target.value })}
                  placeholder="例如: A100，不填表示全部型号"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              <div>
                <Label>折扣率（%）*</Label>
                <Input
                  type="number"
                  value={formData.discountRate}
                  onChange={(e) => setFormData({ ...formData, discountRate: e.target.value })}
                  placeholder="例如: 10 表示9折"
                  min="0"
                  max="100"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              <div>
                <Label>优先级</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  placeholder="数字越大优先级越高"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

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

              <div>
                <Label>活动说明（可选）</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="折扣活动的说明"
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
      </div>
    </>
  );
}
