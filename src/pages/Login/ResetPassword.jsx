// import { useNavigate } from "react-router-dom";

// function ResetPassword() {
// const navigate = useNavigate();
// const [newPassword, setNewPassword] = useState("");
// const [confirmPassword, setConfirmPassword] = useState("");
// const [error, setError] = useState("");
// const [success, setSuccess] = useState("");

// const handleResetPassword = (e) => {
// e.preventDefault();
// setError("");
// setSuccess("");

// if (newPassword.length < 6) {
// setError("Password must be at least 6 characters long.");
// return;
// }

// if (newPassword !== confirmPassword) {
// setError("New Password and Confirm Password do not match.");
// return;
// }

// setSuccess("Your password has been successfully updated!");
// setNewPassword("");
// setConfirmPassword("");

// setTimeout(() => {
// navigate("/login");
// }, 2000);
// };

// return (
// <div className="h-screen flex justify-center items-center bg-gray-100">
// <form
// className="w-[380px] bg-white rounded-xl shadow-lg p-8 text-center"
// onSubmit={handleResetPassword}
// >
// <h2 className="text-2xl font-semibold text-gray-800 mb-5">
// Reset Password
// </h2>

// <input
// type="password"
// placeholder="New Password (min 6 chars)"
// value={newPassword}
// onChange={(e) => setNewPassword(e.target.value)}
// required
// className="w-full p-3 mt-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
// />

// <input
// type="password"
// placeholder="Confirm New Password"
// value={confirmPassword}
// onChange={(e) => setConfirmPassword(e.target.value)}
// required
// className="w-full p-3 mt-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
// />

// {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
// {success && <p className="text-green-600 font-medium mt-2">{success}</p>}

// <button
// type="submit"
// className="w-full mt-5 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
// >
// Reset Password
// </button>
// </form>
// </div>
// );
// }

// export default ResetPassword;