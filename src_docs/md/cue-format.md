# Authoring cards

The WebVTT file is both the script and the layout. Each cue's timing decides
when its card appears, and its payload and cue settings decide what the card
says and where it sits. A cue payload is either **plain text** or a **JSON
object**.

## How the parser reads a file

The player fetches the track and parses it with `parseVtt()` in `src/vtt.js`,
not with the browser's `<track>` renderer.

- The file is split into blocks on blank lines. Windows line endings and a
  leading byte-order mark are normalised.
- The `WEBVTT` header block is skipped. `NOTE`, `STYLE` and `REGION` blocks are
  skipped entirely.
- An optional cue identifier line (such as `step-1`) may precede the timing
  line. It becomes the card's `id`.
- Timestamps are `MM:SS.mmm` or `HH:MM:SS.mmm`. A comma is also accepted as the
  decimal separator. A cue with a malformed timestamp is dropped.
- Every line after the timing line is the payload. A WebVTT cue cannot contain
  a blank line, so a payload is one run of non-empty lines.

## Plain-text cards

```webvtt
00:02.000 --> 00:05.000 position:70%,line-right line:24%,start size:38%
Click the **Export** button in the toolbar.
```

### Placement with cue settings

All values are percentages of the video box.

| Setting | Effect |
| --- | --- |
| `position:N%[,line-left\|center\|line-right]` | Horizontal pin. The optional position-align picks which edge or the centre of the card sits at that point. |
| `line:N%[,start\|center\|end]` | Vertical pin. The optional line-align picks the edge: `start` is the top, `end` is the bottom. |
| `size:N%` | Card width as a percentage of the video width. |
| `align:start\|center\|end` | Text alignment. It is also the default position-align when that is omitted. `left` and `right` are read as `start` and `end`. |

The position-align and line-align values combine into one of nine anchor
points. For example, `line-right` with `end` gives `bottom-right`, and `center`
with `start` gives `top`. When a cue has a `position` but no `line`, the card
sits at the bottom. When a cue has no placement settings at all, the card is
centred horizontally (`x` = 50 %) with its bottom edge at 88 % of the height.

The parser also reads `vertical` and `region`, but cards are always laid out
horizontally.

Worked example: `position:70%,line-right line:24%,start size:38%` pins the
card's top-right corner (`line-right` + `start` = `top-right`) at 70 % across
and 24 % down, and makes the card 38 % of the video width.

### Markdown in card text

Card text is HTML-escaped first, so raw HTML never survives. Then a markdown
subset is rendered:

- inline: `**bold**`, `*italic*`, `` `code` ``, `~~strike~~`, `[label](url)`;
- block: `#` to `######` headings, `-`/`*`/`+` bulleted lists, `1.` numbered
  lists, and `---` horizontal rules;
- consecutive plain lines join into one paragraph with line breaks.

Links whose target starts with `javascript:`, `data:` or `vbscript:` are
replaced with `#`. A single plain line is rendered without a `<p>` wrapper.

## JSON cards

A cue whose trimmed payload starts with `{` is parsed as JSON. Use it for
per-card styling or trusted HTML. If the JSON does not parse, the payload is
shown as plain text, so a typo never produces a blank card.

```webvtt
00:05.000 --> 00:08.000
{ "text": "Drag the slider to fan the cards out.",
  "x": 8, "y": 62, "w": 36, "anchor": "top-left",
  "bg": "#10243a", "fg": "#eaf2ff", "radius": 14, "padding": "14px 18px",
  "shadow": "0 8px 30px rgba(0,0,0,.45)", "class": "tip" }
```

### JSON fields

Every field is optional, but give one of `text` or `html`.

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | string | — | Plain text with the markdown subset. |
| `html` | string | — | Trusted HTML. Filtered only when the `sanitize` option is on. |
| `x` | number or string | derived | Horizontal anchor. A number is a percentage of the width; a string is a CSS length. |
| `y` | number or string | derived | Vertical anchor. A number is a percentage of the height. |
| `w` | number or string | `auto` | Card width. |
| `anchor` | enum | `bottom` | Which point of the card sits at (`x`, `y`): `top-left`, `top`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom`, `bottom-right`. |
| `align` | enum | `start` | Text alignment inside the card. |
| `bg` | string | theme | Card background: any CSS colour or gradient. |
| `fg` | string | theme | Text colour. |
| `font` | string | theme | CSS `font` shorthand or family. |
| `padding` | string | theme | CSS padding. |
| `radius` | number or string | theme | Border radius. |
| `border` | string | theme | CSS border. |
| `shadow` | string | theme | CSS box-shadow. |
| `opacity` | number | `1` | Applied to a solid `bg` colour only. |
| `class` | string | — | Extra class names for your own CSS. |
| `enter` / `exit` | enum | `fade` | Per-card transition: `fade`, `slide-up`, `slide-down`, `none`. |

Placement priority is: JSON `x`/`y`/`w`/`anchor`, then the cue's own
`position`/`line`/`size`, then the default (bottom-centre at `y` = 88 %). An
unknown `anchor` value falls back to `bottom`.

## Security

!!! warning "Treat the WebVTT file as trusted content"
    Plain-text cards and JSON `text` cards are always HTML-escaped. A JSON
    `html` card is inserted as-is. With `sanitize: true` the player removes
    `<script>`, `<style>`, `<iframe>`, `<object>` and `<embed>` elements,
    `on*` attributes, and `href`/`src` values starting with `javascript:`.
    This is a convenience filter, not a hardened sanitiser: it does not cover
    `data:` URLs, `srcdoc`, SVG `<use>`, `formaction` or CSS `url()`. For
    untrusted input, sanitise upstream with a vetted library such as
    DOMPurify.

## Checking a track without a browser

The parser is pure JavaScript, so you can inspect a track under Node.js:

```js
import { readFileSync } from "node:fs";
import { parseCards } from "vexy-vlip-js";

const cards = parseCards(readFileSync("demo.vtt", "utf8"));
for (const c of cards) console.log(c.start, c.end, c.placement.anchor, c.text);
```

`parseCards()` returns one card model per cue. See
[API reference](api.md#pure-helpers) for the model's fields.
