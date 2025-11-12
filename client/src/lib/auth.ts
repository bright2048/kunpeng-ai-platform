// 前端权限检查工具

export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  isAdmin: boolean;
}

/**
 * 获取当前登录用户
 */
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse user data:', e);
    return null;
  }
}

/**
 * 获取认证Token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * 设置用户信息和Token
 */
export function setAuth(user: User, token: string): void {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
}

/**
 * 清除认证信息
 */
export function clearAuth(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

/**
 * 检查用户是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken() && !!getCurrentUser();
}

/**
 * 检查用户是否是管理员
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === 'admin' || user.role === 'super_admin';
}

/**
 * 检查用户是否是超级管理员
 */
export function isSuperAdmin(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === 'super_admin';
}

/**
 * 检查用户是否有指定角色
 */
export function hasRole(role: 'user' | 'admin' | 'super_admin'): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === role;
}

/**
 * 检查用户是否有任一指定角色
 */
export function hasAnyRole(roles: Array<'user' | 'admin' | 'super_admin'>): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * 创建带认证头的fetch请求配置
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) return {};

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * 带认证的fetch请求封装
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 如果返回401，说明token过期或无效，清除认证信息
  if (response.status === 401) {
    clearAuth();
    // 可以在这里触发重新登录
    window.location.href = '/login';
  }

  return response;
}

/**
 * 权限错误处理
 */
export function handleAuthError(error: any): void {
  if (error.status === 401) {
    clearAuth();
    window.location.href = '/login';
  } else if (error.status === 403) {
    // 权限不足
    window.location.href = '/';
  }
}
