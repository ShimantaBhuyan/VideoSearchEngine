import { truncateViewCount } from "./utils/truncate-view-count.js";
import { getVideoDuration } from "./utils/get-video-duration.js";

window.addEventListener("DOMContentLoaded", () => {
  const resultCardTemplate = document.getElementById("result-card-template");
  const overlayElement = document.getElementById("view-overlay");
  const closeOverlayBtn = document.getElementById("view-overlay-close");
  const overlayIframeElm = document.getElementById("view-overlay-src");
  const overlayVisitBtn = document.getElementById("view-overlay-visit");
  const detailsTitle = document.getElementById("details-title");
  const detailsViewsCount = document.getElementById("details-views-count");

  let currentResults = [];
  let activeOverlayLink = "";

  const adjustNavigationStyle = () => {
    const pageNumberElement = document.querySelector(
      ".gsc-cursor-numbered-page"
    );
    if (pageNumberElement != null) {
      pageNumberElement.innerText = pageNumberElement.innerText.split(" ")[1];
      pageNumberElement.style.color = "#5D6067";
      pageNumberElement.previousSibling.classList.add("textLeft");
      pageNumberElement.previousSibling.innerHTML =
        pageNumberElement.previousSibling.innerHTML + "Prev";
      pageNumberElement.nextSibling.classList.add("textRight");
      pageNumberElement.nextSibling.innerHTML =
        "Next" + pageNumberElement.nextSibling.innerHTML;
    }
  };

  const buildResultCard = (data, index) => {
    const hasVideoObject = data.richSnippet.videoobject;
    const hasPerson = data.richSnippet.person;
    const resultCard = resultCardTemplate.content.cloneNode(true);
    const elm = resultCard.getElementById("result-card");
    const thumbnail = resultCard.getElementById("result-card-thumbnail");
    const title = resultCard.getElementById("result-card-title");
    const person = resultCard.getElementById("result-card-by");
    const viewCount = resultCard.getElementById("result-card-view-count");
    const duration = resultCard.getElementById("result-card-video-duration");

    elm.setAttribute("data-index", index);
    title.innerHTML = data.title;
    thumbnail.src = currentResults[index].richSnippet.videoobject.thumbnailurl;
    const videoDuration = getVideoDuration(
      currentResults[index].richSnippet.videoobject.duration
    );
    if (videoDuration != undefined) {
      duration.innerText = videoDuration;
    } else {
      duration.style.display = "none";
    }

    if (hasPerson) {
      person.innerText = data.richSnippet.person.name;
    }

    if (hasVideoObject) {
      const rawViewCount = data.richSnippet.videoobject.interactioncount;
      viewCount.innerText = truncateViewCount(Number(rawViewCount)) + " views";
    }

    elm.addEventListener("click", function (e) {
      overlayElement.style.display = "flex";

      const dataIdx = e.target.offsetParent.getAttribute("data-index");
      const curr = currentResults[dataIdx];

      if (curr.richSnippet.videoobject) {
        overlayIframeElm.setAttribute(
          "src",
          curr.richSnippet.videoobject.embedurl
        );

        detailsTitle.innerHTML = curr["title"];
        detailsViewsCount.innerText =
          truncateViewCount(curr.richSnippet.videoobject.interactioncount) +
          " views";
        activeOverlayLink = curr.richSnippet.videoobject.url;
      }
    });

    return resultCard;
  };

  const onSearchResultReadyCallback = (
    name,
    q,
    promos,
    results,
    resultsDiv
  ) => {
    currentResults = results.sort((first, second) => {
      const firstVideoObj = first.richSnippet.videoobject;
      const secondVideoObj = second.richSnippet.videoobject;

      let firstCompareValue = 0;
      let secondCompareValue = 0;

      if (firstVideoObj)
        firstCompareValue = Number(firstVideoObj.interactioncount);
      if (secondVideoObj)
        secondCompareValue = Number(secondVideoObj.interactioncount);

      return secondCompareValue - firstCompareValue;
    });
  };

  const onResultRenderedCallback = (name, q, promos, results) => {
    let index = 0;
    for (const resultElm of results) {
      resultElm.innerHTML = "";
      const data = currentResults[index];
      const videoObject = data.richSnippet.videoobject;

      if (
        !videoObject ||
        Object.keys(videoObject).length == 0 ||
        (videoObject.genre && videoObject.genre != "Music")
      ) {
        index++;
        continue;
      }
      const resultCard = buildResultCard(data, index);

      resultElm.appendChild(resultCard);
      index++;
    }

    adjustNavigationStyle();
  };

  const onStartSearchCallback = (gname, query) => {
    return `${query}`;
  };

  const onOverlayClose = () => {
    overlayElement.style.display = "none";
    overlayIframeElm.setAttribute("src", "");
  };

  const onOverlayVisit = () => {
    overlayElement.style.display = "none";
    overlayVisitBtn.parentElement.href = activeOverlayLink;
  };

  closeOverlayBtn.addEventListener("click", onOverlayClose);
  overlayVisitBtn.addEventListener("click", onOverlayVisit);

  window.__gcse || (window.__gcse = {});
  // (window.__gcse.parsetags = 'explicit'),
  window.__gcse.searchCallbacks = {
    web: {
      starting: onStartSearchCallback,
      ready: onSearchResultReadyCallback,
      rendered: onResultRenderedCallback,
    },
  };
});

window.onload = () => {
  // modify placeholder and style for search box
  const inputBox = document.getElementById("gsc-i-id1");
  inputBox.placeholder = "Search...";
  inputBox.style.paddingLeft = "0.5rem";
  document.querySelector(".gscb_a").style.display = "none";
};
