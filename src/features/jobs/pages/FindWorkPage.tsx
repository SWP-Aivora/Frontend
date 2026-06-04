import { useState } from 'react';
import { JobBoardCard } from '../components/JobBoardCard';
import { type JobCard } from '../schema';
import { Search, DollarSign, BrainCircuit } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

// Dummy data to simulate the API response
const mockJobs: JobCard[] = [
  {
    id: '1',
    title: 'Computer Vision Model for Medical Imaging',
    description: 'We are looking for an experienced computer vision engineer to build a model capable of detecting early signs of diabetic retinopathy from fundus images. Must have experience with PyTorch and medical datasets.',
    businessDomain: 'Healthcare',
    budgetType: 0,
    budgetMin: 3000,
    budgetMax: 5000,
    timelineDays: 30,
    experienceLevel: 3,
    createdAt: '2 hours ago',
    skills: ['PyTorch', 'Computer Vision', 'Python', 'Medical Imaging', 'ResNet'],
    proposalsCount: 12,
    clientName: 'HealthTech Solutions',
    clientVerified: true,
  },
  {
    id: '2',
    title: 'E-commerce AI Chatbot Integration',
    description: 'Need a generative AI expert to integrate a custom LLM chatbot into our Shopify store. The bot should answer customer queries based on our product catalog and handle basic return requests.',
    businessDomain: 'E-commerce',
    budgetType: 1,
    budgetMin: 40,
    budgetMax: 60,
    timelineDays: 14,
    experienceLevel: 2,
    createdAt: '5 hours ago',
    skills: ['OpenAI', 'LangChain', 'Shopify', 'Node.js', 'Customer Support'],
    proposalsCount: 45,
    clientName: 'RetailBoost Inc.',
    clientVerified: true,
  },
  {
    id: '3',
    title: 'Financial Fraud Detection System',
    description: 'Looking to build a predictive analytics model to flag potentially fraudulent transactions in real-time. The dataset contains 5M+ anonymized transaction records. Focus on precision over recall.',
    businessDomain: 'Fintech',
    budgetType: 0,
    budgetMin: 8000,
    budgetMax: 10000,
    timelineDays: 45,
    experienceLevel: 3,
    createdAt: '1 day ago',
    skills: ['Machine Learning', 'XGBoost', 'Data Engineering', 'Python', 'Pandas', 'Scikit-learn'],
    proposalsCount: 8,
    clientName: 'SecurePay',
    clientVerified: false,
  },
  {
    id: '4',
    title: 'Automated Newsletter Generator',
    description: 'Create a script that scrapes 5 specific industry blogs daily, summarizes the top articles using an LLM, and drafts an email newsletter in Mailchimp.',
    businessDomain: 'Marketing',
    budgetType: 0,
    budgetMin: 500,
    budgetMax: 800,
    timelineDays: 7,
    experienceLevel: 1,
    createdAt: '2 days ago',
    skills: ['Python', 'Web Scraping', 'Prompt Engineering', 'API Integration'],
    proposalsCount: 22,
    clientName: 'ContentHouse',
    clientVerified: true,
  }
];

export const FindWorkPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Search */}
      <div className="bg-brand-blue-dark rounded-[40px] p-10 md:p-14 relative overflow-hidden text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            Find the Perfect <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-brand-accent">AI Project</span>
          </h1>
          <p className="text-brand-blue-light/80 text-lg font-medium mb-8 max-w-xl">
            Browse thousands of high-quality AI jobs from verified clients. Apply, deliver, and get paid securely.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/50" />
              <input 
                type="text" 
                placeholder="Search by keywords, skills, or domain..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-transparent border-none text-white placeholder:text-white/50 focus:outline-none focus:ring-0 text-base"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-white/20 self-center" />
            <Button className="h-12 px-8 rounded-xl font-bold bg-white text-brand-blue-dark hover:bg-slate-100 transition-colors w-full md:w-auto">
              Search Jobs
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-lg font-black text-slate-900">Filters</h2>
             <button className="text-xs font-bold text-primary hover:underline">Clear all</button>
          </div>

          {/* Budget Filter */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
               <DollarSign className="size-4 text-brand-accent" />
               Budget Type
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                 <div className="relative size-5 rounded-md border-2 border-slate-300 bg-white group-hover:border-brand-accent transition-colors overflow-hidden">
                    <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" defaultChecked />
                    <div className="absolute inset-0 bg-brand-accent opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="size-3 text-white"><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                 </div>
                 <span className="text-sm font-medium text-slate-700">Fixed Price</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                 <div className="relative size-5 rounded-md border-2 border-slate-300 bg-white group-hover:border-brand-accent transition-colors overflow-hidden">
                    <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" defaultChecked />
                    <div className="absolute inset-0 bg-brand-accent opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="size-3 text-white"><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                 </div>
                 <span className="text-sm font-medium text-slate-700">Hourly Rate</span>
              </label>
            </div>
          </div>

          {/* Domain Filter */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
               <BrainCircuit className="size-4 text-brand-accent" />
               AI Domains
            </div>
            <div className="flex flex-wrap gap-2">
               {['NLP', 'Computer Vision', 'Generative AI', 'Analytics', 'Robotics'].map(domain => (
                 <button key={domain} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:border-brand-accent hover:text-brand-accent transition-colors">
                   {domain}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Main Job List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6">
             <p className="text-sm font-bold text-slate-500">
               Showing <span className="text-slate-900">2,481</span> jobs
             </p>
             <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Sort by:</span>
                <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 px-3 py-1.5 focus:outline-none focus:border-brand-accent cursor-pointer">
                  <option>Newest First</option>
                  <option>Highest Budget</option>
                  <option>Relevance</option>
                </select>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {mockJobs.map(job => (
                <JobBoardCard key={job.id} job={job} />
             ))}
          </div>
          
          <div className="pt-8 flex justify-center">
             <Button variant="outline" className="rounded-full px-8 h-12 font-bold border-slate-200 text-slate-600 hover:text-brand-accent hover:border-brand-accent transition-all">
                Load More Jobs
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
