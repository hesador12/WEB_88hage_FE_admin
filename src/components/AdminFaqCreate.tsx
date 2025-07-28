'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import AdminLayout from '@/components/layout/AdminLayout';

const API_BASE_URL = 'https://funfun.cloud';

const AdminFaqCreate = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/faqs`, {
        title,
        content,
      });

      if (res.status === 201) {
        router.push('/admin/faq?created=1');
      } else {
        alert('등록이 완료되지 않았습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('FAQ 등록 실패:', error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="FAQ 신규 등록" subtitle="사용자들이 자주 묻는 질문과 답변을 등록해주세요.">
      <div className="px-8 py-6 text-white flex justify-center">
        <div className="space-y-6 w-350">
          {/* 제목 입력 */}
          <div className="space-y-4">
            <label htmlFor="faq-title" className="text-[#1CEBB9] font-bold text-sm block mb-1">
              Question
            </label>
            <input
              id="faq-title"
              type="text"
              className="w-full bg-[#1C1C1C] border border-[#3A3A3A] text-sm rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1CEBB9] transition"
              placeholder="자주묻는 질문을 입력해주세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 내용 입력 */}
          <div className="space-y-4">
            <label htmlFor="faq-content" className="text-[#1CEBB9] font-bold text-sm block mb-2">
              Answer
            </label>
            <textarea
              id="faq-content"
              rows={18}
              className="w-full bg-[#1C1C1C] border border-[#3A3A3A] text-sm rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1CEBB9] transition resize-none"
              placeholder="질문에 대한 답변을 입력해주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`bg-[#1CEBB9] text-[#121212] text-sm font-semibold px-6 py-2 rounded hover:bg-[#00cba1] transition ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              제출
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFaqCreate;
