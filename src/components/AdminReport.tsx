'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type AdminReportViewDTO = {
  id: number;
  sourceType: 'BUTTON_REPORT' | 'CONTACT_REPORT';
  reason: string;
  reportedAt: string;
  resolved: boolean;
  reportingUserEmail?: string;
  reportedUserEmail?: string;
};

const AdminReport = () => {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'전체' | '미처리' | '처리 완료'>('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<AdminReportViewDTO[]>([]);
  const [selectedReport, setSelectedReport] = useState<AdminReportViewDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [takeAction, setTakeAction] = useState(false);
  const [suspendDays, setSuspendDays] = useState(1);

  const pageSize = 6;

  const sourceTypeLabel = (type: string) => {
    switch (type) {
      case 'BUTTON_REPORT':
        return '채팅 / 게시글 신고';
      case 'CONTACT_REPORT':
        return '문의형 신고';
      default:
        return '기타 신고';
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

 const fetchReports = async () => {
  try {
    const statusParam =
      selectedFilter === '전체'
        ? 'all'
        : selectedFilter === '처리 완료'
        ? 'resolved'
        : 'unresolved';

    const res = await axios.get('https://funfun.cloud/api/admin/reports', {
      params: { status: statusParam },
      withCredentials: true,
    });

    const data: AdminReportViewDTO[] = res.data.data;
    setReports(data);
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      alert('관리자 로그인이 필요합니다.');
      router.push('/');
    } else {
      console.error('신고 내역 조회 실패:', error);
    }
  }
};


  const handleSubmitReport = async () => {
    if (!selectedReport) return;

    try {
      const body = {
        takeAction,
        suspendDays,
        adminComment,
      };

      await axios.patch(
        `https://funfun.cloud/api/admin/reports/${selectedReport.id}`,
        body,
        { withCredentials: true }
      );

      setIsModalOpen(false);
      setSelectedReport(null);
      setAdminComment('');
      setTakeAction(false);
      setSuspendDays(1);
      fetchReports();
    } catch (error) {
      console.error('신고 처리 실패:', error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedFilter]);

  const totalPages = Math.ceil(reports.length / pageSize);
  const paginatedData = reports.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const groupSize = 5;
  const currentGroup = Math.floor((currentPage - 1) / groupSize);
  const startPage = currentGroup * groupSize + 1;
  const endPage = Math.min(startPage + groupSize - 1, totalPages);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <AdminLayout title="안녕하세요, 관리자님" subtitle="사용자의 신고 내역을 확인하고 처리해주세요.">
      <div className="bg-[#121212] px-8 py-3 relative">
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">{selectedFilter}</div>
          <div className="flex items-center space-x-4">
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
                  {['전체', '미처리', '처리 완료'].map((label) => (
                    <div
                      key={label}
                      onClick={() => {
                        setSelectedFilter(label as any);
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
      </div>

      <div className="flex-1 px-8 py-6 relative pb-32">
        <div className="bg-transparent rounded-lg">
 {/* 테이블 헤더 */}
<div className="grid grid-cols-4 gap-4 px-6 py-4 border-t border-b border-[#9C9C9C] font-semibold">
  <div className="text-sm text-[#BDBDBD] flex justify-center items-center">신고 유형</div>
  <div className="text-sm text-[#1CEBB9] flex justify-center items-center">상세 내용</div>
  <div className="text-sm text-[#BDBDBD] flex justify-center items-center">제출일</div>
  <div className="text-sm text-[#BDBDBD] flex justify-center items-center">액션</div>
</div>

{/* 테이블 바디 */}
<div className="divide-y divide-[#2B2B2B]">
  {paginatedData.map((item, index) => (
  <div key={`${item.id}-${item.reportedAt}-${index}`} className="grid grid-cols-4 gap-4 px-6 py-6">
      <div className="text-sm text-[#BDBDBD] font-normal flex items-center justify-center">
        {sourceTypeLabel(item.sourceType)}
      </div>
      <div className="text-sm text-white font-semibold flex items-center justify-center">
        {item.reason}
      </div>
      <div className="text-sm text-[#BDBDBD] font-normal flex items-center justify-center">
        {formatDate(item.reportedAt)}
      </div>
      <div className="text-sm flex items-center justify-center">
        <button
          disabled={item.resolved}
          onClick={() => {
            setSelectedReport(item);
            setAdminComment('');
            setTakeAction(false);
            setSuspendDays(1);
            setIsModalOpen(true);
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium bg-[#292929] transition-all duration-200 ${
            item.resolved
              ? 'text-[#717171] cursor-not-allowed'
              : 'text-[#00E6AE] hover:bg-[#3a3a3a] hover:scale-105'
          }`}
        >
          {item.resolved ? '처리 완료' : '신고 처리'}
        </button>
      </div>
    </div>
  ))}
</div>

</div>

 <div className="fixed bottom-10 left-64 right-0 flex justify-center items-center space-x-2 text-white font-bold">
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

        {/* 신고 처리 모달 */}
        {isModalOpen && selectedReport && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 px-4">
    <div className="bg-[#1A1A1A] max-w-2xl w-full rounded-2xl p-8 space-y-6 border border-[#2D2D2D] shadow-2xl">
     <h2 className="text-xl font-bold text-[#00E6AE]">
  신고 처리
</h2>
      <div className="flex flex-col md:flex-row gap-6">
        {/* 신고 정보 */}
        <div className="flex-1 space-y-2 text-sm text-[#BDBDBD]">
          <p><strong>신고 유형:</strong> {sourceTypeLabel(selectedReport.sourceType)}</p>
          <p><strong>내용:</strong> {selectedReport.reason}</p>
          <p><strong>신고일자:</strong> {formatDate(selectedReport.reportedAt)}</p>
          {selectedReport.sourceType === 'BUTTON_REPORT' && (
            <>
              <p><strong>신고자:</strong> {selectedReport.reportingUserEmail}</p>
              <p><strong>피신고자:</strong> {selectedReport.reportedUserEmail}</p>
            </>
          )}
        </div>

        {/* 관리자 처리 영역 */}
        <div className="flex-1 space-y-4">
          <textarea
            className="w-full p-3 text-sm bg-[#2B2B2B] text-white rounded-lg"
            rows={5}
            placeholder={`관리자 코멘트를 입력해주세요.\n문의형 신고의 경우 답변으로 등록됩니다.`}
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
          />
          {selectedReport.sourceType === 'BUTTON_REPORT' && (
            <div className="space-y-2">
              <label className="flex items-center text-sm text-white space-x-2">
                <input
                  type="checkbox"
                  checked={takeAction}
                  onChange={(e) => setTakeAction(e.target.checked)}
                />
                <span>신고된 사용자에게 조치 취하기</span>
              </label>
              {takeAction && (
                <select
                  className="w-full p-2 text-sm bg-[#2B2B2B] text-white rounded"
                  value={suspendDays}
                  onChange={(e) => setSuspendDays(Number(e.target.value))}
                >
                  <option value={7}>7일 정지</option>
                  <option value={30}>30일 정지</option>
                  <option value={-1}>영구 정지</option>
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-5 py-2 text-sm text-white bg-[#3A3A3A] hover:bg-[#555] rounded-lg"
        >
          닫기
        </button>
        <button
          onClick={handleSubmitReport}
          disabled={!adminComment.trim()}
          className={`px-5 py-2 text-sm rounded-lg font-semibold transition-colors ${
           adminComment.trim()
            ? 'bg-[#00E6AE] hover:bg-[#00d9a3] text-black cursor-pointer'
            : 'bg-[#2D2D2D] text-[#888888] cursor-not-allowed'
             }`}
          >
           처리 완료
          </button>
      </div>
    </div>
  </div>
)}
      </div>
    </AdminLayout>
  );
};

export default AdminReport;
