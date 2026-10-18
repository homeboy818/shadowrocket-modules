/*
 * 哔哩哔哩开屏广告脚本 v3（Shadowrocket http-response）
 * 作用于 app.bilibili.com/x/v2/splash/{list,show,brand/list,event/list2}
 *
 * v1 直接清空列表，但 App 收到空列表不会删除本地已缓存的开屏，仍会播放。
 * v2 保留条目 id，把投放时间改到 2040 年、时长改为 0、关闭预下载，
 * App 会用这些数据覆盖本地缓存，缓存里的开屏因“未到投放时间”而不再播放。
 * v3 额外清空条目里的素材链接，避免 App 反复下载被拦截的开屏视频（v2 下 46 秒重试了 360 次）。
 * 解析失败时原样放行，不影响 App 启动。
 */
const FUTURE = 2240150400; // 2040-12-27
const PATCH = {
  begin_time: FUTURE, end_time: FUTURE,
  stime: FUTURE, etime: FUTURE,
  duration: 0, enable_pre_download: false, enable_background_download: false,
};

function stripUrls(o, depth) {
  if (!o || typeof o !== "object" || depth > 4) return;
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (typeof v === "string" && /^https?:\/\//.test(v)) o[k] = "";
    else if (v && typeof v === "object") stripUrls(v, depth + 1);
  }
}

function patchItem(it) {
  if (!it || typeof it !== "object") return it;
  for (const k of Object.keys(PATCH)) if (k in it) it[k] = PATCH[k];
  stripUrls(it, 0);
  return it;
}

let body = $response.body;
try {
  const obj = JSON.parse(body);
  const d = obj && obj.data;
  if (d && typeof d === "object") {
    for (const k of Object.keys(d)) {
      if (Array.isArray(d[k])) d[k] = d[k].map(patchItem);
    }
    if ("max_time" in d) d.max_time = 0;
    body = JSON.stringify(obj);
  }
} catch (e) {
  console.log("bilibili_splash: " + e);
}
$done({ body });
