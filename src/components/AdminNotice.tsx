'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import NoticeModal from '@/components/AdminNoticeModal';

const API_BASE_URL = 'https://funfun.cloud';

type Notice = {
  id: number;
  title: string;
  content: string;
  createdAt: string | null;
};

const pageSize = 7;

const AdminNotice = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/notices`, {
  withCredentials: true, 
  params: {
    page: currentPage - 1,
    size: pageSize,
    sort: 'createdAt,desc',
  },
});

        const data = res.data?.data;
        setNotices(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (error) {
        console.error('공지사항 불러오기 실패:', error);
      }
    };

    fetchNotices();
  }, [currentPage]);

  const groupSize = 5;
  const currentGroup = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGroup * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, totalPages);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <AdminLayout title="안녕하세요, 관리자님" subtitle="공지사항을 등록하고 모든 사용자에게 알림을 발송하세요.">
      {/* 등록하기 버튼 */}
      <div className="flex justify-end px-8 pt-4">
        <button
          onClick={() => router.push('/admin/notice/create')}
          className="text-sm text-white bg-[#2B2B2B] px-4 py-2 rounded hover:bg-[#3A3A3A] hover:text-[#1CEBB9] transition mr-8"
        >
          등록하기
        </button>
      </div>

      {/* 테이블 */}
      <div className="flex-1 px-8 py-6 relative pb-32">
        <div className="bg-transparent rounded-lg">
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-3 px-16 py-4 border-t border-b border-[#9C9C9C] font-semibold items-center text-sm">
            <div className="text-[#BDBDBD] text-center">제목</div>
            <div className="text-[#1CEBB9] text-center">상세 내용</div>
            <div className="text-[#BDBDBD] text-center">공지일</div>
          </div>

          {/* 테이블 바디 */}
          {notices.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-3 px-16 py-6 items-center text-sm cursor-pointer hover:bg-[#2C2C2C] transition"
              onClick={() => {
                setSelectedNotice(item);
                setIsModalOpen(true);
              }}
            >
              <div className="text-white text-center">{item.title}</div>
              <div className="text-[#BDBDBD] text-center">
                {item.content.length > 40 ? item.content.slice(0, 40) + '...' : item.content}
              </div>
              <div className="text-[#BDBDBD] text-center">
                {item.createdAt ? format(new Date(item.createdAt), 'yyyy.MM.dd') : '-'}
              </div>
            </div>
          ))}
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

        {/* 모달 */}
        {selectedNotice && isModalOpen && (
          <NoticeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={selectedNotice.title}
            content={selectedNotice.content}
            createdAt={selectedNotice.createdAt ? format(new Date(selectedNotice.createdAt), 'yyyy.MM.dd') : '-'}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotice;
