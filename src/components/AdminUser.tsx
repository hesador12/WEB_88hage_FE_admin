'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, SquareCheck, ArrowRightLeft } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'https://funfun.cloud';

type SanctionDisplayLabel = '정상' | '7일 정지' | '30일 정지' | '영구 정지';
const labels: ('전체' | SanctionDisplayLabel)[] = ['전체', '정상', '7일 정지', '30일 정지', '영구 정지'];

const colorMap: Record<SanctionDisplayLabel, string> = {
  '정상': '#88FF8C',
  '7일 정지': '#FFBA88',
  '30일 정지': '#FF8888',
  '영구 정지': '#8A8A8A',
};

const AdminUser = () => {
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [userData, setUserData] = useState<any[]>([]);

  const getStatusLabel = (user: any): SanctionDisplayLabel => {
    if (user.status === 'BANNED') return '영구 정지';
    if (user.status === 'SUSPENDED') {
      if (user.dueDate) {
        const due = new Date(user.dueDate);
        const now = new Date();
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 15) return '30일 정지';
        return '7일 정지';
      }
      return '7일 정지';
    }
    return '정상';
  };

  const pageSize = 7;
  const filteredUsers = selectedFilter === '전체' ? userData : userData.filter((user) => getStatusLabel(user) === selectedFilter);
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const groupSize = 5;
  const currentGroup = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGroup * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, totalPages);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, { credentials: 'include' });
      const data = await res.json();
      if (data.code === '0000') {
        const users = data.data.map((user: any) => ({
          ...user,
          selectedSanction: getStatusLabel(user),
          reason: '',
        }));
        setUserData(users);
      }
    } catch (error) {
      console.error('유저 데이터 불러오기 실패', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const getDuration = (label: string): number => {
    switch (label) {
      case '7일 정지': return 7;
      case '30일 정지': return 30;
      case '영구 정지': return -1;
      default: return 0;
    }
  };

  const handleSanctionChange = (index: number, value: string) => {
    const updated = [...userData];
    updated[index].selectedSanction = value;
    setUserData(updated);
  };

  const handleReasonChange = (index: number, value: string) => {
    const updated = [...userData];
    updated[index].reason = value;
    setUserData(updated);
  };

  const handleSave = async (index: number) => {
    const user = userData[index];
    const duration = getDuration(user.selectedSanction);
    const reason = user.reason || '관리자에 의해 제재됨';

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.email}/suspend?duration=${duration}&reason=${encodeURIComponent(reason)}`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const result = await res.json();
      if (result.code === '0000') {
        toast.success('제재가 저장되었습니다.', {
          icon: () => <span>✅</span>,
          className: 'custom-toast',
          progressClassName: 'custom-progress',
        });
        fetchUserData();
      } else {
        toast.error(result.message || '저장 실패', { autoClose: 2000 });
      }
    } catch (error) {
      console.error('유저 제재 실패', error);
      toast.error('네트워크 오류로 저장에 실패했습니다.', { autoClose: 2000 });
    }
  };

  const handleRandomizeNickname = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${email}/randomize-nickname`, {
        method: 'POST',
        credentials: 'include',
      });
      const result = await res.json();
      if (result.code === '0000') {
        toast.success('닉네임 수정 완료!', {
          icon: () => <span>🎉</span>,
          style: {
          background: '#121212',
          color: '#1CEBB9',
          fontWeight: '600',
          borderRadius: '8px',
          },
        });
        fetchUserData();
      } else {
        toast.error(result.message || '닉네임 변경 실패', { autoClose: 2000 });
      }
    } catch (error) {
      console.error('닉네임 변경 실패', error);
      toast.error('네트워크 오류로 닉네임 변경에 실패했습니다.', { autoClose: 2000 });
    }
  };

  return (
    <AdminLayout title="안녕하세요, 관리자님" subtitle="사용자에 대한 제재 조치를 취해주세요.">
      <ToastContainer
         position="top-right"
         autoClose={3000}
         hideProgressBar={false}
         closeOnClick
         pauseOnFocusLoss
         draggable
         pauseOnHover
         toastClassName="custom-toast"
         progressClassName="custom-progress"
         />

      <div className="bg-[#121212] px-8 pt-3 pb-8">
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">{selectedFilter}</div>
          <div className="relative">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="px-4 py-2 bg-[#121212] border border-[#121212] rounded text-sm flex items-center space-x-2">
              <span>필터링</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#121212] border border-[#4D4D4D] rounded z-10">
                {labels.map((label) => (
                  <div key={label} onClick={() => { setSelectedFilter(label); setCurrentPage(1); setIsFilterOpen(false); }} className="px-4 py-2 text-sm text-white hover:text-[#00E6AE] cursor-pointer flex items-center space-x-2">
                    {label !== '전체' && <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: colorMap[label as SanctionDisplayLabel] }} />}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 pt-6 pb-8">
        <div className="grid grid-cols-6 px-4 py-4 border-t border-b border-[#9C9C9C] font-semibold text-center">
          <div className="text-sm text-[#1CEBB9]">닉네임</div>
          <div className="text-sm text-[#BDBDBD]">이메일</div>
          <div className="text-sm text-[#BDBDBD]">상태</div>
          <div className="text-sm text-[#BDBDBD]">제재</div>
          <div className="text-sm text-[#BDBDBD]">사유</div>
          <div className="text-sm text-[#BDBDBD]">확인</div>
        </div>

        {paginatedUsers.map((user, i) => {
          const currentLabel = getStatusLabel(user);
          const isChanged = currentLabel !== user.selectedSanction;
          const ellipseColor = colorMap[currentLabel as SanctionDisplayLabel];

          return (
            <div key={user.id || i} className="grid grid-cols-6 items-center text-center py-5 border-b border-[#2B2B2B] px-4">
              <div className="text-white text-sm font-medium flex items-center justify-center space-x-2">
                <span>{user.nickname}</span>
                <button onClick={() => handleRandomizeNickname(user.email)} className="hover:text-[#1CEBB9]">
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[#BDBDBD] text-sm">{user.email}</div>
              <div><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: ellipseColor }}></span></div>
              <div>
                <select value={user.selectedSanction} onChange={(e) => handleSanctionChange(i, e.target.value)} className="bg-[#1A1A1A] border-none text-white text-sm rounded px-2 py-1">
                  {['정상', '7일 정지', '30일 정지', '영구 정지'].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <input type="text" value={user.reason} onChange={(e) => handleReasonChange(i, e.target.value)} className="bg-[#1A1A1A] border border-[#4D4D4D] text-white text-sm rounded px-2 py-1 w-full" placeholder="제재 사유 입력" />
              </div>
              <div className="flex justify-center items-center">
                <button onClick={() => isChanged && handleSave(i)} disabled={!isChanged}>
                  <SquareCheck className={`w-5 h-5 cursor-pointer transition-colors duration-150 ${isChanged ? 'text-white hover:text-[#06CE9E]' : 'text-[#555555] cursor-default'}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-10 left-64 right-0 flex items-center justify-center space-x-2 text-white font-bold z-10">
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
    </AdminLayout>
  );
};

export default AdminUser;