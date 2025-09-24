'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [schoolData, setSchoolData] = useState({
    name: 'GPS School',
    email: 'admin@gmail.com',
    phone: '6394322640',
    address: 'school@gmail.com, jhansi',
    city: 'Jhansi',
    state: 'Uttar Pradesh',
    pincode: '284001',
    website: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // TODO: Implement school profile update API call
    console.log('Updating school profile:', schoolData);
    setIsEditing(false);
  };

  return (
    <DashboardLayout 
      title="School Settings" 
      schoolName={schoolData.name}
      userRole={user?.role}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* School Profile */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>School Profile</CardTitle>
                <CardDescription>
                  Manage your school information
                </CardDescription>
              </div>
              <Button 
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name
                </label>
                <Input
                  value={schoolData.name}
                  onChange={(e) => setSchoolData({...schoolData, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={schoolData.email}
                  onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  value={schoolData.phone}
                  onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <Input
                  value={schoolData.website}
                  onChange={(e) => setSchoolData({...schoolData, website: e.target.value})}
                  disabled={!isEditing}
                  placeholder="https://www.yourschool.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  value={schoolData.city}
                  onChange={(e) => setSchoolData({...schoolData, city: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <Input
                  value={schoolData.state}
                  onChange={(e) => setSchoolData({...schoolData, state: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <Input
                  value={schoolData.pincode}
                  onChange={(e) => setSchoolData({...schoolData, pincode: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Input
                  value={schoolData.address}
                  onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            {isEditing && (
              <div className="flex space-x-4 pt-4">
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system-wide settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-gray-500">Send email notifications for important events</div>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">SMS Notifications</div>
                <div className="text-sm text-gray-500">Send SMS notifications to parents</div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Academic Year</div>
                <div className="text-sm text-gray-500">Set the current academic year</div>
              </div>
              <Button variant="outline" size="sm">
                2024-2025
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage security and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Change Password</div>
                <div className="text-sm text-gray-500">Update your admin password</div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500">Add an extra layer of security</div>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Session Timeout</div>
                <div className="text-sm text-gray-500">Set automatic logout time</div>
              </div>
              <Button variant="outline" size="sm">
                30 minutes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
