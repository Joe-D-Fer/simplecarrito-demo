import { redirect } from "@sveltejs/kit";
import { randomBytes } from 'crypto';

export async function load({url, cookies}) {
  let cart;
  let sessionId;
  const cartExists = false;
  const response_code = url.searchParams.get('rc') || 'missing';
  if (response_code == 'missing') {
    redirect(308, "/carrito");
  }else{
    if (response_code !== "0") {
      redirect(308, "/fail");
    }
  }
  if (response_code === "0") {
    sessionId = generateSessionId(cookies); // Regenerate session ID
    cart = { productsList: [] }; // Set empty cart
  }
  return { 
    response_code,
    cart,
    sessionId
  };
};
// Function to generate a session ID and set it as a cookie
function generateSessionId(cookies: { set: (arg0: string, arg1: string, arg2: { path: string; }) => void; }) {
  let sessionId = randomBytes(8).toString('hex'); // Generate a random session ID
  cookies.set('sessionId', sessionId, { path: '/' }); // Set the session ID as a cookie
  console.log("generated sessionID cookie:", sessionId);
  return sessionId; // Return the generated session ID
}
