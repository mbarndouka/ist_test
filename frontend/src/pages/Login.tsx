import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { Button, Input } from "../components/ui";
import { CreditCard, CheckCircle2 } from "lucide-react";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(formData.username, formData.password);
      // AuthRedirectWrapper will automatically redirect to dashboard after successful login
    } catch {
      setError("Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-[#111111] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="z-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ccff00] rounded-lg flex items-center justify-center">
            <CreditCard className="text-black w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Procure<span className="text-[#ccff00]">Pay</span>
          </span>
        </div>

        <div className="z-10 max-w-lg">
          <h1 className="text-5xl font-bold tracking-tighter leading-tight mb-6">
            Control spend <br /> before it happens.
          </h1>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[#ccff00] w-5 h-5" />
              <span className="text-gray-300">Automated Purchase Orders</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[#ccff00] w-5 h-5" />
              <span className="text-gray-300">AI-Powered Receipt Matching</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[#ccff00] w-5 h-5" />
              <span className="text-gray-300">
                Multi-level Approval Workflows
              </span>
            </div>
          </div>
        </div>

        <div className="z-10 text-sm text-gray-500">
          © 2025 ProcurePay Inc. All rights reserved.
        </div>

        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/2 right-[-20%] w-[600px] h-[600px] bg-[#ccff00] rounded-full blur-[120px]" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#111] tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-gray-500">
              Enter your credentials to access the workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Email"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                placeholder="e.g.   example@example.com"
              />
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center">
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 text-base"
              isLoading={loading}
              variant="primary"
            >
              Sign In
            </Button>

            <p className="text-center text-xs text-gray-400 mt-4">
              System Roles: Staff, L1/L2 Managers, Finance Team
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
