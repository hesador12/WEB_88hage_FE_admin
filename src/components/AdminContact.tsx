'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'https://funfun.cloud';

type ContactItem = {
  id: number;
  title: string;
  writerEmail: string;
  createdAt: string;
  status: 'PENDING' | 'COMPLETE';
};

type ContactDetailResponse = {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  answer: string;
  answeredAt: string;
  createdAt: string;
  imageUrls: string[];
};

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

const AdminContact = () => {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [contactData, setContactData] = useState<ContactItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactDetailResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const pageSize = 6;

  const toApiStatus = (label: string) => {
    switch (label) {
      case '대기중': return 'pending';
      case '완료': return 'complete';
      default: return 'all';
    }
  };

  useEffect(() => {
    const fetchContacts = async () => {
  setIsLoading(true);
  try {
    const status = toApiStatus(selectedFilter);
    const queryParams = new URLSearchParams();

    if (status !== 'all') {
      queryParams.append('status', status);
    }

    queryParams.append('page', String(currentPage - 1));
    queryParams.append('size', String(pageSize));
    queryParams.append('sort', 'createdAt,desc');

        const res = await fetch(`${API_BASE_URL}/api/admin/contacts?${queryParams.toString()}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (json.code === '0000') {
          setContactData(json.data.content);
          setTotalPages(json.data.totalPages);
        } else {
          console.error('API 응답 실패:', json.message);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [selectedFilter, currentPage]);

  const openDetailModal = async (contactId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/contacts/${contactId}`, {
        credentials: 'include',
      });
      const json = await res.json();

      if (json.code === '0000') {
        const detail = json.data;
        if (detail.answer) {
          setSelectedContact(detail);
          setIsModalOpen(true);
        } else {
          router.push(`/admin/contact/${contactId}/answer`);
        }
      } else {
        console.error('문의 상세 조회 실패:', json.message);
      }
    } catch (error) {
      console.error('상세 API 호출 에러:', error);
    }
  };

  const groupSize = 5;
  const currentGroup = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGroup * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, totalPages);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <AdminLayout title="안녕하세요, 관리자님" subtitle="사용자의 일반 문의에 대한 답변을 등록해주세요.">
      <div className="bg-[#121212] px-8 py-3 relative">
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">{selectedFilter}</div>
          <div className="relative">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="px-4 py-2 bg-[#121212] border border-[#121212] rounded text-sm flex items-center space-x-2">
              <span>필터링</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#121212] border border-[#4D4D4D] rounded z-10">
                {['전체', '대기중', '완료'].map((label) => (
                  <div key={label} onClick={() => { setSelectedFilter(label); setCurrentPage(1); setIsFilterOpen(false); }} className="px-4 py-2 text-sm text-white hover:text-[#00E6AE] cursor-pointer flex items-center space-x-2">
                    {label === '대기중' && <span className="inline-block w-3 h-3 rounded-full bg-[#FF8888]"></span>}
                    {label === '완료' && <span className="inline-block w-3 h-3 rounded-full bg-[#88FF8C]"></span>}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 relative pb-32">
        <div className="bg-transparent rounded-lg">
          <div className="grid grid-cols-5 gap-4 px-16 py-4 border-t border-b border-[#9C9C9C] font-semibold">
            <div className="text-sm text-[#1CEBB9] text-center">제목</div>
            <div className="text-sm text-[#BDBDBD] text-center">작성자</div>
            <div className="text-sm text-[#BDBDBD] text-center">등록일</div>
            <div className="text-sm text-[#BDBDBD] text-center">상태</div>
            <div className="text-sm text-[#BDBDBD] text-center">액션</div>
          </div>

          <div className="divide-y divide-[#2B2B2B]">
            {isLoading ? (
              <div className="text-center py-6 text-white">불러오는 중...</div>
            ) : contactData.length === 0 ? (
              <div className="text-center py-6 text-white">문의 내역이 없습니다.</div>
            ) : (
              contactData.map((item) => (
                <div key={item.id} className="grid grid-cols-5 gap-4 px-16 py-6 text-center items-center">
                  <div className="text-sm text-white font-semibold">{item.title}</div>
                  <div className="text-sm text-[#BDBDBD]">{item.writerEmail ?? 'N/A'}</div>
                  <div className="text-sm text-[#BDBDBD]">{item.createdAt.split('T')[0]}</div>
                  <div>
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: item.status === 'COMPLETE' ? '#88FF8C' : '#FF8888' }} />
                  </div>
                  <div>
                    <button
                      onClick={() => openDetailModal(item.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-[#292929] hover:bg-[#3a3a3a] hover:scale-105 ${item.status === 'COMPLETE' ? 'text-[#BBBBBB]' : 'text-[#00E6AE]'}`}
                    >
                      {item.status === 'COMPLETE' ? '답변 완료' : '답변 등록'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="fixed bottom-10 left-64 right-0 flex justify-center items-center space-x-2 text-white font-bold">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {visiblePages.map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors duration-200 font-bold ${currentPage === page ? 'bg-[#1CEBB9] text-[#121212]' : 'text-white hover:bg-[#1CEBB9] hover:text-[#121212]'}`}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 hover:bg-gray-700 rounded transition-colors disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isModalOpen && selectedContact && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="bg-[#1A1A1A] w-full max-w-5xl min-h-[600px] rounded-2xl p-10 flex flex-col justify-between border border-[#2D2D2D] shadow-2xl">
              <h2 className="text-2xl font-bold text-[#00E6AE] mb-6 pb-2 border-b border-white/20">문의 상세</h2>
              <div className="flex flex-col md:flex-row gap-8 flex-1 text-sm text-[#BDBDBD] overflow-y-auto">
                <div className="flex-1 space-y-3 pl-8">
                  <div><strong className="text-white">제목:</strong> {selectedContact.title}</div>
                  <div><strong className="text-white">작성일:</strong> {selectedContact.createdAt.split('T')[0]}</div>
                  <div><strong className="text-white">카테고리:</strong> {categoryToKorean(selectedContact.category)}</div>
                  <div><strong className="text-white">문의 내용:</strong><br /> {selectedContact.content}</div>
                  {selectedContact.imageUrls.length > 0 && (
                    <div>
                      <strong className="text-white">첨부 이미지:</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedContact.imageUrls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`첨부 이미지 ${idx + 1}`}
                            className="w-28 h-28 object-cover rounded border border-[#3A3A3A] cursor-pointer"
                            onClick={() => setZoomedImage(url)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <strong className="text-white block">답변 내용</strong>
                  <div className="bg-[#2B2B2B] p-4 rounded-lg text-white whitespace-pre-wrap min-h-[150px]">
                    {selectedContact.answer || '답변이 없습니다.'}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-6">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-sm text-white bg-gray-600 hover:bg-gray-500 rounded">
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {zoomedImage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <button onClick={() => setZoomedImage(null)} className="absolute top-5 right-5 text-white hover:text-gray-300">
              <X size={32} />
            </button>
            <img src={zoomedImage} alt="확대 이미지" className="max-w-[90vw] max-h-[90vh] rounded-lg" />
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminContact;