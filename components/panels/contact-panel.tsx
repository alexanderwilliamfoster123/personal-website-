// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import AppleKeyboard from "@/components/apple-keyboard";
// import { useTheme } from "@/components/theme-provider";
// import {
//   FiSend,
//   FiFolder,
//   FiFeather,
//   FiCamera,
//   FiSearch,
//   FiWifi,
//   FiCheck,
// } from "react-icons/fi";
// import { FaApple } from "react-icons/fa6";
// import { SendHorizonal } from "lucide-react";
// import { UserSession } from "@/lib/auth";
// import { TabId } from "@/components/bottom-navigation";

// interface ContactPanelProps {
//   session: UserSession | null;
//   signOut: () => void;
//   onNavigateTab?: (tab: TabId) => void;
// }

// export default function ContactPanel({ session, signOut, onNavigateTab }: ContactPanelProps) {
//   const { theme } = useTheme();
//   const isDark = theme === "dark";
//   const [message, setMessage] = useState("");
//   const [isSent, setIsSent] = useState(false);
//   const [currentTime, setCurrentTime] = useState("");
//   const desktopTextareaRef = useRef<HTMLTextAreaElement>(null);

//   useEffect(() => {
//     const updateTime = () => {
//       const now = new Date();
//       const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
//       const months = [
//         "Jan",
//         "Feb",
//         "Mar",
//         "Apr",
//         "May",
//         "Jun",
//         "Jul",
//         "Aug",
//         "Sep",
//         "Oct",
//         "Nov",
//         "Dec",
//       ];
//       const day = days[now.getDay()];
//       const date = now.getDate();
//       const month = months[now.getMonth()];
//       const hours = now.getHours().toString().padStart(2, "0");
//       const minutes = now.getMinutes().toString().padStart(2, "0");
//       setCurrentTime(`${day} ${date} ${month} ${hours}:${minutes}`);
//     };

//     updateTime();
//     const interval = setInterval(updateTime, 1000 * 30);
//     return () => clearInterval(interval);
//   }, []);

//   // Auto-focus desktop textarea on mount
//   useEffect(() => {
//     if (typeof window !== "undefined" && window.innerWidth >= 640) {
//       desktopTextareaRef.current?.focus();
//     }
//   }, []);

//   const [isSending, setIsSending] = useState(false);
//   const [sendError, setSendError] = useState<string | null>(null);

//   const senderName = session?.name || "Julius";
//   const senderEmail = session?.email || "julius@gmail.com";
//   const toEmail = process.env.NEXT_PUBLIC_CONTACT_TO_EMAIL;

//   const handleKeyPress = (char: string) => {
//     if (isSent) setIsSent(false);
//     if (sendError) setSendError(null);
//     setMessage((prev) => prev + char);
//     desktopTextareaRef.current?.focus();
//   };

//   const handleBackspace = () => {
//     if (sendError) setSendError(null);
//     setMessage((prev) => prev.slice(0, -1));
//     desktopTextareaRef.current?.focus();
//   };

//   const handleSend = async () => {
//     if (message.trim().length === 0 || isSending) return;
//     setIsSending(true);
//     setSendError(null);

//     try {
//       const res = await fetch("/api/send-email", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: senderName,
//           email: senderEmail,
//           to: toEmail,
//           subject: `hello from ${senderName.toLowerCase()}`,
//           message: message.trim(),
//         }),
//       });

//       const data = await res.json();
//       if (res.ok && data.success) {
//         setIsSent(true);
//       } else {
//         setSendError(data.error || "Failed to send email");
//       }
//     } catch (err: any) {
//       setSendError(err.message || "Failed to send email");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   return (
//     <main
//       className="relative min-h-dvh sm:h-dvh w-full sm:overflow-hidden px-6 py-8 sm:px-10 sm:py-10 select-none flex flex-col justify-between items-center transition-colors duration-300"
//       style={{
//         backgroundColor: "var(--background)",
//         color: "var(--foreground)",
//       }}
//     >
//       {/* ================= TOP HEADER ================= */}

//       {/* ================= MOBILE VIEW (< 640px) ================= */}
//       <div className="flex sm:hidden flex-col items-center justify-center my-auto w-full max-w-sm pt-4 pb-20">
//         {/* Mobile Mail Window Card */}
//         <div
//           className={`w-full rounded-2xl border flex flex-col overflow-hidden transition-all duration-300 ${isDark
//             ? "border-white/10 bg-[#121212] shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
//             : "border-black/10 bg-[#ffffff] shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
//             }`}
//         >
//           {/* Header Title Bar */}
//           <div
//             className={`flex items-center justify-between px-4 py-3.5 border-b transition-colors duration-300 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-black/[0.06] bg-black/[0.01]"
//               }`}
//           >
//             <div className="flex items-center gap-2">
//               <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
//               <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
//               <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
//             </div>
//             <span
//               className={`text-[13px] font-normal transition-colors duration-300 ${isDark ? "text-white/50" : "text-black/50"
//                 }`}
//               style={{ fontFamily: '"Neue Montreal", sans-serif' }}
//             >
//               new message
//             </span>
//             <div className={`flex items-center gap-3.5 transition-colors duration-300 ${isDark ? "text-white/70" : "text-black/70"}`}>
//               <button
//                 type="button"
//                 onClick={handleSend}
//                 disabled={message.trim().length === 0 || isSending}
//                 className={`transition-colors disabled:opacity-30 cursor-pointer ${isDark ? "text-white/80 hover:text-white" : "text-black/80 hover:text-black"
//                   }`}
//               >
//                 {isSending ? (
//                   <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
//                 ) : isSent ? (
//                   <FiCheck size={16} className="text-[#28c840]" />
//                 ) : (
//                   <FiSend size={16} />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Form Rows */}
//           <div
//             className={`flex items-center gap-3 px-4 py-3 border-b text-sm transition-colors duration-300 ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"
//               }`}
//             style={{ fontFamily: '"Neue Montreal", sans-serif' }}
//           >
//             <span className={`w-14 shrink-0 transition-colors duration-300 ${isDark ? "text-white/40" : "text-black/40"}`}>from:</span>
//             <span className={`truncate transition-colors duration-300 ${isDark ? "text-white/90" : "text-black/90"}`}>
//               {senderName} - {senderEmail}
//             </span>
//           </div>

//           <div
//             className={`flex items-center gap-3 px-4 py-3 border-b text-sm transition-colors duration-300 ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"
//               }`}
//             style={{ fontFamily: '"Neue Montreal", sans-serif' }}
//           >
//             <span className={`w-14 shrink-0 transition-colors duration-300 ${isDark ? "text-white/40" : "text-black/40"}`}>to:</span>
//             <span className={`truncate transition-colors duration-300 ${isDark ? "text-white/90" : "text-black/90"}`}>{toEmail}</span>
//           </div>

//           <div
//             className={`flex items-center gap-3 px-4 py-3 border-b text-sm transition-colors duration-300 ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"
//               }`}
//             style={{ fontFamily: '"Neue Montreal", sans-serif' }}
//           >
//             <span className={`w-14 shrink-0 transition-colors duration-300 ${isDark ? "text-white/40" : "text-black/40"}`}>subject:</span>
//             <span className={`truncate transition-colors duration-300 ${isDark ? "text-white/90" : "text-black/90"}`}>hello from {senderName.toLowerCase()}</span>
//           </div>

//           {/* Message Area */}
//           <div className="p-4 flex-1 min-h-[190px]">
//             {isSent ? (
//               <div className="text-emerald-500 flex items-center gap-2 text-sm pt-2">
//                 <FiCheck size={16} /> Message sent to {toEmail}.
//               </div>
//             ) : (
//               <textarea
//                 value={message}
//                 onChange={(e) => {
//                   if (isSent) setIsSent(false);
//                   setMessage(e.target.value);
//                 }}
//                 placeholder="what's on your mind"
//                 className={`w-full h-44 bg-transparent text-sm outline-none resize-none leading-relaxed transition-colors duration-300 ${isDark
//                   ? "text-neutral-200 placeholder:text-neutral-600"
//                   : "text-neutral-800 placeholder:text-neutral-400"
//                   }`}
//                 style={{ fontFamily: '"Neue Montreal", sans-serif' }}
//               />
//             )}
//           </div>
//         </div>

//         {/* Mobile Caption & Send Action */}
//         <div className="mt-15 flex flex-col items-center justify-center gap-1.5 select-none">
//           <div className="flex items-center justify-center gap-2 text-[13px] font-normal">
//             <span
//               style={{
//                 fontFamily: '"Neue Montreal", sans-serif',
//                 color: "var(--text-tertiary)",
//               }}
//             >
//               {isSent
//                 ? "Your message has been sent successfully!"
//                 : "write your email, then tap"}
//             </span>
//             {!isSent && (
//               <button
//                 type="button"
//                 onClick={handleSend}
//                 disabled={message.trim().length === 0 || isSending}
//                 className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-default"
//                 style={{
//                   background: "var(--button-secondary-fill, #DDD)",
//                   color: "var(--button-text-enabled, #111)",
//                   fontFamily: '"Neue Montreal", sans-serif',
//                 }}
//               >
//                 {isSending ? (
//                   <>
//                     <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
//                     Sending
//                   </>
//                 ) : (
//                   <>
//                     Send <SendHorizonal size={11} className="" />
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//           {sendError && (
//             <span className="text-[11px] text-red-500 font-normal">
//               {sendError}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* ================= DESKTOP VIEW (>= 640px) ================= */}
//       <div className="hidden sm:flex flex-col items-center justify-center my-auto w-full max-w-5xl shrink-0 pb-16 sm:pb-20">
//         {/* iMac Screen SVG & Content */}
//         <div
//           className="animate-fade-up relative w-full flex items-center justify-center"
//           style={{
//             width: "min(840px, 92vw, 52dvh)",
//             maxWidth: "780px",
//           }}
//         >
//           {/* iMac Stand & Bezel SVG */}
//           <svg
//             width="600"
//             height="500"
//             viewBox="0 0 600 500"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//             className={`desk-glass h-auto w-full text-[#050505] transition-all duration-300`}
//           >
//             <rect
//               fill="url(#linear-gradient)"
//               x="232.4"
//               y="401.32"
//               width="135.2"
//               height="83.37"
//             />
//             <path
//               fill="#d1d3d4"
//               d="M367.6,484.69H232.4c-4.22,0-7.65-3.43-7.65-7.65s3.43-7.65,7.65-7.65H367.6c4.22,0,7.65,3.43,7.65,7.65s-3.43,7.65-7.65,7.65Z"
//             />
//             <rect
//               fill="url(#linear-gradient)"
//               x="232.4"
//               y="401.32"
//               width="135.2"
//               height="83.37"
//             />
//             <rect
//               fill={isDark ? "#231f20" : "#d9d9db"}
//               x="13.92"
//               y="8.99"
//               width="572.16"
//               height="384.34"
//               rx="13.11"
//               ry="13.11"
//             />
//             <path
//               fill="#eeeeef"
//               d="M23.83,10.99h552.03c4.92,0,8.91,3.99,8.91,8.91v324.18H14.92V19.9c0-4.92,3.99-8.91,8.91-8.91Z"
//             />
//             <path
//               fill="#d9d9db"
//               d="M23.83,343.94h552.03c4.92,0,8.91,3.99,8.91,8.91v48.47H14.92v-48.47c0-4.92,3.99-8.91,8.91-8.91Z"
//               transform="translate(599.69 745.26) rotate(180)"
//             />
//             <path
//               fill={isDark ? "#231f20" : "#eeeeef"}
//               d="M570.43,330.43H29.57c-.44,0-.79-.36-.79-.79V25.47c0-.44.36-.79.79-.79h540.87c.44,0,.79.36.79.79v304.17c0,.44-.36.79-.79.79ZM29.57,25.37c-.05,0-.1.04-.1.09v304.17c0,.05.04.1.1.1h540.87c.05,0,.09-.04.09-.1V25.47c0-.05-.04-.09-.09-.09H29.57Z"
//             />
//             <rect
//               fill="#fff"
//               x="29.12"
//               y="25.02"
//               width="541.76"
//               height="305.06"
//               rx=".44"
//               ry=".44"
//             />
//             <circle fill="#414042" cx="300" cy="17.7" r="2.11" />
//             <circle fill="#262262" cx="300" cy="17.7" r=".85" />
//             <rect
//               fill={isDark ? "currentColor" : "#ffffff"}
//               x="29.12"
//               y="25.02"
//               width="541.76"
//               height="305.06"
//               rx=".44"
//               ry=".44"
//             />
//             <defs>
//               <clipPath id="roundedCorners">
//                 <rect
//                   fill="#ffffff"
//                   x="29.12"
//                   y="25.02"
//                   width="541.76"
//                   height="305.06"
//                   rx=".44"
//                   ry=".44"
//                 />
//               </clipPath>
//               <linearGradient
//                 id="linear-gradient"
//                 x1="300"
//                 y1="484.69"
//                 x2="300"
//                 y2="401.32"
//                 gradientUnits="userSpaceOnUse"
//               >
//                 <stop offset="0" stopColor="#a7a9ac" />
//                 <stop offset=".1" stopColor="#d1d3d4" />
//                 <stop offset=".41" stopColor="#e6e7e8" />
//                 <stop offset=".73" stopColor="#e6e7e8" />
//                 <stop offset="1" stopColor="#d1d3d4" />
//               </linearGradient>
//             </defs>
//           </svg>

//           {/* Desktop Screen Content Overlay */}
//           <div
//             className={`desk-screen absolute top-[5%] left-[4.9%] flex h-[61%] w-[90.2%] flex-col overflow-hidden text-left transition-colors duration-300 ${isDark ? "text-neutral-200 bg-[#080808]" : "text-neutral-800 bg-[#ffffff]"
//               }`}
//           >
//             {/* macOS Menu Bar */}
//             <div
//               className={`flex h-[17px] shrink-0 items-center justify-between px-2.5 text-[9px] transition-colors duration-300 ${isDark ? "bg-white/[0.06] text-neutral-300" : "bg-black/[0.06] text-neutral-700"
//                 }`}
//             >
//               <div className="flex items-center gap-2.5">
//                 <FaApple
//                   size={10}
//                   className={`transition-colors duration-300 ${isDark ? "fill-neutral-200 text-neutral-200" : "fill-neutral-800 text-neutral-800"
//                     }`}
//                 />
//                 <span className={`font-semibold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>mail</span>
//                 <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>file</span>
//                 <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>edit</span>
//                 <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>view</span>
//                 <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>go</span>
//                 <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>window</span>
//                 <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>help</span>
//               </div>
//               <div className={isDark ? "flex items-center gap-2 text-neutral-400" : "flex items-center gap-2 text-neutral-500"}>
//                 <FiWifi size={9} />
//                 <FiSearch size={8} />
//                 <span className={`text-[8.5px] ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
//                   {currentTime || "Sat 22 Aug 16:47"}
//                 </span>
//               </div>
//             </div>

//             {/* Desktop Wallpaper Space with Icons & Window */}
//             <div
//               className={`relative flex-1 overflow-hidden transition-colors duration-300 ${isDark
//                 ? "bg-gradient-to-b from-[#0a0a0a] to-[#040404]"
//                 : "bg-gradient-to-b from-[#f9f9fb] to-[#f2f2f7]"
//                 }`}
//             >
//               {/* Desktop Icons on the Right */}
//               <div className="absolute top-2.5 right-2 flex flex-col items-end gap-2.5 z-10">
//                 <button
//                   type="button"
//                   onClick={() => onNavigateTab?.("companies")}
//                   className="group flex w-14 cursor-pointer flex-col items-center gap-0.5"
//                 >
//                   <FiFolder
//                     size={20}
//                     className={`desk-folder transition-colors duration-300 ${isDark
//                       ? "text-white/40 fill-white/10 group-hover:fill-white/20 group-hover:text-white/60"
//                       : "text-black/40 fill-black/5 group-hover:fill-black/15 group-hover:text-black/60"
//                       }`}
//                   />
//                   <span className={`text-[8px] font-medium ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
//                     founded
//                   </span>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => onNavigateTab?.("companies")}
//                   className="group flex w-14 cursor-pointer flex-col items-center gap-0.5"
//                 >
//                   <FiFolder
//                     size={20}
//                     className={`desk-folder transition-colors duration-300 ${isDark
//                       ? "text-white/40 fill-white/10 group-hover:fill-white/20 group-hover:text-white/60"
//                       : "text-black/40 fill-black/5 group-hover:fill-black/15 group-hover:text-black/60"
//                       }`}
//                   />
//                   <span className={`text-[8px] font-medium ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
//                     invested
//                   </span>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => onNavigateTab?.("socials")}
//                   className="group flex w-14 cursor-pointer flex-col items-center gap-0.5"
//                 >
//                   <FiFeather
//                     size={19}
//                     className={`desk-folder transition-colors duration-300 ${isDark
//                       ? "text-white/40 fill-white/10 group-hover:fill-white/20 group-hover:text-white/60"
//                       : "text-black/40 fill-black/5 group-hover:fill-black/15 group-hover:text-black/60"
//                       }`}
//                   />
//                   <span className={`text-[8px] font-medium ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
//                     letters
//                   </span>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => onNavigateTab?.("socials")}
//                   className="group flex w-14 cursor-pointer flex-col items-center gap-0.5"
//                 >
//                   <FiCamera
//                     size={19}
//                     className={`desk-folder transition-colors duration-300 ${isDark
//                       ? "text-white/40 fill-white/10 group-hover:fill-white/20 group-hover:text-white/60"
//                       : "text-black/40 fill-black/5 group-hover:fill-black/15 group-hover:text-black/60"
//                       }`}
//                   />
//                   <span className={`text-[8px] font-medium ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
//                     frames
//                   </span>
//                 </button>
//               </div>

//               {/* Mail Compose Window in Center */}
//               <div
//                 className={`desk-window absolute top-[48%] left-[45%] flex h-[82%] w-[58%] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border transition-all duration-300 ${isDark
//                   ? "border-white/10 bg-[#141414] shadow-[0_24px_70px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)]"
//                   : "border-black/10 bg-[#ffffff] shadow-[0_24px_70px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]"
//                   }`}
//               >
//                 {/* Window Title Bar */}
//                 <div
//                   className={`flex shrink-0 items-center gap-1.5 border-b px-2.5 py-1.5 transition-colors duration-300 ${isDark ? "border-white/[0.06] bg-white/[0.03] text-neutral-500" : "border-b border-black/[0.06] bg-black/[0.02] text-neutral-600"
//                     }`}
//                 >
//                   <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
//                   <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
//                   <span className="h-2 w-2 rounded-full bg-[#28c840]" />
//                   <span className={`mx-auto text-[9.5px] font-medium ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
//                     new message
//                   </span>
//                   <div className="flex items-center gap-2">
                    
//                     <button
//                       type="button"
//                       onClick={handleSend}
//                       disabled={message.trim().length === 0 || isSending}
//                       aria-label="send"
//                       className={`flex cursor-pointer items-center gap-1 text-[9px] transition-colors duration-300 disabled:cursor-default disabled:opacity-35 ${isDark ? "text-neutral-300 hover:text-white" : "text-neutral-700 hover:text-black"
//                         }`}
//                     >
//                       {isSending ? (
//                         <>
//                           <span className="inline-block h-2 w-2 animate-spin rounded-full border-[1px] border-current border-t-transparent" /> sending...
//                         </>
//                       ) : isSent ? (
//                         <>
//                           <FiCheck size={10} className="text-[#28c840]" /> sent
//                         </>
//                       ) : (
//                         <>
//                           <FiSend size={10} /> send
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Email Metadata Fields */}
//                 <div className={`flex items-center gap-1.5 border-b px-3 py-1 text-[9.5px] transition-colors duration-300 ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"
//                   }`}>
//                   <span className={isDark ? "shrink-0 text-neutral-500" : "shrink-0 text-neutral-400"}>from:</span>
//                   <span className={`truncate whitespace-nowrap ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
//                     {senderName} - {senderEmail}
//                   </span>
//                 </div>
//                 <div className={`flex items-center gap-1.5 border-b px-3 py-1 text-[9.5px] transition-colors duration-300 ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"
//                   }`}>
//                   <span className={isDark ? "shrink-0 text-neutral-500" : "shrink-0 text-neutral-400"}>to:</span>
//                   <span className={`truncate whitespace-nowrap ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
//                     {toEmail}
//                   </span>
//                 </div>
//                 <div className={`flex items-center gap-1.5 border-b px-3 py-1 text-[9.5px] transition-colors duration-300 ${isDark ? "border-white/[0.06]" : "border-black/[0.06]"
//                   }`}>
//                   <span className={isDark ? "shrink-0 text-neutral-500" : "shrink-0 text-neutral-400"}>subject:</span>
//                   <span className={`truncate whitespace-nowrap ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
//                     hello from {senderName.toLowerCase()}
//                   </span>
//                 </div>

//                 {/* Email Body & Typing Area */}
//                 <div
//                   onClick={() => desktopTextareaRef.current?.focus()}
//                   className={`relative flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 text-[10px] leading-[1.6] font-normal cursor-text ${isDark ? "text-neutral-200" : "text-neutral-800"
//                     }`}
//                   style={{
//                     whiteSpace: "pre-wrap",
//                     wordBreak: "break-word",
//                     overflowWrap: "anywhere",
//                   }}
//                 >
//                   <textarea
//                     ref={desktopTextareaRef}
//                     value={message}
//                     onChange={(e) => {
//                       if (isSent) setIsSent(false);
//                       setMessage(e.target.value);
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter" && !e.shiftKey) {
//                         e.preventDefault();
//                         handleSend();
//                       }
//                     }}
//                     aria-label="Email message"
//                     className="absolute inset-0 opacity-0 cursor-text resize-none w-full h-full"
//                   />

//                   {isSent ? (
//                     <div className="text-emerald-500 flex items-center gap-1.5 pt-0.5">
//                       <FiCheck size={12} /> Message sent to {toEmail}.
//                     </div>
//                   ) : message ? (
//                     <div className="pointer-events-none" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
//                       <span>{message}</span>
//                       <span className={`animate-pulse ml-px inline-block h-[10px] w-px translate-y-[1px] ${isDark ? "bg-neutral-200" : "bg-neutral-800"
//                         }`} />
//                     </div>
//                   ) : (
//                     <div className={`pointer-events-none ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
//                       <span>what&apos;s on your mind</span>
//                       <span className={`animate-pulse ml-1 inline-block h-[10px] w-px translate-y-[1px] ${isDark ? "bg-neutral-200" : "bg-neutral-800"
//                         }`} />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Apple Keyboard Container */}
//         <div className="w-full flex items-center justify-center overflow-visible -mt-2 sm:mt-1 -mb-20 sm:-mb-20 md:-mb-24 lg:-mb-24 xl:-mb-24">
//           <div className="scale-[0.56] sm:scale-[0.60] md:scale-[0.68] lg:scale-[0.71] xl:scale-[0.73] origin-top">
//             <AppleKeyboard
//               onKeyPress={handleKeyPress}
//               onEnter={handleSend}
//               onBackspace={handleBackspace}
//             />
//           </div>
//         </div>

//         {/* Text Instruction below Keyboard */}
//         <div className="mt-1 sm:mt-5 flex flex-col items-center justify-center gap-1 select-none">
//           <div className="flex items-center justify-center gap-2 text-[12px] sm:text-[12.5px] font-normal">
//             <span
//               style={{
//                 fontFamily: '"Neue Montreal", sans-serif',
//                 color: "var(--text-tertiary)",
//               }}
//             >
//               {isSent
//                 ? "Your message has been sent successfully!"
//                 : "write your email, then tap "}
//             </span>
//             {!isSent && (
//               <button
//                 onClick={handleSend}
//                 disabled={message.trim().length === 0 || isSending}
//                 className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-default"
//                 style={{
//                   background: "var(--button-secondary-fill, #DDD)",
//                   color: "var(--button-text-enabled, #111)",
//                   fontFamily: '"Neue Montreal", sans-serif',
//                 }}
//               >
//                 {isSending ? (
//                   <>
//                     <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
//                     Sending
//                   </>
//                 ) : (
//                   <>
//                     Send <SendHorizonal size={11} className="" />
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//           {sendError && (
//             <span className="text-[11px] text-red-500 font-normal">
//               {sendError}
//             </span>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }
