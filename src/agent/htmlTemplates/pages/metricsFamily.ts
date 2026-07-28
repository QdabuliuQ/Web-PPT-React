/**
 * KPI 族 — frontend-design + web-design-guidelines
 * 节奏：padding 44×56；内容宽 888；tabular-nums；divider 实色无 opacity。
 */

/** Signature: 账本式横线分隔的三项左对齐大数字 */
export const METRICS_LEDGER = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="{{fontBody}}" data-color="{{accentText}}" data-line-height="1.3" data-placement="left-top" data-z-index="28" translate="no" style="width:240px;font-size:11px;font-family:{{fontBody}},sans-serif;letter-spacing:0.18em;color:{{accentText}};line-height:1.3;z-index:28;">KEY RESULTS</div>
  <div data-element="1" data-type="text" data-font-size="34" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.15" data-placement="left-top" data-bold data-z-index="30" style="width:888px;margin-top:8px;font-size:34px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.155;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{hairline}}" data-z-index="10" style="width:888px;height:1px;margin-top:20px;background:{{hairline}};z-index:10;"></div>
  <div style="display:flex;align-items:flex-end;gap:0;margin-top:36px;width:888px;">
    <div style="flex:1;min-width:0;padding-right:28px;box-sizing:border-box;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:40px;height:3px;margin-bottom:18px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="56" data-font-family="{{fontNumeric}}" data-color="{{primaryText}}" data-line-height="1" data-placement="left-bottom" data-bold data-z-index="30" style="width:100%;font-size:56px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{primaryText}};line-height:1;z-index:30;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m1.value}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:14px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{m1.label}}</div>
    </div>
    <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{divider}}" data-z-index="9" style="width:1px;height:180px;align-self:flex-end;background:{{divider}};z-index:9;flex-shrink:0;"></div>
    <div style="flex:1;min-width:0;padding:0 28px;box-sizing:border-box;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:40px;height:3px;margin-bottom:18px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="56" data-font-family="{{fontNumeric}}" data-color="{{primaryText}}" data-line-height="1" data-placement="left-bottom" data-bold data-z-index="32" style="width:100%;font-size:56px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{primaryText}};line-height:1;z-index:32;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m2.value}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="33" style="width:100%;margin-top:14px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:33;overflow-wrap:anywhere;">{{m2.label}}</div>
    </div>
    <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{divider}}" data-z-index="9" style="width:1px;height:180px;align-self:flex-end;background:{{divider}};z-index:9;flex-shrink:0;"></div>
    <div style="flex:1;min-width:0;padding-left:28px;box-sizing:border-box;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:40px;height:3px;margin-bottom:18px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="56" data-font-family="{{fontNumeric}}" data-color="{{primaryText}}" data-line-height="1" data-placement="left-bottom" data-bold data-z-index="34" style="width:100%;font-size:56px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{primaryText}};line-height:1;z-index:34;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m3.value}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="35" style="width:100%;margin-top:14px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:35;overflow-wrap:anywhere;">{{m3.label}}</div>
    </div>
  </div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.5" data-placement="left-top" data-z-index="40" style="width:888px;margin-top:40px;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.5;z-index:40;text-wrap:pretty;overflow-wrap:anywhere;">{{footer}}</div>
</section>`;

/** Signature: 主色横贯色带承载三项（数字站在色带上） */
export const METRICS_BAND = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="32" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.2" data-placement="left-top" data-bold data-z-index="30" style="position:absolute;left:56px;top:44px;width:888px;font-size:32px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.2;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{primary}}" data-z-index="5" style="position:absolute;left:0;top:148px;width:100%;height:248px;background:{{primary}};z-index:5;"></div>
  <div style="position:absolute;left:56px;top:200px;width:888px;display:flex;gap:40px;z-index:20;">
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="text" data-font-size="52" data-font-family="{{fontNumeric}}" data-color="{{textOnDark}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:52px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{textOnDark}};line-height:1;z-index:30;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m1.value}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{textOnDark}}" data-line-height="1.45" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:14px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{textOnDark}};line-height:1.45;z-index:31;overflow-wrap:anywhere;">{{m1.label}}</div>
    </div>
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="text" data-font-size="52" data-font-family="{{fontNumeric}}" data-color="{{textOnDark}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="32" style="width:100%;font-size:52px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{textOnDark}};line-height:1;z-index:32;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m2.value}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{textOnDark}}" data-line-height="1.45" data-placement="left-top" data-z-index="33" style="width:100%;margin-top:14px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{textOnDark}};line-height:1.45;z-index:33;overflow-wrap:anywhere;">{{m2.label}}</div>
    </div>
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="text" data-font-size="52" data-font-family="{{fontNumeric}}" data-color="{{textOnDark}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="34" style="width:100%;font-size:52px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{textOnDark}};line-height:1;z-index:34;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m3.value}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{textOnDark}}" data-line-height="1.45" data-placement="left-top" data-z-index="35" style="width:100%;margin-top:14px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{textOnDark}};line-height:1.45;z-index:35;overflow-wrap:anywhere;">{{m3.label}}</div>
    </div>
  </div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.5" data-placement="left-top" data-z-index="40" style="position:absolute;left:56px;bottom:40px;width:888px;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.5;z-index:40;text-wrap:pretty;overflow-wrap:anywhere;">{{footer}}</div>
</section>`;

/** Signature: 左侧巨数垄断视觉，右侧两项辅指标 */
export const METRICS_FOCUS = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="32" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.2" data-placement="left-top" data-bold data-z-index="30" style="width:888px;font-size:32px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.2;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div style="display:flex;gap:48px;margin-top:36px;align-items:stretch;">
    <div style="flex:1.35;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:40px;height:3px;margin-bottom:20px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="96" data-font-family="{{fontNumeric}}" data-color="{{primaryText}}" data-line-height="1" data-placement="left-bottom" data-bold data-z-index="30" style="width:100%;font-size:96px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{primaryText}};line-height:1;z-index:30;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m1.value}}</div>
      <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:18px;font-size:16px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{m1.label}}</div>
    </div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:36px;padding-top:24px;">
      <div>
        <div data-element="1" data-type="text" data-font-size="42" data-font-family="{{fontNumeric}}" data-color="{{primaryText}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="32" style="width:100%;font-size:42px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{primaryText}};line-height:1;z-index:32;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m2.value}}</div>
        <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.45" data-placement="left-top" data-z-index="33" style="width:100%;margin-top:8px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.45;z-index:33;overflow-wrap:anywhere;">{{m2.label}}</div>
      </div>
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{hairline}}" data-z-index="8" style="width:100%;height:1px;background:{{hairline}};z-index:8;"></div>
      <div>
        <div data-element="1" data-type="text" data-font-size="42" data-font-family="{{fontNumeric}}" data-color="{{primaryText}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="34" style="width:100%;font-size:42px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{primaryText}};line-height:1;z-index:34;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m3.value}}</div>
        <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.45" data-placement="left-top" data-z-index="35" style="width:100%;margin-top:8px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.45;z-index:35;overflow-wrap:anywhere;">{{m3.label}}</div>
      </div>
    </div>
  </div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.5" data-placement="left-top" data-z-index="40" style="width:888px;margin-top:28px;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.5;z-index:40;text-wrap:pretty;overflow-wrap:anywhere;">{{footer}}</div>
</section>`;
