import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { appIntegrations, AppIntegration } from '@/core/config/appIntegrations';
import { ExternalLink, Settings, Edit } from 'lucide-react';

interface AppSelectorProps {
  contentType: string;
  onSelect: (integration: AppIntegration) => void;
  onCancel: () => void;
}

const AppSelector: React.FC<AppSelectorProps> = ({ contentType, onSelect, onCancel }) => {
  const integrations = appIntegrations[contentType] || [];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'edit':
        return <Edit className="h-5 w-5" />;
      case 'wordpress':
        return <Settings className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'external':
        return 'bg-blue-100 text-blue-800';
      case 'internal':
        return 'bg-green-100 text-green-800';
      case 'api':
        return 'bg-purple-100 text-purple-800';
      case 'iframe':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Choose Your App</span>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 mb-4">
            Select which app you'd like to use for creating your {contentType.replace('-', ' ')} content:
          </p>
          
          <div className="grid gap-4">
            {integrations.map((integration, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                onClick={() => onSelect(integration)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        {getIcon(integration.icon)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                        <p className="text-gray-600 text-sm">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeColor(integration.type)}>
                        {integration.type}
                      </Badge>
                      {integration.requiresAuth && (
                        <Badge variant="outline">Auth Required</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSelector;
