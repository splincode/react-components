import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { findDOMNode } from "react-dom";
import { deprecate } from "react-is-deprecated";

import ThemedComponent from "../utils/theming/ThemedComponent";
import styles from "./styles.css";
import View from "../core/View/";
import FocusJail from "../utils/FocusJail";

import Body from "./Body";
import CloseButton from "./CloseButton";
import Footer from "./Footer";
import Header from "./Header";
import Title from "./Title";

export default class Modal extends ThemedComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    dir: PropTypes.oneOf(["ltr", "rtl"]),
    hidden: PropTypes.bool,
    onClose: PropTypes.func,
    size: PropTypes.oneOf(["medium", "large"]),
    type: deprecate(
      PropTypes.oneOf(["default", "transparent", "lightbox"]),
      "The Modal component 'type' prop is deprecated and will be removed in a future version."
    ),
    testId: PropTypes.string,
    width: PropTypes.string
  };

  static defaultProps = {
    dir: "ltr",
    hidden: false,
    size: "medium"
  };

  static Body = Body;
  static CloseButton = CloseButton;
  static Footer = Footer;
  static Header = Header;
  static Title = Title;

  constructor(props, context) {
    super(props, context, {
      namespace: "Modal",
      styles
    });
  }

  componentDidUpdate(prevProps) {
    const { hidden } = this.props;
    const { hidden: prevHidden } = prevProps;

    if (!hidden && prevHidden) {
      document.querySelector("html").style.overflow = "hidden";
    } else if (hidden && !prevHidden) {
      document.querySelector("html").style.overflow = "";
      this.tabJail = null;
    }
  }

  onTab = e => {
    this.tabJail && this.tabJail.onTab(e);
  };

  render() {
    const { children, dir, hidden, onClose, size, testId, width } = this.props;

    if (hidden) {
      return null;
    }

    const { theme } = this;

    return (
      <View
        className={classNames(theme.backdrop, theme[dir])}
        onClick={onClose}
        onEscape={onClose}
        onTab={this.onTab}
        ref={ref => {
          if (ref && !this.tabJail) {
            this.tabJail = new FocusJail(findDOMNode(ref).firstChild);
          }
        }}
      >
        <View
          aria-labelledby="dialog-title"
          className={classNames(
            theme.dialog,
            theme[`size_${size}`],
            theme[dir],
            {
              [theme.open]: !hidden
            }
          )}
          onClick={e => e.stopPropagation()}
          role="dialog"
          style={{ width }}
          tabIndex={-1}
          testId={testId}
        >
          {children}
        </View>
      </View>
    );
  }
}
