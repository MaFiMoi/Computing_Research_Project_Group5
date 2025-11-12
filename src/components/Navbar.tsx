"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeChanger from "./DarkSwitch";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient"; // Import Supabase client
import { User } from "@supabase/supabase-js"; // Import kiểu User

// --- TẠO CÁC ICON SVG ĐƠN GIẢN ---
// Icon cho Avatar (Hình người)
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path
      fillRule="evenodd"
      d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      clipRule="evenodd"
    />
  </svg>
);

// Icon Quản lý tài khoản
const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

// Icon Đăng xuất
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3-6-3-3m0 0-3 3m3-3v12"
    />
  </svg>
);
// --- KẾT THÚC ICON ---

export const Navbar = () => {
  const navigation = [
    { name: "Home", href: "/" },
    { name: "News", href: "/news" },
    { name: "Security Manual", href: "/manual" },
    { name: "FAQ", href: "/faq" },
  ];

  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect để kiểm tra session khi component tải
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    checkSession();

    // Lắng nghe sự thay đổi trạng thái auth (đăng nhập, đăng xuất)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Hủy lắng nghe khi component unmount
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login"); // Chuyển về trang đăng nhập
    router.refresh(); // Làm mới trang để đảm bảo server biết đã đăng xuất
  };

  return (
    <div className="w-full">
      <nav className="container relative flex flex-wrap items-center justify-between p-8 mx-auto lg:justify-between xl:px-1">
        {/* Logo */}
        <Link href="/">
          <span className="flex items-center space-x-2 text-2xl font-medium text-indigo-500 dark:text-gray-100">
            <span>
              <Image
                src="/img/s.jpg"
                width="32"
                alt="N"
                height="32"
                className="w-8"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/32x32/6366F1/FFFFFF?text=S";
                }}
              />
            </span>
            <span>Scam Shield</span>
          </span>
        </Link>

        {/* Nút CTA (Desktop) và Nút chuyển DarkMode */}
        <div className="gap-3 nav__item mr-2 lg:flex ml-auto lg:ml-0 lg:order-2">
          <ThemeChanger />
          <div className="hidden mr-3 lg:flex nav__item items-center">
            
            {/* --- LOGIC HIỂN THỊ ĐĂNG NHẬP / AVATAR (DESKTOP) --- */}
            {isLoading ? (
              // Hiển thị khung chờ
              <div className="w-20 h-8 bg-gray-200 rounded-md dark:bg-gray-700 animate-pulse"></div>
            ) : !user ? (
              // Trạng thái ĐÃ ĐĂNG XUẤT
              <Link
                href="/login"
                className="inline-block px-4 py-2 text-lg font-normal text-gray-800 no-underline rounded-md dark:text-gray-200 hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
              >
                SIGN IN
              </Link>
            ) : (
              // Trạng thái ĐÃ ĐĂNG NHẬP
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex text-sm bg-gray-200 rounded-full w-10 h-10 items-center justify-center text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 dark:hover:ring-offset-gray-800">
                    <span className="sr-only">Open user menu</span>
                    <UserIcon />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-600">
                    <div className="py-1">
                      {/* Tùy chọn: Hiển thị email user */}
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                        <span className="block text-xs">Đăng nhập với</span>
                        <span className="block font-medium truncate">{user.email}</span>
                      </div>
                      
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile" // Cập nhật đường dẫn đến trang profile của bạn
                            className={`${
                              active ? "bg-gray-100 dark:bg-gray-700" : ""
                            } group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                          >
                            <ProfileIcon />
                            Quản lý tài khoản
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? "bg-gray-100 dark:bg-gray-700" : ""
                            } group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                          >
                            <LogoutIcon />
                            Đăng xuất
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {/* Nút Report (Desktop) */}
            <Link
              href="/report" // Đường dẫn cho nút Report
              className="px-6 py-2 text-white bg-indigo-600 rounded-md md:ml-5"
            >
              REPORT
            </Link>
          </div>
        </div>

        {/* Nút menu mobile */}
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button
                aria-label="Toggle Menu"
                className="px-2 py-1 text-gray-500 rounded-md lg:hidden hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 focus:outline-none dark:text-gray-300 dark:focus:bg-trueGray-700"
              >
                <svg
                  className="w-6 h-6 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  {open && (
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                    />
                  )}
                  {!open && (
                    <path
                      fillRule="evenodd"
                      d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                    />
                  )}
                </svg>
              </Disclosure.Button>

              {/* Panel menu mobile */}
              <Disclosure.Panel className="flex flex-wrap w-full my-5 lg:hidden">
                <>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="w-full px-4 py-2 -ml-4 text-gray-500 rounded-md dark:text-gray-300 hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                    >
                      {item.name}
                    </Link>
                  ))}

                  <div className="w-full mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                  {/* --- LOGIC HIỂN THỊ ĐĂNG NHẬP / AVATAR (MOBILE) --- */}
                  {isLoading ? (
                    <div className="w-full h-8 bg-gray-200 rounded-md dark:bg-gray-700 animate-pulse"></div>
                  ) : !user ? (
                    // Trạng thái ĐÃ ĐĂNG XUẤT (Mobile)
                    <Link
                      href="/login"
                      className="w-full px-4 py-2 -ml-4 text-gray-500 rounded-md dark:text-gray-300 hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                    >
                      Đăng nhập
                    </Link>
                  ) : (
                    // Trạng thái ĐÃ ĐĂNG NHẬP (Mobile)
                    <>
                      <Link
                        href="/profile" // Cập nhật đường dẫn
                        className="w-full flex items-center px-4 py-2 -ml-4 text-gray-500 rounded-md dark:text-gray-300 hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                      >
                        <ProfileIcon />
                        Quản lý tài khoản
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 -ml-4 text-gray-500 rounded-md dark:text-gray-300 hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                      >
                        <LogoutIcon />
                        Đăng xuất
                      </button>
                    </>
                  )}
                  </div>
                  
                  <Link
                    href="/report" // Đường dẫn cho nút Report
                    className="w-full px-6 py-2 mt-3 text-center text-white bg-indigo-600 rounded-md lg:ml-5"
                  >
                    REPORT
                  </Link>
                </>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Menu (Desktop) */}
        <div className="hidden text-center lg:flex lg:items-center">
          <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
            {navigation.map((menu) => (
              <li className="mr-3 nav__item" key={menu.name}>
                <Link
                  href={menu.href}
                  className="inline-block px-4 py-2 text-lg font-normal text-gray-800 no-underline rounded-md dark:text-gray-200 hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
                >
                  {menu.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};