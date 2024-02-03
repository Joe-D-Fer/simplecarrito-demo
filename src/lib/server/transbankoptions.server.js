import { TbkApiKeyId, TbkApiKeySecret } from "$env/static/private";

export const transbankOptions = {

  commerceCode: TbkApiKeyId,

  apiKey: TbkApiKeySecret,

  environment: "https://webpay3gint.transbank.cl",

  timeout: 180000

};