import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  user: any;
  setUser: (u: any) => void;
  onClose: () => void;
}

export default function ChangeEmailFlow({ user, setUser, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [enteredCode, setEnteredCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const sendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    alert(`📧 Verification code sent to ${user.email}: ${code}`);
    setStep(2);
  };

  const verifyOldEmail = () => {
    if (enteredCode === generatedCode) {
      setStep(3);
      setEnteredCode("");
      setGeneratedCode("");
    } else alert("Incorrect code!");
  };

  const sendNewCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    alert(`📧 Verification code sent to new email: ${code}`);
    setStep(4);
  };

  const verifyNewEmail = () => {
    if (enteredCode === generatedCode) {
      setUser({ ...user, email: newEmail });
      alert("✅ Email successfully updated!");
      onClose();
    } else alert("Incorrect code!");
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
            <h2 className="text-lg font-semibold mb-3">
              Verify Your Current Email
            </h2>
            <p className="text-gray-500 mb-4">{user.email}</p>
            <button
              onClick={sendCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send Code
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-3">Enter Verification Code</h2>
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              placeholder="Enter code"
              className="border rounded-lg px-3 py-2 w-full mb-4"
            />
            <button
              onClick={verifyOldEmail}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Verify
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold mb-3">Enter New Email</h2>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="newemail@example.com"
              className="border rounded-lg px-3 py-2 w-full mb-4"
            />
            <button
              onClick={sendNewCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send New Code
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-lg font-semibold mb-3">
              Verify Your New Email
            </h2>
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              placeholder="Enter new code"
              className="border rounded-lg px-3 py-2 w-full mb-4"
            />
            <button
              onClick={verifyNewEmail}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Confirm
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
