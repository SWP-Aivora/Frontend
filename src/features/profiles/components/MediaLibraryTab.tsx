import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '@/shared/services/mediaService';
import { QUERY_KEYS } from '@/shared/constants';
import { Trash2, FileIcon, ImageIcon, FileTextIcon, FileArchiveIcon } from 'lucide-react';
import { toast } from 'sonner';

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getFileIcon = (format: string) => {
  const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const documentFormats = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const archiveFormats = ['zip', 'rar', 'tar', 'gz'];

  if (imageFormats.includes(format.toLowerCase())) {
    return <ImageIcon className="size-8 text-blue-500" />;
  }
  if (documentFormats.includes(format.toLowerCase())) {
    return <FileTextIcon className="size-8 text-amber-500" />;
  }
  if (archiveFormats.includes(format.toLowerCase())) {
    return <FileArchiveIcon className="size-8 text-emerald-500" />;
  }
  return <FileIcon className="size-8 text-slate-500" />;
};

export const MediaLibraryTab = () => {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: QUERY_KEYS.MEDIA.LIST,
    queryFn: () => mediaService.getMedia(),
  });

  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => mediaService.deleteMedia(publicId),
    onSuccess: () => {
      toast.success('File deleted successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEDIA.LIST });
    },
    onError: () => {
      toast.error('Failed to delete file');
    },
  });

  const handleDelete = (publicId: string) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      deleteMutation.mutate(publicId);
    }
  };

  const mediaList = response?.data || [];

  if (isLoading) {
    return (
      <div data-testid="media-skeleton" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-slate-100 rounded-lg h-48"></div>
        ))}
      </div>
    );
  }

  if (mediaList.length === 0) {
    return (
      <div className="bg-white rounded-lg p-10 border border-slate-100 shadow-sm text-center">
        <FileIcon className="size-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-xl font-black text-slate-900 mb-1">No media found</h3>
        <p className="text-slate-500 text-sm font-medium">You haven't uploaded any files yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Media Library</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage your uploaded files and images across AIVORA.
          </p>
        </div>
        <div className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          {mediaList.length} files
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaList.map((media) => {
          // Extract filename from publicId
          const filename = media.publicId.split('/').pop() || media.publicId;
          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(media.format.toLowerCase());
          
          return (
            <div 
              key={media.publicId} 
              className="group relative bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
            >
              {/* Media Preview Area */}
              <div className="h-32 bg-slate-50 border-b border-slate-100 flex items-center justify-center overflow-hidden relative">
                {isImage ? (
                  <img 
                    src={media.url} 
                    alt={filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  getFileIcon(media.format)
                )}
                
                {/* Delete overlay that appears on hover */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(media.publicId)}
                    disabled={deleteMutation.isPending}
                    className="bg-white text-red-500 hover:bg-red-50 hover:text-red-600 p-2 rounded-full shadow-lg transition-colors flex items-center gap-1.5 px-3 font-bold text-xs"
                    aria-label="Delete file"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Media Info Area */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 truncate" title={filename}>
                    {filename}
                  </h4>
                  <p className="text-xs text-slate-500 uppercase mt-0.5 tracking-wider font-bold">
                    {media.format}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                  <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {formatBytes(media.bytes)}
                  </span>
                  <span title={new Date(media.createdAt).toLocaleString()}>
                    {new Date(media.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
