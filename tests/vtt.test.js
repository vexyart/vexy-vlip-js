// this_file: tests/vtt.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseTime,
  parseCueSettings,
  parseVtt,
  renderMarkdown,
  escapeHtml,
  tryParseJson,
  cueToCard,
  parseCards,
} from "../src/vtt.js";

test("parseTime handles mm:ss.mmm and hh:mm:ss.mmm", () => {
  assert.equal(parseTime("00:02.500"), 2.5);
  assert.equal(parseTime("01:00.000"), 60);
  assert.equal(parseTime("01:02:03.250"), 3723.25);
  assert.equal(parseTime("00:00.000"), 0);
  assert.ok(Number.isNaN(parseTime("nonsense")));
  assert.ok(Number.isNaN(parseTime(undefined)));
});

test("parseTime accepts comma decimal separator", () => {
  assert.equal(parseTime("00:02,250"), 2.25);
});

test("parseCueSettings extracts placement keys", () => {
  const s = parseCueSettings("position:20% line:80% size:40% align:start");
  assert.deepEqual(s, { position: "20%", line: "80%", size: "40%", align: "start" });
  assert.deepEqual(parseCueSettings(""), {});
  assert.deepEqual(parseCueSettings("  "), {});
});

test("parseVtt parses plain-text cues with settings", () => {
  const vtt = `WEBVTT

00:00.000 --> 00:03.000 position:20% line:80% size:40% align:start
Click the Export button.

00:05.000 --> 00:08.000
Second card.`;
  const cues = parseVtt(vtt);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].start, 0);
  assert.equal(cues[0].end, 3);
  assert.equal(cues[0].settings.position, "20%");
  assert.equal(cues[0].payload, "Click the Export button.");
  assert.equal(cues[1].start, 5);
  assert.equal(cues[1].payload, "Second card.");
});

test("parseVtt skips NOTE blocks and cue ids", () => {
  const vtt = `WEBVTT

NOTE this is a comment
that spans lines

intro
00:01.000 --> 00:02.000
Hello`;
  const cues = parseVtt(vtt);
  assert.equal(cues.length, 1);
  assert.equal(cues[0].id, "intro");
  assert.equal(cues[0].payload, "Hello");
});

test("parseVtt handles JSON payloads spanning multiple lines", () => {
  const vtt = `WEBVTT

00:05.000 --> 00:08.000
{
  "text": "Drag the slider.",
  "x": 8, "y": 62, "w": 36
}`;
  const cues = parseVtt(vtt);
  assert.equal(cues.length, 1);
  const json = tryParseJson(cues[0].payload);
  assert.equal(json.text, "Drag the slider.");
  assert.equal(json.x, 8);
});

test("escapeHtml + renderMarkdown are XSS-safe and support the subset", () => {
  assert.equal(escapeHtml("<script>"), "&lt;script&gt;");
  const html = renderMarkdown("Click **Export** then `Save`\n<b>nope</b>");
  assert.ok(html.includes("<strong>Export</strong>"));
  assert.ok(html.includes("<code>Save</code>"));
  assert.ok(html.includes("<br>"));
  assert.ok(html.includes("&lt;b&gt;"), "raw HTML must be escaped");
  assert.ok(!html.includes("<b>nope</b>"));
});

test("renderMarkdown italics", () => {
  assert.ok(renderMarkdown("an *italic* word").includes("<em>italic</em>"));
});

test("tryParseJson returns null for plain text and bad JSON", () => {
  assert.equal(tryParseJson("just text"), null);
  assert.equal(tryParseJson("{ not json"), null);
  assert.deepEqual(tryParseJson('{"a":1}'), { a: 1 });
});

test("cueToCard resolves JSON placement and style", () => {
  const cue = parseVtt(`WEBVTT

00:05.000 --> 00:08.000
{"text":"Hi","x":8,"y":62,"w":36,"anchor":"top-left","bg":"#10243a","fg":"#fff","radius":14}`)[0];
  const card = cueToCard(cue);
  assert.equal(card.text, "Hi");
  assert.equal(card.placement.x, 8);
  assert.equal(card.placement.y, 62);
  assert.equal(card.placement.w, 36);
  assert.equal(card.placement.anchor, "top-left");
  assert.equal(card.style.bg, "#10243a");
  assert.equal(card.style.radius, 14);
});

test("cueToCard falls back to cue settings then defaults", () => {
  const cue = parseVtt(`WEBVTT

00:00.000 --> 00:03.000 position:20% line:80% size:40% align:end
Plain card`)[0];
  const card = cueToCard(cue);
  assert.equal(card.placement.x, 20);
  assert.equal(card.placement.y, 80);
  assert.equal(card.placement.w, 40);
  assert.equal(card.placement.align, "end");
  assert.ok(card.html.includes("Plain card"));

  const bare = cueToCard(parseVtt(`WEBVTT

00:00.000 --> 00:03.000
x`)[0]);
  assert.equal(bare.placement.x, 50, "default centered");
  assert.equal(bare.placement.y, 88, "default near bottom");
  assert.equal(bare.placement.anchor, "bottom");
});

test("parseCards maps a whole document to card models in order", () => {
  const cards = parseCards(`WEBVTT

00:01.000 --> 00:02.000
A

00:03.000 --> 00:04.000
B`);
  assert.equal(cards.length, 2);
  assert.equal(cards[0].index, 0);
  assert.equal(cards[1].index, 1);
  assert.equal(cards[0].start, 1);
  assert.equal(cards[1].start, 3);
});
