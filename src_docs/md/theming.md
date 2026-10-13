# Theming

Every visual setting of the player is a CSS custom property declared on the
player root, the element with the class `vexy-vlip`. Per-card JSON fields such
as `bg`, `fg` and `shadow` override these values with inline styles on single
cards.

## Three ways to set a property

1. **Theme options or attributes.** Options such as `cardBg` or attributes
   such as `card-bg` write the matching property as an inline style on the
   player root. This works the same for the class and for `<vexy-vlip>`. See
   [Theme shortcuts](options.md#theme-shortcuts).

    ```html
    <vexy-vlip src="demo.mp4" track="demo.vtt" mode="stepped"
               card-bg="#10243a" card-fg="#eaf2ff" dim="0.5"></vexy-vlip>
    ```

2. **Your own stylesheet (class build).** The class injects its stylesheet
   into `<head>` at runtime, after your own styles, and declares the defaults
   on `.vexy-vlip`. Use a more specific selector so your values win:

    ```css
    #stage.vexy-vlip {
      --vv-card-bg: #10243a;
      --vv-card-fg: #eaf2ff;
      --vv-card-radius: 8px;
    }
    ```

3. **Inline style on the container (class build).**

    ```js
    stage.style.setProperty("--vv-accent", "#e4572e");
    new VexyVlip(stage, { src: "demo.mp4", track: "demo.vtt" });
    ```

!!! note "Web Component"
    `<vexy-vlip>` keeps its stylesheet in a shadow root, and that stylesheet
    declares the defaults on the inner `.vexy-vlip` element. Custom properties
    set on the `<vexy-vlip>` host are therefore replaced by those defaults. Use
    the theme attributes to style the element.

## Card properties

| Property | Default | Controls |
| --- | --- | --- |
| `--vv-card-bg` | `#ffffff` | Card background |
| `--vv-card-bg-stepped` | `var(--vv-card-bg)` | Card background in stepped mode |
| `--vv-card-fg` | `#1d2430` | Card text colour |
| `--vv-card-font` | `inherit` | Card font |
| `--vv-card-padding` | `20px 24px` | Card padding |
| `--vv-card-radius` | `16px` | Card corner radius |
| `--vv-card-border` | `0` | Card border |
| `--vv-card-shadow` | `0 12px 38px rgba(0, 0, 0, 0.34)` | Card shadow |
| `--vv-card-max-width` | `72%` | Largest card width; the `maxWidth` option also sets it |
| `--vv-accent` | `#2f6fed` | Link colour and default active-dot colour |

## Buttons

| Property | Default | Controls |
| --- | --- | --- |
| `--vv-next-bg` | `#ffffff` | In-card Next button background (outlined pill by default) |
| `--vv-next-fg` | `#1d2430` | Next button text colour |
| `--vv-next-border` | `rgba(0, 0, 0, 0.82)` | Next button border |
| `--vv-start-bg` | `#1d2430` | Start button background when a title is set |
| `--vv-start-fg` | `#ffffff` | Start button text colour when a title is set |
| `--vv-close-fg` | `var(--vv-card-fg)` | Close (×) button colour |

## Overlay, dots and controls

| Property | Default | Controls |
| --- | --- | --- |
| `--vv-overlay-bg` | `rgba(0, 0, 0, 0.7)` | Dim layer behind a resting card or the Start/Replay screen |
| `--vv-dot` | `rgba(255, 255, 255, 0.45)` | Step-dot colour |
| `--vv-dot-active` | `var(--vv-accent)` | Active step-dot colour |
| `--vv-controls-bg` | `rgba(0, 0, 0, 0.55)` | Control bar background |

## Title bar

These properties have no declaration on the root; the stylesheet uses the
listed fallback until you set them.

| Property | Fallback | Controls |
| --- | --- | --- |
| `--vv-title-fg` | `rgba(255, 255, 255, 0.92)` | Top-left title colour |
| `--vv-title-bg` | `rgba(0, 0, 0, 0.45)` | Top-left title background |
| `--vv-title-size` | `13px` | Top-left title font size |
| `--vv-title-padding` | `4px 10px` | Top-left title padding |
| `--vv-title-radius` | `7px` | Top-left title corner radius |
| `--vv-title-margin` | `10px 12px` | Offset from the corner |

## Class names for your own CSS

The player root also carries `data-mode="continuous"` or
`data-mode="stepped"`. Cards are `.vexy-vlip__card` elements inside
`.vexy-vlip__cards`; a visible card also has `.vexy-vlip__card--in`. A JSON
card's `class` field adds your own class names to its card element.

```css
/* Class build: style a card tagged { "class": "tip" } in the VTT file. */
.vexy-vlip .vexy-vlip__card.tip { --vv-card-radius: 4px; }
```

## Reduced motion

When the system requests reduced motion (`prefers-reduced-motion: reduce`),
the stylesheet removes the card slide transforms and the button and dot
transitions.
