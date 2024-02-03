addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // 解析请求 URL 中的查询参数
  const url = new URL(request.url);
  const key = url.searchParams.get('key'); // 获取查询参数 key 的值

  if (!key) {
      return new Response("Forbidden", {status: 403})
  }

  const yamlTemplate = await CLASH_KV.get('template'); // 获取 YAML 模板
  let yamlProxies = await CLASH_KV.get(key); // 如果 key 存在，从 KV 中获取 key 对应的代理列表

  if (!yamlTemplate || !yamlProxies) {
      return new Response('Resource not found', {status: 404});
  }

  // 替换 template 中的 {{proxies_placeholder}} 占位符
  let newYamlConfig = yamlTemplate.replace('{{proxies_placeholder}}', yamlProxies.trim());

  // 分析 yamlProxies 并提取代理的名称
  const proxyNames = yamlProxies
      .split('\n') // 分割每一行
      .map(line => {
          // 正则匹配查找代理名称
          const match = line.match(/name: ([^,]+)/);
          return match ? `  - ${match[1].trim()}` : null; // 格式化并返回代理名称
      })
      .filter(Boolean) // 过滤无效值（如 null）
      .join('\n'); // 用换行符连接代理名称

  // 替换 template 中的 {{node_selection_placeholder}} 占位符
  newYamlConfig = newYamlConfig.replace('{{node_selection_placeholder}}', proxyNames.trim());

  return new Response(newYamlConfig);
}
