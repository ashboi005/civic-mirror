'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { register, login } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';
import type { UserRegisterData } from '@/lib/auth';

export default function RegisterPage() {
  const [registerData, setRegisterData] = useState<UserRegisterData>({
    email: '',
    username: '',
    password: '',
    is_active: true,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await register(registerData);
      // After registration, log in the user automatically
      await login(registerData.username, registerData.password);
      await refreshUser(); // Update auth context
      router.push('/dashboard'); // Redirect to dashboard after successful registration and login
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-muted-foreground">Join Civic Mirror and start making a difference</p>
        </div>
        
        {error && (
          <div className="mb-4 rounded border border-destructive bg-destructive/10 p-3 text-destructive">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username"
              value={registerData.username}
              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
              placeholder="Choose a username"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password"
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              placeholder="Create a password"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input 
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}