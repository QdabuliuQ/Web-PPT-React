/**
 * 叙事页族 — frontend-design + web-design-guidelines
 * 统一：padding 44×56；标题 28；data-*↔CSS 镜像；flex min-width:0；序号 01–03。
 */

/** Signature: 四步议程行，编号即顺序信息 */
export const AGENDA_STEPS = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-z-index="28" translate="no" style="width:200px;font-size:11px;font-family:{{fontBody}},sans-serif;letter-spacing:0.18em;color:{{secondary}};line-height:1.3;z-index:28;">AGENDA</div>
  <div data-element="1" data-type="text" data-font-size="30" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:888px;margin-top:8px;font-size:30px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div style="display:flex;flex-direction:column;gap:22px;margin-top:36px;">
    <div style="display:flex;gap:20px;align-items:baseline;">
      <div data-element="1" data-type="text" data-font-size="20" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="29" style="width:44px;flex-shrink:0;font-size:20px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1;z-index:29;font-variant-numeric:tabular-nums;">01</div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="flex:0 0 200px;min-width:0;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{i1.title}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="flex:1;min-width:0;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{i1.body}}</div>
    </div>
    <div style="display:flex;gap:20px;align-items:baseline;">
      <div data-element="1" data-type="text" data-font-size="20" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="29" style="width:44px;flex-shrink:0;font-size:20px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1;z-index:29;font-variant-numeric:tabular-nums;">02</div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="flex:0 0 200px;min-width:0;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{i2.title}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="flex:1;min-width:0;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{i2.body}}</div>
    </div>
    <div style="display:flex;gap:20px;align-items:baseline;">
      <div data-element="1" data-type="text" data-font-size="20" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="29" style="width:44px;flex-shrink:0;font-size:20px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1;z-index:29;font-variant-numeric:tabular-nums;">03</div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="flex:0 0 200px;min-width:0;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{i3.title}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="flex:1;min-width:0;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{i3.body}}</div>
    </div>
    <div style="display:flex;gap:20px;align-items:baseline;">
      <div data-element="1" data-type="text" data-font-size="20" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="29" style="width:44px;flex-shrink:0;font-size:20px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1;z-index:29;font-variant-numeric:tabular-nums;">04</div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="flex:0 0 200px;min-width:0;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{i4.title}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="flex:1;min-width:0;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{i4.body}}</div>
    </div>
  </div>
</section>`;

/** Signature: 左墨区定问题，右浅区列症状（右栏 flex，防长文重叠） */
export const PROBLEM_SLASH = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{primary}}" data-z-index="5" style="position:absolute;left:0;top:0;width:400px;height:100%;background:{{primary}};z-index:5;"></div>
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-z-index="30" translate="no" style="position:absolute;left:56px;top:44px;width:300px;font-size:11px;font-family:{{fontBody}},sans-serif;letter-spacing:0.18em;color:{{secondary}};line-height:1.3;z-index:30;">THE PROBLEM</div>
  <div data-element="1" data-type="text" data-font-size="32" data-font-family="{{fontTitle}}" data-color="{{textOnDark}}" data-line-height="1.22" data-placement="left-top" data-bold data-z-index="31" style="position:absolute;left:56px;top:120px;width:300px;font-size:32px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnDark}};line-height:1.22;z-index:31;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{textOnDark}}" data-line-height="1.65" data-placement="left-top" data-z-index="32" style="position:absolute;left:56px;top:300px;width:300px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{textOnDark}};line-height:1.65;z-index:32;text-wrap:pretty;overflow-wrap:anywhere;">{{body}}</div>
  <div style="position:absolute;left:460px;top:120px;width:484px;display:flex;flex-direction:column;gap:28px;z-index:20;">
    <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontBody}}" data-color="{{textOnLight}}" data-line-height="1.55" data-placement="left-top" data-z-index="33" style="width:100%;font-size:16px;font-family:{{fontBody}},sans-serif;color:{{textOnLight}};line-height:1.55;z-index:33;overflow-wrap:anywhere;">· {{pt1}}</div>
    <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontBody}}" data-color="{{textOnLight}}" data-line-height="1.55" data-placement="left-top" data-z-index="34" style="width:100%;font-size:16px;font-family:{{fontBody}},sans-serif;color:{{textOnLight}};line-height:1.55;z-index:34;overflow-wrap:anywhere;">· {{pt2}}</div>
    <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontBody}}" data-color="{{textOnLight}}" data-line-height="1.55" data-placement="left-top" data-z-index="35" style="width:100%;font-size:16px;font-family:{{fontBody}},sans-serif;color:{{textOnLight}};line-height:1.55;z-index:35;overflow-wrap:anywhere;">· {{pt3}}</div>
  </div>
</section>`;

/** Signature: 顶黄铜线 + 大序号三流（01–03） */
export const SOLUTION_FLOW = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-z-index="28" translate="no" style="width:200px;font-size:11px;font-family:{{fontBody}},sans-serif;letter-spacing:0.18em;color:{{secondary}};line-height:1.3;z-index:28;">SOLUTION</div>
  <div data-element="1" data-type="text" data-font-size="28" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:888px;margin-top:8px;font-size:28px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div style="display:flex;gap:28px;margin-top:36px;">
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:100%;height:3px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="44" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="28" style="margin-top:18px;width:80px;font-size:44px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1;z-index:28;font-variant-numeric:tabular-nums;">01</div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="margin-top:12px;width:100%;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{s1.title}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="margin-top:10px;width:100%;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{s1.body}}</div>
    </div>
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:100%;height:3px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="44" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="28" style="margin-top:18px;width:80px;font-size:44px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1;z-index:28;font-variant-numeric:tabular-nums;">02</div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="margin-top:12px;width:100%;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{s2.title}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="margin-top:10px;width:100%;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{s2.body}}</div>
    </div>
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:100%;height:3px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="44" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1" data-placement="left-top" data-bold data-z-index="28" style="margin-top:18px;width:80px;font-size:44px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1;z-index:28;font-variant-numeric:tabular-nums;">03</div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="margin-top:12px;width:100%;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{s3.title}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="margin-top:10px;width:100%;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{s3.body}}</div>
    </div>
  </div>
</section>`;

/** Signature: 左证据块 + 右解读条（无固定 height，防裁切） */
export const EVIDENCE_SPLIT = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="28" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:888px;font-size:28px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div style="display:flex;gap:40px;margin-top:32px;align-items:stretch;">
    <div style="flex:1.1;min-width:0;position:relative;min-height:320px;">
      <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="{{primary}}" data-border-radius="8" data-z-index="10" style="position:absolute;inset:0;border-radius:8px;background:{{primary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontBody}}" data-color="{{textOnDark}}" data-line-height="1.55" data-placement="left-top" data-z-index="30" style="position:relative;z-index:30;width:100%;padding:36px;box-sizing:border-box;font-size:16px;font-family:{{fontBody}},sans-serif;color:{{textOnDark}};line-height:1.55;text-wrap:pretty;overflow-wrap:anywhere;">{{caption}}</div>
    </div>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:22px;">
      <div data-element="1" data-type="text" data-font-size="15" data-font-family="{{fontBody}}" data-color="{{textOnLight}}" data-line-height="1.55" data-placement="left-top" data-z-index="31" style="width:100%;font-size:15px;font-family:{{fontBody}},sans-serif;color:{{textOnLight}};line-height:1.55;z-index:31;overflow-wrap:anywhere;">{{b1}}</div>
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="9" style="width:40px;height:3px;background:{{secondary}};z-index:9;"></div>
      <div data-element="1" data-type="text" data-font-size="15" data-font-family="{{fontBody}}" data-color="{{textOnLight}}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="width:100%;font-size:15px;font-family:{{fontBody}},sans-serif;color:{{textOnLight}};line-height:1.55;z-index:32;overflow-wrap:anywhere;">{{b2}}</div>
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="9" style="width:40px;height:3px;background:{{secondary}};z-index:9;"></div>
      <div data-element="1" data-type="text" data-font-size="15" data-font-family="{{fontBody}}" data-color="{{textOnLight}}" data-line-height="1.55" data-placement="left-top" data-z-index="33" style="width:100%;font-size:15px;font-family:{{fontBody}},sans-serif;color:{{textOnLight}};line-height:1.55;z-index:33;overflow-wrap:anywhere;">{{b3}}</div>
    </div>
  </div>
</section>`;

/** Signature: 中线对决，左右对峙 */
export const COMPARE_DUEL = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="28" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:888px;font-size:28px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div style="display:flex;gap:0;margin-top:36px;align-items:stretch;">
    <div style="flex:1;min-width:0;padding-right:36px;box-sizing:border-box;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{primary}}" data-z-index="10" style="width:40px;height:3px;background:{{primary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="22" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="margin-top:20px;width:100%;font-size:22px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{leftTitle}}</div>
      <div data-element="1" data-type="text" data-font-size="15" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.65" data-placement="left-top" data-z-index="31" style="margin-top:16px;width:100%;font-size:15px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.65;z-index:31;overflow-wrap:anywhere;">{{leftBody}}</div>
    </div>
    <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="9" style="width:2px;align-self:stretch;min-height:280px;background:{{secondary}};z-index:9;flex-shrink:0;"></div>
    <div style="flex:1;min-width:0;padding-left:36px;box-sizing:border-box;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:40px;height:3px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="22" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="margin-top:20px;width:100%;font-size:22px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{rightTitle}}</div>
      <div data-element="1" data-type="text" data-font-size="15" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.65" data-placement="left-top" data-z-index="31" style="margin-top:16px;width:100%;font-size:15px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.65;z-index:31;overflow-wrap:anywhere;">{{rightBody}}</div>
    </div>
  </div>
</section>`;

/** Signature: 竖轨引用标记，金句留白（轨宽与封面一致 5px） */
export const BREATH_MARK = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="8" style="position:absolute;left:64px;top:140px;width:5px;height:180px;background:{{secondary}};z-index:8;"></div>
  <div data-element="1" data-type="text" data-font-size="34" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.4" data-placement="left-center" data-bold data-z-index="30" style="position:absolute;left:96px;top:170px;width:760px;font-size:34px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.4;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{quote}}</div>
  <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.4" data-placement="left-top" data-z-index="31" style="position:absolute;left:96px;bottom:96px;width:500px;font-size:13px;font-family:{{fontBody}},sans-serif;letter-spacing:0.08em;color:{{secondary}};line-height:1.4;z-index:31;overflow-wrap:anywhere;">{{attribution}}</div>
</section>`;

/** Signature: 三点人像色块 + 角色横条 */
export const TEAM_STRIP = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="11" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-z-index="28" translate="no" style="width:200px;font-size:11px;font-family:{{fontBody}},sans-serif;letter-spacing:0.18em;color:{{secondary}};line-height:1.3;z-index:28;">TEAM</div>
  <div data-element="1" data-type="text" data-font-size="28" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:888px;margin-top:8px;font-size:28px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div style="display:flex;gap:36px;margin-top:40px;">
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="oval" data-fill="{{primary}}" data-z-index="10" style="width:56px;height:56px;background:{{primary}};border-radius:50%;z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="margin-top:18px;width:100%;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{tm1.name}}</div>
      <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-z-index="31" translate="no" style="margin-top:6px;width:100%;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{secondary}};line-height:1.3;z-index:31;">{{tm1.role}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="margin-top:12px;width:100%;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:32;overflow-wrap:anywhere;">{{tm1.blurb}}</div>
    </div>
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="oval" data-fill="{{primary}}" data-z-index="10" style="width:56px;height:56px;background:{{primary}};border-radius:50%;z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="margin-top:18px;width:100%;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{tm2.name}}</div>
      <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-z-index="31" translate="no" style="margin-top:6px;width:100%;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{secondary}};line-height:1.3;z-index:31;">{{tm2.role}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="margin-top:12px;width:100%;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:32;overflow-wrap:anywhere;">{{tm2.blurb}}</div>
    </div>
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="oval" data-fill="{{primary}}" data-z-index="10" style="width:56px;height:56px;background:{{primary}};border-radius:50%;z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="18" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" style="margin-top:18px;width:100%;font-size:18px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.3;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{tm3.name}}</div>
      <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-z-index="31" translate="no" style="margin-top:6px;width:100%;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{secondary}};line-height:1.3;z-index:31;">{{tm3.role}}</div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.55" data-placement="left-top" data-z-index="32" style="margin-top:12px;width:100%;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.55;z-index:32;overflow-wrap:anywhere;">{{tm3.blurb}}</div>
    </div>
  </div>
</section>`;

/** Signature: 横轴四节点脉搏（轴线与圆点对齐） */
export const TIMELINE_PULSE = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div data-element="1" data-type="text" data-font-size="28" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:888px;font-size:28px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{divider}}" data-z-index="8" style="position:absolute;left:56px;top:196px;width:888px;height:2px;background:{{divider}};z-index:8;"></div>
  <div style="display:flex;margin-top:72px;gap:0;">
    <div style="flex:1;min-width:0;padding-right:12px;">
      <div data-element="1" data-type="shape" data-shape-type="oval" data-fill="{{secondary}}" data-z-index="20" style="width:14px;height:14px;background:{{secondary}};border-radius:50%;z-index:20;"></div>
      <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" translate="no" style="margin-top:18px;width:100%;font-size:16px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1.3;z-index:30;">{{t1.label}}</div>
      <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.5" data-placement="left-top" data-z-index="31" style="margin-top:8px;width:100%;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.5;z-index:31;overflow-wrap:anywhere;">{{t1.detail}}</div>
    </div>
    <div style="flex:1;min-width:0;padding-right:12px;">
      <div data-element="1" data-type="shape" data-shape-type="oval" data-fill="{{secondary}}" data-z-index="20" style="width:14px;height:14px;background:{{secondary}};border-radius:50%;z-index:20;"></div>
      <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" translate="no" style="margin-top:18px;width:100%;font-size:16px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1.3;z-index:30;">{{t2.label}}</div>
      <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.5" data-placement="left-top" data-z-index="31" style="margin-top:8px;width:100%;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.5;z-index:31;overflow-wrap:anywhere;">{{t2.detail}}</div>
    </div>
    <div style="flex:1;min-width:0;padding-right:12px;">
      <div data-element="1" data-type="shape" data-shape-type="oval" data-fill="{{secondary}}" data-z-index="20" style="width:14px;height:14px;background:{{secondary}};border-radius:50%;z-index:20;"></div>
      <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" translate="no" style="margin-top:18px;width:100%;font-size:16px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1.3;z-index:30;">{{t3.label}}</div>
      <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.5" data-placement="left-top" data-z-index="31" style="margin-top:8px;width:100%;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.5;z-index:31;overflow-wrap:anywhere;">{{t3.detail}}</div>
    </div>
    <div style="flex:1;min-width:0;">
      <div data-element="1" data-type="shape" data-shape-type="oval" data-fill="{{secondary}}" data-z-index="20" style="width:14px;height:14px;background:{{secondary}};border-radius:50%;z-index:20;"></div>
      <div data-element="1" data-type="text" data-font-size="16" data-font-family="{{fontTitle}}" data-color="{{secondary}}" data-line-height="1.3" data-placement="left-top" data-bold data-z-index="30" translate="no" style="margin-top:18px;width:100%;font-size:16px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{secondary}};line-height:1.3;z-index:30;">{{t4.label}}</div>
      <div data-element="1" data-type="text" data-font-size="13" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.5" data-placement="left-top" data-z-index="31" style="margin-top:8px;width:100%;font-size:13px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.5;z-index:31;overflow-wrap:anywhere;">{{t4.detail}}</div>
    </div>
  </div>
</section>`;

/** Signature: 主文宽栏 + 侧注窄栏 */
export const NARRATIVE_COLUMN = `<section id="slide" data-page-id="{{pageId}}" data-bg="{{background}}" style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:{{background}};box-sizing:border-box;padding:44px 56px;font-family:{{fontTitle}},sans-serif;">
  <div style="display:flex;gap:48px;">
    <div style="flex:1.65;min-width:0;">
      <div data-element="1" data-type="text" data-font-size="28" data-font-family="{{fontTitle}}" data-color="{{textOnLight}}" data-line-height="1.25" data-placement="left-top" data-bold data-z-index="30" style="width:100%;font-size:28px;font-family:{{fontTitle}},sans-serif;font-weight:700;color:{{textOnLight}};line-height:1.25;z-index:30;text-wrap:balance;overflow-wrap:anywhere;">{{title}}</div>
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{secondary}}" data-z-index="10" style="width:40px;height:3px;margin-top:16px;background:{{secondary}};z-index:10;"></div>
      <div data-element="1" data-type="text" data-font-size="15" data-font-family="{{fontBody}}" data-color="{{muted}}" data-line-height="1.75" data-placement="left-top" data-z-index="31" style="width:100%;margin-top:24px;font-size:15px;font-family:{{fontBody}},sans-serif;color:{{muted}};line-height:1.75;z-index:31;overflow-wrap:anywhere;text-wrap:pretty;">{{body}}</div>
    </div>
    <div style="flex:1;min-width:0;padding-top:8px;">
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="{{hairline}}" data-z-index="8" style="width:100%;height:1px;background:{{hairline}};z-index:8;"></div>
      <div data-element="1" data-type="text" data-font-size="14" data-font-family="{{fontBody}}" data-color="{{textOnLight}}" data-line-height="1.7" data-placement="left-top" data-z-index="32" style="width:100%;margin-top:20px;font-size:14px;font-family:{{fontBody}},sans-serif;color:{{textOnLight}};line-height:1.7;z-index:32;overflow-wrap:anywhere;text-wrap:pretty;">{{aside}}</div>
    </div>
  </div>
</section>`;
