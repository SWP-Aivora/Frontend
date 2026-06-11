import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { BadgeCheck, Clock, MapPin, DollarSign, BrainCircuit, ChevronLeft, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProposalSchema, type CreateProposalFormValues } from '../schema';
import { Input } from '@/shared/components/ui/Input';
import { toast } from 'sonner';

// Mock fetching job data
const mockJob = {
  id: '1',
  title: 'Computer Vision Model for Medical Imaging',
  description: 'We are looking for an experienced computer vision engineer to build a model capable of detecting early signs of diabetic retinopathy from fundus images. Must have experience with PyTorch and medical datasets. The ideal candidate will have published research or a strong portfolio of similar medical imaging projects. \n\nYou will be working closely with our in-house medical team to validate the model\'s outputs. Expected accuracy is >95%.',
  businessDomain: 'Healthcare',
  budgetType: 0,
  budgetMin: 3000,
  budgetMax: 5000,
  timelineDays: 30,
  experienceLevel: 3, // Expert
  createdAt: '2 hours ago',
  skills: ['PyTorch', 'Computer Vision', 'Python', 'Medical Imaging', 'ResNet'],
  clientName: 'HealthTech Solutions',
  clientVerified: true,
  clientLocation: 'United States',
  clientTotalSpent: '$24k+',
};

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<CreateProposalFormValues>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: {
      jobId: id || '00000000-0000-0000-0000-000000000000', // Mock UUID
      coverLetter: '',
      proposedBudget: mockJob.budgetMin || 0,
      proposedTimelineDays: mockJob.timelineDays || 0,
      milestones: [
        { title: 'Initial Prototype', amount: 1000, dueDays: 10, orderIndex: 0 }
      ],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones"
  });

  const onSubmit = async (data: CreateProposalFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting proposal:', data);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Proposal submitted successfully!');
      navigate('/expert/jobs');
    } catch {
      toast.error('Failed to submit proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Nav */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-accent transition-colors group"
      >
        <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Back to Job Board
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
             {/* Header */}
             <div className="space-y-4 mb-8">
                <div className="flex flex-wrap items-center gap-2">
                   <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600">
                     {mockJob.businessDomain}
                   </span>
                   <span className="px-3 py-1 bg-brand-accent/5 border border-brand-accent/10 rounded-lg text-xs font-bold text-brand-accent flex items-center gap-1.5">
                     <BrainCircuit className="size-3.5" /> Expert Level
                   </span>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto flex items-center gap-1">
                     <Clock className="size-3" /> Posted {mockJob.createdAt}
                   </span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {mockJob.title}
                </h1>
             </div>

             <div className="h-px w-full bg-slate-100 mb-8" />

             {/* Job Info Grid */}
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3">
                   <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <DollarSign className="size-5 text-emerald-600" />
                   </div>
                   <div>
                      <p className="font-black text-slate-900">${mockJob.budgetMin} - ${mockJob.budgetMax}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Fixed Price</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Calendar className="size-5 text-blue-600" />
                   </div>
                   <div>
                      <p className="font-black text-slate-900">{mockJob.timelineDays} Days</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Est. Timeline</p>
                   </div>
                </div>
             </div>

             {/* Description */}
             <div className="space-y-4 mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Project Description</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                  {mockJob.description}
                </p>
             </div>

             {/* Skills */}
             <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {mockJob.skills.map(skill => (
                    <span key={skill} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-brand-accent hover:text-brand-accent transition-colors cursor-pointer">
                      {skill}
                    </span>
                  ))}
                </div>
             </div>
          </div>

          {/* Client Info (Mobile only, moves to sidebar on desktop) */}
          <div className="lg:hidden bg-slate-50 rounded-xl p-8 border border-slate-100">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">About the Client</h3>
             <div className="space-y-3">
                <p className="font-bold text-slate-900">{mockJob.clientName}</p>
                <div className="flex items-center gap-1.5">
                   <BadgeCheck className="size-4 text-brand-success" />
                   <span className="text-xs font-bold text-slate-600">Payment Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                   <MapPin className="size-4" />
                   <span className="text-xs font-medium">{mockJob.clientLocation}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Proposal Form & Client Info */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Client Info (Desktop) */}
          <div className="hidden lg:block bg-slate-50 rounded-xl p-8 border border-slate-100 shadow-sm">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">About the Client</h3>
             <div className="space-y-4">
                <p className="font-black text-lg text-slate-900">{mockJob.clientName}</p>
                <div className="flex items-center gap-2">
                   <BadgeCheck className="size-5 text-brand-success" />
                   <span className="text-sm font-bold text-slate-700">Payment Verified</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                   <MapPin className="size-5" />
                   <span className="text-sm font-medium">{mockJob.clientLocation}</span>
                </div>
                <div className="pt-4 border-t border-slate-200">
                   <p className="text-sm font-black text-slate-900">{mockJob.clientTotalSpent}</p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Spent</p>
                </div>
             </div>
          </div>

          {/* Proposal Form */}
          <div className="bg-white rounded-xl p-8 border border-brand-accent/20 shadow-xl shadow-brand-accent/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-accent to-blue-500" />
             
             <h3 className="text-xl font-black text-slate-900 mb-2 mt-2">Submit a Proposal</h3>
             <p className="text-xs text-slate-500 font-medium mb-6">Connect with the client and pitch your AI solution.</p>

             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Budget & Timeline */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proposed Bid ($)</label>
                    <Input type="number" {...register('proposedBudget')} className="h-12 rounded-xl bg-slate-50" />
                    {errors.proposedBudget && <p className="text-xs text-destructive font-bold">{errors.proposedBudget.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Time (Days)</label>
                    <Input type="number" {...register('proposedTimelineDays')} className="h-12 rounded-xl bg-slate-50" />
                    {errors.proposedTimelineDays && <p className="text-xs text-destructive font-bold">{errors.proposedTimelineDays.message}</p>}
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cover Letter</label>
                   <textarea 
                      {...register('coverLetter')}
                      placeholder="Hi! I have extensive experience in building computer vision models..."
                      className="w-full min-h-[160px] p-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20 text-sm"
                   />
                   {errors.coverLetter && <p className="text-xs text-destructive font-bold">{errors.coverLetter.message}</p>}
                </div>

                {/* Milestones (Simplified for UI) */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <div className="flex items-center justify-between">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                       <FileText className="size-3" /> Milestones
                     </label>
                     <button type="button" onClick={() => append({ title: '', amount: 0, dueDays: 0, orderIndex: fields.length })} className="text-xs font-bold text-brand-accent hover:underline">
                        + Add Milestone
                     </button>
                   </div>
                   
                   {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start bg-white p-2 rounded-xl border border-slate-200">
                         <div className="flex-1 space-y-2">
                           <Input {...register(`milestones.${index}.title`)} placeholder="Milestone Title" className="h-8 text-xs rounded-lg" />
                           <div className="flex gap-2">
                             <Input type="number" {...register(`milestones.${index}.amount`)} placeholder="$ Amount" className="h-8 text-xs rounded-lg w-1/2" />
                             <Input type="number" {...register(`milestones.${index}.dueDays`)} placeholder="Days" className="h-8 text-xs rounded-lg w-1/2" />
                           </div>
                         </div>
                         {fields.length > 1 && (
                           <button type="button" onClick={() => remove(index)} className="text-slate-400 hover:text-destructive p-1">
                             &times;
                           </button>
                         )}
                      </div>
                   ))}
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full rounded-full h-14 font-bold text-base bg-brand-accent hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20">
                  {isSubmitting ? 'Submitting Proposal...' : 'Submit Proposal'}
                </Button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
};
