// Lý thuyết giờ nằm trong app chung của từng môn (tab "Lý thuyết"): chuyển hướng link cũ.
export const onRequestGet = ({ params }) => new Response(null, { status: 302, headers: { location: '/app/' + encodeURIComponent(params.id) + '#/learn', 'cache-control': 'no-store' } });
