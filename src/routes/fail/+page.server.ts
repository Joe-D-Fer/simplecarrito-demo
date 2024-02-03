export async function load({url}){
  const response_code = url.searchParams.get('rc');
  return{response_code};
};