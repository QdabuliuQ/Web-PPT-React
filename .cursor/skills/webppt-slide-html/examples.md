## Metrics KPI（禁止 transform 居中）

卡片内用 flex 居中 + 显式 width，不要 `translate(-50%,-50%)`：

```html
<div style="display:flex;gap:24px;margin-top:24px;">
  <div style="position:relative;flex:1;height:180px;">
    <div data-element="1" data-type="shape" data-shape-type="roundedRect"
      data-fill="#FFFFFF" data-border-radius="14" data-z-index="10"
      style="position:absolute;inset:0;border-radius:14px;background:#fff;z-index:10;"></div>
    <div style="position:relative;z-index:30;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:16px;">
      <div data-element="1" data-type="text"
        data-font-size="48" data-font-family="PingFang SC" data-color="#1B3A5C"
        data-line-height="1" data-placement="center-center" data-bold data-z-index="30"
        style="width:100%;font-size:48px;font-weight:700;color:#1B3A5C;line-height:1;text-align:center;z-index:30;">40%</div>
      <div data-element="1" data-type="text"
        data-font-size="14" data-font-family="PingFang SC" data-color="#1C1C1E"
        data-line-height="1.4" data-placement="center-center" data-z-index="31"
        style="width:100%;font-size:14px;color:#1C1C1E;line-height:1.4;text-align:center;z-index:31;">首屏加载性能提升</div>
    </div>
  </div>
</div>
```

# WebPPT Slide HTML — Examples

Copy structure patterns; replace copy/colors/assets for the brief.

## 0. KPI card（层级正确：底板 z &lt; 文案 z）

```html
<div style="position:relative;width:210px;height:150px;flex-shrink:0;">
  <div data-element="1" data-type="shape"
       data-shape-type="roundedRect" data-fill="#FFFFFF" data-opacity="1"
       data-border-radius="12" data-z-index="10"
       style="position:absolute;inset:0;border-radius:12px;background:#FFFFFF;z-index:10;"></div>
  <div data-element="1" data-type="text"
       data-font-size="44" data-font-family="PingFang SC" data-bold
       data-color="#1A365D" data-line-height="1.2" data-placement="center-center"
       data-z-index="30"
       style="position:relative;z-index:30;font-size:44px;font-family:PingFang SC,sans-serif;font-weight:700;line-height:1.2;color:#1A365D;text-align:center;margin-top:36px;">
    67%
  </div>
  <div data-element="1" data-type="text"
       data-font-size="15" data-font-family="PingFang SC"
       data-color="#2D3748" data-line-height="1.4" data-placement="center-center"
       data-z-index="30"
       style="position:relative;z-index:30;font-size:15px;font-family:PingFang SC,sans-serif;line-height:1.4;color:#2D3748;text-align:center;margin-top:6px;">
    首屏速度提升
  </div>
</div>
```

## 1. Icon + title row (flex align)

```html
<section id="slide" data-bg="#0B1220" data-page-id="page_metrics"
  style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:#0B1220;color:#fff;font-family:PingFang SC,sans-serif;box-sizing:border-box;padding:48px 56px;">

  <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px;">
    <div data-element="1" data-type="icon"
      data-icon-name="Lightning" data-icon-theme="outline" data-fill="#F5B942" data-stroke-width="3"
      data-z-index="30"
      style="width:36px;height:36px;flex-shrink:0;background:#F5B942;border-radius:8px;z-index:30;position:relative;"></div>
    <div data-element="1" data-type="text"
      data-font-size="32" data-font-family="PingFang SC" data-bold
      data-color="#FFFFFF" data-line-height="1.2" data-placement="left-center"
      data-z-index="30"
      style="font-size:32px;font-family:PingFang SC,sans-serif;font-weight:700;line-height:1.2;color:#FFFFFF;z-index:30;position:relative;">增长引擎一览</div>
  </div>

  <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="#F5B942" data-opacity="1"
    data-z-index="10"
    style="width:48px;height:4px;background:#F5B942;margin-bottom:32px;z-index:10;position:relative;"></div>

  <div data-element="1" data-type="text"
    data-font-size="16" data-font-family="PingFang SC" data-color="#B8C0CC"
    data-line-height="1.5" data-placement="left-top" data-z-index="30"
    style="font-size:16px;font-family:PingFang SC,sans-serif;line-height:1.5;max-width:640px;color:#B8C0CC;z-index:30;position:relative;">
    用三条业务指标说明本季进展，保持单页焦点。
  </div>
</section>
```

## 2. Three metric cards

```html
<section id="slide" data-bg="#F7F5F2" data-page-id="page_kpi"
  style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:#F7F5F2;box-sizing:border-box;padding:48px 56px;font-family:PingFang SC,sans-serif;">

  <div data-element="1" data-type="text"
    data-font-size="28" data-font-family="PingFang SC" data-bold
    data-color="#1A1A1A" data-line-height="1.3" data-placement="left-center"
    style="font-size:28px;font-family:PingFang SC,sans-serif;font-weight:700;line-height:1.3;color:#1A1A1A;margin-bottom:36px;">核心指标</div>

  <div style="display:flex;gap:20px;">
    <!-- card 1 -->
    <div style="position:relative;flex:1;height:280px;">
      <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="#FFFFFF"
        data-border-radius="16" data-z-index="10"
        style="position:absolute;inset:0;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.06);z-index:10;"></div>
      <div style="position:relative;padding:28px 24px;display:flex;flex-direction:column;gap:12px;height:100%;box-sizing:border-box;">
        <div data-element="1" data-type="icon" data-icon-name="ChartHistogram" data-icon-theme="outline"
          style="width:28px;height:28px;"></div>
        <div data-element="1" data-type="text" data-font-size="14" data-color="#6B7280" data-placement="left-center"
          style="font-size:14px;color:#6B7280;">月活</div>
        <div data-element="1" data-type="text" data-font-size="40" data-bold data-color="#111827" data-placement="left-center"
          style="font-size:40px;font-weight:700;">128万</div>
        <div data-element="1" data-type="text" data-font-size="14" data-color="#059669" data-placement="left-center"
          style="font-size:14px;color:#059669;">环比 +12%</div>
      </div>
    </div>
    <!-- card 2 -->
    <div style="position:relative;flex:1;height:280px;">
      <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="#FFFFFF"
        data-border-radius="16" data-z-index="10"
        style="position:absolute;inset:0;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.06);z-index:10;"></div>
      <div style="position:relative;padding:28px 24px;display:flex;flex-direction:column;gap:12px;height:100%;box-sizing:border-box;">
        <div data-element="1" data-type="icon" data-icon-name="Aiming" data-icon-theme="outline"
          style="width:28px;height:28px;"></div>
        <div data-element="1" data-type="text" data-font-size="14" data-color="#6B7280" data-placement="left-center"
          style="font-size:14px;color:#6B7280;">转化率</div>
        <div data-element="1" data-type="text" data-font-size="40" data-bold data-color="#111827" data-placement="left-center"
          style="font-size:40px;font-weight:700;">4.6%</div>
        <div data-element="1" data-type="text" data-font-size="14" data-color="#059669" data-placement="left-center"
          style="font-size:14px;color:#059669;">环比 +0.4pt</div>
      </div>
    </div>
    <!-- card 3 -->
    <div style="position:relative;flex:1;height:280px;">
      <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="#FFFFFF"
        data-border-radius="16" data-z-index="10"
        style="position:absolute;inset:0;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.06);z-index:10;"></div>
      <div style="position:relative;padding:28px 24px;display:flex;flex-direction:column;gap:12px;height:100%;box-sizing:border-box;">
        <div data-element="1" data-type="icon" data-icon-name="Peoples" data-icon-theme="outline"
          style="width:28px;height:28px;"></div>
        <div data-element="1" data-type="text" data-font-size="14" data-color="#6B7280" data-placement="left-center"
          style="font-size:14px;color:#6B7280;">付费用户</div>
        <div data-element="1" data-type="text" data-font-size="40" data-bold data-color="#111827" data-placement="left-center"
          style="font-size:40px;font-weight:700;">36万</div>
        <div data-element="1" data-type="text" data-font-size="14" data-color="#059669" data-placement="left-center"
          style="font-size:14px;color:#059669;">环比 +8%</div>
      </div>
    </div>
  </div>
</section>
```

Note: each card’s white panel is a marked `shape`. Flex wrappers are unmarked.

## 3. Image + copy split

```html
<section id="slide" data-bg="#111827" data-page-id="page_story"
  style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:#111827;box-sizing:border-box;padding:48px 56px;font-family:PingFang SC,sans-serif;">

  <div style="display:flex;gap:40px;height:100%;align-items:center;">
    <div style="flex:1;display:flex;flex-direction:column;gap:16px;">
      <div data-element="1" data-type="text"
        data-font-size="34" data-bold data-color="#F9FAFB" data-placement="left-center"
        style="font-size:34px;font-weight:700;line-height:1.25;">从洞察到行动</div>
      <div data-element="1" data-type="shape" data-shape-type="rect" data-fill="#38BDF8"
        style="width:40px;height:4px;background:#38BDF8;"></div>
      <div data-element="1" data-type="text"
        data-font-size="16" data-color="#D1D5DB" data-placement="left-top" data-line-height="1.55"
        style="font-size:16px;line-height:1.55;color:#D1D5DB;">
        左侧叙事、右侧视觉。图片节点用 asset-key 占位，渲染前替换 src 再测坐标。
      </div>
    </div>

    <div data-element="1" data-type="image"
      data-asset-key="page_3_img"
      data-image-prompt="Clean product analytics dashboard on a laptop in a modern office, soft daylight from the left, cool gray desk matching #111827 mood with cyan #38BDF8 accent glow on UI chrome, subject framed on the right third leaving calm negative space, shallow depth of field, photoreal editorial, no readable text on screen, no logos, no watermark"
      data-border-radius="16"
      style="width:400px;height:420px;flex-shrink:0;border-radius:16px;background:#374151;"></div>
  </div>
</section>
```

## 4. Cover with full-bleed bg image

```html
<section id="slide"
  data-page-id="page_1"
  data-bg="#0F172A"
  data-bg-image-key="page_1_bg"
  data-bg-image-prompt="Cinematic 16:9 cover for a senior frontend year-end review, deep navy #0F172A and #1A3A5C atmosphere with soft cyan #4A90D9 accents, darker lower third and center band for white title overlay, subtle night-city and code-bokeh, professional corporate mood, no readable text, no logos, no pure white wash"
  style="width:1000px;height:562.5px;position:relative;overflow:hidden;background:#0F172A;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:48px;box-sizing:border-box;">
  <div data-element="1" data-type="text"
    data-font-size="44" data-bold data-color="#FFFFFF" data-placement="center-center"
    style="font-size:44px;font-weight:700;color:#FFFFFF;text-align:center;max-width:820px;">高级前端工程师年终述职</div>
  <div data-element="1" data-type="text"
    data-font-size="20" data-color="#93C5FD" data-placement="center-center"
    style="font-size:20px;color:#93C5FD;margin-top:16px;text-align:center;">2024年度工作总结与展望</div>
</section>
```

## Anti-patterns

```html
<!-- BAD: card look only on unmarked parent — background lost after compile -->
<div style="background:#fff;border-radius:16px;padding:24px;">
  <div data-element="1" data-type="text" data-font-size="20" data-color="#111">标题</div>
</div>

<!-- GOOD: marked shape behind content -->
<div style="position:relative;padding:24px;">
  <div data-element="1" data-type="shape" data-shape-type="roundedRect" data-fill="#FFFFFF"
    data-border-radius="16" data-z-index="10"
    style="position:absolute;inset:0;background:#fff;border-radius:16px;z-index:10;"></div>
  <div data-element="1" data-type="text" data-font-size="20" data-color="#111"
    style="position:relative;">标题</div>
</div>
```
