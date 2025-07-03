import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Heading1, Heading2, Heading3, Heading4 } from '@/components/typography';
import AppSelector from '@/components/AppSelector';
import { AppIntegration } from '@/config/appIntegrations';
import { 
  Globe, 
  Linkedin, 
  Mail, 
  FileText, 
  Facebook, 
  Image, 
  Twitter, 
  Brain,
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  X
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  status: 'draft' | 'published' | 'in-progress';
  author: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAppSelector, setShowAppSelector] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string>('');

  const tiles = [
    { name: 'Website Blog', icon: Globe, path: '/content/website-blog', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'LinkedIn Post', icon: Linkedin, path: '/content/linkedin-post', gradient: 'from-blue-600 to-blue-800' },
    { name: 'Newsletter', icon: Mail, path: '/content/newsletter', gradient: 'from-green-500 to-emerald-500' },
    { name: 'Technical Article', icon: FileText, path: '/content/technical-article', gradient: 'from-purple-500 to-purple-700' },
    { name: 'Facebook Post', icon: Facebook, path: '/content/facebook-post', gradient: 'from-blue-500 to-indigo-600' },
    { name: 'Carousel', icon: Image, path: '/content/carousel', gradient: 'from-pink-500 to-rose-500' },
    { name: 'Twitter Post', icon: Twitter, path: '/content/twitter-post', gradient: 'from-sky-400 to-sky-600' },
    { name: 'Thought Leadership', icon: Brain, path: '/content/thought-leadership', gradient: 'from-violet-500 to-purple-600' },
  ];

  const contentTypes = ['Website Blog', 'LinkedIn Post', 'Newsletter', 'Technical Article', 'Facebook Post', 'Carousel', 'Twitter Post', 'Thought Leadership'];

  // Simulate fetching data from Supabase
  useEffect(() => {
    const mockData: ContentItem[] = [
      {
        id: '1',
        title: 'How to Build Better React Components',
        type: 'Website Blog',
        createdAt: '2024-01-15',
        status: 'published',
        author: 'John Doe'
      },
      {
        id: '2',
        title: 'The Future of AI in Development',
        type: 'LinkedIn Post',
        createdAt: '2024-01-14',
        status: 'draft',
        author: 'Jane Smith'
      },
      {
        id: '3',
        title: 'Weekly Tech Newsletter #15',
        type: 'Newsletter',
        createdAt: '2024-01-13',
        status: 'published',
        author: 'Mike Johnson'
      },
      {
        id: '4',
        title: 'Understanding Microservices Architecture',
        type: 'Technical Article',
        createdAt: '2024-01-12',
        status: 'in-progress',
        author: 'Sarah Wilson'
      },
      {
        id: '5',
        title: 'Product Launch Announcement',
        type: 'Facebook Post',
        createdAt: '2024-01-11',
        status: 'published',
        author: 'Tom Brown'
      },
      {
        id: '6',
        title: 'Social Media Strategy Guide',
        type: 'Carousel',
        createdAt: '2024-01-10',
        status: 'draft',
        author: 'Lisa Chen'
      },
      {
        id: '7',
        title: 'Quick Tips for Productivity',
        type: 'Twitter Post',
        createdAt: '2024-01-09',
        status: 'published',
        author: 'Alex Rivera'
      },
      {
        id: '8',
        title: 'Leadership in the Digital Age',
        type: 'Thought Leadership',
        createdAt: '2024-01-08',
        status: 'in-progress',
        author: 'David Park'
      }
    ];
    setContent(mockData);
  }, []);

  const filteredAndSortedContent = content
    .filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedTypes.length === 0 || selectedTypes.includes(item.type))
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleTypeFilter = (type: string, checked: boolean) => {
    checked 
      ? setSelectedTypes(prev => [...prev, type])
      : setSelectedTypes(prev => prev.filter(t => t !== type));
  };

  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'bg-green-100 text-green-800'
      : status === 'draft'
      ? 'bg-gray-100 text-gray-800'
      : status === 'in-progress'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-gray-100 text-gray-800';
  };

  const handleSort = (field: 'date' | 'title' | 'type') => {
    sortBy === field
      ? setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
      : (setSortBy(field), setSortOrder('desc'));
  };

  const handleTileClick = (tileName: string, tilePath: string) => {
    // Special handling for website blog, LinkedIn post, and Technical Article - go directly to form
    if (tileName === 'Website Blog') {
      navigate('/content/website-blog');
      return;
    }
    
    if (tileName === 'LinkedIn Post') {
      navigate('/content/linkedin-post');
      return;
    }
    
    if (tileName === 'Technical Article') {
      navigate('/content/technical-article');
      return;
    }
    
    // Convert tile name to content type key
    const contentTypeKey = tileName.toLowerCase().replace(/\s+/g, '-');
    setSelectedContentType(contentTypeKey);
    setShowAppSelector(true);
  };

  const handleAppSelection = (integration: AppIntegration) => {
    setShowAppSelector(false);
    
    if (integration.type === 'external' && integration.url) {
      // Open external app in new tab
      window.open(integration.url, '_blank');
    } else if (integration.type === 'internal') {
      // Navigate to internal form
      const contentType = selectedContentType;
      navigate(`/content/${contentType}`);
    }
  };

  const handleAppSelectorCancel = () => {
    setShowAppSelector(false);
    setSelectedContentType('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Heading1 className="text-4xl font-bold text-gray-900 mb-4">
          Content Creation Hub
        </Heading1>
        <p className="text-xl text-gray-600">Choose a content type to get started</p>
      </div>

      {/* Content Type Tiles - Smaller */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {tiles.map((tile) => {
          const IconComponent = tile.icon;
          return (
            <Card
              key={tile.name}
              className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg group p-3"
              onClick={() => handleTileClick(tile.name, tile.path)}
            >
              <div className="text-center">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-r ${tile.gradient} flex items-center justify-center transform transition-transform group-hover:rotate-6`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <Heading3 className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                  {tile.name}
                </Heading3>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Content Repository */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <Heading2 className="text-3xl font-bold text-gray-900">
            Content Repository
          </Heading2>
          <Button 
            onClick={() => navigate('/repository')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Content
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          {/* Search and Sort Controls */}
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {selectedTypes.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedTypes.length}
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Calendar className="h-4 w-4" />
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  Title
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  Type
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Collapsible Filter Section */}
          {isFilterOpen && (
            <Card className="p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <Heading4 className="font-semibold text-gray-900">Filter by Content Type</Heading4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFilterOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {contentTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => 
                        handleTypeFilter(type, checked as boolean)
                      }
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label htmlFor={type} className="text-sm font-medium cursor-pointer select-none">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
              
              {selectedTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTypes.map(type => (
                    <Badge key={type} variant="secondary" className="px-3 py-1">
                      {type}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTypeFilter(type, false)}
                        className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTypes([])}
                  size="sm"
                  disabled={selectedTypes.length === 0}
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTypes(contentTypes)}
                  size="sm"
                  disabled={selectedTypes.length === contentTypes.length}
                >
                  Select All
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Content Items */}
        <div className="space-y-3">
          {filteredAndSortedContent.length === 0 ? (
            <Card
              cardContent={
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[120px]">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50 text-gray-400" />
                  <p className="text-gray-500">No content found matching your criteria.</p>
                </div>
              }
            />
          ) : (
            filteredAndSortedContent.slice(0, 6).map(item => (
              <Card 
                key={item.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                cardContent={
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Heading3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </Heading3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>{item.type}</span>
                          <span>•</span>
                          <span>{item.author}</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        Duplicate
                      </Button>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                }
              />
            ))
          )}
          
          {filteredAndSortedContent.length > 6 ? (
            <div className="text-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/repository')}
                className="px-6"
              >
                View All {filteredAndSortedContent.length} Items
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* App Selector Modal */}
      {showAppSelector && (
        <AppSelector
          contentType={selectedContentType}
          onSelect={handleAppSelection}
          onCancel={handleAppSelectorCancel}
        />
      )}
    </div>
  );
};

export default Dashboard;
