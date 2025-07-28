'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import FaqModal from '@/components/AdminFaqModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FaqDTO {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const AdminFaq = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const created = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('created')
  : null;


  const [faqData, setFaqData] = useState<FaqDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFaq, setSelectedFaq] = useState<FaqDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageSize = 6;
  const API_BASE_URL = 'https://funfun.cloud';

  useEffect(() => {
    if (created === '1') {
      toast.success('FAQ 등록 완료!', {
        icon: () => <span>🎉</span>,
        style: {
          background: '#121212',
          color: '#1CEBB9',
          fontWeight: '600',
          borderRadius: '8px',
        }
      });

      // URL 쿼리 제거 (다시 뜨지 않게)
      const url = new URL(window.location.href);
      url.searchParams.delete('created');
      window.history.replaceState({}, '', url.toString());
    }
  }, [created]);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/faqs`);
      const sortedData = res.data.data.sort(
        (a: FaqDTO, b: FaqDTO) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setFaqData(sortedData);
    } catch (err) {
      console.error('FAQ 불러오기 실패:', err);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('정말로 이 FAQ를 삭제하시겠습니까?\n삭제 후 되돌릴 수 없습니다.');
    if (!confirmDelete) return;
    await axios.delete(`${API_BASE_URL}/api/faqs/${id}`);
      setFaqData(prev => prev.filter(faq => faq.id !== id));
      toast.success('삭제 완료 !', {
      icon: () => <span>🗑️</span>,
      style: {
          background: '#121212',
          color: '#1CEBB9',
          fontWeight: '600',
          borderRadius: '8px',
          },
       });
     };

  const handleViewDetail = async (id: number) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/faqs/${id}`);
      setSelectedFaq(res.data.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('FAQ 상세조회 실패:', err);
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toISOString().slice(0, 10).replace(/-/g, '.');
  };

  const totalPages = Math.ceil(faqData.length / pageSize);
  const paginatedData = faqData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const groupSize = 5;
  const currentGroup = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGroup * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, totalPages);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <AdminLayout title="안녕하세요, 관리자님" subtitle="사용자의 자주 묻는 질문에 대한 FAQ를 등록해주세요.">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="flex justify-end px-8 pt-4">
        <button
          onClick={() => router.push('/admin/faq/create')}
          className="text-sm text-white bg-[#2B2B2B] px-4 py-2 rounded hover:bg-[#3A3A3A] hover:text-[#1CEBB9] transition mr-8"
        >
          등록하기
        </button>
      </div>

      <div className="flex-1 px-8 py-6 relative pb-32">
        <div className="bg-transparent rounded-lg">
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-[1.3fr_1fr_0.7fr] gap-2 px-2 py-4 border-t border-b border-[#9C9C9C] font-semibold">
            <div className="text-sm text-[#1CEBB9] text-center">제목</div>
            <div className="text-sm text-[#BDBDBD] text-center">게시일</div>
            <div className="text-sm text-[#BDBDBD] text-center">삭제</div>
          </div>

          {/* 테이블 바디 */}
          <div className="divide-y divide-[#2B2B2B]">
            {paginatedData.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.3fr_1fr_0.7fr] gap-2 px-2 py-6 items-center cursor-pointer hover:bg-[#2f2f2f] transition"
                onClick={() => handleViewDetail(item.id)}
              >
                <div className="text-sm text-white text-center">{item.title}</div>
                <div className="text-sm text-[#BDBDBD] text-center">{formatDate(item.createdAt)}</div>
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <Trash2
                    size={18}
                    strokeWidth={1.8}
                    className="text-[#BDBDBD] hover:text-[#1CEBB9] cursor-pointer transition-colors"
                    onClick={() => handleDelete(item.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          {selectedFaq && (
            <FaqModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              id={selectedFaq.id}
              title={selectedFaq.title}
              content={selectedFaq.content}
              createdAt={formatDate(selectedFaq.createdAt)}
              onUpdateSuccess={(success) => {
                if (success) {
                  fetchFaqs();
                  toast.success('수정 완료!', {
                    icon: () => <span>🎉</span>,
                    style: {
                      background: '#121212',
                      color: '#1CEBB9',
                      fontWeight: '600',
                      borderRadius: '8px',
                    },
                  });
                } else {
                  toast.error('FAQ 수정에 실패했습니다.');
                }
                setIsModalOpen(false);
              }}
            />
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="fixed bottom-10 left-64 right-0 flex items-center justify-center space-x-2 text-white font-bold z-10">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors duration-200 font-bold ${
                currentPage === page
                  ? 'bg-[#1CEBB9] text-[#121212]'
                  : 'text-white hover:bg-[#1CEBB9] hover:text-[#121212]'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFaq;
