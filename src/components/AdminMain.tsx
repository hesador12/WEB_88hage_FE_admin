'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminMain() {
  const greetingOptions = [
    {
      text: '반가워요! 관리자님👀',
      image: '/funfun_admin_sungl.png',
    },
    {
      text: '환영합니다, FUNFUN 소환사님',
      image: '/funfun_admin_tm.png',
    },
    {
      text: '⚠️할일이 많으십니다',
      image: '/funfun_admin_sungl.png',
    },
    {
      text: '관리자님, 힘내주세요💪🏻',
      image: '/funfun_admin_sungl.png',
    },
  ];

  const [greeting, setGreeting] = useState(greetingOptions[0]);

  const MotionLink = motion(Link);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetingOptions.length);
    setGreeting(greetingOptions[randomIndex]);
  }, []);

  return (
    <AdminLayout title="" subtitle="">
      <div className="flex h-full w-full items-center justify-center px-6 pt-2 pb-10 text-white lg:px-0">
        <div className="flex flex-col items-center justify-center scale-110 lg:flex-row">
          
          {/* 캐릭터 이미지 */}
          <motion.div
            className="w-[220px] lg:w-[280px] flex-shrink-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0,
              rotate: greeting.text == '환영합니다, FUNFUN 소환사님' ? 360 : 0,
            }}
            whileHover={{ scale: 1.03, y: -5}}
            whileTap={{ scale: 0.95 }}
            transition={{
               rotate: greeting.text === '환영합니다, FUNFUN 소환사님' ? {
               repeat: Infinity,
               duration: 8,
               ease: 'linear'
             } : undefined,
             stiffness: 300,
             damping: 12,
            }}
          >
            <Image
              src={greeting.image}
              alt="관리자 캐릭터"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: '100%', height: 'auto' }}
            />
          </motion.div>

          {/* 텍스트 & 버튼 */}
          <motion.div
            className="mt-6 flex flex-col items-center justify-center text-center lg:mt-0 lg:ml-0 lg:items-start lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="text-[33px] font-bold leading-snug text-white md:text-[34px]">
              {greeting.text}
            </div>
            <p className="mt-2 mb-3 text-base text-[#BDBDBD] leading-relaxed">
              FUNFUN 서비스의 전반을 관리해주세요.
              <br />
              오늘도 fun-fun한 하루 되세요 ✨
            </p>
            <MotionLink
              href="https://funfun.cloud"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-[#1CEBB9] mt-6 rounded-2xl px-4 py-2 text-sm font-semibold text-black hover:brightness-110 transition"
            >
              FUNFUN 메인 페이지로 이동
            </MotionLink>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
