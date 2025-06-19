
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const OrganizationManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    package_type: 'basic',
    daily_limit_per_student: 5,
    monthly_limit_per_student: 100
  });
  const { toast } = useToast();

  const handleCreateOrganization = async () => {
    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Organization created successfully!",
        description: `${formData.name} has been added to the system.`,
      });

      // Reset form
      setFormData({
        name: '',
        subdomain: '',
        package_type: 'basic',
        daily_limit_per_student: 5,
        monthly_limit_per_student: 100
      });
    } catch (error: any) {
      toast({
        title: "Error creating organization",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Organization</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Organization Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Acme School District"
          />
        </div>

        <div>
          <Label htmlFor="subdomain">Subdomain</Label>
          <Input
            id="subdomain"
            value={formData.subdomain}
            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
            placeholder="acme-schools"
          />
        </div>

        <div>
          <Label htmlFor="package">Package Type</Label>
          <Select
            value={formData.package_type}
            onValueChange={(value) => setFormData({ ...formData, package_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="daily-limit">Daily Limit per Student</Label>
          <Input
            id="daily-limit"
            type="number"
            value={formData.daily_limit_per_student}
            onChange={(e) => setFormData({ ...formData, daily_limit_per_student: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="monthly-limit">Monthly Limit per Student</Label>
          <Input
            id="monthly-limit"
            type="number"
            value={formData.monthly_limit_per_student}
            onChange={(e) => setFormData({ ...formData, monthly_limit_per_student: parseInt(e.target.value) })}
          />
        </div>

        <Button
          onClick={handleCreateOrganization}
          disabled={isCreating || !formData.name || !formData.subdomain}
          className="w-full"
        >
          {isCreating ? 'Creating...' : 'Create Organization'}
        </Button>
      </div>
    </Card>
  );
};

export default OrganizationManager;
