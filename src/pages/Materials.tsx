import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Search, 
  Filter,
  Star,
  Clock,
  Users,
  ArrowLeft,
  GraduationCap,
  FileCode,
  Image,
  Video,
  Music,
  File,
  Table,
  Presentation,
  Archive,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Materials = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleBack = () => {
    if (user?.userType === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  const categories = [
    { id: 'all', label: 'All Materials', icon: BookOpen },
    { id: 'syllabus', label: 'Syllabus', icon: FileText },
    { id: 'notes', label: 'Notes', icon: FileCode },
    { id: 'assignments', label: 'Assignments', icon: Table },
    { id: 'projects', label: 'Projects', icon: Presentation },
    { id: 'exams', label: 'Exam Papers', icon: File },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'archives', label: 'Archives', icon: Archive }
  ];

  const materials = [
    {
      id: 1,
      title: 'Data Structures and Algorithms - Complete Notes',
      description: 'Comprehensive notes covering all topics from basic to advanced data structures and algorithms.',
      category: 'notes',
      type: 'pdf',
      size: '2.4 MB',
      downloads: 1250,
      rating: 4.8,
      uploadDate: '2024-01-15',
      author: 'Dr. Smith',
      tags: ['DSA', 'Programming', 'Computer Science'],
      isFavorite: false,
      isNew: true
    },
    {
      id: 2,
      title: 'Database Management Systems - Lab Manual',
      description: 'Complete lab manual with practical exercises and solutions for DBMS course.',
      category: 'assignments',
      type: 'pdf',
      size: '1.8 MB',
      downloads: 890,
      rating: 4.6,
      uploadDate: '2024-01-10',
      author: 'Prof. Johnson',
      tags: ['Database', 'SQL', 'Lab Manual'],
      isFavorite: true,
      isNew: false
    },
    {
      id: 3,
      title: 'Web Development Tutorial Series',
      description: 'Complete video tutorial series covering HTML, CSS, JavaScript, and React.',
      category: 'videos',
      type: 'mp4',
      size: '450 MB',
      downloads: 2100,
      rating: 4.9,
      uploadDate: '2024-01-20',
      author: 'Tech Academy',
      tags: ['Web Development', 'React', 'JavaScript'],
      isFavorite: false,
      isNew: true
    },
    {
      id: 4,
      title: 'Machine Learning Project Templates',
      description: 'Ready-to-use project templates for various machine learning algorithms.',
      category: 'projects',
      type: 'zip',
      size: '15.2 MB',
      downloads: 567,
      rating: 4.7,
      uploadDate: '2024-01-12',
      author: 'AI Research Team',
      tags: ['Machine Learning', 'Python', 'Templates'],
      isFavorite: true,
      isNew: false
    },
    {
      id: 5,
      title: 'Operating Systems - Previous Year Papers',
      description: 'Collection of previous year exam papers with solutions for OS course.',
      category: 'exams',
      type: 'pdf',
      size: '3.1 MB',
      downloads: 1780,
      rating: 4.5,
      uploadDate: '2024-01-08',
      author: 'Exam Committee',
      tags: ['Operating Systems', 'Exam Papers', 'Solutions'],
      isFavorite: false,
      isNew: false
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return File;
      case 'mp4': return Video;
      case 'zip': return Archive;
      case 'doc': return FileText;
      case 'xlsx': return Table;
      case 'pptx': return Presentation;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'mp4': return 'bg-blue-100 text-blue-800';
      case 'zip': return 'bg-purple-100 text-purple-800';
      case 'doc': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/90 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                    Study Materials
                  </h1>
                  <p className="text-primary-foreground/90 text-sm lg:text-base">
                    Access all your learning resources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => {
            const FileIcon = getFileIcon(material.type);
            return (
              <Card 
                key={material.id} 
                className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:scale-105"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                        <FileIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {material.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getTypeColor(material.type)}`}>
                            {material.type.toUpperCase()}
                          </Badge>
                          {material.isNew && (
                            <Badge className="text-xs bg-green-100 text-green-800">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className={`w-4 h-4 ${material.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {material.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {material.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{material.downloads}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-3 h-3 ${Math.round(material.rating) >= n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="ml-1">{material.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{material.size}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-gray-500">
                      by {material.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="h-8">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Top Downloads (local preview) */}
        {filteredMaterials.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Top Downloads
            </h3>
            <div className="space-y-2">
              {filteredMaterials
                .slice()
                .sort((a, b) => b.downloads - a.downloads)
                .slice(0, 5)
                .map((m, idx, arr) => {
                  const max = arr[0].downloads || 1;
                  const pct = Math.max(5, Math.round((m.downloads / max) * 100));
                  return (
                    <div key={m.id} className="">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate pr-2 max-w-[70%]">{m.title}</span>
                        <span className="text-gray-500">{m.downloads}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded">
                        <div className="h-2 bg-blue-500 rounded" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No materials found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Materials;
