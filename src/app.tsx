import * as React from 'react';

import Ps, {action, app, core} from 'photoshop';
import {Document} from 'photoshop/dom/Document';
import {Layer} from 'photoshop/dom/Layer';
import {storage} from 'uxp';
import {documentState, hideAllLayers, reset} from './document';
import {flatLayers, layerIsVisible, makeInvisible, makeVisible} from './layer';
import {languages} from './languages';

const formats = require('uxp').storage.formats;
const {TrimType, PNGMethod, SaveOptions} = require('photoshop').constants;

const ui = languages[require('uxp').
    host.
    uiLocale.toLocaleLowerCase().includes('zh') ? 'zh' : 'en'];

interface LayerData {
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  file?: string;
  layers?: LayerData[];
}

interface ImageData {
  name: string;
  width: number;
  height: number;
  cover: string;
  background: string;
  layers: LayerData[];
}

interface IAppProps {
}

interface IAppState {
  doc?: Document;
  exportFolder?: storage.Folder | undefined;
  state: {
    all: number,
    blank: number,
    visible: number,
    invisible: number,
    valid: number,
    cover: number,
    background: boolean,
  };
}

class App extends React.Component<IAppProps, IAppState> {
  private readonly $whyUnexportDialog = React.createRef<HTMLDialogElement>();
  private readonly $whatIsCoverDialog = React.createRef<HTMLDialogElement>();
  private readonly $whatIsBGDialog = React.createRef<HTMLDialogElement>();
  private readonly $savePathInput = React.createRef<HTMLInputElement>();

  constructor(props: any) {
    super(props);
    this.state = {
      doc: app.activeDocument,
      state: {
        all: 0,
        blank: 0,
        visible: 0,
        invisible: 0,
        valid: 0,
        cover: 0,
        background: false,
      },
    };

    this.documentChanged = this.documentChanged.bind(this);
    this.whyUnexport = this.whyUnexport.bind(this);
    this.whatIsCover = this.whatIsCover.bind(this);
    this.whatIsBG = this.whatIsBG.bind(this);
    this.selectFolder = this.selectFolder.bind(this);
    this.export = this.export.bind(this);

    Ps.action.addNotificationListener([
      'hostFocusChanged',
      'open',
      'close',
      'select',
      'layersFiltered',
      'historyStateChanged',
      'show',
      'hide',
      'move',
      'save',
    ], this.documentChanged);

    storage.localFileSystem.getTemporaryFolder().
        then(f => console.log('临时目录', f.nativePath));
    storage.localFileSystem.getPluginFolder().
        then(f => console.log('插件目录', f.nativePath));
  }

  documentChanged(e) {
    // console.log('documentChanged', e, app.activeDocument);
    const current = app.activeDocument;
    if (current) {
      this.setState(
          {
            doc: current,
            state: documentState(current),
          });
    } else {
      this.setState(
          {
            doc: null,
            state: {
              all: 0,
              blank: 0,
              visible: 0,
              invisible: 0,
              valid: 0,
              cover: 0,
              background: false,
            },
          });
    }
  }

  async selectFolder() {
    const folder = await storage.localFileSystem.getFolder({});
    this.setState({exportFolder: folder});
    return folder;
  }

  async export() {
    if (this.state.doc.backgroundLayer == null) {
      return app.showAlert(ui.alert_missing_background_layer);
    }
    if (this.state.state.cover == 0) {
      return app.showAlert(ui.alert_missing_cover_layer);
    } else if (this.state.state.cover > 1) {
      return app.showAlert(ui.alert_only_one_cover(this.state.state.cover));
    }
    let exportFolder = this.state.exportFolder;
    if (!this.state.exportFolder) {
      exportFolder = await this.selectFolder();
      if (!exportFolder) return;
    }
    const tempFolder = await storage.localFileSystem.getTemporaryFolder();

    const commandName = ui.exporting_data;

    await core.executeAsModal(async (context) => {
      const docName = app.activeDocument.name.replace(/\.psd/i, '');
      const doc = await app.activeDocument.duplicate();
      const {width: docWidth, height: docHeight} = doc;
      context.reportProgress({value: 0, commandName});
      // 缓存要导出的图层id
      const exportLayers = flatLayers(doc).
          filter(l => layerIsVisible(l)).
          map(l => l.id);

      const data: ImageData = {
        name: docName,
        width: docWidth,
        height: docHeight,
        cover: null,
        background: null,
        layers: [],
      };

      hideAllLayers(doc);

      let index = 0;

      async function process(group: any[], target: Document | Layer) {
        const isLayer = target.typename == 'Layer';
        const isCover = isLayer && target.name.toLowerCase() == 'cover';
        const isGroup = !!target.layers;

        function makeFile() {
          return exportFolder.createFile(`${docName}_${index}.png`,
              {overwrite: true});
        }

        function increaseProgress() {
          context.reportProgress({
            value: index / exportLayers.length,
            commandName,
          });
        }

        if (isCover || !isGroup) {
          target = target as Layer;
          const isVisible = exportLayers.includes(target.id);
          if (!isCover && !isVisible) return;
          const file = await makeFile();
          makeVisible(target);
          const {left, top} = target.bounds;
          await doc.trim(TrimType.TRANSPARENT);

          if (isCover) {
            // 封面按比例缩放到最大为200x200的图片
            await action.batchPlay([
              {
                '_obj': 'imageSize',
                'constrainProportions': true,
                'interfaceIconFrameDimmed': {
                  '_enum': 'interpolationType',
                  '_value': 'automaticInterpolation',
                },
                'scaleStyles': true,
                'width': {'_unit': 'pixelsUnit', '_value': 200},
              },
            ], {commandEnablement: 'normal'});
            // @ts-ignore
            // 保存，压缩等级为6
            await doc.saveAs.png(file, {compression: 6});
            data.cover = file.nativePath;
          } else {
            const {width, height} = target.bounds;
            if (width == 0 || height == 0) return;

            // @ts-ignore
            // 保存无损png
            await doc.saveAs.png(file, {
              compression: 0,
              method: PNGMethod.THOROUGH,
            });
            if (target.isBackgroundLayer) {
              data.background = file.nativePath;
            } else {
              const layerData: LayerData = {
                name: target.name,
                x: left,
                y: top,
                width,
                height,
                file: file.nativePath,
              };
              group.push(layerData);
            }
          }

          reset(doc);
          makeInvisible(target);
          index++;
          increaseProgress();
        } else if (isGroup) {
          for (let layer of target.layers) {
            if (layer.layers) {
              const _group: LayerData = {
                name: layer.name,
                layers: [],
              };
              await process(_group.layers, layer);
              if (_group.layers.length) group.push(_group);
            } else {
              await process(group, layer);
            }
          }
        } else {
          target = target as Layer;
          if (!exportLayers.includes(target.id)) return;

          const {width, height} = target.bounds;
          if (width == 0 || height == 0) return;
          const file = await makeFile();
          makeVisible(target);
          await doc.trim(TrimType.TRANSPARENT);
          // @ts-ignore
          // 无损png
          await doc.saveAs.png(file, {
            compression: 0,
            method: PNGMethod.THOROUGH,
          });
          if (target.isBackgroundLayer) {
            data.background = file.nativePath;
          } else {
            const {left, top} = target.bounds;
            const layerData: LayerData = {
              name: target.name,
              x: left,
              y: top,
              width,
              height,
              file: file.nativePath,
            };
            group.push(layerData);
          }

          reset(doc);
          makeInvisible(target);
          index++;
          increaseProgress();
        }
      }

      try {
        await process(data.layers, doc);
      } catch (e) {
        console.error(e);
      }

      // 保存json
      const json = await exportFolder.createFile(`${docName}_config.json`,
          {overwrite: true});
      await json.write(JSON.stringify(data), {format: formats.utf8});
      context.reportProgress({
        value: 1,
        commandName,
      });

      await doc.close(SaveOptions.DONOTSAVECHANGES);
    }, {commandName});
  }

  whyUnexport() {
    // @ts-ignore
    this.$whyUnexportDialog.current.uxpShowModal({
      title: ui.dialog_why_not_export,
      resize: 'horizontal', // "both", "horizontal", "vertical",
      size: {width: 400},
    });
  }

  whatIsCover() {
    // @ts-ignore
    this.$whatIsCoverDialog.current.uxpShowModal({
      title: ui.dialog_what_is_cover_layer,
      resize: 'horizontal', // "both", "horizontal", "vertical",
      size: {width: 400},
    });
  }

  whatIsBG() {
    // @ts-ignore
    this.$whatIsBGDialog.current.uxpShowModal({
      title: ui.dialog_what_is_background_layer,
      resize: 'horizontal', // "both", "horizontal", "vertical",
      size: {width: 400},
    });
  }

  render() {
    return (
        <div>
          {!this.state.doc ? ui.panel_no_document()
              : (
                  <ul>
                    <li className="title">{ui.panel_doc_state}</li>
                    <li style={{
                      display: 'flex',
                    }}
                        className="content"
                    >
                      <ul style={{
                        marginRight: 16,
                        flexGrow: 0,
                        flexShrink:0,
                        flexBasis:150,
                      }}>
                        <li>{ui.panel_doc_name}</li>
                        <li className="pointer" onClick={this.whatIsCover}>
                          {ui.panel_doc_cover}
                          <dialog ref={this.$whatIsCoverDialog}>
                            {ui.dialog_what_is_cover_layer_body()}
                          </dialog>
                        </li>
                        <li className="pointer" onClick={this.whatIsBG}>
                          {ui.panel_doc_background}
                          <dialog ref={this.$whatIsBGDialog}>
                            {ui.dialog_what_is_background_layer_body()}
                          </dialog>
                        </li>
                        <li>{ui.panel_doc_exported_number}</li>
                        <li className="pointer" onClick={this.whyUnexport}>
                          {ui.panel_doc_not_exported_number}
                          <dialog ref={this.$whyUnexportDialog}>
                            {ui.dialog_why_not_export_body(this.state.state)}
                          </dialog>
                        </li>
                      </ul>
                      <ul>
                        <li style={{
                          maxWidth: 200,
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'clip',
                        }}
                            title={this.state.doc.name}>{this.state.doc.name}</li>
                        <li>{this.state.state.cover > 0 ? ui.has : ui.no}</li>
                        <li>{this.state.state.background ? ui.has : ui.no}</li>
                        <li>{this.state.state.valid}</li>
                        <li>{this.state.state.all - this.state.state.valid}</li>
                      </ul>
                    </li>
                    <li className="title">{ui.panel_export_to_folder}</li>
                    <li className="content">
                      <input
                          value={this.state.exportFolder?.nativePath ??
                              ui.panel_plz_select_folder}
                          ref={this.$savePathInput}
                          style={{width: 180}}
                          readOnly={true}/>
                      <button
                          onClick={this.selectFolder}>
                        {ui.panel_btn_select_folder}
                      </button>
                      <div>
                        <button onClick={this.export}
                                disabled={this.state.state.valid == 0}>
                          {ui.panel_btn_export}
                        </button>
                      </div>
                      {/*<div>*/}
                      {/*  <button onClick={async () => {*/}
                      {/*  }}>*/}
                      {/*    测试*/}
                      {/*  </button>*/}
                      {/*</div>*/}
                    </li>
                  </ul>
              )
          }
        </div>
    );
  }
}

export default App;