import * as React from 'react';

export const version = '1.0.1';
export const languages = {
  'en': {
    'has': 'Has',
    'no': 'No',
    'alert_missing_background_layer': 'Missing background layer',
    'alert_missing_cover_layer': 'Missing cover layer',
    'alert_only_one_cover': (num) => `There can only be one cover layer.\nThere are now ${num}.\nPlease process before exporting.`,
    'exporting_data': 'Exporting data',
    'dialog_what_is_background_layer': 'What is background layer',
    'dialog_what_is_background_layer_body': () =>
        <div className="body">
          <div>The background layer is used to place an image that remains
            constant and unchanging throughout.
          </div>
          <div>Players can export the background file and set it as a phone
            wallpaper or for other purposes.
          </div>
          <div style={{height: 10}}></div>
          <div className="bigText">How to set up a background layer?</div>
          <div>Photoshop Layer menu-{'>'}New-{'>'}Layer from Background</div>
        </div>,
    'dialog_what_is_cover_layer': 'What is cover layer',
    'dialog_what_is_cover_layer_body': () => {
      return <div className="body">
        <div>
          A cover is to allow players to preview the content easily.
        </div>
        <div>
          The final image will be saved as a proportionally scaled-down version
          to 200x200 pixels.
        </div>
        <div style={{height: 10}}></div>
        <div className="bigText">How to set up a cover layer?</div>
        <div>Set the layer or group name to 'cover' to designate it as the cover
          layer.
        </div>
        <div className="bigText" style={{marginTop: 20}}>
          {/* @ts-ignore */}
          <sp-icon size="m" name="ui:alert"></sp-icon>
          There can only be one layer or group named "cover" at a document!
        </div>
      </div>;
    },
    'dialog_why_not_export': 'The following layer won\'t export.',
    'dialog_why_not_export_body': ({blank, invisible}) =>
        <ul className="body">
          <li>Empty layers will affect the game's performance.</li>
          <li>You can hide unfinished layers.</li>
          <li>{blank} empty layers</li>
          <li>{invisible} hidden layers</li>
          <li className={'smallText'}>
            Note: Hidden empty layers will be counted separately.
          </li>
        </ul>,
    'panel_doc_state': 'Document state',
    'panel_doc_name': 'Document name',
    'panel_doc_cover': 'Cover layer(?)',
    'panel_doc_background': 'Background layer(?)',
    'panel_doc_exported_number': 'Export layers',
    'panel_doc_not_exported_number': 'Not export layers(?)',
    'panel_export_to_folder': 'Export to folder',
    'panel_plz_select_folder': 'Please select a folder',
    'panel_btn_select_folder': 'View',
    'panel_btn_export': 'Export ',
    'panel_no_document': () => <div className="flex-container">
      <div className="row">
        <h2>Please open any psd file</h2>
        <div>Version: v{version}</div>
        <div><a
            href="https://github.com/whimsy-ai/ilp_photoshop_plugin">Github</a>
        </div>
      </div>
    </div>,
  },
  'zh': {
    'has': '有',
    'no': '没有',
    'alert_missing_background_layer': '缺少背景图层',
    'alert_missing_cover_layer': '缺少封面图层',
    'alert_only_one_cover': (num) => `只能有一个封面图层(cover)\n现在有${num}个\n请处理后再导出`,
    'exporting_data': '正在导出数据',
    'dialog_what_is_background_layer': '什么是背景图层',
    'dialog_what_is_background_layer_body': () =>
        <div className="body">
          <div>背景图层用于放置唯一不变的图片内容</div>
          <div>可以让用户导出为图片文件后设置为手机壁纸等用途</div>
          <div style={{height: 10}}></div>
          <div className="bigText">怎么设置背景图层？</div>
          <div>Photoshop图层菜单-{'>'}新建-{'>'}背景图层</div>
        </div>,
    'dialog_what_is_cover_layer': '什么是封面图层',
    'dialog_what_is_cover_layer_body': () => <div className="body">
      <div>
        封面的主要作用是方便玩家预览内容
      </div>
      <div>
        最终会保存为按比例缩放到200x200的图片
      </div>
      <div style={{height: 10}}></div>
      <div className="bigText">怎么设置封面图层？</div>
      <div>将一个有实际内容的图层或组的名称设置为"cover"即可</div>
      <div className="bigText" style={{marginTop: 20}}>
        {/* @ts-ignore */}
        <sp-icon size="m" name="ui:alert"></sp-icon>
        只能有一个"cover"名称的图层或组!
      </div>
    </div>,
    'dialog_why_not_export': '以下图层不会导出',
    'dialog_why_not_export_body': ({blank, invisible}) =>
        <ul className="body">
          <li>因为空图层会影响游戏效果</li>
          <li>可以隐藏未完成的图层</li>
          <li>{blank} 个空图层</li>
          <li>{invisible} 个隐藏的图层</li>
          <li className={'smallText'}>
            注：隐藏的空图层会被分开统计
          </li>
        </ul>,
    'panel_doc_state': '文档信息',
    'panel_doc_name': '文档名称',
    'panel_doc_cover': '封面图层(?)',
    'panel_doc_background': '背景图层(?)',
    'panel_doc_exported_number': '最终导出的图层数量',
    'panel_doc_not_exported_number': '不导出的图层数量(?)',
    'panel_export_to_folder': '导出到文件夹',
    'panel_plz_select_folder': '请选择文件夹',
    'panel_btn_select_folder': '浏览',
    'panel_btn_export': '导出',
    'panel_no_document': () => <div className="flex-container">
      <div className="row">
        <h2>请打开任意PSD文档</h2>
        <div>当前版本: v{version}</div>
        <div><a
            href="https://github.com/whimsy-ai/ilp_photoshop_plugin">Github</a>
        </div>
      </div>
    </div>,
  },
};