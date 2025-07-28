'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import logo from '@/assets/images/logo.svg';

const sidebarItems = [
  { label: '모임 관리', path: '/admin/group' },
  { label: '회원 관리', path: '/admin/user' },
  { label: '문의 내역', path: '/admin/contact' },
  { label: 'FAQ', path: '/admin/faq' },
  { label: '신고 내역', path: '/admin/report' },
  { label: '공지사항', path: '/admin/notice' },
];

const AdminSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
   const handleLogoClick = () => {
    router.push('/admin/main');
  };

  return (
    <div className="w-64 bg-[#1A1A1A]">
      <div className="pt-8 pb-6 px-6">
        <Image alt="로고" 
        src={logo} 
        className="mb-6" 
        priority
        onClick={handleLogoClick} />
      </div>
      <nav className="px-6">
        <ul className="space-y-3">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.path;

            return (
              <li key={index}>
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full text-left pl-10 pr-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'text-[#1CEBB9] font-bold'
                        : 'text-[#B0B0B0] hover:text-white hover:scale-[1.02]'
                    }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
