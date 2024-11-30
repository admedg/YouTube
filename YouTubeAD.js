// ==UserScript==
// @name         YouTube去广告、设置最高画质和字体样式
// @version      2024-11-30
// @author       fhanser
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=YouTube.com
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const AD_SELECTORS = [
        `#masthead-ad`,
        `ytd-rich-item-renderer.style-scope.ytd-rich-grid-row #content:has(.ytd-display-ad-renderer)`,
        `.video-ads.ytp-ad-module`,
        `tp-yt-paper-dialog:has(yt-mealbar-promo-renderer)`,
        `ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]`,
        `#related #player-ads`,
        `#related ytd-ad-slot-renderer`,
        `ytd-ad-slot-renderer`,
        `yt-mealbar-promo-renderer`,
        `ytd-popup-container:has(a[href="/premium"])`,
        `ad-slot-renderer`,
        `ytm-companion-ad-renderer`,
    ];

    const SKIP_AD_BUTTON_SELECTORS = [
        `.ytp-ad-skip-button`,
        `.ytp-skip-ad-button`,
        `.ytp-ad-skip-button-modern`
    ];

    const FAST_FORWARD_AD_SPEED = 16; // 倍速播放广告

    let video;
    let player;

    // 初始化去广告样式
    function generateRemoveADCss() {
        const style = document.createElement("style");

        // 去广告样式
        const adCss = AD_SELECTORS.map(selector => `${selector}{display:none!important}`).join(' ');

        // 字体样式设置
        const fontCss = `
            body, p, span, div, a, li, h1, h2, h3, h4, h5, h6 {
                font-weight: bold !important; /* 设置字体为粗体 */
            }
            /* 针对标题和链接的特别设置 */
            h1, h2, h3, h4, h5, h6 {
                font-weight: bold !important; /* 设置标题文本为粗体 */
                color: #000 !important;
            }
            a {
                text-decoration: none !important;
                color: #1a73e8 !important;
                font-weight: bold !important; /* 设置链接为粗体 */
            }
        `;

        // 将去广告样式和字体样式合并
        style.textContent = adCss + ' ' + fontCss;
        document.head.appendChild(style);
    }

    // 跳过广告
    function skipAd() {
        const skipButton = SKIP_AD_BUTTON_SELECTORS.map(selector => document.querySelector(selector)).find(btn => btn);
        if (skipButton) {
            skipButton.click();
        } else if (player) {
            player.setPlaybackRate(FAST_FORWARD_AD_SPEED); // 快进广告
        }
    }

    // 自动播放广告后的视频
    function playAfterAd() {
        if (video && video.paused && video.currentTime === 0) {
            video.play();
        }
    }

    // 设置最高画质
    function setHighestQuality() {
        if (player) {
            const availableQualities = player.getAvailableQualityLevels();
            const highestQuality = availableQualities[availableQualities.length - 1];
            player.setPlaybackQuality(highestQuality);
        }
    }

    // 页面加载后立即执行的初始化逻辑
    window.addEventListener("load", () => {
        video = document.querySelector('video');
        player = new YT.Player('movie_player');
        setHighestQuality();
        playAfterAd();
    });

    // 监听广告变化并跳过广告
    const observer = new MutationObserver(() => {
        skipAd();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 每隔500ms检查广告
    setInterval(skipAd, 500);

    // 页面加载前移除广告并设置字体样式
    generateRemoveADCss();
})();
