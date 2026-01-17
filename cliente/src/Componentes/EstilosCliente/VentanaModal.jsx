import React from "react";
import PropTypes from "prop-types";
import { contenidosModalClasses } from "./EstilosClientes";

const sizeMap = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
  full: "max-w-[90vw]",
  "2xl": "max-w-screen-2xl",
};

const bodyBaseClass = "space-y-4";

export const VentanaModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer = null,
  size = "md",
  showClose = true,
  contentClassName = "",
  bodyClassName = "",
  maxWidthClass = "",
  headerSlot = null,
}) => {
  if (!isOpen) {
    return null;
  }

  const resolvedSizeClass = maxWidthClass || sizeMap[size] || sizeMap.md;
  const contentClasses =
    `${contenidosModalClasses.content} ${resolvedSizeClass} ${contentClassName}`.trim();
  const bodyClasses =
    `${contenidosModalClasses.body} ${bodyBaseClass} ${bodyClassName}`.trim();

  const subtitleNode = (() => {
    if (!subtitle) {
      return null;
    }
    if (typeof subtitle === "string") {
      return <p className="text-sm text-slate-500">{subtitle}</p>;
    }
    return <div className="text-sm text-slate-500">{subtitle}</div>;
  })();

  return (
    <div
      className={contenidosModalClasses.overlay}
      role="dialog"
      aria-modal="true"
    >
      <div className={contentClasses}>
        <div className={contenidosModalClasses.header}>
          <div className="flex flex-col gap-1">
            <h2 className={contenidosModalClasses.title}>{title}</h2>
            {subtitleNode}
          </div>
          <div className="flex items-center gap-2">
            {headerSlot}
            {showClose ? (
              <button
                type="button"
                onClick={onClose}
                className={contenidosModalClasses.closeButton}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>
        <div className={bodyClasses}>{children}</div>
        {footer ? (
          <div className={`${contenidosModalClasses.footer}`}>{footer}</div>
        ) : null}
      </div>
    </div>
  );
};

VentanaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.node,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "full", "2xl"]),
  showClose: PropTypes.bool,
  contentClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  maxWidthClass: PropTypes.string,
  headerSlot: PropTypes.node,
};

export default VentanaModal;
