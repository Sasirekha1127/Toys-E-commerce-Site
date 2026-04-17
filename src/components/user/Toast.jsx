// import React from 'react';
// import { CheckCircle, Info, X } from 'lucide-react';
// import { useStore } from '../context/StoreContext';

// export default function Toast() {
//   const { toast } = useStore();
//   if (!toast) return null;

//   const isSuccess = toast.type !== 'info';

//   return (
//     <div className="fixed bottom-6 right-6 z-50 toast">
//       <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl font-body font-bold text-sm max-w-xs
//         ${isSuccess ? 'bg-orange-500 text-white' : 'bg-gray-800 text-white'}`}>
//         {isSuccess
//           ? <CheckCircle size={18} className="flex-none" />
//           : <Info size={18} className="flex-none" />}
//         <span>{toast.message}</span>
//       </div>
//     </div>
//   );
// }
