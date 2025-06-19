
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminDashboard from './AdminDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';

const AdminRouter = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if user has admin permissions
  if (!profile || !['admin', 'super_admin'].includes(profile.user_type)) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <ShieldX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Route based on admin level
  if (profile.user_type === 'super_admin') {
    return <SuperAdminDashboard />;
  }

  if (profile.user_type === 'admin') {
    return <AdminDashboard />;
  }

  return null;
};

export default AdminRouter;
