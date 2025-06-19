
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap, TrendingUp, UserX } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { 
    useOrganizationDetails, 
    useOrganizationTeachers, 
    useOrganizationAnalytics,
    useDeactivateUser 
  } = useAdminData();

  const organizationId = profile?.organization_id;
  
  const { data: orgDetails, isLoading: detailsLoading } = useOrganizationDetails(organizationId || '');
  const { data: teachers, isLoading: teachersLoading } = useOrganizationTeachers(organizationId || '');
  const { data: analytics, isLoading: analyticsLoading } = useOrganizationAnalytics(organizationId || '');
  
  const deactivateUserMutation = useDeactivateUser();

  const handleDeactivateUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to deactivate ${userName}? This action will prevent them from accessing the system.`)) {
      try {
        await deactivateUserMutation.mutateAsync(userId);
        toast.success(`${userName} has been deactivated`);
      } catch (error) {
        toast.error('Failed to deactivate user');
      }
    }
  };

  if (detailsLoading || !organizationId) {
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{orgDetails?.name} Dashboard</h1>
          <p className="text-muted-foreground">Organization Administration Panel</p>
        </div>
        <Badge variant="default" className="text-sm">
          {orgDetails?.package_type} Plan
        </Badge>
      </div>

      {/* Organization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_teachers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_students || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.daily_usage || 0}</div>
            <p className="text-xs text-muted-foreground">creations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.monthly_usage || 0}</div>
            <p className="text-xs text-muted-foreground">creations</p>
          </CardContent>
        </Card>
      </div>

      {/* Organization Details & Management */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Basic details about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Organization Name</label>
                    <p className="text-sm text-muted-foreground">{orgDetails?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subdomain</label>
                    <p className="text-sm text-muted-foreground">{orgDetails?.subdomain}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant={orgDetails?.status === 'approved' ? 'default' : 'secondary'}>
                      {orgDetails?.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Daily Limit per Student</label>
                    <p className="text-sm text-muted-foreground">{orgDetails?.daily_limit_per_student} creations</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Monthly Limit per Student</label>
                    <p className="text-sm text-muted-foreground">{orgDetails?.monthly_limit_per_student} creations</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Package Type</label>
                    <p className="text-sm text-muted-foreground capitalize">{orgDetails?.package_type}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teachers Management</CardTitle>
              <CardDescription>Manage teachers in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              {teachersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {teachers?.map((teacher: any) => (
                    <div key={teacher.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{teacher.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {teacher.class_count} classes • Joined {new Date(teacher.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                            {teacher.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {teacher.is_active && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeactivateUser(teacher.user_id, teacher.full_name)}
                              disabled={deactivateUserMutation.isPending}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!teachers || teachers.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No teachers found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Configuration and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Usage Limits</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    These limits are set by your package plan and can only be modified by Super Admins.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Daily Limit:</span> {orgDetails?.daily_limit_per_student} per student
                    </div>
                    <div>
                      <span className="font-medium">Monthly Limit:</span> {orgDetails?.monthly_limit_per_student} per student
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    {orgDetails?.admin_email && (
                      <div>
                        <span className="font-medium">Admin Email:</span> {orgDetails.admin_email}
                      </div>
                    )}
                    {orgDetails?.phone && (
                      <div>
                        <span className="font-medium">Phone:</span> {orgDetails.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
