import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  Target, 
  Star,
  ArrowLeft,
  Code,
  Smartphone,
  Cpu,
  Brain,
  Globe,
  Shield,
  Zap,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    DigiDiploma
                  </h1>
                </div>
              </div>
            </div>
            
            <Link to="/">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About DigiDiploma
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing digital education with comprehensive study materials, project management, and interactive learning resources for diploma students.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-2xl font-bold text-blue-900 flex items-center gap-3">
                  <Target className="w-8 h-8 text-blue-600" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-lg text-slate-700 leading-relaxed">
                  To provide comprehensive digital learning solutions that empower diploma students with accessible, organized, and interactive educational resources. We strive to bridge the gap between traditional education and modern technology.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardTitle className="text-2xl font-bold text-purple-900 flex items-center gap-3">
                  <Star className="w-8 h-8 text-purple-600" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-lg text-slate-700 leading-relaxed">
                  To become the leading digital education platform for diploma students across India, fostering innovation, collaboration, and excellence in technical education through cutting-edge technology and user-centric design.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              What We Offer
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive digital solutions designed specifically for diploma engineering students.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Study Materials</h3>
                <p className="text-slate-600 leading-relaxed">
                  Access to comprehensive study materials including PDFs, PPTs, videos, and handwritten notes organized by branch, semester, and subject.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <Code className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Project Management</h3>
                <p className="text-slate-600 leading-relaxed">
                  Showcase your projects, collaborate with peers, and build your portfolio with our integrated project management system.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Community</h3>
                <p className="text-slate-600 leading-relaxed">
                  Connect with fellow students, share knowledge, and participate in discussions across all engineering branches.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Engineering Branches
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive coverage across all major diploma engineering branches.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Computer Engineering', icon: Code, color: 'blue' },
              { name: 'Information Technology', icon: Smartphone, color: 'green' },
              { name: 'Mechanical Engineering', icon: Cpu, color: 'orange' },
              { name: 'Electrical Engineering', icon: Zap, color: 'yellow' },
              { name: 'Civil Engineering', icon: Target, color: 'brown' },
              { name: 'ENTC Engineering', icon: Brain, color: 'purple' }
            ].map((branch, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${branch.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                    <branch.icon className={`w-6 h-6 text-${branch.color}-600`} />
          </div>
                  <h3 className="text-lg font-bold text-slate-900">{branch.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Dedicated professionals committed to revolutionizing digital education.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Chaitanya Zagade</h3>
                <p className="text-slate-600 mb-4">Founder & Lead Developer</p>
                <p className="text-slate-600 text-sm">
                  Passionate about education technology and creating innovative solutions for students.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Development Team</h3>
                <p className="text-slate-600 mb-4">Full-Stack Developers</p>
                <p className="text-slate-600 text-sm">
                  Experienced developers working on cutting-edge technologies to deliver the best user experience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Support Team</h3>
                <p className="text-slate-600 mb-4">Customer Success</p>
                <p className="text-slate-600 text-sm">
                  Dedicated support team ensuring smooth experience for all users and institutions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of students who have already discovered the power of digital education with DigiDiploma.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 text-lg font-semibold shadow-xl">
                <BookOpen className="w-6 h-6 mr-3" />
                Get Started Today
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 h-14 px-8 text-lg font-semibold">
                <MessageCircle className="w-6 h-6 mr-3" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 