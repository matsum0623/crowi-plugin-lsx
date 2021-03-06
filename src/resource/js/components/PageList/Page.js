import React from 'react';
import PropTypes from 'prop-types';

import { LsxContext } from '../../util/LsxContext';
import { PageListMeta } from './PageListMeta';
import { PagePath } from './PagePath';
import { PageNode } from '../PageNode';

export class Page extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isExists: false,
      isLinkable: false,
      hasChildren: false,
    };
  }

  componentWillMount() {
    const pageNode = this.props.pageNode;

    if (pageNode.page !== undefined) {
      this.setState({isExists: true});
    }
    if (pageNode.children.length > 0) {
      this.setState({hasChildren: true});
    }

    // process depth option
    const optDepth = this.props.lsxContext.getOptDepth();
    if (optDepth === undefined) {
      this.setState({isLinkable: true});
    }
    else {
      const depth = this.props.depth;

      // debug
      // console.log(pageNode.pagePath, {depth, decGens, 'optDepth.start': optDepth.start, 'optDepth.end': optDepth.end});

      const isLinkable = optDepth.start <= depth;
      this.setState({isLinkable});
    }
  }

  getChildPageElement() {
    const pageNode = this.props.pageNode;

    let element = '';

    // create child pages elements
    if (this.state.hasChildren) {
      const pages = pageNode.children.map((pageNode) => {
        return (
          <Page key={pageNode.pagePath} depth={this.props.depth + 1}
            pageNode={pageNode}
            lsxContext={this.props.lsxContext}
          />
        );
      });

      element = <ul className="page-list-ul">{pages}</ul>;
    }

    return element
  }

  getIconElement() {
    return (this.state.isExists)
        ? <i className="fa fa-file-text" aria-hidden="true"></i>
        : <i className="fa fa-file-o" aria-hidden="true"></i>;
  }

  /**
   * return path that omitted slash of the end for specified path
   *
   * @param {string} path
   * @returns
   *
   * @memberOf LsxContext
   */
  omitSlashOfEnd(path) {
    return path.replace((/\/$/), '');
  }

  render() {
    const pageNode = this.props.pageNode;

    // create PagePath element
    let pagePathNode = <PagePath pagePath={pageNode.pagePath} />;
    if (this.state.isLinkable) {
      pagePathNode = <a className="page-list-link" href={this.omitSlashOfEnd(pageNode.pagePath)}>{pagePathNode}</a>;
    }

    // create PageListMeta element
    const pageListMeta = (this.state.isExists) ? <PageListMeta page={pageNode.page} /> : '';

    return (
      <li className="page-list-li">
        <small>{this.getIconElement()}</small> {pagePathNode} {pageListMeta}
        {this.getChildPageElement()}
      </li>
    );
  }
}

Page.propTypes = {
  pageNode: PropTypes.instanceOf(PageNode).isRequired,
  lsxContext: PropTypes.instanceOf(LsxContext).isRequired,
  depth: PropTypes.number,
};
