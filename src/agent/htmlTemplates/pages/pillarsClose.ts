/**
 * 要点 + 封底 — frontend-design + web-design-guidelines
 * 节奏：padding 44×56；竖轨与封面同规格；icon 28；序号 01–03。
 */

/** Signature: 去白卡；顶黄铜短线 + 三列开放排版 */
export const PILLARS_OPEN = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px;">
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="text" data-font-size="11" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-z-index="28" translate="no" style="width:240px;font-size:11px;font-family:{{fontBody}},sans-serif;letter-spacing:0.18em;color:{{secondary}};line-height:1.3;z-index:28;">FOCUS AREAS</div>
      <div data-element="1" data-type="text" data-font-size="30" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:100%;margin-top:8px;font-size:30px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
    </div>
    <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:96px;height:3px;margin-bottom:10px;background:{{secondary}};z-index:10;flex-shrink:0;"></div>
  </div>
  <div style="display:flex;margin-top:36px;gap:0;align-items:stretch;">
    <div style="flex:1;min-width:0;padding-right:24px;box-sizing:border-box;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:100%;height:2px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="icon" aria-hidden="true" data-icon-name="{{p1.iconName}}" data-icon-theme="outline" data-fill="{{primary}}" data-stroke-width="3" data-z-index="30" style="width:28px;height:28px;margin-top:22px;z-index:30;"></div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="31" style="width:100%;margin-top:16px;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">{{p1.title}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="width:100%;margin-top:10px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:32;overflow-wrap:anywhere;">{{p1.body}}</div>
    </div>
    <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{divider}}" data-z-index="9" style="width:1px;align-self:stretch;min-height:260px;background:{{divider}};z-index:9;flex-shrink:0;margin:0 8px;"></div>
    <div style="flex:1;min-width:0;padding:0 24px;box-sizing:border-box;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:100%;height:2px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="icon" aria-hidden="true" data-icon-name="{{p2.iconName}}" data-icon-theme="outline" data-fill="{{primary}}" data-stroke-width="3" data-z-index="30" style="width:28px;height:28px;margin-top:22px;z-index:30;"></div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="31" style="width:100%;margin-top:16px;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">{{p2.title}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="width:100%;margin-top:10px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:32;overflow-wrap:anywhere;">{{p2.body}}</div>
    </div>
    <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{divider}}" data-z-index="9" style="width:1px;align-self:stretch;min-height:260px;background:{{divider}};z-index:9;flex-shrink:0;margin:0 8px;"></div>
    <div style="flex:1;min-width:0;padding-left:24px;box-sizing:border-box;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:100%;height:2px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="icon" aria-hidden="true" data-icon-name="{{p3.iconName}}" data-icon-theme="outline" data-fill="{{primary}}" data-stroke-width="3" data-z-index="30" style="width:28px;height:28px;margin-top:22px;z-index:30;"></div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="31" style="width:100%;margin-top:16px;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">{{p3.title}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="width:100%;margin-top:10px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:32;overflow-wrap:anywhere;">{{p3.body}}</div>
    </div>
  </div>
</section>`;

/** Signature: 真实顺序阶梯（01→03），编号承载信息 */
export const PILLARS_LADDER = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-z-index="28" translate="no" style="width:200px;font-size:11px;font-family:{{fontBody}},sans-serif;letter-spacing:0.18em;color:{{secondary}};line-height:1.3;z-index:28;">APPROACH</div>
  <div data-element="1" data-type="text" data-font-size="28" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:888px;margin-top:8px;font-size:28px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div style="display:flex;flex-direction:column;gap:18px;margin-top:28px;">
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <div data-element="1" data-type="text" data-font-size="26" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="28" style="width:52px;flex-shrink:0;font-size:26px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1;z-index:28;font-variant-numeric:tabular-nums;">01</div>
      <div data-element="1" data-type="icon" aria-hidden="true" data-icon-name="{{p1.iconName}}" data-icon-theme="outline" data-fill="{{primary}}" data-stroke-width="3" data-z-index="29" style="width:28px;height:28px;flex-shrink:0;margin-top:2px;z-index:29;"></div>
      <div style="flex:1;min-width:0;">
        <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{p1.title}}</div>
        <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:6px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{p1.body}}</div>
      </div>
    </div>
    <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{hairline}}" data-z-index="8" style="width:100%;height:1px;background:{{hairline}};z-index:8;"></div>
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <div data-element="1" data-type="text" data-font-size="26" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="28" style="width:52px;flex-shrink:0;font-size:26px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1;z-index:28;font-variant-numeric:tabular-nums;">02</div>
      <div data-element="1" data-type="icon" aria-hidden="true" data-icon-name="{{p2.iconName}}" data-icon-theme="outline" data-fill="{{primary}}" data-stroke-width="3" data-z-index="29" style="width:28px;height:28px;flex-shrink:0;margin-top:2px;z-index:29;"></div>
      <div style="flex:1;min-width:0;">
        <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{p2.title}}</div>
        <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:6px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{p2.body}}</div>
      </div>
    </div>
    <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{hairline}}" data-z-index="8" style="width:100%;height:1px;background:{{hairline}};z-index:8;"></div>
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <div data-element="1" data-type="text" data-font-size="26" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="28" style="width:52px;flex-shrink:0;font-size:26px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1;z-index:28;font-variant-numeric:tabular-nums;">03</div>
      <div data-element="1" data-type="icon" aria-hidden="true" data-icon-name="{{p3.iconName}}" data-icon-theme="outline" data-fill="{{primary}}" data-stroke-width="3" data-z-index="29" style="width:28px;height:28px;flex-shrink:0;margin-top:2px;z-index:29;"></div>
      <div style="flex:1;min-width:0;">
        <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{p3.title}}</div>
        <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:6px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{p3.body}}</div>
      </div>
    </div>
  </div>
</section>`;

/** Signature: 与封面同竖轨，左下收束 + 右上联系 */
export const CLOSE_RAIL = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" data-bg-image-key="{{bgImageKey}}" data-bg-image-prompt="{{bgImagePrompt}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="8" style="position:absolute;left:64px;top:156px;width:5px;height:268px;background:{{secondary}};z-index:8;"></div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.4" data-placement="right-top" data-z-index="30" translate="no" style="position:absolute;right:56px;top:52px;width:360px;font-size:13px;font-family:{{fontBody}},sans-serif;letter-spacing:0.08em;color:{{secondary}};line-height:1.4;text-align:right;z-index:30;">{{contact}}</div>
  <div data-element="1" data-type="text" data-font-size="46" data-font-family="{{fontTitle}}" data-color="{{textOnDark}}" data-line-height="1.14" data-placement="left-bottom" data-bold data-z-index="31" style="position:absolute;left:92px;bottom:136px;width:720px;font-size:46px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnDark}};line-height:1.14;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="position:absolute;left:92px;bottom:68px;width:520px;font-size:16px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:32;text-wrap:pretty;overflow-wrap:anywhere;">{{subtitle}}</div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="5" style="position:absolute;left:0;bottom:0;width:100%;height:3px;background:{{secondary}};z-index:5;"></div>
</section>`;

/** Signature: 极端留白，单句居中收束 */
export const CLOSE_QUIET = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" data-bg-image-key="{{bgImageKey}}" data-bg-image-prompt="{{bgImagePrompt}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="12" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.4" data-placement="left-top" data-z-index="30" translate="no" style="position:absolute;left:56px;top:48px;width:400px;font-size:12px;font-family:{{fontBody}},sans-serif;letter-spacing:0.16em;color:{{muted}};line-height:1.4;z-index:30;">{{contact}}</div>
  <div data-element="1" data-type="text" data-font-size="52" data-font-family="{{fontTitle}}" data-color="{{textOnDark}}" data-line-height="1.12" data-placement="center-center" data-bold data-z-index="31" style="position:absolute;left:100px;top:220px;width:800px;font-size:52px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnDark}};line-height:1.12;text-align:center;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.5" data-placement="center-top" data-z-index="32" style="position:absolute;left:220px;bottom:72px;width:560px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.5;text-align:center;z-index:32;text-wrap:pretty;overflow-wrap:anywhere;">{{subtitle}}</div>
</section>`;
