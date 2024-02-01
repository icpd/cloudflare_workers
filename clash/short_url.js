addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Remove the leading '/'

    if (!path) {
        return new Response('Forbidden', {status: 403});
    }
  
    const longUrl = await URLS.get(path);
    if (longUrl) {
        return Response.redirect(longUrl, 302);
    }

    return new Response('URL not found', {status: 404});
}
