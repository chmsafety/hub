/* ORB 서비스 워커 — 푸시 알림 전용 (2026-10-01, 3단계)
 * 화면·서버 통신은 캐시하지 않는다. 오직 알림을 받아 보여 주고, 누르면 허브를 연다. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener("push", function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: "오브", body: e.data ? e.data.text() : "" }; }
  var title = d.title || "오브";
  var opt = {
    body: d.body || "",
    tag: d.tag || "orb",
    renotify: true,
    icon: "./icon-192.png",
    badge: "./badge-96.png",
    data: { url: d.url || self.registration.scope, at: d.at || Date.now() },
    vibrate: /긴급/.test(title) ? [200, 100, 200, 100, 200] : [120, 60, 120]
  };
  e.waitUntil(self.registration.showNotification(title, opt));
});

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].url.indexOf(self.registration.scope) === 0 && "focus" in list[i]) { list[i].navigate(url); return list[i].focus(); }
    }
    return self.clients.openWindow(url);
  }));
});

self.addEventListener("pushsubscriptionchange", function (e) {
  // 구독이 브라우저 쪽에서 바뀌면 화면이 다음에 열릴 때 다시 등록한다 (index.html 의 pushSync)
});
