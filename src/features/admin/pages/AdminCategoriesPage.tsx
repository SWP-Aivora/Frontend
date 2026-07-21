import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tags, X } from 'lucide-react';
import { toast } from 'sonner';
import { categoryService } from '@/shared/services/categoryService';
import { AdminPageTitle } from '../components/AdminPageTitle';
import { LoadingSpinner } from '@/shared/components/common/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';

export const AdminCategoriesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  const categories = categoriesResponse?.data ?? [];

  const createCategoryMutation = useMutation({
    mutationFn: () => categoryService.createCategory({ name: name.trim(), description: description.trim() || undefined }),
    onSuccess: (response) => {
      if (response.success === false) {
        toast.error(response.message || 'Failed to create category');
        return;
      }
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      setName('');
      setDescription('');
    },
    onError: (error: unknown) => {
      let message = 'Failed to create category';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const err = error as { response?: { data?: { message?: string } } };
        message = err.response?.data?.message || message;
      }
      toast.error(message);
    },
  });

  return (
    <div className="space-y-4 pb-10">
      <AdminPageTitle
        title="Manage Categories"
        description="Create and review the job categories clients choose from when posting work."
      />

      <div className="bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-slate-900">All categories</h3>
          <Button onClick={() => setIsModalOpen(true)} className="rounded-full px-5 flex items-center gap-2">
            <Plus className="size-4" />
            Add Category
          </Button>
        </div>

        {isLoading ? (
          <div className="h-[30vh] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs font-bold text-slate-900">{category.name}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-500">{category.description || '—'}</td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Tags className="size-8 opacity-20" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No categories yet</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md relative z-10 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black text-slate-900">Add Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 hover:bg-slate-100 transition-colors">
                <X className="size-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                <input
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary"
                  placeholder="e.g. Mobile Development"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (optional)</label>
                <textarea
                  className="w-full rounded-lg border-slate-200 p-3 text-sm focus:ring-primary focus:border-primary"
                  rows={3}
                  placeholder="Short description of this category"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full font-bold">Cancel</Button>
              <Button
                onClick={() => createCategoryMutation.mutate()}
                disabled={createCategoryMutation.isPending || !name.trim()}
                className="rounded-full shadow-lg shadow-primary/20 font-black"
              >
                {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
