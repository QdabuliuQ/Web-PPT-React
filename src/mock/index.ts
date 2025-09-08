import { getRandomId } from "@/utils";

export default {
  pages: [
    {
      id: getRandomId(),
      elements: [
        {
          type: "text",
          id: "text_" + getRandomId(),
          text: "Hello, world!",
          fontSize: 16,
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          lineHeight: 1,
          overline: true,
          shadow: true,
          shadowOffsetX: -2,
          shadowOffsetY: 3,
          shadowColor: "#000000",
          borderColor: "#000000",
          borderWidth: 1,
          borderStyle: "solid",
          backgroundColor: "transparent",
          placement: "center-center",
          color: "#000000",
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          rotate: 0,
          zIndex: 0,
        },
      ],
    },
  ],
};
