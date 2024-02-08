export async function load({url}) {
  const response_code = url.searchParams.get('rc') || 'missing';
  return { response_code };
};
