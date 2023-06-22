import {Layer} from 'photoshop/dom/Layer';
import {Document} from 'photoshop/dom/Document';

/**
 * 图层是否可见
 * visible = true
 * width > 0 and height > 0
 * @param layer
 * @return boolean
 */
export function layerIsVisible(layer: Layer) {
  let visible = layer.visible;
  if (visible && layer.parent) {
    visible = layerIsVisible(layer.parent);
  }
  return visible;
}

/**
 * 展平所有图层
 * @param doc
 */
export function flatLayers(doc: Document): Layer[] {
  const array = [];

  function _(layer: Layer) {
    if (layer.layers)
      layer.layers.forEach(_);
    else {
      array.push(layer);
    }
  }

  doc.layers.forEach(_);
  return array;
}

/**
 * 隐藏图层
 * @param layer
 */
export function makeInvisible(layer: Layer) {
  setVisible(layer, false);
}

/**
 * 显示图层
 * @param layer
 */
export function makeVisible(layer: Layer) {
  setVisible(layer, true);

  // 隐藏同级的其它图层
  layer.parent?.layers.forEach(l => {
    if (l.id == layer.id) return;
    console.log('隐藏', l.name);
    l.visible = false;
  });
}

/**
 * 需要连带显示/隐藏父级
 */
export function setVisible(layer: Layer, isVisible: boolean) {
  layer.visible = isVisible;

  let parent = layer.parent;
  while (parent) {
    if (!parent.visible) {
      parent.visible = isVisible;
    }
    parent = parent.parent;
  }
}