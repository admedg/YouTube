// ==UserScript==
// @name         YouTube去广告、设置最高画质
// @version      2024-11-30
// @author       fhanser
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=YouTube.com
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    let video; // 视频元素变量

    // 广告选择器
    const cssSelectorArr = [
        `#masthead-ad`, // 首页顶部横幅广告
        `ytd-rich-item-renderer.style-scope.ytd-rich-grid-row #content:has(.ytd-display-ad-renderer)`, // 首页视频排版广告
        `.video-ads.ytp-ad-module`, // 播放器底部广告
        `tp-yt-paper-dialog:has(yt-mealbar-promo-renderer)`, // 播放页会员促销广告
        `ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]`, // 播放页右上方推荐广告
        `#related #player-ads`, // 播放页评论区右侧推广广告
        `#related ytd-ad-slot-renderer`, // 播放页评论区右侧视频排版广告
        `ytd-ad-slot-renderer`, // 搜索页广告
        `yt-mealbar-promo-renderer`, // 播放页会员推荐广告
        `ytd-popup-container:has(a[href="/premium"])`, // 会员拦截广告
        `ad-slot-renderer`, // M播放页第三方推荐广告
        `ytm-companion-ad-renderer`, // M可跳过的视频广告链接处
    ];

    // 生成去广告的 CSS 样式并附加到 HTML
    function generateRemoveADHTMLElement(id) {
        let style = document.createElement(`style`);
        (document.head || document.body).appendChild(style);
        style.appendChild(
            document.createTextNode(generateRemoveADCssText(cssSelectorArr))
        );
    }

    // 生成去广告的 CSS 文本
    function generateRemoveADCssText(cssSelectorArr) {
        cssSelectorArr.forEach((selector, index) => {
            cssSelectorArr[index] = `${selector}{display:none!important}`;
        });
        return cssSelectorArr.join(` `);
    }

    // 跳过广告：点击跳过广告按钮，或者强制跳过
    function skipAd() {
        const skipButton =
              document.querySelector(`.ytp-ad-skip-button`) ||
              document.querySelector(`.ytp-skip-ad-button`) ||
              document.querySelector(`.ytp-ad-skip-button-modern`);

        // 如果有跳过广告的按钮，点击它
        if (skipButton) {
            skipButton.click();
        } else {
            // 如果广告按钮没出现，强制加速播放广告
            const player = new YT.Player("movie_player"); // 使用YT.Player API来控制播放速率
            player.setPlaybackRate(16); // 强制16倍速播放广告
        }
    }

    // 自动播放广告后的视频
    function playAfterAd() {
        if (video && video.paused && video.currentTime < 1) {
            video.play(); // 如果视频还未播放，就开始播放
        }
    }

    // 设置最高画质
    function setHighestQuality() {
        if (window.YT && window.YT.Player) {
            const player = new YT.Player("movie_player");
            const availableQualities = player.getAvailableQualityLevels();
            const highestQuality = availableQualities[availableQualities.length - 1];
            player.setPlaybackQuality(highestQuality);
        }
    }

    // 页面加载前立即移除广告
    generateRemoveADHTMLElement("yt-ad-block");

    // 监听页面加载并设置画质和修改布局
    window.addEventListener("load", () => {
        video = document.querySelector('video'); // 获取视频元素
        setHighestQuality(); // 设置最高画质
        playAfterAd(); // 自动播放视频（广告播放完后）
    });

    // 使用 MutationObserver 监听广告变化并跳过广告
    const observer = new MutationObserver(() => {
        skipAd(); // 检测到广告后跳过广告
    });

    // 监听广告相关的 DOM 变化
    observer.observe(document.body, { childList: true, subtree: true });

    // 强制跳过广告并播放视频
    setInterval(skipAd, 500); // 每隔500ms检查一次广告并跳过
})();

