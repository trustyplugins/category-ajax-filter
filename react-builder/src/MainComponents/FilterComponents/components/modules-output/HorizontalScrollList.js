import React, { useEffect, useRef } from "react";

const handleHorizontalWheel = (element, event) => {
  if (!element || event.deltaY === 0) {
    return;
  }

  if (element.scrollWidth <= element.clientWidth) {
    return;
  }

  const maxScrollLeft = element.scrollWidth - element.clientWidth;
  const atLeft = element.scrollLeft <= 0;
  const atRight = element.scrollLeft >= maxScrollLeft - 1;
  const scrollingDown = event.deltaY > 0;
  const scrollingUp = event.deltaY < 0;

  if ((scrollingDown && atRight) || (scrollingUp && atLeft)) {
    return;
  }

  event.preventDefault();
  element.scrollLeft = Math.max(
    0,
    Math.min(maxScrollLeft, element.scrollLeft + event.deltaY)
  );
};

export default function HorizontalScrollList({
  children,
  className = "caf-terms-list caf-checkbox",
  dataSource = "",
  categoryRelation = "OR",
  multipleTerm = "false",
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const onWheel = (event) => {
      handleHorizontalWheel(element, event);
    };

    element.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <ul
      ref={scrollRef}
      className={className}
      {...(dataSource ? { "data-source": dataSource } : {})}
      {...(categoryRelation ? { "category-relation": categoryRelation } : {})}
      {...(multipleTerm ? { "multiple-term": multipleTerm } : {})}
    >
      {children}
    </ul>
  );
}
