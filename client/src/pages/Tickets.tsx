/**
 * 工单管理页面
 * 用户可以提交工单、查看工单、回复工单
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
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface Ticket {
  id: number;
  ticket_no: string;
  title: string;
  category: 'technical' | 'billing' | 'service' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  created_at: string;
  updated_at: string;
}

interface TicketDetail extends Ticket {
  replies?: Reply[];
}

interface Reply {
  id: number;
  content: string;
  is_admin: boolean;
  username: string;
  created_at: string;
}

const categoryLabels = {
  technical: '技术问题',
  billing: '账单问题',
  service: '服务咨询',
  other: '其他'
};

const priorityLabels = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急'
};

const statusLabels = {
  open: '待处理',
  in_progress: '处理中',
  resolved: '已解决',
  closed: '已关闭'
};

const statusColors = {
  open: 'bg-yellow-600',
  in_progress: 'bg-blue-600',
  resolved: 'bg-green-600',
  closed: 'bg-gray-600'
};

const priorityColors = {
  low: 'bg-gray-600',
  medium: 'bg-blue-600',
  high: 'bg-orange-600',
  urgent: 'bg-red-600'
};

export default function Tickets() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  // 创建工单对话框
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'other',
    priority: 'medium',
    description: ''
  });

  // 工单详情对话框
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        fetchTickets(userData);
      } catch (e) {
        console.error("Failed to parse user data:", e);
        setLocation("/login");
      }
    } else {
      setLocation("/login");
    }
  }, []);

  const fetchTickets = async (userData: any) => {
    setLoading(true);
    try {
      const token = userData.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error('获取工单失败:', error);
      toast.error('获取工单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.description) {
      toast.error('请填写标题和问题描述');
      return;
    }

    setSubmitting(true);
    try {
      const token = user.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('工单提交成功');
        setCreateDialogOpen(false);
        resetForm();
        fetchTickets(user);
      } else {
        toast.error(data.message || '提交失败');
      }
    } catch (error) {
      console.error('创建工单失败:', error);
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = async (ticketId: number) => {
    try {
      const token = user.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedTicket(data.data);
        setDetailDialogOpen(true);
      }
    } catch (error) {
      console.error('获取工单详情失败:', error);
      toast.error('获取工单详情失败');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }

    if (!selectedTicket) return;

    setSubmitting(true);
    try {
      const token = user.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyContent })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('回复成功');
        setReplyContent('');
        // 重新加载工单详情
        handleViewDetail(selectedTicket.id);
      } else {
        toast.error(data.message || '回复失败');
      }
    } catch (error) {
      console.error('回复工单失败:', error);
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async (ticketId: number) => {
    if (!confirm('确定要关闭这个工单吗？')) return;

    try {
      const token = user.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'closed' })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('工单已关闭');
        setDetailDialogOpen(false);
        fetchTickets(user);
      } else {
        toast.error(data.message || '操作失败');
      }
    } catch (error) {
      console.error('关闭工单失败:', error);
      toast.error('网络错误');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'other',
      priority: 'medium',
      description: ''
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-20 pb-12">
        <div className="container">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">工单管理</h1>
              <p className="text-gray-400">提交问题、获取帮助</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              创建工单
            </Button>
          </div>

          {/* 工单列表 */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-4">还没有工单</p>
              <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
                创建第一个工单
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                  onClick={() => handleViewDetail(ticket.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{ticket.title}</h3>
                          <Badge className={statusColors[ticket.status]}>
                            {statusLabels[ticket.status]}
                          </Badge>
                          <Badge className={priorityColors[ticket.priority]} variant="outline">
                            {priorityLabels[ticket.priority]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>工单号: {ticket.ticket_no}</span>
                          <span>类别: {categoryLabels[ticket.category]}</span>
                          <span>创建时间: {new Date(ticket.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 创建工单对话框 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建工单</DialogTitle>
              <DialogDescription className="text-gray-400">
                请详细描述您遇到的问题
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>标题 *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="简要描述问题"
                  className="bg-gray-900 border-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>类别</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">技术问题</SelectItem>
                      <SelectItem value="billing">账单问题</SelectItem>
                      <SelectItem value="service">服务咨询</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>优先级</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                      <SelectItem value="urgent">紧急</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>问题描述 *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请详细描述您遇到的问题..."
                  className="bg-gray-900 border-gray-700"
                  rows={6}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
                取消
              </Button>
              <Button onClick={handleCreate} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                提交
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 工单详情对话框 */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>{selectedTicket.title}</DialogTitle>
                    <div className="flex gap-2">
                      <Badge className={statusColors[selectedTicket.status]}>
                        {statusLabels[selectedTicket.status]}
                      </Badge>
                      <Badge className={priorityColors[selectedTicket.priority]} variant="outline">
                        {priorityLabels[selectedTicket.priority]}
                      </Badge>
                    </div>
                  </div>
                  <DialogDescription className="text-gray-400">
                    工单号: {selectedTicket.ticket_no} · 
                    类别: {categoryLabels[selectedTicket.category]} · 
                    创建时间: {new Date(selectedTicket.created_at).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* 问题描述 */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">问题描述</h4>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>

                  {/* 回复列表 */}
                  {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">回复记录</h4>
                      <div className="space-y-3">
                        {selectedTicket.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`rounded-lg p-4 ${
                              reply.is_admin ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-900'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{reply.username}</span>
                                {reply.is_admin && (
                                  <Badge className="bg-blue-600 text-xs">管理员</Badge>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(reply.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-300 whitespace-pre-wrap">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 回复输入框 */}
                  {selectedTicket.status !== 'closed' && (
                    <div>
                      <Label className="mb-2 block">添加回复</Label>
                      <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="输入您的回复..."
                        className="bg-gray-900 border-gray-700 mb-3"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleReply}
                          disabled={submitting}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                          发送回复
                        </Button>
                        {selectedTicket.status !== 'closed' && (
                          <Button
                            variant="outline"
                            onClick={() => handleCloseTicket(selectedTicket.id)}
                          >
                            关闭工单
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
}
