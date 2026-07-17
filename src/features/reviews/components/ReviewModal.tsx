import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Check, AlertTriangle } from 'lucide-react';
import { reviewSchema, type ReviewFormData } from '../schema';
import { DotRating } from './StarRating';
import { useSubmitReview } from '../hooks/useReviews';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectInfo: {
    id: string;
    title: string;
    milestone: string;
    completedDate: string;
    clientName: string;
    expertName: string;
    amount: string;
    revieweeId: string;
  };
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, projectInfo }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const submitReview = useSubmitReview();
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [isAddingTag, setIsAddingTag] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = React.useState(false);
  const [pendingData, setPendingData] = React.useState<ReviewFormData | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      projectId: projectInfo.id,
      revieweeId: projectInfo.revieweeId,
      rating: 0,
      comment: '',
      communicationRating: null,
      qualityRating: null,
      deadlineRating: null,
    },
  });

  const watchedValues = watch();

  if (!isOpen) return null;

  const handleInitialSubmit = (data: ReviewFormData) => {
    if (!isConfirmed) return;
    setPendingData(data);
    setShowSubmitConfirmation(true);
  };

  const onConfirmSubmit = async () => {
    if (!pendingData) return;
    
    // Note: Tags are not in the API, so we could append them to the comment if needed
    const finalComment = selectedTags.length > 0 
      ? `${pendingData.comment}\n\nTags: ${selectedTags.join(', ')}`
      : pendingData.comment;

    try {
      await submitReview.mutateAsync({
        ...pendingData,
        comment: finalComment,
      });

      setShowSubmitConfirmation(false);
      reset();
      onClose();

      if (user?.role === 'EXPERT') {
        navigate(`/expert/projects/${projectInfo.id}/workspace`);
      } else {
        navigate(`/client/projects/${projectInfo.id}/workspace`);
      }
    } catch {
      setShowSubmitConfirmation(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;
    if (selectedTags.length >= 10) return;
    if (selectedTags.includes(trimmedTag)) {
      setTagInput('');
      setIsAddingTag(false);
      return;
    }

    setSelectedTags((prev) => [...prev, trimmedTag]);
    setTagInput('');
    setIsAddingTag(false);
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const ratingLabel = (rating: number) => {
    if (rating === 5) return '5.0 Excellent';
    if (rating === 4) return '4.0 Good';
    if (rating === 3) return '3.0 Average';
    if (rating === 2) return '2.0 Poor';
    if (rating === 1) return '1.0 Very Poor';
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Actual Submit Confirmation Dialog */}
      {showSubmitConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full mx-4 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Confirm Submission</h3>
            <p className="text-slate-500 text-center text-sm font-medium leading-relaxed mb-8">
              Are you sure you want to submit this review? After submitting, the project may be marked as completed if the backend confirms it.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={onConfirmSubmit}
                disabled={submitReview.isPending}
                className="w-full bg-[#1f6eeb] hover:bg-[#1656c0] text-white rounded-lg font-bold h-12 shadow-lg shadow-blue-200"
              >
                {submitReview.isPending ? 'Submitting...' : 'Confirm & Submit'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowSubmitConfirmation(false)}
                disabled={submitReview.isPending}
                className="w-full text-slate-500 hover:text-slate-900 font-bold h-12"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#c7dbf5] shadow-2xl rounded-lg w-full max-w-[720px] max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
        {/* Modal Header Wash */}
        <div className="absolute top-0 left-0 w-full h-[154px] bg-[rgba(227,240,255,0.9)] rounded-t-xl -z-10" />

        <div className="p-8">
          {/* Top Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-[#e0faed] text-[#14a863] text-xs font-semibold rounded-full">
                Completed project
              </span>
              <span className="px-3 py-1 bg-[#e0f0ff] text-[#123b9e] text-xs font-semibold rounded-full">
                Role: {user?.role || 'Client'}
              </span>
            </div>
            <button onClick={onClose} className="text-[#94a6bd] hover:text-[#091329] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-[25px] font-bold text-[#091329] mb-2">Leave a Review</h2>
            <p className="text-[12px] text-[#4f637d] leading-relaxed">
              Share your experience after completing this project. Your review helps other users
              understand the quality of collaboration on AIVORA.
            </p>
          </div>

          {/* Project Summary Card */}
          <div className="bg-white border border-[#c7dbf5] rounded-[10px] p-5 mb-8 grid grid-cols-12 gap-y-4">
            <div className="col-span-8">
              <h3 className="text-[14px] font-semibold text-[#091329] mb-4">Project and Milestone</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-[#94a6bd] uppercase tracking-wider mb-1">Project</p>
                  <p className="text-[12px] font-semibold text-[#091329]">{projectInfo.title}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#94a6bd] uppercase tracking-wider mb-1">Milestone</p>
                  <p className="text-[12px] font-semibold text-[#091329]">{projectInfo.milestone}</p>
                </div>
              </div>
            </div>
            <div className="col-span-4 flex flex-col items-end">
              <span className="px-3 py-1 bg-[#e0faed] text-[#14a863] text-xs font-semibold rounded-full mb-4">
                Completed
              </span>
              <div className="text-right">
                <p className="text-xs font-medium text-[#94a6bd] uppercase tracking-wider mb-1">Completed Date</p>
                <p className="text-[12px] font-semibold text-[#091329]">{projectInfo.completedDate}</p>
              </div>
            </div>

            <div className="col-span-12 grid grid-cols-3 gap-4 border-t border-[#c7dbf5] pt-4 mt-2">
              <div>
                <p className="text-xs font-medium text-[#94a6bd] uppercase mb-1">Client</p>
                <p className="text-[12px] font-semibold text-[#091329]">{projectInfo.clientName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#94a6bd] uppercase mb-1">Expert</p>
                <p className="text-[12px] font-semibold text-[#091329]">{projectInfo.expertName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#94a6bd] uppercase mb-1">Amount</p>
                <p className="text-[12px] font-semibold text-[#091329]">{projectInfo.amount}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleInitialSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Overall Rating */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#091329]">Overall Rating</h3>
                  <p className="text-[12px] text-[#4f637d]">How would you rate your overall experience?</p>
                </div>

                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => field.onChange(val)}
                            className={cn(
                              'w-12 h-12 rounded-[9px] flex flex-col items-center justify-center transition-all',
                              field.value === val
                                ? 'bg-[#1f6eeb] text-white shadow-lg shadow-[#1f6eeb]/30'
                                : 'bg-white border border-[#c7dbf5] text-[#94a6bd] hover:border-[#1f6eeb]'
                            )}
                          >
                            <span className="text-[22px] leading-none mb-1">★</span>
                            <span className="text-xs font-semibold">{val}</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-[#94a6bd] px-1">
                        <span>Very Poor</span>
                        <span>Poor</span>
                        <span>Average</span>
                        <span>Good</span>
                        <span>Excellent</span>
                      </div>
                      <div className="min-h-[20px]">
                        {field.value > 0 && (
                          <p className="text-[13px] font-bold text-[#123b9e]">{ratingLabel(field.value)}</p>
                        )}
                        {errors.rating && (
                          <p className="text-xs text-red-500">{errors.rating.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Rating Details Card */}
              <div className="bg-white border border-[#c7dbf5] rounded-[10px] p-5 space-y-4">
                <h3 className="text-[14px] font-semibold text-[#091329]">Rating Details</h3>
                
                <div className="space-y-3">
                  {[
                    { name: 'communicationRating' as const, label: 'Communication' },
                    { name: 'qualityRating' as const, label: 'Collaboration' },
                    { name: 'deadlineRating' as const, label: 'Timeline' },
                  ].map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#4f637d]">{item.label}</span>
                        <div className="flex items-center gap-3">
                          <Controller
                            name={item.name}
                            control={control}
                            render={({ field }) => (
                              <DotRating
                                value={field.value ?? 0}
                                onChange={field.onChange}
                              />
                            )}
                          />
                          <span className="text-xs font-semibold text-[#123b9e] w-6 text-right">
                            {typeof watchedValues[item.name] === 'number' ? watchedValues[item.name]?.toFixed(1) : '--'}
                          </span>
                        </div>
                      </div>
                      {errors[item.name] && (
                        <p className="text-xs text-red-500">{errors[item.name]?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Written Feedback */}
            <div className="space-y-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[#091329]">Written Feedback</h3>
                <p className="text-[12px] text-[#4f637d]">
                  Write clear and respectful feedback about the completed project or milestone.
                </p>
              </div>

              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Textarea
                      {...field}
                      placeholder="Share specific feedback about the completed project, collaboration, deliverables, and overall experience..."
                      className="min-h-[116px] rounded-[10px] border-[#c7dbf5] text-[12px] p-4 focus:ring-[#1f6eeb]"
                    />
                    {errors.comment && (
                      <p className="text-xs text-red-500">{errors.comment.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Review Tags */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#091329]">Review Tags</h3>
                  <p className="text-xs text-[#4f637d]">Add up to 10 AI domains or skills (e.g. Computer Vision)</p>
                </div>
                {selectedTags.length < 10 && !isAddingTag && (
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(true)}
                    className="text-xs font-bold text-[#1f6eeb] hover:underline flex items-center gap-1"
                  >
                    <span className="text-sm">+</span> Add Tag
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#e0f0ff] text-[#123b9e] border border-[#a8ccfa] flex items-center gap-2 animate-in fade-in zoom-in duration-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}

                {isAddingTag && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <input
                      autoFocus
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                        if (e.key === 'Escape') setIsAddingTag(false);
                      }}
                      placeholder="Enter tag..."
                      className="px-3 py-1.5 rounded-full text-xs border border-[#1f6eeb] focus:outline-none focus:ring-1 focus:ring-[#1f6eeb] w-32 bg-white"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="text-[#14a863] hover:scale-110 transition-transform"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTagInput('');
                        setIsAddingTag(false);
                      }}
                      className="text-[#94a6bd] hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {selectedTags.length === 0 && !isAddingTag && (
                  <p className="text-xs text-[#94a6bd] italic">No tags added yet.</p>
                )}
                
                {selectedTags.length >= 10 && (
                  <p className="text-xs font-bold text-amber-600 w-full mt-1">Maximum limit of 10 tags reached.</p>
                )}
              </div>
            </div>

            {/* Visibility and Confirmation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-[#e0f0ff] rounded-[10px] p-5">
                <h4 className="text-[12px] font-semibold text-[#123b9e] mb-2">Review Visibility</h4>
                <p className="text-xs text-[#4f637d] leading-relaxed">
                  Your review may appear on expert profiles, project details, user review sections, or
                  public profile pages.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConfirmed(!isConfirmed)}
                    className={cn(
                      'w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-all mt-0.5',
                      isConfirmed
                        ? 'bg-white border-[#c7dbf5] text-[#14a863]'
                        : 'bg-white border-[#c7dbf5]'
                    )}
                  >
                    {isConfirmed && <Check size={12} strokeWidth={4} />}
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#4f637d]">
                      I confirm that this review is based on my real project experience.
                    </p>
                    <p className="text-xs text-[#94a6bd] mt-1">
                      Abusive, fake, misleading, or unrelated content may be removed by AIVORA.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="rounded-full px-8 h-[42px] border-[#c7dbf5] text-[#123b9e] text-[12px] font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isConfirmed || submitReview.isPending}
                    className="rounded-full px-10 h-[42px] bg-[#1f6eeb] hover:bg-[#1656c0] text-white text-[12px] font-semibold shadow-lg shadow-[#1f6eeb]/20"
                  >
                    {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
