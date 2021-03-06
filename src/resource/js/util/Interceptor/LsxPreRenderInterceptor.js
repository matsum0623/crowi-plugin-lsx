import React from 'react';
import ReactDOM from 'react-dom';

import { BasicInterceptor } from 'crowi-pluginkit';

import { Lsx } from '../../components/Lsx';
import { LsxContext } from '../LsxContext';
import { LsxCacheHelper } from '../LsxCacheHelper';

/**
 * The interceptor for lsx
 *
 *  replace lsx tag to a React target element
 */
export class LsxPreRenderInterceptor extends BasicInterceptor {

  constructor(crowi) {
    super();
    this.crowi = crowi;
    this.crowiForJquery = crowi.getCrowiForJquery();
  }

  /**
   * @inheritdoc
   */
  isInterceptWhen(contextName) {
    return (
      contextName === 'preRenderHtml' ||
      contextName === 'preRenderPreviewHtml'
    );
  }

  /**
   * @inheritdoc
   */
  process(contextName, ...args) {
    const context = Object.assign(args[0]);   // clone
    const markdown = context.markdown;
    const parsedHTML = context.parsedHTML;
    const currentPagePath = context.currentPagePath;
    this.initializeCache(contextName);

    context.lsxContextMap = {};

    // TODO retrieve from args for interceptor
    const fromPagePath = currentPagePath;

    // see: https://regex101.com/r/NQq3s9/4
    context.parsedHTML = parsedHTML.replace(/\$lsx\((?!.*(<br>|\$lsx))(.*)\)/g, (all, group1, group2) => {
      const tagExpression = all;
      const lsxArgs = group2.trim();

      // create contexts
      let lsxContext = new LsxContext();
      lsxContext.currentPagePath = currentPagePath;
      lsxContext.tagExpression = tagExpression;
      lsxContext.fromPagePath = fromPagePath;
      lsxContext.lsxArgs = lsxArgs;

      const renderId = 'lsx-' + this.createRandomStr(8);

      context.lsxContextMap[renderId] = lsxContext;

      // return replace strings
      return this.createReactTargetDom(renderId);
    });

    // resolve
    return Promise.resolve(context);
  }

  createReactTargetDom(renderId) {
    return `<div id="${renderId}" />`;
  }

  /**
   * initialize cache
   *  when contextName is 'preRenderHtml'         -> clear cache
   *  when contextName is 'preRenderPreviewHtml'  -> doesn't clear cache
   *
   * @param {string} contextName
   *
   * @memberOf LsxPreRenderInterceptor
   */
  initializeCache(contextName) {
    if (contextName === 'preRenderHtml') {
      LsxCacheHelper.clearAllStateCaches();
    }
  }

  /**
   * @see http://qiita.com/ryounagaoka/items/4736c225bdd86a74d59c
   *
   * @param {number} length
   * @return random strings
   */
  createRandomStr(length) {
    const bag = "abcdefghijklmnopqrstuvwxyz0123456789";
    let generated = "";
    for (var i = 0; i < length; i++) {
      generated += bag[Math.floor(Math.random() * bag.length)];
    }
    return generated;
  }
}
