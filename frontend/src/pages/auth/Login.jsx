import { useState }              from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm }               from "react-hook-form";
import { zodResolver }           from "@hookform/resolvers/zod";
import { z }                     from "zod";
import { Eye, EyeOff, Store, LogIn } from "lucide-react";
import { authAPI }               from "../../api";
import { useAuthStore }          from "../../stores/authStore";
import { useCartStore }          from "../../stores/cartStore";
import { useWishlistStore }      from "../../stores/wishlistStore";
import { mergeCartOnLogin }      from "../../api/cartMerge";
import PageMeta                  from "../../components/shared/PageMeta";
import { toast }                 from "sonner";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const navigate         = useNavigate();
  const location         = useLocation();
  const from             = location.state?.from || "/";
  const { setAuth }      = useAuthStore();
  const { fetchCart }    = useCartStore();
  const { fetchIds }     = useWishlistStore();
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const {
    register, handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await authAPI.login(data);
      setAuth(res.user, res.accessToken);

      // Merge guest cart into user cart
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) {
        try { await mergeCartOnLogin(res.user._id, sessionId); } catch {}
      }

      await fetchCart();
      await fetchIds();
      toast.success(`Welcome back, ${res.user.name.split(" ")[0]}! 👋`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      if (msg.includes("verify")) {
        toast.error("Please verify your email first");
        navigate("/verify-otp", { state: { email: data.email } });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Login" />
      <div className="min-h-screen bg-cream flex items-center
                      justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2
                                     justify-center">
              <Store className="text-brand-500" size={32} />
              <span className="font-display font-bold text-2xl
                               text-brand-700">
                Kapra Store
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your account
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm border
                          border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)}
                  className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold
                                   text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full px-4 py-3 rounded-xl border text-sm
                              bg-gray-50 focus:bg-white focus:outline-none
                              focus:ring-2 focus:ring-brand-300 transition-all
                              ${errors.email
                                ? "border-red-300 focus:ring-red-200"
                                : "border-gray-200"
                              }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link to="/forgot-password"
                        className="text-xs text-brand-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full px-4 py-3 pr-11 rounded-xl border
                                text-sm bg-gray-50 focus:bg-white
                                focus:outline-none focus:ring-2
                                focus:ring-brand-300 transition-all
                                ${errors.password
                                  ? "border-red-300 focus:ring-red-200"
                                  : "border-gray-200"
                                }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2
                           bg-brand-500 text-white font-bold py-3.5
                           rounded-xl hover:bg-brand-600 transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed
                           active:scale-95 mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30
                                   border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 border-t border-gray-100" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 border-t border-gray-100" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register"
                    className="text-brand-600 font-bold hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          {/* COD trust */}
          <p className="text-center text-xs text-gray-400 mt-5">
            💸 Cash on Delivery available on all orders
          </p>
        </div>
      </div>
    </>
  );
}