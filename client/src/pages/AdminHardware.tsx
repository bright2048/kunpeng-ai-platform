import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// 硬件产品接口
interface HardwareProduct {
  id: number;
  product_name: string;
  product_model: string;
  category: string;
  cpu_brand?: string;
  cpu_model?: string;
  gpu_brand?: string;
  gpu_model?: string;
  memory_size?: string;
  storage_size?: string;
  port_count?: number;
  port_speed?: string;
  network_layer?: string;
  print_type?: string;
  print_speed?: string;
  print_color?: boolean;
  screen_size?: string;
  resolution?: string;
  refresh_rate?: string;
  panel_type?: string;
  price: number;
  stock: number;
  images: string[];
  detail_pdf?: string;
  brief_description?: string;
  full_description?: string;
  status: string;
  is_hot: boolean;
  is_new: boolean;
  is_recommended: boolean;
  view_count: number;
  sales_count: number;
  created_at: string;
}

// 表单数据接口
interface ProductFormData {
  product_name: string;
  product_model: string;
  category: string;
  cpu_brand?: string;
  cpu_model?: string;
  gpu_brand?: string;
  gpu_model?: string;
  memory_size?: string;
  storage_size?: string;
  port_count?: number;
  port_speed?: string;
  network_layer?: string;
  print_type?: string;
  print_speed?: string;
  print_color?: boolean;
  screen_size?: string;
  resolution?: string;
  refresh_rate?: string;
  panel_type?: string;
  price: number;
  stock: number;
  brief_description?: string;
  full_description?: string;
  status: string;
  is_hot: boolean;
  is_new: boolean;
  is_recommended: boolean;
}

export default function AdminHardware() {
  const [, setLocation] = useLocation();

  const [products, setProducts] = useState<HardwareProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<HardwareProduct | null>(null);

  // 表单数据
  const [formData, setFormData] = useState<ProductFormData>({
    product_name: "",
    product_model: "",
    category: "laptop",
    price: 0,
    stock: 0,
    status: "active",
    is_hot: false,
    is_new: false,
    is_recommended: false,
  });

  // 图片上传
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // PDF上传
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdf, setExistingPdf] = useState<string>("");

  // 权限检查
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("请先登录");
      setLocation("/login");
      return;
    }

    const userData = JSON.parse(user);
    
    // 检查是否是管理员（支持 role 或 is_admin 字段）
    const isAdmin = userData.role === 'admin' || 
                   userData.role === 'super_admin' || 
                   userData.is_admin === true;
    
    if (!isAdmin) {
      toast.error("您没有权限访问此页面");
      setLocation("/");
      return;
    }

    fetchProducts();
  }, []);

  // 获取产品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/hardware/products?all=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        toast.error(data.message || "获取产品列表失败");
      }
    } catch (error) {
      console.error("获取产品列表失败:", error);
      toast.error("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 打开新建对话框
  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      product_name: "",
      product_model: "",
      category: "laptop",
      price: 0,
      stock: 0,
      status: "active",
      is_hot: false,
      is_new: false,
      is_recommended: false,
    });
    setImageFiles([]);
    setImagePreviewUrls([]);
    setExistingImages([]);
    setPdfFile(null);
    setExistingPdf("");
    setShowDialog(true);
  };

  // 打开编辑对话框
  const handleEdit = (product: HardwareProduct) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      product_model: product.product_model,
      category: product.category,
      cpu_brand: product.cpu_brand,
      cpu_model: product.cpu_model,
      gpu_brand: product.gpu_brand,
      gpu_model: product.gpu_model,
      memory_size: product.memory_size,
      storage_size: product.storage_size,
      port_count: product.port_count,
      port_speed: product.port_speed,
      network_layer: product.network_layer,
      print_type: product.print_type,
      print_speed: product.print_speed,
      print_color: product.print_color,
      screen_size: product.screen_size,
      resolution: product.resolution,
      refresh_rate: product.refresh_rate,
      panel_type: product.panel_type,
      price: product.price,
      stock: product.stock,
      brief_description: product.brief_description,
      full_description: product.full_description,
      status: product.status,
      is_hot: product.is_hot,
      is_new: product.is_new,
      is_recommended: product.is_recommended,
    });
    setImageFiles([]);
    setImagePreviewUrls([]);
    setExistingImages(product.images || []);
    setPdfFile(null);
    setExistingPdf(product.detail_pdf || "");
    setShowDialog(true);
  };

  // 删除产品
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除此产品吗？")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/hardware/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        toast.success("删除成功");
        fetchProducts();
      } else {
        toast.error(data.message || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  // 处理图片选择
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + imageFiles.length + files.length;

    if (totalImages > 5) {
      toast.error("最多只能上传5张图片");
      return;
    }

    setImageFiles([...imageFiles, ...files]);

    // 生成预览
    const newPreviewUrls: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewUrls.push(reader.result as string);
        if (newPreviewUrls.length === files.length) {
          setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 移除新上传的图片
  const removeNewImage = (index: number) => {
    const newImageFiles = [...imageFiles];
    const newPreviewUrls = [...imagePreviewUrls];
    newImageFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    setImageFiles(newImageFiles);
    setImagePreviewUrls(newPreviewUrls);
  };

  // 移除已存在的图片
  const removeExistingImage = (index: number) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  // 处理PDF选择
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("PDF文件大小不能超过10MB");
        return;
      }
      setPdfFile(file);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.product_name || !formData.product_model || !formData.category) {
      toast.error("请填写产品名称、型号和品类");
      return;
    }

    if (formData.price <= 0) {
      toast.error("请填写正确的价格");
      return;
    }

    if (formData.stock < 0) {
      toast.error("请填写正确的库存");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // 上传图片
      let uploadedImageUrls: string[] = [...existingImages];
      if (imageFiles.length > 0) {
        const imageFormData = new FormData();
        imageFiles.forEach((file) => {
          imageFormData.append("images", file);
        });

        const imageResponse = await fetch("/api/hardware/upload-images", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: imageFormData,
        });
        const imageData = await imageResponse.json();

        if (imageData.success) {
          uploadedImageUrls = [...uploadedImageUrls, ...imageData.data.urls];
        } else {
          toast.error(imageData.message || "图片上传失败");
          return;
        }
      }

      // 上传PDF
      let uploadedPdfUrl = existingPdf;
      if (pdfFile) {
        const pdfFormData = new FormData();
        pdfFormData.append("pdf", pdfFile);

        const pdfResponse = await fetch("/api/hardware/upload-pdf", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: pdfFormData,
        });
        const pdfData = await pdfResponse.json();

        if (pdfData.success) {
          uploadedPdfUrl = pdfData.data.url;
        } else {
          toast.error(pdfData.message || "PDF上传失败");
          return;
        }
      }

      // 提交产品数据
      const productData = {
        ...formData,
        images: uploadedImageUrls,
        detail_pdf: uploadedPdfUrl,
      };

      const url = editingProduct
        ? `/api/hardware/products/${editingProduct.id}`
        : "/api/hardware/products";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(editingProduct ? "更新成功" : "创建成功");
        setShowDialog(false);
        fetchProducts();
      } else {
        toast.error(data.message || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  // 判断是否显示计算设备字段
  const showComputeFields =
    formData.category === "laptop" ||
    formData.category === "desktop" ||
    formData.category === "server";

  // 判断是否显示网络设备字段
  const showNetworkFields =
    formData.category === "switch" ||
    formData.category === "router" ||
    formData.category === "firewall";

  // 判断是否显示打印机字段
  const showPrinterFields = formData.category === "printer";

  // 判断是否显示显示器字段
  const showMonitorFields = formData.category === "monitor";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">硬件产品管理</CardTitle>
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建产品
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">加载中...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">产品名称</TableHead>
                    <TableHead className="text-gray-300">型号</TableHead>
                    <TableHead className="text-gray-300">品类</TableHead>
                    <TableHead className="text-gray-300">价格</TableHead>
                    <TableHead className="text-gray-300">库存</TableHead>
                    <TableHead className="text-gray-300">状态</TableHead>
                    <TableHead className="text-gray-300">标签</TableHead>
                    <TableHead className="text-gray-300">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-white">
                        {product.product_name}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {product.product_model}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {product.category}
                      </TableCell>
                      <TableCell className="text-orange-500">
                        ¥{product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        {product.status === "active" ? (
                          <Badge className="bg-green-500">上架</Badge>
                        ) : (
                          <Badge variant="secondary">下架</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!!product.is_hot && (
                            <Badge variant="destructive" className="text-xs">
                              热门
                            </Badge>
                          )}
                          {!!product.is_new && (
                            <Badge className="text-xs bg-green-500">
                              新品
                            </Badge>
                          )}
                          {!!product.is_recommended && (
                            <Badge className="text-xs bg-orange-500">
                              推荐
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 新建/编辑对话框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "编辑产品" : "新建产品"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* 基本信息 */}
            <div className="col-span-2">
              <h3 className="text-lg font-bold mb-4">基本信息</h3>
            </div>

            <div>
              <Label>产品名称 *</Label>
              <Input
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                placeholder="请输入产品名称"
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label>产品型号 *</Label>
              <Input
                value={formData.product_model}
                onChange={(e) =>
                  setFormData({ ...formData, product_model: e.target.value })
                }
                placeholder="请输入产品型号"
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label>硬件品类 *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="laptop">笔记本</SelectItem>
                  <SelectItem value="desktop">台式机</SelectItem>
                  <SelectItem value="server">服务器</SelectItem>
                  <SelectItem value="printer">打印机</SelectItem>
                  <SelectItem value="monitor">显示器</SelectItem>
                  <SelectItem value="switch">交换机</SelectItem>
                  <SelectItem value="router">路由器</SelectItem>
                  <SelectItem value="firewall">防火墙</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>价格 (元) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) })
                }
                placeholder="请输入价格"
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label>库存 *</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) })
                }
                placeholder="请输入库存"
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label>状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="active">上架</SelectItem>
                  <SelectItem value="inactive">下架</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 计算设备字段 */}
            {showComputeFields && (
              <>
                <div className="col-span-2">
                  <h3 className="text-lg font-bold mb-4 mt-4">计算设备规格</h3>
                </div>

                <div>
                  <Label>处理器品牌</Label>
                  <Input
                    value={formData.cpu_brand || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, cpu_brand: e.target.value })
                    }
                    placeholder="如: 鲲鹏、飞腾、Intel"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>处理器型号</Label>
                  <Input
                    value={formData.cpu_model || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, cpu_model: e.target.value })
                    }
                    placeholder="如: 920、2000+"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>GPU品牌</Label>
                  <Input
                    value={formData.gpu_brand || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, gpu_brand: e.target.value })
                    }
                    placeholder="如: 昇腾、Nvidia"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>GPU型号</Label>
                  <Input
                    value={formData.gpu_model || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, gpu_model: e.target.value })
                    }
                    placeholder="如: 910、RTX 4090"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>内存容量</Label>
                  <Input
                    value={formData.memory_size || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, memory_size: e.target.value })
                    }
                    placeholder="如: 16G、32G"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>硬盘容量</Label>
                  <Input
                    value={formData.storage_size || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, storage_size: e.target.value })
                    }
                    placeholder="如: 512G、1T"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </>
            )}

            {/* 网络设备字段 */}
            {showNetworkFields && (
              <>
                <div className="col-span-2">
                  <h3 className="text-lg font-bold mb-4 mt-4">网络设备规格</h3>
                </div>

                <div>
                  <Label>端口数量</Label>
                  <Input
                    type="number"
                    value={formData.port_count || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        port_count: parseInt(e.target.value),
                      })
                    }
                    placeholder="如: 24、48"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>端口速率</Label>
                  <Input
                    value={formData.port_speed || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, port_speed: e.target.value })
                    }
                    placeholder="如: 1G、10G"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>网络层级</Label>
                  <Input
                    value={formData.network_layer || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, network_layer: e.target.value })
                    }
                    placeholder="如: 二层、三层"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </>
            )}

            {/* 打印机字段 */}
            {showPrinterFields && (
              <>
                <div className="col-span-2">
                  <h3 className="text-lg font-bold mb-4 mt-4">打印机规格</h3>
                </div>

                <div>
                  <Label>打印类型</Label>
                  <Input
                    value={formData.print_type || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, print_type: e.target.value })
                    }
                    placeholder="如: 激光、喷墨"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>打印速度</Label>
                  <Input
                    value={formData.print_speed || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, print_speed: e.target.value })
                    }
                    placeholder="如: 30页/分钟"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>彩色打印</Label>
                  <Select
                    value={formData.print_color ? "true" : "false"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, print_color: value === "true" })
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="true">支持</SelectItem>
                      <SelectItem value="false">不支持</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* 显示器字段 */}
            {showMonitorFields && (
              <>
                <div className="col-span-2">
                  <h3 className="text-lg font-bold mb-4 mt-4">显示器规格</h3>
                </div>

                <div>
                  <Label>屏幕尺寸</Label>
                  <Input
                    value={formData.screen_size || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, screen_size: e.target.value })
                    }
                    placeholder="如: 27英寸"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>分辨率</Label>
                  <Input
                    value={formData.resolution || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, resolution: e.target.value })
                    }
                    placeholder="如: 1920x1080"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>刷新率</Label>
                  <Input
                    value={formData.refresh_rate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, refresh_rate: e.target.value })
                    }
                    placeholder="如: 144Hz"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label>面板类型</Label>
                  <Input
                    value={formData.panel_type || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, panel_type: e.target.value })
                    }
                    placeholder="如: IPS、VA"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </>
            )}

            {/* 描述信息 */}
            <div className="col-span-2">
              <h3 className="text-lg font-bold mb-4 mt-4">描述信息</h3>
            </div>

            <div className="col-span-2">
              <Label>简要描述</Label>
              <Textarea
                value={formData.brief_description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, brief_description: e.target.value })
                }
                placeholder="请输入产品简要描述（显示在列表页）"
                className="bg-gray-700 border-gray-600"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <Label>详细描述</Label>
              <Textarea
                value={formData.full_description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, full_description: e.target.value })
                }
                placeholder="请输入产品详细描述（显示在详情页）"
                className="bg-gray-700 border-gray-600"
                rows={5}
              />
            </div>

            {/* 标签 */}
            <div className="col-span-2">
              <h3 className="text-lg font-bold mb-4 mt-4">产品标签</h3>
            </div>

            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_hot}
                  onChange={(e) =>
                    setFormData({ ...formData, is_hot: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span>热门</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_new}
                  onChange={(e) =>
                    setFormData({ ...formData, is_new: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span>新品</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_recommended}
                  onChange={(e) =>
                    setFormData({ ...formData, is_recommended: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span>推荐</span>
              </label>
            </div>

            {/* 图片上传 */}
            <div className="col-span-2">
              <h3 className="text-lg font-bold mb-4 mt-4">产品图片 (最多5张)</h3>
            </div>

            <div className="col-span-2">
              {/* 已存在的图片 */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <Label className="mb-2 block">已上传的图片</Label>
                  <div className="flex gap-2 flex-wrap">
                    {existingImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`已上传 ${index + 1}`}
                          className="w-24 h-24 object-cover rounded border border-gray-600"
                        />
                        <button
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 新上传的图片预览 */}
              {imagePreviewUrls.length > 0 && (
                <div className="mb-4">
                  <Label className="mb-2 block">新上传的图片</Label>
                  <div className="flex gap-2 flex-wrap">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`预览 ${index + 1}`}
                          className="w-24 h-24 object-cover rounded border border-gray-600"
                        />
                        <button
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 上传按钮 */}
              {existingImages.length + imageFiles.length < 5 && (
                <div>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-400">点击上传图片</p>
                      <p className="text-xs text-gray-500 mt-1">
                        支持 JPG、PNG 格式，单张不超过5MB
                      </p>
                    </div>
                  </Label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* PDF上传 */}
            <div className="col-span-2">
              <h3 className="text-lg font-bold mb-4 mt-4">产品规格说明书 (PDF)</h3>
            </div>

            <div className="col-span-2">
              {existingPdf && !pdfFile && (
                <div className="mb-4 flex items-center justify-between bg-gray-700 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">已上传PDF文件</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(existingPdf, "_blank")}
                    >
                      查看
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setExistingPdf("")}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              )}

              {pdfFile && (
                <div className="mb-4 flex items-center justify-between bg-gray-700 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">{pdfFile.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setPdfFile(null)}
                  >
                    删除
                  </Button>
                </div>
              )}

              {!existingPdf && !pdfFile && (
                <div>
                  <Label htmlFor="pdf-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-400">点击上传PDF</p>
                      <p className="text-xs text-gray-500 mt-1">
                        支持 PDF 格式，不超过10MB
                      </p>
                    </div>
                  </Label>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {editingProduct ? "更新" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
