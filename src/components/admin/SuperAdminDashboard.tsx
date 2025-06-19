
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, GraduationCap, TrendingUp, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import { toast } from 'sonner';

const SuperAdminDashboard = () => {
  const { useAllOrganizations, useUpdateOrganizationStatus } = useAdminData();
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  
  const { data: organizations, isLoading } = useAllOrganizations();
  const updateStatusMutation = useUpdateOrganizationStatus();

  const handleStatusUpdate = async (orgId: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ orgId, status });
      toast.success(`Organization status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update organization status');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
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

  const totalStats = organizations?.reduce((acc: any, org: any) => ({
    organizations: acc.organizations + 1,
    teachers: acc.teachers + (org.teacher_count || 0),
    students: acc.students + (org.student_count || 0)
  }), { organizations: 0, teachers: 0, students: 0 }) || { organizations: 0, teachers: 0, students: 0 };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all organizations and users</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.organizations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.teachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.students}</div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Management */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>Manage all organizations in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations?.map((org: any) => (
              <div key={org.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{org.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {org.subdomain} • {org.package_type} plan
                    </p>
                    {org.admin_email && (
                      <p className="text-sm text-muted-foreground">
                        Admin: {org.admin_email}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(org.status)}>
                      {org.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{org.teacher_count || 0} teachers</span>
                  <span>{org.student_count || 0} students</span>
                  <span>Daily limit: {org.daily_limit_per_student}</span>
                  <span>Monthly limit: {org.monthly_limit_per_student}</span>
                </div>

                <div className="flex items-center gap-2">
                  {org.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(org.id, 'approved')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(org.id, 'rejected')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedOrg(org.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization Detail Modal would go here */}
      {selectedOrg && (
        <OrganizationDetailModal 
          organizationId={selectedOrg} 
          onClose={() => setSelectedOrg(null)} 
        />
      )}
    </div>
  );
};

// Organization Detail Modal Component
const OrganizationDetailModal = ({ organizationId, onClose }: { organizationId: string; onClose: () => void }) => {
  const { useOrganizationDetails, useOrganizationTeachers, useOrganizationAnalytics } = useAdminData();
  
  const { data: details } = useOrganizationDetails(organizationId);
  const { data: teachers } = useOrganizationTeachers(organizationId);
  const { data: analytics } = useOrganizationAnalytics(organizationId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{details?.name}</h2>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
        
        <div className="p-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Organization Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Subdomain:</strong> {details?.subdomain}</p>
                    <p><strong>Package:</strong> {details?.package_type}</p>
                    <p><strong>Status:</strong> {details?.status}</p>
                    {details?.phone && <p><strong>Phone:</strong> {details.phone}</p>}
                    {details?.admin_email && <p><strong>Admin Email:</strong> {details.admin_email}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Usage Limits</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Daily Limit:</strong> {details?.daily_limit_per_student} per student</p>
                    <p><strong>Monthly Limit:</strong> {details?.monthly_limit_per_student} per student</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="teachers" className="space-y-4">
              {teachers?.map((teacher: any) => (
                <div key={teacher.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{teacher.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      <p className="text-sm text-muted-foreground">{teacher.class_count} classes</p>
                    </div>
                    <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                      {teacher.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics?.total_teachers}</div>
                    <p className="text-sm text-muted-foreground">Teachers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics?.total_students}</div>
                    <p className="text-sm text-muted-foreground">Students</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics?.daily_usage}</div>
                    <p className="text-sm text-muted-foreground">Today's Usage</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{analytics?.monthly_usage}</div>
                    <p className="text-sm text-muted-foreground">Monthly Usage</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
