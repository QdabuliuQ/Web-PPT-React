/**
 * Wave-3 — 打破「同边距同字号」单调感
 * hero / agenda / pillars / metrics / evidence 各 +1 高反差签名构图。
 * 硬约束：无 transform；text 无 padding；shape 作色块；data-* ↔ CSS。
 */

/** Signature: 左墨区巨型标题 + 右半幅媒体槽（双平面，无叠字） */
export const HERO_BLEED = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;font-family:{{fontTitle}},serif;">
  <div data-element="1" data-type="image" data-asset-key="{{bgImageKey}}" data-image-prompt="{{bgImagePrompt}}" data-image-kind="photo" data-border-radius="0" data-z-index="4" style="position:absolute;left:520px;top:0;width:480px;height:100%;z-index:4;overflow:hidden;"></div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{primary}}" data-z-index="10" style="position:absolute;left:0;top:0;width:520px;height:100%;background:{{primary}};z-index:10;"></div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="12" style="position:absolute;left:520px;top:0;width:6px;height:100%;background:{{secondary}};z-index:12;"></div>
  <div data-element="1" data-type="text" data-font-size="10" data-font-family="{{fontBody}}" data-color="{{eyebrow}}" data-line-height="1.3" data-placement="left-top" data-z-index="30" translate="no" style="position:absolute;left:56px;top:44px;width:400px;font-size:10px;font-family:{{fontBody}},sans-serif;letter-spacing:0.28em;color:{{eyebrow}};line-height:1.3;z-index:30;">{{footer}}</div>
  <div data-element="1" data-type="text" data-font-size="60" data-font-family="{{fontTitle}}" data-color="{{textOnDark}}" data-line-height="1.05" data-placement="left-bottom" data-bold data-z-index="31" style="position:absolute;left:56px;bottom:136px;width:420px;font-size:60px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnDark}};line-height:1.05;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div data-element="1" data-type="text" data-font-size="15" data-font-family="{{fontBody}}" data-color="{{textOnDark}}" data-line-height="1.65" data-placement="left-top" data-z-index="32" style="position:absolute;left:56px;bottom:52px;width:400px;font-size:15px;font-family:{{fontBody}},sans-serif;color:{{textOnDark}};line-height:1.65;z-index:32;text-wrap:pretty;overflow-wrap:anywhere;">{{subtitle}}</div>
</section>`;

/** Signature: 巨型目录号压左，右侧条目错落（杂志 TOC） */
export const AGENDA_FOLIO = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{primary}}" data-z-index="4" style="position:absolute;left:0;top:0;width:280px;height:100%;background:{{primary}};z-index:4;"></div>
  <div data-element="1" data-type="text" data-font-size="12" data-font-family="{{fontBody}}" data-color="{{accentOnPrimary}}" data-line-height="1.3" data-placement="left-top" data-z-index="28" translate="no" style="position:absolute;left:40px;top:48px;width:200px;font-size:12px;font-family:{{fontBody}},sans-serif;letter-spacing:0.2em;color:{{accentOnPrimary}};line-height:1.3;z-index:28;">CONTENTS</div>
  <div data-element="1" data-type="text" data-font-size="36" data-font-family="{{fontTitle}}" data-color="{{textOnDark}}" data-line-height="1.15" data-placement="left-top" data-bold data-z-index="30" style="position:absolute;left:40px;top:200px;width:200px;font-size:36px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnDark}};line-height:1.15;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div style="position:absolute;left:340px;top:56px;width:600px;display:flex;flex-direction:column;gap:22px;">
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <div data-element="1" data-type="text" data-font-size="42" data-font-family="{{fontNumeric}}" data-color="{{accentText}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="28" style="width:72px;flex-shrink:0;font-size:42px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{accentText}};line-height:1;z-index:28;font-variant-numeric:tabular-nums;">01</div>
      <div style="flex:1;min-width:0;padding-top:8px;">
        <div data-element="1" data-type="text" data-font-size="20" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:20px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{i1.title}}</div>
        <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:6px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{i1.body}}</div>
      </div>
    </div>
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <div data-element="1" data-type="text" data-font-size="42" data-font-family="{{fontNumeric}}" data-color="{{accentText}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="28" style="width:72px;flex-shrink:0;font-size:42px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{accentText}};line-height:1;z-index:28;font-variant-numeric:tabular-nums;">02</div>
      <div style="flex:1;min-width:0;padding-top:8px;">
        <div data-element="1" data-type="text" data-font-size="20" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:20px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{i2.title}}</div>
        <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:6px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{i2.body}}</div>
      </div>
    </div>
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <div data-element="1" data-type="text" data-font-size="42" data-font-family="{{fontNumeric}}" data-color="{{accentText}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="28" style="width:72px;flex-shrink:0;font-size:42px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{accentText}};line-height:1;z-index:28;font-variant-numeric:tabular-nums;">03</div>
      <div style="flex:1;min-width:0;padding-top:8px;">
        <div data-element="1" data-type="text" data-font-size="20" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:20px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{i3.title}}</div>
        <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:6px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{i3.body}}</div>
      </div>
    </div>
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <div data-element="1" data-type="text" data-font-size="42" data-font-family="{{fontNumeric}}" data-color="{{accentText}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="28" style="width:72px;flex-shrink:0;font-size:42px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{accentText}};line-height:1;z-index:28;font-variant-numeric:tabular-nums;">04</div>
      <div style="flex:1;min-width:0;padding-top:8px;">
        <div data-element="1" data-type="text" data-font-size="20" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:20px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{i4.title}}</div>
        <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:6px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{i4.body}}</div>
      </div>
    </div>
  </div>
</section>`;

/** Signature: 左通高色柱 + 右三要点错落（非等宽三列） */
export const PILLARS_SPINE = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 48px;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="{{fontBody}}" data-color="{{accentText}}" data-line-height="1.3" data-placement="left-top" data-z-index="28" translate="no" style="width:220px;font-size:11px;font-family:{{fontBody}},sans-serif;letter-spacing:0.18em;color:{{accentText}};line-height:1.3;z-index:28;">PILLARS</div>
  <div data-element="1" data-type="text" data-font-size="34" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.15" data-placement="left-top" data-bold data-z-index="30" style="width:520px;margin-top:10px;font-size:34px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.15;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div style="display:flex;gap:28px;margin-top:36px;align-items:stretch;height:340px;">
    <div style="width:220px;flex-shrink:0;position:relative;">
      <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="{{primary}}" data-border-radius="12" data-z-index="10" style="position:absolute;inset:0;border-radius:12px;background:{{primary}};z-index:10;"></div>
      <div style="position:relative;z-index:30;padding:28px 24px;box-sizing:border-box;">
        <div data-element="1" data-type="icon" aria-hidden="true" data-icon-name="{{p1.iconName}}" data-icon-theme="outline" data-fill="{{secondary}}" data-stroke-width="3" data-z-index="29" style="width:36px;height:36px;z-index:29;"></div>
        <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnDark}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="width:100%;margin-top:20px;font-size:18px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnDark}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{p1.title}}</div>
        <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{textOnDark}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:12px;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{textOnDark}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{p1.body}}</div>
      </div>
    </div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:20px;justify-content:center;">
      <div style="display:flex;gap:16px;align-items:flex-start;">
        <div data-element="1" data-type="icon" aria-hidden="true" data-icon-name="{{p2.iconName}}" data-icon-theme="outline" data-fill="{{primary}}" data-stroke-width="3" data-z-index="29" style="width:32px;height:32px;flex-shrink:0;z-index:29;"></div>
        <div style="flex:1;min-width:0;">
          <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:18px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{p2.title}}</div>
          <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:8px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{p2.body}}</div>
        </div>
      </div>
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{hairline}}" data-z-index="8" style="width:100%;height:1px;background:{{hairline}};z-index:8;"></div>
      <div style="display:flex;gap:16px;align-items:flex-start;">
        <div data-element="1" data-type="icon" aria-hidden="true" data-icon-name="{{p3.iconName}}" data-icon-theme="outline" data-fill="{{primary}}" data-stroke-width="3" data-z-index="29" style="width:32px;height:32px;flex-shrink:0;z-index:29;"></div>
        <div style="flex:1;min-width:0;">
          <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:18px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{p3.title}}</div>
          <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:8px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{p3.body}}</div>
        </div>
      </div>
    </div>
  </div>
</section>`;

/** Signature: 主 KPI 巨型压左，右两辅指标叠放 + 底脚注 */
export const METRICS_HERO = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{primary}}" data-z-index="4" style="position:absolute;left:0;top:0;width:100%;height:100%;background:{{primary}};z-index:4;"></div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{accentText}}" data-line-height="1.3" data-placement="left-top" data-z-index="28" translate="no" style="position:absolute;left:56px;top:44px;width:400px;font-size:13px;font-family:{{fontBody}},sans-serif;letter-spacing:0.16em;color:{{accentText}};line-height:1.3;z-index:28;">{{title}}</div>
  <div data-element="1" data-type="text" data-font-size="96" data-font-family="{{fontNumeric}}" data-color="{{textOnDark}}" data-line-height="0.95" data-placement="left-center" data-bold data-z-index="30" style="position:absolute;left:56px;top:160px;width:480px;font-size:96px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{textOnDark}};line-height:0.95;z-index:30;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m1.value}}</div>
  <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontBody}}" data-color="{{textOnDark}}" data-line-height="1.5" data-placement="left-top" data-z-index="31" style="position:absolute;left:56px;top:290px;width:420px;font-size:16px;font-family:{{fontBody}},sans-serif;color:{{textOnDark}};line-height:1.5;z-index:31;overflow-wrap:anywhere;">{{m1.label}}</div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="8" style="position:absolute;left:560px;top:140px;width:3px;height:280px;background:{{secondary}};z-index:8;"></div>
  <div style="position:absolute;left:600px;top:150px;width:340px;display:flex;flex-direction:column;gap:36px;">
    <div>
      <div data-element="1" data-type="text" data-font-size="48" data-font-family="{{fontNumeric}}" data-color="{{accentText}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:48px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{accentText}};line-height:1;z-index:30;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m2.value}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{textOnDark}}" data-line-height="1.5" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:10px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{textOnDark}};line-height:1.5;z-index:31;overflow-wrap:anywhere;">{{m2.label}}</div>
    </div>
    <div>
      <div data-element="1" data-type="text" data-font-size="48" data-font-family="{{fontNumeric}}" data-color="{{accentText}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="32" style="width:100%;font-size:48px;font-family:{{fontNumeric}},serif;font-weight:700;color:{{accentText}};line-height:1;z-index:32;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;">{{m3.value}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{textOnDark}}" data-line-height="1.5" data-placement="left-top" data-z-index="33" style="width:100%;margin-top:10px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{textOnDark}};line-height:1.5;z-index:33;overflow-wrap:anywhere;">{{m3.label}}</div>
    </div>
  </div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.45" data-placement="left-top" data-z-index="40" style="position:absolute;left:56px;bottom:40px;width:888px;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.45;z-index:40;text-wrap:pretty;overflow-wrap:anywhere;">{{footer}}</div>
</section>`;

/** Signature: 顶条标题 + 全宽证据图 + 底三解读（图文分层） */
export const EVIDENCE_STAGE = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="28" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.15" data-placement="left-top" data-bold data-z-index="30" style="position:absolute;left:48px;top:36px;width:700px;font-size:28px;font-family:{{fontTitle}},serif;font-weight:700;color:{{textOnLight}};line-height:1.15;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.45" data-placement="right-top" data-z-index="31" style="position:absolute;right:48px;top:42px;width:200px;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.45;z-index:31;text-align:right;overflow-wrap:anywhere;">{{caption}}</div>
  <div data-element="1" data-type="image" data-asset-key="{{imageKey}}" data-image-prompt="{{imagePrompt}}" data-image-kind="photo" data-border-radius="0" data-z-index="10" style="position:absolute;left:0;top:100px;width:1000px;height:280px;z-index:10;overflow:hidden;"></div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="12" style="position:absolute;left:48px;top:100px;width:6px;height:280px;background:{{secondary}};z-index:12;"></div>
  <div style="position:absolute;left:48px;bottom:36px;width:904px;display:flex;gap:28px;">
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="9" style="width:28px;height:3px;margin-bottom:10px;background:{{secondary}};z-index:9;"></div>
      <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{textOnLight}}" data-line-height="1.5" data-placement="left-top" data-z-index="32" style="width:100%;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{textOnLight}};line-height:1.5;z-index:32;overflow-wrap:anywhere;">{{b1}}</div>
    </div>
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="9" style="width:28px;height:3px;margin-bottom:10px;background:{{secondary}};z-index:9;"></div>
      <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{textOnLight}}" data-line-height="1.5" data-placement="left-top" data-z-index="33" style="width:100%;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{textOnLight}};line-height:1.5;z-index:33;overflow-wrap:anywhere;">{{b2}}</div>
    </div>
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="9" style="width:28px;height:3px;margin-bottom:10px;background:{{secondary}};z-index:9;"></div>
      <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{textOnLight}}" data-line-height="1.5" data-placement="left-top" data-z-index="34" style="width:100%;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{textOnLight}};line-height:1.5;z-index:34;overflow-wrap:anywhere;">{{b3}}</div>
    </div>
  </div>
</section>`;
