import { getRandomId } from "@/utils";

export default {
    pages: [
        {
            id: getRandomId(),
            elements: [
                {
                    type: "text",
                    id: 'text_' + getRandomId(),
                    text: "Hello, world!",
                    fontSize: 16,
                    fontWeight: 400,
                    fontFamily: "Arial",
                    color: "#000000",
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100,
                    rotate: 0,
                    zIndex: 0,
                }
            ]
        }
    ],
}