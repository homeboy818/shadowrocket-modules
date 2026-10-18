/*
 * 哔哩哔哩开屏广告清空脚本（Shadowrocket http-response）
 * 作用于 app.bilibili.com/x/v2/splash/{list,show,brand/list,event/list2}
 * 把 data 里所有列表清空，并拉长拉取间隔，让 App 认为“没有开屏可放”，
 * 同时会清掉本地已缓存的开屏素材。解析失败时原样放行，不影响 App 启动。
 */
let body = $response.body;
try {
  const obj = JSON.parse(body);
  const d = obj && obj.data;
  if (d && typeof d === "object") {
    for (const k of Object.keys(d)) {
      if (Array.isArray(d[k])) d[k] = [];
    }
    if ("max_time" in d) d.max_time = 0;
    if ("min_interval" in d) d.min_interval = 31536000;
    if ("pull_interval" in d) d.pull_interval = 31536000;
    body = JSON.stringify(obj);
  }
} catch (e) {
  console.log("bilibili_splash: " + e);
}
$done({ body });
