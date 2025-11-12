import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { isAuthenticated, isAdmin, isSuperAdmin } from '@/lib/auth';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

/**
 * 路由保护组件
 * 用于保护需要认证或特定权限的路由
 */
export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireSuperAdmin = false,
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // 检查是否需要登录
    if (requireAuth && !isAuthenticated()) {
      toast.error('请先登录');
      setLocation('/login');
      return;
    }

    // 检查是否需要超级管理员权限
    if (requireSuperAdmin && !isSuperAdmin()) {
      toast.error('权限不足，需要超级管理员权限');
      setLocation('/');
      return;
    }

    // 检查是否需要管理员权限
    if (requireAdmin && !isAdmin()) {
      toast.error('权限不足，需要管理员权限');
      setLocation('/');
      return;
    }
  }, [requireAuth, requireAdmin, requireSuperAdmin, setLocation]);

  // 如果需要认证但未登录，不渲染内容
  if (requireAuth && !isAuthenticated()) {
    return null;
  }

  // 如果需要超级管理员但权限不足，不渲染内容
  if (requireSuperAdmin && !isSuperAdmin()) {
    return null;
  }

  // 如果需要管理员但权限不足，不渲染内容
  if (requireAdmin && !isAdmin()) {
    return null;
  }

  return <>{children}</>;
}
