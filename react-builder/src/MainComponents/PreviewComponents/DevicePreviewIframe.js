import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function DevicePreviewIframe({
  children,
  iframeClassName,
  bodyClassName,
  rootId,
  title,
}) {
  const iframeRef = useRef(null);
  const [portalNode, setPortalNode] = useState(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let cleanupObserver = null;

    const syncHeadStyles = (doc) => {
      if (!doc) return;
      const existing = doc.head.querySelectorAll(
        '[data-caf-iframe-style-sync="true"]'
      );
      existing.forEach((node) => node.remove());

      const parentHeadStyles = document.querySelectorAll(
        'style, link[rel="stylesheet"]'
      );
      parentHeadStyles.forEach((node) => {
        const clone = node.cloneNode(true);
        clone.setAttribute("data-caf-iframe-style-sync", "true");
        doc.head.appendChild(clone);
      });
    };

    const initIframeDocument = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      doc.open();
      doc.write(`<!doctype html>
        <html>
          <head></head>
          <body class="${bodyClassName}">
            <div id="${rootId}"></div>
          </body>
        </html>`);
      doc.close();

      syncHeadStyles(doc);

      const observer = new MutationObserver(() => {
        syncHeadStyles(doc);
      });
      observer.observe(document.head, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      cleanupObserver = () => observer.disconnect();

      setPortalNode(doc.getElementById(rootId));
    };

    initIframeDocument();

    return () => {
      if (cleanupObserver) cleanupObserver();
    };
  }, [bodyClassName, rootId]);

  return (
    <>
      <iframe ref={iframeRef} title={title} className={iframeClassName} />
      {portalNode ? createPortal(children, portalNode) : null}
    </>
  );
}
