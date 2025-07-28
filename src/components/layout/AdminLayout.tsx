// components/Layout/AdminLayout.tsx

'use client';
import React, { useState } from 'react';
import Sidebar from '@/components/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const [selectedCategory, setSelectedCategory] = useState('신고 내역');

  return (
    <div className="flex h-screen bg-[#121212] text-[#B0B0B0] font-pretendard">
      {/* 사이드바 */}
      <Sidebar/>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col bg-[#121212]">
       {/* 헤더 */}
<header className="bg-[#121212] px-8 pt-12 pb-6">
  {title && (
    <div className="flex items-end mb-2">
      <h1 className="h1 text-gray-1 mr-1">{title}</h1>
      {/* 👋🏻는 title이 있을 때만 렌더링*/}
      <span className="text-white text-[32px] mr-2">👋🏻</span>
      {subtitle && (
        <span className="t4 text-gray-2 ml-4">{subtitle}</span>
      )}
    </div>
  )}
</header>

        {/* 본문 */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
