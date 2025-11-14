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
import { getCurrentUser, getAuthHeaders, authFetch, isAdmin } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  RefreshCw,
} from "lucide-react";

// GPU资源类型
interface GPUResource {
  id?: number;
  model: string;
  vendor: string;
  price: number;
  price_unit: string;
  vram: number;
  card_count: number;
  cpu: number;
  memory: number;
  storage: number;
  stock: number;
  region: string;
  rental_type: string;
  billing_cycle: string;
  is_hot: boolean;
  is_special: boolean;
  status: string;
  description: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || ''; function AdminGPUContent() {
  const [, setLocation] = useLocation();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [gpuList, setGpuList] = useState<GPUResource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGPU, setEditingGPU] = useState<GPUResource | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 表单数据
  const [formData, setFormData] = useState<GPUResource>({
    model: "",
    vendor: "NVIDIA",
    price: 0,
    price_unit: "小时",
    vram: 0,
    card_count: 1,
    cpu: 0,
    memory: 0,
    storage: 0,
    stock: 0,
    region: "华东一区",
    rental_type: "online",
    billing_cycle: "hourly",
    is_hot: false,
    is_special: false,
    status: "active",
    description: "",
  });

  useEffect(() => {
    fetchGPUResources();
  }, []);

  // 获取GPU资源列表
  const fetchGPUResources = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/gpu/resources`);
      const data = await response.json();

      if (data.success) {
        setGpuList(data.data);
      } else {
        toast.error('加载GPU资源失败');
      }
    } catch (error) {
      console.error('获取GPU资源失败:', error);
      toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 打开新增对话框
  const handleAdd = () => {
    setEditingGPU(null);
    setFormData({
      model: "",
      vendor: "NVIDIA",
      price: 0,
      price_unit: "小时",
      vram: 0,
      card_count: 1,
      cpu: 0,
      memory: 0,
      storage: 0,
      stock: 0,
      region: "华东一区",
      rental_type: "online",
      billing_cycle: "hourly",
      is_hot: false,
      is_special: false,
      status: "active",
      description: "",
    });
    setDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (gpu: GPUResource) => {
    setEditingGPU(gpu);
    setFormData(gpu);
    setDialogOpen(true);
  };

  // 保存GPU资源
  const handleSave = async () => {
    // 验证必填字段
    if (!formData.model || !formData.price || !formData.vram || !formData.cpu || !formData.memory || !formData.storage) {
      toast.error("请填写完整信息");
      return;
    }

    try {
      const url = editingGPU
        ? `${API_BASE_URL}/api/gpu/resources/${editingGPU.id}`
        : `${API_BASE_URL}/api/gpu/resources`;

      const method = editingGPU ? 'PUT' : 'POST';

      const response = await authFetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          model: formData.model,
          vendor: formData.vendor,
          price: parseFloat(formData.price.toString()),
          priceUnit: formData.price_unit,
          vram: parseInt(formData.vram.toString()),
          cardCount: parseInt(formData.card_count.toString()),
          cpu: parseInt(formData.cpu.toString()),
          memory: parseInt(formData.memory.toString()),
          storage: parseInt(formData.storage.toString()),
          stock: parseInt(formData.stock.toString()),
          region: formData.region,
          rentalType: formData.rental_type,
          billingCycle: formData.billing_cycle,
          isHot: formData.is_hot,
          isSpecial: formData.is_special,
          status: formData.status,
          description: formData.description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingGPU ? 'GPU资源更新成功' : 'GPU资源创建成功');
        setDialogOpen(false);
        fetchGPUResources();
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch (error) {
      console.error('保存GPU资源失败:', error);
      toast.error('网络错误，请稍后重试');
    }
  };

  // 删除GPU资源
  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await authFetch(`${API_BASE_URL}/api/gpu/resources/${deletingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('GPU资源删除成功');
        setDeleteConfirmOpen(false);
        setDeletingId(null);
        fetchGPUResources();
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除GPU资源失败:', error);
      toast.error('网络错误，请稍后重试');
    }
  };

  // 筛选GPU列表
  const filteredList = gpuList.filter(gpu =>
    gpu.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gpu.region.includes(searchTerm) ||
    gpu.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="container py-8">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">GPU资源管理</h1>
              <p className="text-gray-400 mt-2">管理算力保障页面展示的GPU资源</p>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加GPU资源
            </Button>
          </div>

          {/* 搜索和刷新 */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索GPU型号、区域或厂商..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={fetchGPUResources}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* GPU资源列表 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>GPU资源列表</CardTitle>
              <CardDescription>
                共 {filteredList.length} 条记录
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
                        <TableHead>GPU型号</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>配置</TableHead>
                        <TableHead>库存</TableHead>
                        <TableHead>区域</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>标签</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredList.map((gpu) => (
                        <TableRow key={gpu.id}>
                          <TableCell>{gpu.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold">{gpu.model}</div>
                              <div className="text-xs text-gray-400">{gpu.vendor}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-orange-400 font-semibold">
                              ¥{gpu.price}/{gpu.price_unit}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              <div>{gpu.vram}GB × {gpu.card_count}卡</div>
                              <div>{gpu.cpu}核 / {gpu.memory}GB / {gpu.storage}GB</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={gpu.stock > 0 ? "default" : "destructive"}>
                              {gpu.stock}
                            </Badge>
                          </TableCell>
                          <TableCell>{gpu.region}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                gpu.status === 'active' ? 'default' :
                                  gpu.status === 'inactive' ? 'destructive' : 'outline'
                              }
                            >
                              {gpu.status === 'active' ? '可用' :
                                gpu.status === 'inactive' ? '下线' : '维护中'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {gpu.is_hot && (
                                <Badge variant="destructive" className="text-xs">热门</Badge>
                              )}
                              {gpu.is_special && (
                                <Badge className="text-xs bg-orange-500">特惠</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(gpu)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeletingId(gpu.id!);
                                  setDeleteConfirmOpen(true);
                                }}
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

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingGPU ? '编辑GPU资源' : '添加GPU资源'}</DialogTitle>
            <DialogDescription>
              填写GPU资源的详细信息
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* GPU型号 */}
            <div>
              <Label>GPU型号 *</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="如: RTX 4090"
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* 厂商 */}
            <div>
              <Label>厂商</Label>
              <Select
                value={formData.vendor}
                onValueChange={(value) => setFormData({ ...formData, vendor: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NVIDIA">NVIDIA</SelectItem>
                  <SelectItem value="AMD">AMD</SelectItem>
                  <SelectItem value="Intel">Intel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 价格 */}
            <div>
              <Label>价格 *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* 计费单位 */}
            <div>
              <Label>计费单位</Label>
              <Select
                value={formData.price_unit}
                onValueChange={(value) => setFormData({ ...formData, price_unit: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="小时">小时</SelectItem>
                  <SelectItem value="天">天</SelectItem>
                  <SelectItem value="月">月</SelectItem>
                  <SelectItem value="季度">季度</SelectItem>
                  <SelectItem value="年">年</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 显存 */}
            <div>
              <Label>显存(GB) *</Label>
              <Input
                type="number"
                value={formData.vram}
                onChange={(e) => setFormData({ ...formData, vram: parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* 卡数 */}
            <div>
              <Label>卡数</Label>
              <Input
                type="number"
                value={formData.card_count}
                onChange={(e) => setFormData({ ...formData, card_count: parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* CPU */}
            <div>
              <Label>CPU核心数 *</Label>
              <Input
                type="number"
                value={formData.cpu}
                onChange={(e) => setFormData({ ...formData, cpu: parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* 内存 */}
            <div>
              <Label>内存(GB) *</Label>
              <Input
                type="number"
                value={formData.memory}
                onChange={(e) => setFormData({ ...formData, memory: parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* 存储 */}
            <div>
              <Label>存储(TB) *</Label>
              <Input
                type="number"
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* 库存 */}
            <div>
              <Label>库存数量</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="bg-gray-700 border-gray-600"
              />
            </div>

            {/* 区域 */}
            <div>
              <Label>区域 *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData({ ...formData, region: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['华东一区', '华东二区', '华南一区', '华北一区', '华中一区', '西北一区'].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 租用方案 */}
            <div>
              <Label>租用方案</Label>
              <Select
                value={formData.rental_type}
                onValueChange={(value) => setFormData({ ...formData, rental_type: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">线上租用</SelectItem>
                  <SelectItem value="bare-metal">线下裸金属</SelectItem>
                  <SelectItem value="cluster">集群租用</SelectItem>
                  <SelectItem value="edge">边缘计算</SelectItem>
                  <SelectItem value="dedicated">专属资源池</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 计费周期 */}
            <div>
              <Label>计费周期</Label>
              <Select
                value={formData.billing_cycle}
                onValueChange={(value) => setFormData({ ...formData, billing_cycle: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">按量计费</SelectItem>
                  <SelectItem value="daily">按天计费</SelectItem>
                  <SelectItem value="monthly">按月计费</SelectItem>
                  <SelectItem value="quarterly">按季度计费</SelectItem>
                  <SelectItem value="yearly">按年计费</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 状态 */}
            <div>
              <Label>状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">可用</SelectItem>
                  <SelectItem value="inactive">下线</SelectItem>
                  <SelectItem value="maintenance">维护中</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 热门标签 */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_hot}
                  onChange={(e) => setFormData({ ...formData, is_hot: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>热门</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_special}
                  onChange={(e) => setFormData({ ...formData, is_special: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>特惠</span>
              </label>
            </div>

            {/* 描述 */}
            <div className="col-span-2">
              <Label>描述</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="资源描述信息"
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              保存
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
              确定要删除这个GPU资源吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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
export default function AdminGPU() {
  return (
    <ProtectedRoute requireAuth requireAdmin>
      <AdminGPUContent />
    </ProtectedRoute>
  );
}
