import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  user: any;
  setUser: (u: any) => void;
  onClose: () => void;
}

export default function ChangePasswordFlow({ user, setUser, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  const checkCurrent = () => {
    if (current === user.password) setStep(2);
    else alert("❌ Incorrect current password!");
  };

  const updatePassword = () => {
    if (newPwd !== confirm) return alert("Passwords do not match!");
    setUser({ ...user, password: newPwd });
    alert("✅ Password successfully updated!");
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-6 rounded-2xl shadow-2xl w-96 text-center"
      >
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-3">Enter Current Password</h2>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Current password"
              className="border rounded-lg px-3 py-2 w-full mb-4"
            />
            <button
              onClick={checkCurrent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-3">Set New Password</h2>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="New password"
              className="border rounded-lg px-3 py-2 w-full mb-2"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="border rounded-lg px-3 py-2 w-full mb-4"
            />
            <button
              onClick={updatePassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}
