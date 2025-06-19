
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';
import { Users, BookOpen, Palette, Calendar } from 'lucide-react';

const TeacherDashboard = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  const { useTeacherClasses, useTeacherStudents, useStudentCreations } = useTeacherDashboard();
  
  const { data: classes, isLoading: loadingClasses } = useTeacherClasses();
  const { data: students, isLoading: loadingStudents } = useTeacherStudents(selectedClassId || undefined);
  const { data: creations, isLoading: loadingCreations } = useStudentCreations(
    selectedStudentId || undefined, 
    selectedClassId || undefined
  );

  if (loadingClasses) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-4xl">👩‍🏫</div>
          <div className="text-xl font-semibold">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Teacher Dashboard 👩‍🏫
          </h1>
          <p className="text-gray-600 text-lg">Monitor your students' AI learning progress</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="creations">Creations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classes?.length || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {classes?.reduce((sum, cls) => sum + cls.student_count, 0) || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Creations</CardTitle>
                  <Palette className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{creations?.length || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {students?.filter(s => s.daily_usage > 0).length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes?.map((cls) => (
                <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {cls.name}
                      <Badge variant="secondary">{cls.grade_level}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Students:</span>
                      <span className="font-semibold">{cls.student_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Daily Limit:</span>
                      <span className="font-semibold">{cls.daily_limit_per_student}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Limit:</span>
                      <span className="font-semibold">{cls.monthly_limit_per_student}</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => setSelectedClassId(cls.id)}
                    >
                      View Students
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Classes</option>
                {classes?.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingStudents ? (
                <div className="col-span-full text-center py-8">Loading students...</div>
              ) : (
                students?.map((student) => (
                  <Card key={student.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="text-2xl">{student.avatar_url}</div>
                        {student.username}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Class:</span>
                        <span className="font-semibold">{student.class_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Daily Usage:</span>
                        <span className="font-semibold">
                          {student.daily_usage}/{student.daily_limit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Monthly Usage:</span>
                        <span className="font-semibold">
                          {student.monthly_usage}/{student.monthly_limit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Creations:</span>
                        <span className="font-semibold">{student.total_creations}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={() => setSelectedStudentId(student.id)}
                      >
                        View Creations
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="creations" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Classes</option>
                {classes?.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">All Students</option>
                {students?.map((student) => (
                  <option key={student.id} value={student.id}>{student.username}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingCreations ? (
                <div className="col-span-full text-center py-8">Loading creations...</div>
              ) : (
                creations?.map((creation) => (
                  <Card key={creation.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{creation.creation_type}</span>
                        <Badge variant="outline">
                          {creation.creation_type === 'music' ? '🎵' : '🎨'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Student:</span>
                        <span className="font-semibold">{creation.username}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Class:</span>
                        <span className="font-semibold">{creation.class_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span className="font-semibold">
                          {new Date(creation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {creation.creation_type === 'music' && creation.creation_data?.title && (
                        <div className="text-sm">
                          <span className="font-semibold">Title:</span> {creation.creation_data.title}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;
