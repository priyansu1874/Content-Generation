import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Heading1, Heading2, Heading3, Heading4 } from '@/shared/components/typography';
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
import { supabase } from '@/config/supabaseClient';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  status: 'draft' | 'published' | 'in-progress';
  author: string;
}


const Dashboard = () => {
  // Use any for viewItem to allow all possible fields from any table
  const [viewItem, setViewItem] = useState<Record<string, unknown> | null>(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [blogContent, setBlogContent] = useState<ContentItem[]>([]);
  const [carouselContent, setCarouselContent] = useState<ContentItem[]>([]);
  const [linkedinContent, setLinkedinContent] = useState<ContentItem[]>([]);
  const [technicalArticleContent, setTechnicalArticleContent] = useState<ContentItem[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const tiles = [
    { name: 'Website Blog', icon: Globe, path: '/content/website-blog', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'LinkedIn Post', icon: Linkedin, path: '/content/linkedin-post', gradient: 'from-blue-600 to-blue-800' },
    { name: 'Newsletter', icon: Mail, path: '/content/newsletter', gradient: 'from-green-500 to-emerald-500' },
    { name: 'Technical Article', icon: FileText, path: '/content/technical-article', gradient: 'from-purple-500 to-purple-700' },
    { name: 'Facebook Post', icon: Facebook, path: '/content/facebook-post', gradient: 'from-blue-500 to-indigo-600' },
    { name: 'Carousel', icon: Image, path: '/carousel', gradient: 'from-pink-500 to-rose-500' },
    { name: 'Twitter Post', icon: Twitter, path: '/content/twitter-post', gradient: 'from-sky-400 to-sky-600' },
    { name: 'Thought Leadership', icon: Brain, path: '/content/thought-leadership', gradient: 'from-violet-500 to-purple-600' },
  ];

  const contentTypes = ['Website Blog', 'LinkedIn Post', 'Newsletter', 'Technical Article', 'Facebook Post', 'Carousel', 'Twitter Post', 'Thought Leadership'];

  // Fetching data from Supabase for different modules
  useEffect(() => {
    // Helper to map table name to type
    const tableTypeMap = {
      'website_blog': 'Website Blog',
      'carousel': 'Carousel',
      'Content Post Information': 'Content Post Information',
      'technical_article_content': 'Technical Article Content',
    };

    const fetchBlogContent = async () => {
      const { data, error } = await supabase.from('website_blog').select('*');
      if (!error) setBlogContent((data || []).map(row => ({
        ...row,
        type: tableTypeMap['website_blog'],
        createdAt: row.createdAt || row.created_at || '',
      })));
    };
    const fetchCarouselContent = async () => {
      const { data, error } = await supabase.from('carousel').select('*');
      if (!error) setCarouselContent((data || []).map(row => ({
        ...row,
        type: tableTypeMap['carousel'],
        createdAt: row.createdAt || row.created_at || '',
      })));
    };
    const fetchLinkedinContent = async () => {
      const { data, error } = await supabase.from('Content Post Information').select('*');
      if (!error) setLinkedinContent((data || []).map(row => ({
        ...row,
        type: tableTypeMap['Content Post Information'],
        createdAt: row.createdAt || row.created_at || '',
      })));
    };
    const fetchTechnicalArticleContent = async () => {
      const { data, error } = await supabase.from('technical_article_content').select('*');
      if (!error) setTechnicalArticleContent((data || []).map(row => ({
        ...row,
        type: tableTypeMap['technical_article_content'],
        createdAt: row.createdAt || row.created_at || '',
      })));
    };
    fetchBlogContent();
    fetchCarouselContent();
    fetchLinkedinContent();
    fetchTechnicalArticleContent();
  }, []);

  // Combine all fetched content into one array
  // const allContent = [
  //   ...content,
  //   ...blogContent,
  //   ...carouselContent,
  //   ...linkedinContent,
  //   ...technicalArticleContent
  // ];
  const allContent = [
    ...blogContent,
    ...carouselContent,
    ...linkedinContent,
    ...technicalArticleContent
  ];

  const filteredAndSortedContent = allContent
    .filter(item => {
      if (!item || typeof item.title !== 'string' || typeof item.type !== 'string') return false;
      return (
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedTypes.length === 0 || selectedTypes.includes(item.type))
      );
    })
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
          // Sort by createdAt date, fallback to title if dates are equal or missing
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = dateA - dateB;
          // If dates are equal or both missing, fallback to title
          if (comparison === 0) {
            comparison = a.title.localeCompare(b.title);
          }
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

  const handleTileClick = (tileName: string, tilePath: string) => {
    // All tiles now go directly to their respective forms
    navigate(tilePath);
  };

  // Factorized modal for viewing all fields of a row
  const ViewModal = ({ item, onClose }: { item: Record<string, unknown>, onClose: () => void }) => {
    if (!item) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-4 relative animate-fade-in border border-gray-200 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 border-b border-gray-100">
            <Heading3 className="text-white text-2xl font-bold">Content Details</Heading3>
            <button
              className="text-white hover:text-gray-200 transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* Content Body */}
          <div className="px-8 py-8 bg-gray-50 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {Object.entries(item).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <span className="font-semibold text-gray-700 text-base capitalize mb-1 tracking-wide">{key.replace(/_/g, ' ')}</span>
                  <span className="text-gray-900 text-sm break-words">
                    {key.toLowerCase().includes('date') || key.toLowerCase().includes('created')
                      ? (value ? new Date(value as string).toLocaleString() : '-')
                      : typeof value === 'boolean'
                        ? value ? 'Yes' : 'No'
                        : value === null || value === undefined || value === ''
                          ? '-'
                          : typeof value === 'object'
                            ? <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto max-w-full whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                            : value.toString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 relative">
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
                  className="h-8 w-8 p-4"
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
                        className="ml-2 h-4 w-4 p-4 hover:bg-transparent"
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
            filteredAndSortedContent.slice(0, 6).map((item, index) => (
              <Card 
                key={`${item.type}-${item.id}-${index}`} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                cardContent={
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Heading3 className="text-lg font-semibold text-gray-900">
                            {item.title}
                          </Heading3>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={e => { e.stopPropagation(); setViewItem(item as unknown as Record<string, unknown>); }}
                            className="h-6 px-2 text-xs"
                          >
                            View
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>{item.type}</span>
                          <span>•</span>
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
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
      {/* Modal for viewing all fields of a row */}
      {viewItem && <ViewModal item={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
};

export default Dashboard;
