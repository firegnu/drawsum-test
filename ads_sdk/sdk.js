document.addEventListener("DOMContentLoaded", () => {
  // Set the focus and start listening to key events.
  resetFocus(0);
  document.body.addEventListener("keydown", handleKeydownEvent);

  // try to fix cursor issue
  document.addEventListener('focus', function (e) {
    if (document.querySelector("iframe")) {
      console.log('got game focus with ads iframe!!!');
      if(typeof window.jio_gameSDK !== 'undefined') {
        window.jio_gameSDK.spatialNav(true);
      }
    } else {
      console.log('got game focus without ads iframe!!!');
      if(typeof window.jio_gameSDK !== 'undefined') {
        window.jio_gameSDK.spatialNav(false);
      }
    }
  });
});

// Very basic navigation/focus handler...
var currentIndex = 0;

function resetFocus(index) {
  const items = document.querySelectorAll(".items");
  if (items.length > 0) {
    currentIndex = index;
    items[currentIndex].focus();
  }
}

function nav(move) {
  let old = currentIndex;
  var items = document.querySelectorAll(".items");
  var next = currentIndex + move;
  if (next < 0) {
    next = items.length - 1;
  }
  if (next == items.length) {
    next = 0;
  }
  var targetElement = items[next];
  if (targetElement) {
    targetElement.focus();
  }
  currentIndex = next;
}

function handleKeydownEvent(e) {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowLeft":
      nav(-1);
      break;
    case "ArrowDown":
    case "ArrowRight":
      nav(1);
      break;
  }
}

const KaiDisplayAdsSdk = (frameID) => {
  var adFrameOrigin = "https://jioads.akamaized.net";
  var adFrameSrc = "https://jioads.akamaized.net/betasdk/kaiDisplayAds/testHtml/frame.html";
  let handlers = {};

  const getActiveAdFrame = () => {
    const frame = document.getElementById(frameID);
    return frame ? frame : null;
  };

  /**
   *
   * @param {KeyboardEvent} e
   * @returns
   */
  const onKeydown = (e) => {
    const frame = getActiveAdFrame();
    if (!frame) {
      return;
    }
    // Prevent main frame from handling these keys - just let ad frame handle it
    const ignoreKeys = ["EndCall", "SoftRight", "Backspace"];
    if (ignoreKeys.indexOf(e.key) <= -1) {
      e.preventDefault();
      e.stopPropagation();
    }
    //console.log(e);

    frame.contentWindow.postMessage(
      JSON.stringify({
        event: "keydown",
        args: [e.key],
      }),
      adFrameOrigin
    );
  };

  /**
   * postMessage Event Listener
   * @param {MessageEvent} e
   * @returns
   */
  const onMessage = (e) => {
    //console.log(e);

    // Validation of messages
    console.log('........................................................................');
    console.log(e.origin);
    if (e.origin !== adFrameOrigin) {
      return;
    }
    if (e.data === "ad-frame-exit") {
      const frame = getActiveAdFrame();
      if (frame) {
        frame.remove();
        // close the cursor
        console.log('got ad-frame-exit....... close the cursor');
        window.jio_gameSDK.spatialNav(false);
      }
    }
    let payload;
    try {
      payload = JSON.parse(e.data);
    } catch (e) {
      return;
    }

    if (!payload.event || !payload.args || !payload.frameID) {
      return;
    }

    if (payload.frameID !== frameID) {
      return;
    }

    if (payload.event === "close") {
      const frame = getActiveAdFrame();
      if (frame) {
        frame.remove();
        // close the cursor
        console.log('got ad close event....... close the cursor');
        window.jio_gameSDK.spatialNav(false);
      }
    }
    if (payload.event === "viewability") {
      postViewability();
      // open the cursor
      console.log('got viewability event....... open the cursor');
      window.jio_gameSDK.spatialNav(true);
    }
    if(payload.event === 'click') {
      console.log('...........sdk ads click........debug......');
      const frame = getActiveAdFrame();
      if (frame) {
        console.log('...........sdk ads click...frame...removed........debug......');
        frame.remove();
      }
    }
    if (handlers["ad" + payload.event]) {
      handlers["ad" + payload.event](payload.args);
    }
  };

  const postViewability = () => {
    const frame = getActiveAdFrame();
    if (!frame) {
      return;
    }
    const rect = frame.getBoundingClientRect();

    frame.contentWindow.postMessage(
      JSON.stringify({
        event: "viewability",
        args: [
          rect.top,
          rect.left,
          rect.right,
          rect.bottom,
          rect.width,
          rect.height,
          window.innerWidth,
          window.innerHeight,
        ],
      }),
      adFrameOrigin
    );
  };
  /**
   * Init ad frame
   * @param {HTMLIFrameElement} frame
   */
  const initFrame = (frame, adspot, pkg, adref, cdata, w, h, topmargin, fullscreen, advid, uid) => {
    window.jio_gameSDK.spatialNav(true);
    frame.onload = () => {
      frame.style.display = "block";
    };
    frame.style.display = "none";
    frame.style.width = "" + w + "px";
    frame.style.height = "" + h + "px";
    frame.style.marginTop = "" + topmargin + "px";
    frame.src =
      adFrameSrc +
      "#o=" +
      encodeURIComponent(window.location.origin) + // This parameter must be the origin of main application, not the origin of ad frame
      "&fid=" +
      encodeURIComponent(frameID) +
      "&w=" +
      encodeURIComponent(w) +
      "&h=" +
      encodeURIComponent(h) +
      "&fullscreen=" +
      (fullscreen ? "1" : "0") +
      "&advid=" +
      encodeURIComponent(advid) +
      "&uid=" +
      encodeURIComponent(uid) +
      "&adspot=" +
      encodeURIComponent(adspot) +
      "&pkg=" +
      encodeURIComponent(pkg) +
      "&adref=" +
      encodeURIComponent(adref) +
      "&cdata=" +
      encodeURIComponent(cdata);

    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", onKeydown);
  };

  // Init and go
  return {
    init: (options) => {
      const w = options.banner ? options.banner.w : window.innerWidth;
      const h = options.banner ? options.banner.h : window.innerHeight;
      const topmargin = options.banner.topmargin;
      const adspot = options.banner.adspotkey;
      const pkg = options.banner.pkgname;
      const adref = options.banner.adrefresh;
      const cdata = options.banner.customData;
      const advid = options.banner.advid;
      const uid = options.banner.uid;
      const fullscreen = options.banner ? false : true;
      console.log("IFrame config : " + adspot + " " + pkg + " " + adref + " " + cdata + " " + w + " " + h + " " + fullscreen);
      Object.assign(handlers, options.listeners || {});
      initFrame(document.getElementById(frameID), adspot, pkg, adref, cdata, w, h, topmargin, fullscreen, advid, uid);
    },
    destroy: () => {
      handlers = {};
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKeydown);
    },
  };
};
