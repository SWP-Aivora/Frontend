import { Star, ShieldCheck, Zap, ChevronRight, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ExpertMatch } from '../types';

interface ExpertMatchInsightsProps {
  experts: ExpertMatch[];
}

export const ExpertMatchInsights = ({ experts }: ExpertMatchInsightsProps) => {
  if (experts.length === 0) {
    return (
      <div className="text-center py-20 space-y-6 animate-in fade-in duration-700">
        <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
          <Search className="size-10 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Project is Live!</h2>
          <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">
            No immediate matches found yet. Don't worry, the best experts will see your post and submit proposals soon!
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full px-10 h-14 border-slate-200 font-black text-slate-600 mt-8">
          <Link to="/client/projects">Go to My Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200/50">
          <CheckCircle2 className="size-10 text-emerald-600" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Project is Live!</h2>
        <p className="text-lg text-slate-500 font-medium">
          AIVORA AI has analyzed your project and found the top experts matching your specific requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map((expert, idx) => (
          <motion.div 
            key={expert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
               <div className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/10 flex items-center gap-1">
                 <Zap className="size-3 fill-primary" /> {expert.matchScore}% Match
               </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="size-20 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center relative">
                 <span className="text-2xl font-black text-slate-400">{expert.name.charAt(0)}</span>
                 <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                    <ShieldCheck className="size-5 text-emerald-500" />
                 </div>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{expert.name}</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{expert.title}</p>
              </div>

              <div className="flex items-center gap-1.5 py-1 px-3 bg-slate-50 rounded-full">
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold text-slate-700">{expert.rating.toFixed(1)}</span>
                <span className="text-[10px] text-slate-400 font-medium">Rating</span>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {expert.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[9px] font-bold uppercase border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="w-full pt-4 space-y-2">
                <Button className="w-full rounded-2xl font-black shadow-lg shadow-primary/20">
                  Invite to Project
                </Button>
                <Button variant="ghost" asChild className="w-full rounded-2xl font-bold text-slate-500 hover:text-primary">
                  <Link to={`/client/experts/${expert.id}`}>
                    View Profile <ChevronRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <Button asChild variant="outline" className="rounded-full px-10 h-14 border-slate-200 font-black text-slate-600">
          <Link to="/client/projects">Manage Your Projects</Link>
        </Button>
      </div>
    </div>
  );
};
