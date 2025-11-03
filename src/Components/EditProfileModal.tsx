import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ChangeEmailFlow from "./ChangeEmailFlow";
import ChangePasswordFlow from "./ChangePasswordFlow";

interface EditProfileModalProps {
  user: any;
  setUser: (user: any) => void;
  onClose: () => void;
}

export default function EditProfileModal({
  user,
  setUser,
  onClose,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [showEmailFlow, setShowEmailFlow] = useState(false);
  const [showPasswordFlow, setShowPasswordFlow] = useState(false);

  const handleSave = () => {
    setUser({ ...user, name });
    onClose();
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[90]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white p-6 rounded-2xl shadow-2xl w-96"
        >
          <h2 className="text-xl font-semibold mb-4 text-center">
            ✏️ Edit Profile
          </h2>

          <label className="block mb-3">
            <span className="text-gray-600 text-sm">Full Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </label>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowEmailFlow(true)}
              className="text-blue-600 hover:underline text-sm text-left"
            >
              Change Email
            </button>
            <button
              onClick={() => setShowPasswordFlow(true)}
              className="text-blue-600 hover:underline text-sm text-left"
            >
              Change Password
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* 🧩 Email and Password flows */}
      <AnimatePresence>
        {showEmailFlow && (
          <ChangeEmailFlow
            user={user}
            setUser={setUser}
            onClose={() => setShowEmailFlow(false)}
          />
        )}
        {showPasswordFlow && (
          <ChangePasswordFlow
            user={user}
            setUser={setUser}
            onClose={() => setShowPasswordFlow(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
