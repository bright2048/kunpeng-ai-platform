import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  User,
  Shield,
  Building2,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  Upload,
  AlertCircle,
} from "lucide-react";

export default function AccountCenter() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // 实名认证状态
  const [verificationStatus, setVerificationStatus] = useState({
    realName: false,
    enterprise: false,
  });

  // 实名认证表单
  const [realNameForm, setRealNameForm] = useState({
    name: "",
    idCard: "",
    idCardFront: null as File | null,
    idCardBack: null as File | null,
  });

  // 企业认证表单
  const [enterpriseForm, setEnterpriseForm] = useState({
    companyName: "",
    creditCode: "",
    businessLicense: null as File | null,
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("请先登录");
      setLocation("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);

      // 模拟获取认证状态
      setVerificationStatus({
        realName: userData.verified || false,
        enterprise: userData.enterpriseVerified || false,
      });
    } catch (e) {
      console.error("Failed to parse user data:", e);
      setLocation("/login");
    }

    // 检查URL参数，如果有tab参数则切换到对应标签
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "verification") {
      setActiveTab("verification");
    }
  }, []);

  // 处理文件上传
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    formType: "realName" | "enterprise"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error("文件大小不能超过5MB");
      return;
    }

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      toast.error("只能上传图片文件");
      return;
    }

    if (formType === "realName") {
      setRealNameForm({ ...realNameForm, [field]: file });
    } else {
      setEnterpriseForm({ ...enterpriseForm, [field]: file });
    }

    toast.success("文件已选择");
  };

  // 提交实名认证
  const handleRealNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!realNameForm.name || !realNameForm.idCard) {
      toast.error("请填写完整信息");
      return;
    }

    if (!realNameForm.idCardFront || !realNameForm.idCardBack) {
      toast.error("请上传身份证正反面照片");
      return;
    }

    // 模拟提交
    toast.success("实名认证申请已提交，预计1-3个工作日完成审核");
    
    // 更新用户状态
    const updatedUser = { ...user, verified: true };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setVerificationStatus({ ...verificationStatus, realName: true });
  };

  // 提交企业认证
  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!enterpriseForm.companyName || !enterpriseForm.creditCode) {
      toast.error("请填写完整信息");
      return;
    }

    if (!enterpriseForm.businessLicense) {
      toast.error("请上传营业执照");
      return;
    }

    // 模拟提交
    toast.success("企业认证申请已提交，预计3-5个工作日完成审核");
    
    // 更新用户状态
    const updatedUser = { ...user, enterpriseVerified: true };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setVerificationStatus({ ...verificationStatus, enterprise: true });
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-8">
            <User className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold">账号中心</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-800 border border-gray-700">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="verification">实名认证</TabsTrigger>
              <TabsTrigger value="enterprise">企业信息</TabsTrigger>
              <TabsTrigger value="address">联系地址</TabsTrigger>
            </TabsList>

            {/* 基本信息 */}
            <TabsContent value="basic">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                  <CardDescription>管理您的账号基本信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>用户名</Label>
                      <Input
                        value={user.username || ""}
                        disabled
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label>邮箱</Label>
                      <Input
                        value={user.email || ""}
                        disabled
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label>姓名</Label>
                      <Input
                        value={user.name || ""}
                        placeholder="请输入真实姓名"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label>手机号</Label>
                      <Input
                        value={user.phone || ""}
                        placeholder="请输入手机号"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    保存修改
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 实名认证 */}
            <TabsContent value="verification">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 个人实名认证 */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-400" />
                        <CardTitle>个人实名认证</CardTitle>
                      </div>
                      {verificationStatus.realName ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          已认证
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          未认证
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      完成实名认证后可租用算力资源
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {verificationStatus.realName ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-green-400">
                          您已完成个人实名认证
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          认证时间：2024-01-15 10:30:00
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleRealNameSubmit} className="space-y-4">
                        <div>
                          <Label>真实姓名 *</Label>
                          <Input
                            value={realNameForm.name}
                            onChange={(e) =>
                              setRealNameForm({ ...realNameForm, name: e.target.value })
                            }
                            placeholder="请输入真实姓名"
                            required
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>

                        <div>
                          <Label>身份证号 *</Label>
                          <Input
                            value={realNameForm.idCard}
                            onChange={(e) =>
                              setRealNameForm({ ...realNameForm, idCard: e.target.value })
                            }
                            placeholder="请输入身份证号"
                            required
                            maxLength={18}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>

                        <div>
                          <Label>身份证正面 *</Label>
                          <div className="mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-400">
                                  {realNameForm.idCardFront
                                    ? realNameForm.idCardFront.name
                                    : "点击上传身份证正面"}
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileChange(e, "idCardFront", "realName")
                                }
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <Label>身份证反面 *</Label>
                          <div className="mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-400">
                                  {realNameForm.idCardBack
                                    ? realNameForm.idCardBack.name
                                    : "点击上传身份证反面"}
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileChange(e, "idCardBack", "realName")
                                }
                              />
                            </label>
                          </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                          <div className="flex gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-300">
                              <p className="font-semibold mb-1">温馨提示：</p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>请确保照片清晰，四角完整</li>
                                <li>文件格式支持 JPG、PNG，大小不超过5MB</li>
                                <li>审核时间为1-3个工作日</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          提交认证
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {/* 企业认证 */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-400" />
                        <CardTitle>企业认证</CardTitle>
                      </div>
                      {verificationStatus.enterprise ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          已认证
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          未认证
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      企业用户可享受更多权益和优惠
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {verificationStatus.enterprise ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-green-400">
                          您已完成企业认证
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          认证时间：2024-01-20 14:20:00
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
                        <div>
                          <Label>企业名称 *</Label>
                          <Input
                            value={enterpriseForm.companyName}
                            onChange={(e) =>
                              setEnterpriseForm({
                                ...enterpriseForm,
                                companyName: e.target.value,
                              })
                            }
                            placeholder="请输入企业全称"
                            required
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>

                        <div>
                          <Label>统一社会信用代码 *</Label>
                          <Input
                            value={enterpriseForm.creditCode}
                            onChange={(e) =>
                              setEnterpriseForm({
                                ...enterpriseForm,
                                creditCode: e.target.value,
                              })
                            }
                            placeholder="请输入18位统一社会信用代码"
                            required
                            maxLength={18}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>

                        <div>
                          <Label>营业执照 *</Label>
                          <div className="mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-400">
                                  {enterpriseForm.businessLicense
                                    ? enterpriseForm.businessLicense.name
                                    : "点击上传营业执照"}
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileChange(e, "businessLicense", "enterprise")
                                }
                              />
                            </label>
                          </div>
                        </div>

                        <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4">
                          <div className="flex gap-2">
                            <AlertCircle className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-purple-300">
                              <p className="font-semibold mb-1">温馨提示：</p>
                              <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>请上传清晰的营业执照扫描件或照片</li>
                                <li>文件格式支持 JPG、PNG，大小不超过5MB</li>
                                <li>审核时间为3-5个工作日</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          提交认证
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 企业信息 */}
            <TabsContent value="enterprise">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>企业信息</CardTitle>
                  <CardDescription>管理您的企业相关信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>企业名称</Label>
                      <Input
                        placeholder="请输入企业名称"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label>所属行业</Label>
                      <Input
                        placeholder="请输入所属行业"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label>企业规模</Label>
                      <Input
                        placeholder="请输入企业规模"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label>联系电话</Label>
                      <Input
                        placeholder="请输入联系电话"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    保存修改
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 联系地址 */}
            <TabsContent value="address">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>联系地址</CardTitle>
                  <CardDescription>管理您的联系地址信息</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>省份</Label>
                      <Input
                        placeholder="请选择省份"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label>城市</Label>
                      <Input
                        placeholder="请选择城市"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label>区县</Label>
                      <Input
                        placeholder="请选择区县"
                        className="bg-gray-700 border-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>详细地址</Label>
                    <Input
                      placeholder="请输入详细地址"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    保存修改
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
}
