import { motion } from "framer-motion";

interface LogoutConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-6 rounded-2xl shadow-2xl text-center w-80"
      >
        <h2 className="text-xl font-semibold mb-3">
          Are you sure you want to logout?
        </h2>
        <p className="text-gray-500 mb-5">
          You’ll be redirected to the login page.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
