import { json, redirect } from "@sveltejs/kit";
import type { RequestEvent } from "./$types"
import pkg from "transbank-sdk";
import { transbankOptions } from "$lib/server/transbankoptions.server.js";
const {WebpayPlus} = pkg;


export async function GET({ url } : RequestEvent) 
{
    let token_ws : string = url.searchParams.get('token_ws') ?? 'token not found';
		const commitResponse = await (new WebpayPlus.Transaction(transbankOptions)).commit(token_ws);
		// Check if response_code is 0
		if (commitResponse.response_code === 0) {
			redirect(308, "/success?rc=0");
		} else {
			redirect(308, ("/fail?rc=" + commitResponse.response_code));
		}

    return json("success");
}