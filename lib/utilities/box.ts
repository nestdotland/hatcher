import { Table, colors } from "../../deps.ts";

const characters = {
  top: "─",
  topMid: "┬",
  topLeft: "╭",
  topRight: "╮",
  bottom: "─",
  bottomMid: "┴",
  bottomLeft: "╰",
  bottomRight: "╯",
  left: "│",
  leftMid: "├",
  mid: "─",
  midMid: "┼",
  right: "│",
  rightMid: "┤",
  middle: "│",
};

for (const char in characters) {
  characters[char as keyof typeof characters] = colors.yellow(
    characters[char as keyof typeof characters],
  );
}

export function box(text: string) {
  new Table()
    .header([])
    .body([[`\n${text}\n `]])
    .indent(3)
    .padding(4)
    .border(true)
    .chars(characters)
    .render();
}
