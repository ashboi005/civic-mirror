'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { login, register, logout, getCurrentUser, isAuthenticated } from '@/lib/auth';
import type { User, UserRegisterData } from '@/lib/auth';

export default function AuthExample() {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState<UserRegisterData>({
    email: '',
    username: '',
    password: '',
  });
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<boolean>(isAuthenticated());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(loginData.username, loginData.password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAuthStatus(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const user = await register(registerData);
      setUser(user);
      // After registration, you need to login separately
      await login(registerData.username, registerData.password);
      setAuthStatus(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setAuthStatus(false);
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err: any) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Example</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!authStatus ? (
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="login-username">Username</Label>
                  <Input 
                    id="login-username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Loading...' : 'Login'}
                </Button>
              </div>
            </form>
          </Card>
          
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Register</h2>
            <form onSubmit={handleRegister}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-username">Username</Label>
                  <Input 
                    id="register-username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input 
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Loading...' : 'Register'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">User Profile</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              <p><strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}</p>
              <p><strong>Admin:</strong> {user.is_superuser ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p>No user data available.</p>
          )}
          <div className="flex space-x-4 mt-4">
            <Button onClick={fetchUserData} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh User Data'}
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}