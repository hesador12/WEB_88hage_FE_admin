'use client';

import { useForm } from 'react-hook-form';
import GrayButton from '@/components/button/GrayButton';
import Input from '@/components/common/Input';
import logo from '@/assets/images/logo.svg';
import loginBgImg from '@/assets/images/loginBgImg.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/UseAuthStore';
import { LoginRequest } from '@/types/auth';
import axios from 'axios';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();
  const router = useRouter();
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      router.push('/admin/main');
    }
  }, [user, router]);

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      const response = await axios.post('https://funfun.cloud/api/auth/login', {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('로그인 성공:', response.data);
      
      
      // 관리자 페이지로 이동
      router.push('http://localhost:3001/admin');
      
    } catch (error) {
      console.error('로그인 실패:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || '로그인에 실패했습니다.';
        setLoginError(errorMessage);
      } else {
        setLoginError('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen">
      {/* 왼쪽(데스크탑 뷰): 배경  */}
      <div className="hidden w-1/2 bg-black lg:flex lg:items-center lg:justify-center">
        <Image
          alt="로고"
          src={logo}
          className="top-[30px] left-[40px] mb-5 hidden lg:absolute lg:block"
          priority
        />
        <Image
          alt="로그인 이미지"
          src={loginBgImg}
          className="hidden lg:block"
          width={500}
          height={500}
          priority
        />
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="bg-gray-7 flex w-full flex-col items-center justify-center px-[20px] lg:w-1/2 lg:px-[150px]">
        <div className="w-full min-w-[335px] space-y-4">
          {/* 관리자 로그인 제목 추가 */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">관리자 로그인</h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 lg:space-y-7"
          >
            <Input
              placeholder="이메일을 입력 해주세요"
              {...register('email', { required: '이메일을 입력해주세요' })}
              className="h-[60px] w-full rounded-[5px] lg:h-[80px] lg:rounded-[10px]"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}

            <Input
              type="password"
              placeholder="비밀번호를 입력 해주세요"
              {...register('password', {
                required: '비밀번호를 입력해주세요',
              })}
              className="h-[60px] w-full rounded-[5px] lg:h-[80px] lg:rounded-[10px]"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="t4 mt-[-10px] mb-3 text-red-500">
                {errors.password.message}
              </p>
            )}

            <GrayButton
              type="submit"
              className="bg-gray-5 h-[60px] w-full rounded-[5px] text-white lg:h-[80px] lg:rounded-[10px]"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </GrayButton>

            {loginError && (
              <p className="t4 py-2 text-center text-red-500">{loginError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}