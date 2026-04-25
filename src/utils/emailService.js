import emailjs from 'emailjs-com';

/**
 * Sends a login notification email to the user.
 * This function uses a specific EmailJS service/template for login notifications.
 * @param {Object} user - The user object containing name and email.
 */
export const sendLoginEmail = async (user) => {
  const serviceId = import.meta.env.VITE_EMAILJS_LOGIN_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_LOGIN_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_LOGIN_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn("EmailJS login notification keys are missing in environment variables.");
    return;
  }

  const templateParams = {
    name: user.name || user.full_name || "Customer",
    email: user.email,
    time: new Date().toLocaleString(),
    device: navigator.userAgent,
    reset_link: `${window.location.origin}/reset-password`
  };

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log("Login notification email sent successfully:", response.status, response.text);
  } catch (error) {
    console.warn("Login email failed:", error);
  }
};
