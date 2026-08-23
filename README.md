# Twitch 聊天 / 訂閱事件監聽器 + Google 試算表累積數字

雙擊 `啟動監聽器.bat` 啟動本機 server，網址為 `http://localhost:5500/index.html`。

公開累積數字後端已改成 Google Apps Script + Google 試算表，不需要 Cloudflare。

規則：
- `subscriptionMonths` 初始 1546；每次 resub 加該事件的 `cumulativeMonths`。
- `giftSubCount` 初始 395；`community_sub_gift` 每 5 份 +1。
- 單筆 `sub_gift` 不增加，避免重複計算。

完整安裝請看上一層的 `安裝步驟.txt`。


## 單一視窗登入版
此版本不使用 OAuth 彈出視窗。按「登入 Twitch」後會在同一個頁面前往 Twitch，授權完成再回到同一個監聽器頁面。
