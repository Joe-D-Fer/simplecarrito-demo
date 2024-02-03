import { json } from "@sveltejs/kit";

export async function POST({ request }) {
	const { token_ws } = await request.json();
	console.log("token_ws:", token_ws);

	return json("success", { status: 201 });
}