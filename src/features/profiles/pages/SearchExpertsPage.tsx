import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, ShieldCheck, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

// Mock data since there isn't a search API endpoint in v1 yet
const mockExperts = [
  {
    id: 'exp-1',
    name: 'An Nguyen',
    title: 'AI Chatbot Expert',
    bio: 'Helping businesses build intelligent chatbots and AI-powered customer support systems.',
    location: 'Vietnam',
    rating: 4.8,
    reviews: 24,
    hourlyRate: 25,
    skills: ['Chatbot Development', 'NLP', 'RAG Systems', 'Python'],
    verified: true,
  },
  {
    id: 'exp-2',
    name: 'Sarah Chen',
    title: 'Machine Learning Engineer',
    bio: 'Specializing in computer vision and predictive modeling for retail and healthcare.',
    location: 'Singapore',
    rating: 5.0,
    reviews: 42,
    hourlyRate: 45,
    skills: ['Computer Vision', 'PyTorch', 'Data Pipeline', 'TensorFlow'],
    verified: true,
  },
  {
    id: 'exp-3',
    name: 'Michael Ross',
    title: 'LLM Integration Specialist',
    bio: 'Integrating OpenAI, Anthropic, and open-source models into existing business workflows.',
    location: 'United States',
    rating: 4.9,
    reviews: 18,
    hourlyRate: 60,
    skills: ['Prompt Engineering', 'LangChain', 'API Integration', 'OpenAI'],
    verified: false,
  },
  {
    id: 'exp-4',
    name: 'Priya Sharma',
    title: 'Data Scientist & AI Consultant',
    bio: 'Turning raw data into actionable insights through advanced analytics and machine learning.',
    location: 'India',
    rating: 4.7,
    reviews: 56,
    hourlyRate: 35,
    skills: ['Data Analysis', 'Scikit-Learn', 'SQL', 'Deep Learning'],
    verified: true,
  }
];

export const SearchExpertsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Chatbots', 'Computer Vision', 'LLM Integration', 'Data Science', 'Automation'];

  const filteredExperts = mockExperts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          expert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expert.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Simple mock category filtering logic
    if (activeCategory === 'All') return matchesSearch;
    if (activeCategory === 'Chatbots' && expert.skills.includes('Chatbot Development')) return matchesSearch;
    if (activeCategory === 'Computer Vision' && expert.skills.includes('Computer Vision')) return matchesSearch;
    if (activeCategory === 'LLM Integration' && expert.skills.includes('LangChain')) return matchesSearch;
    if (activeCategory === 'Data Science' && expert.skills.includes('Data Analysis')) return matchesSearch;
    
    return activeCategory === 'All' ? matchesSearch : false;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Search */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-emerald-500/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Find the right AI Expert for your project.
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl">
            Browse our vetted directory of top-tier AI developers, data scientists, and automation specialists.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by keyword, skill, or name..." 
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all text-lg"
              />
            </div>
            <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shrink-0">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="size-4" /> Filters
              </h3>
              <button className="text-xs font-bold text-primary hover:underline">Clear all</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Specialization</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="category" 
                          className="peer sr-only" 
                          checked={activeCategory === category}
                          onChange={() => setActiveCategory(category)}
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-slate-200 peer-checked:border-primary peer-checked:bg-primary transition-colors flex items-center justify-center">
                          <CheckCircle2 className="size-3 text-white opacity-0 peer-checked:opacity-100" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Hourly Rate</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded-md border-slate-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-slate-600">Any hourly rate</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded-md border-slate-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-slate-600">$10 - $30 / hr</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded-md border-slate-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-slate-600">$30 - $60 / hr</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded-md border-slate-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-slate-600">$60+ / hr</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Expertise Level</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded-md border-slate-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-slate-600">Beginner</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded-md border-slate-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-slate-600">Intermediate</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded-md border-slate-300 text-primary focus:ring-primary" defaultChecked />
                    <span className="text-sm font-medium text-slate-600">Expert</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">{filteredExperts.length} Experts found</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select className="bg-transparent border-none font-bold text-slate-900 focus:ring-0 cursor-pointer">
                <option>Best Match</option>
                <option>Highest Rated</option>
                <option>Lowest Hourly Rate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredExperts.map((expert) => (
              <div 
                key={expert.id} 
                className="bg-white border border-slate-100 hover:border-blue-200 rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar & Basics */}
                  <div className="flex gap-4 md:w-1/3 shrink-0">
                    <div className="size-16 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                      <span className="text-xl font-black text-primary">{expert.name.charAt(0)}</span>
                    </div>
                    <div>
                      <Link to={`/client/experts/${expert.id}`} className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                        {expert.name}
                      </Link>
                      <p className="text-sm font-semibold text-slate-600 line-clamp-1 mb-2">{expert.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-900">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" /> {expert.rating.toFixed(1)}
                        </span>
                        <span className="text-xs font-medium text-slate-500">({expert.reviews})</span>
                        {expert.verified && (
                          <ShieldCheck className="size-4 text-emerald-500 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio & Skills */}
                  <div className="flex-1 space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {expert.bio}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {expert.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex flex-col items-start md:items-end justify-between md:border-l border-slate-100 md:pl-6 shrink-0 md:w-40">
                    <div className="flex flex-row md:flex-col items-center md:items-end w-full justify-between md:justify-start gap-2 md:gap-0 mb-4 md:mb-0">
                      <div className="text-left md:text-right">
                        <span className="text-xl font-black text-slate-900">${expert.hourlyRate}</span>
                        <span className="text-xs font-medium text-slate-500">/hr</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <MapPin className="size-3" /> {expert.location}
                      </div>
                    </div>
                    
                    <Button asChild className="w-full md:w-auto rounded-full font-bold shadow-md shadow-primary/20">
                      <Link to={`/client/experts/${expert.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredExperts.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-16 flex flex-col items-center justify-center text-center">
                <Search className="size-12 text-slate-300 mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-2">No experts found</h3>
                <p className="text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                  className="mt-6 rounded-full"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
