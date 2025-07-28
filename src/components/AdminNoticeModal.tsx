import React from 'react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  createdAt: string;
}

const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose, title, content, createdAt }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      <div className="bg-[#1A1A1A] w-full max-w-5xl max-h-[90vh] rounded-2xl p-10 flex flex-col border border-[#2D2D2D] shadow-2xl overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#00E6AE] mb-6 pb-2 border-b border-white/20">공지사항</h2>

        <div className="flex flex-col gap-5 flex-1 text-sm text-[#BDBDBD]">
            <div className="flex items-center space-x-2">
    <label className="text-white font-semibold">제목 | </label>
    <span className="text-white">{title}</span>
  </div>
           <div className="flex items-center space-x-2">
    <label className="text-white font-semibold">게시일 | </label>
    <span className="text-white">{createdAt}</span>
  </div>
          <div>            
            <div className="bg-[#2B2B2B] rounded-lg p-4 mt-1 whitespace-pre-wrap text-white leading-relaxed">
                {content}
                </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-white bg-gray-600 hover:bg-gray-500 rounded"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeModal;
