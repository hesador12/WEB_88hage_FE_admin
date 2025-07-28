'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

const API_BASE_URL = 'https://funfun.cloud';

interface GroupListItem {
  id: number;
  title: string;
  leaderEmail: string;
  createdAt: string;
  status: string;
}

const AdminGroup = () => {
  const [groupData, setGroupData] = useState<GroupListItem[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('전체');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 6;

  const convertStatus = (statusEnum: string | null | undefined): string => {
    switch (statusEnum) {
      case 'RECRUITING': return '모집중';
      case 'FULL': return '모집 마감';
      case 'COMPLETED': return '완료된 모임';
      case 'DELETE': return '삭제된 모임';
      default: return statusEnum ?? '알 수 없음';
    }
  };

  const toApiStatus = (label: string): string | null => {
    switch (label) {
      case '모집중': return 'RECRUITING';
      case '모집 마감': return 'FULL';
      case '완료된 모임': return 'COMPLETED';
      case '삭제된 모임': return 'DELETE';
      case '전체':
      default: return null;
    }
  };

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const status = toApiStatus(selectedFilter);
      const res = await axios.get(`${API_BASE_URL}/api/admin/groups`, {
        params: {
          ...(status ? { status } : {}),
          page: currentPage - 1,
          size: pageSize,
        },
        withCredentials: true,
      });

      const responseData = res.data?.data;
      const content = responseData?.content || [];

      const mapped = content.map((item: any) => ({
        id: item.id,
        title: item.title,
        leaderEmail: item.leaderEmail || '알 수 없음',
        createdAt: item.createdAt?.slice(0, 10),
        status: convertStatus(item.status),
      }));

      setGroupData(mapped);
      setTotalPages(responseData.totalPages || 1);
      setCheckedItems([]);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('❗ AxiosError:', {
          message: error.message,
          code: error.code,
          status: error.response?.status ?? 'No response',
          data: error.response?.data ?? 'No response data',
          url: error.config?.url,
          method: error.config?.method,
        });
      } else {
        console.error('❗ Unknown error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [currentPage, selectedFilter]);

  const handleToggleAll = () => {
    const allChecked = checkedItems.length === groupData.length;
    setCheckedItems(allChecked ? [] : groupData.map(() => true));
  };

  const handleToggleItem = (index: number) => {
    const updated = [...checkedItems];
    updated[index] = !updated[index];
    setCheckedItems(updated);
  };

 const handleDeleteGroups = async () => {
  const selectedGroupIds = groupData
    .filter((_, i) => checkedItems[i])
    .map((group) => group.id);

  if (selectedGroupIds.length === 0) return;

  const confirmDelete = window.confirm(`${selectedGroupIds.length}개 항목을 삭제하시겠습니까?`);
  if (!confirmDelete) return;

  const defaultReason = '관리자에 의해 삭제됨';

  setIsLoading(true);
  try {
    for (const groupId of selectedGroupIds) {
      await axios.delete(`${API_BASE_URL}/api/admin/groups/${groupId}`, {
        params: {
          reason: defaultReason,
        },
        withCredentials: true,
      });
    }

    alert('삭제가 완료되었습니다.');
    fetchGroups();
  } catch (error: any) {
    console.error('❗ 삭제 실패:', error);
    alert('삭제 중 오류가 발생했습니다.');
  } finally {
    setIsLoading(false);
  }
};


  const groupSize = 5;
  const currentGroup = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGroup * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, totalPages);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <AdminLayout title="안녕하세요, 관리자님" subtitle="모임 게시글을 관리해주세요.">
      {/* 필터 영역 */}
      <div className="bg-[#121212] px-8 py-3 relative">
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">{selectedFilter}</div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-4 py-2 bg-[#121212] border border-[#121212] rounded text-sm flex items-center space-x-2"
            >
              <span>필터링</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#121212] border border-[#4D4D4D] rounded z-10">
                {['전체', '모집중', '모집 마감', '완료된 모임', '삭제된 모임'].map((label) => (
                  <div
                    key={label}
                    onClick={() => {
                      setSelectedFilter(label);
                      setCurrentPage(1);
                      setIsFilterOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-white hover:text-[#00E6AE] cursor-pointer"
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="flex-1 px-8 py-6 relative pb-32">
        <div className="bg-transparent rounded-lg">
          <div className="grid grid-cols-[80px_2.2fr_1fr_1fr_1fr] px-12 py-4 border-t border-b border-[#9C9C9C] font-semibold items-center">
            <div className="relative flex justify-center items-center w-full h-full">
              <input
                type="checkbox"
                checked={checkedItems.length === groupData.length && groupData.length > 0}
                onChange={handleToggleAll}
                className="mt-[2px]"
              />
              <button
                type="button"
                disabled={!checkedItems.some((v) => v)}
                onClick={handleDeleteGroups}
                className={`absolute right-0 top-[-1px] transition-colors ${
                  checkedItems.some((v) => v)
                    ? 'text-[#BDBDBD] hover:text-[#1CEBB9]'
                    : 'text-[#4D4D4D] cursor-not-allowed'
                }`}
              >
                <Trash2 size={18} strokeWidth={1.8} />
              </button>
            </div>
            <div className="text-sm text-[#1CEBB9] text-center">제목</div>
            <div className="text-sm text-[#BDBDBD] text-center">작성자</div>
            <div className="text-sm text-[#BDBDBD] text-center">게시일</div>
            <div className="text-sm text-[#BDBDBD] text-center">상태</div>
          </div>

          <div className="divide-y divide-[#2B2B2B]">
            {groupData.length === 0 ? (
              <div className="py-8 text-center text-gray-400">모임 게시글이 없습니다.</div>
            ) : (
              groupData.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[80px_2.2fr_1fr_1fr_1fr] px-12 py-6 items-center">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={checkedItems[index] || false}
                      onChange={() => handleToggleItem(index)}
                    />
                  </div>
                  <div className="text-sm text-white text-center">{item.title}</div>
                  <div className="text-sm text-[#BDBDBD] text-center">{item.leaderEmail}</div>
                  <div className="text-sm text-[#BDBDBD] text-center">{item.createdAt}</div>
                  <div className="text-sm text-[#BDBDBD] text-center">{item.status}</div>
                </div>
              ))
            )}
          </div>
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

export default AdminGroup;
