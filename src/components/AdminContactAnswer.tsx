'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import AdminLayout from '@/components/layout/AdminLayout';

const API_BASE_URL = 'https://funfun.cloud';

const categoryToKorean = (category: string) => {
  switch (category) {
    case 'GENERAL':
      return '일반 문의';
    case 'REPORT':
      return '신고 문의';
    default:
      return category;
  }
};

const AdminContactAnswerPage = () => {
  const router = useRouter();
  const params = useParams();
  const contactId = params?.contactId as string;

  const [contact, setContact] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

useEffect(() => {
  if (!contactId) return;

  const fetchContact = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/contacts/${contactId}`, {
        withCredentials: true,
      });
      setContact(res.data.data);
    } catch (error) {
      console.error('문의 조회 실패:', error);
      if (axios.isAxiosError(error)) {
        console.log('서버 응답 상태코드:', error.response?.status);
        console.log('서버 응답 내용:', error.response?.data);
      }
      alert('문의 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  fetchContact();
}, [contactId]);

const handleSubmit = async () => {
  if (!answer.trim()) {
    alert('답변 내용을 입력해주세요.');
    return;
  }

  setIsSubmitting(true);
  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/admin/contacts/${contactId}/answer`,
      { answer },
      { withCredentials: true }
    );

    if (res.status === 200) {
      alert('답변이 성공적으로 등록되었습니다.');
      router.push('/admin/contact');
    } else {
      alert('답변 등록에 실패했습니다. 다시 시도해주세요.');
    }
  } catch (error) {
    console.error('답변 등록 실패:', error);
    if (axios.isAxiosError(error)) {
      console.log('서버 응답 상태코드:', error.response?.status);
      console.log('서버 응답 내용:', error.response?.data);
    }
    alert('등록 중 오류가 발생했습니다.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <AdminLayout
      title="문의 답변 등록"
      subtitle="사용자의 문의 내역에 대한 답변을 등록해주세요."
    >
      <div className="px-12 py-6 text-white">
        <div className="space-y-8 w-full">
          {contact ? (
            <>
              {/* 제목 및 정보 */}
              <div className="space-y-2">
                <div className="text-2xl font-semibold break-words">
                  <span className="text-[#1CEBB9]">{contact.title}</span>
                </div>
              <div className="flex flex-col sm:flex-row sm:space-x-12 text-sm text-[#BDBDBD] mb-4">
                  <div>
                    <strong className="text-white">문의 유형 | </strong>
                      {categoryToKorean(contact.category)}
                        </div>
                          <div>
                            <strong className="text-white">작성일 | </strong>
                              {contact.createdAt?.split('T')[0]}
                               </div>
                             </div>
              {/* 구분선 */}
              <hr className="border-t border-white/20 mb-0" />

              {/* 문의 내용 */}
              <div className="pt-2">
              <label className="text-[#1CEBB9] font-bold text-sm block mb-1">내용</label>
              <div className="whitespace-pre-line text-sm text-[#E0E0E0] leading-relaxed">
              {contact.content}
               </div>
              </div>
            </div>
            {/* 첨부 이미지 */}
            {contact.imageUrls?.length > 0 && (
             <div>
              <label className="text-[#1CEBB9] font-bold text-sm block mb-2">첨부 이미지</label>
               <div className="flex flex-wrap gap-4">
                {contact.imageUrls.map((url: string, idx: number) => (
                 <img
                   key={idx}
                   src={url}
                   alt={`첨부 이미지 ${idx + 1}`}
                   className="w-32 h-32 object-cover rounded border border-[#3A3A3A]"
                    />
                  ))}
                </div>
              </div>
            )}

              {/* 답변 작성 */}
               <div>
                <label className="text-[#1CEBB9] font-bold text-sm block mb-2">답변</label>
                 <textarea
                    rows={10}
                    className="w-full bg-[#1C1C1C] border border-[#3A3A3A] text-sm rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1CEBB9] resize-none"
                    placeholder="질문에 대한 답변을 입력해주세요."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
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
            </>
          ) : (
            <p className="text-gray-400">문의 정보를 불러오는 중입니다...</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminContactAnswerPage;
