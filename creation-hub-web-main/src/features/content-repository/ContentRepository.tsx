import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Heading1, Heading3, Heading4 } from '@/shared/components/typography';
import { ArrowLeft, Search, Filter, Calendar, ArrowUpDown, X } from 'lucide-react';
import { supabase } from '@/config/supabaseClient';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  status: 'draft' | 'published' | 'in-progress';
  author: string;
}

const ContentRepository = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('content') // Change 'content' to your actual table name if different
        .select('*');
      if (error) {
        console.error('Error fetching content:', error);
      } else {
        setContent(data || []);
      }
    };
    fetchContent();
  }, []);

  const contentTypes = ['Website Blog', 'LinkedIn Post', 'Newsletter', 'Technical Article', 'Facebook Post', 'Carousel', 'Twitter Post', 'Thought Leadership'];

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
    if (checked) {
      setSelectedTypes(prev => [...prev, type]);
    } else {
      setSelectedTypes(prev => prev.filter(t => t !== type));
    }
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
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-center gap-4 mb-8 text-center">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Heading1 className="text-3xl font-bold text-gray-900">
          Content Repository
        </Heading1>
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
      <div className="space-y-4">
        {filteredAndSortedContent.length === 0 ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[120px]">
            <p className="text-gray-500">No content found matching your criteria.</p>
          </Card>
        ) : (
          filteredAndSortedContent.map(item => (
            <Card 
              key={item.id} 
              className="hover:shadow-md transition-shadow cursor-pointer p-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                <div className="flex-1 mb-4 sm:mb-0">
                  <Heading3 className="text-lg font-semibold text-gray-900 mb-2 text-center sm:text-left">
                    {item.title}
                  </Heading3>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3 justify-center sm:justify-start">
                    <span>{item.type}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{item.author}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mb-4 sm:mb-0">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 justify-center sm:justify-start">
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
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ContentRepository;
