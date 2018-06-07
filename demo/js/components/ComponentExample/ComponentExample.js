import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'carbon-components-react';
import classnames from 'classnames';

import CodeExample from '../CodeExample/CodeExample';

const forEach = Array.prototype.forEach;

/**
 * The UI to show live code as well as its source.
 */
class ComponentExample extends Component {
  static propTypes = {
    /**
     * The source code.
     */
    htmlFile: PropTypes.string,

    /**
     * The component name.
     */
    component: PropTypes.string,

    /**
     * The component variant name.
     */
    variant: PropTypes.string,

    /**
     * `true` to hide "view full render" link.
     */
    hideViewFullRender: PropTypes.bool,

    /**
     * `true` to use `<iframe>`.
     */
    useIframe: PropTypes.bool,

    /**
     * The slug of the CodePen link.
     */
    codepenSlug: PropTypes.string,
  };

  componentDidMount() {
    this._instantiateComponents();
  }

  componentWillUpdate({ component, htmlFile }) {
    const { component: prevComponent, htmlFile: prevHtmlFile } = this.props;
    if (prevComponent !== component || prevHtmlFile !== htmlFile) {
      this._releaseComponents();
    }
  }

  componentDidUpdate({ component, htmlFile }) {
    const { component: prevComponent, htmlFile: prevHtmlFile } = this.props;
    if (prevComponent !== component || prevHtmlFile !== htmlFile) {
      this._instantiateComponents();
    }
  }

  componentWillUnmount() {
    this._releaseComponents();
  }

  /**
   * The container where the live demo HTML code should be put into.
   * @type {HTMLElement}
   * @private
   */
  _container = null;

  /**
   * Instantiate/release Carbon components as the container for the live demo HTML code is mounted/unmounted.
   * @param {HTMLElement} container The container where the live demo HTML code should be put into.
   */
  _setContainer = container => {
    this._container = container;
  };

  /**
   * Instantiates Carbon components for non-`<iframe>` mode.
   */
  _instantiateComponents = () => {
    const container = this._container;
    const components = container.ownerDocument.defaultView.CarbonComponents;
    if (components) {
      const componentClasses = Object.keys(components)
        .map(key => components[key])
        .filter(Clz => typeof Clz.init === 'function');
      componentClasses.filter(Clz => !Clz.forLazyInit).forEach(Clz => {
        Clz.init(container);
      });
    }
  };

  /**
   * Releases Carbon components for non-`<iframe>` mode.
   */
  _releaseComponents = () => {
    const container = this._container;
    const components = container.ownerDocument.defaultView.CarbonComponents;
    if (components) {
      Object.keys(components)
        .map(key => components[key])
        .filter(Clz => typeof Clz.init === 'function')
        .forEach(Clz => {
          forEach.call(container.querySelectorAll(Clz.options.selectorInit), element => {
            const instance = Clz.components.get(element);
            if (instance) {
              instance.release();
            }
          });
        });
    }
  };

  render() {
    const { htmlFile, component, variant, codepenSlug, hideViewFullRender, useIframe } = this.props;

    const classNamesContainer = classnames('component-example__live', {
      'component-example__live--with-iframe': useIframe,
    });

    const classNames = classnames('component-example__live--rendered', {
      [component]: true,
    });

    const lightUIclassnames = classnames({
      'component-example': true,
      'bx--global-light-ui': component === 'tabs',
    });

    const codepenLink = codepenSlug && `https://codepen.io/team/carbon/full/${codepenSlug}/`;
    const variantSuffix = (component === variant && '--default') || '';
    const componentLink = variant ? `/component/${variant}${variantSuffix}` : `/component/${component}`;

    const viewFullRender = hideViewFullRender ? null : (
      <Link className="component-example__view-full-render" target="_blank" href={codepenLink || componentLink}>
        {codepenLink ? 'View on CodePen' : 'View full render'}
      </Link>
    );

    /* eslint-disable react/no-danger */
    return (
      <div className={lightUIclassnames}>
        <div className="svg--sprite" aria-hidden="true" />
        <div className={classNamesContainer}>
          {useIframe ? (
            <iframe
              className={classNames}
              data-role="window"
              src={componentLink}
              sandbox="allow-same-origin allow-scripts allow-forms"
              marginWidth="0"
              marginHeight="0"
              frameBorder="0"
              vspace="0"
              hspace="0"
              scrolling="yes"
              ref={this._setContainer}
            />
          ) : (
            <div className={classNames}>
              <div dangerouslySetInnerHTML={{ __html: htmlFile }} ref={this._setContainer} />
            </div>
          )}
          {viewFullRender}
        </div>
        <CodeExample htmlFile={htmlFile} />
      </div>
    );
    /* eslint-enable react/no-danger */
  }
}

export default ComponentExample;
