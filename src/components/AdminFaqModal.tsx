import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://funfun.cloud';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number;
  title: string;
  content: string;
  createdAt: string;
  onUpdateSuccess: (success: boolean) => void;
}

const AdminFaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose, id, title, content, createdAt, onUpdateSuccess }) => {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedTitle(title);
    setEditedContent(content);
    setIsDirty(false);
  }, [title, content, isOpen]);

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      await axios.put(
        `${API_BASE_URL}/api/faqs/${id}`,
        { title: editedTitle, content: editedContent },
        { headers: { 'Content-Type': 'application/json' } }
      );
      onUpdateSuccess(true);
      onClose();
    } catch (error) {
      console.error('FAQ 수정 실패:', error);
      alert('FAQ 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setIsDirty(editedTitle !== title || editedContent !== content);
  }, [editedTitle, editedContent, title, content]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      <div className="bg-[#1A1A1A] w-full max-w-5xl max-h-[90vh] rounded-2xl p-10 flex flex-col border border-[#2D2D2D] shadow-2xl overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#00E6AE] mb-6 pb-2 border-b border-white/20">FAQ</h2>

        <div className="flex flex-col gap-6 text-sm text-[#BDBDBD]">
          <div>
            <label className="text-white font-semibold block mb-2">제목</label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full bg-[#2B2B2B] text-white p-3 rounded border border-[#444] focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-white font-semibold">게시일 |</label>
            <span className="text-white">{createdAt}</span>
          </div>

          <div>
            <label className="text-white font-semibold block mb-">내용</label>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-[#2B2B2B] text-white p-3 rounded border border-[#444] h-64 resize-none focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-8 space-x-2">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-white bg-gray-600 hover:bg-gray-500 rounded"
          >
            닫기
          </button>
          <button
            onClick={handleUpdate}
            disabled={!isDirty || isSaving}
            className={`px-5 py-2 text-sm rounded transition-colors ${
              isDirty
                ? 'bg-[#00E6AE] text-black hover:bg-[#00c59a]'
                : 'bg-gray-500 text-white cursor-not-allowed'
            }`}
          >
            {isSaving ? '저장 중...' : '수정하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFaqModal;
