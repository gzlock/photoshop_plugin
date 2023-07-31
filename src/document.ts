import {Document} from 'photoshop/dom/Document';
import {Layer} from 'photoshop/dom/Layer';
import {layerIsVisible} from './layer';

/**
 * 重置到文档被拷贝后的状态
 * @param doc
 */
export function reset(doc: Document) {
  doc.activeHistoryState = doc.historyStates[1];
}

/**
 * 隐藏文档的所有根图层
 * @param doc
 */
export function hideAllLayers(doc: Document) {
  doc.layers.forEach(l => l.visible = false);
}


/**
 * 统计文档的状态
 */
export function documentState(doc: Document) {

  let all = 0;
  let valid = 0;
  let blank = 0;
  let visible = 0;
  let invisible = 0;
  let cover = 0;
  let background = doc.backgroundLayer != null;

  /**
   * @param {Layer} target
   */
  function _counter(target: Document | Layer) {
    if (target.typename == 'Document') {
      target.layers.forEach(_counter);
    } else {
      if (target.isBackgroundLayer) {
        all++;
        valid++;
      } else if (target.name.toLocaleLowerCase() == 'cover') {
        all++;
        valid++;
        cover++;
      } else if (target.layers) {
        target.layers.forEach(_counter);
      } else {
        all++;
        const isVisible = layerIsVisible(target);
        if (isVisible) visible++; else invisible++;
        const bounds = target.bounds;
        const isBlank = bounds.width == 0 || bounds.height == 0;
        if (isBlank) blank++;
        if (isVisible && !isBlank) {
          valid++;
        }
      }
    }
    // for (let index = 0; index < target.layers.length; index++) {
    //   const _layer = target.layers[index];
    //   /// 组
    //   if (_layer.layers) {
    //     _counter(_layer);
    //   }
    //   /// 纯图层
    //   else {
    //     all++;
    //     const bounds = _layer.bounds;
    //     const isVisible = layerIsVisible(_layer);
    //     const isBlank = bounds.width == 0 || bounds.height == 0;
    //     if (isVisible) visible++; else invisible++;
    //     if (isBlank) blank++;
    //     if (isVisible && !isBlank) {
    //       if (_layer.name.toLowerCase() == 'cover') cover++;
    //       valid++;
    //     }
    //   }
    // }
  }

  _counter(doc);
  return {all, blank, visible, invisible, valid, cover, background};
}
